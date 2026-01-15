const MAX_TRIES = 6;
let municipalities = [];
let solution = "";
let currentRow = 0;
let currentCol = 0;
let board = [];
let finished = false;

const stats = JSON.parse(localStorage.getItem("stats")) || {
  played: 0,
  wins: 0,
  streak: 0
};

const MUNICIPIOS_URL =
  "https://raw.githubusercontent.com/IagoLast/pselect/master/data/municipios.json";

municipalities = [
  "MADRID",
  "BARCELONA",
  "VALENCIA",
  "SEVILLA",
  "ZARAGOZA",
  "MALAGA",
  "MURCIA",
  "PALMA",
  "BILBAO",
  "VALLADOLID",
  "CORDOBA",
  "GRANADA",
  "ALMERIA",
  "TOLEDO",
  "SALAMANCA"
];

startGame();

function startGame() {
  solution = getDailyWord();
  const length = solution.length;
  document.getElementById("board").style.setProperty("--cols", length);

  for (let r = 0; r < MAX_TRIES; r++) {
    const row = [];
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    for (let c = 0; c < length; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      rowDiv.appendChild(cell);
      row.push(cell);
    }
    document.getElementById("board").appendChild(rowDiv);
    board.push(row);
  }

  createKeyboard();
  loadTheme();
  updateStatsUI();

  document.addEventListener("keydown", handleKey);
  document.getElementById("themeToggle").onclick = toggleTheme;
  document.getElementById("share").onclick = shareResult;
}

function getDailyWord() {
  const start = new Date(2022, 0, 1);
  const today = new Date();
  const dayIndex = Math.floor((today - start) / 86400000);
  return municipalities[dayIndex % municipalities.length];
}

function createKeyboard() {
  const keys = "QWERTYUIOPASDFGHJKLÑZXCVBNM";
  keys.split("").forEach(addKey);
  addKey("ENTER");
  addKey("←");
}

function addKey(label) {
  const key = document.createElement("div");
  key.className = "key";
  key.textContent = label;
  key.onclick = () => processKey(label);
  document.getElementById("keyboard").appendChild(key);
}

function handleKey(e) {
  if (finished) return;
  if (e.key === "Backspace") processKey("←");
  else if (e.key === "Enter") processKey("ENTER");
  else if (/^[a-zA-ZñÑ]$/.test(e.key)) processKey(e.key.toUpperCase());
}

function processKey(key) {
  if (finished) return;

  if (key === "←") {
    if (currentCol > 0) {
      currentCol--;
      board[currentRow][currentCol].textContent = "";
    }
    return;
  }

  if (key === "ENTER") {
    if (currentCol !== solution.length) return;
    checkRow();
    return;
  }

  if (currentCol < solution.length) {
    board[currentRow][currentCol].textContent = key;
    currentCol++;
  }
}

function checkRow() {
  const guess = board[currentRow].map(c => c.textContent).join("");

  if (!municipalities.includes(guess)) {
    showMessage("No es un municipio válido");
    return;
  }

  const solArr = solution.split("");
  const guessArr = guess.split("");

  guessArr.forEach((l, i) => {
    if (l === solArr[i]) {
      board[currentRow][i].classList.add("green");
      solArr[i] = null;
    }
  });

  guessArr.forEach((l, i) => {
    if (!board[currentRow][i].classList.contains("green")) {
      const idx = solArr.indexOf(l);
      if (idx > -1) {
        board[currentRow][i].classList.add("yellow");
        solArr[idx] = null;
      } else {
        board[currentRow][i].classList.add("gray");
      }
    }
  });

  if (guess === solution) {
    finishGame(true);
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow === MAX_TRIES) {
    finishGame(false);
  }
}

function finishGame(win) {
  finished = true;
  stats.played++;

  if (win) {
    stats.wins++;
    stats.streak++;
    showMessage("🎉 ¡Correcto!");
  } else {
    stats.streak = 0;
    showMessage("❌ Era: " + solution);
  }

  localStorage.setItem("stats", JSON.stringify(stats));
  updateStatsUI();
  document.getElementById("stats").classList.remove("hidden");
}

function updateStatsUI() {
  document.getElementById("played").textContent = stats.played;
  document.getElementById("wins").textContent = stats.wins;
  document.getElementById("streak").textContent = stats.streak;
}

function shareResult() {
  let result = `Wordle Municipios 🇪🇸\n${currentRow + 1}/${MAX_TRIES}\n`;

  board.slice(0, currentRow + 1).forEach(row => {
    row.forEach(cell => {
      if (cell.classList.contains("green")) result += "🟩";
      else if (cell.classList.contains("yellow")) result += "🟨";
      else result += "⬜";
    });
    result += "\n";
  });

  const url = `https://wa.me/?text=${encodeURIComponent(result)}`;
  window.open(url, "_blank");
}

function showMessage(msg) {
  document.getElementById("message").textContent = msg;
}

function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light"));
}

function loadTheme() {
  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("light");
  }
}
