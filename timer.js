// Create timer container and display
const timerContainer = document.createElement('div');
timerContainer.setAttribute('id', 'timer-container');

const timerDisplay = document.createElement('span');
timerDisplay.setAttribute('id', 'timer-display');
timerDisplay.textContent = '00:00:000';
timerContainer.appendChild(timerDisplay);

// Create start, stop, and clear buttons
const startButton = document.createElement('button');
startButton.textContent = 'Start';
startButton.addEventListener('click', startTimer);

const stopButton = document.createElement('button');
stopButton.textContent = 'Stop';
stopButton.disabled = true;
stopButton.addEventListener('click', pauseTimer);

const clearButton = document.createElement('button');
clearButton.textContent = 'Clear';
clearButton.disabled = true;
clearButton.addEventListener('click', clearTimer);

timerContainer.appendChild(startButton);
timerContainer.appendChild(stopButton);
timerContainer.appendChild(clearButton);

// Add timer container to the page
document.body.appendChild(timerContainer);

let startTime;
let elapsedTime = 0;
let intervalId;

function startTimer() {
  startTime = Date.now() - elapsedTime;
  intervalId = setInterval(updateTimerDisplay, 10);
  startButton.disabled = true;
  stopButton.disabled = false;
  clearButton.disabled = false;
}

function pauseTimer() {
  clearInterval(intervalId);
  startButton.disabled = false;
  stopButton.disabled = true;
}

function clearTimer() {
  clearInterval(intervalId);
  timerDisplay.textContent = '00:00:000';
  elapsedTime = 0;
  clearButton.disabled = true;
  stopButton.disabled = true;
  startButton.disabled = false;
}

function updateTimerDisplay() {
  elapsedTime = Date.now() - startTime;
  const milliseconds = Math.floor(elapsedTime % 1000);
  const seconds = Math.floor(elapsedTime / 1000) % 60;
  const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
  const formattedTime = `${pad(minutes)}:${pad(seconds)}:${pad(milliseconds, 3)}`;
  timerDisplay.textContent = formattedTime;
}

function pad(number, width = 2, paddingCharacter = '0') {
  const numberString = String(number);
  const paddingLength = Math.max(0, width - numberString.length);
  const padding = paddingCharacter.repeat(paddingLength);
  return padding + numberString;
}
