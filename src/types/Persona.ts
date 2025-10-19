export interface Persona {
  id: number;
  name: string;
  arcana: string;
  level: number;
  description: string;
  image: string;
  strength: number;
  magic: number;
  endurance: number;
  agility: number;
  luck: number;
  weak?: string[];
  resists?: string[];
  reflects?: string[];
  absorbs?: string[];
  nullifies?: string[];
  dlc: number;
  query: string;
}

export interface GuessResult {
  letter: string;
  status: "correct" | "present" | "absent";
}
