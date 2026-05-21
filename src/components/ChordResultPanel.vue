<template>
  <view class="result-panel">
    <view class="result-head">
      <text class="result-title">查询结果</text>
      <view
        v-if="selectedNotes.length > 0"
        class="clear-action"
        hover-class="clear-action-pressed"
        role="button"
        @tap="emit('clear')"
      >
        清空
      </view>
    </view>

    <view v-if="selectedNotes.length === 0" class="empty-state">
      <text>轻点某根弦所在位置开始查询。再次轻点同一位置可取消。</text>
    </view>

    <view v-else class="selected-notes">
      <view v-for="note in selectedNotes" :key="`${note.stringIndex}-${note.fret}`" class="note-chip">
        <text class="chip-main">{{ note.noteName }}</text>
        <text class="chip-meta">{{ note.stringNumber }}弦 {{ note.fret }}品</text>
      </view>
    </view>

    <view v-if="selectedNotes.length === 1" class="single-note">
      <text class="single-label">单音</text>
      <text class="single-name">{{ selectedNotes[0].noteName }}</text>
    </view>

    <view v-else-if="selectedNotes.length > 1 && chordResults.length > 0" class="chord-list">
      <view v-for="(result, index) in chordResults" :key="result.id" class="chord-row" :class="{ primary: index === 0 }">
        <view class="chord-main">
          <text class="chord-name">{{ result.displayName }}</text>
          <text class="chord-symbol">{{ result.name }} · 组成音 {{ result.tones.join(" ") }}</text>
        </view>
        <view class="match-block">
          <text class="match-kind">{{ result.kind === "exact" ? "精确匹配" : "可能匹配" }}</text>
          <text class="match-reason">{{ result.reason }}</text>
        </view>
      </view>
    </view>

    <view v-else-if="selectedNotes.length > 1" class="empty-state">
      <text>未识别到常见和弦。可减少一个音，或确认每根弦只选择一个真实按弦位置。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ChordResult } from "@/domain/music/chords";
import type { FretNote } from "@/domain/music/guitar";

defineProps<{
  selectedNotes: FretNote[];
  chordResults: ChordResult[];
}>();

const emit = defineEmits<{
  clear: [];
}>();
</script>

<style scoped>
.result-panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 18rpx 8rpx 128rpx;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52rpx;
}

.result-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #111;
}

.clear-action {
  min-width: 72rpx;
  min-height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 22rpx;
}

.clear-action-pressed {
  color: #111;
}

.empty-state {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 4rpx;
  color: #777;
  font-size: 24rpx;
  line-height: 1.45;
}

.selected-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.note-chip {
  min-width: 118rpx;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  padding: 12rpx 14rpx;
  border: 2rpx solid #111;
  background: #fff;
}

.chip-main {
  font-size: 25rpx;
  font-weight: 500;
  color: #111;
}

.chip-meta {
  font-size: 19rpx;
  color: #777;
}

.single-note {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 22rpx 4rpx;
  border-top: 2rpx solid #111;
}

.single-label {
  font-size: 24rpx;
  color: #777;
}

.single-name {
  font-size: 44rpx;
  font-weight: 500;
  color: #111;
}

.chord-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.chord-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 0;
  border-top: 2rpx solid #111;
}

.chord-row.primary {
  border-top-width: 4rpx;
}

.chord-main,
.match-block {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.chord-main {
  min-width: 0;
  flex: 1;
}

.chord-name {
  font-size: 31rpx;
  font-weight: 500;
  color: #111;
  line-height: 1.25;
}

.chord-symbol,
.match-kind {
  font-size: 21rpx;
  color: #777;
}

.match-block {
  max-width: 276rpx;
  align-items: flex-end;
  text-align: right;
}

.match-reason {
  font-size: 20rpx;
  line-height: 1.35;
  color: #777;
}
</style>
