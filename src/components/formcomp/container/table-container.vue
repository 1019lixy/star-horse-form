<script setup lang="ts" name="table-container">
// 右键菜单组件
import {computed, PropType, ref} from "vue";
import {warning} from "@/utils/message";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

let containerTableRef = ref(); // 强制刷新表格
const props = defineProps({
  parentField: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
let itemType = ref('container');
let isEdit = computed(() => designForm.isEdit);
const getComponentName = (data: any) => {
  return data?.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex
  if (draggingItem.value.itemType == 'box'
      || draggingItem.value.itemType == 'tab'
      || draggingItem.value.itemType == 'table') {
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
    return false;
  }
  if (newIndex != null && newIndex != 'undefined') {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};
const analysisData = (index: number) => {
  let field = props.field?.preps;
  let elements = field?.elements;
  let f = elements.find((item: any) => item.colIndex == index);
  if (index > 1) {
    if (!f) {
      elements.push({
        colIndex: index,
        items: []
      });
    }
  }
  return f?.items[0]?.preps?.label || `Title${index}`;
}
</script>
<template>
  <group-box-container class="dynamic-tab-wapper"
                       :parentField="parentField"
                       :form-item="field">
    <table ref="containerTableRef" class="dynamic-table">
      <thead>
      <tr>
        <th v-for="td of parseInt(field.preps.columns)">
          {{ analysisData(td) }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <template v-for="td of parseInt(field.preps.columns)">
          <td :style="{ 'height':'35px',
                        width:(100/parseInt(field.preps.columns))+'%',
                        borderTop: `1px solid  #dfe6ec`,
                        borderBottom: `1px solid #dfe6ec`,
                        borderLeft: `1px solid #dfe6ec`,
                        borderRight: `1px solid #dfe6ec`,
                      }">
            <draggable @add="(evt:Event)=>onDragAdd(evt,field.preps.elements[td-1].items)"
                       class="smain-design"
                       tag="div"
                       group="starHorseGroup"
                       ghostClass="ghost"
                       animation="200"
                       :list="field.preps.elements[td-1].items">
              <template #item="{element:data}">
                <div class="comp-item">
                  <component :key="data?.id"
                             :field="data"
                             :is="getComponentName(data)"
                             :parentField="field"
                             :formFieldList="formFieldList"
                             v-if="data?.compType==='formItem'"/>
                </div>
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

  thead {
    background: #eee;
    height: 30px;
    font-size: 14px
  }
}
</style>
