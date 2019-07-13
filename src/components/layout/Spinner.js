import React from "react";
import spinner from "./spinner.png";

export default function Spinner() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <img
        src={spinner}
        alt="Loading..."
        style={{
          height: "100px",
          width: "100px",
          display: "block",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -40%)",
          zIndex: 2
        }}
      />
    </div>
  );
}
