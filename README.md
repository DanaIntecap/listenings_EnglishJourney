English Journey Listening Practice
Upload this folder's contents to the root of your GitHub repository and enable GitHub Pages if you want to publish it.

Adding media
Put audio files in assets/audio/ and set audioFile in listening.json to the filename only. The app resolves it as assets/audio/<AudioFile>.
Put lesson images in assets/images/ and set pictureName to the filename only. The app resolves it as assets/images/<PictureName>.
Fully qualified external sources can remain in audioUrl. Direct audio-file URLs play in the native player; lesson-page URLs are also offered as external links.
Keep favicon.svg in the repository root because the HTML links to favicon.svg.
The .gitkeep files keep the empty media folders present in Git until you add your own files.
