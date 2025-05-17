const userNameInput = document.getElementById("userName");
const categorySelect = document.getElementById("categorySelect");
const startQuizBtn = document.getElementById("startQuizBtn");
const adminViewBtn = document.getElementById("adminViewBtn");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const missingName = document.getElementById("missing-name");
const missingCategory = document.getElementById("missing-category");

let data;

window.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("./src/data.json");
  if (!response.ok) {
    console.error("Failed to fetch data:", response.statusText);
    return;
  }

  data = await response.json();

  const categories = data.categories;

  const categoryOptions = Object.keys(categories)
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
  categorySelect.innerHTML = `<option value="">Select a category</option>${categoryOptions}`;
});

startQuizBtn.addEventListener("click", () => {
  const userName = userNameInput.value.trim();
  const selectedCategory = categorySelect.value;

  localStorage.setItem("userName", userName);
  localStorage.setItem("selectedCategory", selectedCategory);

  if (userName === "") {
    missingName.style.display = "block";
    missingName.style.color = "red";
    missingName.style.fontSize = "18px";
    missingName.style.textAlign = "center";
    missingName.textContent = "Please enter your name.";
    userNameInput.focus();
    return;
  } else {
    missingName.style.display = "none";
  }

  if (selectedCategory === "") {
    missingCategory.style.display = "block";
    missingCategory.style.color = "red";
    missingCategory.style.fontSize = "18px";
    missingCategory.style.textAlign = "center";
    missingCategory.textContent = "Please select a category.";
    categorySelect.focus();
    return;
  } else {
    missingCategory.style.display = "none";
  }
  userNameInput.value = "";
  window.location.href = `quiz.html?category=${selectedCategory}&userName=${encodeURIComponent(
    userName
  )}`;
});

viewLeaderboardBtn.addEventListener(
  "click",
  () => (window.location.href = "leaderboard.html")
);

adminViewBtn.addEventListener(
  "click",
  () => (window.location.href = "admin.html")
);

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromURL = urlParams.get("userName");

  if (nameFromURL) {
    const nameInput = document.getElementById("userName");
    if (nameInput) {
      nameInput.value = nameFromURL;
    }
  }
});
