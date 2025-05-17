


const maxQuestionsConfigInput = document.getElementById('maxQuestionsConfig');
const adminCategorySelect = document.getElementById('adminCategorySelect');
const newCategoryNameInput = document.getElementById('newCategoryName');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const removeCategoryBtn = document.getElementById('removeCategoryBtn');
const searchQuestionInputAdmin = document.getElementById('searchQuestionInputAdmin');
const questionSearchResults = document.getElementById('questionSearchResults');
const searchHelperText = document.getElementById('searchHelperText'); 
const formActionTitle = document.getElementById('formActionTitle');
const questionTextAdminInput = document.getElementById('questionTextAdmin');
const optionInputsAdmin = [
    document.getElementById('option1Admin'),
    document.getElementById('option2Admin'),
    document.getElementById('option3Admin'),
    document.getElementById('option4Admin')
];
const addOrUpdateQuestionBtn = document.getElementById('addOrUpdateQuestionBtn'); 
const deleteLoadedQuestionBtn = document.getElementById('deleteLoadedQuestionBtn');
const clearQuestionFormBtn = document.getElementById('clearQuestionFormBtn');
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

let editingQuestionId = null; 
let currentEditingCategory = null; 

function saveData() {
    try {
        localStorage.setItem('interactiveQuizData', JSON.stringify(quizData));
        console.log("Data saved to localStorage.");
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
        showAdminFeedback("Error saving data. localStorage might be full or disabled.", true);
    }
}

