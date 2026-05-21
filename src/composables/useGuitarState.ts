import { computed, reactive, ref, watch } from "vue";
import { recognizeChords } from "@/domain/music/chords";
import {
  getSelectedNotes,
  toggleFretSelection,
  type DisplayString,
  type SelectedFretMap,
} from "@/domain/music/guitar";
import { noteName, type PitchClass } from "@/domain/music/notes";
import {
  CUSTOM_TUNING_ID,
  TUNING_PRESETS,
  cloneTuning,
  createDefaultCustomTuning,
  getPresetById,
  isValidTuning,
  updateCustomString as updateCustomTuningString,
  type TuningPreset,
} from "@/domain/music/tunings";

export type StringOrder = "high-to-low" | "low-to-high";

interface PersistedSettings {
  tuningId: string;
  stringOrder: StringOrder;
  customTuning: TuningPreset;
  showOpenNotes: boolean;
  hasSeenIntro: boolean;
}

const STORAGE_KEY = "guitar-chord-finder-settings-v1";

function defaultSettings(): PersistedSettings {
  return {
    tuningId: "standard",
    stringOrder: "high-to-low",
    customTuning: createDefaultCustomTuning(),
    showOpenNotes: false,
    hasSeenIntro: false,
  };
}

function canUseStorage(): boolean {
  return typeof uni !== "undefined" && typeof uni.getStorageSync === "function";
}

function loadSettings(): PersistedSettings {
  const fallback = defaultSettings();
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const stored = uni.getStorageSync(STORAGE_KEY) as Partial<PersistedSettings> | "";
    if (!stored || typeof stored !== "object") {
      return fallback;
    }

    const tuningId = typeof stored.tuningId === "string" ? stored.tuningId : fallback.tuningId;
    const stringOrder = stored.stringOrder === "low-to-high" ? "low-to-high" : "high-to-low";
    const customTuning = isValidTuning(stored.customTuning) ? stored.customTuning : fallback.customTuning;
    const showOpenNotes = typeof stored.showOpenNotes === "boolean" ? stored.showOpenNotes : fallback.showOpenNotes;
    const hasSeenIntro = typeof stored.hasSeenIntro === "boolean" ? stored.hasSeenIntro : fallback.hasSeenIntro;
    return {
      tuningId,
      stringOrder,
      customTuning,
      showOpenNotes,
      hasSeenIntro,
    };
  } catch {
    return fallback;
  }
}

function persistSettings(settings: PersistedSettings): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    uni.setStorageSync(STORAGE_KEY, settings);
  } catch {
    // Local persistence is helpful but should never block chord lookup.
  }
}

export function useGuitarState() {
  const settings = reactive<PersistedSettings>(loadSettings());
  const selectedFrets = ref<SelectedFretMap>({});

  const activeTuning = computed<TuningPreset>(() => {
    if (settings.tuningId === CUSTOM_TUNING_ID) {
      return settings.customTuning;
    }

    return getPresetById(settings.tuningId) ?? TUNING_PRESETS[0];
  });

  const displayedStrings = computed<DisplayString[]>(() => {
    const strings = activeTuning.value.strings.map((string, index) => ({
      index,
      string,
      openNoteName: noteName(string.pitchClass),
    }));

    return settings.stringOrder === "high-to-low" ? strings.reverse() : strings;
  });

  const selectedNotes = computed(() => getSelectedNotes(activeTuning.value, selectedFrets.value));
  const chordResults = computed(() => recognizeChords(selectedNotes.value));

  function selectFret(stringIndex: number, fret: number): void {
    selectedFrets.value = toggleFretSelection(selectedFrets.value, stringIndex, fret);
  }

  function clearSelection(): void {
    selectedFrets.value = {};
  }

  function setTuning(tuningId: string): void {
    settings.tuningId = tuningId;
  }

  function setStringOrder(stringOrder: StringOrder): void {
    settings.stringOrder = stringOrder;
  }

  function setShowOpenNotes(showOpenNotes: boolean): void {
    settings.showOpenNotes = showOpenNotes;
  }

  function dismissIntro(): void {
    settings.hasSeenIntro = true;
  }

  function updateCustomString(stringIndex: number, pitchClass: PitchClass): void {
    settings.customTuning = updateCustomTuningString(settings.customTuning, stringIndex, pitchClass);
    settings.tuningId = CUSTOM_TUNING_ID;
  }

  function resetCustomTuning(): void {
    settings.customTuning = createDefaultCustomTuning();
    settings.tuningId = CUSTOM_TUNING_ID;
  }

  watch(
    () => ({
      tuningId: settings.tuningId,
      stringOrder: settings.stringOrder,
      customTuning: cloneTuning(settings.customTuning),
      showOpenNotes: settings.showOpenNotes,
      hasSeenIntro: settings.hasSeenIntro,
    }),
    persistSettings,
    { deep: true }
  );

  return {
    presets: TUNING_PRESETS,
    customTuning: computed(() => settings.customTuning),
    activeTuning,
    activeTuningId: computed(() => settings.tuningId),
    stringOrder: computed(() => settings.stringOrder),
    showOpenNotes: computed(() => settings.showOpenNotes),
    hasSeenIntro: computed(() => settings.hasSeenIntro),
    displayedStrings,
    selectedFrets,
    selectedNotes,
    chordResults,
    selectFret,
    clearSelection,
    setTuning,
    setStringOrder,
    setShowOpenNotes,
    dismissIntro,
    updateCustomString,
    resetCustomTuning,
  };
}
