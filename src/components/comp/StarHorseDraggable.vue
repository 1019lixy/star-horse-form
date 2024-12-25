<script lang="ts" setup>
import {onMounted, ref, computed} from "vue";
import {ModelRef} from "vue-demi";
import {DynamicNode} from "@/components/types/DynamicNode";
import {DesignPage} from "@/store/DesignPageStore.ts";
import piniaInstance from "@/store";

defineProps({
  msg: {
    type: String,
    required: true,
  },
});
let designPage = DesignPage(piniaInstance);
let currentNode = computed(() => designPage.currentNode);
let node: ModelRef<DynamicNode> = defineModel("node");
const pointList = ref<Array<string>>([
  "left", "right", "top", "bottom",
  "bottom-right", "bottom-left",
  "top-right", "top-left"
]);

const init = async () => {
}
const handleMouseDown = (e: MouseEvent) => {
  moveActive.value = true;

}
let moveActive = ref(false);
let rangeActive = ref(false);
const handleMouseUp = () => {
  moveActive.value = false;
  rangeActive.value = false;

}
let step = ref(1);
const handleClear = () => {
  document.onmouseup = function () {
    document.onmousemove = null;
    document.onmouseup = null;
    handleMouseUp()
  }
}
const selectItem = () => {
  designPage.selectNode(node.value);
}
const rangeMove = (evt: MouseEvent, t: string) => {
  evt.preventDefault();
  evt.stopPropagation();
  let o: boolean = false, a: boolean = false, c: boolean = false, l: boolean = false, r: boolean = false,
      i: boolean = false;
  rangeActive.value = true;
  handleMouseDown(evt);
  let s = evt.clientX, d = evt.clientY;
  document.onmousemove = (e: MouseEvent) => {
    moveActive.value = true;
    "right" === t ? (o = true, a = false) :
        "left" === t ? (o = true, c = true, r = true, a = false) :
            "top" === t ? (o = false, a = true, l = true, i = true) :
                "bottom" === t ? (o = false, a = true) :
                    "bottom-right" === t ? (o = true, a = true) :
                        "bottom-left" === t ? (o = true, a = true, c = true, r = true) :
                            "top-right" === t ? (o = true, a = true, l = true, i = true) :
                                "top-left" === t && (o = true, a = true, c = true, r = true, l = true, i = true);
    console.log(o, a, c, l, r, i);
    let u = e.clientX - s, m = e.clientY - d;
    s = e.clientX;
    d = e.clientY;
    if (o) {
      let p = u * step.value;
      r && (p = -p);
      c && (node.value.left = (node.value.left || 0) - p);
      node.value.width = ((node.value.width || 100) + p)
    }
    if (a) {
      let h = m * step.value;
      i && (h = -h);
      l && (node.value.top = ((node.value.top || 0) - h));
      node.value.height = ((node.value.height || 50) + h)
    }
    console.log(node.value);
  };

  handleClear()
}
let offsetX = ref(0);
let offsetY = ref(0);
let isDraging = ref(false);
const dragStart = (evt: MouseEvent) => {
  console.log("start", evt);
  isDraging.value = true;
  offsetX.value = evt.clientX - node.value.left || 0;
  offsetY.value = evt.clientY - node.value.top || 0;
}
const dragAction = (evt: MouseEvent) => {
  if (isDraging.value) {
    console.log("leave", evt);
    node.value.left = evt.clientX - offsetX.value;
    node.value.top = evt.clientY - offsetY.value;
  }
}
const endAction = (evt: MouseEvent) => {
  console.log("end", evt);
  isDraging.value = false;
}

onMounted(() => {
  init();
})
</script>

<template>
  <div class="node" :class="{active:node.id==currentNode.id}" :style="{
    width: node.width+'px !important',
    height: node.height+'px !important',
    left: node.left+'px!important',
    top: node.top+'px!important',
    }"
       @mousedown="dragStart"
       @click.stop="selectItem"
       @mouseup="endAction"
       @mousemove="dragAction">
    <div class="node__wrapper">
      <div class="node__line node__line--left" :style="{'border-width': '3px', 'border-color': 'red'}"></div>
      <div class="node__line node__line--top" style="{'border-width': '3px', 'border-color': 'red'}"></div>
      <!--        <div class="node__line node__line&#45;&#45;label" style="font-size: 64.8px;"><h3>{{ item.name }}</h3></div>-->
      <div class="node-point" :class="'node-point--'+item" v-for="item in pointList"
           @mousedown="rangeMove($event,item)" v-if="node.id==currentNode.id"></div>
      <div class="node__menu" :style="{'transform-origin': '0px 0px',transform: 'scale(3.6)'}"></div>
      <div class="node__item node-content">
        <h3>{{ node.name }}</h3>
      </div>
      <div class="node__mask"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.node {
  width: 100px;
  height: 100px;
  background: #ccc;
  margin: 10px;
  position: relative;
  border: 1px solid #cecece;
  cursor: move;
  -webkit-tap-highlight-color: transparent;
  -moz-user-select: none;
  user-select: none
}

.node.active {
  border: 1px dotted #09f;
  box-shadow: 0 0 10px #09f;
}

.node-point {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  z-index: 9999;
  background: #09f;

}

.node__line--left {
  position: absolute;
  border-top: 1px dashed #09f;
  width: 10000px;
  height: 0;
  top: 0;
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%)
}

.node__line--top {
  position: absolute;
  border-left: 1px dashed #09f;
  width: 0;
  height: 10000px;
  left: 0;
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%)
}

.node__line--label {
  top: -5px;
  left: -8px;
  position: absolute;
  padding: 5px;
  -webkit-transform: translate(-100%, -100%);
  transform: translate(-100%, -100%);
  color: #09f;
  font-size: 18px;
  white-space: nowrap;
  cursor: move
}

.node__menu {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #409EFF;
  font-size: 25px;
  color: #fff;
  z-index: 9999;
  cursor: pointer
}

.node-point {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  z-index: 9999;
  background-color: #09f
}


.node__mask {
  width: 100%;
  height: 100%;
  border: 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1
}

.node-point--left, .node-point--right {
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%)
}

.node-point--left:hover, .node-point--right:hover {
  cursor: ew-resize
}

.node-point--left {
  left: -6px
}

.node-point--right {
  right: -6px
}

.node-point--bottom, .node-point--top {
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%)
}

.node-point--bottom:hover, .node-point--top:hover {
  cursor: ns-resize
}

.node-point--top {
  top: -6px
}

.node-point--bottom {
  bottom: -6px
}

.node-point--bottom-right:hover, .node-point--top-left:hover {
  cursor: nwse-resize
}

.node-point--bottom-left:hover, .node-point--top-right:hover {
  cursor: nesw-resize
}

.node-point--top-right {
  top: -6px;
  right: -6px
}

.node-point--top-left {
  top: -6px;
  left: -6px
}

.node-point--bottom-right {
  bottom: -6px;
  right: -6px
}

.node-point--bottom-left {
  bottom: -6px;
  left: -6px
}
</style>
