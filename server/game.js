const shipsTemplate = require("./ships.json");

let x = 10;
let y = 10;
const size = x * y;

let ships = deepClone(shipsTemplate).map((s) => ({
  ...s,
  placed: false,
  coordinates: [],
  orientation: "horizontal",
}));

let board = createBoard();

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createBoard() {
  const result = [];

  for (let i = 0; i < size; i++) {
    result.push({
      id: i,
      x: i % x,
      y: Math.floor(i / x),
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
  if (board.length < 1) {
    board = createBoard();
  }
  return board;
}

function setBoard(newBoard) {
  board = newBoard;
  console.log(newBoard);
}

function resetBoard() {
  board = createBoard();
}

function resetShips() {
  ships = deepClone(shipsTemplate).map((s) => ({
    ...s,
    placed: false,
    coordinates: [],
    orientation: "horizontal",
  }));
}

function placeShipsRandomly() {
  let occupied = new Set();

  const localBoard = createBoard();

  const localShips = deepClone(shipsTemplate).map((s) => ({
    ...s,
    placed: false,
    coordinates: [],
    orientation: "horizontal",
  }));

  const maxAttemptsPerShip = 1000;
  let shipIndex = 0;

  while (shipIndex < localShips.length) {
    const ship = localShips[shipIndex];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttemptsPerShip) {
      attempts++;

      const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

      const startX =
        orientation === "horizontal"
          ? randomNumber(0, x - ship.size)
          : randomNumber(0, x - 1);

      const startY =
        orientation === "vertical"
          ? randomNumber(0, y - ship.size)
          : randomNumber(0, y - 1);

      let startId = startY * x + startX;

      let newCoords = [];

      if (orientation === "horizontal") {
        for (let i = 0; i < ship.size; i++) {
          let cellId = startId + i;
          newCoords.push(cellId);
        }
      } else if (orientation === "vertical") {
        for (let i = 0; i < ship.size; i++) {
          let cellId = startId + i * x;
          newCoords.push(cellId);
        }
      }

      if (newCoords.some((id) => occupied.has(id))) {
        continue;
      }

      ship.coordinates = newCoords;
      ship.orientation = orientation;
      ship.placed = true;

      newCoords.forEach((id) => {
        localBoard[id].hasShip = true;
        localBoard[id].status = "ship";
      });

      newCoords.forEach((id) => occupied.add(id));

      placed = true;
      shipIndex++;
    }
    if (!placed) {
      occupied.clear();
      shipIndex = 0;

      localShips.forEach((s) => {
        s.placed = false;
        s.coordinates = [];
        s.orientation = "horizontal";
      });

      localBoard.forEach((c) => {
        c.hasShip = false;
        c.status = "empty";
      });

      continue;
    }
  }
  console.log(localBoard, localShips);

  return { board: localBoard, ships: localShips };
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getShips,
  getBoard,
  setBoard,
  placeShipsRandomly,
  resetBoard,
  resetShips,
};
