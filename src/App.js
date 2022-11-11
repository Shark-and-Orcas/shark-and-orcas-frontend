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
    });
    socket.off("moved").on("moved", (res) => {
      movesHandler(res.from, res.to);
    });
  }, []);
  const [userName, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const {
    board,
    highlight,
    turn,
    initialGoat,
    goatPlacer,
    movesHandler,
    clickHandler,
    killedGoat,
  } = useLogic(socket);
  return (
    <div className="App">
      <h2>{turn}</h2>
      <h4>Number of goats palced: {initialGoat} </h4>
      <p>Number of goats killed: {killedGoat}</p>
      <p>{response}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
      <Board board={board} highlight={highlight} clickHandler={clickHandler} />
    </div>
  );
}

export default App;
