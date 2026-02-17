import { useState } from "react";
import css from "./battleships.module.css";

const size = 10 * 10;
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let player; // 1, 2

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

export default function Board() {
  const [board] = useState(() => createBoard());

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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
