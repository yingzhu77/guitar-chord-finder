import { noteName, normalizePitchClass, type PitchClass } from "./notes";
import type { TuningPreset, TuningString } from "./tunings";

export type SelectedFretMap = Record<number, number | null | undefined>;

export interface FretNote {
  stringIndex: number;
  stringNumber: number;
  fret: number;
  pitchClass: PitchClass;
  noteName: string;
  midi: number;
}

export interface DisplayString {
  index: number;
  string: TuningString;
  openNoteName: string;
}

export function noteAtFret(tuning: TuningPreset, stringIndex: number, fret: number): FretNote {
  const string = tuning.strings[stringIndex];
  if (!string) {
    throw new Error(`String index ${stringIndex} is outside the tuning range`);
  }

  const pitchClass = normalizePitchClass(string.pitchClass + fret);
  return {
    stringIndex,
    stringNumber: string.stringNumber,
    fret,
    pitchClass,
    noteName: noteName(pitchClass),
    midi: string.midi + fret,
  };
}

export function getSelectedNotes(tuning: TuningPreset, selectedFrets: SelectedFretMap): FretNote[] {
  return tuning.strings
    .map((_, stringIndex) => {
      const fret = selectedFrets[stringIndex];
      return typeof fret === "number" ? noteAtFret(tuning, stringIndex, fret) : null;
    })
    .filter((note): note is FretNote => note !== null);
}

export function toggleFretSelection(selectedFrets: SelectedFretMap, stringIndex: number, fret: number): SelectedFretMap {
  return {
    ...selectedFrets,
    [stringIndex]: selectedFrets[stringIndex] === fret ? null : fret,
  };
}

export function uniquePitchClasses(notes: FretNote[]): PitchClass[] {
  return Array.from(new Set(notes.map((note) => note.pitchClass)));
}

export function getBassNote(notes: FretNote[]): FretNote | null {
  if (notes.length === 0) {
    return null;
  }

  return notes.reduce((lowest, note) => (note.midi < lowest.midi ? note : lowest), notes[0]);
}
