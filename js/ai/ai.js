function localMax(board, player) {
  function checkValue(board, move, player) {
    const newBoard = result(board, move, player);
    const boardTally = tally(board);
    const newBoardTally = tally(newBoard);
    const value =
      player === BLACK
        ? newBoardTally - boardTally
        : boardTally - newBoardTally;
    return value;
  }
  const moves = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const move = [y, x];
      if (validMove(board, move, player).length === 0) {
        continue;
      } else {
        let value = checkValue(board, move, player);
        const corners = [
          [0, 0],
          [0, 7],
          [7, 0],
          [7, 7],
        ];
        if (corners.some((corner) => corner[0] === y && corner[1] === x)) {
          value += 20;
        }
        if (moves.length === 0) {
          moves.push([move, value]);
        } else if (value > moves[0][1]) {
          moves.length = 0;
          moves.push([move, value]);
        } else if (value === moves[0][1]) {
          moves.push([move, value]);
        }
      }
    }
  }
  if (moves.length === 1) {
    return moves[0][0];
  } else {
    return moves[Math.floor(Math.random() * moves.length)][0];
  }
}

const randomMove = (board, player) => {
  const moves = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const move = [y, x];
      if (validMove(board, move, player).length === 0) {
        continue;
      } else {
        moves.push(move);
      }
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
};
