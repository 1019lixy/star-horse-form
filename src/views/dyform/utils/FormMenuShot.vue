<script setup lang="ts">
import {nextTick, onMounted, PropType, ref} from "vue";
import {ApiUrls, operationConfirm, postRequest, success, warning} from "star-horse-lowcode";

const props = defineProps({
  dynamicFormList: {
    type: Array,
    default: () => []
  },
  dataUrl: {
    type: Object as PropType<ApiUrls>,
  },
  compSize: {
    type: String,
    default: "default"
  },
  primaryKey: {
    type: String,
    default: "id"
  }
});
const emits = defineEmits(["change"]);
const starHorseTreeRef = ref();
let startX = ref<any>(undefined); //判断是否要打开下拉
let endX = ref<any>(undefined);
let startY = ref<any>(undefined);
let endY = ref<any>(undefined);

let active = ref<boolean>(false); //判断当前是否在拖动状态
let currentX = ref<any>(undefined);
let currentY = ref<any>(undefined);
let initialX = ref<any>(undefined);
let initialY = ref<any>(undefined);

let xOffset = ref<number>(0);
let yOffset = ref<number>(0);
let dropDownVisible = ref<boolean>(false);
let show = ref<boolean>(true);
let body = document.querySelectorAll("body")[0];
const screenshot = ref();
const screenshotBtnRef = ref();
const hideDropDown = () => {
  dropDownVisible.value = false;
  body.removeEventListener("click", hideDropDown, false);
  let screenshotBtn = screenshotBtnRef.value.$el;
  if (screenshotBtn) {
    screenshotBtn.style.opacity = 0.2;
  }
};
//展示下拉
const showDropDown = (e) => {
  if (startX.value == endX.value && startY.value == endY.value) {
    dropDownVisible.value = !dropDownVisible.value;
    if (dropDownVisible.value == false) {
      hideDropDown();
    } else {
      body.addEventListener("click", hideDropDown, false);
      let screenshotBtn = screenshotBtnRef.value.$el;
      if (screenshotBtn) {
        screenshotBtn.style.opacity = 1;
      }
    }
  }
};
const setTranslate = (xPos: number, yPos: number, el: any) => {
  el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
};
const drag = ($event) => {
  if (active.value) {
    if ($event.type === "touchmove") {
      currentX.value = $event.touches[0].clientX - initialX.value;
      currentY.value = $event.touches[0].clientY - initialY.value;
    } else {
      currentX.value = $event.clientX - initialX.value;
      currentY.value = $event.clientY - initialY.value;
    }

    xOffset.value = currentX.value;
    yOffset.value = currentY.value;
    setTranslate(currentX.value, currentY.value, screenshot.value);
  }
  return false;
};
const dragEnd = ($event) => {
  initialX.value = currentX.value;
  initialY.value = currentY.value;
  //判断是否手机touch事件
  if ($event.type === "touchstart") {
    //记录结束的位置 当开始和结束的位置一样的时候，需要触发下拉菜单展示
    endX.value = $event.touches[0].clientX;
    endY.value = $event.touches[0].clientY;
  } else {
    //记录结束的位置 当开始和结束的位置一样的时候，需要触发下拉菜单展示
    endX.value = $event.clientX;
    endY.value = $event.clientY;
  }
  let screenshotBtn = screenshotBtnRef.value.$el;
  if (screenshotBtn) {
    screenshotBtn.style.opacity = 0.2;
  }
  active.value = false;

  body.removeEventListener("touchend", dragEnd);
  body.removeEventListener("touchmove", drag);
  body.removeEventListener("mouseup", dragEnd);
  body.removeEventListener("mousemove", drag);
  return false;
};
const dragStart = ($event) => {
  if ($event.type === "touchstart") {
    initialX.value = $event.touches[0].clientX - xOffset.value;
    initialY.value = $event.touches[0].clientY - yOffset.value;
    //记录开始的位置 当开始和结束的位置一样的时候，需要触发下拉菜单展示
    startX.value = $event.touches[0].clientX;
    startY.value = $event.touches[0].clientY;
  } else {
    initialX.value = $event.clientX - xOffset.value;
    initialY.value = $event.clientY - yOffset.value;
    //记录开始的位置 当开始和结束的位置一样的时候，需要触发下拉菜单展示
    startX.value = $event.clientX;
    startY.value = $event.clientY;
  }
  if ($event.currentTarget.id === screenshot.value.id) {
    body.removeEventListener("touchend", dragEnd, false);
    body.removeEventListener("touchmove", drag, false);
    body.removeEventListener("mouseup", dragEnd, false);
    body.removeEventListener("mousemove", drag, false);
    body.addEventListener("touchend", dragEnd, false);
    body.addEventListener("touchmove", drag, false);
    body.addEventListener("mouseup", dragEnd, false);
    body.addEventListener("mousemove", drag, false);
    //是否是拖拽状态
    active.value = true;
  }
  let screenshotBtn = screenshotBtnRef.value.$el;
  if (screenshotBtn) {
    screenshotBtn.style.opacity = 1;
  }

  return false;
};
const dataChange = (menu: any) => {
  emits("change", 'edit', menu);
};
const rmvData = (menu: any) => {
  operationConfirm("确认删除吗？").then(() => {
    postRequest(props.dataUrl?.deleteUrl!, [menu[props.primaryKey]]).then(res => {
      if (res.data.code) {
        warning(res.data.cnMessage);
        return;
      }
      success("操作成功");
      starHorseTreeRef.value.createSearchParams();
    })
  });
};
const addData = (menu: any) => {
  emits("change", 'subAdd', menu);
}
const init = async () => {
  await nextTick();
  screenshot.value.addEventListener("touchstart", dragStart, false);
  screenshot.value.addEventListener("mousedown", dragStart, false);
};
onMounted(async () => {
  await init();
});
defineExpose({
  hideDropDown
})
</script>
<template>
  <div v-show="show" ref="screenshot" id="screenshot" class="absolute left-[20px] bottom-[20px]">
    <div ref="screenshotDropdown" v-if="dropDownVisible" class="form-list" @click.stop.prevent>
      <star-horse-tree
          ref="starHorseTreeRef"
          :expand="true"
          treeTitle="表单列表"
          @selectData="dataChange"
          @removeData="rmvData"
          @addData="addData"
          :preps="{
                label: 'formName',
                value: primaryKey
              }"
          :helpMsg="`点击节点进行编辑，点击按钮进行添加或删除`"
          :showPageBar="true"
          :isDynamicData="true"
          :btnVisible="true"
          :rmvVisible="true"
          rmv-title="删除子表单"
          btnTitle="添加子表单"
          :autoLoad="true"
          :compUrl="dataUrl"
          :compSize="compSize"
      />
    </div>
    <el-button
        ref="screenshotBtnRef"
        id="screenshotBtn"
        @click.native.prevent.stop="showDropDown"
        class="fixed-position-btn"
        type="warning"
        icon="menu"
    ></el-button>
  </div>
</template>
<style lang="scss" scoped>
.form-list {
  position: absolute;
  left: 20px;
  bottom: 40px; // 保持与按钮间距
  z-index: 9999;
  width: 350px;
  height: 500px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
}

.fixed-position-btn {
  position: absolute;
  left: 20px;
  bottom: 20px;
  transform: translate(0, 0) !important;
}

</style>
