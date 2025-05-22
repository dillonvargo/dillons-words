class SentenceWordle {
    constructor() {
        this.maxAttempts = 6;
        this.currentAttempt = 0;
        this.currentWord = 0;
        this.currentPosition = 0;
        this.targetWords = [];
        this.guessedLetters = {};
        this.gameOver = false;
        this.gameWon = false;
        this.currentLevel = 1;
        this.highestLevel = parseInt(localStorage.getItem('highestLevel') || '1');
        this.hintUsed = false;

        this.boardContainer = document.querySelector('.board-container');
        this.messageElement = document.getElementById('message');
        this.modal = document.querySelector('.game-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.answerReveal = document.getElementById('answer-reveal');
        this.playAgainButton = document.getElementById('play-again');
        this.levelDisplay = document.getElementById('level-display');
        this.hintButton = document.getElementById('hint-button');

        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        // Get words for the current level
        this.targetWords = getWordsForLevel(this.currentLevel);
        
        // Update level display
        if (this.levelDisplay) {
            this.levelDisplay.textContent = `Level ${this.currentLevel}`;
        }
        
        // Reset game state
        this.currentAttempt = 0;
        this.currentWord = 0;
        this.currentPosition = 0;
        this.guessedLetters = {};
        this.gameOver = false;
        this.gameWon = false;
        this.hintUsed = false;
        
        // Reset hint button
        if (this.hintButton) {
            this.hintButton.disabled = false;
            this.hintButton.textContent = 'Get Hint (1 per level)';
        }
        
        // Clear the board
        this.boardContainer.innerHTML = '';
        
        // Create the game board
        this.createBoard();
        
        // Clear message
        this.showMessage('');
        
        // Reset keyboard colors
        document.querySelectorAll('.key').forEach(key => {
            key.className = 'key';
        });
        
        // Show level info
        // Determine word length based on level
        let wordLength;
        if (this.currentLevel === 1) {
            wordLength = 4;
        } else if (this.currentLevel === 2) {
            wordLength = 5;
        } else if (this.currentLevel === 3) {
            wordLength = 6;
        } else {
            wordLength = 7;
        }
        
        // Determine word count based on level
        let wordCount;
        if (this.currentLevel <= 3) {
            wordCount = 1;
        } else if (this.currentLevel <= 6) {
            wordCount = 2;
        } else if (this.currentLevel <= 9) {
            wordCount = 3;
        } else {
            wordCount = 4;
        }
        
        this.showMessage(`Level ${this.currentLevel}: ${wordCount} word${wordCount > 1 ? 's' : ''} with ${wordLength} letters each`, 5000);
    }

    createBoard() {
        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            
            let letterIndex = 0;
            for (let word = 0; word < this.targetWords.length; word++) {
                // Add tiles for each letter in the word
                for (let i = 0; i < this.targetWords[word].length; i++) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.dataset.attempt = attempt;
                    tile.dataset.word = word;
                    tile.dataset.position = i;
                    row.appendChild(tile);
                    letterIndex++;
                }
                
                // Add a space tile between words (except after the last word)
                if (word < this.targetWords.length - 1) {
                    const spaceTile = document.createElement('div');
                    spaceTile.className = 'tile space-tile';
                    row.appendChild(spaceTile);
                }
            }
            
            this.boardContainer.appendChild(row);
        }
    }

    setupEventListeners() {
        // Physical keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            const key = e.key.toLowerCase();
            
            if (key === 'enter') {
                this.submitGuess();
            } else if (key === 'backspace') {
                this.deleteLetter();
            } else if (key === ' ') {
                this.addSpace();
            } else if (/^[a-z]$/.test(key)) {
                this.addLetter(key);
            }
        });
        
        // On-screen keyboard input
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                if (this.gameOver) return;
                
                const keyValue = key.dataset.key;
                
                if (keyValue === 'enter') {
                    this.submitGuess();
                } else if (keyValue === 'backspace') {
                    this.deleteLetter();
                } else if (keyValue === ' ') {
                    this.addSpace();
                } else {
                    this.addLetter(keyValue);
                }
            });
        });
        
        // Play again button
        this.playAgainButton.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.initGame();
        });
        
        // Hint button
        if (this.hintButton) {
            this.hintButton.addEventListener('click', () => {
                this.giveHint();
            });
        }
    }
    
    giveHint() {
        if (this.gameOver || this.hintUsed) return;
        
        // Mark hint as used
        this.hintUsed = true;
        this.hintButton.disabled = true;
        this.hintButton.textContent = 'Hint Used';
        
        // Find a random position in the current word that hasn't been guessed yet
        const currentWordTarget = this.targetWords[this.currentWord];
        const emptyPositions = [];
        
        for (let i = 0; i < currentWordTarget.length; i++) {
            const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${i}"]`);
            if (!tile.textContent) {
                emptyPositions.push(i);
            }
        }
        
        if (emptyPositions.length === 0) {
            // If current word is complete, try to find the next incomplete word
            for (let word = this.currentWord + 1; word < this.targetWords.length; word++) {
                const firstTile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${word}"][data-position="0"]`);
                if (firstTile && !firstTile.textContent) {
                    // Reveal the first letter of the next word
                    firstTile.textContent = this.targetWords[word][0];
                    firstTile.setAttribute('data-hinted', 'true'); // Mark this as a hinted tile
                    
                    // Move to the beginning of this word
                    this.currentWord = word;
                    this.currentPosition = 1; // Start after the revealed letter
                    
                    this.showMessage('Hint: First letter of next word revealed', 3000);
                    return;
                }
            }
            
            this.showMessage('No more letters to hint', 3000);
            return;
        }
        
        // Choose a random empty position
        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        const positionToReveal = emptyPositions[randomIndex];
        
        // Reveal the letter
        const letterToReveal = currentWordTarget[positionToReveal];
        const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${positionToReveal}"]`);
        tile.textContent = letterToReveal;
        tile.setAttribute('data-hinted', 'true'); // Mark this as a hinted tile
        
        // Reset cursor to beginning of the current word
        this.currentPosition = 0;
        
        this.showMessage(`Hint: Letter '${letterToReveal}' revealed. Cursor reset to start of word.`, 3000);
    }

    getCurrentTile() {
        if (this.currentWord >= this.targetWords.length) return null;
        
        return document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${this.currentPosition}"]`);
    }

    addLetter(letter) {
        if (this.currentWord >= this.targetWords.length) return;
        if (this.currentPosition >= this.targetWords[this.currentWord].length) return;
        
        // Check if the current tile already has a letter (from a hint)
        let tile = this.getCurrentTile();
        
        // If the current tile already has a letter, find the next empty tile
        while (tile && (tile.textContent || this.isHintedTile(tile))) {
            this.currentPosition++;
            
            // If we've reached the end of the word, move to the next word
            if (this.currentPosition >= this.targetWords[this.currentWord].length) {
                if (this.currentWord < this.targetWords.length - 1) {
                    this.currentWord++;
                    this.currentPosition = 0;
                } else {
                    // We've reached the end of all words
                    return;
                }
            }
            
            tile = this.getCurrentTile();
        }
        
        // Now we have an empty tile or we've reached the end
        if (tile) {
            tile.textContent = letter;
            this.currentPosition++;
            
            // Skip over any hinted tiles
            while (this.currentPosition < this.targetWords[this.currentWord].length) {
                const nextTile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${this.currentPosition}"]`);
                if (nextTile && this.isHintedTile(nextTile)) {
                    this.currentPosition++;
                } else {
                    break;
                }
            }
            
            // Move to next word if we've completed the current word
            if (this.currentPosition >= this.targetWords[this.currentWord].length) {
                if (this.currentWord < this.targetWords.length - 1) {
                    this.currentWord++;
                    this.currentPosition = 0;
                    
                    // Skip over any hinted tiles in the new word
                    while (this.currentPosition < this.targetWords[this.currentWord].length) {
                        const nextTile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${this.currentPosition}"]`);
                        if (nextTile && this.isHintedTile(nextTile)) {
                            this.currentPosition++;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    addSpace() {
        // Move to the next word if not at the last word
        if (this.currentWord < this.targetWords.length - 1) {
            this.currentWord++;
            this.currentPosition = 0;
        }
    }

    deleteLetter() {
        // If at the start of a word and not the first word, go back to previous word
        if (this.currentPosition === 0 && this.currentWord > 0) {
            this.currentWord--;
            this.currentPosition = this.targetWords[this.currentWord].length;
        }
        
        // Delete the letter
        if (this.currentPosition > 0) {
            // Find the previous position that has a user-entered letter (not a hint)
            let pos = this.currentPosition - 1;
            let foundUserLetter = false;
            
            while (pos >= 0 && !foundUserLetter) {
                const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${this.currentWord}"][data-position="${pos}"]`);
                
                // If this is a user-entered letter (not a hint), we can delete it
                if (tile && tile.textContent && !this.isHintedTile(tile)) {
                    tile.textContent = '';
                    this.currentPosition = pos;
                    foundUserLetter = true;
                } else {
                    // Move to the previous position
                    pos--;
                }
            }
            
            // If we didn't find a user-entered letter, just move the cursor back
            if (!foundUserLetter) {
                this.currentPosition--;
            }
        }
    }
    
    isHintedTile(tile) {
        // For simplicity, we'll mark hinted tiles with a data attribute
        return tile.hasAttribute('data-hinted');
    }

    submitGuess() {
        // Check if the guess is complete
        if (!this.isGuessComplete()) {
            this.showMessage('Complete all words first!');
            return;
        }
        
        // Get the guessed words
        const guessedWords = [];
        for (let word = 0; word < this.targetWords.length; word++) {
            let guessedWord = '';
            for (let i = 0; i < this.targetWords[word].length; i++) {
                const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${word}"][data-position="${i}"]`);
                guessedWord += tile.textContent;
            }
            guessedWords.push(guessedWord);
        }
        
        // Check the guess
        this.checkGuess(guessedWords);
        
        // Move to the next attempt
        this.currentAttempt++;
        this.currentWord = 0;
        this.currentPosition = 0;
        
        // Check if game is over
        if (this.gameWon) {
            this.endGame(true);
        } else if (this.currentAttempt >= this.maxAttempts) {
            this.endGame(false);
        }
    }

    isGuessComplete() {
        for (let word = 0; word < this.targetWords.length; word++) {
            for (let i = 0; i < this.targetWords[word].length; i++) {
                const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${word}"][data-position="${i}"]`);
                if (!tile.textContent) {
                    return false;
                }
            }
        }
        return true;
    }

    checkGuess(guessedWords) {
        let allCorrect = true;
        
        for (let word = 0; word < this.targetWords.length; word++) {
            const targetWord = this.targetWords[word];
            const guessedWord = guessedWords[word];
            
            // Create a map of remaining letters in the target word
            const remainingLetters = {};
            for (let i = 0; i < targetWord.length; i++) {
                const letter = targetWord[i];
                remainingLetters[letter] = (remainingLetters[letter] || 0) + 1;
            }
            
            // First pass: mark correct letters
            for (let i = 0; i < targetWord.length; i++) {
                const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${word}"][data-position="${i}"]`);
                const guessedLetter = guessedWord[i];
                const targetLetter = targetWord[i];
                
                if (guessedLetter === targetLetter) {
                    tile.classList.add('correct');
                    this.updateKeyboardColor(guessedLetter, 'correct');
                    remainingLetters[guessedLetter]--;
                }
            }
            
            // Second pass: mark present and absent letters
            for (let i = 0; i < targetWord.length; i++) {
                const tile = document.querySelector(`.tile[data-attempt="${this.currentAttempt}"][data-word="${word}"][data-position="${i}"]`);
                const guessedLetter = guessedWord[i];
                const targetLetter = targetWord[i];
                
                if (guessedLetter !== targetLetter) {
                    if (remainingLetters[guessedLetter] > 0) {
                        tile.classList.add('present');
                        this.updateKeyboardColor(guessedLetter, 'present');
                        remainingLetters[guessedLetter]--;
                    } else {
                        tile.classList.add('absent');
                        this.updateKeyboardColor(guessedLetter, 'absent');
                    }
                    allCorrect = false;
                }
            }
        }
        
        this.gameWon = allCorrect;
    }

    updateKeyboardColor(letter, status) {
        if (letter === ' ') return;
        
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        if (!key) return;
        
        // Only update if the new status is more important
        // (correct > present > absent)
        if (key.classList.contains('correct')) {
            return;
        }
        
        if (key.classList.contains('present') && status !== 'correct') {
            return;
        }
        
        // Remove existing status classes
        key.classList.remove('correct', 'present', 'absent');
        
        // Add the new status class
        key.classList.add(status);
    }

    showMessage(message, duration = 3000) {
        this.messageElement.textContent = message;
        
        // Clear message after specified duration
        if (message) {
            setTimeout(() => {
                this.messageElement.textContent = '';
            }, duration);
        }
    }

    endGame(won) {
        this.gameOver = true;
        
        if (won) {
            // Level up when winning
            this.currentLevel++;
            
            // Update highest level if needed
            if (this.currentLevel > this.highestLevel) {
                this.highestLevel = this.currentLevel;
                localStorage.setItem('highestLevel', this.highestLevel.toString());
            }
            
            this.modalTitle.textContent = 'Level Complete!';
            this.modalMessage.textContent = `You solved level ${this.currentLevel - 1} in ${this.currentAttempt} ${this.currentAttempt === 1 ? 'try' : 'tries'}!`;
            this.playAgainButton.textContent = 'Next Level';
        } else {
            this.modalTitle.textContent = 'Game Over';
            this.modalMessage.textContent = 'Better luck next time!';
            this.playAgainButton.textContent = 'Try Again';
        }
        
        // Display the target words
        this.answerReveal.textContent = `The answer was: "${this.targetWords.join(' ')}"`;
        this.modal.classList.remove('hidden');
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SentenceWordle();
});
