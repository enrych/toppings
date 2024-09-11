import React from "dom-chef";
import elementReady from "element-ready";

let isMarkerDragging: "start" | "end" | null = null;
let video: HTMLVideoElement | null = null;
let timeUpdateListener: ((event: Event) => void) | null = null;

export const LoopSegmentButton = (
  <button
    className="ytp-button text-center"
    aria-pressed="false"
    aria-label="Loop Segment of the video."
    title="Loop Segment"
    onClick={(_event: React.MouseEvent) => {
      const isPressed =
        LoopSegmentButton.getAttribute("aria-pressed") ?? "false";
      if (isPressed === "true") {
        disableLoopSegment();
        LoopSegmentButton.setAttribute("aria-pressed", "false");
      } else {
        enableLoopSegment();
        LoopSegmentButton.setAttribute("aria-pressed", "true");
      }
      LoopSegmentStartMarker.classList.toggle("hidden");
      LoopSegmentEndMarker.classList.toggle("hidden");
    }}
  >
    <svg
      viewBox="-9.6 -9.6 43.20 43.20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.19 15.94C17.15 16.03 17.1 16.11 17.03 16.18L15.34 17.87C15.19 18.02 15 18.09 14.81 18.09C14.62 18.09 14.43 18.02 14.28 17.87C13.99 17.58 13.99 17.1 14.28 16.81L14.69 16.4H9.1C7.8 16.4 6.75 15.34 6.75 14.05V12.28C6.75 11.87 7.09 11.53 7.5 11.53C7.91 11.53 8.25 11.87 8.25 12.28V14.05C8.25 14.52 8.63 14.9 9.1 14.9H14.69L14.28 14.49C13.99 14.2 13.99 13.72 14.28 13.43C14.57 13.14 15.05 13.14 15.34 13.43L17.03 15.12C17.1 15.19 17.15 15.27 17.19 15.36C17.27 15.55 17.27 15.76 17.19 15.94ZM17.25 11.72C17.25 12.13 16.91 12.47 16.5 12.47C16.09 12.47 15.75 12.13 15.75 11.72V9.95C15.75 9.48 15.37 9.1 14.9 9.1H9.31L9.72 9.5C10.01 9.79 10.01 10.27 9.72 10.56C9.57 10.71 9.38 10.78 9.19 10.78C9 10.78 8.81 10.71 8.66 10.56L6.97 8.87C6.9 8.8 6.85 8.72 6.81 8.63C6.73 8.45 6.73 8.24 6.81 8.06C6.85 7.97 6.9 7.88 6.97 7.81L8.66 6.12C8.95 5.83 9.43 5.83 9.72 6.12C10.01 6.41 10.01 6.89 9.72 7.18L9.31 7.59H14.9C16.2 7.59 17.25 8.65 17.25 9.94V11.72Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  </button>
);

export const LoopSegmentStartMarker = (
  <div
    id="start-marker"
    className="absolute top-[-25px] left-0 hidden cursor-pointer w-0 h-0 border-solid border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-[red] transform -translate-x-1/2"
    onMouseDown={(e) => handleMarkerDrag(e, "start")}
  />
);

export const LoopSegmentEndMarker = (
  <div
    id="end-marker"
    className="absolute top-[-25px] left-full hidden cursor-pointer w-0 h-0 border-solid border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-[red] transform -translate-x-1/2"
    onMouseDown={(e) => handleMarkerDrag(e, "end")}
  />
);

async function enableLoopSegment() {
  video = (await elementReady("video")) as HTMLVideoElement | null;
  if (!video) return;

  timeUpdateListener = (_event: Event) => {
    if (!video) return;
    const currentTime = video.currentTime;
    const loopStartTime = getTimeFromMarker("#start-marker") || 0;
    let loopEndTime = getTimeFromMarker("#end-marker") || video.duration;

    if (video.duration - loopEndTime <= 0.3) {
      loopEndTime = video.duration - 0.3;
    }

    const isLoopSegmentEnabled =
      LoopSegmentButton.getAttribute("aria-pressed") ?? "false";
    if (currentTime > loopEndTime && isLoopSegmentEnabled === "true") {
      video.currentTime = loopStartTime;
    }
  };

  video.addEventListener("timeupdate", timeUpdateListener);
  LoopSegmentStartMarker.style.left = "0%";
  LoopSegmentEndMarker.style.left = "100%";
}

function disableLoopSegment() {
  if (video && timeUpdateListener) {
    video.removeEventListener("timeupdate", timeUpdateListener);
    timeUpdateListener = null;
  }
}

function getTimeFromMarker(markerSelector: "#start-marker" | "#end-marker") {
  if (!video) return;

  const duration = video.duration;
  const marker = document.querySelector(markerSelector);
  if (!marker) return;
  const markerPositionPercentage = parseFloat(
    (marker as HTMLDivElement).style.left,
  );

  return (markerPositionPercentage / 100) * duration;
}

function handleMarkerDrag(
  e: React.MouseEvent,
  markerType: "start" | "end" | null,
) {
  e.preventDefault();
  isMarkerDragging = markerType;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!isMarkerDragging) return;

  const progressBarContainer = document.querySelector(
    ".ytp-progress-bar-container",
  );
  if (!progressBarContainer) return;
  const progressBarRect = progressBarContainer.getBoundingClientRect();
  const progressBarWidth = progressBarRect.width;

  const xPosition = e.clientX - progressBarRect.left;
  const newPosition = Math.max(0, Math.min(xPosition, progressBarWidth));
  let newPercentage = (newPosition / progressBarWidth) * 100;

  const startPercentage = parseFloat(LoopSegmentStartMarker.style.left);
  const endPercentage = parseFloat(LoopSegmentEndMarker.style.left);

  // Prevent markers from crossing each other
  if (isMarkerDragging === "start" && newPercentage >= endPercentage) {
    newPercentage = endPercentage - 0.1;
  } else if (isMarkerDragging === "end" && newPercentage <= startPercentage) {
    newPercentage = startPercentage + 0.1;
  }

  const marker = document.getElementById(`${isMarkerDragging}-marker`);
  if (marker) {
    marker.style.left = `${newPercentage}%`;
  }
  if (video && isMarkerDragging === "start") {
    const loopStartTime = (newPercentage / 100) * video.duration;
    video.currentTime = loopStartTime;
  }
}

function handleMouseUp() {
  if (isMarkerDragging) {
    isMarkerDragging = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
}
