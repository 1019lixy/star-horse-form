<script setup lang="ts">

import {reactive, ref} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";

const props = defineProps({});
const flowPropertyPanel = ref();
const relationFormList = ref<SelectOption[]>([]);
const taskParamsList = ref<SelectOption[]>([]);
const taskNoticeList = ref<SelectOption[]>([]);
const auditorEmptyPolicyList = ref<SelectOption[]>([
  {name: "自动通过", value: "autoPass"},
  {name: "自动拒绝", value: "autoReject"},
  {name: "指定经办人", value: "assignee"},
]);
const returnPolicyList = ref<SelectOption[]>([
  {name: "重新审批", value: "reAudit"},
  {name: "从当前节点审批", value: "currentNodeAudit"},
]);
const basicFieldList = ref<FieldInfo[]>([
  {
    label: "任务Id",
    fieldName: "taskId",
    required: true,
    type: "input",
    disabled: "Y",
    formShow: true,
  },
  {
    label: "任务名称",
    fieldName: "taskName",
    required: true,
    type: "input",
    formShow: true,
  },
  {
    label: "关联表单",
    fieldName: "relationFormId",
    required: true,
    type: "select",
    optionList: relationFormList,
    formShow: true,
  },
  {
    label: "允许编辑",
    fieldName: "allowEdit",
    type: "switch",
    defaultValue: "N",
    formShow: true,
  },
  {
    label: "任务变量",
    fieldName: "taskParams",
    type: "select",
    optionList: taskParamsList,
    formShow: true,
  },
  {
    label: "是否会签",
    fieldName: "signFlag",
    type: "switch",
    defaultValue: "N",
    formShow: true,
  },
  {
    label: "任务通知",
    fieldName: "taskNotice",
    type: "select",
    optionList: taskNoticeList,
    formShow: true,
  },
  {
    label: "超时设置",
    fieldName: "timeOutSetting",
    type: "input",
    formShow: true,
  },
  {
    label: "经办人为空策略",
    fieldName: "auditorEmptyPolicy",
    type: "radio",
    optionList: auditorEmptyPolicyList,
    formShow: true,
  },
  {
    label: "退回策略",
    fieldName: "returnPolicy",
    type: "radio",
    optionList: returnPolicyList,
    formShow: true,
  },
]);
const btnTypeList = ref<SelectOption[]>([
  {name: "同意", value: "a"},
  {name: "拒绝", value: "b"},
  {name: "驳回", value: "c"},
  {name: "驳回到起点", value: "d"},
  {name: "驳回到历史任务", value: "e"},
  {name: "撤销", value: "f"},
  {name: "转办", value: "g"},
  {name: "加签", value: "h"},
  {name: "减签", value: "i"},
  {name: "保存", value: "j"},
  {name: "中止", value: "k"},
  {name: "会签", value: "l"},
  {name: "同意（会签）", value: "m"},
  {name: "拒绝（会签）", value: "n"},
  {name: "弃权（会签）", value: "o"},
  {name: "指定审批人", value: "p"},
  {name: "指定跳转", value: "q"},
]);
const btnActionList = ref<SelectOption[]>([
  {name: "无操作", value: "a1"},
  {name: "同意", value: "b1"},
  {name: "拒绝", value: "c1"},
  {name: "驳回", value: "d1"},
  {name: "会签同意", value: "e1"},
  {name: "会签拒绝", value: "f1"},
]);
const buttonFieldList = ref<FieldInfo[]>([
  {
    fieldName: "buttonList",
    batchFieldList: [{
      batchName: "butonList",
      title: "按钮",
      fieldList: [{
        label: "按钮名称",
        fieldName: "btnName",
        type: "input",
        formShow: true,
      },
        {
          label: "按钮类型",
          fieldName: "btnType",
          type: "select",
          optionList: btnTypeList,
          formShow: true,
        },
        {
          label: "按钮行为",
          fieldName: "btnAction",
          type: "select",
          optionList: btnActionList,
          formShow: true,
        },
      ]
    }]
  }
]);
const assigneeTypeList = ref<SelectOption[]>([
  {name: "审批人", value: "assignee"},
  {name: "审批组", value: "assigneeGroup"},
  {name: "角色", value: "role"},
  {name: "部门", value: "dept"},
  {name: "岗位", value: "job"},
  {name: "发起人直接领导", value: "directLeader"},
  {name: "发起人上级部门领导", value: "parentDeptLeader"},
]);
const auditorFieldList = ref<FieldInfo[]>([
  {
    label: "经办人候选类型",
    fieldName: "assigneeType",
    type: "radio",
    optionList: assigneeTypeList,
    formShow: true,
  },
  {
    label: "添加经办人",
    fieldName: "assignees",
    type: "dialog-input",
    params: {
      dataUrl: {
        loadByPageUrl: ""
      },
      needField: [],
      fieldList: []
    },
    formShow: true,
  },
  {
    label: "添加抄送人",
    fieldName: "ccs",
    type: "dialog-input",
    params: {
      dataUrl: {
        loadByPageUrl: ""
      },
      needField: [],
      fieldList: []
    },
    formShow: true,
  }
]);
const otherFieldList = ref<FieldInfo[]>([
  {
    fieldName: "execListener",
    batchFieldList: [{
      batchName: "execListener",
      title: "执行监听器",
      fieldList: [
        {
          label: "事件类型",
          fieldName: "eventType",
          type: "input",
          formShow: true,
        },
        {
          label: "监听器类型",
          fieldName: "listenerType",
          type: "input",
          formShow: true,
        }
      ]
    }, {
      batchName: "taskListener",
      title: "任务监听器",
      fieldList: [
        {
          label: "事件类型",
          fieldName: "eventType",
          type: "input",
          formShow: true,
        },
        {
          label: "监听器Id",
          fieldName: "listenerId",
          type: "input",
          formShow: true,
        },
        {
          label: "监听器类型",
          fieldName: "listenerType",
          type: "input",
          formShow: true,
        }
      ]
    }, {
      batchName: "extendProperties",
      title: "扩展属性",
      fieldList: [
        {
          label: "属性名",
          fieldName: "propName",
          type: "input",
          formShow: true,
        },
        {
          label: "属性值",
          fieldName: "propValue",
          type: "input",
          formShow: true,
        }
      ]
    }]
  }
]);
const tableFieldList = reactive({
  fieldList: [
    {
      fieldName: "basic",
      tabList: [{
        title: "基础信息",
        tabName: "basic",
        fieldList: basicFieldList
      }, {
        title: "按钮设置",
        tabName: "button",
        fieldList: buttonFieldList
      }, {
        title: "事务处理人",
        tabName: "auditor",
        fieldList: auditorFieldList
      }, {
        title: "其他配置",
        tabName: "other",
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
