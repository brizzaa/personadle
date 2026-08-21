import "./App.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart2,
  BookOpen,
  Star,
  Flame,
  RefreshCw,
  CalendarDays,
  HelpCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";
import GameBoard from "./components/GameBoard";
import PersonaInfo from "./components/PersonaInfo";
import PersonaModal from "./components/PersonaModal";
import StatsModal from "./components/StatsModal";
import CompendiumModal from "./components/CompendiumModal";
import HintBox from "./components/HintBox";
import Keyboard from "./components/Keyboard";
import ColorStripes from "./components/ColorStripes";
import Confetti from "./components/Confetti";
import ScrambleText from "./components/ScrambleText";
import HowToPlayModal from "./components/HowToPlayModal";
import type { Persona } from "./types/Persona";
import { getPersonaType } from "./utils/personaTypes";
import { useGameStats } from "./hooks/useGameStats";
import type { GameRecordResult } from "./hooks/useGameStats";
import { normalizeName } from "./utils/feedback";
import { getDayNumber, getDailyPersona } from "./utils/daily";

const DAILY_KEY = "personadle_daily";
const INTRO_KEY = "personadle_seen_intro";
const maxAttempts = 6;

interface SavedDaily {
  day: number;
  guesses: string[];
  hintPositions: number[];
  gameStatus: "playing" | "won" | "lost";
  scoreEarned: number;
}

function loadSavedDaily(day: number): SavedDaily | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedDaily;
    return saved.day === day ? saved : null;
  } catch {
    return null;
  }
}

