document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("userName") || "Guest";
  const score = parseInt(urlParams.get("score")) || 0;
  const total = parseInt(urlParams.get("total")) || 0;

  const scoreDisplay = document.getElementById("userFinalScore");
  scoreDisplay.textContent = `${userName}'s Score: ${score} / ${total}`;

  const playAgainBtn = document.getElementById("playAgainBtn");
  const backToHomeBtn = document.getElementById("backToHomeBtn");
  const encodedName = encodeURIComponent(userName);

  playAgainBtn.addEventListener("click", () => {
    window.location.href = `index.html?userName=${encodedName}`;
  });

  backToHomeBtn.addEventListener("click", () => {
    window.location.href = `index.html?userName=${encodedName}`;
  });
});
