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

  if (dragingItem.itemType == 'box' || dragingItem.itemType == 'table') {
    warning('容器不能嵌套容器')
    return
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

<style scoped>
.smain-design {
  width: inherit;
  background: var(--star-horse-white);;
  border-radius: 3px;
  min-height: 50px;
  display: block;
}

:deep(.el-col) {
  border: 1px dotted gold;
  min-height: 50px;
}
</style>
<template>
  <group-box-container
      :formDatas="formDatas"
      :form-item="field"
      @selectItem="selectItem"
  >
    <!-- {{ field.preps.elements }} -->
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