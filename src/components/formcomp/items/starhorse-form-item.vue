<script setup lang="ts" name="starhorse-form-item">
import {computed, onMounted} from "vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: Object},
  parentId: {type: Object},
  formItem: {type: Object, required: true},
  isDesign: {type: Boolean, default: true},
  //是否需要css 修饰
  bareFlag: {type: Boolean, default: false}
});
let designForm = DesignForm(piniaInstance);
let isEdit = computed(() => designForm.isEdit);
let refresh = computed(() => designForm.refresh);
let compList = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
const getParentComp = () => {
  return props.parentField &&
  (props.parentField.itemType == "box"
      || props.parentField.itemType == "tab"
      || props.parentField.itemType == "dytable"
      || props.parentField.itemType == "table")
      ? "container"
      : "item";
};
const selectParentContainer = () => {
  if (!isEdit.value) {
    return;
  }
  designForm.selectItem(props.parentField, "", "item");
};
const selectData = (data: any) => {
  if (!isEdit.value) {
    return;
  }
  designForm.selectItem(props.formItem, data.itemType, getParentComp());
};
const moveUpItem = (formItem: any) => {
  if (!isEdit.value) {
    return;
  }
  //这个数据解析好麻烦
  let dataList = compList.value;
  if (props.parentField?.itemType == "tab") {
    let elements = props.parentField!.preps.elements;
    for (let i = 0; i < elements.length; i++) {
      let items = elements[i].items;
      for (let j = 0; j < items.length; j++) {
        if (formItem.id === items[j]?.id && j > 0) {
          let temp = items[j];
          items[j] = items[j - 1];
          items[j - 1] = temp;
          return;
        }
      }
    }
  } else if (props.parentField?.itemType == "box") {
  }
  //console.log(props.parentField);
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
  if (!isEdit.value) {
    return;
  }
  let dataList = compList.value;
  if (props.parentField?.itemType == "tab") {
    let elements = props.parentField!.preps.elements;
    for (let i = 0; i < elements.length; i++) {
      let items = elements[i].items;
      for (let j = 0; j < items.length; j++) {
        if (formItem.id === items[j]?.id && j < items.length - 1) {
          let temp = items[j];
          items[j] = items[j + 1];
          items[j + 1] = temp;
          return;
        }
      }
    }
  } else if (props.parentField?.itemType == "box") {
  }
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
  if (!isEdit.value) {
    return;
  }
  console.log(formItem, props.parentField);
  let parentItemType = props.parentField?.itemType;

  let dataList = compList.value;
  if (parentItemType == "tab" || parentItemType == "table" || parentItemType == "card" || parentItemType == "collapse") {
    let elements = props.parentField!.preps.elements;
    for (let i = 0; i < elements.length; i++) {
      let items = elements[i].items;
      for (let j = 0; j < items.length; j++) {
        if (formItem.id === items[j]?.id) {
          items.splice(j, 1);
          return;
        }
      }
    }
  } else if (parentItemType == "box" || parentItemType == "dytable") {
    let elements = props.parentField!.preps.elements;
    for (let index in elements) {
      let sdataTemp = elements[index];
      if (sdataTemp.columns.length > 0) {
        for (let i = 0; i < sdataTemp.columns.length; i++) {
          let items = sdataTemp.columns[i].items;
          for (let j = 0; j < items.length; j++) {
            if (formItem.id === items[j].id) {
              items.splice(j, 1);
              return;
            }
          }
        }
      }
    }
  } else {
    for (let i = 0; i < dataList.length; i++) {
      if (formItem.id === dataList[i].id) {
        dataList.splice(i, 1);
        return;
      }
    }
  }
};
onMounted(() => {
})
</script>
<template>
  <div v-if="bareFlag">
    <help :message="formItem.preps?.helpMsg" v-if="formItem.preps?.helpMsg"/>
    <slot></slot>
  </div>

  <div v-else class="form-item-operation">
    <div :class="{'field-item design-star-horse' : isEdit,
  'active-item':currentItemId == formItem?.preps.id && isEdit
  }" v-if="isDesign" @click="selectData(formItem)">

      <el-form-item
          :size="formItem?.preps['size']||'default'"
          v-if="parentField?.itemType!='table'&&formItem?.itemType!='divider'&&formItem?.preps['headerFlag']!='Y'"
          :label="formItem?.preps['hideLabel']=='Y'?'':formItem?.preps['label']"
          :prop="formItem?.preps['name']"
          :required="formItem?.preps['required']=='Y'"
          :rules="formItem?.preps['required']=='Y'?[{required:true,trigger:'blur',message:'必须项不能为空'}]:[]"
      >
        <help :message="formItem.preps?.helpMsg" v-if="formItem.preps?.helpMsg"/>
        <slot></slot>
      </el-form-item>
      <div v-else class="bare-item">
        <help :message="formItem.preps?.helpMsg" v-if="formItem.preps?.helpMsg"/>
        <slot></slot>
      </div>
      <div
          class="field-action"
          v-if="isEdit"
      >
        <el-tooltip content="选择父容器" v-if="parentField?.itemType">
          <star-horse-icon
              @click.stop="selectParentContainer()"
              icon-class="select-parent"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <!--        <el-tooltip content="选中组件">
                  <star-horse-icon
                      @click.stop="selectData"
                      icon-class="check"
                      style="color: var(&#45;&#45;star-horse-white)"
                  />
                </el-tooltip>-->
        <el-tooltip content="上移" v-if="parentField?.itemType!='table'">
          <star-horse-icon
              @click.stop="moveUpItem(formItem?.preps)"
              icon-class="move-up"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <el-tooltip content="下移" v-if="parentField?.itemType!='table'">
          <star-horse-icon
              @click.stop="moveDownItem(formItem?.preps)"
              icon-class="move-down"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <el-tooltip content="删除组件">
          <star-horse-icon
              @click.stop="removeItem(formItem?.preps)"
              icon-class="clear-all"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </div>
      <div class="drag-handler background-opacity" v-if="isEdit">
        <el-tooltip content="拖动">
          <star-horse-icon icon-class="drag" style="cursor:move;color: var(--star-horse-white)"/>
        </el-tooltip>

        <el-tooltip :content="formItem?.preps['itemNameLabel']">
          <span style="color:var(--star-horse-white);cursor: pointer"
                @click="selectData(formItem)">{{ formItem?.preps['itemNameLabel'] }}</span>
        </el-tooltip>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>
