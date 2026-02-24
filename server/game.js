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

let botState = {
  tried: new Set(),
  hits: [],
  queue: [],
};

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

function fullReset() {
  board = createBoard();
  ships = initializeShips();

  botBoard = [];
  botShips = [];
  botState = {
    tried: new Set(),
    hits: [],
    queue: [],
  };

  gameState = {
    phase: "setup",
    turn: "player",
    winner: null,
  };

  return { board, ships };
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSurroundingCells(id) {
  const x = id % 10;
  const y = Math.floor(id / 10);
  const surrounding = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
        surrounding.push(ny * 10 + nx);
      }
    }
  }
  return surrounding;
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

      // newCoords.forEach((id) => {
      //   localBoard[id].hasShip = true;
      //   localBoard[id].status = "ship";
      //   occupied.add(id);
      // });

      newCoords.forEach((id) => {
        localBoard[id].hasShip = true;
        localBoard[id].status = "ship";

        const halo = getSurroundingCells(id);
        halo.forEach((haloId) => occupied.add(haloId));
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
  const botData = placeShipsRandomly();
  botBoard = botData.board;
  botShips = botData.ships;

  gameState = {
    phase: "playing",
    turn: "player",
    winner: null,
  };

  botState = {
    tried: new Set(),
    hits: [],
    queue: [],
  };

  return gameState;
}

function registerHitOnShip(cellId, shipList) {
  const ship = shipList.find((s) => s.coordinates.includes(cellId));
  if (!ship) return null;

  ship.hitCount = (ship.hitCount || 0) + 1;

  if (ship.hitCount === ship.size) {
    ship.sunk = true;
  }

  return ship;
}

function playerShoot(cellId) {
  if (gameState.phase !== "playing" || gameState.turn !== "player") {
    return null;
  }

  const cell = botBoard.find((c) => c.id === cellId);
  if (!cell) return null;

  if (cell.status === "hit" || cell.status === "miss") {
    return null;
  }

  let sunkShip = null;

  if (cell.hasShip) {
    cell.status = "hit";

    const ship = registerHitOnShip(cell.id, botShips);

    if (ship && ship.sunk) {
      sunkShip = ship;
    }

    if (checkWin(botShips)) {
      gameState.phase = "finished";
      gameState.winner = "player";

      return {
        updatedCell: cell,
        gameState,
        hit: true,
        sunkShip,
        gameFinished: true,
      };
    }
  } else {
    cell.status = "miss";
  }

  gameState.turn = "bot";

  return {
    updatedCell: cell,
    gameState,
    hit: cell.status === "hit",
    sunkShip,
    gameFinished: false,
  };
}

function bot() {
  let targetCell = null;

  while (botState.queue.length > 0) {
    const nextId = botState.queue.shift();
    if (!botState.tried.has(nextId)) {
      targetCell = board.find((c) => c.id === nextId);
      break;
    }
  }

  if (!targetCell) {
    const availableCells = board.filter(
      (c) =>
        !botState.tried.has(c.id) &&
        (c.status === "empty" || c.status === "ship"),
    );

    const randomIndex = randomNumber(0, availableCells.length - 1);
    targetCell = availableCells[randomIndex];
  }

  return botShoot(targetCell);
}

function botShoot(targetCell) {
  if (!targetCell) return null;

  botState.tried.add(targetCell.id);

  let sunkShip = null;

  if (targetCell.hasShip) {
    targetCell.status = "hit";

    const ship = registerHitOnShip(targetCell.id, ships);

    if (ship && ship.sunk) {
      sunkShip = ship;
      botState.queue = [];
    } else {
      const ns = neighbors(targetCell.id);
      for (const id of ns) {
        if (!botState.tried.has(id) && !botState.queue.includes(id)) {
          botState.queue.push(id);
        }
      }
    }

    if (checkWin(ships)) {
      gameState.phase = "finished";
      gameState.winner = "bot";
      return {
        hit: true,
        miss: false,
        updatedCell: targetCell,
        sunkShip,
        gameFinished: true,
        gameState,
      };
    }

    gameState.turn = "player";
    return {
      hit: true,
      miss: false,
      updatedCell: targetCell,
      sunkShip,
      gameFinished: false,
      gameState,
    };
  }

  targetCell.status = "miss";
  gameState.turn = "player";

  return {
    hit: false,
    miss: true,
    updatedCell: targetCell,
    gameFinished: false,
    gameState,
  };
}

function xyFromId(id) {
  const x = id % X_SIZE;
  const y = Math.floor(id / X_SIZE);
  return { x, y };
}

function inBounds(x, y) {
  return x >= 0 && x < X_SIZE && y >= 0 && y < Y_SIZE;
}

function neighbors(id) {
  const { x, y } = xyFromId(id);
  const directions = [
    { x, y: y - 1 },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
  ];

  const valid = directions.filter(({ x, y }) => inBounds(x, y));
  const finalIds = valid.map(({ x, y }) => y * X_SIZE + x);

  return finalIds;
}

function checkWin(shipList) {
  return shipList.every((s) => s.sunk);
}

function setShips(newShips) {
  ships = newShips;
}

module.exports = {
  getShips,
  getBoard,
  setBoard,
  placeShipsRandomly,
  fullReset,
  startGame,
  playerShoot,
  bot,
  botShoot,
  setShips,
};
