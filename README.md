# English Journey Listening Practice

Upload this folder's contents to the root of your GitHub repository and enable GitHub Pages if you want to publish it.

## Required brand assets

- `logo-intecap.png` — INTECAP logo shown at the top-left of the page.
- `logo-ingles-para-todos.png` — English Journey logo shown inside the banner.
- `favicon.svg` — site favicon.

These are referenced by filename in `index.html`; place them in the repository root alongside `index.html`.

## Data format

`listening.json` uses arrays for `level`, `subLevel`, and `unit` (e.g. `"level": ["A1"]`), matching the format used in the Master Catalog project. This keeps both catalogs consistent and supports lessons that could apply to more than one level, sub-level, or unit in the future.

## Adding media

Use `MediaType` and `MediaUrl` in the workbook. In `listening.json`, the corresponding fields are `mediaType` and `mediaUrl`:

| MediaType | MediaUrl |
| --- | --- |
| `audio` | Direct MP3/audio file URL |
| `video` | Direct MP4 URL, such as a readable Google Cloud Storage object |
| `youtube` | YouTube watch, share, embed, Shorts or live video link |

For MP4, use browser-compatible encoding (H.264 video and AAC audio), serve it as `video/mp4`, and ensure participants can access the file. For YouTube, the owner must allow embedding. Playback does not start automatically. Switching activities or filters stops the current media. A source link remains available if playback fails or embedding is restricted.

Existing `audioUrl` and `audioFile` entries remain supported when `mediaUrl` is absent. A lesson webpage URL (for example Chalkie) is an external source, not a direct media file; use the source link to open it. Workbook changes must be transferred to `listening.json` before publishing; the website does not read XLSX directly.

Run `node media.test.cjs` to verify URL handling and player switching.

- Put audio files in `assets/audio/` and set `audioFile` in `listening.json` to the filename only. The app resolves it as `assets/audio/<audioFile>`.
- Put PNG lesson images in `assets/images/<subLevel>/Unit<unit>/`. Use the title in lowercase without spaces or punctuation as the filename (for example, `marcospersonalprofile.png`). Set `pictureName` to the relative path, for example `A1.2/Unit1/marcospersonalprofile.png`. The app resolves it under `assets/images/`. The workbook uses the same relative path in `Picture name`.
- Fully qualified external sources can remain in `audioUrl`. Direct audio-file URLs play in the native player; lesson-page URLs are also offered as external links.

The `.gitkeep` files keep the empty media folders present in Git until you add your own files.
