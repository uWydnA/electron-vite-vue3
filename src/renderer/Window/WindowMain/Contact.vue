<script setup lang="ts">
import { ref } from "vue";
import BarTop from "../../Component/BarTop.vue";
const iframeUrl = ref("");
const isShowIframe = ref(false);
const loadIframe = () => {
  isShowIframe.value = true;
};
</script>
<template>
  <div class="ContactArea">
    <div class="ContactBoard">
      <BarTop />
    </div>
    <div class="iframeArea">
      <el-input v-model="iframeUrl" placeholder="Please input" />
      <el-button type="primary" @click="loadIframe">loadIframe</el-button>
      <iframe
        class="iframe"
        v-bind:src="iframeUrl"
        frameborder="0"
        v-if="isShowIframe"
      ></iframe>
    </div>
  </div>
</template>
<style scoped lang="scss">
.ContactArea {
  display: flex;
  flex-direction: column;
  flex: 1;
  .iframeArea {
    display: flex;
    flex-direction: column;
    flex: 1;
    .iframe {
      flex: 1;
    }
  }
}
</style>
