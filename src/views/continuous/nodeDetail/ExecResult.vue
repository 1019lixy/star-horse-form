<script setup lang="ts" name="ExecResult">
import {PropType, reactive, ref, watch} from "vue";
import {PageFieldInfo} from "star-horse-lowcode";
import {loadFormFields} from "@/views/continuous/utils/PipelinetCfg.js";

const props = defineProps({
  //实例信息
  instanceInfo: {
    type: Object as PropType<any>,
    default: () => {
    },
  },
  //节点配置信息
  nodeItem: {
    type: Object as PropType<any>,
    default: "",
  },
});
const tabCurrent = ref<string>("second");
const cfgFieldList = reactive<PageFieldInfo>({});
const resultFieldList = reactive<PageFieldInfo>({});
const cfgDataForm = ref<any>({});
const resultDataForm = ref<any>({});
const loadFormInfo = async () => {
  tabCurrent.value = "second";
  if (props.nodeItem.resultFormNo) {
    tabCurrent.value = "first";
    loadFormFields(props.nodeItem.resultFormNo).then(res => {
      let data = res.data;
      resultFieldList.fieldList = data["tableFieldList"]?.fieldList || [];
    });
  }
  loadFormFields(props.nodeItem.dynamicFormNo).then(res => {
    let data = res.data;
    cfgFieldList.fieldList = data["tableFieldList"]?.fieldList || [];
    if (props.nodeItem.advancedDynamicFormNo) {
      loadFormFields(props.nodeItem.advancedDynamicFormNo).then(tempFormList => {
        cfgFieldList.fieldList.push({
          fieldName: "advancedSetting",
          collapseFlag: "advancedSetting",
          collapseList: [{
            title: "扩展设置",
            tabName: "advancedSetting",
            subFormFlag: "Y",
            objectName: "advancedSetting",
            fieldList: tempFormList.data["tableFieldList"]?.fieldList || [],
          }]
        });
      });
    }
  });


};
const dataFormat = (name: string, cellValue: any, _row: any) => {
  return cellValue;
};
watch(() => props.nodeItem, (newVal) => {
  if (newVal) {
    loadFormInfo();
  }
}, {immediate: true});
</script>

<template>
  <el-card>
    <el-tabs type="card" v-model="tabCurrent">
      <el-tab-pane label="输出结果" name="first" v-if="nodeItem.resultFormNo">
        <el-scrollbar>
          <star-horse-data-view-items
              :commonFormat="dataFormat"
              :field-list="resultFieldList"
              v-model:data-form="resultDataForm"
          />
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="实时日志" name="second">
        <data-log/>
      </el-tab-pane>
      <el-tab-pane label="作业配置" name="third">
        <el-scrollbar>
          <star-horse-data-view-items
              :commonFormat="dataFormat"
              :field-list="cfgFieldList"
              v-model:data-form="cfgDataForm"
          />

        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-space {
  width: 100%;
}

.el-card__header {
  padding: 5px;
}
</style>
