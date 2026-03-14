const BASE_PATH = "animatouai/mousebox";
const VIDEO_FPS = 10; // must match the fps used when creating session.mp4

let trajectory = [];
let T_video = 0;
let T_takens = 0;
let takens_offset = 0;

const plotDiv = document.getElementById("plot");
const slider = document.getElementById("timeSlider");
const frameLabel = document.getElementById("frameLabel");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const mouseVideo = document.getElementById("mouseVideo");

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function getTakensIndex(videoFrame) {
  return clamp(videoFrame - takens_offset, 0, T_takens - 1);
}

function currentVideoFrame() {
  return clamp(Math.floor(mouseVideo.currentTime * VIDEO_FPS), 0, T_video - 1);
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

function updateMarkerFromFrame(videoFrame) {
  const tTakens = getTakensIndex(videoFrame);

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
    title: `Takens embedding (video frame ${videoFrame})`
  });
}

function updateUIFromVideo() {
  const frame = currentVideoFrame();
  slider.value = mouseVideo.currentTime;
  frameLabel.textContent = `Video frame: ${frame} / ${T_video - 1} | time: ${mouseVideo.currentTime.toFixed(2)} s`;
  updateMarkerFromFrame(frame);
}

playButton.addEventListener("click", () => {
  mouseVideo.play();
});

pauseButton.addEventListener("click", () => {
  mouseVideo.pause();
});

slider.addEventListener("input", (e) => {
  mouseVideo.currentTime = Number(e.target.value);
  updateUIFromVideo();
});

mouseVideo.addEventListener("timeupdate", () => {
  updateUIFromVideo();
});

mouseVideo.addEventListener("seeked", () => {
  updateUIFromVideo();
});

mouseVideo.addEventListener("loadedmetadata", () => {
  slider.min = 0;
  slider.max = mouseVideo.duration;
  slider.step = 1 / VIDEO_FPS;
});

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

    initPlot();
    updateMarkerFromFrame(0);
  })
  .catch(err => {
    console.error(err);
    frameLabel.textContent = "Failed to load trajectory data";
  });