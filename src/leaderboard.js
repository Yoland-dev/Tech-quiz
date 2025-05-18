const backToHomeBtn = document.getElementById("backToHomeBtn");
const showScores = document.getElementById("show-scores");

const scores = JSON.parse(localStorage.getItem("scores")) || [];

scores.sort((a, b) => {
  if (b.score === a.score) {
    return new Date(b.date) - new Date(a.date);
  }
  
  return b.score - a.score;
});

showScores.innerHTML = scores
  .map(
    (score, index) =>
      `<tr class="${index % 2 === 0 ? "bg-gray-100" : "bg-white"}">
          <td class="px-2 py-2 text-sm sm:text-base">${score.userName}</td>
          <td class="px-2 py-2 text-sm sm:text-base">${score.category}</td>
          <td class="px-2 py-2 text-sm sm:text-base">${score.score}/${
        score.total
      }</td>
          <td class="px-2 py-2 text-sm sm:text-base">${score.date.slice(
            0,
            score.date.indexOf(",")
          )}</td>
      </tr>`
  )
  .join("");

backToHomeBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
