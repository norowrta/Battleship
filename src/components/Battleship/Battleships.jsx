import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import DraggableShip from "./DraggableShip.jsx";
import DroppableCell from "./DroppableCell.jsx";
import css from "./battleships.module.css";
import Icon from "../Icon";
import ships from "./ships.json";

const size = 10 * 10;
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let player;

function createBoard() {
  let board = [];
  for (let i = 0; i < size; i++) {
    const cell = {
      id: i,
      x: i % 10,
      y: Math.floor(i / 10),
      hasShip: false,
      status: "empty",
    };
    board.push(cell);
  }
  return board;
}

function addClass(e) {
  e.preventDefault();
  if (e.target.tagName == "A") {
    e.target.classList.toggle(`${css.destroyedShip}`);
  }
}

export default function Board() {
  const [board] = useState(() => createBoard());
  const [shipsState, setShipsState] = useState(() => ships);
  const [activeId, setActiveId] = useState(null);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const shipName = active.id;
    const dropCellId = parseInt(over.id);

    const currentShip = shipsState.find((s) => s.name === shipName);
    const shipSize = currentShip.size;
    const orientation = currentShip.orientation;

    const x = dropCellId % 10;
    const y = Math.floor(dropCellId / 10);

    if (orientation === "horizontal") {
      if (x + shipSize > 10) return;
    } else {
      if (y + shipSize > 10) return;
    }
    let newCoordinates = [];
    for (let i = 0; i < shipSize; i++) {
      if (orientation === "horizontal") {
        newCoordinates.push(dropCellId + i);
      } else {
        newCoordinates.push(dropCellId + i * 10);
      }
    }

    const isOverlapping = shipsState.some((otherShip) => {
      if (otherShip.name === shipName) return false;
      if (!otherShip.placed) return false;
      return newCoordinates.some((coord) =>
        otherShip.coordinates.includes(coord),
      );
    });

    if (isOverlapping) return;

    setShipsState((prevShips) =>
      prevShips.map((ship) => {
        if (ship.name === shipName) {
          return {
            ...ship,
            placed: true,
            coordinates: newCoordinates,
          };
        }
        return ship;
      }),
    );
  }

  function getShipContent(cellId) {
    const shipAtCell = shipsState.find(
      (ship) => ship.placed && ship.coordinates.includes(cellId),
    );

    if (shipAtCell) {
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
          style={{
            transform: `rotate(${rotationAngle})`,
            display: "block",
          }}
        />
      );
    }
    return null;
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === "Space" && activeId) {
        event.preventDefault();

        setShipsState((prevShips) =>
          prevShips.map((ship) => {
            if (ship.name === activeId) {
              const newOrientation =
                ship.orientation === "horizontal" ? "vertical" : "horizontal";
              return { ...ship, orientation: newOrientation };
            }
            return ship;
          }),
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeId]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                      <DroppableCell key={item.id} id={item.id}>
                        {getShipContent(item.id)}
                      </DroppableCell>
                    ))}
                  </div>
                </div>

                <div className={css.shipyard}>
                  <h3 className={css.shipyardTitle}>Shipyard</h3>
                  <div className={css.shipyardShips}>
                    {shipsState.map((ship) => {
                      if (ship.placed) return null;

                      return <DraggableShip key={ship.name} ship={ship} />;
                    })}
                  </div>
                </div>
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
                    {board.map((item) => (
                      <div
                        key={item.id}
                        className={`${css.cell} ${css.cellEnemy}`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className={css.shipyard}>
                  <h3 className={css.shipyardTitle}>graveyard</h3>
                  <div
                    onClick={(e) => addClass(e)}
                    className={css.graveyardShips}
                  >
                    <a href="#" className={css.shipyardDestroyed}>
                      Battleship (4)
                    </a>
                    <a href="#" className={css.shipyardDestroyed}>
                      Submarine (3)
                    </a>
                    <a href="#" className={css.shipyardDestroyed}>
                      Cruiser (2)
                    </a>
                    <a href="#" className={css.shipyardDestroyed}>
                      Aircraft Carrier (5)
                    </a>
                    <a href="#" className={css.shipyardDestroyed}>
                      Destroyer (3)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DndContext>
  );
}
