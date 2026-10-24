# 🎵 AuraBeat — Local Audio Studio & Music Player

**AuraBeat** is a sleek, modern, and responsive local music player web app built with **React.js**, **Vite**, and **Tailwind CSS**. It enables you to select an entire folder of MP3s (or any audio files) from your local device, automatically extracting track metadata and album artwork into an interactive playlist.

---

## ✨ Features

- 📁 **Local Folder & File Selection**:
  - One-click folder picker (`webkitdirectory`) to import your entire music library or playlists from your local drive.
  - Individual/multiple file selector for flexible loading.
  - Full-screen **Drag & Drop** support: drag music folders or files directly into the browser.
- 🏷️ **ID3 Metadata & Album Art Extraction**:
  - Reads ID3v1/ID3v2 tags (Title, Artist, Album, Year, Genre) directly in the browser using `jsmediatags`.
  - Automatically extracts embedded album artwork.
  - Fallback filename parser and dynamic algorithmic color gradients for tracks without artwork.
- 🎛️ **Complete Music Player Controls**:
  - **Play / Pause / Next / Previous** track.
  - **Seek Bar / Scrubber** with buffered progress, hover timestamp preview, and elapsed/total duration.
  - **Volume & Mute**: Slider with percentage indicator and toggle mute with memory.
  - **Shuffle Mode**: Smart randomization preventing immediate repeats.
  - **Repeat Modes**: Cycle between Repeat Off, Repeat All, and Repeat One.
  - **Playback Speed**: Toggle between 0.75x, 1x, 1.25x, 1.5x, and 2x.
  - **Quick Seek**: -10s rewind and +10s fast forward buttons.
- 📊 **Real-time Audio Visualizer**:
  - Web Audio API canvas visualizer displaying responsive frequency waves and neon equalizer bars.
- 📋 **Queue & Library Management**:
  - Real-time search by Title, Artist, Album, or Filename.
  - Sort by Title, Artist, Duration, or Favorites.
  - Star / Favorite tracks (persisted in `localStorage`).
  - Remove individual tracks or clear the queue.
  - Track count and total playlist playback duration.
- 📱 **Mobile & Desktop Responsive Design**:
  - **Desktop**: Split-pane layout with persistent queue, center vinyl turntable presentation, and floating bottom controls.
  - **Mobile**: Seamless drawer toggle between the full-screen "Now Playing" view and the queue.
- 🎧 **Media Session API**:
  - Control playback from your system lock screen, notifications, or keyboard/headphone media buttons.
- ⌨️ **Keyboard Shortcuts**:
  - `Space` : Play / Pause
  - `→` / `←` : Seek +/- 5s
  - `↑` / `↓` : Volume +/- 5%
  - `N` / `P` : Next / Previous track
  - `M` : Mute / Unmute
  - `S` : Toggle Shuffle
  - `R` : Cycle Repeat
  - `Esc` : Close modals

---

## 📂 Project Structure

```
music-player/
├── index.html                 # App shell with Google Fonts & theme meta
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration with build aliases
├── tailwind.config.js         # Custom theme colors, animations & glassmorphism
├── postcss.config.js          # PostCSS Tailwind processor
├── README.md                  # Project documentation
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Main application component & layout state
│   ├── index.css              # Custom scrollbars, glass styles, and range inputs
│   ├── components/
│   │   ├── Navbar.jsx         # Header with Folder, File, and Demo buttons
│   │   ├── NowPlayingView.jsx # Vinyl player, album art, visualizer, speed controls
│   │   ├── PlaylistView.jsx   # Queue list, search, sort, duration, remove
│   │   ├── PlayerControls.jsx # Scrub bar, play/pause, shuffle, repeat, volume
│   │   ├── AudioVisualizer.jsx# Web Audio API canvas visualizer
│   │   └── KeyboardShortcutsModal.jsx # Hotkeys helper dialog
│   ├── hooks/
│   │   └── useAudioPlayer.js  # Audio state, playback queue, events & persistence
│   └── utils/
│       ├── audioMetadata.js   # ID3 tag extraction & filename parser
│       └── demoTracks.js      # Sample royalty-free audio tracks for quick testing
└── dist/                      # Production build output
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the URL displayed in the terminal).

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🎧 Supported Audio Formats
- MP3 (`.mp3`)
- WAV (`.wav`)
- Ogg Vorbis (`.ogg`)
- FLAC (`.flac`)
- AAC / M4A (`.aac`, `.m4a`)
- WebM Audio / Opus (`.weba`, `.opus`)

---

## 🐳 Docker Deployment


### 1. Build Docker Image Locally
```bash
docker build -t aurabeat-music-player .
```

### 2. Run Container Locally
```bash
docker run -d -p 8080:80 --name aurabeat-app aurabeat-music-player
```
Now access the player at: `http://localhost:8080`

Or run via Docker Compose:
```bash
docker compose up -d
```

---
