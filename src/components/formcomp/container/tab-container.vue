<script setup lang="ts" name="tab-container">
import {computed, inject, onMounted, PropType, ref, Ref} from "vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const props = defineProps({
  parentField: {type: String},
  formFieldList: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = DesignForm(piniaInstance);

// let draggingItem = computed(() => designForm.draggingItem);
// let containerList = ref([]);
// let itemType = ref('container');
const getComponentName = (data: any) => {
  return (data.itemType == "tab" || data.itemType == "box" || data.itemType == "table") ? data.itemType + '-container' : data.itemType + '-item'
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
      label: "Tab1",
      tabName: "tab1",
      objectName: "tab1",
      subFormFlag: "yes",
      items: []
    }, {
      label: "Tab2",
      tabName: "tab2",
      objectName: "tab2",
      subFormFlag: "yes",
      items: []
    }];
    props.field['stretch'] = "no";
  }
  activeTabName.value = 0;// props.field?["tabList"][0]["name"] || 0;
});
const dynamicFunc = (funcType: string, funcCode: any) => {
  let func = new Function(funcCode);
  func.call(this);
};
const addTab = () => {

}
</script>


<template>
  <group-box-container class="dynamic-tab-wapper"
                       :parentField="parentField"
                       :form-item="field"
  >
    <el-tabs
        :tab-position="field.preps['tablePosition']"
        :type="field.preps['type']"
        :closable="field.preps['closable']=='yes'"
        :addable="field.preps['addable']=='yes'"
        :editable="field.preps['editable']=='yes'"
        :stretch="field.preps['stretch']=='yes'"
        v-model="activeTabName"
        @tab-add="addTab()"
        @tab-click="dynamicFunc('tabClick',field['tabClick'])"
        @tab-change="dynamicFunc('tabChange',field['tabChange'])"
        @tab-remove="dynamicFunc('tabRemove',field['tabRemove'])"
    >
      <!--      {{ field['preps']['elements'] }}-->
      <el-tab-pane v-for="(adata,index) in field['preps']['elements']"
                   :label="adata['label']"
                   :name="adata['name']||index"
      >
        <el-scrollbar>

          <draggable
              @add="(evt:Event)=>onDragAdd(evt,adata['items'])"
              @dragover="checkItem(adata)"
              class="tab-design"
              group="starHorseGroup"
              animation="100"
              ghostClass="ghost"
              v-model="adata['items']"
          >
            <template v-for="(data,index) in adata['items']">
              <component
                  :key="data.id"
                  :field="data"
                  :is="getComponentName(data)"
                  :parentField="field"
                  :formFieldList="formFieldList"
                  v-if="data?.compType==='formItem'||data?.itemType=='box'||data?.itemType=='table'"/>
            </template>
          </draggable>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </group-box-container>
</template>
<style lang="scss" scoped>
.dynamic-tab-wapper {
  height: 100%;

  .el-tabs {
    height: 100%;
    width: 100%;

    :deep(.el-tabs__content) {
      height: 100%;

      .el-tab-pane {
        height: 100%;
      }
    }
  }
}

.tab-design {
  height: inherit;
  overflow-y: auto;
}
</style>
