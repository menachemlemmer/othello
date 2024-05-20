/*-------------------------------- Constants --------------------------------*/

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
  console.log(board);
  player = "black";
  render(board);
}

function render() {
  updateBoard(board);
}

function updateBoard(board) {
  for (let square of squareEls) {
    let token = document.createElement("div");
    token.classList.add("token");
    let idx = square.id.split(",");
    if (board[idx[0]][idx[1]] !== "") {
      token.style.backgroundColor = board[idx[0]][idx[1]];
      square.appendChild(token);
    }
  }
}

/*----------------------------- Event Listeners -----------------------------*/

init();
