/*---------------------------- Variables (state) ----------------------------*/

let board;
let player;
let playerMode = "multi";
let ai_mode = "random";

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
    .map(() => Array(BOARD_SIZE).fill(0));

  board[3][3] = -1;
  board[4][4] = -1;
  board[4][3] = 1;
  board[3][4] = 1;
  player = BLACK;
  render();
}

function render() {
  updateBoard();
  updateMessage();
}

function updateBoard() {
  squareEls.forEach((square) => {
    const [row, col] = square.id.split(",");
    const piece = board[row][col];
    const pieceClass =
      piece === BLACK ? "black" : piece === WHITE ? "white" : "";

    if (square.firstChild) {
      if (piece) {
        if (!square.firstChild.classList.contains(pieceClass)) {
          square.firstChild.classList.remove("black", "white");
          square.firstChild.classList.add(pieceClass);
        }
      } else {
        square.removeChild(square.firstChild);
      }
    } else if (piece) {
      const token = document.createElement("div");
      token.className = `token ${pieceClass}`;
      square.appendChild(token);
    }
  });
}

function updateMessage() {
  messageEl.classList.remove("expand");
  let turnMsg;
  const isWinner = winner(board);
  if (playerMode === "multi") {
    if (isWinner) {
      if (isWinner === 0) {
        turnMsg = "Tie!";
      } else {
        turnMsg = `${isWinner === 1 ? "black" : "white"} wins!`;
      }
    } else {
      turnMsg = `${player === 1 ? "black" : "white"}'s turn`;
    }
  } else {
    if (isWinner) {
      if (isWinner === 0) {
        turnMsg = "Tie!";
      } else if (isWinner === WHITE) {
        turnMsg = "You lose!";
      } else {
        turnMsg = "You win!";
      }
    } else {
      turnMsg = player === BLACK ? "your turn" : "thinking...";
    }
  }
  messageEl.classList.add("expand");
  messageEl.textContent = turnMsg;
}

function computerTurn() {
  ai_mode = player === WHITE ? "random" : "localMax";
  const move =
    ai_mode === "random" ? randomMove(board, player) : localMax(board, player);
  const idx = move;
  placePiece(board, idx, player);
  swap();
  if (terminal(board, player)) {
    swap();
    if (terminal(board, player)) {
      render();
      return true;
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
  const idx = e.target.id.split(",").map(Number);
  const i = idx[0];
  const j = idx[1];
  if (board[i][j] !== 0 || validMove(board, idx, player).length === 0) {
    return;
  }
  placePiece(board, idx, player);
  swap();
  if (terminal(board, player)) {
    swap();
  }
  render();
  if (terminal(board, player)) {
    return;
  }
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

const playComputerGame = (board, player) => {
  while (true) {
    const turn = computerTurn(board, player);
    if (turn) {
      break;
    }
  }
  render();
  return winner(board);
};

init();

// const scores = { black: 0, white: 0, tie: 0 };
// for (let i = 0; i < 100; i++) {
//   init();
//   const winner = playComputerGame(board, player);
//   if (winner === 1) {
//     scores["black"]++;
//   } else if (winner === -1) {
//     scores["white"]++;
//   } else {
//     scores["tie"]++;
//   }
// }
// console.log(scores);

// init();
