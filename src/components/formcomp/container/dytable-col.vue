<script setup lang="ts" name="box-container">
import {computed, onMounted, PropType, reactive, watch} from 'vue'
import {warning} from '@/utils/message'
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {tableAction, tableCellOperation} from "@/api/system.ts";

const props = defineProps({
  parentField: {type: String},
  formInfo: {type: Object as PropType<any>},
  formData: {type: Object as PropType<any>},
  parentComp: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
  isFirstRow: {type: Boolean, default: false},
  isLastRow: {type: Boolean, default: false},
  isFirstCol: {type: Boolean, default: false},
  isLastCol: {type: Boolean, default: false},
  rowIndex: {type: Number, default: -1},
  colIndex: {type: Number, default: -1},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
// let currentItemId = computed(() => designForm.currentItemId);
let currentSubItemId = computed(() => designForm.currentSubItemId);
let isEdit = computed(() => designForm.isEdit);
let rows = computed(() => props.parentComp.preps.elements);

let buttonControl = reactive<any>({
  mergeLeftColDisabled: props.isFirstCol,
  mergeRightColDisabled: props.isLastCol,
  mergeWholeRowDisabled: false,
  mergeWholeColDisabled: false,
  mergeAboveRowDisabled: props.isFirstRow,
  mergeBelowRowDisabled: props.isLastRow,
  undoMergeRowDisabled: props.field.rowspan == 1,
  undoMergeColDisabled: props.field.colspan == 1,
  deleteWholeColDisabled: false,
  deleteWholeRowDisabled: false,
});
const getComponentName = (data: any) => {
  return data?.itemType + '-item'
};
const checkItem = (items: any) => {
  if (!items['items']) {
    items['items'] = [];
  }
}
const onDragAdd = (evt: Event, dataList: any) => {
  selectCurrentTd();
  let newIndex = evt.newIndex;
  if (draggingItem.value.itemType == 'box'
      || draggingItem.value.itemType == "tab"
      || draggingItem.value.itemType == "collapse"
      || draggingItem.value.itemType == "card"
      || draggingItem.value.itemType == "table") {
    warning('动态表格容器不允许嵌套其他容器');
    let columns = props.fields?.columns;
    for (let sind in columns) {
      let column = columns[sind];
      for (let i in column?.items) {
        let item = column.items[i];
        if (draggingItem.value.id == item.id) {
          console.log("find data", item);
          column.items.splice(i, 1);
        }
      }
    }
    return false;
  }
  if (newIndex != null && newIndex != 'undefined') {
    let dataInfo = dataList[newIndex];
    dataInfo.id = dataInfo.id + "copy";
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const handleTableCellCommand = (command: string) => {
  tableCellOperation(command, props);
}
const selectCurrentTd = () => {
  designForm.setSubItemId(props.field.id);
}
const init = () => {
  tableAction(props, buttonControl);
};
onMounted(() => {
  init();
});
//监控数据
watch(() => props.parentComp,
    () => tableAction(props, buttonControl),
    {
      immediate: false,
      deep: true
    }
)
</script>
<template>

  <td class="edit_col" :colspan="field.colspan||1" :rowspan="field.rowspan||1"
      :style="{width: field.cellWidth + ' !important' || '',
      height: field.cellHeight + ' !important' || '',
      'word-break': !!field.wordBreak ? 'break-all' : 'normal'}"
      @click="selectCurrentTd"
  >
    <draggable @add="(evt:Event)=>onDragAdd(evt,field.items)"
               class="smain-design"
               tag="div"
               group="starHorseGroup"
               ghostClass="ghost"
               animation="200"
               :list="field.items">
      <template #item="{element:data}">
        <div class="comp-item">
          <component :key="data?.id"
                     :field="data"
                     :formInfo="formInfo"
                     :is="getComponentName(data)"
                     :parentField="field"
                     :formData="formData"
                     v-if="data?.compType==='formItem'"/>
        </div>
      </template>
    </draggable>
    <div class="table-cell-action" v-if="isEdit&&currentSubItemId==field.id">
      <el-dropdown trigger="click" @command="handleTableCellCommand" size="small">
        <star-horse-icon icon-class="menu"/>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="insertLeftCol">左边插入列</el-dropdown-item>
            <el-dropdown-item command="insertRightCol">右边插入列</el-dropdown-item>
            <el-dropdown-item command="insertAboveRow">插入上方行</el-dropdown-item>
            <el-dropdown-item command="insertBelowRow">插入下方行</el-dropdown-item>

            <el-dropdown-item command="mergeLeftCol" :disabled="buttonControl.mergeLeftColDisabled" divided>合并左边单元格
            </el-dropdown-item>
            <el-dropdown-item command="mergeRightCol" :disabled="buttonControl.mergeRightColDisabled">合并右单元格
            </el-dropdown-item>
            <el-dropdown-item command="mergeWholeRow" :disabled="buttonControl.mergeWholeRowDisabled">合并整行
            </el-dropdown-item>


            <el-dropdown-item command="mergeAboveRow" :disabled="buttonControl.mergeAboveRowDisabled" divided>合并上边单元格
            </el-dropdown-item>
            <el-dropdown-item command="mergeBelowRow" :disabled="buttonControl.mergeBelowRowDisabled">合并下边单元格
            </el-dropdown-item>
            <el-dropdown-item command="mergeWholeCol" :disabled="buttonControl.mergeWholeColDisabled">合并整列
            </el-dropdown-item>

            <el-dropdown-item command="undoMergeRow" :disabled="buttonControl.undoMergeRowDisabled" divided>撤销行合并
            </el-dropdown-item>
            <el-dropdown-item command="undoMergeCol" :disabled="buttonControl.undoMergeColDisabled">撤销列合并
            </el-dropdown-item>

            <el-dropdown-item command="deleteWholeCol" :disabled="buttonControl.deleteWholeColDisabled" divided>删除整列
            </el-dropdown-item>
            <el-dropdown-item command="deleteWholeRow" :disabled="buttonControl.deleteWholeRowDisabled">删除整行
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </td>
</template>
<style lang="scss" scoped>
.smain-design {
  width: 100%;
  background: var(--star-horse-background);
  border-radius: 3px;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  vertical-align: middle;
  justify-content: center;
  align-items: center;

  .comp-item {
    margin: unset;
  }
}

td.edit_col {
  display: table-cell;
  height: 40px;
  position: relative;
  border: 1px solid var(--star-horse-border—color);

  .table-cell-action {
    position: absolute;
    //bottom: -30px;
    bottom: 0;
    right: -2px;
    height: 28px;
    line-height: 28px;
    background: var(--star-horse-style);
    z-index: 999;

    display: flex;
    align-items: center;

    svg {
      font-size: 14px;
      color: #fff;
      margin: 0 5px;
      cursor: pointer;
    }
  }
}
</style>
