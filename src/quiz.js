const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get("category");
const userName = urlParams.get("userName") || "Guest";


let NUM_QUESTIONS = 10; 
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


async function loadQuizConfigAndQuestions() {
  let allQuizDataFromStorage;
  let settings;
  let categories;

  const storedDataString = localStorage.getItem('interactiveQuizData');
  if (storedDataString) {
    try {
      allQuizDataFromStorage = JSON.parse(storedDataString);
      if (allQuizDataFromStorage && allQuizDataFromStorage.categories && allQuizDataFromStorage.settings) {
        categories = allQuizDataFromStorage.categories;
        settings = allQuizDataFromStorage.settings;
        console.log("Quiz config and categories loaded from localStorage.");
      } else {
        console.warn("LocalStorage 'interactiveQuizData' is malformed or missing parts. Falling back.");
        allQuizDataFromStorage = null; 
      }
    } catch (e) {
      console.error("Error parsing 'interactiveQuizData' from localStorage. Falling back.", e);
      allQuizDataFromStorage = null; 
    }
  }

  if (!allQuizDataFromStorage) { 
    console.log("Attempting to load from src/data.json as fallback...");
    try {
      const res = await fetch("src/data.json");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const jsonData = await res.json();
      if (jsonData && jsonData.categories && jsonData.settings) { 
        categories = jsonData.categories;
        settings = jsonData.settings;
        console.log("Quiz config and categories loaded from data.json.");
        
        if (!storedDataString) {
             localStorage.setItem('interactiveQuizData', JSON.stringify(jsonData)); 
        }
      } else {
        throw new Error("src/data.json is missing categories or settings structure.");
      }
    } catch (err) {
      if (questionTextElement) {
        questionTextElement.textContent = "⚠️ Failed to load quiz configuration. Please contact an administrator.";
      }
      console.error("Fatal Error loading quiz configuration:", err);
      return { error: true, message: "Could not load configuration from any source." };
    }
  }

  const minQ = parseInt(settings.minQuestionsPerQuiz) || 5; 
  const maxQ = parseInt(settings.maxQuestionsPerQuiz) || 10; 

  if (minQ > maxQ) {
    console.warn(`Min questions (${minQ}) is greater than max questions (${maxQ}). Using max: ${maxQ}`);
    NUM_QUESTIONS = maxQ > 0 ? maxQ : 10; 
  } else if (minQ <= 0) { 
    const effectiveMin = 1;
    if (effectiveMin > maxQ) { 
        NUM_QUESTIONS = 10; 
        console.warn(`Max questions (${maxQ}) is too low. Defaulting to ${NUM_QUESTIONS} questions.`);
    } else {
        NUM_QUESTIONS = Math.floor(Math.random() * (maxQ - effectiveMin + 1)) + effectiveMin;
    }
  } else {
    NUM_QUESTIONS = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;
  }
  console.log(`Number of questions for this quiz will be: ${NUM_QUESTIONS}`);


  if (!categories || !categories[selectedCategory]) {
    const errorMsg = `Category "${selectedCategory}" not found in loaded data.`;
    console.error(errorMsg);
    if (questionTextElement) questionTextElement.textContent = `⚠️ ${errorMsg}`;
    return { error: true, message: errorMsg };
  }

  const categoryQuestions = categories[selectedCategory];
  if (!categoryQuestions || categoryQuestions.length === 0) {
      const errorMsg = `No questions available for category "${selectedCategory}".`;
      console.error(errorMsg);
      if (questionTextElement) questionTextElement.textContent = `⚠️ ${errorMsg}`;
      return { error: true, message: errorMsg };
  }

  quizData = shuffleArray([...categoryQuestions]).slice(0, NUM_QUESTIONS);

  if (quizData.length === 0 && categoryQuestions.length > 0) {
      console.warn(`Calculated NUM_QUESTIONS was too low or zero. Adjusting based on available questions.`);
      NUM_QUESTIONS = Math.min(categoryQuestions.length, Math.max(1, minQ)); 
      quizData = shuffleArray([...categoryQuestions]).slice(0, NUM_QUESTIONS);
  }
  
  if (quizData.length === 0) {
    const errorMsg = `Failed to prepare any questions for category "${selectedCategory}", even after adjustments.`;
    console.error(errorMsg);
    if (questionTextElement) questionTextElement.textContent = `⚠️ ${errorMsg}`;
    return { error: true, message: errorMsg };
  }


  currentQuestionIndex = 0;
  correctAnswersCount = 0;
  showQuestion(); 
  return { error: false };
}


function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    console.error("showQuestion called out of bounds or no questions loaded.");
    if (quizData.length === 0 && questionTextElement) {
        questionTextElement.textContent = "No questions to display for this quiz.";
    }
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
            interactiveQuizData = { ...interactiveQuizData, highScores: [] }; 
          }
        } catch (e) {
          console.error("Leaderboard: Error parsing high scores from localStorage. Resetting.", e);
          const tempCategories = interactiveQuizData && interactiveQuizData.categories ? interactiveQuizData.categories : {};
          const tempSettings = interactiveQuizData && interactiveQuizData.settings ? interactiveQuizData.settings : {};
          interactiveQuizData = { categories: tempCategories, settings: tempSettings, highScores: [] };
        }
      } else {
        interactiveQuizData = { categories: {}, settings: {}, highScores: [] };
      }
      if (!interactiveQuizData.highScores) {
        interactiveQuizData.highScores = [];
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
    widenQuizContainer();
    loadQuizConfigAndQuestions().then(result => {
        if (result.error) {
            console.error("Quiz initialization failed:", result.message);
        } else {
            console.log("Quiz started successfully.");
        }
    }).catch(err => {
        console.error("Unhandled error during quiz setup:", err);
        if (questionTextElement) {
            questionTextElement.textContent = "⚠️ An unexpected error occurred while starting the quiz.";
        }
    });
} else {
    if (questionTextElement) {
        questionTextElement.textContent = "⚠️ Quiz category or user name not specified. Please start from the home page.";
    }
    console.error("Category or User Name missing from URL parameters.");
}
