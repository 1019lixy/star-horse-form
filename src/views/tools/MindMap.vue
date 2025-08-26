<script setup lang="ts">
import { onMounted, ref } from "vue";
import MindMap from "simple-mind-map";
import MiniMap from "simple-mind-map/src/plugins/MiniMap.js";
import Watermark from "simple-mind-map/src/plugins/Watermark.js";
import KeyboardNavigation from "simple-mind-map/src/plugins/KeyboardNavigation.js";
import ExportPDF from "simple-mind-map/src/plugins/ExportPDF.js";
import ExportXMind from "simple-mind-map/src/plugins/ExportXMind.js";
import Export from "simple-mind-map/src/plugins/Export.js";
import Drag from "simple-mind-map/src/plugins/Drag.js";
import Select from "simple-mind-map/src/plugins/Select.js";
import AssociativeLine from "simple-mind-map/src/plugins/AssociativeLine.js";
import TouchEvent from "simple-mind-map/src/plugins/TouchEvent.js";
import NodeImgAdjust from "simple-mind-map/src/plugins/NodeImgAdjust.js";
import SearchPlugin from "simple-mind-map/src/plugins/Search.js";
import Painter from "simple-mind-map/src/plugins/Painter.js";
import Formula from "simple-mind-map/src/plugins/Formula.js";
import Cooperate from "simple-mind-map/src/plugins/Cooperate.js";
import { i18n } from "@/lang";

let mindMapContainerRef = ref<HTMLElement>();
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(Cooperate); // i18n("mindmap.cooperate.plugin")
const init = () => {
  const mindMap = new MindMap({
    el: mindMapContainerRef.value,
    data: {
      data: {
        text: i18n("mindmap.root.node"),
      },
      children: [],
    },
  });
};

onMounted(() => {
  init();
});
</script>

<template>
  <div id="mindMapContainer" ref="mindMapContainerRef"></div>
</template>

<style scoped lang="scss">
#mindMapContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>