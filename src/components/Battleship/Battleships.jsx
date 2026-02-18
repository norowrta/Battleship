// import Icon from "../Icon";
import { useState } from "react";
import css from "./battleships.module.css";
import ships from "./ships.json";

const size = 10 * 10;
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let player; // 1, 2

import shipFront from "../../assets/shipFront.svg";
import shipMiddle from "../../assets/shipMiddle.svg";
import shipBack from "../../assets/shipBack.svg";

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

function createShip(ship) {
  let shipsSegment = [];

  for (let index = 0; index < ship.size; index++) {
    switch (index) {
      case 0:
        shipsSegment.push({ type: "front" });
        break;
      case ship.size - 1:
        shipsSegment.push({ type: "back" });
        break;

      default:
        shipsSegment.push({ type: "middle" });
        break;
    }
  }

  return shipsSegment;
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

  return (
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
                    <div key={item.id} className={css.cell}></div>
                  ))}
                </div>
              </div>

              <div className={css.shipyard}>
                <h3 className={css.shipyardTitle}>Shipyard</h3>
                <div className={css.shipyardShips}>
                  {shipsState.map((ship) => {
                    const segments = createShip(ship);
                    return (
                      <div key={ship.name} className={css.ship}>
                        {segments.map((segment, index) => {
                          switch (segment.type) {
                            case "front":
                              return (
                                <div className={css.shipCell} key={index}>
                                  {/* <Icon
                                    name="ShipFront"
                                    width="32px"
                                    height="32px"
                                  /> */}
                                  <img src={shipFront} alt="" />
                                </div>
                              );
                            case "back":
                              return (
                                <div className={css.shipCell} key={index}>
                                  {/* <Icon
                                    name="ShipBack"
                                    width="32px"
                                    height="32px"
                                  /> */}
                                  <img src={shipBack} alt="" />
                                </div>
                              );

                            default:
                              return (
                                <div className={css.shipCell} key={index}>
                                  {/* <Icon
                                    name="ShipMiddle"
                                    width="32px"
                                    height="32px"
                                  /> */}
                                  <img src={shipMiddle} alt="" />
                                </div>
                              );
                          }
                        })}
                      </div>
                    );
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
  );
}
