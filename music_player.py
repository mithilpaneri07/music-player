import os
from pathlib import Path
from flask import Flask, jsonify, render_template, send_from_directory, abort
from urllib.parse import quote


BASE_DIR = Path(__file__).resolve().parent
MUSIC_DIR = BASE_DIR / "music"

app = Flask(__name__)


def list_tracks():
    exts = {".mp3", ".wav", ".ogg", ".m4a", ".flac"}
    tracks = []
    if MUSIC_DIR.is_dir():
        for path in sorted(MUSIC_DIR.iterdir()):
            if path.is_file() and path.suffix.lower() in exts:
                safe_name = quote(path.name)
                tracks.append({"name": path.name, "url": f"/music/{safe_name}"})
    return tracks


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tracks")
def api_tracks():
    return jsonify({"tracks": list_tracks()})


@app.route("/music/<path:filename>")
def music_file(filename: str):
    target = (MUSIC_DIR / filename).resolve()
    try:
        target.relative_to(MUSIC_DIR)
    except ValueError:
        abort(404)
    if not target.is_file():
        abort(404)
    return send_from_directory(MUSIC_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)