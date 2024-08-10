<script setup lang="ts" name="collapse-container">
import {onMounted, PropType, ref} from "vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: String},
  formInfo: {type: Object as PropType<any>},
  formData: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);
const getComponentName = (data: any) => {
  return (data.itemType == "tab" || data.itemType == "card"
      || data.itemType == "box" || data.itemType == "table") ? data.itemType + '-container' : data.itemType + '-item'
};
/**
 * 如果没有items，动态添加
 * @param adata
 */
const checkItem = (adata: any) => {
  if (!adata['items']) {
    adata['items'] = [];
  }
}
const onDragAdd = (evt: Event, dataList: any) => {
  console.log(evt, dataList);
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != 'undefined') {
    let dataInfo = dataList[newIndex];
    // designForm.setDraggingItem({});
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};
const activeTabName = ref();
onMounted(() => {
  if (!props.field['preps']["elements"]) {
    props.field['preps']["elements"] = [{
      label: "Collapse",
      tabName: "collapse",
      objectName: "collapse",
      subFormFlag: "Y",
      items: []
    }];
    props.field['stretch'] = "N";
  }
  activeTabName.value = 0;// props.field?["tabList"][0]["name"] || 0;
});
</script>
<template>
  <group-box-container class="dynamic-tab-wapper" :parentField="parentField" :form-item="field">
    <el-collapse v-model="activeTabName"
                 class="collapse-container"
                 :accordion="field.preps['accordion']=='Y'"
    >
      <el-collapse-item v-for="adata in field['preps']['elements']" :title="adata.title||adata.tabName"
                        :name="adata.tabName">
        <el-scrollbar height="100%">
          <draggable
              @add="(evt:Event)=>onDragAdd(evt,adata['items'])"
              @dragover="checkItem(adata)"
              class="card-design"
              group="starHorseGroup"
              animation="100"
              ghostClass="ghost"
              :list="adata['items']"
          >
            <template #item="{element:data}">
              <div class="comp-item">
                <component
                    :key="data.id"
                    :field="data"
                    :formInfo="formInfo"
                    :is="getComponentName(data)"
                    :parentField="field"
                    :formData="formData"
                    v-if="data?.compType==='formItem'||data?.itemType=='box'||data?.itemType=='table'"/>
              </div>
            </template>
          </draggable>
        </el-scrollbar>
      </el-collapse-item>
    </el-collapse>
  </group-box-container>
</template>
<style lang="scss" scoped>
.dynamic-tab-wapper {
  height: 100%;
}

:deep(.el-card) {
  margin-top: 10px;
}

:deep(.el-card__body) {
  margin-top: 5px;
}

.card-design {
  height: 100%;
  overflow-y: auto;
}
</style>
