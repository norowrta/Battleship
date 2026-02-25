import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import Board from "./components/Battleship/Battleships";

export default function App() {
  const [win, setWin] = useState(
    () => Number(localStorage.getItem("win")) || 0,
  );
  const [lose, setLose] = useState(
    () => Number(localStorage.getItem("lose")) || 0,
  );

  useEffect(() => {
    localStorage.setItem("win", win);
  }, [win]);

  useEffect(() => {
    localStorage.setItem("lose", lose);
  }, [lose]);

  return (
    <>
      <Header wins={win} loses={lose} />
      <Board win={win} lose={lose} setWin={setWin} setLose={setLose} />
    </>
  );
}
