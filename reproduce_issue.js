
const STORAGE_KEY = 'omni-quiz-saved-games';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// Mock Types
const mockTeams = [
    { id: 1, name: 'Alpha', color: 'team-1', score: 100 },
    { id: 2, name: 'Beta', color: 'team-2', score: 200 }
];

const mockQuizData = {
    categories: ['Cat1'],
    questions: [[{ category: 'Cat1', value: 100, question: 'Q1', answer: 'A1', answered: false, answeredBy: null, answeredCorrectly: null }]]
};

// Implementation of gameStorage functions (copied from source)
const getSavedGames = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveGame = (gameName, teams, quizData) => {
    const savedGames = getSavedGames();
    const existingGameIndex = savedGames.findIndex(game => game.gameName === gameName);

    const gameData = {
        id: Date.now().toString(),
        gameName,
        teams,
        quizData,
        savedAt: new Date().toISOString(),
    };

    if (existingGameIndex !== -1) {
        savedGames[existingGameIndex] = gameData;
    } else {
        savedGames.push(gameData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
};

const loadGame = (gameName) => {
    const savedGames = getSavedGames();
    return savedGames.find(game => game.gameName === gameName) || null;
};

// Test Execution
console.log('--- Starting Test ---');

// 1. Save Game
console.log('Saving game...');
saveGame('Test Game', mockTeams, mockQuizData);

// 2. Verify Storage
const rawStorage = localStorage.getItem(STORAGE_KEY);
console.log('Raw Storage:', rawStorage);

// 3. Load Game
console.log('Loading game...');
const loadedGame = loadGame('Test Game');

if (loadedGame) {
    console.log('Game Loaded Successfully');
    console.log('Loaded Teams:', JSON.stringify(loadedGame.teams, null, 2));

    if (loadedGame.teams.length === 2 && loadedGame.teams[0].name === 'Alpha') {
        console.log('SUCCESS: Teams preserved correctly.');
    } else {
        console.error('FAILURE: Teams data mismatch.');
    }
} else {
    console.error('FAILURE: Could not load game.');
}
