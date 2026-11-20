# TenTýpeeek bio page

Static bio-link page (HTML + CSS + JS). No build step, GitHub Pages ready.

## Structure
```
index.html
css/style.css
js/config.js      <- customize everything here
js/app.js
assets/
  images/   avatar.png, cover.png, background.(png|jpg|webp|gif|mp4|webm)
  audio/    song.mp3
  lyrics/   song.txt
  emojis/   us.png, sk.png, ... (any name.png)
```

## File names
| What | File | Setting in config.js |
|---|---|---|
| Avatar | `assets/images/avatar.png` | `avatar` |
| Background | `assets/images/background.gif` (or .png/.jpg/.webp/.mp4/.webm) | `background.src` |
| Song cover | `assets/images/cover.png` | `music.cover` |
| Song | `assets/audio/song.mp3` | `music.src` |
| Lyrics (.txt or .lrc) | `assets/lyrics/song.txt` | `music.lyricsFile` |
| Language flags | `assets/emojis/<code>.png` e.g. `us.png`, `sk.png`, `cz.png`, `de.png` | `languages[].code` |
| Any emoji | `assets/emojis/<name>.png` | write `:name:` in name/bio/location/badges |

Example: add `assets/emojis/fire.png`, then set `bio: "Just Do It :fire:"`.
Use lowercase names with letters, numbers, `-` or `_`. PNGs around 128x128 with transparency look best.
The included `us.png` and `sk.png` are simple placeholders: replace them with your own (for example Apple-style) emoji PNGs using the same file names.

## Run locally
Browsers block `fetch` and audio from `file://`, so use a tiny server:
`python -m http.server 8000` then open http://localhost:8000

## Deploy on GitHub Pages
`index.html` must be at the **root** of the repo (not inside a subfolder), with `css/`, `js/` and `assets/` next to it. File names are case sensitive on GitHub: `assets/images/avatar.png` is not `Avatar.PNG`.

**Option A - workflow (included, `.github/workflows/pages.yml`)**
1. Push everything to the `main` branch, including the hidden `.github` folder.
2. Repo -> Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.
3. Open the Actions tab, wait for "Deploy to GitHub Pages" to turn green. The link is `https://<user>.github.io/<repo>/`.

**Option B - no workflow**
1. Delete `.github/workflows/pages.yml`.
2. Settings -> Pages -> Source: **Deploy from a branch** -> `main` / `(root)`.

Use only one of the two options.

## Notes
- Music autoplay starts on the first click or tap (browser rule). The song loops (`music.loop`).
- Turn any animation off in `config.js` under `animations`.
- The view counter is a number you set yourself.

## Lyrics
Put them in `assets/lyrics/song.txt`, one line per row, in this format:
```
[00:06.75] first line
[00:09.83] second line
```
- If they do not show up, open the page via a web server (`python -m http.server`), not by double-clicking `index.html`. Or paste them into `music.lyricsText` in `config.js`, which needs no file loading.
- `music.lyricsOffset` shifts the timing, `music.pauseOnHidden` pauses the song when the tab is hidden.
- Volume: hover the speaker (tap on phones), drag, scroll the wheel on it, click to mute, or press M. It is remembered.

## Do not double-click index.html
Browsers refuse to load `assets/lyrics/song.txt` from a `file://` page. Run `start-server.bat` (Windows) or `start-server.command` (Mac/Linux) and the page opens at http://localhost:8000. GitHub Pages works as is.
If you still open it by double-click, click the lyric area and pick `song.txt` once.
