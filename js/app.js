/*-------------------------------- Constants --------------------------------*/

const BLACK = "black";
const WHITE = "white";

const BOARD_SIZE = 8;

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
];

/*---------------------------- Variables (state) ----------------------------*/

let board;
let player;
let playerMode = "multi";

/*------------------------ Cached Element References ------------------------*/

const boardEl = document.querySelector(".board");
const resetBtn = document.querySelector("#reset");
const messageEl = document.querySelector("#message");
const playerModeBtn = document.querySelector("#player-mode");
const themeBtn = document.querySelector(".checkbox");

for (let y = 0; y < BOARD_SIZE; y++) {
  for (let x = 0; x < BOARD_SIZE; x++) {
    let square = document.createElement("div");
    square.classList.add("square");
    square.id = `${y},${x}`;
    boardEl.appendChild(square);
  }
}

const squareEls = document.querySelectorAll(".square");

/*-------------------------------- Functions --------------------------------*/

function init() {
  board = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(""));
  board[3][3] = WHITE;
  board[4][4] = WHITE;
  board[4][3] = BLACK;
  board[3][4] = BLACK;
  player = BLACK;
  render();
}

function render() {
  updateBoard(board);
  updateMessage();
}

function updateBoard(board) {
  for (let square of squareEls) {
    const idx = square.id.split(",");
    if (
      square.firstChild &&
      square.firstChild.classList.contains(board[idx[0]][idx[1]])
    ) {
      continue;
    }
    if (square.firstChild && board[idx[0]][idx[1]]) {
      square.firstChild.removeAttribute("Class");
      square.firstChild.classList.add("token", board[idx[0]][idx[1]]);
      setTimeout(() => {
        square.firstChild.classList.add("flip");
      }, 100);
    } else if (board[idx[0]][idx[1]]) {
      let token = document.createElement("div");
      token.classList.add("token", board[idx[0]][idx[1]]);
      square.appendChild(token);
    } else if (square.firstChild) {
      square.removeChild(square.firstChild);
    }
  }
}

function updateMessage() {
  messageEl.classList.remove("expand");
  if (playerMode === "multi") {
    if (winner(board)) {
      setInterval(() => messageEl.classList.add("expand"), 0);
      if (winner(board) === "tie") {
        messageEl.textContent = `${winner(board)}!`;
      } else {
        messageEl.textContent = `${winner(board)} wins!`;
        startConfetti();
        setInterval(stopConfetti, 3000);
      }
    } else {
      setInterval(() => messageEl.classList.add("expand"), 0);
      messageEl.textContent = `${player}'s turn`;
    }
  } else {
    if (winner(board)) {
      setInterval(() => messageEl.classList.add("expand"), 0);
      if (winner(board) === "tie") {
        messageEl.textContent = `${winner(board)}!`;
      } else if (winner(board) === WHITE) {
        messageEl.textContent = "You lose!";
      } else {
        messageEl.textContent = "You win!";
        startConfetti();
        setInterval(stopConfetti, 3000);
      }
    } else {
      setInterval(() => messageEl.classList.add("expand"), 0);
      if (player === WHITE) {
        messageEl.textContent = "Thinking...";
      } else {
        messageEl.textContent = "Your turn";
      }
    }
  }
}

function validMove(board, move, player) {
  const validDirections = [];
  const otherPlayer = player === BLACK ? WHITE : BLACK;

  for (let direction of DIRECTIONS) {
    let y = move[0];
    let x = move[1];
    if (board[y][x] !== "") {
      return validDirections;
    }
    y += direction[0];
    x += direction[1];
    if (y < 0 || y > 7 || x < 0 || x > 7) {
      continue;
    }
    if (board[y][x] === otherPlayer) {
      while (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
        if (board[y][x] === "") {
          break;
        } else if (board[y][x] === player) {
          validDirections.push(direction);
          break;
        }
        y += direction[0];
        x += direction[1];
      }
    }
  }
  return validDirections;
}

