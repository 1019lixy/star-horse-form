<script setup lang="ts" name="table-container">
// 右键菜单组件
import RightKeyMenu from '@/components/formcomp/container/right-key-menu.vue'
import GroupBoxContainer from "@/components/formcomp/container/group-box-container.vue";
import {computed, inject, nextTick, PropType, reactive, Ref, ref} from "vue";
import {warning} from "@/utils/message";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

let alignDict = reactive({
  '左': 'left',
  '中': 'center',
  '右': 'right'
});
let valignDict = reactive({
  '上': 'top',
  '中': 'middle',
  '下': 'bottom'
});
let reflush = ref(true); // 强制刷新表格
let containerTableRef = ref(); // 强制刷新表格
// 对齐方式
let result = ref(0);
let cellHeight = ref(30);  // 一个单元格的基础高度
let cellWidth = ref(25);
let tableId = ref('evol-' + +new Date());
let selectCells = ref([]);  // 被选中的单元格 标志数组
let cells = ref(null);
let mouseEventDom = ref(null); // 鼠标当前所在单元格
let mouseDownCell = ref(null); // 鼠标按下时的节点
let rightDownCell = ref(null);  // 鼠标右键按下的节点
let menuList = ref<any>([]);  // 右键菜单列表
let allowMerging = ref(false); // 是否允许合并单元格
let currDataType = ref('static');
let defaultVal = ref([]);
let isShowNoData = ref(false);
let isMouseDown = ref(false);
const props = defineProps({
  parentCompType: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
let editable = inject("tableEditable");

/**
 * 选中规则
 * 鼠标动作有以下几种
 * 1.鼠标左键按下
 *    选中当前的单元格
 * 2.鼠标左键按下并且拖动
 *        选中 起始点与与松开点的单元格
 * 3.鼠标右键按下
 *  弹出自定义菜单
 * -----------------------
 * 监听  mousedown mouseover  mouseup
 * ----------------
 */
const mouseDown = (e: MouseEvent) => {
  isMouseDown.value = !isMouseDown.value;
  selectCells.value = [];
};
const endSelect = (e: Event) => { // 结束框选
  if (!isEdit.value) {
    return
  }
  mouseDownCell.value = null

};
const mouseUp = (e: MouseEvent) => {
  isMouseDown.value = !isMouseDown.value;
};
const mouseMove = (event: MouseEvent) => {
  if (!isMouseDown.value || event.toElement.tagName.toLowerCase() == "table") { // 没有在表格中 按下鼠标
    return
  }
  // 获取当前 鼠标在表格中的位置
  let mouseEventDom = event.toElement.attributes;
  let selectedTd = mouseEventDom["dataSelectFlag"].value;
  if (selectCells.value.indexOf(selectedTd) == -1) {
    selectCells.value.push(selectedTd);
  }
  event.toElement.style = "background:#ffbb00";
};
//合并单元格
const mergingCell = () => {

};
const getComponentName = (data: any) => {
  return data.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex

  if (draggingItem.itemType == 'box' || draggingItem.itemType == 'table') {
    warning('容器不能嵌套容器')
    return
  }
  if (newIndex != null && newIndex != 'undefined') {
    let dataInfo = dataList[newIndex];
    designForm.setCurrentItemId(dataInfo.id);
    designForm.setCurrentItemType(dataInfo.compType);
    designForm.setParentCompType(itemType.value);
  }
};
const selectItem = (data: any, parentCompType: String) => {
  emits("selectItem", data, parentCompType);
}
const getMenu = async (event: Event) => { // 获取菜单
  allowMerging.value = true
  // 拆分单元格 选中的是一个 或者 没有选中 且右击了单元格 同时 rouspan、colspan ！=1
  menuList.value = [
    {label: '合并单元格', enable: true}, // 0
    {label: '拆分单元格', enable: true}, // 1
    {label: '插入行', enable: true}, // 2
    {label: '插入列', enable: true}, // 3
    {label: '删除行', hide: false, enable: true},//4
    {label: '删除列', hide: false, enable: true}//5
  ] // 6
  await nextTick();
  // 是否加入合并单元格功能
  containerTableRef.value.open(event, (index: number, val: any) => {
    switch (index) {
      case 0 :
        mergingCell();
        selectCells.value = [];
        break 		// 合并
      case 1 :
        cellSpilt();
        selectCells.value = [];
        break 		// 拆分 取消单元格选中
      case 2 :
        inserRow(val);
        selectCells.value = [];
        break 			// 插入行
      case 3 :
        insertCol(val);
        selectCells.value = [];
        break 			// 插入列
      case 4 :
        removeRow();
        selectCells.value = [];
        break
      case 5 :
        removeCol();
        selectCells.value = [];
        break
      default:
        console.log("未知类型")
    }
  });
};
const cellSpilt = () => {
};

const inserRow = (val: any) => {
};
const insertCol = (val: any) => {
};
const removeRow = () => {
};
const removeCol = () => {
};
</script>

<style lang="scss" scoped>
.select {
  background: #FAF0DE !important;
}

.isedit {
  background-color: var(--star-horse-white) !important;
}

.dynamic-table-wapper {
  // padding:20px;
  // min-height: 200px;
  border-radius: 5px;
  overflow: hidden;
  // border:1px solid #dfe6ec;
  table-layout: fixed;

  .isPreview {
    user-select: auto !important;
  }

  .noPreview {
    user-select: none !important;
  }

  .dynamic-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #8F8F8F;

    &:first-child tr {
      th {
        border-top: none !important;
      }
    }

    tr {
      &:first-child th {
        border-top: none !important;
        border-left: none !important;
      }

      th:first-child, td:first-child {
        border-left: none !important;
      }

      th:last-child, td:last-child {
        border-right: none !important;
      }

      &:last-child td {
        border-bottom: none !important;
      }
    }

    th {
      // background-color: #F9FAFB;
      font-weight: 300;
    }

    td {
      font-size: 14px;
      color: #222222;
      // background-color: #ffffff;
    }

    td, th {
      word-wrap: break-word;
      border-spacing: 0;
      // border:1px solid #dfe6ec;
      box-sizing: border-box;
      padding: 5px;
      overflow-x: auto;
    }
  }
}

.brder-right-none {
  border-right: none !important;
}

.brder-bottom-none {
  border-bottom: none !important;
}

.table-title {
  text-align: center;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
}
</style>
<template>
  <div :id="tableId" style="position: relative;" @contextmenu.prevent.stop>
    <right-key-menu :ref="tableId+'menu'" :menu-list="menuList"/>
    <group-box-container class="dynamic-table-wapper" :form-item="field.preps"
    >
      <table
          v-if="reflush"
          ref="containerTableRef"
          :key="field.preps.rowAndCols.length"
          class="dynamic-table"
          :class="{'isPreview':!isEdit,'noPreview':isEdit}"
          @mousedown="mouseDown"
          @mousemove="mouseMove"
          @mouseup="mouseUp"
          @mouseleave="endSelect"
          @contextmenu="getMenu"
      >
        <tr v-for="(tr,row) in field.preps.rowAndCols" :key="'throw'+row">
          <template v-for="(td,col) in tr.colAndDatas">
            <td

                :rowspan="td.rowspan || 1"
                :colspan="td.colspan || 1"
                :align="alignDict[tr.align]"
                :valign="valignDict[tr.valign]"
                style="color: #8691A0;"
                :style="{ 'height':'35px',
                                        width:(100/tr.cols)+'%',
                                        borderTop: `1px solid  #dfe6ec`,
                                        borderBottom: `1px solid #dfe6ec`,
                                        borderLeft: `1px solid #dfe6ec`,
                                        borderRight: `1px solid #dfe6ec`,
                                        backgroundColor: td.cellFill
                                        }"
                :dataSelectFlag="`td-${row}-${col}-${td.rowspan}-${td.colspan}`"
                :class="{'cell':true,'brder-bottom-none':true}"
            >
              <draggable @add="(evt)=>onDragAdd(evt,td.datas)" class="smain-design"
                         tag="div"
                         v-bind="{group:'starHorseGroup', ghostClass: 'ghost',animation: 200}"
                         v-model="td.datas">
                <template v-for="data in td.datas">
                  <component :field="data" :is="getComponentName(data)"
                             @selectItem="selectItem" v-if="data.compType==='formItem'"/>
                </template>

              </draggable>
            </td>
          </template>
        </tr>
      </table>
      <div
          v-if="isShowNoData"
          class="d-flex j-center"
          :style="{
          borderTop: `1px solid ${options.rowBorderColor ? options.rowBorderColor : '#dfe6ec'}`}"
      >
        <v-noData/>
      </div>
    </group-box-container>
  </div>
</template>
