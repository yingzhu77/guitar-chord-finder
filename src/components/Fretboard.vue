<template>
  <view class="fretboard-wrap">
    <scroll-view scroll-x class="fret-scroll" :show-scrollbar="false">
      <view class="fretboard" :style="{ width: `${boardWidth}rpx` }">
        <view class="string-area">
          <view class="marker-layer">
            <view
              v-for="slot in fretSlots"
              :key="`marker-${slot.fret}`"
              class="marker-cell"
              :style="{ width: `${slot.width}rpx` }"
            >
              <view v-if="slot.fret === 12" class="double-marker">
                <view class="marker-dot"></view>
                <view class="marker-dot"></view>
              </view>
              <view v-else-if="hasMarker(slot.fret)" class="marker-dot"></view>
            </view>
          </view>

          <view class="fretwire-layer">
            <view
              v-for="slot in fretSlots"
              :key="`wire-${slot.fret}`"
              class="fretwire-cell"
              :style="{ width: `${slot.width}rpx` }"
            >
              <view class="fretwire"></view>
            </view>
          </view>

          <view
            v-for="item in strings"
            :key="item.index"
            class="string-row"
            :style="{ height: `${stringRowHeight}rpx` }"
          >
            <text v-if="showOpenNotes" class="open-note">{{ item.openNoteName }}</text>
            <view class="string-line" :class="`string-${item.string.stringNumber}`"></view>
            <view
              v-for="slot in fretSlots"
              :key="`${item.index}-${slot.fret}`"
              class="fret-hit"
              :class="{ openHit: slot.fret === 0 }"
              :style="{ width: `${slot.width}rpx` }"
              hover-class="fret-hit-pressed"
              role="button"
              :aria-label="`${item.string.stringNumber}弦 ${slot.fret}品${isSelected(item.index, slot.fret) ? ` ${cellNoteName(item.index, slot.fret)}` : ''}`"
              @tap="emit('toggle', item.index, slot.fret)"
            >
              <view v-if="isSelected(item.index, slot.fret)" class="note-dot">
                <text>{{ cellNoteName(item.index, slot.fret) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { noteAtFret, type DisplayString, type SelectedFretMap } from "@/domain/music/guitar";
import type { TuningPreset } from "@/domain/music/tunings";

interface FretSlot {
  fret: number;
  width: number;
}

const props = withDefaults(
  defineProps<{
    tuning: TuningPreset;
    strings: DisplayString[];
    selectedFrets: SelectedFretMap;
    maxFret?: number;
    showOpenNotes?: boolean;
  }>(),
  {
    maxFret: 12,
    showOpenNotes: false,
  }
);

const emit = defineEmits<{
  toggle: [stringIndex: number, fret: number];
}>();

const stringRowHeight = 74;
const markerFrets = new Set([3, 5, 7, 12]);

const fretSlots = computed<FretSlot[]>(() => {
  const slots: FretSlot[] = [{ fret: 0, width: 64 }];
  for (let fret = 1; fret <= props.maxFret; fret += 1) {
    slots.push({ fret, width: 94 });
  }
  return slots;
});

const boardWidth = computed(() => fretSlots.value.reduce((total, slot) => total + slot.width, 0) + 32);

function isSelected(stringIndex: number, fret: number): boolean {
  return props.selectedFrets[stringIndex] === fret;
}

function cellNoteName(stringIndex: number, fret: number): string {
  return noteAtFret(props.tuning, stringIndex, fret).noteName;
}

function hasMarker(fret: number): boolean {
  return markerFrets.has(fret);
}
</script>

<style scoped>
.fretboard-wrap {
  width: 100%;
  padding: 18rpx 0 6rpx;
  background: #f8f8f6;
}

.fret-scroll {
  width: 100%;
  white-space: nowrap;
}

.fretboard {
  display: inline-flex;
  padding: 18rpx 16rpx 14rpx;
  box-sizing: border-box;
}

.string-area {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 444rpx;
  background: #fbfbf9;
}

.marker-layer {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  pointer-events: none;
  z-index: 0;
}

.fretwire-layer {
  position: absolute;
  left: 0;
  right: 0;
  top: 37rpx;
  height: 370rpx;
  display: flex;
  pointer-events: none;
  z-index: 1;
}

.fretwire-cell {
  position: relative;
  height: 100%;
  box-sizing: border-box;
}

.fretwire {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3rpx;
  background: #111;
}

.marker-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.marker-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.16);
}

.double-marker {
  height: 136rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.string-row {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1;
}

.string-line {
  position: absolute;
  left: 34rpx;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #111;
  pointer-events: none;
}

.string-1 {
  height: 3rpx;
}

.string-2 {
  height: 3rpx;
}

.string-3 {
  height: 3rpx;
}

.string-4 {
  height: 3rpx;
}

.string-5 {
  height: 3rpx;
}

.string-6 {
  height: 3rpx;
}

.open-note {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32rpx;
  text-align: center;
  font-size: 18rpx;
  font-weight: 400;
  color: rgba(17, 17, 17, 0.46);
  z-index: 2;
}

.fret-hit {
  position: relative;
  min-height: 74rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.fret-hit-pressed {
  background: rgba(0, 0, 0, 0.045);
}

.note-dot {
  min-width: 52rpx;
  height: 52rpx;
  padding: 0 9rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #050505;
  color: #fff;
  font-size: 19rpx;
  font-weight: 500;
  line-height: 1;
  box-sizing: border-box;
}
</style>
