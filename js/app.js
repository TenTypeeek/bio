(() => {
  "use strict";
  const C = window.CONFIG || {}, A = C.animations || {}, M = C.music || {}, B = C.background || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EP = C.emojiPath || "assets/emojis/";
  // :name: -> <img src="assets/emojis/name.png">
  const emojify = s => esc(s).replace(/:([a-z0-9_-]+):/gi, (m, n) =>
    `<img class="emoji" src="${EP}${n}.png" alt="${m}" onerror="this.replaceWith(this.alt)">`);
  const fmt = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  Object.keys(A).forEach(k => document.body.classList.toggle("no-" + k, !A[k]));
  document.title = C.title || C.name || document.title;
  $("#sk-icons").innerHTML = "<i></i>".repeat((C.links || []).length); // skeleton matches your link count

  let vol = 0.7, curAudio = null, muted = false, bgVideo = null;

  /* ---------- loading helpers ---------- */
  const imgReady = src => new Promise(r => { if (!src) return r(); const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });
  const sheetReady = id => new Promise(r => { const l = $(id); if (!l || l.sheet) return r(); l.addEventListener("load", () => r()); l.addEventListener("error", () => r()); });
  const fontReady = f => (document.fonts ? document.fonts.load(f).catch(() => {}) : Promise.resolve());

  /* ---------- lyrics (.txt or .lrc, lines like "[00:06.75] text") ---------- */
  function parseLRC(txt) {
    const out = [];
    String(txt).replace(/^\uFEFF/, "").split(/\r?\n/).forEach(raw => {
      const line = raw.trim().replace(/^["\u201C\u201D']+|["\u201C\u201D']+$/g, "");
      const re = /\[(\d+):(\d+(?:[.:]\d+)?)\]/g, times = [];
      let m, end = 0;
      while ((m = re.exec(line))) { times.push(+m[1] * 60 + parseFloat(m[2].replace(":", "."))); end = re.lastIndex; }
      const text = line.slice(end).trim();
      if (times.length && text) times.forEach(tm => out.push([Math.round(tm * 100) / 100, text]));
    });
    return out;
  }
  async function loadLyrics() {
    let L = M.lyrics || [];
    if (M.lyricsText && M.lyricsText.trim()) { const p = parseLRC(M.lyricsText); if (p.length) L = p; }
    else if (M.lyricsFile) {
      const base = M.lyricsFile.replace(/\.(txt|lrc)$/i, "");
      for (const url of [M.lyricsFile, base + ".txt", base + ".lrc"].filter((v, i, a) => a.indexOf(v) === i)) {
        try { const r = await fetch(url); if (r.ok) { const p = parseLRC(await r.text()); if (p.length) { L = p; break; } } } catch (e) {}
      }
      if (!L.length) console.warn("Lyrics: no timed lines found in " + M.lyricsFile + " (format: [mm:ss.xx] text)");
    }
    const off = +M.lyricsOffset || 0;
    return L.map(l => [l[0] + off, l[1]]).sort((a, b) => a[0] - b[0]);
  }

  /* ---------- render profile ---------- */
  function render() {
    const langs = C.languages || [];
    $("#app").innerHTML = `
    <section class="card tilt">
      <div class="top">
        <div>
          <h1 class="name">${emojify(C.name)}</h1>
          ${C.location || langs.length ? `<div class="loc">
            ${C.location ? `<span><i class="fa-solid fa-location-dot"></i>${emojify(C.location)}</span>` : ""}
            ${langs.length ? `<span><i class="fa-solid fa-language"></i>${langs.map(l =>
              `<span class="lang"><img class="emoji" src="${EP}${esc(l.code)}.png" alt="" onerror="this.style.display='none'">${esc(l.name)}</span>`).join("")}</span>` : ""}
          </div>` : ""}
          <p class="bio">${emojify(C.bio)}</p>
        </div>
        <div class="avw"><div class="av">${esc((C.name || "?")[0])}${C.avatar || C.avatarFallback ?
          `<img src="${esc(C.avatar || C.avatarFallback)}" data-f="${esc(C.avatarFallback || "")}" alt="" width="104" height="104" decoding="async" referrerpolicy="no-referrer"
            onerror="if(this.dataset.f){this.src=this.dataset.f;this.dataset.f=''}else this.remove()">` : ""}</div></div>
      </div>
      <div class="links">${(C.links || []).map((l, i) =>
        `<a href="${esc(l.url)}" target="_blank" rel="noopener" style="--i:${i}" aria-label="${esc(l.title)}"><i class="${esc(l.icon)}"></i><span class="tip">${esc(l.title)}</span></a>`).join("")}</div>
      <div class="foot">
        <span>${C.showViews ? `<i class="fa-solid fa-eye"></i> ${esc(C.views)}` : ""}</span>
        <div class="badges">${(C.badges || []).map(b =>
          `<div class="badge"><i class="${esc(b.icon)}"></i><div class="tip"><b>${emojify(b.title)}</b><span>${emojify(b.desc)}</span></div></div>`).join("")}</div>
      </div>
    </section>
    ${M.title ? `
    <section class="player tilt" id="player">
      <div class="pbg" style="${M.cover ? `background-image:url('${esc(M.cover)}')` : ""}"></div>
      <div class="ptop">
        <div class="cover" style="${M.cover ? `background-image:url('${esc(M.cover)}')` : ""}">${M.cover ? "" : '<i class="fa-solid fa-music"></i>'}</div>
        <div class="meta"><b>${emojify(M.title)}<span class="eq"><i></i><i></i><i></i><i></i></span></b><small>${emojify(M.artist)}</small>
          <div class="prog"><span id="tc">0:00</span><div class="bar" id="bar"><i id="fill"></i></div><span id="td">${fmt(M.duration || 0)}</span></div></div>
        <div class="ctl"><button id="prev" aria-label="Restart"><i class="fa-solid fa-backward-step"></i></button>
          <button class="pp" id="pp" aria-label="Play"><i class="fa-solid fa-play"></i></button>
          <button id="next" aria-label="Skip 10s"><i class="fa-solid fa-forward-step"></i></button></div>
      </div>
      <div class="lyr"><div class="p" id="l0"></div><div id="l1"></div><div class="n" id="l2"></div></div>
    </section>` : ""}`;
  }

  /* ---------- player ---------- */
  function initPlayer(L) {
    if (!M.title) return () => {};
    const loop = M.loop !== false;
    let t = 0, playing = false, audio = null, last = -2;
    if (M.src) {
      audio = new Audio(); audio.loop = loop; audio.volume = vol; audio.preload = "auto"; audio.src = M.src;
      audio.addEventListener("error", () => { audio = null; curAudio = null; });
      audio.addEventListener("loadedmetadata", () => { if (audio) $("#td").textContent = fmt(audio.duration); });
      audio.addEventListener("ended", () => ui(false));
      curAudio = audio; applyVol();
    }
    const dur = () => audio && isFinite(audio.duration) ? audio.duration : (M.duration || 60);
    const ui = on => {
      playing = on;
      $("#player").classList.toggle("playing", on);
      $("#pp i").className = "fa-solid " + (on ? "fa-pause" : "fa-play");
    };
    const setPlay = on => {
      if (audio) { if (on) audio.play().then(() => ui(true)).catch(() => ui(false)); else { audio.pause(); ui(false); } }
      else ui(on);
    };
    const seek = x => { const d = dur(); t = loop ? ((x % d) + d) % d : Math.max(0, Math.min(d, x)); if (audio) audio.currentTime = t; tick(true); };
    const setLine = (id, txt, anim) => {
      const el = $(id); if (el.textContent === txt && !anim) return; el.textContent = txt;
      if (anim) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
    };
    function tick(force) {
      if (audio) t = audio.currentTime; else if (playing) { t += 0.1; if (t >= dur()) { if (loop) t = 0; else { t = 0; ui(false); } } }
      $("#fill").style.width = (t / dur() * 100) + "%"; $("#tc").textContent = fmt(t);
      let i = -1; L.forEach((l, k) => { if (t >= l[0]) i = k; });
      if (i !== last || force) {
        setLine("#l0", L[i - 1] ? L[i - 1][1] : ""); setLine("#l2", L[i + 1] ? L[i + 1][1] : "");
        setLine("#l1", L[i] ? L[i][1] : (L.length ? "" : "\u266A"), true); last = i;
      }
    }
    setInterval(tick, 100); tick(true);
    $("#pp").onclick = () => setPlay(!playing);
    $("#prev").onclick = () => seek(0);
    $("#next").onclick = () => seek(t + 10);
    $("#bar").onclick = e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * dur()); };
    // pause when the tab is hidden, resume when it comes back (also pauses the background video)
    let resume = false;
    document.addEventListener("visibilitychange", () => {
      if (bgVideo) document.hidden ? bgVideo.pause() : bgVideo.play().catch(() => {});
      if (M.pauseOnHidden === false) return;
      if (document.hidden) { resume = playing; if (playing) setPlay(false); }
      else if (resume) { resume = false; setPlay(true); }
    });
    if (M.autoplay !== false) {
      setPlay(true); // allowed if the browser permits it, otherwise starts on the first click/tap
      const go = e => { if (!playing && !e.target.closest(".ctl,.vol")) setPlay(true); };
      addEventListener("pointerdown", go, { once: true }); addEventListener("keydown", go, { once: true });
    }
    return l => { L = l; last = -2; tick(true); }; // lets late-loading lyrics in
  }

  /* ---------- volume ---------- */
  try { const v = parseFloat(localStorage.getItem("bio-vol")); if (!isNaN(v)) vol = Math.min(1, Math.max(0, v)); } catch (e) {}
  const volEl = $("#vol");
  function applyVol() {
    if (curAudio) { curAudio.volume = vol; curAudio.muted = muted; }
    const v = muted ? 0 : vol;
    $("#vi").innerHTML = `<i class="fa-solid ${v === 0 ? "fa-volume-xmark" : v < .5 ? "fa-volume-low" : "fa-volume-high"}"></i>`;
    $("#vr").value = v; $("#vr").style.setProperty("--v", (v * 100) + "%"); $("#vp").textContent = Math.round(v * 100);
    try { localStorage.setItem("bio-vol", vol); } catch (e) {}
  }
  $("#vr").addEventListener("input", e => { vol = +e.target.value; muted = false; applyVol(); });
  $("#vi").addEventListener("click", e => {
    e.stopPropagation();
    if (matchMedia("(hover:none)").matches && !volEl.classList.contains("open")) { volEl.classList.add("open"); return; } // touch: first tap opens
    muted = !muted; applyVol();
  });
  volEl.addEventListener("wheel", e => { e.preventDefault(); vol = Math.min(1, Math.max(0, vol + (e.deltaY < 0 ? .05 : -.05))); muted = false; applyVol(); }, { passive: false });
  addEventListener("pointerdown", e => { if (!volEl.contains(e.target)) volEl.classList.remove("open"); });
  addEventListener("keydown", e => { if (e.key.toLowerCase() === "m" && !/input|textarea/i.test(e.target.tagName)) { muted = !muted; applyVol(); } });
  applyVol();

  /* ---------- tilt ---------- */
  function initTilt() {
    if (A.tilt === false) return;
    document.querySelectorAll(".tilt").forEach(el => {
      el.addEventListener("pointermove", e => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
  }

  /* ---------- background: poster first, then video / image / animated canvas ---------- */
  const cv = $("#bg"), cx = cv.getContext("2d"), fx = $("#fx"), fc = fx.getContext("2d");
  let W, H, stars = [], P = [], customBg = false;
  function size() {
    W = cv.width = fx.width = innerWidth; H = cv.height = fx.height = innerHeight;
    stars = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: Math.random() * H * .75, s: 3 + Math.floor(Math.random() * 4), p: Math.random() * 6, v: .5 + Math.random() * 1.5 }));
  }
  addEventListener("resize", size); size();

  const bgEl = $("#bgimg");
  const bgShow = () => { customBg = true; bgEl.style.opacity = 1; if (!B.canvasOverlay) cv.style.display = "none"; };
  function bgPoster() { // tiny image, loaded right away
    if (!B.src) return;
    bgEl.style.setProperty("--dim", B.dim ?? .3);
    if (B.poster) { const im = new Image(); im.onload = () => { bgEl.style.backgroundImage = `url("${B.poster}")`; bgEl.style.backgroundSize = B.fit || "cover"; bgShow(); }; im.src = B.poster; }
  }
  function bgMedia() { // heavy file, started after the page is revealed
    if (!B.src) return;
    if (/\.(mp4|webm|ogv)(\?.*)?$/i.test(B.src)) {
      const v = document.createElement("video");
      Object.assign(v, { src: B.src, autoplay: true, muted: true, loop: true, playsInline: true, preload: "auto" });
      v.setAttribute("disablepictureinpicture", ""); v.style.objectFit = B.fit === "contain" ? "contain" : "cover";
      v.style.opacity = 0; v.style.transition = "opacity .8s";
      v.addEventListener("loadeddata", () => { bgEl.prepend(v); bgVideo = v; requestAnimationFrame(() => v.style.opacity = 1); bgShow(); v.play().catch(() => {}); }, { once: true });
    } else {
      const im = new Image();
      im.onload = () => { bgEl.style.backgroundImage = `url("${B.src}")`; bgEl.style.backgroundSize = B.fit || "cover"; bgShow(); };
      im.src = B.src; // if it fails to load, the animated canvas stays
    }
  }
  const hash = n => { const s = Math.sin(n * 127.1) * 43758.5; return s - Math.floor(s); };
  function ridge(base, amp, off, sp, tm) {
    const pts = [];
    for (let x = 0; x <= W + 8; x += 8) {
      const u = x * sp + tm * .02 + off;
      pts.push([x, base - amp * (Math.abs(Math.sin(u * .9)) * .6 + Math.sin(u * 2.3 + off) * .25 + (hash(Math.floor(u * 6) + off) - .5) * .35)]);
    }
    return pts;
  }
  addEventListener("pointermove", e => {
    if (A.sparkles === false) return;
    for (let i = 0; i < 2; i++) P.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.8, vy: (Math.random() - .5) * 1.8 - .4, l: 1, s: 2 + Math.random() * 3 });
    if (P.length > 160) P.splice(0, P.length - 160);
  });
  function frame(ms) {
    if (document.hidden) return requestAnimationFrame(frame);
    const tm = ms / 50;
    if (!customBg || B.canvasOverlay) {
      const full = !customBg;
      if (full) { cx.fillStyle = "#000"; cx.fillRect(0, 0, W, H); } else cx.clearRect(0, 0, W, H);
      cx.strokeStyle = "rgba(255,255,255,.06)"; cx.lineWidth = 6;
      for (let i = 0; i < 9; i++) { const x = (i * W / 7 + tm * .4) % (W + 300) - 150; cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x - H * .35, H * .9); cx.stroke(); }
      stars.forEach(s => { cx.fillStyle = `rgba(255,255,255,${.35 + .65 * Math.abs(Math.sin(ms / 1000 * s.v + s.p))})`; cx.fillRect(s.x, s.y, s.s, s.s); });
      if (full) [[.78, 70, 3, .012, .55], [.86, 90, 11, .01, .8], [.96, 110, 7, .008, 1]].forEach(([b, a, o, sp, al], k) => {
        const pts = ridge(H * b, a, o, sp, tm * (1 + k * .5));
        cx.beginPath(); cx.moveTo(0, H); pts.forEach(p => cx.lineTo(p[0], p[1])); cx.lineTo(W, H); cx.closePath(); cx.fillStyle = "#000"; cx.fill();
        cx.strokeStyle = `rgba(190,190,190,${al})`; cx.lineWidth = 3 + k;
        for (let j = 0; j < 3; j++) { cx.beginPath(); pts.forEach((p, i) => { const y = p[1] + j * 14 * (k + 1) * .6; i ? cx.lineTo(p[0], y) : cx.moveTo(p[0], y); }); cx.stroke(); }
      });
    }
    fc.clearRect(0, 0, W, H);
    P = P.filter(p => p.l > 0);
    P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .02; p.l -= .025; fc.fillStyle = `rgba(255,255,255,${p.l})`; fc.fillRect(p.x, p.y, p.s * p.l + 1, p.s * p.l + 1); });
    requestAnimationFrame(frame);
  }

  /* ---------- boot: skeleton -> wait for critical stuff -> reveal -> load heavy media ---------- */
  async function boot() {
    requestAnimationFrame(frame);
    bgPoster();
    const lyricsP = loadLyrics();                       // fetched in parallel with everything else
    const critical = Promise.all([sheetReady("#fa"), sheetReady("#gf")]).then(() => Promise.all([
      imgReady(C.avatar || C.avatarFallback), imgReady(M.cover),
      fontReady('900 16px "Font Awesome 6 Free"'), fontReady('400 16px "Font Awesome 6 Brands"'),
      fontReady("600 20px Lora"), fontReady("500 16px 'Space Grotesk'")
    ]));
    await Promise.race([critical, wait(3500)]);          // never wait more than 3.5s
    render(); initTilt();
    const setL = initPlayer(await Promise.race([lyricsP, wait(2000).then(() => [])]));
    lyricsP.then(l => { if (l.length) setL(l); });
    document.body.classList.add("ready");                // skeleton fades out, cards animate in
    setTimeout(() => $("#sk") && $("#sk").remove(), 700);
    bgMedia();
  }
  boot();
})();
