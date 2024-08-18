<script setup lang="ts">
import {onMounted, ref} from "vue";
import {loadTemplate, templateList} from "@/views/codegenerator/utils/IdeOperation.ts";
import {SelectOption} from "@/components/types/SearchProps";
import Help from "@/components/help.vue";
import {commands} from "@/utils/sh_design.ts";

const editor = ref();
let tempList = ref<SelectOption[]>([]);
let sourceCode = ref<string>("");
let templateCode = ref<string>("");
const transform = (_val: string) => {
}
const init = async () => {
  tempList.value = await templateList();
}
const changeTemplate = async (val: string) => {
  let value = await loadTemplate(val, "com.starhorse.devops.customer", "Customer");
  editor.value.setValue(value);
}
const helpMessage = ``;
onMounted(() => {
  init();
});
</script>
<template>
  <div class="design-content">
    <div class="comp-list">
      <el-select v-model="templateCode" @change="changeTemplate">
        <el-option v-for="item in tempList" :value="item.value" :label="item.name" :key="item.value"/>
      </el-select>
    </div>
    <div class="design-main">
      <div class="inner_button">
        <el-menu mode="horizontal" style="height: inherit;width: 100%;">
          <template v-for="(item,index) in commands">
            <el-menu-item v-if="item.defaultEdit">
              <el-tooltip class="item" :content="item.label" :index="index"
                          effect="dark"
                          placement="bottom">
                <star-horse-icon @click="transform(item.key)" :icon-class="item.icon" size="24px"
                                 style="color: var(--star-horse-style)"
                />
              </el-tooltip>
            </el-menu-item>
          </template>
        </el-menu>
        <help :message="helpMessage"/>
      </div>
      <div class="background-grid-app">
        <StarHorseEditor v-model:value="sourceCode" :lang="'java'" ref="editor"/>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.x6-edge-selected {
  border: 1px dashed #3a8ee6;
}
hr {
  height: 1px;
  margin: 10px 0;
  border: 0;
  clear: both;
}
.el-drawer__header {
  border-bottom: 1px solid #8F8F8F;
  padding: 10px;
  margin-bottom: 10px;
  height: 40px;
  line-height: 40px;
  text-indent: .5em;
  background-color: #eee;
  span {
    font-weight: bold;
    font-size: 14px;
  }
}
.design-content {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
  .comp-list {
    min-width: 205px;
    margin-right: 5px;
    border: 1px solid #eee;
    .el-collapse {
      padding-left: 5px;
    }
    &:after, &:before {
      box-sizing: border-box;
    }
    ul {
      margin: 0;
      padding: 0;
      &:after {
        content: '';
        display: block;
        clear: both;
      }
      .field-item {
        display: flex;
        height: 28px;
        line-height: 28px;
        width: 98%;
        margin-bottom: 2px;
        margin-left: 2px;
        cursor: move;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        background: #f1f2f3;
        border-radius: 3px;
        span {
          display: flex;
          align-content: center;
          align-items: center;
        }
      }
      .field-item:first-child {
        margin-top: 5px;
      }
      .field-item:hover {
        background: #ebeef5;
        outline: 1px solid #999999;
      }
      .drag-handler {
        position: absolute;
        top: 0;
        left: 160px;
        background-color: #dddddd;
        border-radius: 5px;
        padding-right: 5px;
        font-size: 11px;
        color: #666666;
      }
    }
  }
  .design-main {
    flex: 1;
    height: 100%;
    /*min-height: 500px;*/
    display: flex;
    flex-direction: column;
    .inner_button {
      height: 40px;
      text-align: left;
      justify-content: flex-start;
      background-color: #fafafa;
      border: solid 1px #ccc;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .background-grid-app {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0;
      font-family: sans-serif;
    }
  }
  .right-attr-panel {
    width: 280px;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    margin-left: 5px;
    .title {
      padding-left: 5px;
      align-items: center;
      vertical-align: middle;
      width: 99%;
      line-height: 40px;
      height: 40px;
      font-size: 14px;
      background: #eee;
    }
  }
}
:deep(.el-card__body) {
  height: 100%;
}
</style>
