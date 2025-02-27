<script setup lang="ts">

import {reactive, ref} from 'vue';
import {FieldInfo} from '@/components/types/PageFieldInfo';
import {SelectOption} from '@/components/types/SearchProps';

const props = defineProps({});
const flowPropertyPanel = ref();
const relationFormList = ref<SelectOption[]>([]);
const taskParamsList = ref<SelectOption[]>([]);
const taskNoticeList = ref<SelectOption[]>([]);
const auditorEmptyPolicyList = ref<SelectOption[]>([
  {name: '自动通过', value: 'autoPass'},
  {name: '自动拒绝', value: 'autoReject'},
  {name: '指定经办人', value: 'assignee'},
]);
const returnPolicyList = ref<SelectOption[]>([
  {name: '重新审批', value: 'reAudit'},
  {name: '从当前节点审批', value: 'currentNodeAudit'},
]);
const basicFieldList = ref<FieldInfo[]>([
  {
    label: '任务Id',
    fieldName: 'taskId',
    required: true,
    type: 'input',
    disabled: 'Y',
    formVisible: true,
  },
  {
    label: '任务名称',
    fieldName: 'taskName',
    required: true,
    type: 'input',
    formVisible: true,
  },
  {
    label: '关联表单',
    fieldName: 'relationFormId',
    required: true,
    type: 'select',
    optionList: relationFormList,
    formVisible: true,
  },
  {
    label: '允许编辑',
    fieldName: 'allowEdit',
    type: 'switch',
    defaultValue: 'N',
    formVisible: true,
  },
  {
    label: '任务变量',
    fieldName: 'taskParams',
    type: 'select',
    optionList: taskParamsList,
    formVisible: true,
  },
  {
    label: '是否会签',
    fieldName: 'signFlag',
    type: 'switch',
    defaultValue: 'N',
    formVisible: true,
  },
  {
    label: '任务通知',
    fieldName: 'taskNotice',
    type: 'select',
    optionList: taskNoticeList,
    formVisible: true,
  },
  {
    label: '超时设置',
    fieldName: 'timeOutSetting',
    type: 'input',
    formVisible: true,
  },
  {
    label: '经办人为空策略',
    fieldName: 'auditorEmptyPolicy',
    type: 'radio',
    optionList: auditorEmptyPolicyList,
    formVisible: true,
  },
  {
    label: '退回策略',
    fieldName: 'returnPolicy',
    type: 'radio',
    optionList: returnPolicyList,
    formVisible: true,
  },
]);
const btnTypeList = ref<SelectOption[]>([
  {name: '同意', value: 'a'},
  {name: '拒绝', value: 'b'},
  {name: '驳回', value: 'c'},
  {name: '驳回到起点', value: 'd'},
  {name: '驳回到历史任务', value: 'e'},
  {name: '撤销', value: 'f'},
  {name: '转办', value: 'g'},
  {name: '加签', value: 'h'},
  {name: '减签', value: 'i'},
  {name: '保存', value: 'j'},
  {name: '中止', value: 'k'},
  {name: '会签', value: 'l'},
  {name: '同意（会签）', value: 'm'},
  {name: '拒绝（会签）', value: 'n'},
  {name: '弃权（会签）', value: 'o'},
  {name: '指定审批人', value: 'p'},
  {name: '指定跳转', value: 'q'},
]);
const btnActionList = ref<SelectOption[]>([
  {name: '无操作', value: 'a1'},
  {name: '同意', value: 'b1'},
  {name: '拒绝', value: 'c1'},
  {name: '驳回', value: 'd1'},
  {name: '会签同意', value: 'e1'},
  {name: '会签拒绝', value: 'f1'},
]);
const autoAgreeList = ref<SelectOption[]>([
  {name: '经办人为发起人', value: '1'},
  {name: '经办人为上一节点经办人', value: '2'},
  {name: '经办人为经办人审批过', value: '3'},
]);
const buttonFieldList = ref<FieldInfo[]>([
  {
    fieldName: 'buttonList',
    batchFieldList: [{
      batchName: 'butonList',
      title: '按钮',
      staticData: 'Y',
      fieldList: [{
        label: '按钮名称',
        fieldName: 'btnName',
        type: 'input',
        formVisible: true,
      },
        {
          label: '按钮类型',
          fieldName: 'btnType',
          type: 'select',
          optionList: btnTypeList,
          formVisible: true,
        },
        {
          label: '按钮行为',
          fieldName: 'btnAction',
          type: 'select',
          optionList: btnActionList,
          formVisible: true,
        },
      ]
    }]
  }, {
    label: '自动同意',
    fieldName: 'autoAgree',
    type: 'select',
    optionList: autoAgreeList,
    formVisible: true,
  }

]);
const assigneeTypeList = ref<SelectOption[]>([
  {name: '审批人', value: 'assignee'},
  {name: '审批组', value: 'assigneeGroup'},
  {name: '角色', value: 'role'},
  {name: '部门', value: 'dept'},
  {name: '岗位', value: 'job'},
  {name: '发起人直接领导', value: 'directLeader'},
  {name: '发起人上级部门领导', value: 'parentDeptLeader'},
]);
const auditorFieldList = ref<FieldInfo[]>([
  {
    label: '经办人候选类型',
    fieldName: 'assigneeType',
    type: 'radio',
    optionList: assigneeTypeList,
    formVisible: true,
  },
  {
    label: '添加经办人',
    fieldName: 'assignees',
    type: 'dialog-input',
    params: {
      dataUrl: {
        loadByPageUrl: ''
      },
      needField: [],
      fieldList: []
    },
    formVisible: true,
  },
  {
    label: '添加抄送人',
    fieldName: 'ccs',
    type: 'dialog-input',
    params: {
      dataUrl: {
        loadByPageUrl: ''
      },
      needField: [],
      fieldList: []
    },
    formVisible: true,
  }
]);
const eventTypeList = ref<SelectOption[]>([
  {name: '开始', value: 'start'},
  {name: '结束', value: 'end'},
]);
const columnTypeList = ref<SelectOption[]>([
  {name: '值', value: 'value'},
  {name: '表达式', value: 'exp'},
]);
const scriptTypeList = ref<SelectOption[]>([
  {name: '内联脚本', value: 'innerScript'},
  {name: '外部脚本', value: 'outerScript'},
]);
const listenerTypeList = ref<SelectOption[]>([
  {name: 'Java类', value: 'class'},
  {name: '表达式', value: 'exp'},
  {name: '代理表达式', value: 'proxyExp'},
  {name: '脚本', value: 'script'},
]);
const eventTypeList1 = ref<SelectOption[]>([
  {name: '创建', value: 'create'},
  {name: '指派', value: 'assign'},
  {name: '完成', value: 'finish'},
  {name: '删除', value: 'delete'},
]);
let labelName = ref<string>('');
let formVisible = ref<boolean>(false);
let scriptTypeformVisible = ref<boolean>(false);
const otherFieldList = ref<FieldInfo[]>([
  {
    fieldName: 'execListener',
    displayStyle: 'list',
    batchFieldList: [{
      batchName: 'execListener',
      title: '执行监听器',
      staticData: 'Y',
      fieldList: [
        {
          label: '事件类型',
          fieldName: 'eventType',
          type: 'select',
          required: true,
          optionList: eventTypeList,
          formVisible: true,
        },
        {
          label: '监听器类型',
          fieldName: 'listenerType',
          type: 'select',
          required: true,
          optionList: listenerTypeList,
          actionName: 'change',
          actions: (val) => {
            let value = val['listenerType'];
            if (!value) {
              return;
            }
            labelName.value = listenerTypeList.value.find(item => item.value == value)?.name;
            formVisible.value = true;
            scriptTypeformVisible.value = false;
            if (value == 'script') {
              scriptTypeformVisible.value = true;
            }
          },
          formVisible: true,
        },
        {
          label: labelName,
          fieldName: 'dataValue',
          type: 'input',
          required: true,
          formVisible: formVisible,
          preps: {
            placeholder: '请输入'
          }
        },
        {
          label: '脚本类型',
          fieldName: 'scriptType',
          type: 'select',
          required: true,
          optionList: scriptTypeList,
          formVisible: scriptTypeformVisible,
        },
        {
          batchFieldList: [{
            title: '注入字段',
            batchName: 'injectColumns',
            fieldList: [
              {
                label: '字段名称',
                fieldName: 'name',
                type: 'input',
                formVisible: true,
              },
              {
                label: '字段类型',
                fieldName: 'columnType',
                type: 'select',
                optionList: columnTypeList,
                formVisible: true,
              },
              {
                label: '值/表达式',
                fieldName: 'columnValue',
                type: 'input',
                formVisible: true,
              }
            ]
          }]
        }
      ]
    }, {
      batchName: 'taskListener',
      title: '任务监听器',
      staticData: 'Y',
      fieldList: [
        {
          label: '事件类型',
          fieldName: 'eventType',
          type: 'select',
          optionList: eventTypeList1,
          formVisible: true,
        },
        {
          label: '监听器Id',
          fieldName: 'listenerId',
          type: 'input',
          formVisible: true,
        },
        {
          label: '监听器类型',
          fieldName: 'listenerType',
          type: 'select',
          required: true,
          optionList: listenerTypeList,
          actionName: 'change',
          actions: (val) => {
            let value = val['listenerType'];
            if (!value) {
              return;
            }
            labelName.value = listenerTypeList.value.find(item => item.value == value)?.name;
            formVisible.value = true;
            scriptTypeformVisible.value = false;
            if (value == 'script') {
              scriptTypeformVisible.value = true;
            }
          },
          formVisible: true,
        },
        {
          label: labelName,
          fieldName: 'dataValue',
          type: 'input',
          required: true,
          formVisible: formVisible,
          preps: {
            placeholder: '请输入'
          }
        },
        {
          label: '脚本类型',
          fieldName: 'scriptType',
          type: 'select',
          required: true,
          optionList: scriptTypeList,
          formVisible: scriptTypeformVisible,
        },
        {
          batchFieldList: [{
            title: '注入字段',
            batchName: 'injectColumns',
            fieldList: [
              {
                label: '字段名称',
                fieldName: 'name',
                type: 'input',
                formVisible: true,
              },
              {
                label: '字段类型',
                fieldName: 'columnType',
                type: 'select',
                optionList: columnTypeList,
                formVisible: true,
              },
              {
                label: '值/表达式',
                fieldName: 'columnValue',
                type: 'input',
                formVisible: true,
              }
            ]
          }]
        }
      ]
    }, {
      batchName: 'extendProperties',
      title: '扩展属性',
      staticData: 'Y',
      fieldList: [
        {
          label: '属性名',
          fieldName: 'propName',
          type: 'input',
          formVisible: true,
        },
        {
          label: '属性值',
          fieldName: 'propValue',
          type: 'input',
          formVisible: true,
        }
      ]
    }]
  }
]);
const tableFieldList = reactive({
  fieldList: [
    {
      fieldName: 'basic',
      tabList: [{
        title: '基础信息',
        tabName: 'basic',
        fieldList: basicFieldList
      }, {
        title: '按钮设置',
        tabName: 'button',
        fieldList: buttonFieldList
      }, {
        title: '事务处理人',
        tabName: 'auditor',
        fieldList: auditorFieldList
      }, {
        title: '其他配置',
        tabName: 'other',
        fieldList: otherFieldList
      }]
    }
  ],

});
</script>
<template>
  <star-horse-form :fieldList="tableFieldList" ref="flowPropertyPanel"/>
</template>
<style lang="scss" scoped>

</style>
