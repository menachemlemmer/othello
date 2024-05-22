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
}

function updateBoard(board) {
  for (let square of squareEls) {
    let idx = square.id.split(",");
    if (square.firstChild && board[idx[0]][idx[1]] !== "") {
      square.firstChild.style.backgroundColor = board[idx[0]][idx[1]];
    } else if (board[idx[0]][idx[1]] !== "") {
      let token = document.createElement("div");
      token.classList.add("token");
      token.style.backgroundColor = board[idx[0]][idx[1]];
      square.appendChild(token);
    } else if (square.firstChild) {
      square.removeChild(square.firstChild);
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
  render();
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

function swap(play) {
  if (play === b) {
    player = w;
  } else {
    player = b;
  }
}
/*----------------------------- Event Listeners -----------------------------*/

resetBtn.addEventListener("click", init);

boardEl.addEventListener("click", (e) => {
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
    init();
  }
});

//   }
//   placePiece(currrentMove, player);
//   if (player === b) {
//     player = w;
//   } else {
//     player = b;
//   }
// });

init();
