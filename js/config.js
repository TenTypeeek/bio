/* ============================================================
   CONFIG - edit this file to customize everything.
   Paths are relative to index.html.
   Emoji syntax: write :name: anywhere in text to show assets/emojis/name.png
   ============================================================ */
window.CONFIG = {
  title: "TenTýpeeek",              // browser tab title
  name: "TenTýpeeek",
  location: "Slovakia",              // set "" to hide
  bio: "Just Do It",                 // supports :emoji: tokens
  avatar: "assets/images/avatar.png",
  avatarFallback: "https://cdn.discordapp.com/avatars/1006910367978504192/2f0d426d47558b0324aa5f607a4a7980.png",

  // Language picker next to the location. "code" = file name in assets/emojis/ (code.png)
  languages: [
    { code: "us", name: "English" },
    { code: "sk", name: "Slovak" }
  ],

  showViews: false,
  views: 1,

  // Background: .png .jpg .webp .gif (animated gifs work) or .mp4 / .webm (video).
  // Leave src "" to use the built-in animated stars + mountains.
  background: {
    src: "assets/images/background.gif",
    fit: "cover",                    // cover | contain | 100% 100%
    dim: 0.15,                       // 0 - 1 darkness overlay on top of the image
    canvasOverlay: false             // true = draw the animated stars on top of your image too
  },

  // Turn any animation on/off
  animations: {
    entrance: true,                  // cards slide/fade in
    shimmerName: true,               // shine sweeping over the name
    avatarRing: true,                // rotating glow ring around the avatar
    floatingIcons: true,             // link icons gently float
    badgePop: true,                  // badges pop in
    equalizer: false,                 // music bars while playing
    coverPulse: false,                // cover beats while playing
    lyricSwap: true,                 // lyric lines slide in
    tilt: true,                      // 3D tilt following the mouse
    sparkles: false                   // cursor sparkle trail
  },

  emojiPath: "assets/emojis/",

  // Links: icon = any Font Awesome class (https://fontawesome.com/icons)
  links: [
    { icon: "fa-brands fa-youtube",   title: "YouTube",   url: "https://youtube.com/@tentypeeek" },
    { icon: "fa-brands fa-spotify",   title: "Spotify",   url: "https://open.spotify.com/user/31sx5qe7dqpsqttmku47rmrrttxm?si=a71fbd28144b4b8a" },
    { icon: "fa-brands fa-pinterest", title: "Pinterest", url: "https://pinterest.com/tentypeeek" },
    { icon: "fa-brands fa-instagram", title: "Instagram", url: "https://instagram.com/bohaty.marecek" },
    { icon: "fa-brands fa-github",    title: "GitHub",    url: "https://github.com/TenTypeeek" },
    { icon: "fa-brands fa-steam",     title: "Steam",     url: "https://steamcommunity.com/id/TenTypeeek/" },
    { icon: "fa-brands fa-discord",   title: "Discord",   url: "https://discord.com/users/1006910367978504192" }
  ],

  badges: [
    { icon: "fa-solid fa-leaf", title: "November", desc: "Claimed the November seasonal badge." }
  ],

  music: {
    title: "BISEXUÁLKA",
    artist: "Riad",
    cover: "assets/images/cover.png",
    src: "assets/audio/song.mp3",
    loop: true,                      // song restarts automatically
    autoplay: true,                  // starts on the first click/tap (browsers block sound before that)
    duration: 87,                    // seconds, only used if the audio file is missing
    pauseOnHidden: true,             // pause when the tab is not visible, resume when you come back
    lyricsFile: "assets/lyrics/song.txt",   // plain .txt (or .lrc) with lines like: [00:06.75] your lyric
    lyricsOffset: 0,                 // shift all lyrics in seconds (e.g. -0.5 = earlier, 1 = later)
    lyricsText: ``,                  // OR paste the lyrics right here (works without loading a file)
    lyrics: []                       // optional fallback: [[seconds, "line"], ...]
  }
};
