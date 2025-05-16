
const maxQuestionsConfigInput = document.getElementById('maxQuestionsConfig');
const adminCategorySelect = document.getElementById('adminCategorySelect');
const newCategoryNameInput = document.getElementById('newCategoryName');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const removeCategoryBtn = document.getElementById('removeCategoryBtn');
const questionTextAdminInput = document.getElementById('questionTextAdmin');
const optionInputsAdmin = [
    document.getElementById('option1Admin'),
    document.getElementById('option2Admin'),
    document.getElementById('option3Admin'),
    document.getElementById('option4Admin')
];
const addQuestionBtn = document.getElementById('addQuestionBtn');
const adminFeedback = document.getElementById('adminFeedback');


let quizData = {
    categories: {
        "HTML Fundamentals": [
            { id: "html1", question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperTransfer Markup Language", "HyperText and links Markup Language"], answer: "HyperText Markup Language" },
            { id: "html2", question: "Which HTML tag is used to define an internal style sheet?", options: ["<style>", "<script>", "<css>", "<link>"], answer: "<style>" }
            
        ],
        "Javascript Basics": [ 
            { id: "js1", question: "What keyword is used to declare a variable in JavaScript?", options: ["var", "let", "const", "all of the above"], answer: "all of the above" },
            { id: "js2", question: "Which company developed JavaScript?", options: ["Netscape", "Microsoft", "Sun Microsystems", "Google"], answer: "Netscape" }
            
        ],
        "CSS Flexbox": [
            { id: "flex1", question: "Which property is used to make a container a flex container?", options: ["display: flex;", "flex-direction: row;", "align-items: center;", "justify-content: space-between;"], answer: "display: flex;" },
            { id: "flex2", question: "What does `justify-content: center;` do in a flex container?", options: ["Aligns items to the center of the main axis", "Aligns items to the center of the cross axis", "Stretches items to fill the container", "Distributes space around items"], answer: "Aligns items to the center of the main axis" }
            
        ],
        "CSS Grid": [
            { id: "grid1", question: "Which property is used to make a container a grid container?", options: ["display: grid;", "grid-template-columns: auto;", "grid-gap: 10px;", "position: grid;"], answer: "display: grid;" },
            { id: "grid2", question: "How do you define three columns of equal width in CSS Grid?", options: ["grid-template-columns: 1fr 1fr 1fr;", "grid-columns: 3;", "columns: 1fr 1fr 1fr;", "grid-template: repeat(3, 1fr);"], answer: "grid-template-columns: 1fr 1fr 1fr;" }
            
        ]
    },
    settings: {
        maxQuestionsPerQuiz: 15 
    },
    highScores: [], 
    userProgress: {} 
};


function saveData() {
    try {
        localStorage.setItem('interactiveQuizData', JSON.stringify(quizData));
        console.log("Data saved to localStorage.");
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
        showAdminFeedback("Error saving data. localStorage might be full or disabled.", true);
    }
}

function loadData() {
    const storedData = localStorage.getItem('interactiveQuizData');
    const predefinedCategories = { 
        "HTML Fundamentals": quizData.categories["HTML Fundamentals"] || [], 
        "Javascript Basics": quizData.categories["Javascript Basics"] || [],
        "CSS Flexbox": quizData.categories["CSS Flexbox"] || [],
        "CSS Grid": quizData.categories["CSS Grid"] || []
    };

    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            quizData.categories = { ...predefinedCategories, ...(parsedData.categories || {}) };
            for (const catName in predefinedCategories) {
                if (!quizData.categories[catName]) {
                    quizData.categories[catName] = predefinedCategories[catName];
                }
            }

            quizData.settings = { ...{ maxQuestionsPerQuiz: 15 }, ...(parsedData.settings || {}) };
            quizData.highScores = parsedData.highScores || [];
            quizData.userProgress = parsedData.userProgress || {};
        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            quizData.categories = predefinedCategories;
            quizData.settings = { maxQuestionsPerQuiz: 15 };
            quizData.highScores = [];
            quizData.userProgress = {};
        }
    } else {
    }

    if (maxQuestionsConfigInput) {
        maxQuestionsConfigInput.value = quizData.settings.maxQuestionsPerQuiz;
    }
}

function populateCategories() {
    if (!adminCategorySelect) {
        console.error("Admin category select dropdown (#adminCategorySelect) not found in HTML.");
        return;
    }
    adminCategorySelect.innerHTML = ''; 

    const categoryNames = Object.keys(quizData.categories);

    if (categoryNames.length === 0) {
        adminCategorySelect.innerHTML = "<option value=''>No categories available</option>";
        if (removeCategoryBtn) removeCategoryBtn.disabled = true;
    } else {
        if (removeCategoryBtn) removeCategoryBtn.disabled = false;
        categoryNames.forEach(categoryName => {
            const option = document.createElement('option');
            option.value = categoryName;
            option.textContent = categoryName;
            adminCategorySelect.appendChild(option);
        });
    }
}

