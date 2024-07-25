<script setup lang="ts" name="box-container">
import {computed, PropType, ref} from 'vue'
import {warning} from '@/utils/message'
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
const props = defineProps({
  parentField: {type: String},
  formData: {type: Object as PropType<any>},
  parentComp: {type: Object as PropType<any>},
  adata: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
let itemType = ref('container');
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
      || draggingItem.value.itemType == "table") {
    warning('栅格容器不允许嵌套其他容器');
    let columns = props.adata?.columns;
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
const dragUpdate = (evt) => {
  console.log(evt);
}
</script>
<template>
  <el-col
      class="edit_col"
      :span="sdata.colspan||24"
      v-for="(sdata,index) in adata.columns"
      v-if="isEdit"
  >
    <draggable
        @add="(evt:Event)=>onDragAdd(evt,sdata.items)"
        @dragover="checkItem(sdata)"
        class="smain-design"
        :move="checkMove"
        v-bind="{group:'starHorseGroup', ghostClass: 'ghost',animation: 300}"
        animation="100"
        item-key="id"
        @update="dragUpdate"
        v-model="sdata.items"
    >
      <template v-if="sdata.items&&sdata.items.length>0">
        <template v-for="data in sdata.items">
          <template v-if="data?.compType==='formItem'">
            <component
                :key="data.id"
                :field="data"
                :is="getComponentName(data)"
                :parentField="parentComp"
                :formData="formData"
            />
          </template>
        </template>
      </template>
    </draggable>
  </el-col>
  <el-col
      :item-key="index"
      :span="sdata.colspan||24"
      style="border: none"
      v-else
      v-for="(sdata,index) in adata.columns"
  >
    <template v-for="data in sdata.items">
      <component
          :field="data"
          :is="data?.type+'-container'"
          :formData="formData"
          v-if="data?.compType==='container'"
      >
      </component>
      <component
          :field="data"
          :is="getComponentName(data)"
          :formData="formData"
          v-else-if="data?.compType==='formItem'"
      />
    </template>
  </el-col>
</template>
<style lang="scss" scoped>
.smain-design {
  width: 100%;
  background: var(--star-horse-white);;
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
