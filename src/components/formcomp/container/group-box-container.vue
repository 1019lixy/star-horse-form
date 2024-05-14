<script setup lang="ts" name="GroupBoxContainer">
import {confirm} from "@/utils/message";
import piniaInstance from "@/store/index.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import {computed} from "vue";

const props = defineProps({
  formItem: {
    type: Object,
    required: true
  },
});
let designForm = DesignForm(piniaInstance);
let compList=computed(()=>designForm.compList);
let isEdit=computed(()=>designForm.isEdit);
const selectData = () => {
  let container = props.formItem;
  console.log(container);
  designForm.selectItem(container, container?.itemType, "");
};
const removeData = () => {
  confirm("删除容器，容器内的所有元素都会被删除").then(res => {
    if (res) {

      let dataList = compList.value;
      let id = props.formItem.preps?.id || props.formItem.id;
      for (let i = 0; i < dataList.length; i++) {
        if (id === dataList[i].id) {
          dataList.splice(i, 1);
        }
      }
    }
  });
};

</script>
<template>
  <div :class="isEdit?'field-item':''">
    <slot></slot>
    <div class="field-action" v-if="isEdit">
      <el-tooltip content="选中容器">
        <star-horse-icon class="icon-cls" @click.stop="selectData" icon-class="select-parent" style="color:#e3e9f2;"/>
      </el-tooltip>
      <el-tooltip content="删除容器">
        <star-horse-icon class="icon-cls" @click.stop="removeData" icon-class="clear-all" style="color:#e3e9f2;"/>
      </el-tooltip>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.field-item {
  width: 100%;
  padding: 3px;

  .field-action {
    position: relative;
    top: 3px;
    right: 10px;
    height: 22px;
    line-height: 22px;
    background: var(--star-horse-style);;
    z-index: 9999999;
    float: right;
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