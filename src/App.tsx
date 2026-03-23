import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { BarChart2, BookOpen, Star, Flame, RefreshCw } from "lucide-react";
import GameBoard from "./components/GameBoard";
import PersonaInfo from "./components/PersonaInfo";
import PersonaModal from "./components/PersonaModal";
import StatsModal from "./components/StatsModal";
import CompendiumModal from "./components/CompendiumModal";
import HintBox from "./components/HintBox";
import ColorStripes from "./components/ColorStripes";
import Confetti from "./components/Confetti";
import ScrambleText from "./components/ScrambleText";
import type { Persona } from "./types/Persona";
import { getPersonaType } from "./utils/personaTypes";
import { useGameStats } from "./hooks/useGameStats";

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
  const [, setUsedLetters] = useState<Set<string>>(new Set());
  const [progressiveHint, setProgressiveHint] = useState("");
  const [hintPositions, setHintPositions] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [newGuessIndex, setNewGuessIndex] = useState<number | undefined>(undefined);
  const [shake, setShake] = useState(false);
  const [bounceRow, setBounceRow] = useState<number | undefined>(undefined);
  const [confettiActive, setConfettiActive] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);
  const { stats, recordGame } = useGameStats();
  const maxAttempts = 6;

  const updateProgressiveHint = (persona: Persona, nextAttempts: number) => {
    if (!persona || nextAttempts <= 0) return;
    const nameLength = persona.name.length;
    if (nameLength < 5 && nextAttempts % 2 !== 0) return;

    setHintPositions((prev) => {
      const availablePositions: number[] = [];
      for (let i = 0; i < nameLength; i++) {
        if (!prev.includes(i)) availablePositions.push(i);
      }
      if (availablePositions.length === 0) return prev;
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const newPosition = availablePositions[randomIndex];
      const next = [...prev, newPosition].sort((a, b) => a - b);
      return next;
    });
  };

  useEffect(() => {
    const loadPersonas = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch("/personas.json", {
          signal: controller.signal,
          cache: "force-cache",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setPersonas(data);

        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedPersona = data[randomIndex];

        setCurrentPersona(selectedPersona);
        setIsLoading(false);
      } catch (error) {
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
      } finally {
        clearTimeout(timeoutId);
      }
    };

    loadPersonas();
  }, []);

  const handleGuess = useCallback(() => {
    if (currentGuess.length === 0 || gameStatus !== "playing") return;
    if (currentGuess.length !== currentPersona?.name.length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setUsedLetters((prev) => {
      const next = new Set(prev);
      currentGuess
        .toLowerCase()
        .split("")
        .forEach((letter) => {
          if (letter !== " ") next.add(letter);
        });
      return next;
    });

    if (currentPersona) {
      updateProgressiveHint(currentPersona, attempts + 1);
    }

    const nextAttempts = attempts + 1;
    setNewGuessIndex(attempts);
    setGuesses((prev) => [...prev, currentGuess]);
    setAttempts(nextAttempts);

    if (currentGuess.toLowerCase() === currentPersona?.name.toLowerCase()) {
      setGameStatus("won");
      const earned = recordGame(true, nextAttempts, currentPersona.id);
      setScoreEarned(earned);
      const flipDuration = (currentPersona.name.length - 1) * 100 + 600;
      setTimeout(() => {
        setConfettiActive(true);
        setBounceRow(attempts);
        setTimeout(() => setConfettiActive(false), 3500);
      }, flipDuration);
      setTimeout(() => setShowModal(true), flipDuration + 400);
    } else if (nextAttempts >= maxAttempts) {
      setGameStatus("lost");
      recordGame(false, nextAttempts, currentPersona?.id ?? 0);
      setTimeout(() => setShowModal(true), 1000);
    }

    setCurrentGuess("");
  }, [currentGuess, gameStatus, currentPersona, attempts]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleGuess();
        return;
      }
      if (event.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      const isChar = event.key.length === 1 && /[a-zA-Z]/.test(event.key);
      const isSpace = event.key === " ";
      if (!isChar && !isSpace) return;
      setCurrentGuess((prev) => {
        const max = currentPersona?.name.length ?? 20;
        if (prev.length >= max) return prev;
        return prev + (isSpace ? " " : event.key);
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleGuess, currentPersona?.name]);

  useEffect(() => {
    if (!currentPersona) return;
    const nameLength = currentPersona.name.length;
    const targetLower = currentPersona.name.toLowerCase();

    // Mostra la struttura solo dopo il primo tentativo
    if (guesses.length === 0 && hintPositions.length === 0) {
      setProgressiveHint("");
      return;
    }

    // Unione: posizioni rivelate casualmente + posizioni già indovinate correttamente
    const revealed = new Set<number>(hintPositions);
    guesses.forEach((guess) => {
      guess.toLowerCase().split("").forEach((char, i) => {
        if (i < nameLength && char === targetLower[i]) {
          revealed.add(i);
        }
      });
    });

    let hint = "";
    for (let i = 0; i < nameLength; i++) {
      hint += revealed.has(i) ? currentPersona.name[i] : "_";
    }
    setProgressiveHint(hint);
  }, [hintPositions, currentPersona, guesses]);

  const resetGame = () => {
    if (personas.length > 0) {
      const available = personas.filter((p) => p.id !== currentPersona?.id);
      const pool = available.length > 0 ? available : personas;
      const randomIndex = Math.floor(Math.random() * pool.length);
      setCurrentPersona(pool[randomIndex]);
    }
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setAttempts(0);
    setUsedLetters(new Set());
    setProgressiveHint("");
    setHintPositions([]);
    setShowModal(false);
    setNewGuessIndex(undefined);
    setShake(false);
    setBounceRow(undefined);
    setConfettiActive(false);
    setScoreEarned(0);
  };

  return (
    <div
      className="min-h-screen text-black relative"
      style={{ backgroundColor: "#FFF424" }}
    >
      <ColorStripes />

      <header className="relative z-10">
        {/* Date and stats box - top right */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 space-y-2 sm:space-y-4">
          <div
            className="backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-2 sm:p-4"
            style={{
              borderColor: "#FFF424",
              backgroundColor: "#202020",
              color: "#202020",
            }}
          >
            <div className="flex items-center justify-around w-full">
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
              className="sm:text-4xl md:text-2xl lg:text-[6rem] font-bold transform transition-transform neon-text"
              style={{ color: "#202020" }}
            >
              <ScrambleText text="PERSONADLE" duration={1400} />
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 font-bold"
            style={{ color: "#202020" }}
          >
            Guess the Persona!
          </p>

          <div className="mb-4 sm:mb-6 flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-[#FFF424] text-[#FFF424] text-sm tracking-widest"
            >
              <RefreshCw size={14} /> NEW GAME
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-[#FFF424] text-[#FFF424] text-sm tracking-widest"
            >
              <BarChart2 size={14} /> STATS
            </button>
            <button
              onClick={() => setShowCompendium(true)}
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-[#FFF424] text-[#FFF424] text-sm tracking-widest"
            >
              <BookOpen size={14} /> COMPENDIUM
            </button>
            {stats.currentStreak > 0 && (
              <div
                className="flex items-center gap-1.5 font-barlow font-black py-2 px-4 rounded-full text-white text-sm tracking-widest border-2"
                style={{ backgroundColor: "#DC2626", borderColor: "#ff6b6b" }}
              >
                <Flame size={14} /> {stats.currentStreak}
              </div>
            )}
            {stats.totalScore > 0 && (
              <div
                className="flex items-center gap-1.5 font-barlow font-black py-2 px-3 rounded-lg text-white text-sm tracking-widest border-2"
                style={{ backgroundColor: "#DC2626", borderColor: "#DC2626" }}
              >
                <Star size={13} /> {stats.totalScore.toLocaleString()}
              </div>
            )}
          </div>

          {gameStatus === "playing" && (
            <div
              className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-sm sm:text-lg font-semibold text-black">
                Attempts:
              </span>
              <div className="flex space-x-1 sm:space-x-2">
                {Array.from({ length: maxAttempts }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-100 hover:scale-150 ${
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
          <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
              <div className="animate-fade-in-up flex justify-center lg:justify-start">
                <div
                  className="backdrop-blur-sm border-4 sm:border-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover-lift w-full max-w-xs sm:max-w-sm lg:max-w-none min-h-[300px] sm:min-h-[400px]"
                  style={{
                    borderColor: "#FFF424",
                    backgroundColor: "#202020",
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
                    newGuessIndex={newGuessIndex}
                    shake={shake}
                    bounceRow={bounceRow}
                  />


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
                <p className="mb-6 text-white">
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

      <footer className="relative w-full z-40 pb-10 sm:pb-12 md:pb-14 sm:px-6">
        <div>
          <div className="text-center text-[9px] sm:text-[11px] md:text-xs lg:text-sm text-[#202020] font-normal leading-relaxed space-y-1 sm:space-y-2">
            <div>
              All credits to <span className="font-semibold">Atlus™</span>; also
              thanks to{" "}
              <a
                className="underline hover:text-red-600 transition-colors font-semibold"
                href="https://megatenwiki.com/wiki/Main_Page"
                target="_blank"
                rel="noopener noreferrer"
              >
                megatenwiki
              </a>{" "}
              (images).
              <div>
                Also a huge thanks to{" "}
                <a
                  className="underline font-bold hover:text-red-600 transition-colors"
                  href="https://github.com/luyluish/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LuyLuish
                </a>{" "}
                for exposing the API for the informations about the Personas!
              </div>
              <div>
                This project is{" "}
                <a
                  href="https://github.com/brizzaa/personadle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-600 transition-colors font-semibold"
                >
                  open-source!
                </a>{" "}
                If you want to contribute feel free to copy the repo and send a
                PR!
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 w-full h-8 sm:h-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 flex items-center overflow-hidden shadow-2xl z-50 pointer-events-none">
        <div className="text-white font-bold text-xl sm:text-3xl scroll-animation whitespace-nowrap flex items-center">
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle personadle personadle personadle personadle
          personadle personadle
        </div>
      </div>

      <Confetti active={confettiActive} />

      {currentPersona && (gameStatus === "won" || gameStatus === "lost") && (
        <PersonaModal
          persona={currentPersona}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onNewGame={resetGame}
          gameStatus={gameStatus}
          attempts={attempts}
          maxAttempts={maxAttempts}
          guesses={guesses}
          scoreEarned={scoreEarned}
          totalScore={stats.totalScore}
          streak={stats.currentStreak}
        />
      )}

      <StatsModal
        stats={stats}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      <CompendiumModal
        personas={personas}
        unlockedIds={stats.unlockedPersonaIds}
        isOpen={showCompendium}
        onClose={() => setShowCompendium(false)}
      />
    </div>
  );
}

export default App;
