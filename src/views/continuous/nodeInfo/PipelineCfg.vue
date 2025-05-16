<script setup lang="ts" name="PipelineCfg">
import {onMounted, reactive, ref} from "vue";
import {loadDict, PageFieldInfo, SelectOption} from "star-horse-lowcode";

let repoList = ref<SelectOption[]>([]);
let execTypeList = ref<SelectOption[]>([]);
const pipelineCfgRef = ref();
//页面属性
const fieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      cardList: [
        {
          title: "基础信息",
          tabName: "baseInfo",
          fieldList: [
            [
              {
                label: "流水线名称",
                fieldName: "lineName",
                type: "input",
                defaultValue: "测试",
                required: true,
                formVisible: true,
                listVisible: true
              },
              {
                label: "代码分支",
                fieldName: "codeBranch",
                type: "input",
                defaultValue: "1",
                required: true,
                formVisible: true,
                listVisible: true
              }
            ],
            [
              {
                label: "流水线类型",
                fieldName: "lineType",
                type: "select",
                optionList: execTypeList,
                required: true,
                defaultValue: "single",
                formVisible: true,
                listVisible: true
              },
              {
                label: "Cron定时触发",
                fieldName: "cron",
                type: "cron",
                helpMsg: "不设置则表示手动触发",
                required: false,
                formVisible: true,
                listVisible: true
              }
            ]
          ]
        },
        {
          title: "代码源",
          tableName: "dataSource",
          fieldList: [
            [
              {
                label: "代码源类型",
                fieldName: "vcsType",
                type: "select",
                optionList: repoList,
                required: true,
                defaultValue: "git",
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 6
                }
              },
              {
                label: "URL",
                fieldName: "vcsUrl",
                type: "input",
                defaultValue: "git://123.com",
                required: true,
                formVisible: true,
                listVisible: true,
                preps: {
                  rules: ["url"],
                  colspan: 12
                }
              },
              {
                label: "自动触发",
                fieldName: "autoExecution",
                type: "switch",
                defaultValue: "N",
                required: false,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 6
                }
              }
            ],
            [
              {
                label: "版本号",
                fieldName: "dataVersion",
                type: "input",
                required: false,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 8
                }
              },
              {
                label: "代码下载目标目录",
                fieldName: "targetDir",
                type: "input",
                required: false,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 16
                }
              }
            ]
          ]
        }
      ]
    }
  ]
});
const getFormData = () => {
  return pipelineCfgRef.value?.getFormData() || {};
};
const setFormData = (data: any) => {
  pipelineCfgRef.value?.setFormData(data);
};
const init = async () => {
  repoList.value = await loadDict("REPO_TYPE");
  execTypeList.value = await loadDict("PIPELINE_EXECUTION_TYPE");
};
const valid = async () => {
  return await pipelineCfgRef.value?.$refs.starHorseFormRef.validate();
};
onMounted(() => {
  init();
});
defineExpose({
  getFormData,
  setFormData,
  valid
});
</script>

<template>
  <star-horse-form ref="pipelineCfgRef" formSize="default" :fieldList="fieldList"/>
</template>

<style scoped lang="scss">

</style>
