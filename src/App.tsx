import "./App.css";
import { useState, useEffect } from "react";
import GameBoard from "./components/GameBoard";
import PersonaInfo from "./components/PersonaInfo";
import PersonaModal from "./components/PersonaModal";
import HintBox from "./components/HintBox";
import ColorStripes from "./components/ColorStripes";
import type { Persona } from "./types/Persona";
import { getPersonaType } from "./utils/personaTypes";

function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [progressiveHint, setProgressiveHint] = useState("");
  const [hintPositions, setHintPositions] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const maxAttempts = 6;

  const generateProgressiveHint = (persona: Persona, attempts: number) => {
    if (!persona || attempts <= 0) return "";

    const nameLength = persona.name.length;

    if (nameLength < 5 && attempts % 2 !== 0) {
      return progressiveHint;
    }

    const availablePositions = [];
    for (let i = 0; i < nameLength; i++) {
      if (!hintPositions.includes(i)) {
        availablePositions.push(i);
      }
    }

    if (availablePositions.length === 0) return progressiveHint;

    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const newPosition = availablePositions[randomIndex];

    const newHintPositions = [...hintPositions, newPosition].sort(
      (a, b) => a - b
    );
    setHintPositions(newHintPositions);

    let hint = "";
    for (let i = 0; i < nameLength; i++) {
      if (newHintPositions.includes(i)) {
        hint += persona.name[i];
      } else {
        hint += "_";
      }
    }

    return hint;
  };

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        console.log("📁 Loading personas from local data...");
        const response = await fetch("/personas.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("✅ Local data loaded:", data.length, "personas");
        console.log("✅ First persona:", data[0]);
        setPersonas(data);

        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedPersona = data[randomIndex];
        console.log("✅ Selected persona:", selectedPersona);
        console.log("✅ Selected persona image:", selectedPersona.image);
        setCurrentPersona(selectedPersona);
        setIsLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento dei dati locali:", error);
        const fallbackPersonas = [
          {
            id: 1,
            name: "Arsene",
            arcana: "Fool",
            level: 1,
            description:
              "A gentleman thief who appears in Arsène Lupin stories.",
            image: "https://megatenwiki.com/images/1/1a/P5_Arsene_Artwork.png",
            strength: 2,
            magic: 2,
            endurance: 2,
            agility: 3,
            luck: 1,
            weak: ["Electric"],
            resists: [],
            reflects: [],
            absorbs: [],
            nullifies: [],
            dlc: 0,
            query: "arsene",
          },
        ];
        setPersonas(fallbackPersonas);
        setCurrentPersona(fallbackPersonas[0]);
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleGuess();
      } else if (event.key === "Backspace") {
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (event.key === " ") {
        if (currentGuess.length < (currentPersona?.name.length || 20)) {
          setCurrentGuess(currentGuess + " ");
        }
      } else if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        if (currentGuess.length < (currentPersona?.name.length || 20)) {
          setCurrentGuess(currentGuess + event.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus]);

  const handleGuess = () => {
    if (currentGuess.length === 0 || gameStatus !== "playing") return;

    if (currentGuess.length !== currentPersona?.name.length) return;

    const newUsedLetters = new Set(usedLetters);
    currentGuess
      .toLowerCase()
      .split("")
      .forEach((letter) => {
        if (letter !== " ") {
          newUsedLetters.add(letter);
        }
      });
    setUsedLetters(newUsedLetters);

    if (currentPersona) {
      const newHint = generateProgressiveHint(currentPersona, attempts + 1);
      setProgressiveHint(newHint);
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setAttempts(attempts + 1);

    if (currentGuess.toLowerCase() === currentPersona?.name.toLowerCase()) {
      setGameStatus("won");
      setTimeout(() => setShowModal(true), 1000);
    } else if (attempts + 1 >= maxAttempts) {
      setGameStatus("lost");
      setTimeout(() => setShowModal(true), 1000);
    }

    setCurrentGuess("");
  };

  const resetGame = () => {
    if (personas.length > 0) {
      const randomIndex = Math.floor(Math.random() * personas.length);
      setCurrentPersona(personas[randomIndex]);
    }
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setAttempts(0);
    setUsedLetters(new Set());
    setProgressiveHint("");
    setHintPositions([]);
    setShowModal(false);
  };

  return (
    <div
      className="min-h-screen text-black relative"
      style={{ backgroundColor: "#FFF424" }}
    >
      <ColorStripes />

      <header className="relative z-10">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 space-y-2 sm:space-y-4">
          <div
            className="backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-2 sm:p-4"
            style={{
              borderColor: "#FFF424",
              backgroundColor: "#202020",
              color: "#202020",
            }}
          >
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-white">
                {new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="text-xs sm:text-sm text-[#FFF424] font-semibold">
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                  })
                  .toUpperCase()}
              </div>
            </div>
          </div>

          {currentPersona &&
            ((currentPersona.weak && currentPersona.weak.length > 0) ||
              (currentPersona.resists &&
                currentPersona.resists.length > 0)) && (
              <div
                className="backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-2 sm:p-3"
                style={{
                  borderColor: "#FFF424",
                  backgroundColor: "#202020",
                  color: "#202020",
                }}
              >
                <div className="space-y-1 sm:space-y-2">
                  {currentPersona.weak && currentPersona.weak.length > 0 && (
                    <div>
                      <div className="text-xs text-red-400 mb-1 text-center font-semibold hidden sm:block">
                        Weaknesses
                      </div>
                      <div className="text-xs text-red-400 mb-1 text-center font-semibold sm:hidden">
                        Weak
                      </div>
                      <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {currentPersona.weak.map((element) => (
                          <div
                            key={element}
                            className="w-8 h-8 sm:w-15 sm:h-15"
                          >
                            <div
                              className="w-full h-full rounded"
                              style={{
                                backgroundImage: `url("/icons/${
                                  getPersonaType(element).icon
                                }.png")`,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPersona.resists &&
                    currentPersona.resists.length > 0 && (
                      <div>
                        <div className="text-xs text-[#FFF424] mb-1 text-center font-semibold hidden sm:block">
                          Resists
                        </div>
                        <div className="text-xs text-[#FFF424] mb-1 text-center font-semibold sm:hidden">
                          Resist
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-2">
                          {currentPersona.resists.map((element) => (
                            <div
                              key={element}
                              className="w-8 h-8 sm:w-15 sm:h-15"
                            >
                              <div
                                className="w-full h-full rounded"
                                style={{
                                  backgroundImage: `url("/icons/${
                                    getPersonaType(element).icon
                                  }.png")`,
                                  backgroundSize: "contain",
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "center",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
        </div>

        <div className="text-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4">
          <div className="relative inline-block">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-2 transform hover:scale-105 transition-transform duration-300"
              style={{ color: "#202020" }}
            >
              PERSONADLE
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 font-medium"
            style={{ color: "#202020" }}
          >
            Guess the Persona!
          </p>

          <div className="mb-4 sm:mb-6 flex justify-center space-x-4">
            <button
              onClick={resetGame}
              className="text-[#FFF424] font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 border-4 sm:border-6 transform hover:scale-105 text-sm sm:text-base"
              style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
            >
              New Game
            </button>
          </div>

          {gameStatus === "playing" && (
            <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4">
              <span className="text-sm sm:text-lg font-semibold text-black">
                Attempts:
              </span>
              <div className="flex space-x-1 sm:space-x-2">
                {Array.from({ length: maxAttempts }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                      i < attempts
                        ? "bg-red-500 scale-110 shadow-lg"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm sm:text-lg font-semibold text-black">
                {attempts}/{maxAttempts}
              </span>
            </div>
          )}

          {usedLetters.size > 0 && gameStatus === "playing" && (
            <div className="mb-4 flex justify-center">
              <div
                className="backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-3 sm:p-4 w-11/12 sm:w-4/5 max-w-2xl"
                style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
              >
                <div className="text-xs sm:text-sm font-bold text-white mb-2 text-center">
                  Used letters:
                </div>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {Array.from(usedLetters).map((letter) => (
                    <span
                      key={letter}
                      className="bg-[#FFF424] text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-bold"
                    >
                      {letter.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 px-2 sm:px-4 pb-24 sm:pb-16">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-96">
            <div
              className="text-center backdrop-blur-sm border-6 rounded-2xl p-12"
              style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFF424] mx-auto mb-4"></div>
              <p className="text-xl font-semibold mb-2 text-white">
                Loading Persona...
              </p>
              <p className="text-sm text-white mb-4">
                Preparing the challenge for you!
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-[#FFF424] h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>
        ) : currentPersona ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
              <div className="animate-fade-in-up flex justify-center lg:justify-start">
                <div
                  className="backdrop-blur-sm border-4 sm:border-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover-lift w-full max-w-xs sm:max-w-sm lg:max-w-none"
                  style={{
                    borderColor: "#FFF424",
                    backgroundColor: "#202020",
                    minHeight: "300px sm:minHeight: 400px",
                  }}
                >
                  <PersonaInfo persona={currentPersona} />
                </div>
              </div>

              <div
                className="flex items-center justify-center animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div
                  className="backdrop-blur-sm border-4 sm:border-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 w-full max-w-xs sm:max-w-sm lg:max-w-lg hover-lift"
                  style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
                >
                  {currentPersona && (
                    <HintBox
                      persona={currentPersona}
                      progressiveHint={progressiveHint}
                      gameStatus={gameStatus}
                    />
                  )}

                  <GameBoard
                    guesses={guesses}
                    currentGuess={currentGuess}
                    maxAttempts={maxAttempts}
                    currentPersona={currentPersona}
                  />

                  <div className="mb-4 sm:hidden flex justify-center">
                    <div
                      className="backdrop-blur-sm border-2 border-[#FFF424] rounded p-2 mt-3"
                      style={{ backgroundColor: "#202020", maxWidth: "200px" }}
                    >
                      <div className="flex gap-1 justify-center">
                        <input
                          type="text"
                          value={currentGuess}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value.length <=
                                (currentPersona?.name.length || 20) &&
                              /^[a-zA-Z\s]*$/.test(value)
                            ) {
                              setCurrentGuess(value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleGuess();
                            }
                          }}
                          placeholder={`${currentPersona?.name.length || 0}`}
                          className="w-20 px-1.5 bg-gray-800 text-white border border-[#FFF424] rounded focus:outline-none text-center font-bold mobile-input text-xs"
                          style={{ fontSize: "14px" }}
                          maxLength={currentPersona?.name.length || 20}
                        />
                        <button
                          onClick={handleGuess}
                          disabled={
                            currentGuess.length === 0 ||
                            gameStatus !== "playing"
                          }
                          className="px-1.5 bg-[#FFF424] text-black font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors text-xs"
                        >
                          Guess!
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-96">
            <div
              className="backdrop-blur-sm border-6 rounded-2xl p-8 max-w-md w-full"
              style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4 text-red-400">
                  Loading Error
                </h2>
                <p className="mb-6" style={{ color: "#202020" }}>
                  It was not possible to load the data of the Persona.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 border-2 border-[#FFF424] shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full h-8 sm:h-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 flex items-center overflow-hidden shadow-2xl z-50">
        <div className="text-white font-bold text-xl sm:text-3xl scroll-animation whitespace-nowrap flex items-center">
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle
        </div>
      </div>

      {currentPersona && (gameStatus === "won" || gameStatus === "lost") && (
        <PersonaModal
          persona={currentPersona}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          gameStatus={gameStatus}
        />
      )}
    </div>
  );
}

export default App;
