<script setup lang="ts" name="GroupBoxContainer">
import {confirm} from "@/utils/message";
import piniaInstance from "@/store/index.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import {computed} from "vue";
import {copyContainer} from "@/api/system.ts";
import {colDataInfo} from "@/components/formcomp/container/dytableUtils.ts";

const props = defineProps({
  parentField: {type: Object},
  formItem: {type: Object, required: true},
});
let designForm = DesignForm(piniaInstance);
let compList = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
let isEdit = computed(() => designForm.isEdit);
const selectData = () => {
  let container = props.formItem;
  designForm.selectItem(container, container?.itemType, "");
};
const removeData = () => {
  confirm("删除容器，容器内的所有元素都会被删除").then(res => {
    if (res) {
      let id = props.formItem.preps?.id || props.formItem.id;
      console.log(id, props.parentField);
      if (props.parentField?.itemType == "tab") {
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
          let items = elements[i].items;
          for (let j = 0; j < items.length; j++) {
            if (id === items[j]?.id) {
              items.splice(j, 1);
              return;
            }
          }
        }
      } else if (props.parentField?.itemType == "box") {
      } else {
        let dataList = compList.value;
        for (let i = 0; i < dataList.length; i++) {
          if (id === dataList[i].id) {
            dataList.splice(i, 1);
          }
        }
      }
    }
  });
};
const tableOperation = (actonName: string, _preps: any) => {
  let preps = props.formItem.preps;
  if (!preps.elements) {
    preps["elements"] = [];
  }
  let isBox = props.formItem.itemType == 'box';
  if (actonName == "insertRow") {
    //获取最大的数字
    let rows: Array<any> = preps.elements;
    if (rows.length > 0) {
      let columns: Array<any> = [];
      let len: number = 1;
      for (let index in rows) {
        let colLen = rows[index]?.columns?.length;
        if (colLen > len) {
          len = colLen;
        }
      }
      for (let i = 0; i < len; i++) {
        let col = colDataInfo();
        if (isBox) {
          col.colspan = 24 / len;
        }
        columns.push(col);
      }
      preps.elements.push({
        columns: columns
      });
    } else {
      let col = colDataInfo();
      if (isBox) {
        col.colspan = 24;
      }
      preps.elements.push({
        columns: []
      });
    }
  } else if (actonName == "insertCol") {
    for (let index in preps.elements) {
      let row: any = preps.elements[index];
      if (!row.columns) {
        row["columns"] = [];
      }
      let col = colDataInfo();
      if (isBox) {
        col.colspan = 24 / (row.columns.length + 1);
        row.columns.forEach((item: any) => {
          item.colspan = col.colspan;
        });
      }
      row.columns.push(col);
    }
  } else if (actonName == "copy") {

    copyContainer(props.parentField ? props.parentField!.preps?.elements : compList.value, props.formItem);
  }
}
</script>
<template>
  <div :class="{'field-item':isEdit}">
    <slot></slot>
    <div class="drag-handler" v-if="isEdit&&currentItemId==formItem.id">
      <el-tooltip content="拖动">
        <star-horse-icon icon-class="drag" style="color: var(--star-horse-white)"/>
      </el-tooltip>
      <el-tooltip content="选中容器">
        <star-horse-icon class="icon-cls" @click.stop="selectData" icon-class="select-parent"
                         style="color:var(--star-horse-white);"/>
      </el-tooltip>
      <el-tooltip content="删除容器">
        <star-horse-icon class="icon-cls" @click.stop="removeData" icon-class="clear-all"
                         style="color:var(--star-horse-white);"/>
      </el-tooltip>
    </div>
    <div
        class="field-action"
        v-if="isEdit&&currentItemId==formItem.id"
    >
      <template v-if="formItem.itemType=='dytable'||formItem.itemType=='box'">
        <el-tooltip content="插入行">
          <star-horse-icon
              @click.stop="tableOperation('insertRow',formItem?.preps)"
              icon-class="insert_row"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <el-tooltip content="插入列">
          <star-horse-icon
              @click.stop="tableOperation('insertCol',formItem?.preps)"
              icon-class="insert_col"
              style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </template>
      <el-tooltip content="复制容器">
        <star-horse-icon
            @click.stop="tableOperation('copy',formItem?.preps)"
            icon-class="copy"
            style="color: var(--star-horse-white)"
        />
      </el-tooltip>

    </div>
  </div>
</template>
<style lang="scss" scoped>
.field-item {
  width: 99%;
  position: relative;
  padding: 3px;
  border: 1px dashed #e6a23c;
  margin: 3px auto;
  .field-action {
    position: absolute;
    top: 0;
    transform: translate(0, -100%);
    right: 0;
    align-items: center;
    background: var(--star-horse-style);
    z-index: 99;
    display: flex;

    .svg-icon {
      font-size: 14px;
      color: var(--star-horse-white);
      margin: 0 3px;
      cursor: pointer;
    }
  }

  .drag-handler {
    position: absolute;
    top: 0;
    left: 3px;
    transform: translate(0, -100%);
    background: var(--star-horse-style);
    z-index: 999;
    text-align: right;
    align-items: center;
    display: flex;
    flex-direction: row;

    .icon-cls {
      font-size: 14px;
      color: var(--star-horse-white);
      margin: 0 3px;
      cursor: pointer;
    }
  }

}

.field-action, .drag-handler {
  .svg-icon {
    margin-left: 0;
    margin-right: 0;
  }
}

.el-form-item {
  position: relative;

  :deep(.el-form-item__label) {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  span.custom-label .icon-cls {
    margin: 0 3px;
  }

  :deep(.hide-spin-button) input::-webkit-outer-spin-button,
  :deep(.hide-spin-button) input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
  }

  :deep(.hide-spin-button) input[type="number"] {
    -moz-appearance: textfield;
  }
}

.required :deep(.el-form-item__label)::before {
  content: '*';
  color: #F56C6C;
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

.el-form-item.selected, .static-content-item.selected {
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
