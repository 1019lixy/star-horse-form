<script setup lang="ts" name="FieldPanel">
import {inject, Ref, ref} from 'vue'

let formDataList = ref<any>();
let containerList = ref<any>();
let selfFormDataList = ref<any>();

const dataInit = (container: any, items: any, selfItems: any) => {
  containerList.value = container;
  formDataList.value = items;
  selfFormDataList.value = selfItems;
};
let activeNames = ref(['a', 'b', 'c', 'd']);
let formFieldList = inject('formFieldList') as Ref;
let dragingItem = inject('dragingItem') as Ref;
const onContainerCopy = (data: any) => {
  return onDataCopy(data, 'container');
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, 'formItem');
};
const onDataCopy = (data: any, type: String) => {
  let reData = JSON.parse(JSON.stringify(data));
  let ms = formFieldList.value["index"]++;
  let mvData = {};
  mvData['id'] = 'Id' + ms;
  //console.log(reData);
  /**
   * 处理preps
   */
  let preps = reData.preps;
  mvData["preps"] = {};
  for (let key in preps) {
    let temp = preps[key];
    mvData.preps[temp.fieldName] = temp.defaultValues;
  }
  mvData.preps['id'] = mvData['id'];
  if (reData.itemType === 'button') {
    mvData.preps['btnLabel'] = reData.itemName;
  } else {
    mvData.preps['label'] = reData.itemName;
  }
  mvData.preps['name'] = reData.itemType + ms;
  formFieldList.value[reData.preps.fieldName] = getDefaultVal(reData.itemType);
  mvData['compType'] = type;
  mvData['itemType'] = reData.itemType;
  if (reData.itemType == "box" || reData.itemType == "table") {
    mvData.preps["elements"] = [{rowIndex: 1, columns: [{colIndex: 1, colspan: 24, items: [{}]}]}];
  }
  dragingItem.value = mvData;
  return mvData;
};
const getDefaultVal = (type: String) => {
  if (type == "number" || type == "slider" || type == "rate") {
    return undefined;
  } else if (type == "checkbox" || type == "transfer") {
    return [];
  } else {
    return "";
  }
};
const onStart = () => {
};
const onEnd = () => {
};
const onRemove = () => {

};
defineExpose({dataInit})
</script>

<style lang="scss" scoped>
.widget-collapse {
  border-top-width: 0;
  height: inherit;

  .el-collapse-item__header {
    padding-left: 10px;
    font-weight: bold;
  }

  .el-collapse-item__content {
    padding-bottom: 6px;
    margin-left: 8px;
    overflow: auto;

    ul {
      padding-left: 10px; /* 重置IE11默认样式 */
      margin: 0; /* 重置IE11默认样式 */
      margin-block-start: 0;
      margin-block-end: 0.25em;
      padding-inline-start: 10px;

      &:after {
        content: '';
        display: block;
        clear: both;
      }

      .field-item {
        display: inline-block;
        height: 28px;
        line-height: 28px;
        width: 115px;
        float: left;
        margin: 2px 6px 6px 0;
        cursor: move;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        background: #f1f2f3;
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
}
</style>
<template>
  <el-collapse
      class="widget-collapse"
      v-model="activeNames"
  >
    <el-collapse-item name="a">
      <template #title>
        &nbsp;<star-horse-icon icon-class="container"/>&nbsp;&nbsp;<span>容器</span>
      </template>
      <el-scrollbar height="100%">
        <draggable
            :clone="onContainerCopy"
            :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
            :sort="false"
            @end="onEnd"
            @start="onStart"
            animation="300"
            ghost-class="ghost"
            item-key="index"
            tag="ul"
            v-model="containerList"
        >
          <li
              class="field-item"
              v-for="item in containerList"
          >&nbsp;&nbsp;<span><star-horse-icon :icon-class="item.itemIcon"/>&nbsp;&nbsp;{{ item.itemName }}</span>
          </li>
        </draggable>
      </el-scrollbar>
    </el-collapse-item>
    <el-collapse-item name="b">
      <template #title>
        &nbsp;<star-horse-icon icon-class="form"/>&nbsp;&nbsp;<span>表单元素</span>
      </template>
      <el-scrollbar height="100%">
        <draggable
            :clone="onFormItemCopy"
            :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
            :sort="false"
            @end="onEnd"
            @start="onStart"
            @remove="onRemove"
            animation="300"
            ghost-class="ghost"
            item-key="key"
            tag="ul"
            v-model="formDataList"
        >
          <li
              class="field-item"
              v-for="item in formDataList"
          >&nbsp;&nbsp;<span><star-horse-icon :icon-class="item.itemIcon"/>&nbsp;&nbsp;{{ item.itemName }}</span>
          </li>
        </draggable>
      </el-scrollbar>
    </el-collapse-item>
    <el-collapse-item name="c">
      <template #title>
        &nbsp;<star-horse-icon icon-class="other"/>&nbsp;&nbsp;<span>自定义组件</span>
      </template>
      <el-scrollbar height="100%">
        <draggable
            :clone="onFormItemCopy"
            :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
            :sort="false"
            @end="onEnd"
            @start="onStart"
            @remove="onRemove"
            animation="300"
            ghost-class="ghost"
            item-key="key"
            tag="ul"
            v-model="selfFormDataList"
        >
          <li
              class="field-item"
              v-for="item in selfFormDataList">&nbsp;&nbsp;
            <span><star-horse-icon :icon-class="item.itemIcon"/>&nbsp;&nbsp;{{ item.itemName }}</span>
          </li>
        </draggable>
      </el-scrollbar>
    </el-collapse-item>
  </el-collapse>
</template>