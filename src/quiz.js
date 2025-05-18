const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get("category");
const userName = urlParams.get("userName") || "Guest";

const NUM_QUESTIONS = parseInt(localStorage.getItem("numQuestions")) || 10;
let quizData = []; 
let currentQuestionIndex = 0;
const QUESTION_TIME = 15; 
let timerInterval; 
let correctAnswersCount = 0;

const quizViewElement = document.getElementById("quiz-view");
const questionTextElement = document.getElementById("questionText");
const questionCounterElement = document.getElementById("questionCounter");
const progressBarElement = document.getElementById("progressBar");
const answerOptionsDiv = document.getElementById("answerOptions");
const timerDisplayElement = document.getElementById("timerDisplay");

function widenQuizContainer() {
  if (quizViewElement) {
    quizViewElement.classList.remove("max-w-xl");
    quizViewElement.classList.add("max-w-3xl");
  }
}

async function loadQuestions() {
  try {
    widenQuizContainer();

    const res = await fetch("src/data.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    if (!data.categories || !data.categories[selectedCategory]) {
      throw new Error(
        `Category "${selectedCategory}" not found in data.json or data.json is not structured as expected.`
      );
    }

    const categoryQuestions = data.categories[selectedCategory];
    const maxQuestions = data.settings?.maxQuestionsPerQuiz || 15;
    const availableQuestions = categoryQuestions.length;

    // Generate a random number between 1 and the smaller of availableQuestions and maxQuestions
    const NUM_QUESTIONS = Math.floor(Math.random() * Math.min(availableQuestions, maxQuestions)) + 1;

    quizData = shuffleArray(categoryQuestions).slice(0, NUM_QUESTIONS);
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    showQuestion();
  } catch (err) {
    if (questionTextElement) {
      questionTextElement.textContent = "⚠️ Failed to load quiz data. Please check the category or data source.";
    }
    console.error("Error loading questions:", err);
  }
}

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    console.error("showQuestion called out of bounds");
    return;
  }

  const q = quizData[currentQuestionIndex];
  const total = quizData.length;

  if (questionTextElement) questionTextElement.textContent = q.question;
  if (questionCounterElement) {
    questionCounterElement.textContent = `Question ${currentQuestionIndex + 1}/${total}`;
  }
  if (progressBarElement) {
    progressBarElement.style.width = `${((currentQuestionIndex + 1) / total) * 100}%`;
  }

  if (answerOptionsDiv) {
    answerOptionsDiv.innerHTML = ""; 

    const shuffledOptions = shuffleArray([...q.options]);

    shuffledOptions.forEach((option) => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.className =
        "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200 text-gray-700";
      btn.onclick = () => handleAnswer(option, q.answer);
      answerOptionsDiv.appendChild(btn);
    });
  }

  resetTimer();
  startTimer();
}

function startTimer() {
  if (!timerDisplayElement) return;

  let timeLeft = QUESTION_TIME;
  timerDisplayElement.textContent = `Time: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplayElement.textContent = `Time: ${timeLeft}s`;

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

  const answerButtons = answerOptionsDiv ? answerOptionsDiv.querySelectorAll("button") : [];
  answerButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("hover:bg-blue-100");
  });

  let userWasCorrect = false;
  if (!timeUp && selectedOptionText === correctAnswerText) {
    userWasCorrect = true;
    correctAnswersCount++;
  }

  answerButtons.forEach((btn) => {
    const optionTextOfButton = btn.textContent;
    btn.classList.remove("bg-white", "border-gray-300", "text-gray-700"); 

    if (optionTextOfButton === correctAnswerText) {
      btn.classList.add("bg-green-500", "text-white", "border-green-600"); 
    } else if (!timeUp && optionTextOfButton === selectedOptionText) {
      btn.classList.add("bg-red-500", "text-white", "border-red-600"); 
    } else {
        btn.classList.add("bg-gray-100", "text-gray-500", "border-gray-200");
    }
  });

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      showQuestion();
    } else {
      const finalScore = correctAnswersCount;
      const totalQuestions = quizData.length;
      const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

      let interactiveQuizData;
      const storedDataString = localStorage.getItem('interactiveQuizData');

      if (storedDataString) {
        try {
          interactiveQuizData = JSON.parse(storedDataString);
          if (!interactiveQuizData || !Array.isArray(interactiveQuizData.highScores)) {
            console.warn("Leaderboard: Malformed high scores data in localStorage. Resetting.");
            interactiveQuizData = { highScores: [] };
          }
        } catch (e) {
          console.error("Leaderboard: Error parsing high scores from localStorage. Resetting.", e);
          interactiveQuizData = { highScores: [] }; 
        }
      } else {
        interactiveQuizData = { highScores: [] }; 
      }

      const newHighScoreEntry = {
        name: userName,
        score: finalScore,
        totalQuestions: totalQuestions,
        percentage: percentage,
        category: selectedCategory,
        date: new Date().toLocaleString(), 
      };

      interactiveQuizData.highScores.push(newHighScoreEntry);

      try {
        localStorage.setItem('interactiveQuizData', JSON.stringify(interactiveQuizData));
      } catch (e) {
        console.error("Error saving high scores to localStorage:", e);
      }
      
      window.location.href = `score.html?userName=${encodeURIComponent(
        userName
      )}&score=${finalScore}&total=${totalQuestions}&percentage=${percentage}`; 
    }
  }, 1500); 
}


function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; 
  }
  return arr;
}


if (selectedCategory && userName) { 
    loadQuestions();
} else {
    if (questionTextElement) {
        questionTextElement.textContent = "⚠️ Quiz category or user name not specified. Please start from the home page.";
    }
    console.error("Category or User Name missing from URL parameters.");
   
}
