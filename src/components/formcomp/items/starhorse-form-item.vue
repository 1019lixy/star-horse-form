<script setup lang="ts" name="starhorse-form-item">
import {computed, inject, unref} from "vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: Object},
  parentId: {type: Object},
  formItem: {type: Object, required: true},
  isDesign: {type: Boolean, default: true}
});
let designForm = DesignForm(piniaInstance);
let isEdit = computed(() => designForm.isEdit);
let compList = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
const getParentComp = () => {
  return props.parentField &&
  (props.parentField.itemType == "box" || props.parentField.itemType == "table")
      ? "container"
      : "item";
};
const selectParentContainer = () => {
  if (!isEdit) {
    return;
  }
  designForm.selectItem(props.parentField, "", "item");
};
const selectData = (data: any) => {
  if (!isEdit) {
    return;
  }
  designForm.selectItem(props.formItem, data.itemType, getParentComp());
};
const moveUpItem = (formItem: any) => {
  if (!isEdit) {
    return;
  }
  let dataList = compList.value;
  let compType = getParentComp();
  if (compType === "item") {
    for (let i = 0; i < dataList.length; i++) {
      if (formItem.id === dataList[i].id && i > 0) {
        let temp = dataList[i];
        dataList[i] = dataList[i - 1];
        dataList[i - 1] = temp;
        break;
      }
    }
  } else {
    for (let i = 0; i < dataList.length; i++) {
      let dataTemp = dataList[i];
      if (dataTemp.compType !== "container") {
        continue;
      }
      let elements = dataTemp.preps.elements;
      for (let index in elements) {
        let sdataTemp = elements[index];
        if (sdataTemp.columns.length > 0) {
          for (let i = 0; i < sdataTemp.columns.length; i++) {
            let items = sdataTemp.columns[i].items;
            for (let j = 0; j < items.length; j++) {
              if (formItem.id === items[j].id && j > 0) {
                let temp = items[j];
                items[j] = items[j - 1];
                items[j - 1] = temp;
                break;
              }
            }
          }
        }
      }
    }
  }
};
const moveDownItem = (formItem: any) => {
  if (!isEdit) {
    return;
  }
  let dataList = compList.value;
  let compType = getParentComp();
  if (compType === "item") {
    for (let i = 0; i < dataList.length; i++) {
      if (formItem.id === dataList[i].id && i < dataList.length - 1) {
        let temp = dataList[i];
        dataList[i] = dataList[i + 1];
        dataList[i + 1] = temp;
        break;
      }
    }
  } else {
    for (let i = 0; i < dataList.length; i++) {
      let dataTemp = dataList[i];
      if (dataTemp.compType !== "container") {
        continue;
      }
      let elements = dataTemp.preps.elements;
      for (let index in elements) {
        let sdataTemp = elements[index];
        if (sdataTemp.columns.length > 0) {
          for (let i = 0; i < sdataTemp.columns.length; i++) {
            let items = sdataTemp.columns[i].items;
            for (let j = 0; j < items.length; j++) {
              if (formItem.id === items[j].id && j < items.length - 1) {
                let temp = items[j];
                items[j] = items[j + 1];
                items[j + 1] = temp;
                break;
              }
            }
          }
        }
      }
    }
  }
};
const removeItem = (formItem: any) => {
  if (!isEdit) {
    return;
  }
  let dataList = compList.value;
  let compType = getParentComp();
  if (compType === "item") {
    for (let i = 0; i < dataList.length; i++) {
      if (formItem.id === dataList[i].id) {
        dataList.splice(i, 1);
        break;
      }
    }
  } else {
    for (let i = 0; i < dataList.length; i++) {
      let dataTemp = dataList[i];
      if (dataTemp.compType !== "container") {
        continue;
      }
      let elements = dataTemp.preps.elements;
      for (let index in elements) {
        let sdataTemp = elements[index];
        if (sdataTemp.columns.length > 0) {
          for (let i = 0; i < sdataTemp.columns.length; i++) {
            let items = sdataTemp.columns[i].items;
            for (let j = 0; j < items.length; j++) {
              if (formItem.id === items[j].id) {
                items.splice(j, 1);
                break;
              }
            }
          }
        }
      }
    }
  }
};
</script>
<template>
  <div :class="[isEdit ? 'field-item design-star-horse' : '',
  (currentItemId == formItem?.preps.id && isEdit)?'active-item':''
  ]" v-if="isDesign">
    <el-form-item
        :label="formItem?.preps['label']"
        :prop="formItem?.preps['name']"
        :required="formItem?.preps['required']=='yes'"
        :rules="formItem?.preps['required']=='yes'?[{required:true,trigger:'blur',message:'必须项不能为空'}]:[]"
        @click="selectData(formItem)"
    >
      <slot></slot>
    </el-form-item>
    <div
        class="field-action"
        v-if="currentItemId == formItem?.preps.id && isEdit&&getParentComp()!='container'"
    >
      <el-tooltip content="选择父容器">
        <star-horse-icon
            @click.stop="selectParentContainer()"
            icon-class="select-parent"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
      <el-tooltip content="上移">
        <star-horse-icon
            @click.stop="moveUpItem(formItem?.preps)"
            icon-class="move-up"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
      <el-tooltip content="下移">
        <star-horse-icon
            @click.stop="moveDownItem(formItem?.preps)"
            icon-class="move-down"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>
    </div>
    <div class="drag-handler background-opacity" v-if="isEdit">
      <el-tooltip content="拖动">
        <star-horse-icon icon-class="drag" style="color: var(--star-horse-white)"/>
      </el-tooltip>
      <el-tooltip content="删除组件">
        <star-horse-icon
            @click.stop="removeItem(formItem?.preps)"
            icon-class="clear-all"
            style="color: orangered"
        />
      </el-tooltip>
    </div>
  </div>
  <slot v-else></slot>
