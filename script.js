/*
TODO
- animations
- stats
- proper themes
*/

// choose random answer from list of potential answers
function generateAnswer() {
  return validWords[Math.floor(Math.random() * validWords.length)];
}

let answer = generateAnswer();

let wins = 0;
let losses = 0;
let giveUps = 0;

function showAnswer() {
  const answerElement = document.getElementById("answer");
  answerElement.textContent = `Answer: ${answer}`;
  answerElement.href = `https://www.merriam-webster.com/dictionary/${answer}`;
  answerElement.target = "_blank";
  giveUps++;
  // prevent user from attempting once answer is shown
  currentRow = N_ROWS + 1;
}

function giveUp() {
  giveUps++;
  showAnswer();
}

// create boxes for characters
const N_ROWS = 6;
const N_COLS = 5;

function createBox(row, col) {
  const box = document.createElement("div");
  box.classList.add("character");
  box.dataset.row = row;
  box.dataset.col = col;
  return box;
}

for (let i = 1; i <= N_ROWS; i++) {
  for (let j = 1; j <= N_COLS; j++) {
    document.getElementById("guesses").appendChild(createBox(i, j));
  }
}

// detect user input and modify boxes
let currentRow = 1;
let currentCol = 1;
const BACKSPACE_KEY = "Backspace";
const ENTER = "Enter";

function getCharElement(row, col) {
  return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function inputCharacter(character) {
  if (character === BACKSPACE_KEY && currentCol > 1) {
    currentCol--;
    getCharElement(currentRow, currentCol).textContent = "";
  } else if (/^([a-z]){1}$/.test(character) && currentCol <= N_COLS) {
    getCharElement(currentRow, currentCol).textContent =
      character.toUpperCase();
    currentCol++;
  } else if (character === ENTER && currentCol === N_COLS + 1) {
    let attempt = "";
    for (let i = 1; i <= N_COLS; i++) {
      attempt += getCharElement(currentRow, i).textContent;
    }

    if (!validWords.includes(attempt)) {
      alert(`${attempt} is not a valid Wordle attempt`);
      return;
    }

    for (let i = 1; i <= N_COLS; i++) {
      const attemptedChar = getCharElement(currentRow, i);

      const addToClassList = (classToAdd) => {
        attemptedChar.classList.add(classToAdd);
        Array.from(document.querySelectorAll("#keyboard .key"))
          .filter(
            (element) =>
              element.textContent.toUpperCase() === attemptedChar.textContent
          )[0]
          .classList.add(classToAdd);
      };

      if (attemptedChar.textContent === answer[i - 1]) {
        addToClassList("correct");
      } else if (answer.includes(attemptedChar.textContent)) {
        addToClassList("present");
      } else {
        addToClassList("absent");
      }
    }

    if (attempt === answer || currentRow === N_ROWS) {
      showAnswer();
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

document.addEventListener("keydown", (event) => inputCharacter(event.key));

// create virtual keyboard
const keyboardKeys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", BACKSPACE_KEY],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ENTER],
  ["z", "x", "c", "v", "b", "n", "m"],
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

document
  .querySelectorAll("button.key")
  .forEach((element) =>
    element.addEventListener("click", (event) =>
      inputCharacter(event.target.textContent)
    )
  );

// handling new game
function restart() {
  currentRow = 1;
  currentCol = 1;
  document.querySelectorAll(".character, .key").forEach((element) => {
    element.classList.remove("correct", "present", "absent");
  });
  document.querySelectorAll(".character").forEach((element) => {
    element.textContent = "";
  });
  document.getElementById("answer").textContent = "";
  answer = generateAnswer();
}

// extra features
function switchTheme() {
  if (document.body.classList.contains("darkmode")) {
    document.body.classList.remove("darkmode");
    document.getElementById("theme").textContent = "🌚";
  } else {
    document.body.classList.add("darkmode");
    document.getElementById("theme").textContent = "🌞";
  }
}

function showStats() {
  alert(`🥇: ${wins}\n💀: ${losses}\n🤷: ${giveUps} `);
}
