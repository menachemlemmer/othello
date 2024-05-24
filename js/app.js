/*-------------------------------- Constants --------------------------------*/

const b = "black";
const w = "white";

const directions = [
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

for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    let square = document.createElement("div");
    square.classList.add("square");
    square.id = `${i},${j}`;
    boardEl.appendChild(square);
  }
}

const squareEls = document.querySelectorAll(".square");

/*-------------------------------- Functions --------------------------------*/

function init() {
  board = Array(8)
    .fill()
    .map(() => Array(8).fill(""));
  board[3][3] = "white";
  board[4][4] = "white";
  board[4][3] = "black";
  board[3][4] = "black";
  player = b;
  render();
}

function render() {
  updateBoard(board);
  updateMessage();
}

function updateBoard(board) {
  for (let square of squareEls) {
    let idx = square.id.split(",");
    if (
      square.firstChild &&
      square.firstChild.classList.contains(board[idx[0]][idx[1]])
    ) {
      continue;
    }
    if (square.firstChild && board[idx[0]][idx[1]] !== "") {
      square.firstChild.removeAttribute("Class");
      square.firstChild.classList.add("token");
      square.firstChild.classList.add(board[idx[0]][idx[1]]);
      setTimeout(function () {
        square.firstChild.classList.add("flip");
      }, 100);
    } else if (board[idx[0]][idx[1]] !== "") {
      let token = document.createElement("div");
      token.classList.add("token");
      token.classList.add(board[idx[0]][idx[1]]);
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
      } else if (winner(board) === w) {
        messageEl.textContent = "You lose!";
      } else {
        messageEl.textContent = "You win!";
        startConfetti();
        setInterval(stopConfetti, 3000);
      }
    } else {
      setInterval(() => messageEl.classList.add("expand"), 0);
      if (player === w) {
        messageEl.textContent = "Thinking...";
      } else {
        messageEl.textContent = "Your turn";
      }
    }
  }
}

function validMove(board, move, player) {
  const validDirections = [];
  let otherPlayer;
  if (player === b) {
    otherPlayer = w;
  } else {
    otherPlayer = b;
  }

  for (let direction of directions) {
    let i = move[0];
    let j = move[1];
    if (board[i][j] !== "") {
      return validDirections;
    }
    i += direction[0];
    j += direction[1];
    if (i < 0 || i > 7 || j < 0 || j > 7) {
      continue;
    }
    if (board[i][j] === otherPlayer) {
      while (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
        if (board[i][j] === "") {
          break;
        } else if (board[i][j] === player) {
          validDirections.push(direction);
          break;
        }
        i += direction[0];
        j += direction[1];
      }
    }
  }
  return validDirections;
}

function placePiece(board, move, player) {
  const validDirections = validMove(board, move, player);
  let i = move[0];
  let j = move[1];
  board[i][j] = player;
  for (let direction of validDirections) {
    i = move[0];
    j = move[1];
    i += direction[0];
    j += direction[1];
    while (board[i][j] !== player) {
      board[i][j] = player;
      i += direction[0];
      j += direction[1];
    }
  }
}

function result(board, move, player) {
  newBoard = JSON.parse(JSON.stringify(board));
  let i = move[0];
  let j = move[1];
  placePiece(newBoard, [i, j], player);
  return newBoard;
}

function checkValue(board, move, player) {
  let value;

  if (winner(result(board, move, player)) === player) {
    value = 100;
    return value;
  }
  let flatBoard = board.flat();
  let newBoard = result(board, move, player);
  let flatNewBoard = result(board, move, player).flat();
  let boardTally = flatBoard.reduce(function (acc, num) {
    if (acc[num]) {
      acc[num] = acc[num] + 1;
    } else {
      acc[num] = 1;
    }
    return acc;
  }, {});
  let newBoardTally = flatNewBoard.reduce(function (acc, num) {
    if (acc[num]) {
      acc[num] = acc[num] + 1;
    } else {
      acc[num] = 1;
    }
    return acc;
  }, {});

  value = newBoardTally[player] - boardTally[player];
  return value;
}

function findBestMove(board, player) {
  const moves = {};
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (validMove(board, [i, j], player).length === 0) {
        continue;
      } else {
        let move = [i, j];
        moves[move] = checkValue(board, [i, j], player);
      }
    }
  }
  //from stack overflow
  const getMax = (object) => {
    return Object.keys(object).filter((x) => {
      return object[x] == Math.max.apply(null, Object.values(object));
    });
  };
  for (let key in moves) {
    if (key === "0,0" || key === "0,7" || key === "7,0" || key === "7,7") {
      moves[key] += 10;
    }
  }
  if (getMax(moves).length === 1) {
    return getMax(moves)[0];
  } else {
    return getMax(moves)[Math.floor(Math.random() * getMax(moves).length)];
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
  if (!terminal(board, b) || !terminal(board, w)) {
    return;
  }
  const flatBoard = board.flat();
  let tally = flatBoard.reduce(function (acc, num) {
    if (acc[num]) {
      acc[num] = acc[num] + 1;
    } else {
      acc[num] = 1;
    }
    return acc;
  }, {});
  if (tally.white > tally.black || !("black" in tally)) {
    return w;
  } else if (tally.black > tally.white || !("white" in tally)) {
    return b;
  } else {
    return "tie";
  }
}

function computerTurn() {
  let move = findBestMove(board, player);
  let idx = move.split(",").map(Number);
  placePiece(board, idx, player);
  swap(player);
  if (terminal(board, player)) {
    swap(player);
    if (terminal(board, player)) {
      render();
      return;
    }
    computerTurn;
  }
  render();
}

function swap(play) {
  if (play === b) {
    player = w;
  } else {
    player = b;
  }
}

function handleClick(e) {
  if (playerMode === "single" && player === w) {
    return;
  }
  let idx = e.target.id.split(",").map(Number);
  let i = idx[0];
  let j = idx[1];
  if (board[i][j] !== "" || validMove(board, idx, player).length === 0) {
    return;
  }
  placePiece(board, idx, player);
  swap(player);
  if (terminal(board, player)) {
    swap(player);
  }
  if (terminal(board, player)) {
    render();
    return;
  }
  render();
  if (playerMode === "single" && player === w) {
    setTimeout(computerTurn, 1400);
    render();
  }
}

/*----------------------------- Event Listeners -----------------------------*/

resetBtn.addEventListener("click", init);

themeBtn.addEventListener("click", (e) => {
  if (e.target.checked) {
    document.documentElement.className = "light";
  } else {
    document.documentElement.className = "dark";
  }
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
