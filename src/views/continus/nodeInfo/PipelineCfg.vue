<script setup lang="ts" name="PipelineCfg">
import {onMounted, reactive, ref, watch} from 'vue';
import {SelectOption} from '@/components/types/SearchProps';
import {loadData} from '@/api/sh_api.ts';
import {PageFieldInfo} from '@/components/types/PageFieldInfo';
import piniaInstance from '@/store';
import {continusConfig} from '@/store/ContinusConfigStore.ts';

const continusStore = continusConfig(piniaInstance);
let repoList = ref<SelectOption[]>([]);
let execTypeList = ref<SelectOption[]>([]);
const pipelineCfgRef = ref();
//页面属性
const fieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      cardList: [
        {
          title: '基础信息',
          tabName: 'baseInfo',
          fieldList: [[{
            label: '流水线名称',
            fieldName: 'lineName',
            type: 'input',
            required: true,
            formVisible: true,
            listVisible: true,
          }, {
            label: '代码分支',
            fieldName: 'codeBranch',
            type: 'input',
            required: true,
            formVisible: true,
            listVisible: true,
          }], [{
            label: '流水线类型',
            fieldName: 'lineType',
            type: 'select',
            optionList: execTypeList,
            required: true,
            formVisible: true,
            listVisible: true,
          }, {
            label: 'Cron定时触发',
            fieldName: 'cron',
            type: 'cron',
            helpMsg: '不设置则表示手动触发',
            required: false,
            formVisible: true,
            listVisible: true,
          }]]
        }, {
          title: '代码源',
          tableName: 'dataSource',
          fieldList: [[{
            label: '代码源类型',
            fieldName: 'vcsType',
            type: 'select',
            optionList: repoList,
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 6,
            }
          }, {
            label: 'URL',
            fieldName: 'vcsUrl',
            type: 'input',
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 12,
            }
          }, {
            label: '自动触发',
            fieldName: 'autoExecution',
            type: 'switch',
            defaultValue: 'N',
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 6,
            }
          }], [{
            label: '版本号',
            fieldName: 'dataVersion',
            type: 'input',
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 8,
            }
          }, {
            label: '代码下载目标目录',
            fieldName: 'targetDir',
            type: 'input',
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 16,
            }
          }]]
        }
      ],
    },
  ],
});
const getFormData = () => {
  return pipelineCfgRef.value?.getFormData()||{};
};
const setFormData = (data: any) => {
  pipelineCfgRef.value?.setFormData(data);
};
const init = async () => {
  let redata = await loadData('/devops-continus/continus/baseInfo/repoTypes', {});
  repoList.value = redata?.data;
  execTypeList.value.push({name: '独占模式', value: 'single'});
  execTypeList.value.push({name: '并行模式', value: 'multiple'});
};
onMounted(() => {
  init();
});
watch(() => getFormData(), (newVal) => {
  //将数据存入store
  continusStore.addNodeInfo('pipelineCfg', newVal);
}, {deep: true});
defineExpose({
  getFormData,
  setFormData,
});
</script>

<template>
  <star-horse-form ref="pipelineCfgRef" formSize="default" :fieldList="fieldList"/>
</template>

<style scoped lang="scss">

</style>
