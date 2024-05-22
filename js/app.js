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

/*------------------------ Cached Element References ------------------------*/

const boardEl = document.querySelector(".board");
const resetBtn = document.querySelector("#reset");
const messageEl = document.querySelector("#message");

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
  player = "black";
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

  if (winner(board)) {
    setInterval(() => messageEl.classList.add("expand"), 0);
    messageEl.textContent = `${winner(board)} wins!`;
  } else {
    setInterval(() => messageEl.classList.add("expand"), 0);
    messageEl.textContent = `${player}'s turn`;
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
  let tally = flatBoard.reduce(function (acc, vote) {
    if (acc[vote]) {
      acc[vote] = acc[vote] + 1;
    } else {
      acc[vote] = 1;
    }
    return acc;
  }, {});
  if (tally.white > tally.black) {
    return w;
  } else if (tally.black > tally.white) {
    return b;
  } else {
    return "tie";
  }
}

function swap(play) {
  if (play === b) {
    player = w;
  } else {
    player = b;
  }
}

function handleClick(e) {
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
  render();
}

/*----------------------------- Event Listeners -----------------------------*/

resetBtn.addEventListener("click", init);

boardEl.addEventListener("click", handleClick);

init();
