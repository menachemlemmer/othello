const BLACK = 1;
const WHITE = -1;

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

function validMove(board, move, player) {
  const validDirections = [];
  const otherPlayer = player === BLACK ? -1 : 1;

  for (let direction of DIRECTIONS) {
    let [y, x] = move;
    if (board[y][x] !== 0) {
      return validDirections;
    }
    y += direction[0];
    x += direction[1];
    if (y < 0 || y > 7 || x < 0 || x > 7) {
      continue;
    }
    if (board[y][x] === otherPlayer) {
      while (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
        if (board[y][x] === 0) {
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
  return board.flat().reduce((a, b) => a + b);
}

function terminal(board, player) {
  let isTerminal = true;
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (validMove(board, [i, j], player).length !== 0) {
        isTerminal = false;
        break;
      }
    }
  }
  return isTerminal;
}

function winner(board) {
  if (!terminal(board, BLACK) || !terminal(board, WHITE)) {
    return;
  }
  const sum = tally(board);
  return sum > 0 ? BLACK : sum < 0 ? WHITE : 0;
}