async function loadData() {
    const storedDataString = localStorage.getItem('interactiveQuizData');
    let successfullyLoadedFromStorage = false;
    const fallbackCategories = { 
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
    };

    if (storedDataString) {
        try {
            const parsedData = JSON.parse(storedDataString);
            if (parsedData.categories && Object.keys(parsedData.categories).length > 0) {
                quizData.categories = parsedData.categories;
                quizData.settings = { ...quizData.settings, ...(parsedData.settings || {}) };
                quizData.highScores = parsedData.highScores || [];
                quizData.userProgress = parsedData.userProgress || {};
                successfullyLoadedFromStorage = true;
                console.log("Data loaded from localStorage.");
            }
        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
        }
    }

    if (!successfullyLoadedFromStorage) {
        console.log("localStorage empty or categories missing, attempting to fetch data.json...");
        try {
            const response = await fetch('data.json'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const jsonData = await response.json();
            if (jsonData && jsonData.categories && Object.keys(jsonData.categories).length > 0) {
                quizData.categories = jsonData.categories;
                quizData.settings = { ...quizData.settings, ...(jsonData.settings || {}) };
                quizData.highScores = jsonData.highScores || [];
                quizData.userProgress = jsonData.userProgress || {};
                console.log("Data loaded from data.json.");
            } else {
                console.warn("data.json fetched but structure is invalid or categories missing. Using fallback.");
                quizData.categories = { ...fallbackCategories };
            }
        } catch (error) {
            console.error("Failed to fetch or parse data.json:", error);
            console.log("Using fallback default categories.");
            quizData.categories = { ...fallbackCategories };
            quizData.settings = { maxQuestionsPerQuiz: 15 };
            quizData.highScores = [];
            quizData.userProgress = {};
        }
    }
    
    quizData.settings.maxQuestionsPerQuiz = quizData.settings.maxQuestionsPerQuiz || 15;
    if (maxQuestionsConfigInput) {
        maxQuestionsConfigInput.value = quizData.settings.maxQuestionsPerQuiz;
    }
    populateCategories();
}


function populateCategories() {
    if (!adminCategorySelect) return;
    const currentCategoryValue = adminCategorySelect.value; 
    adminCategorySelect.innerHTML = ''; 

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Category --";
    defaultOption.selected = true; 
    adminCategorySelect.appendChild(defaultOption);

    const categoryNames = Object.keys(quizData.categories);

    if (categoryNames.length === 0) {
        if (removeCategoryBtn) removeCategoryBtn.disabled = true;
    } else {
        if (removeCategoryBtn) removeCategoryBtn.disabled = false;
        categoryNames.forEach(categoryName => {
            const option = document.createElement('option');
            option.value = categoryName;
            option.textContent = categoryName;
            adminCategorySelect.appendChild(option);
        });
        if (quizData.categories[currentCategoryValue]) {
            adminCategorySelect.value = currentCategoryValue;
        } else {
            adminCategorySelect.value = ""; 
        }
    }
    if(searchQuestionInputAdmin) searchQuestionInputAdmin.value = "";
    displayQuestionSearchResults([]); 
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

    if (newCategory === "") { 
        showAdminFeedback("Category name cannot be empty.", true);
        return;
    }
    if (quizData.categories[newCategory]) {
        showAdminFeedback(`Category "${newCategory}" already exists.`, true);
        return;
    }
    
    quizData.categories[newCategory] = [];
    saveData();
    populateCategories();
    adminCategorySelect.value = newCategory; 
    if(searchQuestionInputAdmin) searchQuestionInputAdmin.value = ""; 
    displayQuestionSearchResults([]); 
    newCategoryNameInput.value = '';
    showAdminFeedback(`Category "${newCategory}" added successfully.`);
}

function handleRemoveCategory() {
    if (!adminCategorySelect) return;
    const categoryToRemove = adminCategorySelect.value;

    if (!categoryToRemove || categoryToRemove === "") { 
        showAdminFeedback("Please select a category to remove.", true);
        return;
    }
    
    delete quizData.categories[categoryToRemove];

    for (const key in quizData.userProgress) {
        if (key.endsWith(`_${categoryToRemove}`)) {
            delete quizData.userProgress[key];
        }
    }
    quizData.highScores = quizData.highScores.filter(hs => hs.category !== categoryToRemove);

    saveData();
    populateCategories(); 
    showAdminFeedback(`Category "${categoryToRemove}" and all its associated data have been removed.`);
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

function resetQuestionForm(isAdding = true) {
    questionTextAdminInput.value = '';
    optionInputsAdmin.forEach(input => input.value = '');
    editingQuestionId = null;
    currentEditingCategory = null;
    addOrUpdateQuestionBtn.textContent = isAdding ? "Add Question" : "Update Question";
    formActionTitle.textContent = isAdding ? "Add New Question:" : "Edit Question:";
    deleteLoadedQuestionBtn.style.display = 'none';
    clearQuestionFormBtn.style.display = 'none';
    if(adminCategorySelect) adminCategorySelect.disabled = false; 
    if(searchQuestionInputAdmin) searchQuestionInputAdmin.disabled = false; 
}

function handleAddOrUpdateQuestion() {
    if (!adminCategorySelect || !questionTextAdminInput) return;

    const category = editingQuestionId ? currentEditingCategory : adminCategorySelect.value; 
    const questionText = questionTextAdminInput.value.trim();
    const options = optionInputsAdmin.map(input => input.value.trim()).filter(opt => opt !== "");

    if (!category || category === "") { 
        showAdminFeedback("Please select a category for the question.", true);
        return;
    }
    if (!questionText) {
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

    if (editingQuestionId) {
        if (!quizData.categories[category]) { 
            showAdminFeedback("Error: Category for editing question not found.", true);
            resetQuestionForm();
            return;
        }
        const questionIndex = quizData.categories[category].findIndex(q => q.id === editingQuestionId);
        if (questionIndex > -1) {
            quizData.categories[category][questionIndex] = {
                ...quizData.categories[category][questionIndex], 
                question: questionText,
                options: options,
                answer: options[0]
            };
            showAdminFeedback(`Question "${editingQuestionId}" updated successfully in "${category}"!`);
        } else {
            showAdminFeedback(`Error: Could not find question with ID "${editingQuestionId}" to update.`, true);
        }
    } else {
        const newQuestion = {
            id: getNextQuestionId(),
            question: questionText,
            options: options,
            answer: options[0] 
        };
        quizData.categories[category].push(newQuestion);
        showAdminFeedback(`Question added successfully to "${category}"!`);
    }
    
    saveData();
    resetQuestionForm();
    if (searchQuestionInputAdmin && searchQuestionInputAdmin.value.trim() !== "") {
        handleQuestionSearch();
    } else {
        displayQuestionSearchResults([]);
    }
}

function displayQuestionSearchResults(results, categoryName) {
    if (!questionSearchResults || !searchHelperText) return;
    
    questionSearchResults.innerHTML = ''; 

    if (results.length === 0) {
        if (searchQuestionInputAdmin && searchQuestionInputAdmin.value.trim() !== "") {
            searchHelperText.textContent = `No questions found matching your search in "${categoryName}".`;
        } else if (categoryName && categoryName !== "") {
             searchHelperText.textContent = `No questions in "${categoryName}". Add some or try searching.`;
        } else {
            searchHelperText.textContent = "Select a category and type to search for questions.";
        }
        searchHelperText.style.display = 'block';
        return;
    }

    searchHelperText.style.display = 'none';

    results.forEach(q => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-2 border-b border-gray-200 flex justify-between items-center text-sm cursor-pointer hover:bg-gray-100';
        itemDiv.title = "Click to load for editing/deletion";

        const questionSpan = document.createElement('span');
        questionSpan.className = 'question-text-display flex-1 mr-2 text-gray-700';
        questionSpan.textContent = q.question.length > 60 ? q.question.substring(0, 57) + "..." : q.question; 
        itemDiv.appendChild(questionSpan);
        itemDiv.addEventListener('click', () => loadQuestionForEditing(q.id, categoryName));

        questionSearchResults.appendChild(itemDiv);
    });
}

function loadQuestionForEditing(questionId, categoryName) {
    const questionToEdit = quizData.categories[categoryName]?.find(q => q.id === questionId);
    if (!questionToEdit) {
        showAdminFeedback("Error: Question not found.", true);
        return;
    }

    formActionTitle.textContent = `Edit Question (ID: ${questionId}):`;
    questionTextAdminInput.value = questionToEdit.question;
    optionInputsAdmin.forEach((input, index) => {
        input.value = questionToEdit.options[index] || ""; 
    });
    
    editingQuestionId = questionId;
    currentEditingCategory = categoryName; 
    addOrUpdateQuestionBtn.textContent = "Update Question";
    deleteLoadedQuestionBtn.style.display = 'inline-block'; 
    clearQuestionFormBtn.style.display = 'inline-block'; 

    adminCategorySelect.value = categoryName; 
    adminCategorySelect.disabled = true; 
    searchQuestionInputAdmin.disabled = true; 
    questionTextAdminInput.focus(); 
}

function handleDeleteLoadedQuestion() {
    if (!editingQuestionId || !currentEditingCategory) {
        showAdminFeedback("No question loaded for deletion.", true);
        return;
    }

    const categoryQuestions = quizData.categories[currentEditingCategory];
    if (categoryQuestions) {
        const questionIndex = categoryQuestions.findIndex(q => q.id === editingQuestionId);
        if (questionIndex > -1) {
            categoryQuestions.splice(questionIndex, 1);
            saveData();
            showAdminFeedback(`Question ID "${editingQuestionId}" deleted successfully from "${currentEditingCategory}".`);
            resetQuestionForm(); 
            if (searchQuestionInputAdmin && searchQuestionInputAdmin.value.trim() !== "") {
                handleQuestionSearch();
            } else {
                displayQuestionSearchResults([]);
            }
        } else {
            showAdminFeedback("Error: Question not found for deletion.", true);
        }
    } else {
         showAdminFeedback(`Error: Category "${currentEditingCategory}" not found.`, true);
    }
}

function handleQuestionSearch() {
    const searchTerm = searchQuestionInputAdmin.value.toLowerCase().trim();
    const selectedCategory = adminCategorySelect.value;

    if (!selectedCategory || selectedCategory === "") {
        displayQuestionSearchResults([]); 
        searchHelperText.textContent = "Please select a category to search within.";
        searchHelperText.style.display = 'block';
        return;
    }

    if (!searchTerm) {
        displayQuestionSearchResults([], selectedCategory); 
        return;
    }

    const questionsInCategory = quizData.categories[selectedCategory] || [];
    const matchedQuestions = questionsInCategory.filter(q => 
        q.question.toLowerCase().includes(searchTerm)
    );
    displayQuestionSearchResults(matchedQuestions, selectedCategory);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData(); 

    if (maxQuestionsConfigInput) {
        maxQuestionsConfigInput.addEventListener('change', handleMaxQuestionsConfigChange);
    }
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', handleAddCategory);
    }
    if (removeCategoryBtn) {
        removeCategoryBtn.addEventListener('click', handleRemoveCategory);
    }
    if (addOrUpdateQuestionBtn) { 
        addOrUpdateQuestionBtn.addEventListener('click', handleAddOrUpdateQuestion);
    }
    if (deleteLoadedQuestionBtn) {
        deleteLoadedQuestionBtn.addEventListener('click', handleDeleteLoadedQuestion);
    }
    if (clearQuestionFormBtn) {
        clearQuestionFormBtn.addEventListener('click', () => {
            resetQuestionForm();
            if (searchQuestionInputAdmin && searchQuestionInputAdmin.value.trim() !== "") {
                 handleQuestionSearch(); 
            } else {
                displayQuestionSearchResults([], adminCategorySelect.value); 
            }
        });
    }
    if (adminCategorySelect) {
        adminCategorySelect.addEventListener('change', (event) => {
            const selectedCategory = event.target.value;
            if (editingQuestionId) {
                showAdminFeedback("Question editing cancelled due to category change.", true);
            }
            resetQuestionForm(); 
            if(searchQuestionInputAdmin) searchQuestionInputAdmin.value = ""; 
            displayQuestionSearchResults([], selectedCategory); 
        });
    }
    if (searchQuestionInputAdmin) {
        searchQuestionInputAdmin.addEventListener('input', handleQuestionSearch);
    }

    resetQuestionForm(); 
    console.log("Admin panel JavaScript loaded and initialized.");
    console.log("Current quizData after loading:", quizData); 
});
