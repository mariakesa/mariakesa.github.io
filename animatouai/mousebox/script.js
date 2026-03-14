const BASE_PATH = "animatouai/mousebox";
const PLAYBACK_MS = 300;
const PRELOAD_RADIUS = 4;

let trajectory = [];
let T_video = 0;
let T_takens = 0;
let takens_offset = 0;

let currentFrame = 0;
let playing = false;
let timer = null;

const frameCache = new Map();

const plotDiv = document.getElementById("plot");
const slider = document.getElementById("timeSlider");
const frameLabel = document.getElementById("frameLabel");
const videoFrame = document.getElementById("videoFrame");
const playButton = document.getElementById("playButton");

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function getTakensIndex(videoT) {
  return clamp(videoT - takens_offset, 0, T_takens - 1);
}

function framePath(t) {
  return `${BASE_PATH}/assets/video_frames_kp/frame_${String(t).padStart(6, "0")}.jpg`;
}

function preloadFrame(t) {
  if (t < 0 || t >= T_video || frameCache.has(t)) return;

  const img = new Image();
  img.src = framePath(t);
  frameCache.set(t, img);
}

function preloadNearbyFrames(t, radius = PRELOAD_RADIUS) {
  for (let k = 1; k <= radius; k++) {
    preloadFrame(t + k);
  }
}

function initPlot() {
  const xs = trajectory.map(p => p[0]);
  const ys = trajectory.map(p => p[1]);
  const zs = trajectory.map(p => p[2]);

  const traceLine = {
    x: xs,
    y: ys,
    z: zs,
    mode: "lines",
    type: "scatter3d",
    name: "Takens trajectory",
    line: { width: 2 }
  };

  const t0 = getTakensIndex(0);

  const tracePoint = {
    x: [trajectory[t0][0]],
    y: [trajectory[t0][1]],
    z: [trajectory[t0][2]],
    mode: "markers",
    type: "scatter3d",
    name: "Current state",
    marker: { size: 6, color: "red" }
  };

  const layout = {
    title: "Takens embedding (video frame 0)",
    scene: {
      xaxis: { title: "PC1" },
      yaxis: { title: "PC2" },
      zaxis: { title: "PC3" },
      aspectmode: "data"
    },
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  Plotly.newPlot(plotDiv, [traceLine, tracePoint], layout, { responsive: true });
}

function updateMarker(videoT) {
  const tTakens = getTakensIndex(videoT);

  Plotly.restyle(
    plotDiv,
    {
      x: [[trajectory[tTakens][0]]],
      y: [[trajectory[tTakens][1]]],
      z: [[trajectory[tTakens][2]]]
    },
    [1]
  );

  Plotly.relayout(plotDiv, {
    title: `Takens embedding (video frame ${videoT})`
  });
}

function updateImage(videoT) {
  const src = framePath(videoT);
  videoFrame.src = src;
}

function updateUI(videoT) {
  currentFrame = clamp(videoT, 0, T_video - 1);
  slider.value = currentFrame;
  frameLabel.textContent = `Video frame: ${currentFrame} / ${T_video - 1}`;

  updateImage(currentFrame);
  updateMarker(currentFrame);
  preloadNearbyFrames(currentFrame);
}

function stopPlayback() {
  playing = false;
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  playButton.textContent = "▶ Play";
}

function stepPlayback() {
  if (!playing) return;

  if (currentFrame >= T_video - 1) {
    stopPlayback();
    return;
  }

  updateUI(currentFrame + 1);

  timer = setTimeout(() => {
    stepPlayback();
  }, PLAYBACK_MS);
}

slider.addEventListener("input", (e) => {
  stopPlayback();
  updateUI(Number(e.target.value));
});

playButton.addEventListener("click", () => {
  if (playing) {
    stopPlayback();
  } else {
    playing = true;
    playButton.textContent = "⏸ Pause";
    stepPlayback();
  }
});

videoFrame.onerror = () => {
  console.error("Failed to load image:", videoFrame.src);
};

fetch(`${BASE_PATH}/trajectory.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load trajectory.json: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    trajectory = data.trajectory;
    T_video = data.T_video;
    T_takens = data.T_takens;
    takens_offset = data.takens_offset;

    slider.max = T_video - 1;

    initPlot();
    updateUI(0);
  })
  .catch(err => {
    console.error(err);
    frameLabel.textContent = "Failed to load trajectory data";
  });