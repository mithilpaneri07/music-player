# Copilot Instructions for Music Player

## Architecture Overview

This is a lightweight Flask-based web music player with a client-side audio playback model:

```
music_player.py      → Flask backend (serves files + API)
templates/index.html → Single-page HTML shell
static/app.js        → All client-side audio logic
static/style.css     → Glassmorphic dark theme
music/               → Local audio file storage
```

**Key Design Decision**: Audio never uploads to server. Local files use `URL.createObjectURL()`, library files stream via `/music/<filename>`.

## Development Workflow

```bash
pip install flask
python music_player.py        # Runs on http://127.0.0.1:5000
```

Place audio files (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`) in `music/` folder to populate the library.

## Code Patterns

### Backend (`music_player.py`)
- **Path traversal protection**: Always validate paths stay within `MUSIC_DIR` using `relative_to()`
- **URL encoding**: Use `urllib.parse.quote()` for filenames in API responses
- **Supported formats**: Defined in `list_tracks()` → `{".mp3", ".wav", ".ogg", ".m4a", ".flac"}`

### Frontend (`static/app.js`)
- **State tracking**: `sourceType` variable tracks audio source (`"upload"` | `"library"` | `"none"`)
- **Memory management**: Always revoke `objectUrl` with `URL.revokeObjectURL()` when switching sources
- **Central playback function**: Use `setNowPlaying(src, title, subtitle, type)` for all audio loads
- **DOM references**: All elements cached at top of file as `const` declarations

### Styling (`static/style.css`)
- **CSS variables**: All colors/spacing in `:root` — modify theme there
- **Component classes**: `.card`, `.pill`, `.ghost-btn`, `.library-item`, `.rec-item`
- **Responsive**: Uses `clamp()` for typography, CSS Grid for layout

## API Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/` | GET | HTML page |
| `/api/tracks` | GET | `{"tracks": [{"name": "...", "url": "/music/..."}]}` |
| `/music/<filename>` | GET | Audio file stream |

## UI Components

- **Hero section**: "Choose audio" button triggers hidden file input
- **Recommendations**: Random 6 tracks from library (client-side shuffle)
- **Now Playing card**: Progress bar, play/pause/stop/resume controls
- **Library panel**: Scrollable list of all `music/` folder contents

## When Adding Features

1. **New audio formats**: Add extension to `exts` set in `list_tracks()`
2. **New playback controls**: Add button in `index.html`, wire event in `app.js`, use existing `audio` element methods
3. **New API endpoints**: Follow pattern in `music_player.py`, return JSON with `jsonify()`
4. **Styling changes**: Use existing CSS variables, follow `.card` pattern for new containers
