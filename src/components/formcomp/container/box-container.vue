<script setup lang="ts" name="box-container">
import {ComponentInternalInstance, computed, getCurrentInstance, PropType, ref, watch} from 'vue'
import {warning} from '@/utils/message'
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
const update = getCurrentInstance() as ComponentInternalInstance | null;
let designForm = DesignForm(piniaInstance);
let draggingItem = computed(() => designForm.draggingItem);
let itemType = ref('container');
let isEdit = computed(() => designForm.isEdit);
let boxCompList = computed(() => props.field);
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
const checkMove = () => {
  return true
}
const dragUpdate = (evt) => {
  console.log(evt);
}
watch(() => props.field,
    () => {
      update!.proxy!.$forceUpdate();
      console.log("forceupdate")
    }, {
      immediate: false,
      deep: true
    })
</script>


<template>
  <group-box-container
      :parentField="parentField"
      :form-item="boxCompList">
    <el-row v-for="adata in boxCompList.preps?.elements"
            :gutter="boxCompList.preps?.gutter"
            :justify="boxCompList.preps?.justify"
            :align="boxCompList.preps?.align"
            :tag="boxCompList.preps?.tag">
      <el-col
          class="edit_col"
          :item-key="index"
          :span="sdata.colspan||24"
          v-for="(sdata,index) in adata.columns"
          v-if="isEdit"
      >
        <draggable
            @add="(evt:Event)=>onDragAdd(evt,sdata.items)"
            @dragover="checkItem(sdata)"
            class="smain-design"
            tag="div"
            group="starHorseGroup"
            ghostClass="ghost"
            animation="200"
            :list="sdata.items"
        >
          <template #item="{element:data}">
            <component
                :key="data.id"
                :field="data"
                :is="getComponentName(data)"
                :parentField="boxCompList"
                :formFieldList="formFieldList"
                v-if="data?.compType=='formItem'"
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
      <!--      <box-col :adata="adata" :parentComp="boxCompList" :formFieldList="formFieldList"/>-->
    </el-row>
  </group-box-container>
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

  .ghost {
    content: '';
    font-size: 0;
    height: 3px;
    box-sizing: border-box;
    outline-width: 0;
    padding: 0;
    overflow: hidden;
  }
}

.edit_col {
  border: 2px dotted var(--star-horse-border—color);
  min-height: 50px;
}
</style>
