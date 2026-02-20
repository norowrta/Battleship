const shipsTemplate = require("./ships.json");

let ships = shipsTemplate;
let board = createBoard();

function createBoard() {
  const result = [];
  const size = 10 * 10;

  for (let i = 0; i < size; i++) {
    result.push({
      id: i,
      x: i % 10,
      y: Math.floor(i / 10),
      hasShip: false,
      status: "empty",
    });
  }
  return result;
}

function getShips() {
  return ships;
}

function getBoard() {
  return board;
}

function setBoard(newBoard) {
  board = newBoard;
}

module.exports = {
  getShips,
  getBoard,
  setBoard,
};
