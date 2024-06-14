<script setup lang="ts" name="GroupBoxContainer">
import {confirm} from "@/utils/message";
import piniaInstance from "@/store/index.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import {computed} from "vue";

const props = defineProps({
  parentField: {type: Object},
  formItem: {type: Object, required: true},
});
let designForm = DesignForm(piniaInstance);
let compList = computed(() => designForm.compList);
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

</script>
<template>
  <div :class="isEdit?'field-item':''" >
    <slot></slot>
    <div class="field-action" v-if="isEdit">
      <el-tooltip content="拖动">
        <star-horse-icon icon-class="drag" style="color: var(--star-horse-white)"/>
      </el-tooltip>
      <el-tooltip content="选中容器">
        <star-horse-icon class="icon-cls" @click.stop="selectData" icon-class="select-parent" style="color:var(--star-horse-white);"/>
      </el-tooltip>
      <el-tooltip content="删除容器">
        <star-horse-icon class="icon-cls" @click.stop="removeData" icon-class="clear-all" style="color:var(--star-horse-white);"/>
      </el-tooltip>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.field-item {
  width: inherit;
  position: relative;
  padding: 3px;
  z-index: 999;
  border: 1px dotted #e6a23c;
  margin-top: 3px;
  &:hover .field-action {
    opacity: 1;
  }

  .field-action {
    position: absolute;
    top: 0;
    left: 3px;
    height: 22px;
    opacity: 0;
    line-height: 22px;
    background: var(--star-horse-style);;
    z-index: 9999999;
    float: left;
    text-align: right;
    display: flex;
    flex-direction: row;

    .icon-cls {
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
    background: var(--star-horse-style);;
    z-index: 9;
    opacity: 0;

    .icon-cls {
      font-size: 12px;
      font-style: normal;
      color: var(--star-horse-style);
      margin: 4px;
      cursor: move;
    }

    &:hover {
      opacity: 1;
      background: var(--star-horse-style);;
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

  :deep(.el-form-item__content) {
    //position: unset;  /* TODO: 忘了这个样式设置是为了解决什么问题？？ */
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
