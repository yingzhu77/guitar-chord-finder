<template>
  <view class="page">
    <view class="hero">
      <text class="app-title">吉他和弦速查</text>
    </view>

    <Fretboard
      :tuning="activeTuning"
      :strings="displayedStrings"
      :selected-frets="selectedFrets"
      :show-open-notes="showOpenNotes"
      :max-fret="12"
      @toggle="selectFret"
    />

    <view v-if="!hasSeenIntro && selectedNotes.length === 0" class="intro-tip">
      <text>轻点某根弦所在位置选择音，再点一次取消。选择多个音后会自动识别常见和弦。</text>
      <view class="intro-dismiss" hover-class="intro-dismiss-pressed" role="button" @tap="dismissIntro">知道了</view>
    </view>

    <ChordResultPanel :selected-notes="selectedNotes" :chord-results="chordResults" @clear="clearSelection" />

    <view v-if="showSettings" class="settings-mask" @tap="showSettings = false"></view>
    <view v-if="showSettings" class="settings-sheet">
      <TuningPanel
        :presets="presets"
        :active-tuning-id="activeTuningId"
        :custom-tuning="customTuning"
        :string-order="stringOrder"
        :show-open-notes="showOpenNotes"
        @select-tuning="setTuning"
        @update-custom-string="updateCustomString"
        @reset-custom="resetCustomTuning"
        @set-string-order="setStringOrder"
        @set-show-open-notes="setShowOpenNotes"
      />
    </view>

    <view class="gear-button" hover-class="gear-button-pressed" role="button" aria-label="设置" @tap="showSettings = !showSettings">
      <text class="gear-icon">⚙</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChordResultPanel from "@/components/ChordResultPanel.vue";
import Fretboard from "@/components/Fretboard.vue";
import TuningPanel from "@/components/TuningPanel.vue";
import { useGuitarState } from "@/composables/useGuitarState";

const showSettings = ref(false);

const {
  presets,
  customTuning,
  activeTuning,
  activeTuningId,
  stringOrder,
  showOpenNotes,
  hasSeenIntro,
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
} = useGuitarState();
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 44rpx 24rpx 0;
  background: #f8f8f6;
  color: #111;
}

.hero {
  display: flex;
  align-items: center;
  min-height: 72rpx;
  padding: 0 8rpx;
}

.app-title {
  font-size: 36rpx;
  font-weight: 500;
  line-height: 1.2;
  color: #111;
  letter-spacing: 0;
}

.intro-tip {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
  padding: 18rpx 20rpx;
  border: 2rpx solid #111;
  background: #fff;
  color: #333;
  font-size: 23rpx;
  line-height: 1.45;
}

.intro-dismiss {
  align-self: flex-end;
  flex: 0 0 auto;
  min-width: 92rpx;
  min-height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  font-size: 22rpx;
}

.intro-dismiss-pressed {
  background: #f0f0ee;
}

.settings-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.18);
}

.settings-sheet {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 112rpx;
  z-index: 21;
  max-height: 72vh;
  overflow: auto;
  padding: 24rpx;
  border: 2rpx solid #111;
  background: #f8f8f6;
  box-sizing: border-box;
}

.gear-button {
  position: fixed;
  right: 30rpx;
  bottom: 34rpx;
  z-index: 22;
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #111;
  border-radius: 50%;
  background: #fff;
  color: #111;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
}

.gear-button-pressed {
  background: #f0f0ee;
}

.gear-icon {
  font-size: 38rpx;
  font-weight: 400;
  line-height: 1;
}
</style>
