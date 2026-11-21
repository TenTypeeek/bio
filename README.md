# TenTýpeeek bio page

Static bio-link page (HTML + CSS + JS) made for **GitHub Pages**. No build step.

## Deploy
1. Push everything to the `main` branch of a repo. `index.html` must be at the repo root, and the hidden `.github` folder must be included.
2. Repo -> Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.
3. Open the Actions tab and wait for "Deploy to GitHub Pages" to turn green.
   Your site: `https://<user>.github.io/<repo>/`

File names on GitHub are case sensitive.

## Customize
Everything lives in `js/config.js`: name, bio, location, languages, links (Font Awesome icons), badges, background, song, lyrics, animations, view counter.

## Files
| What | File | Setting |
|---|---|---|
| Avatar | `assets/images/avatar.webp` | `avatar` |
| Cover | `assets/images/cover.webp` | `music.cover` |
| Background video | `assets/images/background.mp4` | `background.src` |
| Background poster (shown instantly) | `assets/images/background-poster.webp` | `background.poster` |
| Song | `assets/audio/song.mp3` | `music.src` |
| Lyrics | `assets/lyrics/song.txt` (lines like `[00:06.75] text`) | `music.lyricsFile` |
| Flags / emojis | `assets/emojis/us.png`, `sk.png`, any `name.png` (use `:name:` in text) | `languages[].code` |

If you rename an image, also update the matching `<link rel="preload">` lines in `index.html`.

## Speed tips (already applied)
- A skeleton screen shows instantly and fades out once the avatar, cover, fonts and icons are ready.
- The background is an MP4 (about 3 MB instead of a 10 MB GIF) with a tiny poster image shown first.
- The song, video and lyrics load after the page is revealed, in parallel with each other.
- Avatar and cover are small WebP files. Convert your own: `ffmpeg -i bg.gif -movflags +faststart -pix_fmt yuv420p -an background.mp4`.
- The video and animation pause when the tab is hidden.

## Controls
Hover the speaker (tap on phones) to change volume, scroll over it, click to mute, or press M. The song loops, pauses when the tab is hidden, and starts on the first click or tap.
