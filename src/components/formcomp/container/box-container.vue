<script setup lang="ts" name="box-container">
import {computed, PropType, ref} from 'vue'
import {warning} from '@/utils/message'
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentCompType: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
// const emits = defineEmits(["selectItem"]);
let draggingItem = computed(() => designForm.draggingItem);
// let containerList = ref([]);
let itemType = ref('container');
let isEdit = computed(() => designForm.isEdit);
const getComponentName = (data: any) => {
  return data?.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex;
  if (draggingItem.value.itemType == 'box' || draggingItem.value.itemType == "tab" || draggingItem.value.itemType == "table") {
    warning('栅格容器不允许嵌套其他容器');
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
    designForm.setCurrentItemId(dataList[newIndex].id);
    designForm.setCurrentItemType(dataList[newIndex].compType);
    designForm.setParentCompType(itemType.value);
  }
};
</script>


<template>
  <group-box-container :form-item="field">
    <!--    {{ field.preps.elements }}-->
    <el-row v-for="adata in field.preps.elements" :gutter="field.preps.gutter"
            :justify="field.preps.justify"
            :align="field.preps.align" :tag="field.preps.tag">
      <el-col
          class="edit_col"
          :item-key="index"
          :span="sdata.colspan||24"
          v-for="(sdata,index) in adata.columns"
          v-if="isEdit"
      >
        <draggable
            @add="(evt:Event)=>onDragAdd(evt,sdata.items)"
            class="smain-design"
            group="starHorseGroup"
            animation="100"
            ghostClass="ghost"
            v-model="sdata.items"
        >
          <template v-for="data in sdata.items">
            <component
                :key="data?.id"
                :field="data"
                :is="getComponentName(data)"
                :parentField="field"
                :formFieldList="formFieldList"
                v-if="data?.compType==='formItem'"
            />
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
              :formFieldList="formFieldList"
              v-if="data?.compType==='container'"
          >
          </component>
          <component
              :field="data"
              :is="getComponentName(data)"
              :formFieldList="formFieldList"
              v-else-if="data?.compType==='formItem'"
          />
        </template>
      </el-col>
    </el-row>
  </group-box-container>
</template>
<style lang="scss" scoped>
.smain-design {
  width: 100%;
  background: var(--star-horse-white);;
  border-radius: 3px;
  min-height: 50px;
  /* display: flex;*/
}

.edit_col {
  border: 2px dotted var(--star-horse-border—color);
  min-height: 50px;
}
</style>