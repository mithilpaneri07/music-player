const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const chooseButton = document.getElementById("chooseButton");
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseIcon = document.getElementById("playPauseIcon");
const stopBtn = document.getElementById("stopBtn");
const resumeBtn = document.getElementById("resumeBtn");
const trackTitle = document.getElementById("trackTitle");
const trackSubtitle = document.getElementById("trackSubtitle");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const libraryList = document.getElementById("libraryList");
const libraryEmpty = document.getElementById("libraryEmpty");
const refreshLibrary = document.getElementById("refreshLibrary");
const recList = document.getElementById("recList");
const recEmpty = document.getElementById("recEmpty");
const refreshRecommendations = document.getElementById("refreshRecommendations");

let objectUrl = null;
let sourceType = "none"; // upload | library | none

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const resetUI = () => {
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = audio.duration ? formatTime(audio.duration) : "0:00";
  playPauseIcon.textContent = "\u25b6"; // play
};

const setNowPlaying = (src, title, subtitle, type) => {
  if (type !== "upload" && objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  sourceType = type;
  audio.src = src;
  audio.play();
  trackTitle.textContent = title;
  trackSubtitle.textContent = subtitle;
  playPauseIcon.textContent = "\u23f8";
};

const renderLibrary = (tracks) => {
  libraryList.innerHTML = "";
  if (!tracks || tracks.length === 0) {
    libraryEmpty.style.display = "block";
    recEmpty.style.display = "block";
    return;
  }
  libraryEmpty.style.display = "none";
  recEmpty.style.display = "none";

  tracks.forEach((track) => {
    const item = document.createElement("button");
    item.className = "library-item";
    item.title = track.name;

    const name = document.createElement("p");
    name.className = "name";
    name.textContent = track.name;

    const badge = document.createElement("span");
    badge.className = "pill-mini";
    badge.textContent = "Play";

    item.append(name, badge);
    item.addEventListener("click", () => {
      setNowPlaying(track.url, track.name, "From music folder", "library");
    });

    libraryList.appendChild(item);
  });
};

const renderRecommendations = (tracks) => {
  recList.innerHTML = "";
  if (!tracks || tracks.length === 0) {
    recEmpty.style.display = "block";
    return;
  }
  recEmpty.style.display = "none";

  const picks = [...tracks].sort(() => Math.random() - 0.5).slice(0, 6);
  picks.forEach((track) => {
    const card = document.createElement("button");
    card.className = "rec-item";
    card.title = track.name;

    const name = document.createElement("p");
    name.className = "rec-name";
    name.textContent = track.name;

    const meta = document.createElement("p");
    meta.className = "rec-meta";
    meta.textContent = "From music folder";

    card.append(name, meta);
    card.addEventListener("click", () => {
      setNowPlaying(track.url, track.name, "From recommendations", "library");
    });

    recList.appendChild(card);
  });
};

const loadLibrary = () => {
  libraryEmpty.textContent = "Loading library...";
  libraryEmpty.style.display = "block";
  fetch("/api/tracks")
    .then((res) => res.json())
    .then((data) => {
      renderLibrary(data.tracks);
      renderRecommendations(data.tracks);
    })
    .catch(() => {
      libraryEmpty.textContent = "Could not load library.";
      recEmpty.textContent = "Could not load recommendations.";
    });
};

chooseButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  setNowPlaying(
    objectUrl,
    file.name,
    `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type || "audio"}`,
    "upload"
  );
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const progress = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = `${progress}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
  resetUI();
});

playPauseBtn.addEventListener("click", () => {
  if (!audio.src) return fileInput.click();
  if (audio.paused) {
    audio.play();
    playPauseIcon.textContent = "\u23f8";
  } else {
    audio.pause();
    playPauseIcon.textContent = "\u25b6";
  }
});

resumeBtn.addEventListener("click", () => {
  if (!audio.src) return;
  audio.play();
  playPauseIcon.textContent = "\u23f8";
});

stopBtn.addEventListener("click", () => {
  if (!audio.src) return;
  audio.pause();
  audio.currentTime = 0;
  resetUI();
});

progressBar.addEventListener("click", (event) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  audio.currentTime = ratio * audio.duration;
});

window.addEventListener("beforeunload", () => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});

refreshLibrary.addEventListener("click", loadLibrary);
refreshRecommendations.addEventListener("click", loadLibrary);

document.addEventListener("DOMContentLoaded", loadLibrary);
