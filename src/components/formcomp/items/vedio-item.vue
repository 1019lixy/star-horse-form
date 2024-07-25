<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <div class="mainContainer">
      <div class="video-container">
        <div>
          <video :fid="field.preps['name']" name="videoElement" class="centeredVideo" ref="videoElement"
                 controls autoplay>
            Your browser is too old which doesn't support HTML5 video.
          </video>
        </div>
      </div>
      <div class="controls" v-if="field['showButton']=='Y'">
        <el-button @click="load()">Load</el-button>
        <el-button @click="start()">Start</el-button>
        <el-button @click="pause()">Pause</el-button>
        <el-button @click="destroy()">Destroy</el-button>
        <el-input style="width:100px" type="text" v-model="seekpoint"/>
        <el-button @click="seekto()">SeekTo</el-button>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script lang="ts" name="vedioItem">
import {defineComponent, onMounted, ref, shallowRef} from "vue";
import flvjs from "flv.js";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let seekpoint = shallowRef();
    let videoElement = ref(null);
    let player = ref();
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const load = () => {
      let element = document.getElementsByName('videoElement')[0];
      if (flvjs.isSupported() && element) {
        const flvOption = {
          url: field["videoUrl"], // 播放地址
          hasAudio: field["hasAudio"] == "Y", // 是否有音频
          hasVideo: field["hasVideo"] == "Y", //是否有视频
          isLive: field["isLive"] == "Y", // 是否是直播流，默认 true
          type: field["videoType"] || "mp4", // 是否是直播流，默认 true
          stashInitialSize: field["stashInitialSize"] || 128, // 减少首帧显示等待时长
        };
        player.value = flvjs.createPlayer(flvOption, {
          enableWorker: field["enableWorker"] == "Y", // 不启用分离的线程进行转换，之前为true
          enableStashBuffer: field["enableStashBuffer"] == "Y", // 关闭IO隐藏缓冲区
          stashInitialSize: field["stashInitialSize"] || 128, // 减少首帧显示等待时长
          autoCleanupSourceBuffer: field["autoCleanupSourceBuffer"] == "Y", // 打开自动清除缓存
          fixAudioTimestampGap: field["fixAudioTimestampGap"] == "Y", //false才会音视频同步,新增
          lazyLoad: field["lazyLoad"] == "Y", // 去掉懒加载,新增
        });
        player.value.attachMediaElement(element);
        if (field["autoLoad"] == "Y") {
          player.value.load();
        }
        if (field["autoPlay"] == "Y") {
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
    }
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
    const getCfg = (key, def) => {
      try {
        let ret = localStorage.getItem('vedio-item.' + key);
        if (ret === null) {
          ret = def;
        }
        return ret;
      } catch (e) {
      }
      return def;
    };
    const setCfg = (key, value) => {
      try {
        localStorage.setItem('vedio-item.' + key, value);
      } catch (e) {
      }
    }
    const saveSettings = () => {
      setCfg('sURL', field["videoUrl"]);
    };
    onMounted(() => {
      load();
    });
    return {
      parentField,  context, field, formItem, dataField, keyEnterFun, seekpoint,
      saveSettings, load, start, pause, destroy, seekto
    }
  }
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
  border-color: #CCCCCC;
  font-size: 11px;
  font-family: Menlo, Consolas, monospace;
  display: block;
  width: 100%;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
}
.url-input, .options {
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
