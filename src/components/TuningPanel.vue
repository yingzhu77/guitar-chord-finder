<template>
  <view class="tuning-panel">
    <view class="panel-section">
      <text class="section-title">调弦</text>
      <view class="preset-grid">
        <view
          v-for="preset in presets"
          :key="preset.id"
          class="preset-button"
          :class="{ active: activeTuningId === preset.id }"
          hover-class="button-pressed"
          role="button"
          @tap="emit('selectTuning', preset.id)"
        >
          <text class="preset-name">{{ preset.name }}</text>
          <text class="preset-desc">{{ preset.description }}</text>
        </view>
      </view>
    </view>

    <view class="panel-section">
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-title">显示开放音</text>
          <text class="setting-desc">打开后在左侧空白处浅显显示空弦音名</text>
        </view>
        <switch :checked="showOpenNotes" color="#111111" @change="handleShowOpenNotesChange" />
      </view>
    </view>

    <view class="panel-section">
      <view class="section-title-row">
        <text class="section-title">自定义空弦音</text>
        <view class="small-action" hover-class="button-pressed" role="button" @tap="emit('resetCustom')">重置</view>
      </view>
      <view class="custom-list">
        <view v-for="(string, index) in customTuning.strings" :key="string.stringNumber" class="custom-row">
          <text class="custom-label">{{ string.stringNumber }}弦</text>
          <picker
            mode="selector"
            :range="noteOptions"
            range-key="label"
            :value="pickerIndex(string.pitchClass)"
            @change="handleCustomChange(index, $event)"
          >
            <view class="picker-value">{{ noteLabel(string.pitchClass) }}</view>
          </picker>
        </view>
      </view>
    </view>

    <view class="panel-section">
      <text class="section-title">弦序</text>
      <view class="segmented">
        <view
          class="segment"
          :class="{ active: stringOrder === 'high-to-low' }"
          hover-class="button-pressed"
          role="button"
          @tap="emit('setStringOrder', 'high-to-low')"
        >
          高音弦在上
        </view>
        <view
          class="segment"
          :class="{ active: stringOrder === 'low-to-high' }"
          hover-class="button-pressed"
          role="button"
          @tap="emit('setStringOrder', 'low-to-high')"
        >
          低音弦在上
        </view>
      </view>
    </view>

    <view class="panel-section">
      <text class="section-title">功能说明</text>
      <view class="info-actions">
        <view class="info-button" hover-class="button-pressed" role="button" @tap="openDialog('chords')">
          和弦讲解
        </view>
        <view class="info-button" hover-class="button-pressed" role="button" @tap="openDialog('more')">
          更多
        </view>
      </view>
    </view>

    <view v-if="activeDialog" class="dialog-mask" @tap="closeDialog"></view>
    <view v-if="activeDialog" class="dialog">
      <view class="dialog-head">
        <text class="dialog-title">{{ activeDialog === "chords" ? "和弦讲解" : "关于这个小程序" }}</text>
        <view class="dialog-close" hover-class="button-pressed" role="button" @tap="closeDialog">关闭</view>
      </view>

      <scroll-view scroll-y class="dialog-body">
        <view v-if="activeDialog === 'chords'" class="guide-content">
          <text class="guide-p">和弦可以先理解成“几个音一起响”。本工具把你在指板上选到的音整理成音集合，再和常见和弦结构做匹配。</text>

          <text class="guide-heading">三和弦</text>
          <text class="guide-p">三和弦通常由三个核心音组成：根音、三音、五音。根音像名字，三音决定大调或小调的感觉，五音让声音更稳定。</text>
          <text class="guide-p">大三和弦听起来更明亮，例如 C 大三和弦是 C E G。小三和弦听起来更柔和或暗一点，例如 A 小三和弦是 A C E。</text>

          <text class="guide-heading">减和弦与增和弦</text>
          <text class="guide-p">减和弦可以理解为“小三和弦再把五音降低一点”，声音紧张，常像在等待解决。增和弦可以理解为“大三和弦再把五音升高一点”，声音有悬浮感。</text>

          <text class="guide-heading">挂二和弦、挂四和弦</text>
          <text class="guide-p">挂和弦的重点是“暂时不用三音”。挂二和弦用二音代替三音，结构是 1 2 5；挂四和弦用四音代替三音，结构是 1 4 5。因为没有三音，所以它不像大三或小三那样直接说明明亮或暗淡。</text>

          <text class="guide-heading">七和弦</text>
          <text class="guide-p">七和弦是在三和弦基础上再加入一个七音。属七和弦常有推动感，大七和弦更柔和明亮，小七和弦常见于流行、民谣和爵士语境。</text>

          <text class="guide-heading">转位与低音</text>
          <text class="guide-p">如果最低的音不是根音，本工具会用类似 C/E 的形式显示。意思是“这是 C 和弦，但最低音是 E”。这在吉他指法里很常见。</text>
        </view>

        <view v-else class="guide-content">
          <text class="guide-p">这个小程序面向吉他初学者，目标不是替代完整乐理课，而是帮助你快速确认“这个位置是什么音”“这些音可能组成什么和弦”。</text>

          <text class="guide-heading">为什么界面这么简单</text>
          <text class="guide-p">练琴时最怕工具打断注意力，所以界面只保留指板、结果和必要设置。不做曲谱、社交、账号、广告和复杂课程入口。</text>

          <text class="guide-heading">为什么适合初学者</text>
          <text class="guide-p">你不需要先记住所有音名。先点弦上的位置，看到单音和和弦结果，再逐渐把指板位置、音名和和弦结构联系起来。</text>

          <text class="guide-heading">结果为什么会有多个</text>
          <text class="guide-p">同一组音在不同语境下可能有不同解释。工具会优先显示完全匹配，也会给出少量常见候选，例如省略五音或低音不是根音的情况。</text>

          <text class="guide-heading">内容准确性</text>
          <text class="guide-p">和弦结构采用通用基础乐理：三和弦、挂和弦、七和弦等概念与主流乐理教材保持一致。后续可以继续补充更详细的示例和练习。</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NOTE_OPTIONS, noteName, type PitchClass } from "@/domain/music/notes";
