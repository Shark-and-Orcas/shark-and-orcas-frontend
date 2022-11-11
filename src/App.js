import "./App.css";
import Board from "./common/component/Board/views";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import useLogic from "./common/component/Board/hooks/useLogic";
const socket = io("http://127.0.0.1:5000");
function App() {
  const [response, setResponse] = useState("");
  useEffect(() => {
    socket.off("reponse").on("response", (res) => {
      setResponse(res.data);
      console.log(res);
    });
    socket.off("goatPlaced").on("goatPlaced", (res) => {
      console.log("goat should be placed");
      goatPlacer(res.to);
      // setTurn((currentTurn) => (currentTurn === "T" ? "G" : "T"));
    });
    socket.off("moved").on("moved", (res) => {
      movesHandler(res.from, res.to);
      // setTurn((currentTurn) => (currentTurn === "T" ? "G" : "T"));
    });
  }, []);
  const [userName, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const {
    board,
    highlight,
    turn,
    setTempClicked,
    initialGoat,
    goatPlacer,
    movesHandler,
    setTurn,
  } = useLogic(socket);
  return (
    <div className="App">
      <h2>{turn}</h2>
      <h4>Number of goats palced: {initialGoat} </h4>
      <p>{response}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socket.emit("join", { userName, room });
        }}
      >
        <input
          type={"text"}
          placeholder="Username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          required
        />
        <input
          type={"text"}
          placeholder="Room ID"
          onChange={(e) => {
            setRoom(e.target.value);
          }}
          required
        />
        <input type={"submit"} value="Join" />
      </form>
      <hr />
      <hr />
      <Board
        board={board}
        highlight={highlight}
        setTempClicked={setTempClicked}
      />
    </div>
  );
}

export default App;