function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [day] = useState(() => getDayNumber());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [progressiveHint, setProgressiveHint] = useState("");
  const [hintPositions, setHintPositions] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [newGuessIndex, setNewGuessIndex] = useState<number | undefined>(undefined);
  const [shake, setShake] = useState(false);
  const [bounceRow, setBounceRow] = useState<number | undefined>(undefined);
  const [confettiActive, setConfettiActive] = useState(false);
  const [gameResult, setGameResult] = useState<GameRecordResult | null>(null);
  const [toast, setToast] = useState("");
  const { stats, recordGame } = useGameStats();

  const attempts = guesses.length;
  const anyModalOpen = showModal || showStats || showCompendium || showHowTo;

  const validNames = useMemo(
    () => new Set(personas.map((p) => normalizeName(p.name))),
    [personas]
  );

  const showToast = (message: string) => {
    setToast(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setToast(""), 2200);
  };

  // Rivela una lettera in più: mai le ultime 2 (il finale resta da dedurre);
  // per nomi corti (<5) solo ai tentativi 2 e 4.
  const updateProgressiveHint = (persona: Persona, nextAttempts: number) => {
    const nameLength = persona.name.length;
    if (nameLength < 5 && nextAttempts !== 2 && nextAttempts !== 4) return;

    setHintPositions((prev) => {
      const maxReveals = Math.max(nameLength - 2, 1);
      if (prev.length >= maxReveals) return prev;
      const availablePositions: number[] = [];
      for (let i = 0; i < nameLength; i++) {
        if (!prev.includes(i) && persona.name[i] !== " ") availablePositions.push(i);
      }
      if (availablePositions.length === 0) return prev;
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      return [...prev, availablePositions[randomIndex]].sort((a, b) => a - b);
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
        const data: Persona[] = await response.json();
        setPersonas(data);
        setCurrentPersona(getDailyPersona(data, day));

        const saved = loadSavedDaily(day);
        if (saved) {
          setGuesses(saved.guesses);
          setHintPositions(saved.hintPositions);
          setGameStatus(saved.gameStatus);
          if (saved.gameStatus !== "playing") {
            setGameResult({
              scoreEarned: saved.scoreEarned,
              newAchievements: [],
              personaWasNew: false,
            });
            setShowModal(true);
          }
        }
        setIsLoading(false);
        if (!localStorage.getItem(INTRO_KEY)) {
          setShowHowTo(true);
          localStorage.setItem(INTRO_KEY, "1");
        }
      } catch {
        setLoadError(true);
        setIsLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    loadPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistenza del daily in corso: refresh = si riprende da dove si era
  useEffect(() => {
    if (mode !== "daily" || isLoading || !currentPersona) return;
    const saved: SavedDaily = {
      day,
      guesses,
      hintPositions,
      gameStatus,
      scoreEarned: gameResult?.scoreEarned ?? 0,
    };
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(saved));
    } catch {}
  }, [mode, isLoading, currentPersona, day, guesses, hintPositions, gameStatus, gameResult]);

  const submitGuess = useCallback(
    (rawGuess: string) => {
      if (!currentPersona || gameStatus !== "playing") return;
      const guess = rawGuess.trimEnd();
      if (guess.length === 0) return;
      if (guess.length !== currentPersona.name.length) {
        showToast(`The name is ${currentPersona.name.length} characters long`);
        return;
      }
      if (!validNames.has(normalizeName(guess))) {
        showToast("Not a Persona name");
        return;
      }

      updateProgressiveHint(currentPersona, attempts + 1);

      const nextAttempts = attempts + 1;
      setNewGuessIndex(attempts);
      setGuesses((prev) => [...prev, guess]);

      const isDaily = mode === "daily";
      if (normalizeName(guess) === normalizeName(currentPersona.name)) {
        setGameStatus("won");
        const result = recordGame(true, nextAttempts, currentPersona.id, isDaily ? day : null);
        setGameResult(result);
        const flipDuration = (currentPersona.name.length - 1) * 100 + 600;
        setTimeout(() => {
          setConfettiActive(true);
          setBounceRow(nextAttempts - 1);
          setTimeout(() => setConfettiActive(false), 3500);
        }, flipDuration);
        setTimeout(() => setShowModal(true), flipDuration + 400);
      } else if (nextAttempts >= maxAttempts) {
        setGameStatus("lost");
        const result = recordGame(false, nextAttempts, currentPersona.id, isDaily ? day : null);
        setGameResult(result);
        setTimeout(() => setShowModal(true), 1000);
      }

      setCurrentGuess("");
    },
    [currentPersona, gameStatus, validNames, attempts, mode, day, recordGame]
  );

  // Aggiunge un carattere auto-riempiendo gli spazi del nome (es. "Black Frost")
  const appendChar = useCallback(
    (char: string) => {
      setCurrentGuess((prev) => {
        const target = currentPersona?.name ?? "";
        if (prev.length >= target.length) return prev;
        let next = prev + char;
        while (next.length < target.length && target[next.length] === " ") {
          next += " ";
        }
        return next;
      });
    },
    [currentPersona?.name]
  );

  const removeChar = useCallback(() => {
    setCurrentGuess((prev) => prev.replace(/ +$/, "").slice(0, -1));
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "ENTER") {
        submitGuess(currentGuess);
      } else if (key === "BACKSPACE") {
        removeChar();
      } else if (/^[a-zA-Z]$/.test(key)) {
        appendChar(key);
      }
    },
    [submitGuess, currentGuess, removeChar, appendChar]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (anyModalOpen || gameStatus !== "playing") return;
      if (event.key === "Enter") {
        handleKey("ENTER");
      } else if (event.key === "Backspace") {
        handleKey("BACKSPACE");
      } else if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        handleKey(event.key);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, anyModalOpen, gameStatus]);

  useEffect(() => {
    if (!currentPersona) return;
    const nameLength = currentPersona.name.length;
    const targetNorm = normalizeName(currentPersona.name);

    // Mostra la struttura solo dopo il primo tentativo
    if (guesses.length === 0 && hintPositions.length === 0) {
      setProgressiveHint("");
      return;
    }

    // Unione: posizioni rivelate casualmente + posizioni già indovinate correttamente
    const revealed = new Set<number>(hintPositions);
    guesses.forEach((guess) => {
      normalizeName(guess).split("").forEach((char, i) => {
        if (i < nameLength && char === targetNorm[i]) {
          revealed.add(i);
        }
      });
    });

    let hint = "";
    for (let i = 0; i < nameLength; i++) {
      hint += revealed.has(i) || currentPersona.name[i] === " " ? currentPersona.name[i] : "_";
    }
    setProgressiveHint(hint);
  }, [hintPositions, currentPersona, guesses]);

  const clearBoard = () => {
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setProgressiveHint("");
    setHintPositions([]);
    setShowModal(false);
    setNewGuessIndex(undefined);
    setShake(false);
    setBounceRow(undefined);
    setConfettiActive(false);
    setGameResult(null);
  };

  const startPractice = () => {
    if (personas.length === 0) return;
    const available = personas.filter((p) => p.id !== currentPersona?.id);
    const pool = available.length > 0 ? available : personas;
    clearBoard();
    setMode("practice");
    setCurrentPersona(pool[Math.floor(Math.random() * pool.length)]);
  };

  const backToDaily = () => {
    if (personas.length === 0) return;
    clearBoard();
    setMode("daily");
    setCurrentPersona(getDailyPersona(personas, day));
    const saved = loadSavedDaily(day);
    if (saved) {
      setGuesses(saved.guesses);
      setHintPositions(saved.hintPositions);
      setGameStatus(saved.gameStatus);
      if (saved.gameStatus !== "playing") {
        setGameResult({
          scoreEarned: saved.scoreEarned,
          newAchievements: [],
          personaWasNew: false,
        });
        setShowModal(true);
      }
    }
  };

  const suggestions = useMemo(() => {
    if (!currentPersona || gameStatus !== "playing") return [];
    const typed = normalizeName(currentGuess.trimEnd());
    if (typed.length < 2) return [];
    return personas
      .filter(
        (p) =>
          p.name.length === currentPersona.name.length &&
          normalizeName(p.name).startsWith(typed) &&
          normalizeName(p.name) !== typed
      )
      .slice(0, 6);
  }, [currentGuess, currentPersona, personas, gameStatus]);

  const weakUnlocked = attempts >= 2 || gameStatus !== "playing";
  const resistsUnlocked = attempts >= 3 || gameStatus !== "playing";

  const renderAffinityIcons = (elements: string[]) => (
    <div className="flex gap-1.5 flex-wrap justify-center">
      {elements.map((element) => (
        <div
          key={element}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded"
          role="img"
          aria-label={element}
          style={{
            backgroundImage: `url("/icons/${getPersonaType(element).icon}.png")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="min-h-screen text-black relative"
      style={{ backgroundColor: "#FFF424" }}
    >
      <ColorStripes />

      <header className="relative z-10">
        {/* Date box - top right */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <div
            className="backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-2 sm:p-4"
            style={{
              borderColor: "#FFF424",
              backgroundColor: "#202020",
            }}
          >
            <div className="flex items-center justify-around gap-2 w-full">
              <div className="text-sm sm:text-lg font-bold text-white">
                {new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="text-xs sm:text-sm text-brand font-semibold">
                #{day}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4">
          <div className="relative inline-block">
            <h1
              className="text-4xl sm:text-6xl lg:text-[6rem] font-bold transform transition-transform neon-text"
              style={{ color: "#202020" }}
            >
              <ScrambleText text="PERSONADLE" duration={1400} />
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 font-bold"
            style={{ color: "#202020" }}
          >
            {mode === "daily" ? "Guess today's Persona!" : "Practice mode"}
          </p>

          <div className="mb-4 sm:mb-6 flex justify-center items-center gap-2 flex-wrap">
            {mode === "daily" ? (
              <button
                onClick={startPractice}
                className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
              >
                <RefreshCw size={14} /> PRACTICE
              </button>
            ) : (
              <>
                <button
                  onClick={backToDaily}
                  className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
                >
                  <CalendarDays size={14} /> DAILY
                </button>
                <button
                  onClick={startPractice}
                  className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
                >
                  <RefreshCw size={14} /> NEW GAME
                </button>
              </>
            )}
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
            >
              <BarChart2 size={14} /> STATS
            </button>
            <button
              onClick={() => setShowCompendium(true)}
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-4 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
            >
              <BookOpen size={14} /> COMPENDIUM
            </button>
            <button
              onClick={() => setShowHowTo(true)}
              aria-label="How to play"
              className="flex items-center gap-2 header-btn font-barlow font-black py-2 px-3 rounded-lg border-2 border-brand text-brand text-sm tracking-widest"
            >
              <HelpCircle size={14} />
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
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-100 ${
                      i < attempts ? "bg-red-500 scale-110 shadow-lg" : "bg-gray-300"
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand mx-auto mb-4"></div>
              <p className="text-xl font-semibold mb-2 text-white">
                Loading Persona...
              </p>
              <p className="text-sm text-white mb-4">
                Preparing the challenge for you!
              </p>
            </div>
          </div>
        ) : loadError || !currentPersona ? (
          <div className="flex justify-center items-center min-h-96">
            <div
              className="backdrop-blur-sm border-6 rounded-2xl p-8 max-w-md w-full"
              style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
            >
              <div className="text-center">
                <AlertTriangle size={56} className="mx-auto mb-4 text-red-400" />
                <h2 className="text-2xl font-bold mb-4 text-red-400">
                  Loading Error
                </h2>
                <p className="mb-6 text-white">
                  It was not possible to load the Persona data.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 border-2 border-brand shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
              <div className="animate-fade-in-up flex justify-center lg:justify-start">
                <div
                  className="backdrop-blur-sm border-4 sm:border-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover-lift w-full max-w-xs sm:max-w-sm lg:max-w-none"
                  style={{
                    borderColor: "#FFF424",
                    backgroundColor: "#202020",
                  }}
                >
                  <PersonaInfo
                    persona={currentPersona}
                    attempts={attempts}
                    gameStatus={gameStatus}
                  />
                </div>
              </div>

              <div
                className="flex items-start justify-center animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div
                  className="backdrop-blur-sm border-4 sm:border-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 w-full max-w-xs sm:max-w-sm lg:max-w-lg hover-lift"
                  style={{ borderColor: "#FFF424", backgroundColor: "#202020" }}
                >
                  {/* Affinity hints — unlock progressively */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div
                      className="border-2 border-brand rounded-lg p-2 text-center"
                      style={{ backgroundColor: "#111" }}
                    >
                      <div className="text-xs text-red-400 mb-1 font-semibold tracking-wider">
                        WEAK
                      </div>
                      {weakUnlocked ? (
                        currentPersona.weak.length > 0 ? (
                          renderAffinityIcons(currentPersona.weak)
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                          <Lock size={12} /> Guess 2
                        </div>
                      )}
                    </div>
                    <div
                      className="border-2 border-brand rounded-lg p-2 text-center"
                      style={{ backgroundColor: "#111" }}
                    >
                      <div className="text-xs text-brand mb-1 font-semibold tracking-wider">
                        RESIST
                      </div>
                      {resistsUnlocked ? (
                        currentPersona.resists.length > 0 ? (
                          renderAffinityIcons(currentPersona.resists)
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                          <Lock size={12} /> Guess 3
                        </div>
                      )}
                    </div>
                  </div>

                  <HintBox
                    persona={currentPersona}
                    progressiveHint={progressiveHint}
                    gameStatus={gameStatus}
                  />

                  <GameBoard
                    guesses={guesses}
                    currentGuess={currentGuess}
                    maxAttempts={maxAttempts}
                    currentPersona={currentPersona}
                    newGuessIndex={newGuessIndex}
                    shake={shake}
                    bounceRow={bounceRow}
                  />

                  {/* Toast per errori di input */}
                  <div role="status" aria-live="polite" className="h-6 mt-2 text-center">
                    {toast && (
                      <span className="inline-block px-3 py-0.5 rounded-full bg-red-600 text-white text-xs font-barlow font-bold tracking-wider animate-fadeIn">
                        {toast}
                      </span>
                    )}
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-1 mb-2 flex flex-wrap justify-center gap-1.5">
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => submitGuess(p.name)}
                          className="px-2.5 py-1 rounded-md border border-brand text-brand text-xs font-barlow font-bold tracking-wider hover:bg-brand hover:text-black transition-colors"
                          style={{ backgroundColor: "#111" }}
                        >
                          {p.name.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}

                  {gameStatus === "playing" && (
                    <Keyboard
                      onKeyPress={handleKey}
                      guesses={guesses}
                      currentPersona={currentPersona}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative w-full z-40 pb-14 sm:pb-16 sm:px-6">
        <div>
          <div className="text-center text-xs lg:text-sm text-[#202020] font-normal leading-relaxed space-y-1 sm:space-y-2">
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
          onNewGame={startPractice}
          gameStatus={gameStatus}
          attempts={attempts}
          maxAttempts={maxAttempts}
          guesses={guesses}
          gameResult={gameResult}
          totalScore={stats.totalScore}
          streak={stats.currentStreak}
          mode={mode}
          day={day}
          compendiumCount={stats.unlockedPersonaIds.length}
          compendiumTotal={personas.length}
          onOpenCompendium={() => {
            setShowModal(false);
            setShowCompendium(true);
          }}
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

      <HowToPlayModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  );
}

export default App;
