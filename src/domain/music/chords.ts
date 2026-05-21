import { getBassNote, uniquePitchClasses, type FretNote } from "./guitar";
import { normalizePitchClass, shortNoteName, type PitchClass } from "./notes";

type MatchKind = "exact" | "partial";

interface ChordTemplate {
  id: string;
  suffix: string;
  label: string;
  intervals: PitchClass[];
  priority: number;
  canOmitFifth?: boolean;
}

export interface ChordResult {
  id: string;
  name: string;
  displayName: string;
  root: PitchClass;
  bass: PitchClass | null;
  label: string;
  kind: MatchKind;
  reason: string;
  tones: string[];
  score: number;
}

const FIFTH_INTERVAL = 7;

const CHORD_TEMPLATES: ChordTemplate[] = [
  { id: "major", suffix: "", label: "大三和弦", intervals: [0, 4, 7], priority: 0, canOmitFifth: true },
  { id: "minor", suffix: "m", label: "小三和弦", intervals: [0, 3, 7], priority: 1, canOmitFifth: true },
  { id: "power", suffix: "5", label: "五和弦", intervals: [0, 7], priority: 2 },
  { id: "sus2", suffix: "sus2", label: "挂二和弦", intervals: [0, 2, 7], priority: 3, canOmitFifth: true },
  { id: "sus4", suffix: "sus4", label: "挂四和弦", intervals: [0, 5, 7], priority: 4, canOmitFifth: true },
  { id: "dim", suffix: "dim", label: "减和弦", intervals: [0, 3, 6], priority: 5 },
  { id: "aug", suffix: "aug", label: "增和弦", intervals: [0, 4, 8], priority: 6 },
  { id: "six", suffix: "6", label: "六和弦", intervals: [0, 4, 7, 9], priority: 7, canOmitFifth: true },
  { id: "dominant-seven", suffix: "7", label: "属七和弦", intervals: [0, 4, 7, 10], priority: 8, canOmitFifth: true },
  { id: "major-seven", suffix: "maj7", label: "大七和弦", intervals: [0, 4, 7, 11], priority: 9, canOmitFifth: true },
  { id: "minor-seven", suffix: "m7", label: "小七和弦", intervals: [0, 3, 7, 10], priority: 10, canOmitFifth: true },
  { id: "minor-seven-flat-five", suffix: "m7b5", label: "半减七和弦", intervals: [0, 3, 6, 10], priority: 11 },
  { id: "add-nine", suffix: "add9", label: "加九和弦", intervals: [0, 2, 4, 7], priority: 12, canOmitFifth: true },
];

function pitchSetFor(root: PitchClass, intervals: PitchClass[]): PitchClass[] {
  return intervals.map((interval) => normalizePitchClass(root + interval)).sort((a, b) => a - b);
}

function samePitchSet(left: PitchClass[], right: PitchClass[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort((a, b) => a - b);
  const sortedRight = [...right].sort((a, b) => a - b);
  return sortedLeft.every((pitch, index) => pitch === sortedRight[index]);
}

function intervalFromRoot(root: PitchClass, pitch: PitchClass): PitchClass {
  return normalizePitchClass(pitch - root);
}

function formatChordName(root: PitchClass, suffix: string, bass: PitchClass | null, kind: MatchKind): string {
  const omitLabel = kind === "partial" ? "(no5)" : "";
  const baseName = `${shortNoteName(root)}${suffix}${omitLabel}`;
  return bass !== null && bass !== root ? `${baseName}/${shortNoteName(bass)}` : baseName;
}

function formatDisplayName(root: PitchClass, template: ChordTemplate, bass: PitchClass | null, kind: MatchKind): string {
  const omitLabel = kind === "partial" ? "（省五音）" : "";
  const baseName = `${shortNoteName(root)} ${template.label}${omitLabel}`;
  return bass !== null && bass !== root ? `${baseName} / ${shortNoteName(bass)}低音` : baseName;
}

function canMatchWithoutFifth(root: PitchClass, template: ChordTemplate, selected: PitchClass[]): boolean {
  if (!template.canOmitFifth || !template.intervals.includes(FIFTH_INTERVAL)) {
    return false;
  }

  const selectedIntervals = selected.map((pitch) => intervalFromRoot(root, pitch));
  const allSelectedBelongToTemplate = selectedIntervals.every((interval) => template.intervals.includes(interval));
  const missingIntervals = template.intervals.filter((interval) => !selectedIntervals.includes(interval));
  return (
    allSelectedBelongToTemplate &&
    selectedIntervals.includes(0) &&
    selected.length >= 2 &&
    missingIntervals.length === 1 &&
    missingIntervals[0] === FIFTH_INTERVAL
  );
}

function buildResult(
  root: PitchClass,
  template: ChordTemplate,
  bass: PitchClass | null,
  kind: MatchKind,
  selected: PitchClass[]
): ChordResult {
  const hasSlashBass = bass !== null && bass !== root;
  const name = formatChordName(root, template.suffix, bass, kind);
  const exactReason = hasSlashBass
    ? `完全匹配，最低音是 ${shortNoteName(bass)}，按转位显示`
    : "完全匹配选中音集合";
  const partialReason = hasSlashBass
    ? `缺五音候选，最低音是 ${shortNoteName(bass)}`
    : "缺五音候选，保留根音和核心色彩音";

  return {
    id: `${name}-${kind}`,
    name,
    displayName: formatDisplayName(root, template, bass, kind),
    root,
    bass,
    label: template.label,
    kind,
    reason: kind === "exact" ? exactReason : partialReason,
    tones: selected.map((pitch) => shortNoteName(pitch)),
    score: (kind === "exact" ? 0 : 40) + template.priority + (hasSlashBass ? 4 : 0),
  };
}

export function recognizeChords(notes: FretNote[]): ChordResult[] {
  const selected = uniquePitchClasses(notes);
  if (selected.length < 2) {
    return [];
  }

  const bass = getBassNote(notes)?.pitchClass ?? null;
  const results: ChordResult[] = [];

  for (let root = 0; root < 12; root += 1) {
    const rootPitch = root as PitchClass;
    CHORD_TEMPLATES.forEach((template) => {
      const target = pitchSetFor(rootPitch, template.intervals);
      if (samePitchSet(selected, target)) {
        results.push(buildResult(rootPitch, template, bass, "exact", selected));
        return;
      }

      if (canMatchWithoutFifth(rootPitch, template, selected)) {
        results.push(buildResult(rootPitch, template, bass, "partial", selected));
      }
    });
  }

  const deduped = Array.from(new Map(results.map((result) => [result.name, result])).values());
  return deduped.sort((left, right) => left.score - right.score || left.name.localeCompare(right.name)).slice(0, 8);
}
