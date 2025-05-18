document.addEventListener('DOMContentLoaded', () => {
  const leaderboardListDisplayElem = document.getElementById('leaderboardListDisplay');
  let quizData = { highScores: [] }; 

  function loadHighScores() {
      const storedDataString = localStorage.getItem('interactiveQuizData');
      if (storedDataString) {
          try {
              const parsedData = JSON.parse(storedDataString);
              if (parsedData && Array.isArray(parsedData.highScores)) {
                  quizData.highScores = parsedData.highScores;
              } else {
                  console.warn("Leaderboard: No high scores array found in localStorage or data is malformed.");
              }
          } catch (e) {
              console.error("Leaderboard: Error parsing high scores from localStorage:", e);
          }
      } else {
          console.log("Leaderboard: No data found in localStorage.");
      }
  }

  function displayFullLeaderboard() {
      if (!leaderboardListDisplayElem) {
          console.error("Leaderboard display element not found.");
          return;
      }
      leaderboardListDisplayElem.innerHTML = ''; 

      if (quizData.highScores.length === 0) {
          leaderboardListDisplayElem.innerHTML = '<li class="text-gray-500 text-center py-4">No high scores recorded yet. Be the first!</li>';
          return;
      }

      quizData.highScores.sort((a, b) => {
          if (b.percentage !== a.percentage) {
              return b.percentage - a.percentage;
          }
          return b.score - a.score; 
      });
     
      quizData.highScores.forEach((entry, index) => {
          const li = document.createElement('li');
          li.className = 'leaderboard-item py-2 text-sm flex justify-between items-center border-b border-gray-200 last:border-b-0';
          
          const rankSpan = document.createElement('span');
          rankSpan.textContent = `#${index + 1}`;
          rankSpan.className = 'font-semibold w-8 text-left text-gray-600';

          const nameSpan = document.createElement('span');
          nameSpan.textContent = entry.name;
          nameSpan.className = 'flex-1 truncate px-1 text-left text-gray-700';
          
          const scoreSpan = document.createElement('span');
          scoreSpan.textContent = `${entry.score}/${entry.totalQuestions} (${entry.percentage}%)`;
          scoreSpan.className = 'w-24 text-right text-blue-600 font-medium';
          
          const categorySpan = document.createElement('span');
          categorySpan.textContent = entry.category;
          categorySpan.className = 'w-20 truncate text-right text-gray-500 hidden sm:inline';

          li.appendChild(rankSpan);
          li.appendChild(nameSpan);
          li.appendChild(scoreSpan);
          li.appendChild(categorySpan);
          leaderboardListDisplayElem.appendChild(li);
      });
  }

  loadHighScores();
  displayFullLeaderboard();
  console.log("Leaderboard page initialized.");
});

