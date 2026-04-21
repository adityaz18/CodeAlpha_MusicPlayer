/* ══════════════════════════════════════════════════
   SYNTHWAVE Music Player — script.js
   Features: play/pause, next/prev, progress bar,
   volume, mute, playlist, autoplay, shuffle, repeat
   Uses royalty-free demo tracks from pixabay CDN
   ══════════════════════════════════════════════════ */

/* ── Playlist data ───────────────────────────────────────── */
const TRACKS = [
  {
    title:    "Neon Horizon",
    artist:   "Synthwave Collective",
    album:    "Retrograde · 2024",
    duration: "3:42",
    color:    "#00e5ff",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title:    "Midnight Drive",
    artist:   "Chromatic Echo",
    album:    "Night Circuit · 2024",
    duration: "4:18",
    color:    "#ff2d78",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title:    "Outrun Forever",
    artist:   "Laser Grid",
    album:    "Neon Genesis · 2023",
    duration: "3:55",
    color:    "#b24bff",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title:    "Digital Sunset",
    artist:   "Starfield FM",
    album:    "Static Dreams · 2023",
    duration: "5:01",
    color:    "#ff9f43",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    title:    "Vaporwave City",
    artist:   "Dream Circuit",
    album:    "Aesthetic Vol. 3 · 2024",
    duration: "3:28",
    color:    "#00ffc6",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    title:    "Chrome & Neon",
    artist:   "Retrograde Wave",
    album:    "Hyperflux · 2024",
    duration: "4:44",
    color:    "#00e5ff",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    title:    "Electric Rain",
    artist:   "Pale Signal",
    album:    "Cloudbase · 2023",
    duration: "3:12",
    color:    "#ff2d78",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    title:    "Stellar Drift",
    artist:   "Nova Station",
    album:    "Deep Space · 2024",
    duration: "4:56",
    color:    "#ffe64d",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
];

/* ── State ───────────────────────────────────────────────── */
let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let repeatMode   = 'none';   // 'none' | 'all' | 'one'
let isMuted      = false;
let volume       = 0.8;
let isDraggingProgress = false;
let isDraggingVolume   = false;
let shuffleQueue = [];

/* ── DOM refs ────────────────────────────────────────────── */
const audio         = document.getElementById('audio');
const disc          = document.getElementById('disc');
const visualizer    = document.getElementById('visualizer');
const songTitle     = document.getElementById('songTitle');
const songArtist    = document.getElementById('songArtist');
const songAlbum     = document.getElementById('songAlbum');
const timeCurrent   = document.getElementById('timeCurrent');
const timeDuration  = document.getElementById('timeDuration');
const progressFill  = document.getElementById('progressFill');
const progressTrack = document.getElementById('progressTrack');
const volFill       = document.getElementById('volFill');
const volTrack      = document.getElementById('volTrack');
const volPct        = document.getElementById('volPct');
const volIcon       = document.getElementById('volIcon');
const btnPlay       = document.getElementById('btnPlay');
const iconPlay      = btnPlay.querySelector('.icon-play');
const iconPause     = btnPlay.querySelector('.icon-pause');
const btnPrev       = document.getElementById('btnPrev');
const btnNext       = document.getElementById('btnNext');
const btnShuffle    = document.getElementById('btnShuffle');
const btnRepeat     = document.getElementById('btnRepeat');
const btnMute       = document.getElementById('btnMute');
const plList        = document.getElementById('plList');
const plCount       = document.getElementById('plCount');

/* ══════════════════════════════════════════════════
   PLAYLIST RENDERING
   ══════════════════════════════════════════════════ */
function buildPlaylist() {
  plList.innerHTML = '';
  plCount.textContent = `${TRACKS.length} tracks`;

  TRACKS.forEach((track, i) => {
    const li = document.createElement('li');
    li.className = 'pl-item';
    li.dataset.index = i;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', i === currentIndex);
    li.innerHTML = `
      <span class="pl-num">${String(i + 1).padStart(2,'0')}</span>
      <div class="pl-bars" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="pl-info">
        <div class="pl-name">${track.title}</div>
        <div class="pl-artist-name">${track.artist}</div>
      </div>
      <span class="pl-dur">${track.duration}</span>
    `;
    li.addEventListener('click', () => loadTrack(i, true));
    plList.appendChild(li);
  });
}

function updatePlaylistUI() {
  document.querySelectorAll('.pl-item').forEach((li, i) => {
    li.classList.toggle('active', i === currentIndex);
    li.classList.toggle('playing', i === currentIndex && isPlaying);
    li.setAttribute('aria-selected', i === currentIndex);
  });
  // Scroll active item into view
  const active = plList.querySelector('.pl-item.active');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════
   TRACK LOADING
   ══════════════════════════════════════════════════ */
function loadTrack(index, andPlay = false) {
  currentIndex = index;
  const track  = TRACKS[index];

  // Update info panel
  songTitle.textContent  = track.title;
  songArtist.textContent = track.artist;
  songAlbum.textContent  = track.album;

  // Update disc label color accent
  document.documentElement.style.setProperty('--track-color', track.color);

  // Reset progress
  progressFill.style.width = '0%';
  timeCurrent.textContent  = '0:00';
  timeDuration.textContent = track.duration;

  // Load audio
  audio.src = track.src;
  audio.load();

  updatePlaylistUI();

  if (andPlay) play();
}

/* ══════════════════════════════════════════════════
   PLAY / PAUSE
   ══════════════════════════════════════════════════ */
function play() {
  audio.play().then(() => {
    isPlaying = true;
    iconPlay.style.display  = 'none';
    iconPause.style.display = '';
    disc.classList.add('spinning');
    visualizer.classList.add('active');
    updatePlaylistUI();
  }).catch(() => {});
}

function pause() {
  audio.pause();
  isPlaying = false;
  iconPlay.style.display  = '';
  iconPause.style.display = 'none';
  disc.classList.remove('spinning');
  visualizer.classList.remove('active');
  updatePlaylistUI();
}

function togglePlay() {
  if (isPlaying) pause(); else play();
}

/* ══════════════════════════════════════════════════
   NEXT / PREVIOUS
   ══════════════════════════════════════════════════ */
function getNextIndex() {
  if (isShuffle) {
    if (!shuffleQueue.length) refillShuffle();
    return shuffleQueue.pop();
  }
  return (currentIndex + 1) % TRACKS.length;
}

function getPrevIndex() {
  // If >3 seconds in, restart; else go to previous
  if (audio.currentTime > 3) return currentIndex;
  return (currentIndex - 1 + TRACKS.length) % TRACKS.length;
}

function refillShuffle() {
  shuffleQueue = [...Array(TRACKS.length).keys()]
    .filter(i => i !== currentIndex)
    .sort(() => Math.random() - 0.5);
}

function next(autoplay = false) {
  if (repeatMode === 'one' && autoplay) {
    audio.currentTime = 0; play(); return;
  }
  loadTrack(getNextIndex(), true);
}

function prev() {
  loadTrack(getPrevIndex(), isPlaying);
}

/* ══════════════════════════════════════════════════
   AUDIO EVENTS
   ══════════════════════════════════════════════════ */
audio.addEventListener('timeupdate', () => {
  if (isDraggingProgress) return;
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  timeCurrent.textContent  = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  timeDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    audio.currentTime = 0; play(); return;
  }
  if (repeatMode === 'all' || currentIndex < TRACKS.length - 1 || isShuffle) {
    next(true);
  } else {
    pause();
    progressFill.style.width = '0%';
    audio.currentTime = 0;
  }
});

/* ══════════════════════════════════════════════════
   PROGRESS BAR — click + drag
   ══════════════════════════════════════════════════ */
function seekTo(e) {
  const rect = progressTrack.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) audio.currentTime = pct * audio.duration;
  progressFill.style.width = `${pct * 100}%`;
  timeCurrent.textContent  = formatTime(pct * (audio.duration || 0));
}

