<script lang="ts" setup>
import {onMounted, ref} from "vue";

defineProps({
  msg: {
    type: String,
    required: true,
  },
});

let nodeList = ref([]);

const addNode = async () => {
  let t = nodeList.value.length;
  let e = "节点" + t;
  let n = "node" + t;
  nodeList.value.push({id: n, name: e, left: 0, top: 0});

};
const init = async () => {
}
const handleMouseDown = (e) => {
  moveActive.value = true;
  // this.$emit("focus", {
  //   index: this.index,
  //   width: this.baseWidth,
  //   height: this.baseHeight,
  //   left: this.baseLeft,
  //   top: this.baseTop
  // })
}
let moveActive = ref(false);
let rangeActive = ref(false);
const handleMouseUp = () => {
  moveActive.value = false;
  rangeActive.value = false;
  // this.$emit("blur", {
  //   index: this.index,
  //   width: this.baseWidth,
  //   height: this.baseHeight,
  //   left: this.baseLeft,
  //   top: this.baseTop
  // })
}
let baseLeft = ref(0);
let baseWidth = ref(100);
let baseHeight = ref(100);
let baseTop = ref(0);
let step = ref(1);
const handleClear = () => {
  document.onmouseup = function () {
    document.onmousemove = null;
    document.onmouseup = null;
    handleMouseUp()
  }
}
const rangeMove = (evt, t) => {
  evt.preventDefault();
  evt.stopPropagation();
  let o, a, c, l, r, i;
  rangeActive.value = true;
  handleMouseDown();
  let s = evt.clientX, d = evt.clientY;
  document.onmousemove = function (e) {
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
      c && (baseLeft.value = baseLeft.value - p);
      baseWidth.value = (baseWidth.value + p)
    }
    if (a) {
      let h = m * step.value;
      i && (h = -h);
      l && (baseTop.value = (baseTop.value - h));
      baseHeight.value = (baseHeight.value + h)
    }
    console.log(baseWidth.value, baseHeight.value, baseLeft.value, baseTop.value);
  };

  handleClear()
}
let offsetX = ref(0);
let offsetY = ref(0);
let isDraging = ref(false);
const dragStart = (evt) => {
  console.log("start", evt);
  isDraging.value = true;
  offsetX.value = evt.clientX - baseLeft.value;
  offsetY.value = evt.clientY - baseTop.value;
}
const dragAction = (evt) => {
  if (isDraging.value) {
    console.log("leave", evt);
    baseLeft.value = evt.clientX - offsetX.value;
    baseTop.value = evt.clientY - offsetY.value;
  }
}
const endAction = (evt) => {
  console.log("end", evt);
  isDraging.value = false;
}
const drag = (evt) => {
  console.log("drag", evt);
}
const dragOver = (evt) => {
  console.log("dragOver", evt);
}
const dragLeave = (evt) => {
  console.log("dragLeave", evt);
}
const dragEnter = (evt) => {
  console.log("dragEnter", evt);
}
onMounted(() => {
  init();
})
</script>

<template>
  <button @click="addNode">添加节点</button>

  <div class="node-list">

    <div class="node" :style="{width: baseWidth+'px !important',
    height: baseHeight+'px !important',
    left: baseLeft+'px!important',
    top: baseTop+'px!important',
    }"
         v-for="(item,index) in nodeList" :key="index" :id="item.id" draggable="true"
         @mousedown="dragStart"
         @mouseup="endAction"
         @mousemove="dragAction">
      <div class="node__wrapper">
        <div class="node__line node__line--left"
             :style="{'border-width': '3.6px', 'border-color': 'red'}"></div>
        <div class="node__line node__line--top" style="{'border-width': '3.6px', 'border-color': 'red'}"></div>
        <!--        <div class="node__line node__line&#45;&#45;label" style="font-size: 64.8px;"><h3>{{ item.name }}</h3></div>-->
        <div class="node-point node-point--left" @mousedown="rangeMove($event,'left')"></div>
        <div class="node-point node-point--right" @mousedown="rangeMove($event,'right')"></div>
        <div class="node-point node-point--top" @mousedown="rangeMove($event,'top')"></div>
        <div class="node-point node-point--bottom" @mousedown="rangeMove($event,'bottom')"></div>
        <div class="node-point node-point--top-left" @mousedown="rangeMove($event,'top-left')"></div>
        <div class="node-point node-point--top-right" @mousedown="rangeMove($event,'top-right')"></div>
        <div class="node-point node-point--bottom-left" @mousedown="rangeMove($event,'bottom-left')"></div>
        <div class="node-point node-point--bottom-right" @mousedown="rangeMove($event,'bottom-right')"></div>
        <div class="node__menu" :style="{'transform-origin': '0px 0px',transform: 'scale(3.6)'}"></div>
        <div class="node__item node-content">
          <h3>{{ item.name }}</h3>
        </div>
        <div class="node__mask"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.node-list {
  width: 1000px;
  height: 600px;
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #cecece;
  position: relative;
}

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
