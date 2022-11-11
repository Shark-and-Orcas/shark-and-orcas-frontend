import React from "react";
import "./Board.sass";

export default function Board({
  height = "400px",
  width = "400px",
  board,
  highlight,
  clickHandler,
}) {
  return (
    <div className="Board" style={{ height: height, width: width }}>
      <div className="Background">
        <div className="spans">
          <span className="cl1 l" />
          <span className="cl2 l" />
          <span className="cl3 l" />
          <span className="cl4 l" />
          <span className="cl5 l" />
          <span className="rl1 l r" />
          <span className="rl2 l r" />
          <span className="rl3 l r" />
          <span className="rl4 l r" />
          <span className="rl5 l r" />
          <span className="d1 l r" />
          <span className="d2 l r" />
          <span className="box" />
        </div>
      </div>
      <div className="Positions">
        {board.map((value, index) => (
          <div className="rows">
            {value.map((rv, ri) => (
              <span
                className={
                  highlight.some((value) => value.x === index && value.y === ri)
                    ? "pos active"
                    : "pos"
                }
                onClick={() => {
                  clickHandler({ x: index, y: ri });
                }}
              >
                {rv === "T" ? <p>T</p> : null}
                {rv === "G" ? <p>G</p> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
