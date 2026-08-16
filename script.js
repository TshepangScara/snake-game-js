const playBoard         = document.querySelector(".play-board");
const scoreElement      = document.querySelector(".score");
const highScoreElement  = document.querySelector(".high-score");
const controls          = document.querySelectorAll(".controls i");
const pauseBtn          = document.getElementById("pause-btn");
const difficultyLabel   = document.getElementById("difficulty-label");

const welcomePopup      = document.getElementById("welcome-popup");
const difficultyPopup   = document.getElementById("difficulty-popup");
const gameoverPopup     = document.getElementById("gameover-popup");
const gameoverScore     = document.getElementById("gameover-score");
const gameoverHighscore = document.getElementById("gameover-highscore");
const leaderboardEl     = document.getElementById("leaderboard");
const playAgainBtn      = document.getElementById("play-again-btn");

let gameOver = false;
let paused   = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let startingSpeed  = 100;
let currentSpeed   = 100;
let scoreMultiplier = 1;
let gameStarted = false;

// ── Ensure keyboard focus on load ────────────────
document.body.focus();

// ── High score & leaderboard ─────────────────────
let highScore = parseInt(localStorage.getItem("high-score") || "0");
highScoreElement.innerText = `High Score: ${highScore}`;

function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem("leaderboard") || "[]"); }
  catch { return []; }
}

function saveToLeaderboard(newScore) {
  const board = getLeaderboard();
  board.push(newScore);
  board.sort((a, b) => b - a);
  const top5 = board.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(top5));
  return top5;
}

function renderLeaderboard(scores) {
  leaderboardEl.innerHTML = scores.length
    ? scores.map((s, i) => `<li>${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`} ${s} pts</li>`).join("")
    : "<li>No scores yet</li>";
}

// ── Start game ───────────────────────────────────
function startGame(speed = 100) {
  if (gameStarted) return;
  gameStarted = true;
  startingSpeed  = Math.max(60, speed - 20);
  currentSpeed   = startingSpeed;
  scoreMultiplier = speed === 180 ? 1 : speed === 100 ? 1.5 : 2;

  if (welcomePopup)    welcomePopup.style.display    = "none";
  if (difficultyPopup) difficultyPopup.style.display = "none";
  pauseBtn.style.display = "inline-block";

  const labels = { 180: "Easy", 100: "Medium", 60: "Hard" };
  if (difficultyLabel) difficultyLabel.textContent = labels[speed] || "";

  updateFoodPosition();
  initGame();
  setIntervalId = setInterval(initGame, currentSpeed);
  document.addEventListener("keydown", changeDirection);
}

// ── Welcome → difficulty on Enter ────────────────
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !gameStarted && welcomePopup && welcomePopup.style.display !== "none") {
    welcomePopup.style.display = "none";
    if (difficultyPopup) difficultyPopup.style.display = "flex";
  }
});

// ── Difficulty button clicks ──────────────────────
if (difficultyPopup) {
  difficultyPopup.querySelectorAll("button[data-speed]").forEach(btn => {
    btn.addEventListener("click", () => startGame(parseInt(btn.dataset.speed, 10)));
  });
  window.addEventListener("keydown", (e) => {
    if (!gameStarted && difficultyPopup && difficultyPopup.style.display !== "none") {
      if (e.key === "1") startGame(180);
      if (e.key === "2") startGame(100);
      if (e.key === "3") startGame(60);
    }
  });
}

// ── Pause ─────────────────────────────────────────
function togglePause() {
  if (!gameStarted || gameOver) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "▶" : "⏸";
  if (paused) {
    clearInterval(setIntervalId);
    const overlay = document.createElement("div");
    overlay.className = "pause-overlay";
    overlay.textContent = "PAUSED";
    playBoard.appendChild(overlay);
  } else {
    setIntervalId = setInterval(initGame, currentSpeed);
    const overlay = playBoard.querySelector(".pause-overlay");
    if (overlay) overlay.remove();
  }
}

pauseBtn.addEventListener("click", togglePause);
document.addEventListener("keydown", (e) => { if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause(); });

// ── Play Again ────────────────────────────────────
playAgainBtn.addEventListener("click", () => location.reload());

// ── Food ──────────────────────────────────────────
const updateFoodPosition = () => {
  do {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
  } while (snakeBody.some(([bx, by]) => bx === foodX && by === foodY));
};

// ── Game Over ─────────────────────────────────────
const handleGameOver = () => {
  clearInterval(setIntervalId);
  pauseBtn.style.display = "none";

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("high-score", highScore);
  }

  const top5 = saveToLeaderboard(score);

  gameoverScore.textContent     = `Your score: ${score} pts`;
  gameoverHighscore.textContent = `Best score: ${highScore} pts`;
  renderLeaderboard(top5);
  gameoverPopup.style.display = "flex";
};

// ── Direction ─────────────────────────────────────
const changeDirection = e => {
  if (paused) return;
  if (e.key === "ArrowUp"    && velocityY !== 1)  { velocityX = 0;  velocityY = -1; e.preventDefault(); }
  else if (e.key === "ArrowDown"  && velocityY !== -1) { velocityX = 0;  velocityY = 1;  e.preventDefault(); }
  else if (e.key === "ArrowLeft"  && velocityX !== 1)  { velocityX = -1; velocityY = 0;  e.preventDefault(); }
  else if (e.key === "ArrowRight" && velocityX !== -1) { velocityX = 1;  velocityY = 0;  e.preventDefault(); }
};

controls.forEach(btn => btn.addEventListener("click", () => changeDirection({ key: btn.dataset.key, preventDefault: () => {} })));

// ── Swipe gestures ────────────────────────────────
let touchStartX = 0, touchStartY = 0;
document.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", e => {
  if (paused || !gameStarted) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // tap, ignore
  if (Math.abs(dx) > Math.abs(dy)) {
    changeDirection({ key: dx > 0 ? "ArrowRight" : "ArrowLeft", preventDefault: () => {} });
  } else {
    changeDirection({ key: dy > 0 ? "ArrowDown" : "ArrowUp", preventDefault: () => {} });
  }
}, { passive: true });

// ── Main loop ─────────────────────────────────────
const initGame = () => {
  if (gameOver) return handleGameOver();
  let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

  if (snakeX === foodX && snakeY === foodY) {
    updateFoodPosition();
    snakeBody.push([foodY, foodX]);
    score += Math.floor(10 * scoreMultiplier);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("high-score", highScore);
    }
    scoreElement.innerText     = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    scoreElement.classList.remove("score-pop");
    void scoreElement.offsetWidth; // reflow to restart animation
    scoreElement.classList.add("score-pop");

    const newSpeed = Math.max(30, startingSpeed - (Math.floor(score / 50) * 2));
    if (newSpeed !== currentSpeed) {
      currentSpeed = newSpeed;
      clearInterval(setIntervalId);
      setIntervalId = setInterval(initGame, currentSpeed);
    }
  }

  snakeX += velocityX;
  snakeY += velocityY;

  // Wrap around
  if (snakeX <= 0) snakeX = 30;
  else if (snakeX > 30) snakeX = 1;
  if (snakeY <= 0) snakeY = 30;
  else if (snakeY > 30) snakeY = 1;

  for (let i = snakeBody.length - 1; i > 0; i--) snakeBody[i] = snakeBody[i - 1];
  snakeBody[0] = [snakeX, snakeY];

  for (let i = 0; i < snakeBody.length; i++) {
    const cls = i === 0 ? "head" : "body";
    html += `<div class="${cls}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = html;
};
