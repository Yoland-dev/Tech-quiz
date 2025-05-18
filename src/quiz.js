const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get("category");
const userName = urlParams.get("userName");

const NUM_QUESTIONS = parseInt(localStorage.getItem("numQuestions")) || 10;
let quizData = [];
let currentQuestionIndex = 0;
const QUESTION_TIME = 15;
let timerInterval;
let correctAnswersCount = 0;
const scores = JSON.parse(localStorage.getItem("scores")) || [];

function widenQuizContainer() {
    const quizViewElement = document.getElementById("quiz-view");
    if (quizViewElement) {
        quizViewElement.classList.remove("max-w-xl"); 
        quizViewElement.classList.add("max-w-3xl");   
    }
}

async function loadQuestions() {
  try {
    widenQuizContainer();

    const res = await fetch("src/data.json");
    const data = await res.json();

    if (!data.categories[selectedCategory]) {
      throw new Error(`Category "${selectedCategory}" not found in data.json`);
    }

    const categoryQuestions = data.categories[selectedCategory];
    quizData = shuffleArray(categoryQuestions).slice(0, NUM_QUESTIONS);
    currentQuestionIndex = 0;
    showQuestion();
  } catch (err) {
    document.getElementById("questionText").textContent =
      "⚠️ Failed to load quiz data.";
    console.error(err);
  }
}

function showQuestion() {
  const q = quizData[currentQuestionIndex];
  const total = quizData.length;

  document.getElementById("questionText").textContent = q.question;
  document.getElementById("questionCounter").textContent = `Question ${
    currentQuestionIndex + 1
  }/${total}`;
  document.getElementById("progressBar").style.width = `${
    ((currentQuestionIndex + 1) / total) * 100
  }%`;

  const answerOptionsDiv = document.getElementById("answerOptions");
  answerOptionsDiv.innerHTML = ""; 

  const shuffledOptions = shuffleArray([...q.options]);

  shuffledOptions.forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className =
      "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200 text-gray-700"; // Added text-gray-700 for better contrast on white
    btn.onclick = () => handleAnswer(option, q.answer);
    answerOptionsDiv.appendChild(btn);
  });

  resetTimer();
  startTimer();
}

function startTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  timeLeft = QUESTION_TIME;
  timerDisplay.textContent = `Time: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAnswer(null, quizData[currentQuestionIndex].answer, true);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
}

function handleAnswer(selectedOptionText, correctAnswerText, timeUp = false) {
  if (currentQuestionIndex >= quizData.length) return;

  resetTimer();

  const answerButtons = document.getElementById("answerOptions").querySelectorAll('button');
  answerButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove("hover:bg-blue-100"); 
  });

  let userWasCorrect = false;
  if (!timeUp && selectedOptionText === correctAnswerText) {
    userWasCorrect = true;
    correctAnswersCount++;
  }

  answerButtons.forEach(btn => {
    const optionTextOfButton = btn.textContent;

    if (optionTextOfButton === correctAnswerText) {
      btn.classList.remove("bg-white", "border-gray-300", "text-gray-700");
      btn.classList.add("bg-green-500", "text-white", "border-green-600");
    }
    else if (!timeUp && optionTextOfButton === selectedOptionText) {
      btn.classList.remove("bg-white", "border-gray-300", "text-gray-700");
      btn.classList.add("bg-red-500", "text-white", "border-red-600");
    }
  
  });


  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      showQuestion();
    } else {
      const score = calculateScore();
      const total = quizData.length;

      const userGameInfo = {
        userName,
        score,
        total,
        category: selectedCategory,
        date: new Date().toLocaleString(),
      };
      scores.push(userGameInfo);
      localStorage.setItem("scores", JSON.stringify(scores));
      window.location.href = `score.html?userName=${encodeURIComponent(
        userName
      )}&score=${score}&total=${total}`;
    }
  }, 1500); 
}

function calculateScore() {
  return correctAnswersCount;
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
loadQuestions();