function showAdminFeedback(message, isError = false) {
    if (adminFeedback) {
        adminFeedback.textContent = message;
        adminFeedback.className = `text-sm text-center min-h-[20px] ${isError ? 'text-red-500' : 'text-green-500'}`;
        setTimeout(() => {
            if (adminFeedback) adminFeedback.textContent = '';
        }, 3000);
    }
}

function handleMaxQuestionsConfigChange() {
    if (!maxQuestionsConfigInput) return;
    const count = parseInt(maxQuestionsConfigInput.value);

    if (count > 0) {
        quizData.settings.maxQuestionsPerQuiz = count;
        saveData();
        showAdminFeedback(`Maximum questions per quiz set to ${count}.`);
    } else {
        maxQuestionsConfigInput.value = quizData.settings.maxQuestionsPerQuiz; 
        showAdminFeedback("Maximum questions must be at least 1.", true);
    }
}

function handleAddCategory() {
    if (!newCategoryNameInput) return;
    const newCategory = newCategoryNameInput.value.trim();

    if (newCategory && !quizData.categories[newCategory]) {
        quizData.categories[newCategory] = [];
        saveData();
        populateCategories();
        newCategoryNameInput.value = '';
        showAdminFeedback(`Category "${newCategory}" added successfully.`);
    } else if (quizData.categories[newCategory]) {
        showAdminFeedback(`Category "${newCategory}" already exists.`, true);
    } else {
        showAdminFeedback("Please enter a valid new category name.", true);
    }
}

function handleRemoveCategory() {
    if (!adminCategorySelect) return;
    const categoryToRemove = adminCategorySelect.value;

    if (!categoryToRemove) {
        showAdminFeedback("Please select a category to remove.", true);
        return;
    }

    if (confirm(`Are you sure you want to remove the category "${categoryToRemove}" and all its questions? This will also clear user progress and high scores for this category.`)) {
        delete quizData.categories[categoryToRemove];

        for (const key in quizData.userProgress) {
            if (key.endsWith(`_${categoryToRemove}`)) {
                delete quizData.userProgress[key];
            }
        }
        quizData.highScores = quizData.highScores.filter(hs => hs.category !== categoryToRemove);

        saveData();
        populateCategories();
        showAdminFeedback(`Category "${categoryToRemove}" removed successfully.`);
    }
}

function getNextQuestionId() {
    let maxIdNum = 0;
    Object.values(quizData.categories).flat().forEach(q => {
        if (q.id) {
            const numPart = parseInt(q.id.replace(/\D/g, ''), 10);
            if (!isNaN(numPart) && numPart > maxIdNum) {
                maxIdNum = numPart;
            }
        }
    });
    return `q${maxIdNum + 1}`;
}

function handleAddQuestion() {
    if (!adminCategorySelect || !questionTextAdminInput) return;

    const category = adminCategorySelect.value;
    const question = questionTextAdminInput.value.trim();
    const options = optionInputsAdmin.map(input => input.value.trim()).filter(opt => opt !== "");

    if (!category || category === "") { 
        showAdminFeedback("Please select a category for the question.", true);
        return;
    }
    if (!question) {
        showAdminFeedback("Please enter the question text.", true);
        return;
    }
    if (options.length < 2) {
        showAdminFeedback("Please provide at least two answer options (the correct answer and at least one distractor).", true);
        return;
    }
    if (!options[0]) {
        showAdminFeedback("The correct answer (Option 1) cannot be empty.", true);
        return;
    }

    const newQuestion = {
        id: getNextQuestionId(),
        question: question,
        options: options,
        answer: options[0] 
    };

    if (!quizData.categories[category]) {
        quizData.categories[category] = [];
    }
    quizData.categories[category].push(newQuestion);
    saveData();
    showAdminFeedback(`Question added successfully to "${category}"!`);

    questionTextAdminInput.value = '';
    optionInputsAdmin.forEach(input => input.value = '');
}


document.addEventListener('DOMContentLoaded', () => {
    loadData();

    populateCategories();
    if (maxQuestionsConfigInput) {
        maxQuestionsConfigInput.addEventListener('change', handleMaxQuestionsConfigChange);
    }
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', handleAddCategory);
    }
    if (removeCategoryBtn) {
        removeCategoryBtn.addEventListener('click', handleRemoveCategory);
    }
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', handleAddQuestion);
    }

    console.log("Admin panel JavaScript loaded and initialized.");
    console.log("Current quizData:", quizData); 
});

