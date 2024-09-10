<script setup lang="ts" name="StarHorseDialog">
import {computed, onMounted, PropType, provide, reactive, ref, watch} from "vue";
import {DialogProps} from "@/components/types/DialogProps";
import {i18n} from "@/lang";
import {BtnAuth} from "@/components/types/BtnAuth";

const emits = defineEmits(["merge", "mergeDraft", "resetForm", "closeAction"]);
const props = defineProps({
  dialogVisible: {type: Boolean, default: false},
  dialogProps: {type: Object as PropType<DialogProps>, default: {}},
  isShowReset: {type: Boolean, default: true},
  isShowSave: {type: Boolean, default: false},
  isShowBtnContinue: {type: Boolean, default: false},
  isView: {type: Boolean, default: false},
  draggable: {type: Boolean, default: true},
  boxHeight: {type: String, default: "60%"},
  boxWidth: {type: String, default: "60%"},
  isBatch: {type: Boolean, default: false},
  fullScreen: {type: Boolean, default: false},
  selfFunc: {type: Boolean, default: false},
  btnText: {type: String, default: "提交"},
  userBtn: {type: Array<BtnAuth>, default: []},
  btnTextContinue: {type: String, default: "提交并继续"},
  title: {type: String, default: ""},
  compSize: {type: String, default: "default"}
});
let windowsType = ref<boolean>(false);
watch(
    () => props.dialogVisible,
    (val: boolean) => {
      windowsType.value = val;
    }, {
      immediate: true,
      deep: true
    }
);
let isFullScreen = ref(props.fullScreen);
const dialogStyle = computed(() => {
  return {"max-height": isFullScreen.value ? "100%" : props.boxHeight};
});
const beforeClose = () => {
  emits("closeAction");
  if (props.dialogProps?.batchEditVisible || props.isBatch) {
    props.dialogProps.batchEditVisible = false;
  }
  if (props.dialogProps!.viewVisible || props.isView) {
    props.dialogProps!.viewVisible = false;
  }
  if (props.dialogProps!.editVisible) {
    props.dialogProps!.editVisible = false;
  }
  if (props.dialogProps!.bakeVisible1) {
    props.dialogProps!.bakeVisible1 = false;
  }
  if (props.dialogProps!.bakeVisible2) {
    props.dialogProps!.bakeVisible2 = false;
  }
  if (props.dialogProps!.bakeVisible3) {
    props.dialogProps!.bakeVisible3 = false;
  }
  windowsType.value = false;
};
onMounted(() => {
});
provide("closeDialog", beforeClose);
const fullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};
let clickFunction = reactive<any>({});
const operation = (funcName: string, type: string) => {
  if (props.selfFunc) {
    emits(`${funcName}`, type);
  } else {
    clickFunction["funcName"] = funcName;
    clickFunction["type"] = type;
  }
}
provide("dialogOperation", clickFunction);
</script>
<template>
  <Teleport to="body">
    <div class="di animated animate__fadeIn">
      <el-dialog :append-to-body="false" :center="false" :destroy-on-close="true" :close-on-click-modal="false"
                 :close-on-press-escape="false" :lock-scroll="true" class="dialog-settings.ts"
                 :fullscreen="isFullScreen"
                 :show-close="false" :draggable="draggable" :align-center="true" v-model="windowsType"
                 @close="beforeClose"
                 :width="boxWidth" :style="dialogStyle">
        <template #header="{ close }">
          <h3>{{ title || dialogProps.dialogTitle }}</h3>
          <div class="my-header">
            <el-button style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize"
                       @click="fullScreen" link v-if="!!isFullScreen && draggable">
              <el-tooltip :content="i18n('dialog.resize')">
                <star-horse-icon icon-class="fullscreen-shrink" color="var(--star-horse-white)"/>
              </el-tooltip>
            </el-button>
            <el-button style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize"
                       @click="fullScreen" link v-if="!isFullScreen && draggable">
              <el-tooltip :content="i18n('dialog.fullScreen')">
                <star-horse-icon icon-class="fullscreen-expand" color="var(--star-horse-white)"/>
              </el-tooltip>
            </el-button>
            <el-button style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize"
                       @click="close" link>
              <el-tooltip :content="i18n('dialog.close')">
                <star-horse-icon icon-class="close" color="var(--star-horse-white)"/>
              </el-tooltip>
            </el-button>
          </div>
        </template>
        <div class="eee">
          <slot></slot>
        </div>
        <slot name="extand"></slot>
        <span class="dialog-footer" v-if="!isView">
          <el-button @click="operation('merge','close')"
                     style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
            <star-horse-icon icon-class="save" style="color:var(--star-horse-white);"/>
            {{ i18n("dialog.submit") }}
          </el-button>
             <el-button @click="operation('merge','continue')"
                        style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize"
                        v-if="isShowBtnContinue">
            <star-horse-icon icon-class="save_continue" style="color:var(--star-horse-white);"/>
             {{ i18n("dialog.submitContinue") }}</el-button>
          <el-button @click="operation('mergeDraft','close')" :size="compSize" link
                     style="background: var(--star-horse-style);color: var(--star-horse-white)" v-if="isShowSave">
            <star-horse-icon icon-class="short_save"/>{{ i18n("dialog.save") }}</el-button>
             <el-button @click="operation('mergeDraft','continue')" :size="compSize" link
                        style="background: var(--star-horse-style);color: var(--star-horse-white)"
                        v-if="isShowSave&&isShowBtnContinue">
            <star-horse-icon icon-class="save"/>{{ i18n("dialog.saveContinue") }}</el-button>
           <template v-if="userBtn" v-for="item in userBtn">

               <el-button @click="item?.exec!()" :disabled="item.disabled=='Y'"
                          :style="{background: item.disabled=='Y'?'var(--star-horse-disable)':'var(--star-horse-style)',
                          color: 'var(--star-horse-white)'}" :size="compSize">
            <star-horse-icon :icon-class="item.icon" style="color:var(--star-horse-white);"/>
            {{ item.labelName }}
          </el-button>
           </template>
          <el-button @click="operation('resetForm','reset')" :size="compSize" link v-if="isShowReset" >
            <star-horse-icon icon-class="undo" style="color:var(--star-horse-style);"/>
            {{ i18n("dialog.reset") }}</el-button>
        </span>
        <slot name="footer"></slot>
      </el-dialog>
    </div>
  </Teleport>
</template>
<style lang="scss" scoped>
.di {
  :deep(.el-dialog) {
    display: flex;
    flex-direction: column;
    padding: unset;

    .el-dialog__header {
      flex-shrink: 0;
      height: 40px;
      box-sizing: border-box;
      padding: 10px;
      background-color: var(--star-horse-style);
      margin: 0;
      border-bottom: var(--star-horse-shadow) 4px solid;
      display: flex;
      flex-direction: row;
      color: var(--star-horse-white);

      h3 {
        flex: 1;
      }

      .my-header {
        width: 100px;
        display: flex;
        justify-content: right;
        flex-direction: row;
        right: 10px;
      }
    }

    .el-dialog__body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }
}

.eee {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #f2f2f2 !important;
    z-index: 222;
    border-radius: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
