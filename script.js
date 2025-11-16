// Game data
const gameData = {
    levels: [
        {
            image: "https://i.postimg.cc/yNdYWJwL/Screenshot-2025-11-16-15-56-25-71-84c9ef400ab248a2e4a3b31139e21163.jpg",
            word: "OM1"
        },
        {
            image: "https://i.postimg.cc/kGY4WG4b/Screenshot-2025-11-16-19-05-13-45-40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
            word: "Fabric"
        },
        {
            image: "https://i.postimg.cc/kXwNhvVY/Screenshot-2025-11-16-19-13-45-72-40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
            word: "AGI"
        },
        {
            image: "https://i.postimg.cc/hjgfBN6m/Screenshot-2025-11-16-19-08-20-75-40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
            word: "SDK"
        },
        {
            image: "https://i.postimg.cc/x1cmpDV2/Screenshot-2025-11-16-19-10-57-12-40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
            word: "API"
        }
    ],
    scores: {
        regular: 250,
        bonus: 375
    }
};

// Game state
let gameState = {
    currentLevel: 0,
    score: 0,
    username: "",
    timer: null,
    timeLeft: 30
};

// Get all screen elements
const landingPage = document.getElementById('landing-page');
const gameScreen = document.getElementById('game-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const gameCompleteScreen = document.getElementById('game-complete-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

// Show specific screen
function showScreen(screen) {
    // Hide all screens
    landingPage.classList.remove('active');
    gameScreen.classList.remove('active');
    levelCompleteScreen.classList.remove('active');
    gameCompleteScreen.classList.remove('active');
    leaderboardScreen.classList.remove('active');
    
    // Show the requested screen
    screen.classList.add('active');
}

// Start the game
function startGame() {
    console.log("Start game clicked");
    const username = document.getElementById('username').value.trim();
    
    if (!username) {
        alert('Please enter a username to start the game.');
        return;
    }
    
    gameState.username = username;
    gameState.currentLevel = 0;
    gameState.score = 0;
    
    showScreen(gameScreen);
    loadLevel();
}

// Load current level
function loadLevel() {
    console.log("Loading level:", gameState.currentLevel + 1);
    const level = gameData.levels[gameState.currentLevel];
    
    // Update UI
    document.getElementById('current-player').textContent = `Player: ${gameState.username}`;
    document.getElementById('current-score').textContent = `Score: ${gameState.score}`;
    document.getElementById('current-level').textContent = `Level ${gameState.currentLevel + 1}/5`;
    
    // Set image
    const gameImage = document.getElementById('game-image');
    gameImage.src = level.image;
    gameImage.alt = `Level ${gameState.currentLevel + 1} - Find the hidden word`;
    
    // Clear input and focus
    document.getElementById('word-input').value = '';
    document.getElementById('word-input').focus();
    
    // Start timer
    startTimer();
}

// Start the countdown timer
function startTimer() {
    gameState.timeLeft = 30;
    document.getElementById('timer').textContent = `${gameState.timeLeft}s`;
    document.getElementById('timer').classList.remove('timer-warning');
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        document.getElementById('timer').textContent = `${gameState.timeLeft}s`;
        
        // Add warning when time is running out
        if (gameState.timeLeft <= 10) {
            document.getElementById('timer').classList.add('timer-warning');
        }
        
        // Time's up
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeUp();
        }
    }, 1000);
}

// Handle time up
function timeUp() {
    alert('Time is up! Moving to next level.');
    nextLevel();
}

// Check if the answer is correct
function checkAnswer() {
    const userInput = document.getElementById('word-input').value.trim().toLowerCase();
    const correctWord = gameData.levels[gameState.currentLevel].word.toLowerCase();
    
    console.log("Checking answer:", userInput, "Correct:", correctWord);
    
    if (userInput === correctWord) {
        // Calculate points
        const isFinalLevel = gameState.currentLevel === gameData.levels.length - 1;
        const points = isFinalLevel ? gameData.scores.bonus : gameData.scores.regular;
        
        // Update score
        gameState.score += points;
        
        // Show level complete screen
        document.getElementById('found-word').textContent = gameData.levels[gameState.currentLevel].word;
        document.getElementById('points').textContent = points;
        showScreen(levelCompleteScreen);
        
        // Stop timer
        clearInterval(gameState.timer);
    } else {
        alert('Incorrect! Try again.');
        document.getElementById('word-input').value = '';
        document.getElementById('word-input').focus();
    }
}

// Move to next level
function nextLevel() {
    gameState.currentLevel++;
    
    if (gameState.currentLevel < gameData.levels.length) {
        showScreen(gameScreen);
        loadLevel();
    } else {
        // Game complete
        document.getElementById('total-points').textContent = gameState.score;
        showScreen(gameCompleteScreen);
        
        // Save score to leaderboard
        saveScore();
    }
}

// Reset the game
function resetGame() {
    showScreen(landingPage);
    document.getElementById('username').value = '';
    document.getElementById('username').focus();
}

// Show leaderboard
function showLeaderboard() {
    displayLeaderboard();
    showScreen(leaderboardScreen);
}

// Back to menu from leaderboard
function backToMenu() {
    showScreen(landingPage);
}

// Leaderboard functions
function loadLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('openmindLeaderboard')) || [];
    return leaderboard;
}

function saveScore() {
    const leaderboard = loadLeaderboard();
    
    // Add current score
    leaderboard.push({
        username: gameState.username,
        score: gameState.score,
        timestamp: new Date().toISOString()
    });
    
    // Sort by score (descending) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const topScores = leaderboard.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('openmindLeaderboard', JSON.stringify(topScores));
}

function displayLeaderboard() {
    const leaderboard = loadLeaderboard();
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p>No scores yet. Be the first to play!</p>';
        return;
    }
    
    let html = '';
    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        html += `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">${rank}</span>
                <span class="leaderboard-name">${entry.username}</span>
                <span class="leaderboard-score">${entry.score} pts</span>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// Auto-reset leaderboard after 2 hours
function checkLeaderboardReset() {
    const lastReset = localStorage.getItem('lastLeaderboardReset');
    const now = new Date().getTime();
    
    // If no reset time stored or 2 hours have passed, reset leaderboard
    if (!lastReset || (now - parseInt(lastReset)) > 2 * 60 * 60 * 1000) {
        localStorage.removeItem('openmindLeaderboard');
        localStorage.setItem('lastLeaderboardReset', now.toString());
    }
}

// Initialize event listeners when page loads
function initEventListeners() {
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('submit-word').addEventListener('click', checkAnswer);
    document.getElementById('next-level').addEventListener('click', nextLevel);
    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('view-leaderboard').addEventListener('click', showLeaderboard);
    document.getElementById('back-to-menu').addEventListener('click', backToMenu);
    
    // Enter key support
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') startGame();
    });
    
    document.getElementById('word-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkAnswer();
    });
}

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing game...");
    initEventListeners();
    checkLeaderboardReset();
    console.log("Game initialized successfully!");
});