<style lang="scss" scoped>
.form-item-operation {
  width: 100%;

}

.active-item {
  border: 1px dashed var(--star-horse-style);
}

.design-star-horse {
  width: 100%;
  justify-content: center;
  vertical-align: middle;
  align-items: center;
  z-index: 0;
}

.field-item {
  position: relative;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  align-items: center;

  .bare-item {
    width: 100%;
    height: 100%;
  }

  &:hover > .field-action {
    opacity: 1;
    display: flex;
  }

  &:hover > .drag-handler {
    opacity: 1;
    display: flex;
  }

  .el-form-item {
    margin-bottom: 1px;
  }

  .field-action {
    position: absolute;
    //bottom: -25px;
    bottom: 1px;
    right: 0;
    align-items: center;
    background: var(--star-horse-style);
    z-index: 99;
    display: none;

    .svg-icon {
      font-size: 14px;
      color: var(--star-horse-white);
      margin: 0 3px;
      cursor: pointer;
    }

    /* &:hover {
       opacity: 1;
       background: var(--star-horse-style);
     }*/
  }

  .drag-handler {
    position: absolute;
    top: -10px;
    left: -1px;
    display: none;
    align-items: center;
    background: var(--star-horse-style);
    z-index: 9999999;


    .svg-icon {
      font-size: 12px;
      font-style: normal;
      color: var(--star-horse-style);
      margin: 4px;

      &:first-child {
        cursor: move;
      }

      &:last-child {
        cursor: pointer;
      }
    }

    /*   &:hover {
         opacity: 1;
         background: var(--star-horse-style);
       }*/
  }
}

.field-action,
.drag-handler {
  :deep(.svg-icon) {
    margin-left: 0;
    margin-right: 0;
  }
}

.drag-handler {
  padding-right: 10px;
  font-size: 13px;
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
  outline: 2px solid var(--star-horse-style);
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
