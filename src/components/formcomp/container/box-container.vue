<script setup lang="ts" name="box-container">
import {inject, PropType, Ref, ref} from 'vue'
import {warning} from '@/utils/message'

const props = defineProps({
  parentCompType: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
  formDatas: {type: Object as PropType<any>}
});
const emits = defineEmits(["selectItem"]);
let dragingItem = inject('dragingItem') as Ref;
let containerList = ref([]);
let itemType = ref('container');

const getComponentName = (data: any) => {
  return data?.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex

  if (dragingItem.value.itemType == 'box' || dragingItem.value.itemType == "tab" || dragingItem.value.itemType == "table") {
    warning('栅格容器不允许嵌套其他容器');
    let elements = props.field.preps.elements;
    for (let inde in elements) {
      let element = elements[inde];
      for (let sind in element?.columns) {
        let column = element.columns[sind];
        for (let i in column?.items) {
          let item = column.items[i];
          if (dragingItem.value.id == item.id) {
            console.log("find data", item);
            column.items.splice(i, 1);
          }
        }
      }
    }
 //   console.log(dragingItem.value, dataList, props.field.elements);
    return false;
  }

  if (newIndex != null && newIndex != 'undefined') {
    props.formDatas.activeId = dataList[newIndex].id
    props.formDatas.compType = dataList[newIndex].compType
    props.formDatas.parentCompType = itemType.value
  }
};
const selectItem = (data: any, parentCompType: String) => {
  emits("selectItem", data, parentCompType);
}
</script>


<template>
  <group-box-container
      :formDatas="formDatas"
      :form-item="field"
      @selectItem="selectItem"
  >
<!--    {{ field.preps.elements }}-->
    <el-row v-for="adata in field.preps.elements" :gutter="field.preps.gutter"
            :justify="field.preps.justify"
            :align="field.preps.align" :tag="field.preps.tag">
      <el-col
          :item-key="index"
          :span="sdata.colspan||24"
          v-for="(sdata,index) in adata.columns"
          v-if="formDatas.isEdit"
      >
        <draggable
            @add="(evt:Event)=>onDragAdd(evt,sdata.items)"
            class="smain-design"
            group="starHorseGroup"
            animation="100"
            ghostClass="ghost"
            v-model="sdata.items"
        >
          <template v-for="(data,index) in sdata.items">
            <component
                :key="data?.id"
                :field="data"
                :formDatas="formDatas"
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
              :formDatas="formDatas"
              :is="data?.type+'-container'"
              :formFieldList="formFieldList"
              @selectItem="selectItem"
              v-if="data?.compType==='container'"
          >
          </component>
          <component
              :field="data"
              :formDatas="formDatas"
              :is="getComponentName(data)"
              :formFieldList="formFieldList"
              @selectItem="selectItem"
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

.el-col {
  border: 2px dotted var(--star-horse-border—color);
  min-height: 50px;
}
</style>