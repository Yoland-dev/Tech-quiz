const category = "JavaScript Basics"; // change this to any valid category name
const NUM_QUESTIONS = 10;
let quizData = [];
let currentQuestionIndex = 0;

async function loadQuestions() {
  try {
    const res = await fetch("src/data.json");
    const data = await res.json();
    const categoryQuestions = data.categories[category];
    quizData = shuffleArray(categoryQuestions).slice(0, NUM_QUESTIONS);
    showQuestion();
  } catch (err) {
    document.getElementById("questionText").textContent = "⚠️ Failed to load quiz data.";
    console.error(err);
  }
}

function showQuestion() {
  const q = quizData[currentQuestionIndex];
  const total = quizData.length;

  document.getElementById("questionText").textContent = q.question;
  document.getElementById("questionCounter").textContent = `Question ${currentQuestionIndex + 1}/${total}`;
  document.getElementById("progressBar").style.width = `${((currentQuestionIndex + 1) / total) * 100}%`;

  const answerOptionsDiv = document.getElementById("answerOptions");
  answerOptionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200";
    btn.onclick = () => handleAnswer(option, q.answer);
    answerOptionsDiv.appendChild(btn);
  });

  document.getElementById("feedbackText").textContent = "";
}

function handleAnswer(selected, correct) {
  const feedback = document.getElementById("feedbackText");
  if (selected === correct) {
    feedback.textContent = "✅ Correct!";
    feedback.classList.remove("text-red-500");
    feedback.classList.add("text-green-500");
  } else {
    feedback.textContent = `❌ Incorrect! Correct answer: ${correct}`;
    feedback.classList.remove("text-green-500");
    feedback.classList.add("text-red-500");
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      showQuestion();
    } else {
      document.getElementById("questionText").textContent = "🎉 Quiz Complete!";
      document.getElementById("answerOptions").innerHTML = "";
      document.getElementById("feedbackText").textContent = "";
      document.getElementById("questionCounter").textContent = "";
    }
  }, 1500);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

loadQuestions();
