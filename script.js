/*
TODO
- animations
- better stats (streaks, % wins, etc.)
- more themes
- tests?
*/

// some constants to make life easier
const N_ROWS = 6;
const N_COLS = 5;
const BACKSPACE_KEY = "Backspace";
const ENTER = "Enter";

// initialise stuffs on page load
let answer = generateAnswer();
let wins = 0;
let losses = 0;
let giveUps = 0;
let currentRow = 1;
let currentCol = 1;

/** returns a random word from the list of potential answers (from `words.js`, loaded in `index.html`) */
function generateAnswer() {
  return validWords[Math.floor(Math.random() * validWords.length)];
}

/** returns a `div` for an individual character in the grid where attempts will be displayed
 * @param {number} row row in grid the `div` will be for
 * @param {number} col col in grid that the `div` will be for
 */
function createBox(row, col) {
  const box = document.createElement("div");
  box.classList.add("character");
  box.dataset.row = row;
  box.dataset.col = col;
  return box;
}

// create UI for where attempts will be displayed
for (let i = 1; i <= N_ROWS; i++) {
  for (let j = 1; j <= N_COLS; j++) {
    document.getElementById("guesses").appendChild(createBox(i, j));
  }
}

/** returns the correct box for the character needed
 * @param {number} row row the character is in
 * @param {number} col col the character is in
 */
function getCharElement(row, col) {
  return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

/** modifies the current character `div` based on user input
 * @param {string} character the character the user has input
 */
function inputCharacter(character) {
  // if Backspace and not at the start of the row, go back one col and delete the char there
  if (character === BACKSPACE_KEY && currentCol > 1) {
    currentCol--;
    getCharElement(currentRow, currentCol).textContent = "";
    // if input is an alphabet chars and not past the end of the row,
    // add the char to the current div and increment currentCol
  } else if (/^([a-z]){1}$/.test(character) && currentCol <= N_COLS) {
    getCharElement(currentRow, currentCol).textContent =
      character.toUpperCase();
    currentCol++;
    // if Enter and reached end of row, check the full attempt
  } else if (character === ENTER && currentCol === N_COLS + 1) {
    // first get the full attempt as a string
    let attempt = "";
    for (let i = 1; i <= N_COLS; i++) {
      attempt += getCharElement(currentRow, i).textContent;
    }

    // if attempt is not a valid word, don't accept it
    if (!validWords.includes(attempt)) {
      alert(`${attempt} is not a valid Wordle attempt`);
      return;
    }

    // go through each character of attempt and do stuff
    for (let i = 1; i <= N_COLS; i++) {
      const attemptedChar = getCharElement(currentRow, i);

      /** get corresponding keyboard key `div`
       * @param {string} character character to get the key for
       */
      function getCorrespondingKeyboardKey(character) {
        return Array.from(document.querySelectorAll("#keyboard .key")).filter(
          (element) => element.textContent.toUpperCase() === character
        )[0];
      }

      /** adds class to both the attempt box and the keyboard key
       * @param {string} classToAdd the class name to add
       */
      const addToClassList = (classToAdd) => {
        attemptedChar.classList.add(classToAdd);
        getCorrespondingKeyboardKey(attemptedChar.textContent).classList.add(
          classToAdd
        );
      };

      // first remove any previous classes (otherwise may conflict CSS)
      attemptedChar.classList.remove("correct", "present", "absent");
      getCorrespondingKeyboardKey(attemptedChar.textContent).classList.remove(
        "correct",
        "present",
        "absent"
      );

      // add the correct class depending on whether the character is in the answer and in the correct position,
      // in the answer but incorrect position, or not in the answer at all
      if (attemptedChar.textContent === answer[i - 1]) {
        addToClassList("correct");
      } else if (answer.includes(attemptedChar.textContent)) {
        addToClassList("present");
      } else {
        addToClassList("absent");
      }
    }

    // if attempt is correct answer or used up all attempts, show the answer and increment wins/losses
    if (attempt === answer || currentRow === N_ROWS) {
      endGame();
      if (attempt === answer) {
        wins++;
      } else {
        losses++;
      }
      return;
    }

    currentCol = 1;
    currentRow++;
  }
}

// attach `inputCharacter` event listener to document
document.addEventListener("keydown", (event) => inputCharacter(event.key));

// create UI for virtual keyboard
const keyboardKeys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ENTER],
  ["z", "x", "c", "v", "b", "n", "m", BACKSPACE_KEY],
];

for (const row of keyboardKeys) {
  const rowDiv = document.createElement("div");
  for (let i = 0; i < row.length; i++) {
    const keyButton = document.createElement("button");
    keyButton.classList.add("key");
    keyButton.textContent = row[i];
    rowDiv.appendChild(keyButton);
  }
  document.getElementById("keyboard").appendChild(rowDiv);
}

// attach event listeners to each key of virtual keyboard
document
  .querySelectorAll("button.key")
  .forEach((element) =>
    element.addEventListener("click", (event) =>
      inputCharacter(event.target.textContent)
    )
  );

/** ends the current round - displays answer, disables "give up" button, and prevents further user input for current round */
function endGame() {
  // display answer on screen
  const answerElement = document.getElementById("answer");
  answerElement.textContent = `Answer: ${answer}`;
  answerElement.href = `https://www.merriam-webster.com/dictionary/${answer}`;
  answerElement.target = "_blank";

  // disable "give up" button so can't spam button while answer is being shown
  document.getElementById("give-up").disabled = true;

  // prevent user from attempting once answer is shown
  currentRow = N_ROWS + 1;
}

/** increments `giveUps` count and ends the game */
function giveUp() {
  giveUps++;
  endGame();
}

/** starts a new round of the game - re-enables "give up" button, resets current character div, clears all previous data, and generates new answer */
function restart() {
  // re-enable "give up" button
  document.getElementById("give-up").disabled = false;

  // reset current box for character input
  currentRow = 1;
  currentCol = 1;

  // clear data from previous round
  document.querySelectorAll("#guesses .character, .key").forEach((element) => {
    element.classList.remove("correct", "present", "absent");
  });
  document.querySelectorAll("#guesses .character").forEach((element) => {
    element.textContent = "";
  });
  document.getElementById("answer").textContent = "";

  // generate new random answer
  answer = generateAnswer();
}

/** switches theme between dark and light modes */
function switchTheme() {
  if (document.body.classList.contains("darkmode")) {
    document.body.classList.remove("darkmode");
    document.getElementById("theme").textContent = "🌚";
  } else {
    document.body.classList.add("darkmode");
    document.getElementById("theme").textContent = "🌞";
  }
}

/** populates stats modal with current gameplay stats */
function populateStats() {
  document.getElementById(
    "stats-modal-body"
  ).innerHTML = `<p>🥇: ${wins}</p><p>💀: ${losses}</p><p>🤷‍♀️: ${giveUps}<p>`;
}
