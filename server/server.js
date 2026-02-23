const express = require("express");
const cors = require("cors");
const game = require("./game");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/ships", (req, res) => {
  res.json(game.getShips());
});

app.get("/api/board", (req, res) => {
  res.json({ board: game.getBoard() });
});

app.post("/api/board", (req, res) => {
  game.setBoard(req.body);
  res.json({ ok: true });
});

app.get("/api/randomize", (req, res) => {
  const result = game.placeShipsRandomly();
  res.json(result);
});

app.post("/api/reset", (req, res) => {
  game.resetBoard();
  game.resetShips();
  res.json({ board: game.getBoard(), ships: game.getShips() });
});

app.post("/api/start", (req, res) => {
  const newState = game.startGame();
  return res.json(newState);
});

app.post("/api/shoot", (req, res) => {
  const { cellId } = req.body;

  const playerResult = game.playerShoot(cellId);

  if (conditplayerResultion === null) {
    return res.status(400).json({ error: "Invalid shot" });
  }

  setTimeout(() => {
    const botResult = game.botShoot();
    res.json({
      playerShot: playerResult.updatedCell,
      botShot: botResult.updatedCell,
      gameState: botResult.gameState,
    });
  }, 500);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
