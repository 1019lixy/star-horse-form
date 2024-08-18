<script setup lang="ts" name="box-container">
import {computed, PropType} from 'vue'
import {warning} from '@/utils/message'
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: String},
  formInfo: {type: Object as PropType<any>},
  formData: {type: Object as PropType<any>},
  parentComp: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
// let itemType = ref('container');
let isEdit = computed(() => designForm.isEdit);
const getComponentName = (data: any) => {
  return data?.itemType + '-item'
};
const checkItem = (items: any) => {
  if (!items['items']) {
    items['items'] = [];
  }
}
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex;
  if (draggingItem.value.itemType == 'box'
      || draggingItem.value.itemType == "tab"
      ||draggingItem.value.itemType=="collapse"
      ||draggingItem.value.itemType=="card"
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
const checkMove = () => {
  return true
}
const dragUpdate = (evt: Event) => {
  console.log(evt);
}
</script>
<template>
  <td class="edit_col">
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
}

.edit_col {
  border: 2px dotted var(--star-horse-border—color);
  min-height: 50px;
}
</style>
