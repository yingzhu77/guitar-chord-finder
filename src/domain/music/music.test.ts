import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { recognizeChords } from "./chords";
import { getSelectedNotes, noteAtFret, toggleFretSelection, type FretNote } from "./guitar";
import { getPresetById, TUNING_PRESETS } from "./tunings";
import { useGuitarState } from "@/composables/useGuitarState";

function makeNote(pitchClass: FretNote["pitchClass"], midi: number): FretNote {
  return {
    stringIndex: 0,
    stringNumber: 6,
    fret: 0,
    pitchClass,
    noteName: "",
    midi,
  };
}

describe("guitar fretboard notes", () => {
  it("returns the open first string as E in standard tuning", () => {
    const standard = TUNING_PRESETS[0];
    expect(noteAtFret(standard, 5, 0).noteName).toBe("E");
    expect(noteAtFret(standard, 5, 1).noteName).toBe("F");
  });

  it("returns D for the sixth string in Drop D tuning", () => {
    const dropD = getPresetById("drop-d");
    expect(dropD).toBeDefined();
    expect(noteAtFret(dropD!, 0, 0).noteName).toBe("D");
  });

  it("keeps only one selected fret per string", () => {
    let selection = toggleFretSelection({}, 0, 3);
    expect(selection[0]).toBe(3);

    selection = toggleFretSelection(selection, 0, 5);
    expect(selection[0]).toBe(5);

    selection = toggleFretSelection(selection, 0, 5);
    expect(selection[0]).toBeNull();
  });

  it("maps a selected C major grip to selected notes", () => {
    const standard = TUNING_PRESETS[0];
    const notes = getSelectedNotes(standard, {
      1: 3,
      2: 2,
      3: 0,
    });

    expect(notes.map((note) => note.noteName)).toEqual(["C", "E", "G"]);
  });
});

describe("chord recognition", () => {
  it("recognizes a C major triad", () => {
    const results = recognizeChords([makeNote(0, 48), makeNote(4, 52), makeNote(7, 55)]);
    expect(results[0].name).toBe("C");
    expect(results[0].kind).toBe("exact");
  });

  it("shows slash chords when the bass is not the root", () => {
    const results = recognizeChords([makeNote(4, 52), makeNote(7, 55), makeNote(0, 60)]);
    expect(results[0].name).toBe("C/E");
  });

  it("returns a missing-fifth candidate for a dominant seventh shell", () => {
    const results = recognizeChords([makeNote(0, 48), makeNote(4, 52), makeNote(10, 58)]);
    expect(results.some((result) => result.name === "C7(no5)" && result.kind === "partial")).toBe(true);
  });

  it.each([
    ["C", [0, 4, 7], "大三和弦"],
    ["G", [7, 11, 2], "大三和弦"],
    ["D", [2, 6, 9], "大三和弦"],
    ["A", [9, 1, 4], "大三和弦"],
    ["E", [4, 8, 11], "大三和弦"],
    ["Am", [9, 0, 4], "小三和弦"],
    ["Em", [4, 7, 11], "小三和弦"],
    ["Dm", [2, 5, 9], "小三和弦"],
    ["F", [5, 9, 0], "大三和弦"],
    ["G7", [7, 11, 2, 5], "属七和弦"],
    ["Cmaj7", [0, 4, 7, 11], "大七和弦"],
    ["Bm7b5", [11, 2, 5, 9], "半减七和弦"],
  ] as const)("recognizes %s and exposes Chinese labels", (expectedName, pitchClasses, expectedLabel) => {
    const notes = pitchClasses.map((pitchClass, index) => makeNote(pitchClass as FretNote["pitchClass"], 48 + index * 4));
    const results = recognizeChords(notes);
    expect(results.some((result) => result.name === expectedName && result.label === expectedLabel)).toBe(true);
  });

  it("exposes chord tones for learner-facing explanations", () => {
    const results = recognizeChords([makeNote(0, 48), makeNote(4, 52), makeNote(7, 55)]);
    expect(results[0].tones).toEqual(["C", "E", "G"]);
    expect(results[0].displayName).toContain("大三和弦");
  });
});

describe("guitar state", () => {
  let storedSettings: unknown;
  let setStorageSync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storedSettings = "";
    setStorageSync = vi.fn((_: string, value: unknown) => {
      storedSettings = value;
    });

    vi.stubGlobal("uni", {
      getStorageSync: vi.fn(() => storedSettings),
      setStorageSync,
    });
  });

  it("persists settings but not the selected frets", async () => {
    const state = useGuitarState();
    state.setTuning("drop-d");
    state.selectFret(0, 0);
    await nextTick();

    expect(setStorageSync).toHaveBeenCalled();
    expect((storedSettings as { tuningId: string }).tuningId).toBe("drop-d");
    expect((storedSettings as { selectedFrets?: unknown }).selectedFrets).toBeUndefined();
    expect(state.selectedFrets.value[0]).toBe(0);

    state.selectFret(0, 0);
    expect(state.selectedFrets.value[0]).toBeNull();
  });

  it("persists learner-facing settings", async () => {
    const state = useGuitarState();
    state.setShowOpenNotes(true);
    state.dismissIntro();
    await nextTick();

    expect((storedSettings as { showOpenNotes: boolean }).showOpenNotes).toBe(true);
    expect((storedSettings as { hasSeenIntro: boolean }).hasSeenIntro).toBe(true);
  });
});
