import React from "react";

const KeyValueCard = ({ title, value, subtext }) => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-100 rounded-sm justify-center">
      <h3
        className="w-full text-center font-bold text-slate-400"
        style={{
          fontSize: ".8rem",
        }}
      >
        {title}
      </h3>
      <h2
        className=""
        style={{
          fontSize: "2rem",
        }}
      >
        {value}
      </h2>
      <h3
        style={{
          fontSize: ".8rem",
        }}
      >
        {subtext}
      </h3>
    </div>
  );
};

export default KeyValueCard;
