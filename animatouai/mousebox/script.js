let trajectory = [];
let T_video = 0;
let T_takens = 0;
let takens_offset = 0;

let currentFrame = 0;
let playing = false;
let timer = null;

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
  return `assets/video_frames_kp/frame_${String(t).padStart(6, "0")}.jpg`;
}

function renderPlot(videoT) {
  const tTakens = getTakensIndex(videoT);

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

  const tracePoint = {
    x: [trajectory[tTakens][0]],
    y: [trajectory[tTakens][1]],
    z: [trajectory[tTakens][2]],
    mode: "markers",
    type: "scatter3d",
    name: "Current state",
    marker: { size: 6, color: "red" }
  };

  const layout = {
    title: `Takens embedding (video frame ${videoT})`,
    scene: {
      xaxis: { title: "PC1" },
      yaxis: { title: "PC2" },
      zaxis: { title: "PC3" },
      aspectmode: "data"
    },
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  Plotly.react(plotDiv, [traceLine, tracePoint], layout, { responsive: true });
}

function updateUI(videoT) {
  currentFrame = videoT;
  slider.value = videoT;
  frameLabel.textContent = `Video frame: ${videoT} / ${T_video - 1}`;
  videoFrame.src = framePath(videoT);
  renderPlot(videoT);
}

slider.addEventListener("input", (e) => {
  updateUI(Number(e.target.value));
});

playButton.addEventListener("click", () => {
  playing = !playing;

  if (playing) {
    timer = setInterval(() => {
      if (currentFrame < T_video - 1) {
        updateUI(currentFrame + 1);
      } else {
        playing = false;
        clearInterval(timer);
      }
    }, 100);
  } else {
    clearInterval(timer);
  }
});

fetch("trajectory.json")
  .then(response => response.json())
  .then(data => {
    trajectory = data.trajectory;
    T_video = data.T_video;
    T_takens = data.T_takens;
    takens_offset = data.takens_offset;

    slider.max = T_video - 1;
    updateUI(0);
  });
