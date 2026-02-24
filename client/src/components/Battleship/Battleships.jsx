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

  let player = 1;

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [boardRes, shipsRes] = await Promise.all([
          axios.get(`${API_URL}/board`),
          axios.get(`${API_URL}/ships`),
          // axios.get(`${API_URL}/randomize`),
        ]);
        setBoard(boardRes.data.board);
        setShipsState(shipsRes.data);
        // setOppBoard(oppRes.data.board);
      } catch (error) {
        console.error("Error:", error);
      }
    }
    fetchInitialData();
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

  // async function fetchOppBoard() {
  //   try {
  //     const respons = await axios.get(`${API_URL}/randomize`);
  //     setOppBoard(respons.data.board);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }

  async function startGame() {
    const allPlaced = shipsState.every((ship) => ship.placed === true);
    if (!allPlaced) {
      alert("Please place all ships!");
      return;
    }

    await axios.post(`${API_URL}/board`, board);
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
      return newCoordinates.some((coord) =>
        otherShip.coordinates.includes(coord),
      );
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

  function getShipContent(cellId) {
    const shipAtCell = shipsState.find(
      (ship) => ship.placed && ship.coordinates.includes(cellId),
    );
    if (!shipAtCell) return null;

    const indexInShip = shipAtCell.coordinates.indexOf(cellId);
    let iconName = "boatMiddle";
    if (indexInShip === 0) iconName = "boatBack";
    if (indexInShip === shipAtCell.size - 1) iconName = "boatFront";

    const rotationAngle =
      shipAtCell.orientation === "vertical" ? "180deg" : "90deg";

    return (
      <Icon
        name={iconName}
        width="32px"
        height="32px"
        className={css.cellIcon}
        style={{ transform: `rotate(${rotationAngle})`, display: "block" }}
      />
    );
  }

  function toggleDestroyed(e, shipType) {
    e.preventDefault();
    setDestroyedShips((prev) =>
      prev.includes(shipType)
        ? prev.filter((s) => s !== shipType)
        : [...prev, shipType],
    );
  }

  async function handleShoot(cellId) {
    if (!gamePhase) return;

    try {
      const response = await axios.post(`${API_URL}/shoot`, { cellId });

      const { playerShot, botShot, gameState } = response.data;

      setOppBoard((prev) =>
        prev.map((c) => (c.id === playerShot.id ? playerShot : c)),
      );

      setBoard((prev) => prev.map((c) => (c.id === botShot.id ? botShot : c)));
    } catch (error) {
      console.error("Error", error);
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
                        {getShipContent(item.id)}
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
                        {item.status === "hit" && <span>X</span>}
                        {item.status === "miss" && <span>•</span>}
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
                        onClick={(e) => toggleDestroyed(e, shipName)}
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
          {!gamePhase && (
            <button className={css.buttonPlay} onClick={startGame}>
              Play
            </button>
          )}
        </div>
      </section>
    </DndContext>
  );
}