progressTrack.addEventListener('mousedown', e => {
  isDraggingProgress = true;
  seekTo(e);
});
document.addEventListener('mousemove', e => { if (isDraggingProgress) seekTo(e); });
document.addEventListener('mouseup',   ()  => { isDraggingProgress = false; });

progressTrack.addEventListener('touchstart', e => {
  isDraggingProgress = true; seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener('touchmove',  e => { if (isDraggingProgress) seekTo(e.touches[0]); }, { passive: true });
document.addEventListener('touchend',   ()  => { isDraggingProgress = false; });

/* ══════════════════════════════════════════════════
   VOLUME — click + drag
   ══════════════════════════════════════════════════ */
function setVolume(e) {
  const rect = volTrack.getBoundingClientRect();
  volume     = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  applyVolume();
}

function applyVolume() {
  audio.volume         = isMuted ? 0 : volume;
  volFill.style.width  = `${volume * 100}%`;
  volPct.textContent   = `${Math.round(volume * 100)}%`;
  updateVolIcon();
}

function updateVolIcon() {
  const v = isMuted ? 0 : volume;
  let path;
  if (v === 0)   path = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z';
  else if (v < .5) path = 'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z';
  else             path = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z';
  volIcon.innerHTML = `<path d="${path}"/>`;
}

volTrack.addEventListener('mousedown', e => { isDraggingVolume = true; setVolume(e); });
document.addEventListener('mousemove', e => { if (isDraggingVolume) setVolume(e); });
document.addEventListener('mouseup',   ()  => { isDraggingVolume = false; });

btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  btnMute.style.color = isMuted ? 'var(--magenta)' : '';
  applyVolume();
});

/* ══════════════════════════════════════════════════
   SHUFFLE & REPEAT
   ══════════════════════════════════════════════════ */
btnShuffle.addEventListener('click', () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle('active', isShuffle);
  if (isShuffle) refillShuffle();
});

btnRepeat.addEventListener('click', () => {
  const modes = ['none','all','one'];
  repeatMode  = modes[(modes.indexOf(repeatMode) + 1) % 3];
  btnRepeat.classList.toggle('active', repeatMode !== 'none');
  // Show 'one' indicator via title
  btnRepeat.title = repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat';
});

/* ══════════════════════════════════════════════════
   BUTTON EVENTS
   ══════════════════════════════════════════════════ */
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', () => next(false));
btnPrev.addEventListener('click', prev);

/* ══════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
  switch (e.code) {
    case 'Space':       e.preventDefault(); togglePlay(); break;
    case 'ArrowRight':  e.preventDefault(); next(false);  break;
    case 'ArrowLeft':   e.preventDefault(); prev();       break;
    case 'ArrowUp':
      e.preventDefault();
      volume = Math.min(1, volume + 0.05);
      applyVolume(); break;
    case 'ArrowDown':
      e.preventDefault();
      volume = Math.max(0, volume - 0.05);
      applyVolume(); break;
    case 'KeyM':
      isMuted = !isMuted; applyVolume(); break;
  }
});

/* ══════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════ */
function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

/* ══════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════ */
buildPlaylist();
loadTrack(0, false);
audio.volume = volume;
volFill.style.width = `${volume * 100}%`;
updateVolIcon();
