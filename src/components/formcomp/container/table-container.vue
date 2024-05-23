<script setup lang="ts" name="table-container">
// 右键菜单组件
import {computed, PropType, ref} from "vue";
import {warning} from "@/utils/message";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

let containerTableRef = ref(); // 强制刷新表格
// 对齐方式
let result = ref(0);
const emits = defineEmits(["selectItem"]);
const props = defineProps({
  parentCompType: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
let itemType = ref('container');
const getComponentName = (data: any) => {
  return data.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex
  if (draggingItem.itemType == 'box'
      || draggingItem.itemType == 'tab'
      || draggingItem.itemType == 'table') {
    warning('容器不能嵌套容器');
    let elements = props.field.preps.elements;
    for (let inde in elements) {
      let element = elements[inde];
      for (let sind in element?.columns) {
        let column = element.columns[sind];
        for (let i in column?.items) {
          let item = column.items[i];
          if (draggingItem.value.id == item.id) {
            console.log("find data", item);
            column.items.splice(i, 1);
          }
        }
      }
    }
    return;
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
</script>
<template>
  <group-box-container class="dynamic-tab-wapper" :form-item="field">
    <table ref="containerTableRef" class="dynamic-table">
      <thead>
      <tr>
        <th v-for="td in field.preps.elements[0].columns">
          {{ td.label }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="adata in field.preps.elements">
        <template v-for="td in adata.columns">
          <td :style="{ 'height':'35px',
                        width:(100/adata.columns.length)+'%',
                        borderTop: `1px solid  #dfe6ec`,
                        borderBottom: `1px solid #dfe6ec`,
                        borderLeft: `1px solid #dfe6ec`,
                        borderRight: `1px solid #dfe6ec`,
                      }">
            <draggable @add="(evt)=>onDragAdd(evt,td.items)" class="smain-design"
                       tag="div"
                       v-bind="{group:'starHorseGroup', ghostClass: 'ghost',animation: 200}"
                       v-model="td.items">
              <template v-for="data in td.items">
                <component :field="data" :is="getComponentName(data)"
                           @selectItem="selectItem" v-if="data.compType==='formItem'"/>
              </template>
            </draggable>
          </td>
        </template>
      </tr>
      </tbody>
    </table>
  </group-box-container>
</template>
<style lang="scss" scoped>
.dynamic-table {
  width: 100%;
  border: 1px dotted #8F8F8F;
  thead{
    background: #eee;
    height: 30px;
    font-size:14px
  }
}
</style>