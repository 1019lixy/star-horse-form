<script setup lang="ts" name="tab-container">
import {inject, onMounted, PropType, ref, Ref} from "vue";

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

  return data.itemType == "tab" ? data.itemType + '-container' : data.itemType + '-item'
};
const onDragAdd = (evt: Event, dataList: any) => {
  let newIndex = evt.newIndex;
};
const activeTabName = ref();
const selectItem = (data: any, parentCompType: String) => {
  emits("selectItem", data, parentCompType);
}
onMounted(() => {
  if (!props.field['preps']["elements"]) {
    props.field['preps']["elements"] = [{
      label: "Tab1",
      name: 0,
      items: []
    }, {
      label: "Tab2",
      name: 1,
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

<style lang="scss" scoped>
.dynamic-tab-wapper {
  height: 100%;

  .el-tabs {
    height: 90%;

    :deep(.el-tabs__content) {
      height: 100%;

      .el-tab-pane {
        height: 100%;
      }
    }
  }
}

.tab-design {
  height: 100%;
}
</style>
<template>
  <group-box-container class="dynamic-tab-wapper" :formDatas="formDatas" :form-item="field.preps"
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
      <el-tab-pane v-for="(adata,index) in field['preps']['elements']"
                   :label="adata['label']"
                   :name="adata['name']||index"
      >
        <draggable
            @add="(evt:Event)=>onDragAdd(evt,adata['items'])"
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
                :formDatas="formDatas"
                :is="getComponentName(data)"
                :parentField="field"
                :formFieldList="formFieldList"
                v-if="data.compType==='formItem'||data.itemType=='box'"
            />
          </template>
        </draggable>
      </el-tab-pane>
    </el-tabs>
  </group-box-container>
</template>
