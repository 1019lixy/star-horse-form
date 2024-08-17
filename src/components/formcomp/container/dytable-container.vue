<script setup lang="ts" name="dytable-container">
// 右键菜单组件
import {computed, PropType, ref} from "vue";
import {confirm, warning} from "@/utils/message";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import DytableCol from "@/components/formcomp/container/dytable-col.vue";

let containerTableRef = ref(); // 强制刷新表格
const props = defineProps({
  parentField: {type: String},
  formInfo: {type: Object as PropType<any>},
  formData: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
// let itemType = ref('container');
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
let currentIndex = ref<number>(-1);
const tdOver = (evt: MouseEvent, index: number) => {
  evt.preventDefault();
  evt.stopPropagation();
  if (currentIndex.value == index) {
    return;
  }
  currentIndex.value = index;
}
const tdOut = (evt: MouseEvent, _index: number) => {
  evt.preventDefault();
  evt.stopPropagation();
  currentIndex.value = 0;
}
const deleteCol = (index: number) => {
  confirm("列删除后，对应的组件也会删除，确认删除吗？").then((res: boolean) => {
    if (res) {
      let elements = props.field.preps.elements;
      elements.splice(index - 1, 1);
      for (let index in elements) {
        elements[index].colIndex = parseInt(index) + 1;
      }
      console.log(elements);
      props.field.preps.columns = props.field.preps.columns - 1;
      currentIndex.value = 0;
    }
  })
}
</script>
<template>
  <group-box-container class="dynamic-tab-wapper"
                       :parentField="parentField"
                       :form-item="field">
    <table ref="containerTableRef" class="dynamic-table">
      <tbody>
      <tr v-for="row in field.preps.elements">
        <template v-for="td in row.columns">
          <dytable-col :field="td" :formInfo="formInfo" :formData="formData"/>
        </template>
      </tr>
      </tbody>
    </table>
  </group-box-container>
</template>
<style lang="scss" scoped>
th {
  position: relative;

  .td-operator {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 9999;
  }
}

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