</template>
<style lang="scss" scoped>
.active-item {
  border: 2px dotted yellow;
}

.design-star-horse {
  padding: 3px;
  width: 100%;
  justify-content: center;
  vertical-align: middle;
  z-index: 0;

  /*  :hover + .field-action {
      visibility: visible;
    }*/
}

.field-item {
  position: relative;
  width: inherit;

  .el-form-item {
    margin-bottom: 1px;
  }

  .field-action {
    position: absolute;
    //bottom: -24px;
    bottom: 6px;
    right: 5px;
    height: 22px;
    line-height: 22px;
    background: var(--star-horse-style);;
    z-index: 9999999;

    i {
      font-size: 14px;
      color: var(--star-horse-white);
      margin: 0 3px;
      cursor: pointer;
    }
  }

  .drag-handler {
    position: absolute;
    top: 0;
    left: -1px;
    height: 20px;
    line-height: 20px;
    background: var(--star-horse-style);
    z-index: 9;
    opacity: 0;

    i {
      font-size: 12px;
      font-style: normal;
      color: var(--star-horse-style);
      margin: 4px;
      cursor: move;
    }

    &:hover {
      opacity: 1;
      background: var(--star-horse-style);
    }
  }
}

/*.field-action {
  visibility: hidden;
}*/

.field-action,
.drag-handler {
  :deep(.svg-icon) {
    margin-left: 0;
    margin-right: 0;
  }
}

.el-form-item {
  //margin-bottom: 0 !important;
  //margin-bottom: 6px;

  //margin-top: 2px;
  position: relative;

  :deep(.el-form-item__label) {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :deep(.el-form-item__content) {
    //position: unset;  /* TODO: 忘了这个样式设置是为了解决什么问题？？ */
  }

  span.custom-label i {
    margin: 0 3px;
  }

  /* 隐藏Chrome浏览器中el-input数字输入框右侧的上下调整小箭头 */
  :deep(.hide-spin-button) input::-webkit-outer-spin-button,
  :deep(.hide-spin-button) input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
  }

  /* 隐藏Firefox浏览器中el-input数字输入框右侧的上下调整小箭头 */
  :deep(.hide-spin-button) input[type="number"] {
    -moz-appearance: textfield;
  }
}

.required :deep(.el-form-item__label)::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.static-content-item {
  min-height: 20px;
  display: flex; /* 垂直居中 */
  align-items: center; /* 垂直居中 */

  :deep(.el-divider--horizontal) {
    margin: 0;
  }
}

.el-form-item.selected,
.static-content-item.selected {
  outline: 2px solid var(--star-horse-style);;
}

:deep(.label-left-align) .el-form-item__label {
  text-align: left;
  justify-content: flex-start !important;
}

:deep(.label-center-align) .el-form-item__label {
  text-align: center;
  justify-content: center !important;
}

:deep(.label-right-align) .el-form-item__label {
  text-align: right;
  justify-content: flex-end !important;
}
</style>