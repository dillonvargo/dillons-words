// Word lists organized by length for progressive levels
const WORD_LISTS = {
    // 4-letter words (Level 1-5)
    4: [
        "bird", "fish", "jump", "swim", "walk", "talk", "sing", "play", "read", "work",
        "blue", "pink", "gold", "gray", "tall", "tiny", "huge", "cold", "warm", "cool"
    ],
    // 5-letter words (Level 6-10)
    5: [
        "happy", "smile", "dance", "laugh", "dream", "think", "sleep", "write", "speak", "learn",
        "green", "black", "white", "brown", "large", "small", "quick", "smart", "brave", "quiet"
    ],
    // 6-letter words (Level 16-20)
    6: [
        "wonder", "create", "design", "invent", "discover", "explore", "travel", "journey", "search", "listen",
        "yellow", "purple", "orange", "silver", "golden", "bright", "strong", "gentle", "clever", "joyful"
    ],
    // 7-letter words (Level 21-25)
    7: [
        "imagine", "believe", "achieve", "inspire", "develop", "improve", "succeed", "prosper", "nurture", "cherish",
        "crimson", "emerald", "sapphire", "glowing", "shining", "vibrant", "powerful", "graceful", "peaceful", "thankful"
    ]
};

// Function to get words for a specific level
function getWordsForLevel(level) {
    // Determine word length based on level
    // Level 1: 4 letters, Level 2: 5 letters, Level 3: 6 letters, Level 4+: 7 letters
    let wordLength;
    if (level === 1) {
        wordLength = 4;
    } else if (level === 2) {
        wordLength = 5;
    } else if (level === 3) {
        wordLength = 6;
    } else {
        wordLength = 7; // Maximum word length
    }
    
    // Determine word count based on level
    // Levels 1-3: 1 word, Levels 4-6: 2 words, Levels 7-9: 3 words, Level 10+: 4 words
    let wordCount;
    if (level <= 3) {
        wordCount = 1;
    } else if (level <= 6) {
        wordCount = 2;
    } else if (level <= 9) {
        wordCount = 3;
    } else {
        wordCount = 4;
    }
    
    const result = [];
    
    // Select random words of appropriate length
    for (let i = 0; i < wordCount; i++) {
        const wordPool = WORD_LISTS[wordLength];
        const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        result.push(randomWord);
    }
    
    return result;
}
