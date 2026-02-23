const shipsTemplate = require("./ships.json");

const X_SIZE = 10;
const Y_SIZE = 10;
const TOTAL_CELLS = X_SIZE * Y_SIZE;

let gameState = {
  phase: "setup", // "setup", "playing", "finished";
  turn: "player", // "player", "bot"
  winner: null,
};

let ships = initializeShips();
let board = createBoard();

let botBoard = [];
let botShips = [];

function initializeShips() {
  return structuredClone(shipsTemplate).map((s) => ({
    ...s,
    placed: false,
    coordinates: [],
    orientation: "horizontal",
  }));
}

function createBoard() {
  return Array.from({ length: TOTAL_CELLS }, (_, i) => ({
    id: i,
    x: i % X_SIZE,
    y: Math.floor(i / X_SIZE),
    hasShip: false,
    status: "empty",
  }));
}

function getShips() {
  return ships;
}

function getBoard() {
  if (board.length === 0) board = createBoard();
  return board;
}

function setBoard(newBoard) {
  board = newBoard;
}

function resetBoard() {
  board = createBoard();
}
function resetShips() {
  ships = initializeShips();
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeShipsRandomly() {
  let localBoard = createBoard();
  let localShips = initializeShips();
  let occupied = new Set();

  const MAX_ATTEMPTS = 1000;
  let shipIndex = 0;

  while (shipIndex < localShips.length) {
    const ship = localShips[shipIndex];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < MAX_ATTEMPTS) {
      attempts++;
      const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

      const startX =
        orientation === "horizontal"
          ? randomNumber(0, X_SIZE - ship.size)
          : randomNumber(0, X_SIZE - 1);
      const startY =
        orientation === "vertical"
          ? randomNumber(0, Y_SIZE - ship.size)
          : randomNumber(0, Y_SIZE - 1);

      const startId = startY * X_SIZE + startX;

      const newCoords = Array.from({ length: ship.size }, (_, i) =>
        orientation === "horizontal" ? startId + i : startId + i * X_SIZE,
      );

      if (newCoords.some((id) => occupied.has(id))) continue;

      ship.coordinates = newCoords;
      ship.orientation = orientation;
      ship.placed = true;

      newCoords.forEach((id) => {
        localBoard[id].hasShip = true;
        localBoard[id].status = "ship";
        occupied.add(id);
      });

      placed = true;
      shipIndex++;
    }

    if (!placed) {
      occupied.clear();
      shipIndex = 0;
      localShips = initializeShips();
      localBoard = createBoard();
    }
  }

  return { board: localBoard, ships: localShips };
}

function startGame() {
  let botData = placeShipsRandomly();
  botBoard = botData.board;
  botShips = botData.ships;
  gameState.phase = "playing";
  gameState.turn = "player";
  return gameState;
}

function playerShoot(cellId) {
  if (gameState.phase !== "playing" || gameState.turn !== "player") {
    return null;
  }

  const cell = botBoard.find((c) => c.id === cellId);

  if (cell.status === "hit" || cell.status === "miss") {
    return nul;
  }

  if (cell.hasShip) {
    cell.status = "hit";
  } else {
    cell.status = "miss";
  }

  gameState.turn = "bot";

  return { updatedCell: cell, gameState };
}

function botShoot() {
  const availableCells = board.filter((cell) => {
    return cell.status === "empty" || cell.status === "ship";
  });

  const randomCellNumber = randomNumber(0, availableCells.length - 1);
  const targetCell = availableCells[randomCellNumber];

  if (targetCell.hasShip) {
    targetCell.status = "hit";
  } else {
    targetCell.status = "miss";
  }
  gameState.turn = "player";
  return { updatedCell: targetCell, gameState };
}

module.exports = {
  getShips,
  getBoard,
  setBoard,
  placeShipsRandomly,
  resetBoard,
  resetShips,
  startGame,
  playerShoot,
  botShoot,
};