function placePiece(board, move, player) {
  const validDirections = validMove(board, move, player);
  let y = move[0];
  let x = move[1];
  board[y][x] = player;
  for (let direction of validDirections) {
    y = move[0];
    x = move[1];
    y += direction[0];
    x += direction[1];
    while (board[y][x] !== player) {
      board[y][x] = player;
      y += direction[0];
      x += direction[1];
    }
  }
}

function result(board, move, player) {
  let newBoard = JSON.parse(JSON.stringify(board));
  const y = move[0];
  const x = move[1];
  placePiece(newBoard, [y, x], player);
  return newBoard;
}

function tally(board) {
  return board.flat().reduce(function (acc, num) {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});
}

function checkValue(board, move, player) {
  let value;

  if (winner(result(board, move, player)) === player) {
    value = 100;
    return value;
  }
  const newBoard = result(board, move, player);
  const boardTally = tally(board);
  const newBoardTally = tally(newBoard);

  value = newBoardTally[player] - boardTally[player];
  return value;
}

function findBestMove(board, player) {
  const moves = {};
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (validMove(board, [y, x], player).length === 0) {
        continue;
      } else {
        let move = [y, x];
        moves[move] = checkValue(board, [y, x], player);
      }
    }
  }

  const getMax = (obj) => {
    const max = Math.max(...Object.values(obj));
    return Object.keys(obj).filter((key) => obj[key] === max);
  };

  for (let key in moves) {
    const corners = ["0,0", "0,7", "7,0", "7,7"];
    if (corners.includes(key)) {
      moves[key] += 10;
    }
  }
  const max = getMax(moves);
  if (max.length === 1) {
    return max[0];
  } else {
    return max[Math.floor(Math.random() * max.length)];
  }
}

function terminal(board, player) {
  let isTerminal = true;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (validMove(board, [i, j], player).length !== 0) {
        isTerminal = false;
      }
    }
  }
  return isTerminal;
}

function winner(board) {
  if (!terminal(board, BLACK) || !terminal(board, WHITE)) {
    return;
  }
  let tally = tally(board);
  if (tally.white > tally.black || !(BLACK in tally)) {
    return WHITE;
  } else if (tally.black > tally.white || !(WHITE in tally)) {
    return BLACK;
  } else {
    return "tie";
  }
}

function computerTurn() {
  let move = findBestMove(board, player);
  let idx = move.split(",").map(Number);
  placePiece(board, idx, player);
  swap();
  if (terminal(board, player)) {
    swap();
    if (terminal(board, player)) {
      render();
      return;
    }
  }
  render();
}

function swap() {
  player = player === BLACK ? WHITE : BLACK;
}

function handleClick(e) {
  if (playerMode === "single" && player === WHITE) {
    return;
  }
  let idx = e.target.id.split(",").map(Number);
  let i = idx[0];
  let j = idx[1];
  if (board[i][j] !== "" || validMove(board, idx, player).length === 0) {
    return;
  }
  placePiece(board, idx, player);
  swap();
  if (terminal(board, player)) {
    swap(player);
  }
  if (terminal(board, player)) {
    render();
    return;
  }
  render();
  if (playerMode === "single" && player === WHITE) {
    setTimeout(computerTurn, 1400);
    render();
  }
}

/*----------------------------- Event Listeners -----------------------------*/

resetBtn.addEventListener("click", init);

themeBtn.addEventListener("click", (e) => {
  document.documentElement.className = e.target.checked ? "light" : "dark";
});

boardEl.addEventListener("click", handleClick);

playerModeBtn.addEventListener("click", () => {
  if (playerMode === "multi") {
    playerMode = "single";
    playerModeBtn.textContent = "single-player";
  } else {
    playerMode = "multi";
    playerModeBtn.textContent = "multi-player";
  }
  init();
});

init();
