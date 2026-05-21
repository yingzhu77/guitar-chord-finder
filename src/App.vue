<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("Guitar Chord Finder Launch");
});
onShow(() => {
  console.log("Guitar Chord Finder Show");
});
onHide(() => {
  console.log("Guitar Chord Finder Hide");
});
</script>
<style>
page {
  min-height: 100%;
  background: #f5f5f3;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text {
  box-sizing: border-box;
}
</style>
