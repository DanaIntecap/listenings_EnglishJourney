"use strict";

function resolveListeningMedia(lesson) {
  const source = lesson.mediaUrl || (lesson.audioFile ? `assets/audio/${encodeURIComponent(lesson.audioFile)}` : lesson.audioUrl) || "";
  const type = (lesson.mediaType || "audio").toLowerCase().trim();
  if (!source) return { error: "No media source is available yet." };
  let url;
  try { url = new URL(source, "https://listening.invalid/"); } catch { return { error: "The media link is invalid." }; }
  if (!['https:', 'http:'].includes(url.protocol)) return { error: "Use an HTTPS media link." };
  if (!['audio', 'video', 'youtube'].includes(type)) return { error: "The media type must be audio, video or youtube." };
  if (type !== 'youtube') return { type, source, link: source };
  let id;
  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)) {
    const parts = url.pathname.split('/');
    id = url.pathname === '/watch' ? url.searchParams.get('v') : ['embed','shorts','live'].includes(parts[1]) ? parts[2] : null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return { error: "Use a valid YouTube video link." };
  return { type, source: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1`, link: `https://www.youtube.com/watch?v=${id}` };
}

if (typeof module !== 'undefined') module.exports = { resolveListeningMedia };
