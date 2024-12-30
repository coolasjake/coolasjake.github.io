import { wordsList } from "./words.js"

//Add a trigger for when the document has finished loading.
document.addEventListener("DOMContentLoaded", () => {
    
    //Call the create squares function.
    createSquares()

    let guessedWords = [[]]
    let letterCorrectness = []
    let nextSpace = 1;

    let word = "amour";
    let guessedWordCount = 0;

    //Get a list of keys (buttons within an element with the 'keyboard-row' class)
    const keys = document.querySelectorAll('.keyboard-row button')

    let gameFinished = false;

    chooseWord()
    setupLetters()

    function chooseWord() {
        const randIndex = Math.floor(Math.random() * wordsList.length);
        word = wordsList[randIndex];
        console.log(word);
    }

    function setupLetters()
    {
        for (let i = 0; i < 26; i++) {
            letterCorrectness.push("None");
        }
    }

    function letterIndex(letter) {
        return (letter.charCodeAt(0) - 97);
    }

    //Get the array of the current word (e.g. array of 5 letters)
    function getCurrentWordArray() {
        const numberOfGuessedWords = guessedWords.length;
        return guessedWords[numberOfGuessedWords - 1]
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArray();

        if (currentWordArr && currentWordArr.length < 5) {
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
            return "rgb(58, 58, 60)"
        }
        
        if (correctness === "RightPlace") {
            return "rgb(83, 141, 78)";
        }

        if (correctness == "WrongPlace") {
            return "rgb(181, 159, 59)";
        }

        return "rgb(129, 131, 132);"
    }

    function updateKeyboard(currentWord, correctnessArr) {
        //Add new letters to the guessed letters list.
        for (let i = 0; i < 5; ++i) {
            const index = (currentWord.charCodeAt(i) - 97);
            if (letterCorrectness[index] === "RightPlace") {
                continue;
            }
            if (correctnessArr[i] === "RightPlace") {
                letterCorrectness[index] = "RightPlace"
                continue;
            }

            if (letterCorrectness[index] === "WrongPlace") {
                continue;
            }
            if (correctnessArr[i] === "WrongPlace") {
                letterCorrectness[index] = "WrongPlace"
                continue;
            }

            if (correctnessArr[i] === "NotInWord") {
                letterCorrectness[index] = "NotInWord"
                continue;
            }
        }

        //Change keyboard button colours if their letters have been used.
        
        for (let i = 0; i < keys.length; i++) {
            const letter = keys[i].getAttribute("data-key");
            
            if (letter === 'enter' || letter === 'del') {
                continue;
            }
            const tileColour = getTileColour(letterCorrectness[letterIndex(letter)]);
            keys[i].style = `background-color:${tileColour};border-color:${tileColour}`;
        }
    }

    function handleSubmitWord() {
        if (gameFinished)
            return;
        //Get the current guess as an array of letters as strings.
        const currentWordArr = getCurrentWordArray();

        //Convert the array to a normal string.
        const currentWord = currentWordArr.join('');
        const firstLetterId = guessedWordCount * 5 + 1;

        //Cancel if the word is less than 5 letters.
        if (currentWordArr.length !== 5 || !wordsList.includes(currentWord)) {
            for (let index = 0; index < 5; index++) {
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

        //Animate each letter to change into gree, yellow or grey based on the correct word.
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
                //Get the colour of this tile.
                const tileColour = getTileColour(correctnessArr[index]);

                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                letterEl.classList.add("animate__flipInX");
                letterEl.style = `background-color:${tileColour};border-color:${tileColour}`;

            }, interval * index)
        });

        //Increment the number of guesses used.
        guessedWordCount += 1;

        //Display a message if the word is correct.
        if (currentWord === word) {
            gameFinished = true;
        }
        
        //Display a message if all guesses have been used.
        if (guessedWords.length === 6) {
            gameFinished = true;
        }

        //Add the new guess to the guessed words list.
        guessedWords.push([])

        updateKeyboard(currentWord, correctnessArr);
    }

    function handleDeleteLetter() {
        if (gameFinished)
            return;

        const firstLetterId = guessedWordCount * 5 + 1;
        if (nextSpace <= firstLetterId)
            return;
        const currentWordArr = getCurrentWordArray();
        currentWordArr.pop();

        guessedWords[guessedWords.length - 1] = currentWordArr;
        const deletedLetterEl = document.getElementById(String(nextSpace - 1));
        deletedLetterEl.textContent = "";
        nextSpace -= 1;
    }

    function createSquares() {
        //Get the element with the 'board' id.
        const gameBoard = document.getElementById("board")

        //Loop through 0 to 30, and create a square in the board for each number.
        for (let index = 0; index < 30; index++) {
            //Create a div element.
            let square = document.createElement("div");
            //Give it the 'square' class.
            square.classList.add("square");
            square.classList.add("animate__animated");
            //Set the id to index (+1).
            square.setAttribute("id", index + 1);
            //Add the square to the board.
            gameBoard.appendChild(square);
        }
    }

    //Loop through each key, and give each an 'on click' event.
    for (let i = 0; i < keys.length; i++) {
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