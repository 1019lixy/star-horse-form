<template>
  <starhorse-form-item
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :formItem="field"
    :parentField="parentField"
  >
    <div class="mainContainer">
      <div class="video-container">
        <div>
          <video
            :fid="field.preps['name']"
            name="videoElement"
            class="centeredVideo"
            ref="videoElement"
            controls
            autoplay
          >
            Your browser is too old which doesn't support HTML5 video.
          </video>
        </div>
      </div>
      <div class="controls" v-if="field.preps?.['showButton'] == 'Y'">
        <el-button @click="load()">Load</el-button>
        <el-button @click="start()">Start</el-button>
        <el-button @click="pause()">Pause</el-button>
        <el-button @click="destroy()">Destroy</el-button>
        <el-input style="width: 100px" type="text" v-model="seekpoint" />
        <el-button @click="seekto()">SeekTo</el-button>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts" name="vedioItem">
import { onMounted, ref } from "vue";
import * as flvjs from "flv.js";

import { ItemPreps } from "star-horse-lowcode";
const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");
const seekpoint = ref();
const itemAction = () => {
  emits("selfFunc", formData);
};
const player = ref();

const load = () => {
  let element = document.getElementsByName("videoElement")[0];
  if (flvjs.isSupported() && element) {
    const flvOption = {
      url: props.field.preps?.["videoUrl"], // 播放地址
      hasAudio: props.field.preps?.["hasAudio"] == "Y", // 是否有音频
      hasVideo: props.field.preps?.["hasVideo"] == "Y", //是否有视频
      isLive: props.field.preps?.["isLive"] == "Y", // 是否是直播流，默认 true
      type: props.field.preps?.["videoType"] || "mp4", // 是否是直播流，默认 true
      stashInitialSize: props.field.preps?.["stashInitialSize"] || 128, // 减少首帧显示等待时长
    };
    player.value = flvjs.createPlayer(flvOption, {
      enableWorker: props.field.preps?.["enableWorker"] == "Y", // 不启用分离的线程进行转换，之前为true
      enableStashBuffer: props.field.preps?.["enableStashBuffer"] == "Y", // 关闭IO隐藏缓冲区
      stashInitialSize: props.field.preps?.["stashInitialSize"] || 128, // 减少首帧显示等待时长
      autoCleanupSourceBuffer:
        props.field.preps?.["autoCleanupSourceBuffer"] == "Y", // 打开自动清除缓存
      fixAudioTimestampGap: props.field.preps?.["fixAudioTimestampGap"] == "Y", //false才会音视频同步,新增
      lazyLoad: props.field.preps?.["lazyLoad"] == "Y", // 去掉懒加载,新增
    });
    player.value.attachMediaElement(element);
    if (props.field.preps?.["autoLoad"] == "Y") {
      player.value.load();
    }
    if (props.field.preps?.["autoPlay"] == "Y") {
      player.value.play();
    }
    // state.endedReloadFlag = true; // 重置画面停滞的播放状态，下次停滞了会再次打开
    //  videoElementEvent(); // 手动跳帧，防止延时
    //  flvPlayerEvent(); // 断流、卡顿处理
  }
};
const start = () => {
  player.value.play();
};
const pause = () => {
  player.value.pause();
};
const destroy = () => {
  player.value.pause();
  player.value.unload();
  player.value.detachMediaElement();
  player.value.destroy();
  player.value = null;
};
const seekto = () => {
  player.value.currentTime = parseFloat(seekpoint.value);
};
const getCfg = (key: string, def: any) => {
  try {
    let ret = sessionStorage.getItem("vedio-item." + key);
    if (ret === null) {
      ret = def;
    }
    return ret;
  } catch (e) {
    console.error(e);
  }
  return def;
};
const setCfg = (key: string, value: any) => {
  try {
    sessionStorage.setItem("vedio-item." + key, value);
  } catch (e) {
    console.error(e);
  }
};
const saveSettings = () => {
  setCfg("sURL", props.field.preps?.["videoUrl"]);
};
onMounted(() => {
  load();
});
</script>
<style lang="scss" scoped>
.mainContainer {
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.video-container {
  position: relative;
  margin-top: 8px;
}

.video-container:before {
  display: block;
  content: "";
  width: 100%;
  padding-bottom: 56.25%;
}

.video-container > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.video-container video {
  width: 100%;
  height: 100%;
}

.urlInput {
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8px;
  margin-bottom: 8px;
}

.centeredVideo {
  display: block;
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: auto;
}

.controls {
  display: block;
  width: 100%;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8px;
  margin-bottom: 10px;
}

.logcatBox {
  border-color: #cccccc;
  font-size: 11px;
  font-family: Menlo, Consolas, monospace;
  display: block;
  width: 100%;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
}

.url-input,
.options {
  font-size: 13px;
}

.url-input {
  display: flex;
}

.url-input label {
  flex: initial;
}

.url-input input {
  flex: auto;
  margin-left: 8px;
}

.url-input button {
  flex: initial;
  margin-left: 8px;
}

.options {
  margin-top: 5px;
}

.hidden {
  display: none;
}
</style>
