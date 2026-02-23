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

app.post("/api/board", (req, res) => {
  game.setBoard(req.body);
  res.json({ ok: true });
});

app.get("/api/board", (req, res) => {
  res.json({ board: game.getBoard() });
});

app.get("/api/randomize", (req, res) => {
  const result = game.placeShipsRandomly();
  console.log(result);

  res.json(result);
});


app.post("/api/reset", (req, res) => {
  game.resetBoard();
  game.resetShips();
  res.json({ board: game.getBoard(), ships: game.getShips() });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
