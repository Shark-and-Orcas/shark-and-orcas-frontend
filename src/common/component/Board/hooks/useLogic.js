import { useEffect, useState } from "react";

export default function useLogic(socket) {
  const [board, setBoard] = useState([
    ["T", "0", "0", "0", "T"],
    ["0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
    ["T", "0", "0", "0", "T"],
  ]);
  const [tempClicked, setTempClicked] = useState({});
  const [currentClicked, setCurrentClicked] = useState({});
  const [highlight, setHighlight] = useState([]);
  const [turn, setTurn] = useState("G");
  const [prevClicked, setPrevClicked] = useState({});
  const [initialGoat, setInitialGoat] = useState(20);

  //   possible moves
  // 1. Add 1 in all directions (00,02,04,
  //                             11,13,15,
  //                             20,22,24,
  //                             31,33,35,
  //                             40,42,44)
  // 2. Add one in one direction only

  // this function takes input from currentClicked and precClicked to find all the possible moves and stores in highlight
  const possibleMovesDetect = () => {
    if (
      currentClicked.hasOwnProperty("x") &&
      currentClicked.hasOwnProperty("y") &&
      board[currentClicked.x][currentClicked.y] === turn
    ) {
      if (
        board[currentClicked.x][currentClicked.y] === "T" ||
        board[currentClicked.x][currentClicked.y] === "G"
      ) {
        let temp = [];
        temp.push(
          { x: currentClicked.x + 1, y: currentClicked.y },
          { x: currentClicked.x, y: currentClicked.y + 1 },
          { x: currentClicked.x, y: currentClicked.y - 1 },
          { x: currentClicked.x - 1, y: currentClicked.y }
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
          if (
            temp[i].x > 4 ||
            temp[i].y > 4 ||
            temp[i].y < 0 ||
            temp[i].x < 0
          ) {
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
          if (
            temp[i].x > 4 ||
            temp[i].y > 4 ||
            temp[i].y < 0 ||
            temp[i].x < 0
          ) {
            temp.splice(i, 1);
          } else {
            if (board[temp[i].x][temp[i].y] !== "0") {
              temp.splice(i, 1);
            }
          }
        }
        setHighlight(temp);
      }
    }
  };

  // this function handles the if the given move is possible or not
  const clickHandler = () => {
    if (
      (initialGoat > 0 &&
        turn === "G" &&
        board[tempClicked.x][tempClicked.y] === "0") ||
      highlight.length <= 1 ||
      !(
        currentClicked.hasOwnProperty("x") && currentClicked.hasOwnProperty("y")
      )
    ) {
      setCurrentClicked(tempClicked);
    } else {
      if (
        highlight.some(
          (value) => value.x === tempClicked.x && value.y === tempClicked.y
        )
      ) {
        setCurrentClicked(tempClicked);
      } else {
        return false;
      }
    }
    return true;
  };

  // need to give from where to where to move the piece
  const movesHandler = (from, to) => {
    if (true || turn == board[from.x][from.y]) {
      console.log("Turn of ", turn, " which has ", board[from.x][from.y]);
      // if (board[from.x][from.y] === turn) {
      console.log(1);
      let tempBoard = [...board];
      tempBoard[to.x][to.y] = board[from.x][from.y];
      tempBoard[from.x][from.y] = "0";
      console.log(2);
      if (Math.abs(from.x - to.x) === 2 || Math.abs(from.y - to.y) === 2) {
        tempBoard[to.x + (from.x - to.x) / 2][to.y + (from.y - to.y) / 2] = "0";
      }
      console.log(3);
      setBoard(tempBoard);
      console.log(4);
      setTurn((currentTurn) => (currentTurn === "T" ? "G" : "T"));
      // }
    }
  };

  const goatPlacer = (to) => {
    let tempBoard = [...board];
    tempBoard[to.x][to.y] = "G";
    setBoard(tempBoard);
    setInitialGoat(initialGoat - 1);
    setTurn("T");
  };

  useEffect(() => {
    if (
      initialGoat > 0 &&
      currentClicked.hasOwnProperty("x") &&
      currentClicked.hasOwnProperty("y") &&
      board[currentClicked.x][currentClicked.y] === "0" &&
      turn === "G"
    ) {
      goatPlacer(currentClicked);
      socket.emit("goatPlaced", { to: currentClicked });
    } else {
      possibleMovesDetect();
      if (prevClicked.hasOwnProperty("x") && prevClicked.hasOwnProperty("y")) {
        if (
          highlight.some(
            (value) =>
              value.x === currentClicked.x && value.y === currentClicked.y
          )
        ) {
          movesHandler(prevClicked, currentClicked);
          socket.emit("moved", { from: prevClicked, to: currentClicked });
        }
      }
      setPrevClicked(currentClicked);
    }
  }, [currentClicked]);

  useEffect(() => {
    if (tempClicked.hasOwnProperty("x") && tempClicked.hasOwnProperty("y")) {
      if (!clickHandler()) {
        setHighlight([{}]);
      }
    }
  }, [tempClicked]);

  useEffect(() => {
    setHighlight([{}]);
    setPrevClicked({});
    setCurrentClicked({});
  }, [turn]);

  return {
    board,
    highlight,
    turn,
    setTurn,
    setTempClicked,
    initialGoat,
    goatPlacer,
    movesHandler,
  };
}