import type { TuningPreset } from "@/domain/music/tunings";
import type { StringOrder } from "@/composables/useGuitarState";

type InfoDialog = "chords" | "more";

defineProps<{
  presets: TuningPreset[];
  activeTuningId: string;
  customTuning: TuningPreset;
  stringOrder: StringOrder;
  showOpenNotes: boolean;
}>();

const emit = defineEmits<{
  selectTuning: [tuningId: string];
  updateCustomString: [stringIndex: number, pitchClass: PitchClass];
  resetCustom: [];
  setStringOrder: [stringOrder: StringOrder];
  setShowOpenNotes: [showOpenNotes: boolean];
}>();

const noteOptions = NOTE_OPTIONS;
const activeDialog = ref<InfoDialog | null>(null);

function pickerIndex(pitchClass: PitchClass): number {
  return noteOptions.findIndex((option) => option.pitchClass === pitchClass);
}

function noteLabel(pitchClass: PitchClass): string {
  return noteName(pitchClass);
}

function handleCustomChange(stringIndex: number, event: { detail: { value: number | string } }): void {
  const selectedIndex = Number(event.detail.value);
  const selected = noteOptions[selectedIndex];
  if (selected) {
    emit("updateCustomString", stringIndex, selected.pitchClass);
  }
}

function handleShowOpenNotesChange(event: Event): void {
  const value = (event as unknown as { detail?: { value?: boolean } }).detail?.value;
  emit("setShowOpenNotes", value === true);
}

function openDialog(dialog: InfoDialog): void {
  activeDialog.value = dialog;
}

function closeDialog(): void {
  activeDialog.value = null;
}
</script>

<style scoped>
.tuning-panel {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 8rpx 0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-title-row,
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title,
.setting-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #111;
}

.setting-copy {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.setting-desc {
  font-size: 21rpx;
  color: #777;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.preset-button {
  min-height: 92rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6rpx;
  padding: 16rpx;
  border: 2rpx solid #111;
  background: #fff;
}

.preset-button.active,
.segment.active,
.small-action {
  background: #111;
  color: #fff;
}

.preset-name {
  font-size: 24rpx;
  font-weight: 500;
}

.preset-desc {
  font-size: 20rpx;
  color: inherit;
  opacity: 0.72;
}

.button-pressed {
  opacity: 0.72;
}

.small-action {
  min-width: 92rpx;
  min-height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
  border: 2rpx solid #111;
  font-size: 22rpx;
}

.custom-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.custom-row {
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  border: 2rpx solid #111;
  background: #fff;
}

.custom-label {
  font-size: 22rpx;
  color: #555;
}

.picker-value {
  min-width: 104rpx;
  min-height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 24rpx;
  font-weight: 500;
  color: #111;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 2rpx solid #111;
}

.segment {
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
  font-size: 24rpx;
  border-right: 2rpx solid #111;
}

.segment:last-child {
  border-right: none;
}

.info-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.info-button {
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #111;
  background: #fff;
  color: #111;
  font-size: 24rpx;
}

.dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.22);
}

.dialog {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  top: 12vh;
  z-index: 41;
  max-height: 76vh;
  display: flex;
  flex-direction: column;
  border: 2rpx solid #111;
  background: #f8f8f6;
  box-sizing: border-box;
}

.dialog-head {
  min-height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 0 22rpx;
  border-bottom: 2rpx solid #111;
  box-sizing: border-box;
}

.dialog-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #111;
}

.dialog-close {
  min-width: 82rpx;
  min-height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 22rpx;
}

.dialog-body {
  max-height: calc(76vh - 84rpx);
  padding: 24rpx 24rpx 30rpx;
  box-sizing: border-box;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.guide-heading {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #111;
}

.guide-p {
  font-size: 24rpx;
  line-height: 1.58;
  color: #333;
}
</style>
