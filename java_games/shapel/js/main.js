import { wordsList } from "./words.js"
import { letterShapeCodes, letterShapes } from "./letter_shapes.js"

//Add a trigger for when the document has finished loading.
document.addEventListener("DOMContentLoaded", () => {
    var pageName = (window.location.pathname).split("/").pop();
    
    const codeDict = {}
    let word = "shapel";
    let wordShape = "shspsh";

    const numLetters = 6;
    let numGuesses = 3;
    let mustBeWord = false;
    let randomWord = true;
    let showCorrect = false;
    let printShapeDistributions = false;

    let totalScore = 0;
    let numGames = 0;
    let numWins = 0;
    let points = 0;
    let cookiesList = [];
    loadData();

    chooseWord()

    createLetterSlots()

    let guessedWords = [[]]
    let keyboardCorrectness = []
    let nextSpace = 1;
    let guessedWordCount = 0;

    //Get a list of keys (buttons within an element with the 'keyboard-row' class)
    const keys = document.querySelectorAll('.keyboard-row button')

    let gameFinished = false;

    setupLetters()

    function chooseWord() {
        analyseWords();

        if (randomWord) {
            const randIndex = Math.floor(Math.random() * wordsList.length);
            word = wordsList[randIndex];
        }
        wordShape = wordCode(word);
        //console.log(word);
        const message = `There are ${codeDict[wordShape].length} words with this shape.`
        //console.log(message)
        const wordStats = document.getElementById("word-stats");
        wordStats.textContent = message;


        
        let matchingWords = "";
        for (let match of codeDict[wordShape]) {
            matchingWords += match + ", ";
        }
        //console.log(matchingWords);
    }

    function setupLetters()
    {
        for (let i = 0; i < 26; i++) {
            keyboardCorrectness.push("None");
        }
    }

    function wordCode(word) {
        let wordCode = "";
        for (const letter of word) {
            wordCode += letterCode(letter);
        }
        return wordCode;
    }

    function analyseWords()
    {
        for (const word of wordsList) {
            let code = wordCode(word);
            if (codeDict[code] === undefined) {
                codeDict[code] = [];
            }
            codeDict[code].push(word);
        }

        if (printShapeDistributions) {
            for (const key of Object.keys(codeDict)) {
                console.log(`${key}= ${codeDict[key]}`);
            }
        }
    }
    
    function loadData() {
        totalScore = loadValue("totalScore");
        numGames = loadValue("numGames");
        numWins = loadValue("numWins");
    }
    
    function updateValue(name, change) {
        let newValue = parseInt(localStorage.getItem(name)) + change;
        localStorage.setItem(name, newValue);
        return newValue;
    }

    function loadValue(name) {
        if (localStorage.getItem(name) === null) {
            localStorage.setItem(name, 0);
            return 0;
        }
        else {
            return parseInt(localStorage.getItem(name));
        }
    }

    function letterIndex(letter) {
        return (letter.charCodeAt(0) - 97);
    }

    function letterShape(letter) {
        return letterShapes[letter];
    }

    function letterCode(letter) {
        return letterShapeCodes[letter];
    }

    //Get the array of the current word (e.g. array of letters)
    function getCurrentWordArray() {
        const numberOfGuessedWords = guessedWords.length;
        return guessedWords[numberOfGuessedWords - 1]
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArray();

        const currentLetter = word.charAt((nextSpace - 1) % numLetters);
        const currentShape = letterShape(currentLetter);
        const addedShape = letterShape(letter);

        if (currentShape !== addedShape) {
            return;
        }

        if (currentWordArr && currentWordArr.length < numLetters) {
            currentWordArr.push(letter);

            const availableSpaceEl = document.getElementById(String(nextSpace));
            nextSpace = nextSpace + 1;

            availableSpaceEl.textContent = letter;
        }
    }

    function getWordCorrectness(currentWordArr) {
        const tempAnswerArr = word.split('');
        let correctnessArr = []

        //Check if each letter is in the correct place.
        for (let i = 0; i < tempAnswerArr.length; i++) {
            const letter = currentWordArr[i];
            if (letter === tempAnswerArr[i]) {
                correctnessArr.push("RightPlace");
                //Use up the letter if it is.
                tempAnswerArr[i] = "."
            }
            else {
                correctnessArr.push("NotInWord");
            }
        }

        //Check if each letter is in the correct place.
        for (let i = 0; i < currentWordArr.length; i++) {
            const letter = currentWordArr[i];
            if (correctnessArr[i] === "RightPlace") {
                continue;
            }
            for (let j = 0; j < currentWordArr.length; j++) {
                if (letter === tempAnswerArr[j]) {
                    correctnessArr[i] = "WrongPlace";
                    tempAnswerArr[j] = "."
                    break;
                }
            }
        }
        
        return correctnessArr;
    }

    function getTileColour(correctness) {

        if (correctness === "NotInWord") {
            return "rgb(204, 183, 174)"
        }
        
        if (correctness === "RightPlace") {
            return "rgb(90, 255, 21)";
        }

        if (correctness == "WrongPlace") {
            return "rgb(255, 209, 102)";
        }

        if (correctness == "Fail") {
            return "rgb(255, 59, 83)";
        }

        return "rgb(129, 131, 132);";
    }

    function updateCorrectness(currentCorrectness, newCorrectness) {
        
        if (currentCorrectness === "RightPlace" || newCorrectness === "RightPlace") {
            return "RightPlace";
        }

        if (currentCorrectness === "WrongPlace" || newCorrectness === "WrongPlace") {
            return "WrongPlace";
        }

        if (currentCorrectness === "NotInWord" || newCorrectness === "NotInWord") {
            return "NotInWord";
        }

        return "None";
    }

    function updateKeyboard(currentWord, correctnessArr) {
        //Add new letters to the guessed letters list.
        for (let i = 0; i < numLetters; ++i) {
            const index = (currentWord.charCodeAt(i) - 97);
            keyboardCorrectness[index] = updateCorrectness(keyboardCorrectness[index], correctnessArr[i])
        }

        //Change keyboard button colours if their letters have been used.
        for (let i = 0; i < keys.length; i++) {
            const letter = keys[i].getAttribute("data-key");
            
            if (letter === 'enter' || letter === 'del' || keyboardCorrectness[letterIndex(letter)] === "None") {
                continue;
            }

            let keyCorrectness = keyboardCorrectness[letterIndex(letter)];
            if (showCorrect === false && keyCorrectness === "RightPlace") {
                keyCorrectness = "WrongPlace";
            }

            keys[i].setAttribute("id", keyCorrectness);
        }
    }

    function handleSubmitWord() {
        if (gameFinished)
            return;
        //Get the current guess as an array of letters as strings.
        const currentWordArr = getCurrentWordArray();

        //Convert the array to a normal string.
        const currentWord = currentWordArr.join('');
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Cancel if the word is less than the num letters.
        if (currentWordArr.length !== numLetters || (!wordsList.includes(currentWord) && mustBeWord)) {
            for (let index = 0; index < numLetters; index++) {
                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);

                if (!letterEl.classList.contains("animate__headShake")){
                    letterEl.classList.add("animate__headShake");
                    
                    setTimeout(() => {
                        letterEl.classList.remove("animate__headShake");
                    }, 800)
                }
            }
            return;
        }

        //Get the correctness of the guess.
        const correctnessArr = getWordCorrectness(currentWordArr);
        updateKeyboard(currentWord, correctnessArr);

        if (currentWord === word) {
            //Display a message if the word is correct.
            gameFinished = true;
            points = 4 - guessedWordCount;
            correctAnimation(points);
            updateScore(points);
        }
        else if (guessedWords.length === numGuesses) {
            //Display the correct word if all guesses have been used.
            clueAnimation(currentWordArr, correctnessArr);
            failAnimation();
            if (allLettersFound()) {
                points = 1;
                updateScore(points);
            }
            else {
                points = 0;
                updateScore(points);
            }
        }
        else {
            clueAnimation(currentWordArr, correctnessArr);
        }

        //Increment the number of guesses used.
        guessedWordCount += 1;

        //Add the new guess to the guessed words list.
        guessedWords.push([])
    }

    function allLettersFound() {
        for (let i = 0; i < word.length; i++) {
            let letterCorrectness = keyboardCorrectness[word.charCodeAt(i) - 97];
            if (letterCorrectness != "RightPlace" && letterCorrectness != "WrongPlace") {
                return false;
            }
        }
        return true;
    }

    function updateScore(points) {
        if (points > 1) {
            numWins = updateValue("numWins", 1);
        }
        numGames = updateValue("numGames", 1);
        totalScore = updateValue("totalScore", points);
    }

    function correctAnimation(score) {
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Animate each letter to change into green, yellow or grey based on the correct word.
        const interval = 200;
        let wordArr = word.split("");
        wordArr.forEach((letter, index) => {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            setTimeout(() => {
                letterEl.classList.add("animate__flipInX");
                const tileColour = getTileColour("RightPlace");
                letterEl.style = `background-color:${tileColour};`;

            }, interval * index)
        });

        let endMessage = "hurray";
        if (score === 4) {
            endMessage = "superb";
        }
        else if (score === 3) {
            endMessage = "huzzah"
        }
        else if (score === 2) {
            endMessage = "crikey";
        }
        gameEndAnimation(endMessage);
    }

    function clueAnimation(currentWordArr, correctnessArr) {
        const firstLetterId = guessedWordCount * numLetters + 1;

        //Animate each letter to change into green, yellow or grey based on the correct word.
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            setTimeout(() => {
                letterEl.classList.add("animate__flipInX");
                let correctness = correctnessArr[index];
                if (correctness !== "NotInWord") {
                    if (showCorrect === false && correctness === "RightPlace") {
                        correctness = "WrongPlace";
                    }
                    const tileColour = getTileColour(correctness);
                    letterEl.style = `background-color:${tileColour};`;
                }

            }, interval * index)
        });
    }

    function failAnimation() {
        gameEndAnimation(word);
    }

    function gameEndAnimation(displayWord) {
        setTimeout(() => {
            let wordArr = displayWord.split("");
            let shapeArr = wordCode(displayWord);
            const interval = 200;
            const section = document.getElementById("replaceable-section");
            const keyboard = document.getElementById("keyboard-container")
            keyboard.classList.add("animate__animated");
            keyboard.classList.add("animate__fadeOut");
            setTimeout(() => {
                section.innerHTML = "";
                section.innerHTML = `
                <span id="results" class="animate__animated animate__fadeIn">
                    <div id="results-grid">
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                        <div class="result-shape"></div>
                    </div>
                </span>
                <span id="stats">
                    <div>Score: ${points}</div>
                    <div>Average score: ${Math.round((totalScore / numGames) * 10) / 10}</div>
                    <div>Games played: ${numGames}</div>
                    <div>Games won: ${numWins}</div>
                </span>
                <span id="controls">
                    <button class="post-game" data-key="new">New Shape</button>
                    <button class="post-game" data-key="words">See Words</button>
                </span>`;

                const resultShapes = section.getElementsByClassName("result-shape");
                Array.from(resultShapes).forEach((shape, index) => {
                    setTimeout(() => {
                        shape.classList.add("animate__animated");
                        shape.classList.add("animate__bounceInUp");
                        shape.classList.add(letterShapes[shapeArr[index]]);
                        shape.textContent = `${wordArr[index]}`
                    }, 300 + interval * index)
                });

                const buttons = section.getElementsByClassName("post-game");
                
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].onclick = ({ target }) => {                    
                        const action = target.getAttribute("data-key");
                        if (action === 'new') {
                            location.reload()
                            return;
                        }
                        if (action === 'words') {
                            //Show possible words for this shape.
                            return;
                        }
                    }
                }
            }, 1000)
        }, 1500)
    }

    function handleDeleteLetter() {
        if (gameFinished)
            return;

        const firstLetterId = guessedWordCount * numLetters + 1;
        if (nextSpace <= firstLetterId)
            return;
        const currentWordArr = getCurrentWordArray();
        currentWordArr.pop();

        guessedWords[guessedWords.length - 1] = currentWordArr;
        const deletedLetterEl = document.getElementById(String(nextSpace - 1));
        deletedLetterEl.textContent = "";
        nextSpace -= 1;
    }

    function createLetterSlots() {
        //Get the element with the 'board' id.
        const gameBoard = document.getElementById("board")

        for (let j = 0; j < numGuesses; j++) {
            for (let i = 0; i < numLetters; i++) {
                //Create a div element.
                let letterSlot = document.createElement("div");
                //Give it the correct class.
                const shape = letterShape(word.charAt(i));
                if (shape === "small") {
                    letterSlot.classList.add("small");
                }
                else if (shape === "high") {
                    letterSlot.classList.add("high");
                }
                else if (shape === "low") {
                    letterSlot.classList.add("low");
                }
                letterSlot.classList.add("animate__animated");
                //Set the id to index (+1).
                letterSlot.setAttribute("id", j * numLetters + i + 1);
                //Add the letter to the board.
                gameBoard.appendChild(letterSlot);
            }
        }
    }

    
    document.addEventListener('keydown', function(e) {
        if (gameFinished) {
            return;
        }
        let key = e.key;
        
        if (key === "Enter")
            handleSubmitWord();
        if (key === "Backspace" || key === "Delete")
            handleDeleteLetter();

        const code = key.charCodeAt(0) - 97
        if (code < 0 || code > 26)
            return;
        updateGuessedWords(key);
    });

    //Loop through each key, and give each an 'on click' event.
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i].getAttribute("data-key");
        const shape = letterShape(key);
        if (shape === "high") {
            keys[i].classList.add("high-button");
        }
        else if (shape === "low") {
            keys[i].classList.add("low-button");
        }
        else {
            keys[i].classList.add("small-button");
        }

        keys[i].onclick = ({ target }) => {
            if (gameFinished) {
                return;
            }
            
            //Store the key data of the clicked key.
            const key = target.getAttribute("data-key");
            
            if (key === 'enter') {
                handleSubmitWord();
                return;
            }

            if (key === 'del') {
                handleDeleteLetter();
                return;
            }

            updateGuessedWords(key);
        }
    }
})