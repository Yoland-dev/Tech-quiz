const playAgainBtn = document.getElementById("playAgainBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");
const scoreDisplay = document.getElementById("userFinalScore");
const viewLeaderboardBtn = document.getElementById(
  "viewLeaderboardFromScoreBtn"
);

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("userName") || "Guest";
  const score = parseInt(urlParams.get("score")) || 0;
  const total = parseInt(urlParams.get("total")) || 0;

  scoreDisplay.textContent = `${userName}'s Score: ${score} / ${total}`;

  const encodedName = encodeURIComponent(userName);

  playAgainBtn.addEventListener("click", () => {
    window.location.href = `index.html?userName=${encodedName}`;
  });

  viewLeaderboardBtn.addEventListener(
    "click",
    () => (window.location.href = "leaderboard.html")
  );

  backToHomeBtn.addEventListener("click", () => {
    window.location.href = `index.html?userName=${encodedName}`;
  });
});
