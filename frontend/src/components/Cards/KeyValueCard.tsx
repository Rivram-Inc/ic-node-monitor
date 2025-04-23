import React from "react";

type KeyValueCardProps = {
  title: string;
  value: string;
  subtext: string;
  loading?: boolean;
};

const KeyValueCard = ({
  title,
  value,
  subtext,
  loading = false,
}: KeyValueCardProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-100 rounded-sm justify-center">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default KeyValueCard;
