document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('userName') || "Guest";
    const score = urlParams.get('score') || 0;
    const total = urlParams.get('total') || 0;

    const scoreDisplay = document.getElementById("userFinalScore");
    scoreDisplay.textContent = `${userName}'s Score: ${score} / ${total}`;
});
