"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiDelete } from "react-icons/fi";
import { DateTime } from "luxon"; 

const CORRECT_PIN = "1234";
const PIN_LENGTH = 4;

function Clock() {
  const [time, setTime] = useState(DateTime.now());
  useEffect(() => {
    const timer = setInterval(() => setTime(DateTime.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center text-blue-100 backdrop-shadow-lg">
      {" "}
      <div className="text-6xl md:text-7xl font-thin tracking-wider">
        {time.toFormat("hh:mm")}
        <span className="text-3xl md:text-4xl align-top ml-1 opacity-80">
          {time.toFormat("a")}
        </span>
      </div>
      <div className="text-lg md:text-xl font-light opacity-80 mt-1">
        {time.toFormat("cccc, LLLL dd")}
      </div>
    </div>
  );
}

export default function PinLockScreen({ onUnlock, backgroundImageUrl }) {
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const inputRef = useRef(null);

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  useEffect(() => {
    if (isAwake) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isAwake]);

  const handleWakeUp = () => {
    if (!isAwake) setIsAwake(true);
  };

  const handleInputChange = (e) => {
    if (!isAwake) return;
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= PIN_LENGTH) {
      setPinInput(value);
      setError("");
      if (value.length === PIN_LENGTH) handleSubmit(value);
    }
  };
  const handleButtonClick = (digit) => {
    if (!isAwake || pinInput.length >= PIN_LENGTH) return;
    const newValue = pinInput + digit;
    setPinInput(newValue);
    setError("");
    if (newValue.length === PIN_LENGTH) handleSubmit(newValue);
    inputRef.current?.focus();
  };
  const handleBackspace = () => {
    if (!isAwake) return;
    setPinInput((prev) => prev.slice(0, -1));
    setError("");
    inputRef.current?.focus();
  };
  const handleSubmit = (currentPin) => {
    if (currentPin === CORRECT_PIN) {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect PIN");
      setShake(true);
      setTimeout(() => {
        setPinInput("");
        setShake(false);
        inputRef.current?.focus();
      }, 500);
    }
  };

  return (
    <div
      style={backgroundStyle}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-black p-4 overflow-hidden" // Added overflow-hidden
      onClick={handleWakeUp} 
    >
    
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
          isAwake
            ? "backdrop-blur-md  bg-opacity-30" 
            : "backdrop-blur-none bg-opacity-0" 
        }`}
      ></div>


      <div
        className={`absolute top-4 right-4 text-2xl font-bold bg-opacity-50 bg-amber-400 p-1  rounded transition-opacity duration-700 z-20 ${
          isAwake ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        PIN: {CORRECT_PIN}
      </div>

   
      <div
        className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ease-in-out z-10 ${
          !isAwake ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Clock />
      </div>

      <div
        className={`relative z-10 flex flex-col items-center transition-opacity duration-500 ease-in-out ${
          isAwake ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        <h1 className="text-2xl font-light mb-4">Enter PIN</h1>
        <div className={`flex space-x-3 mb-4 ${shake ? "animate-shake" : ""}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                index < pinInput.length
                  ? "bg-white border-white"
                  : "border-gray-400 border-opacity-50"
              }`}
            ></div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pinInput}
          onChange={handleInputChange}
          maxLength={PIN_LENGTH}
          className="absolute w-px h-px opacity-0"
        />
        <p
          className={`text-red-300 text-sm mb-4 h-5 transition-opacity duration-300 ${
            error ? "opacity-100" : "opacity-0"
          }`}
        >
          {error || "\u00A0"}
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-[250px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "spacer", 0, "backspace"].map((item) =>
            item === "spacer" ? (
              <div key="spacer" className="aspect-square"></div>
            ) : item === "backspace" ? (
              <button
                key="backspace"
                onClick={handleBackspace}
                className="p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-xl font-light focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors aspect-square flex items-center justify-center"
                aria-label="Backspace"
              >
                <FiDelete />
              </button>
            ) : (
              <button
                key={item}
                onClick={() => handleButtonClick(item.toString())}
                className="p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-xl font-light focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors aspect-square"
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

    
      <div
        className={`absolute bottom-10 text-center transition-opacity duration-500 ease-in-out z-10 ${
          !isAwake ? "opacity-70" : "opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-2xl font-extrabold text-white backdrop-shadow-md">
          Click anywhere to unlock
        </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .backdrop-shadow-lg {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        } /* Example shadow for text */
      `}</style>
    </div>
  );
}
