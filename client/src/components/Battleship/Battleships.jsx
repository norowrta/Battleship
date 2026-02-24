import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import axios from "axios";
import DraggableShip from "./DraggableShip.jsx";
import DroppableCell from "./DroppableCell.jsx";
import Icon from "../Icon";
import css from "./battleships.module.css";

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const API_URL = "http://localhost:3000/api";

function calculateCoordinates(startId, size, orientation) {
  return Array.from({ length: size }, (_, i) =>
    orientation === "horizontal" ? startId + i : startId + i * 10,
  );
}

function generateEmptyBoard() {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i,
    status: "empty",
    hasShip: false,
  }));
}

export default function Board() {
  const [board, setBoard] = useState([]);
  const [shipsState, setShipsState] = useState([]);
  const [oppBoard, setOppBoard] = useState(generateEmptyBoard());

  const [activeId, setActiveId] = useState(null);
  const [previewCells, setPreviewCells] = useState([]);
  const [destroyedShips, setDestroyedShips] = useState([]);
  const [gamePhase, setGamePhase] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);

  let player = 1;

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === "Space" && activeId) {
        event.preventDefault();
        setShipsState((prevShips) =>
          prevShips.map((ship) =>
            ship.name === activeId
              ? {
                  ...ship,
                  orientation:
                    ship.orientation === "horizontal"
                      ? "vertical"
                      : "horizontal",
                }
              : ship,
          ),
        );
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId]);

  async function startGame() {
    const allPlaced = shipsState.every((ship) => ship.placed === true);
    if (!allPlaced) {
      alert("Please place all ships!");
      return;
    }

    await axios.post(`${API_URL}/board`, board);
    await axios.post(`${API_URL}/ships`, shipsState);
    await axios.post(`${API_URL}/start`);
    setGamePhase(true);
  }

  async function reset() {
    try {
      const response = await axios.post(`${API_URL}/reset`);
      setBoard(response.data.board);
      setShipsState(response.data.ships);
    } catch (err) {
      console.error(err);
    }
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

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return setPreviewCells([]);

    const activeShip = shipsState.find((s) => s.name === active.id);
    if (!activeShip) return;

    const dropCellId = parseInt(over.id);
    setPreviewCells(
      calculateCoordinates(dropCellId, activeShip.size, activeShip.orientation),
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    setPreviewCells([]);

    if (!over) return;

    const shipName = active.id;
    const dropCellId = parseInt(over.id);
    const currentShip = shipsState.find((s) => s.name === shipName);

    const x = dropCellId % 10;
    const y = Math.floor(dropCellId / 10);

    if (currentShip.orientation === "horizontal" && x + currentShip.size > 10)
      return;
    if (currentShip.orientation === "vertical" && y + currentShip.size > 10)
      return;

    const newCoordinates = calculateCoordinates(
      dropCellId,
      currentShip.size,
      currentShip.orientation,
    );

    const isOverlapping = shipsState.some((otherShip) => {
      if (otherShip.name === shipName || !otherShip.placed) return false;

      return newCoordinates.some((coord) => {
        const halo = getSurroundingCells(coord);
        return halo.some((haloId) => otherShip.coordinates.includes(haloId));
      });
    });

    if (isOverlapping) return;

    setShipsState((prev) =>
      prev.map((ship) =>
        ship.name === shipName
          ? { ...ship, placed: true, coordinates: newCoordinates }
          : ship,
      ),
    );

    setBoard((prevBoard) =>
      prevBoard.map((cell) => {
        const isNewCell = newCoordinates.includes(cell.id);
        const isOldCell =
          currentShip.placed && currentShip.coordinates.includes(cell.id);

        if (isNewCell) return { ...cell, hasShip: true, status: "ship" };
        if (isOldCell) return { ...cell, hasShip: false, status: "empty" };
        return cell;
      }),
    );
  }

  function getShipContent(cell) {
    const shipAtCell = shipsState.find(
      (ship) => ship.placed && ship.coordinates.includes(cell.id),
    );
    if (!shipAtCell) return null;

    const indexInShip = shipAtCell.coordinates.indexOf(cell.id);

    let iconName = "boatMiddle";
    if (indexInShip === 0) iconName = "boatBack";
    if (indexInShip === shipAtCell.size - 1) iconName = "boatFront";

    if (cell.status === "hit") {
      if (iconName === "boatMiddle") iconName = "boatMiddleHit";
      if (iconName === "boatBack") iconName = "boatBackHit";
      if (iconName === "boatFront") iconName = "boatFrontHit";
    }

    const rotationAngle =
      shipAtCell.orientation === "vertical" ? "180deg" : "90deg";

    return (
      <Icon
        name={iconName}
        width="32px"
        height="32px"
        className={css.cellIcon}
        style={{
          transform: `rotate(${rotationAngle})`,
          display: "block",
        }}
      />
    );
  }

  async function handleShoot(cellId) {
    if (!gamePhase || isBotThinking) return;

    setIsBotThinking(true);

    try {
      const response = await axios.post(`${API_URL}/shoot`, { cellId });
      const { playerShot, botShot, gameState, playerSunkShip } = response.data;
      if (playerSunkShip) {
        const shipString = `${playerSunkShip.name} (${playerSunkShip.size})`;

        setDestroyedShips((prev) => [...prev, shipString]);
      }

      setOppBoard((prev) =>
        prev.map((c) => (c.id === playerShot.id ? playerShot : c)),
      );

      setOppBoard((prev) =>
        prev.map((c) => (c.id === playerShot.id ? playerShot : c)),
      );
      setBoard((prev) => prev.map((c) => (c.id === botShot.id ? botShot : c)));

      if (gameState && gameState.phase === "finished") {
        setTimeout(() => {
          if (gameState.winner === "player") {
            alert("You won!");
          } else {
            alert("Bot won!");
          }
          setGamePhase(false);
          setIsGameOver(true);
        }, 300);
      }
    } catch (error) {
      console.error("Error", error);
    } finally {
      setIsBotThinking(false);
    }
  }

  async function handleRestart() {
    try {
      const response = await axios.post(`${API_URL}/reset`);

      setBoard(response.data.board);
      setShipsState(response.data.ships);

      setOppBoard(generateEmptyBoard());
      setDestroyedShips([]);

      setIsGameOver(false);
      setGamePhase(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <section className={css.section}>
        <div className={css.sectionContainer}>
          <div className={css.content}>
            <div className={css.container}>
              <div className={css.contentPart}>
                <div
                  className={`${css.playersWrapper} ${player === 1 ? css.playerBlue : css.playerRed}`}
                >
                  <span className={css.playerTxt}>Your fleet</span>
                </div>
                <div className={css.wrapper}>
                  <div className={css.letters}>
                    {letters.map((letter) => (
                      <div key={letter} className={css.label}>
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className={css.numbers}>
                    {numbers.map((num) => (
                      <div key={num} className={css.label}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className={css.grid}>
                    {board.map((item) => (
                      <DroppableCell
                        key={item.id}
                        id={item.id}
                        previewCells={previewCells}
                      >
                        {getShipContent(item)}
                        {item.status === "miss" && (
                          <div
                            className={`${css.cellBotMiss} ${css.popAnimation} `}
                          >
                            <Icon name="botMiss" width="32px" height="32px" />
                          </div>
                        )}
                      </DroppableCell>
                    ))}
                  </div>
                </div>
                {!gamePhase && (
                  <div className={css.shipyard}>
                    <h3 className={css.shipyardTitle}>Shipyard</h3>
                    <div className={css.shipyardShips}>
                      {shipsState.map((ship) =>
                        !ship.placed ? (
                          <DraggableShip key={ship.name} ship={ship} />
                        ) : null,
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={css.vl}></div>

              <div className={css.contentPart}>
                <div className={css.playersWrapper}>
                  <span className={css.playerTxt}>Opponent</span>
                </div>
                <div className={css.wrapper}>
                  <div className={css.letters}>
                    {letters.map((letter) => (
                      <div key={letter} className={css.label}>
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className={css.numbers}>
                    {numbers.map((num) => (
                      <div key={num} className={css.label}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className={css.grid}>
                    {oppBoard.map((item) => (
                      <div
                        key={item.id}
                        className={`${css.cell} ${css.cellEnemy}`}
                        onClick={() => handleShoot(item.id)}
                      >
                        {item.status === "hit" && (
                          <Icon
                            name="hit"
                            width="32px"
                            height="32px"
                            className={`${css.cellIcon} ${css.popAnimation} `}
                          />
                        )}
                        {item.status === "miss" && (
                          <Icon
                            name="miss"
                            width="32px"
                            height="32px"
                            className={`${css.cellIcon} ${css.popAnimation} `}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={css.shipyard}>
                  <h3 className={css.shipyardTitle}>Graveyard</h3>
                  <div className={css.graveyardShips}>
                    {[
                      "Battleship (4)",
                      "Submarine (3)",
                      "Cruiser (2)",
                      "Aircraft Carrier (5)",
                      "Destroyer (3)",
                    ].map((shipName) => (
                      <a
                        key={shipName}
                        href="#"
                        className={`${css.shipyardDestroyed} ${destroyedShips.includes(shipName) ? css.destroyedShip : ""}`}
                      >
                        {shipName}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!gamePhase && !isGameOver && (
            <button className={css.buttonPlay} onClick={startGame}>
              Play
            </button>
          )}

          {isGameOver && (
            <button className={css.buttonPlay} onClick={handleRestart}>
              Restart
            </button>
          )}
        </div>
      </section>
    </DndContext>
  );
}
