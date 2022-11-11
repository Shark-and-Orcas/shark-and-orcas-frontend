import { useState } from "react";

export default function useLogic(socket) {
  const [board, setBoard] = useState([
    ["T", "0", "0", "0", "T"],
    ["0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
    ["T", "0", "0", "0", "T"],
  ]);
  const [highlight, setHighlight] = useState([]);
  const [turn, setTurn] = useState("G");
  const [prevClicked, setPrevClicked] = useState({});
  const [initialGoat, setInitialGoat] = useState(20);
  const [killedGoat, setKilledGoat] = useState(0);

  //   possible moves
  // 1. Add 1 in all directions (00,02,04,
  //                             11,13,15,
  //                             20,22,24,
  //                             31,33,35,
  //                             40,42,44)
  // 2. Add one in one direction only

  // this function takes input from currentClicked and precClicked to find all the possible moves and stores in highlight
  const possibleMovesDetect = (currentClicked) => {
    let temp = [];
    temp.push(
      { x: currentClicked.x + 1, y: currentClicked.y },
      { x: currentClicked.x, y: currentClicked.y + 1 },
      { x: currentClicked.x - 1, y: currentClicked.y },
      { x: currentClicked.x, y: currentClicked.y - 1 }
    );
    if ((currentClicked.x + currentClicked.y) % 2 === 0) {
      temp.push(
        { x: currentClicked.x + 1, y: currentClicked.y + 1 },
        { x: currentClicked.x - 1, y: currentClicked.y },
        { x: currentClicked.x - 1, y: currentClicked.y - 1 },
        { x: currentClicked.x + 1, y: currentClicked.y - 1 },
        { x: currentClicked.x - 1, y: currentClicked.y + 1 }
      );
    }

    // clears places if the given index is undefied and adds tigers game logic
    for (let i = temp.length - 1; i >= 0; i--) {
      if (temp[i].x > 4 || temp[i].y > 4 || temp[i].y < 0 || temp[i].x < 0) {
        temp.splice(i, 1);
      } else {
        if (
          board[temp[i].x][temp[i].y] === "G" &&
          board[currentClicked.x][currentClicked.y] === "T"
        ) {
          temp.push({
            x: currentClicked.x + 2 * (temp[i].x - currentClicked.x),
            y: currentClicked.y + 2 * (temp[i].y - currentClicked.y),
          });
        }
      }
    }

    //  removes places if somone is occuping it
    for (let i = temp.length - 1; i >= 0; i--) {
      if (temp[i].x > 4 || temp[i].y > 4 || temp[i].y < 0 || temp[i].x < 0) {
        temp.splice(i, 1);
      } else {
        if (board[temp[i].x][temp[i].y] !== "0") {
          temp.splice(i, 1);
        }
      }
    }

    setHighlight(temp);
    setPrevClicked(currentClicked);
  };

  // this function handles the if the given move is possible or not
  const clickHandler = (tempClicked) => {
    // condition when goat needs to be placed
    if (
      initialGoat > 0 &&
      turn === "G" &&
      board[tempClicked.x][tempClicked.y] === "0"
    ) {
      socket.emit("goatPlaced", { to: tempClicked });
      return goatPlacer(tempClicked);
    }

    // if clicked is already in highlight
    if (
      highlight.some(
        (value) => value.x === tempClicked.x && value.y === tempClicked.y
      )
    ) {
      socket.emit("moved", { from: prevClicked, to: tempClicked });
      return movesHandler(prevClicked, tempClicked);
    }

    // if clicked after changing the turn
    if (highlight.length <= 1 && board[tempClicked.x][tempClicked.y] === turn) {
      return possibleMovesDetect(tempClicked);
    }
  };

  // need to give from where to where to move the piece
  const movesHandler = (from, to) => {
    let tempBoard = [...board];
    tempBoard[to.x][to.y] = board[from.x][from.y];
    tempBoard[from.x][from.y] = "0";
    if (Math.abs(from.x - to.x) === 2 || Math.abs(from.y - to.y) === 2) {
      setKilledGoat(killedGoat + 1);
      tempBoard[to.x + (from.x - to.x) / 2][to.y + (from.y - to.y) / 2] = "0";
    }
    setBoard(tempBoard);
    changeTurn();
  };

  // places goats to given location
  const goatPlacer = (to) => {
    let tempBoard = [...board];
    tempBoard[to.x][to.y] = "G";
    setBoard(tempBoard);
    setInitialGoat(initialGoat - 1);
    changeTurn();
  };

  //changes turn
  const changeTurn = () => {
    setTurn((current) => (current === "T" ? "G" : "T"));
    setHighlight([{}]);
    setPrevClicked({});
  };

  return {
    board,
    highlight,
    turn,
    setTurn,
    initialGoat,
    goatPlacer,
    movesHandler,
    clickHandler,
    killedGoat,
  };
}
