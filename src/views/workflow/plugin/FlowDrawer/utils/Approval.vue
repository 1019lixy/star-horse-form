<script setup lang="ts">
import {flowMixin, radioStyle} from '@/views/workflow/plugin/mixins/flowMixin';
import {uuid} from "@/api/system.ts";
import {getApproveNodes} from '../../util/nodeUtil';
import {computed, onMounted, ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {createCondition, loadData} from "@/api/sh_api.ts";
import {warning} from "@/utils/message.ts";
import TselectItem from "@/components/formcomp/items/tselect-item.vue";
import UserItem from "@/components/formcomp/items/user-item.vue";

const props = defineProps({
  groups: {
    type: Array<any>,
    default: function () {
      return [];
    },
  },
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  title: {
    type: String,
    default: '审批人',
  },
});
const flowDesign = useFlowDesign(piniaInstance);
let headStyle = ref<any>({
  background: '#f5f6f7',
  'min-height': '40px',
});
let approvals = ref<Array<any>>([
  {
    name: '上级',
    code: 'higherLevel',
    value: 1,
    // 多个组时需要disabled
    disabled: false,
    // 是否可以多个组
    addable: true,
  },
  {
    name: '部门负责人',
    value: 2,
    disabled: false,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是部门负责人审批？',
        content: '这里指在管理后台 - 组织架构中所设置的部门负责人',
      },
      {
        title: '什么是部门负责人审批？',
        content:
            '部门负责人审批与上级审批的区别？一个部门内可能存在多层的上下级关系，但通常有指定的部门负责人。由部门负责人审批 ，则不涉及上下级关系，直接由该固定人员进行审批',
      },
    ],

    hrefName: '如何配置部门负责人？',
  },
  {
    name: '部门审批人',
    value: 3,
    disabled: false,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是部门负责人审批？',
        content: '这里指在管理后台 - 组织架构中所设置的部门负责人',
      },
      {
        title: '什么是部门负责人审批？',
        content:
            '部门负责人审批与上级审批的区别？一个部门内可能存在多层的上下级关系，但通常有指定的部门负责人。由部门负责人审批 ，则不涉及上下级关系，直接由该固定人员进行审批',
      },
    ],

    hrefName: '如何配置部门负责人？',
  },
  {
    name: '角色',
    value: 5,
    disabled: false,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是角色？',
        content: '角色指团队成员的专业分工类别，如人事、行政、财务等，每类角色可由 1 位或多位成员组成',
      },
      {
        title: '如何使用？',
        content: '用角色作为审批人，当有成员离职变动时，该角色中的其他成员可继续完成审批，从而避免审批流程失效的情况',
      },
      {
        content: '提示：若选择的角色中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],

    hrefName: '如何配置角色？',
  },
  {
    name: '岗位',
    value: 6,
    disabled: false,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是岗位？',
        content: '岗位指团队成员的所处工作职务，一般指的是行政职务，如总监、经理、人事专员、行政助理、财务专员等，每类岗位可由 1 位或多位成员组成',
      },
      {
        title: '如何使用？',
        content: '用岗位作为审批人，当有成员离职变动时，该岗位中的其他成员可继续完成审批，从而避免审批流程失效的情况',
      },
      {
        content: '提示：若选择的岗位中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],

    hrefName: '如何配置岗位？',
  },
  {
    name: '用户组',
    value: 7,
    disabled: false,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是用户组？',
        content: '用户组主要用于权限管控，设置某个用户组作为审批人，则只有该用户组中的成员可进行审批。',
      },
      {
        title: '如何使用？',
        content: '用户组主要用于权限管控，设置某个用户组作为审批人，则只有该用户组中的成员可进行审批。',
      },
      {
        content: '提示：若选择的用户组中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],

    hrefName: '如何配置用户组？',
  },
  {
    name: '指定成员',
    value: 8,
    disabled: false,
    // 是否可以多个组
    addable: true,
  },
  {
    name: '发起人自选',
    value: 9,
    // 多个组时需要disabled
    disabled: true,
    // 是否可以多个组
    addable: false,
  },
  {
    name: '发起人自己',
    value: 10,
    disabled: true,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是发起人审批？',
        content: '将发起人自己设置为审批人，可用于需要发起人进行信息复核的场景',
      },
    ],
  },
  {
    name: '节点审批人',
    value: 11,
    disabled: true,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是节点审批人？',
        content: '通过选择前面已经配置的节点进行关联，流程执行时自动获取所有关联审批节点中的实际审批人作为当前节点的审批人',
      },
      {
        content: '节点审批人默认为多人审批，不会从关联的审批节点继承，需单独设置审批方式',
      },
      {
        content: '当前节点为节点审批人时，同一审批人重复审批将不会触发自动通过',
      },
      {
        title: '如何关联节点？',
        content: '可以选择前序节点的名称进行关联',
      },
    ],
  },
  {
    name: '连续多级上级审批',
    value: 12,
    disabled: true,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '什么是连续多级上级审批？',
        content: '从发起人的直属上级开始，依次逐级向上审批，直到所设置的审批终点为止。是手动逐个添加多级上级审批的一种便捷设置',
      },
    ],

    hrefName: '查看和设置上级信息',
  },
  {
    name: '表单内人员',
    value: 13,
    disabled: true,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '如何配置表单内人员？',
        content: '在表单设计中添加人员控件后，该人员/其上级/部门负责人将可以配置为本节点的审批人。',
      },
    ],
  },
  {
    name: '表单内部门',
    value: 14,
    disabled: true,
    // 是否可以多个组
    addable: true,
    popovers: [
      {
        title: '何配置表单内部门？',
        content: '在表单设计中添加部门控件后，其部门负责人可以配置为本节点的审批人。',
      },
    ],
  },
]);
// 上级方式
let higherLevelModes = ref<Array<any>>([
  {
    name: '自下而上（以发起人的直属上级为第一级）',
    value: 1,
    popovers: [
      {
        title: '什么是上级 - 自下而上？',
        content: '以发起人的直属上级为第一级，向更高管理层级递增',
      },
      {
        content: '图示：若小王为发起人，则小张是小王的“直属上级”，小李是小王的“第二级上级”',
      },
    ],

    hrefName: '查看和设置上级信息',
  },
  {
    name: '自上而下（以公司的最高上级为第一级）',
    code: 'higherLevel',
    value: 2,
    popovers: [
      {
        title: '什么是上级 - 自上而下？',
        content: '以公司组织架构中的最高上级为第一级，向更低管理层级递增',
      },
      {
        content: '图示：若小王为发起人，则小赵是小王的“最高上级”，小周是小王的“第二级上级”',
      },
    ],

    hrefName: '查看和设置上级信息',
  },
]);
// 上级层级
let higherLevels = ref<Array<any>>([
  {
    name: '直属上级',
    value: '1',
  },
  {
    name: '第二级上级',
    value: '2',
  },
  {
    name: '第三级上级',
    value: '3',
  },
  {
    name: '第四级上级',
    value: '4',
  },
  {
    name: '第五级上级',
    value: '5',
  },
  {
    name: '第六级上级',
    value: '6',
  },
  {
    name: '第七级上级',
    value: '7',
  },
  {
    name: '第八级上级',
    value: '8',
  },
  {
    name: '第九级上级',
    value: '9',
  },
  {
    name: '第十级上级',
    value: '10',
  },
  {
    name: '第十一级上级',
    value: '11',
  },
  {
    name: '第十二级上级',
    value: '12',
  },
]);
// 部门负责人方式
let departmentHeadModes = ref<Array<any>>([
  {
    name: '自下而上（以发起人的直接部门负责人为第一级）',
    value: 1,
    popovers: [
      {
        title: '什么是部门负责人 - 自下而上？',
        content: '以发起人的直接部门负责人为第一级，向更高管理层级递增',
      },
      {
        content: '图示：若小王为发起人，则小张是小王的“直接部门负责人”，小李是小王的“第二级部门负责人”',
      },
    ],

    hrefName: '如何配置部门负责人？',
  },
  {
    name: '自上而下（以公司的最高部门负责人为第一级）',
    code: 'higherLevel',
    value: 2,
    popovers: [
      {
        title: '什么是部门负责人 - 自上而下？',
        content: '以公司组织架构中的最高部门负责人为第一级，向更低管理层级递增',
      },
      {
        content: '图示：若小王为发起人，则小赵是小王的“最高部门负责人”，小周是小王的“第二级部门负责人”',
      },
    ],

    hrefName: '查看和设置上级信息',
  },
]);
// 部门负责人层级
let departmentHeads = ref<Array<any>>([
  {
    name: '直属部门负责人',
    value: '1',
  },
  {
    name: '第二级部门负责人',
    value: '2',
  },
  {
    name: '第三级部门负责人',
    value: '3',
  },
  {
    name: '第四级部门负责人',
    value: '4',
  },
  {
    name: '第五级部门负责人',
    value: '5',
  },
  {
    name: '第六级部门负责人',
    value: '6',
  },
  {
    name: '第七级部门负责人',
    value: '7',
  },
  {
    name: '第八级部门负责人',
    value: '8',
  },
  {
    name: '第九级部门负责人',
    value: '9',
  },
  {
    name: '第十级部门负责人',
    value: '10',
  },
  {
    name: '第十一级部门负责人',
    value: '11',
  },
  {
    name: '第十二级部门负责人',
    value: '12',
  },
]);
// 部门审批人
let departmentApprovals = ref<Array<any>>([
  {
    name: '部长',
    value: '101',
  },
  {
    name: '体系负责人',
    value: '102',
  },
  {
    name: 'HRBP',
    value: '103',
  },
  {
    name: '部门助理',
    value: '104',
  },
  {
    name: '资产助理',
    value: '105',
  },
  {
    name: '办公账号员',
    value: '106',
  },
  {
    name: '门禁员',
    value: '107',
  },
  {
    name: '转岗须知员',
    value: '108',
  },

  {
    name: '项目负责人',
    value: '110',
  },
]);
// 角色
let roleList = ref<Array<any>>([]);
//职级
let rankList = ref<any>([]);
//岗位
let stationList = ref<any>([]);
const dataNode = computed(() => flowDesign.node);
let show = computed(() => {
  return props.groups.filter((group: any) => [9, 10].includes(group.approveType)).length == 0;
});
let approveNodes = computed(() => {
  let approveNodes: Array<any> = [];
  getApproveNodes(dataNode, approveNodes);
  console.log(approveNodes);
  // 过滤自己
  return approveNodes.filter((approveNode) => approveNode.id != props.node.id);
});
/**
 * 改变审批人类型
 */
const changeapproveType = (group: any) => {
  group.approverIds = [];
  group.approverNames = [];
}
// 添加审批人
const addApproval = () => {
  props.groups.push({
    id: uuid(),
    // 审批人模式
    approveType: 1,
    // 层级模式
    levelMode: 1,
    // 审批人ID
    approverIds: [],
    // 审批人名称
    approverNames: [],
  });
}
// 删除审批人
const delApproval = (group: any) => {
  props.groups.forEach((element: any, i) => {
    if (element.id == group.id) {
      props.groups.splice(i, 1);
    }
  });
}
const init = async () => {
//加载职级
  let result = await loadData("/system-config/system/rankDefine/rankTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    rankList.value = result.data;
  }
  //加载岗位
  result = await loadData("/system-config/system/stationDefine/stationTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    stationList.value = result.data;
  }
  //加载角色
  result = await loadData("/system-config/system/companyRole/getAllByCondition", {
    fieldList: [createCondition("a.roleType", "common_role")]
  });
  if (result.error) {
    warning(result.error);
  } else {
    roleList.value = result.data;
  }
}
onMounted(() => {
  init();
});
</script>
<template>
  <!-- 审批人 -->
  <el-space direction="vertical" :fill="true" style="width: 100%!important;">
    <el-card v-for="(group, k) in groups" :key="k" :headStyle="headStyle" class="card-container">
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
          <star-horse-icon iconClass="delete" cursor="pointer" style="color:var(--el-color-danger)"
                           @click="delApproval(group)"/>
        </div>
      </template>
      <div class="flow-setting-item">
        <el-select style="margin-bottom: 10px;" v-model="group.approveType" filterable clearable default-first-option
                   @change="changeapproveType(group)">
          <el-option v-for="item in approvals" :key="item.value" :value="item.value" :label="item.name"
                     :disabled="item.disabled && groups.length > 1"
          >
            <div style="float: left">{{ item.name }}</div>
            <div style="
          float: right;
          color: var(--el-text-color-secondary);
        ">
              <el-popover v-if="item.popovers && item.popovers.length > 0"
                          :popper-style="{width: 'unset !important'}" placement="top-start" trigger="hover">
                <template #reference>
                  <star-horse-icon style="margin-left: 5px;" size="18px" icon-class="question-circle"/>
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    <div v-for="(popover, k) in item.popovers" :key="k">
                      <p class="main-title">{{ popover.title }}</p>
                      <p class="content">{{ popover.content }}</p>
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>
          </el-option>
        </el-select>
        <!-- 上级 -->
        <div v-if="group.approveType == 1">
          <p class="flow-setting-item-title">
            <span>指定层级</span>
          </p>
          <el-radio-group :size="flowMixin.size" v-model="group.levelMode" class="w-fill">
            <el-radio v-for="(higherLevel, i) in higherLevelModes" :key="i" :style="radioStyle"
                      :value="higherLevel.value">
              <span>{{ higherLevel.name }}</span>
              <el-popover v-if="higherLevel.popovers && higherLevel.popovers.length > 0"
                          :popper-style="{width: 'unset !important'}" placement="top-start"
                          trigger="hover">
                <template #reference>
                  <star-horse-icon style="margin-left: 5px;" size="18px" icon-class="question-circle"/>
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    <div v-for="(popover, k) in higherLevel.popovers" :key="k">
                      <p class="main-title">{{ popover.title }}</p>
                      <p class="content">{{ popover.content }}</p>
                    </div>
                  </div>
                </div>
              </el-popover>
            </el-radio>
          </el-radio-group>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in higherLevels" :key="item.value" :value="item.value" :label="item.name"/>
          </el-select>
        </div>
        <!-- 部门负责人 -->
        <div v-if="group.approveType == 2">
          <p class="flow-setting-item-title">
            <span>指定层级</span>
          </p>
          <el-radio-group v-model="group.levelMode" :size="flowMixin.size" class="w-fill">
            <el-radio v-for="(departmentHead, i) in departmentHeadModes" :key="i" :style="radioStyle"
                      :value="departmentHead.value">
              <span>{{ departmentHead.name }}</span>
              <el-popover v-if="departmentHead.popovers && departmentHead.popovers.length > 0"
                          :popper-style="{width: 'unset !important'}" placement="top-start"
                          trigger="hover">
                <template #reference>
                  <star-horse-icon style="margin-left: 5px;" size="18px" icon-class="question-circle"/>
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    <div v-for="(popover, k) in departmentHead.popovers" :key="k">
                      <p class="main-title">{{ popover.title }}</p>
                      <p class="content">{{ popover.content }}</p>
                    </div>
                  </div>
                </div>
              </el-popover>
            </el-radio>
          </el-radio-group>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in departmentHeads" :key="item.value" :value="item.value" :label="item.name"/>
          </el-select>
        </div>
        <!-- 部门审批人 -->
        <div v-if="group.approveType == 3">
          <p class="flow-setting-item-title">
            <span>部门审批人</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in departmentApprovals" :key="item.value" :value="item.value" :label="item.name"/>
          </el-select>
        </div>
        <!-- 编码审批人 -->
        <div v-else-if="group.approveType == 4">
          <p class="flow-setting-item-title">
            <span>编码对应部门审批人</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in departmentApprovals" :key="item.value" :value="item.value" :label="item.name"/>
          </el-select>
        </div>
        <!-- 角色 -->
        <div v-else-if="group.approveType == 5">
          <p class="flow-setting-item-title">
            <span>选择角色</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in roleList" :key="item.idCompanyRole" :value="item.idCompanyRole"
                       :label="item.roleName"/>
          </el-select>
        </div>
        <!-- 岗位 -->
        <div v-else-if="group.approveType == 6">
          <p class="flow-setting-item-title">
            <span>选择岗位</span>
          </p>
          <tselect-item :formData="group" :field="{
            preps:{
              name:'approverIds',
              showCode:'Y',
              values:rankList,
               label:'岗位',
              props:{
                label:'name',
                value:'value'
              }
            }}"/>
        </div>
        <!-- 用户组 -->
        <div v-else-if="group.approveType == 7">
          <p class="flow-setting-item-title">
            <span>选择用户组</span>
          </p>
          <tselect-item :formData="group" :field="{
            preps:{
              name:'approverIds',
              showCode:'Y',
              values:stationList,
              label:'用户组',
              props:{
                label:'name',
                value:'value'
              }
            }}"/>
        </div>
        <!-- 指定成员 -->
        <div v-else-if="group.approveType == 8">
          <p class="flow-setting-item-title">
            <span>指定成员</span>
            <span class="light-text">(不能超过 25 人)</span>
            <user-item :formData="group" :field="{
              preps:{
                multiple:'Y',
                name:'approverNames',
                aliasName:'approverIds',
                label:'成员',
              }
            }"/>
          </p>
        </div>
        <!-- 发起人自选 -->
        <div v-else-if="group.approveType == 9">
          <p class="flow-setting-item-title">
            <span>选择方式</span>
          </p>
          <el-radio-group v-model="group.selectType" :size="flowMixin.size" class="w-fill">
            <el-radio label="多选" value="1"/>
            <el-radio label="单选" value="2"/>
          </el-radio-group>
          <p class="flow-setting-item-title margin-top-10">
            <span>选择范围</span>
          </p>
          <el-radio-group v-model="group.selectRange" :size="flowMixin.size" class="w-fill">
            <el-radio label="全公司" value="1"/>
            <el-radio label="指定成员" value="2"/>
            <el-radio label="角色成员" value="3"/>
          </el-radio-group>
          <p class="flow-setting-item-title margin-top-10">
            <span>指定成员</span>
            <span class="light-text">(不能超过 25 人)</span>
            <user-item :formData="group" :field="{
              preps:{
                 multiple:'Y',
                 name:'approverNames',
                aliasName:'approverIds',
                label:'成员',
              }
            }"/>
          </p>
        </div>
        <!-- 节点审批人 -->
        <div v-else-if="group.approveType == 11">
          <p class="flow-setting-item-title">
            <span>选择节点</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in approveNodes" :key="item.id" :value="item.id" :label="item.name"/>
          </el-select>
          <p class="flow-setting-item-title">
            <span class="light-text">你可以选择前序节点名称，如果名称重复建议先修改审批节点的节点名称</span>
          </p>
        </div>
        <!-- 连续多级上级审批 -->
        <div v-else-if="group.approveType == 12">
          <p class="flow-setting-item-title">
            <span>审批终点</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable :size="flowMixin.size" default-first-option>
            <el-option :value="higherLevel.value" :label="higherLevel.name" v-for="(higherLevel, i) in higherLevels"
                       :key="higherLevel.value"/>
          </el-select>

        </div>
        <!-- 表单内人员 -->
        <div v-else-if="group.approveType == 13">
          <p class="flow-setting-item-title">
            <span>人员控件</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable :size="flowMixin.size" default-first-option>
            <el-option :value="higherLevel.value" v-for="(higherLevel, i) in higherLevels" :key="i">
              {{ higherLevel.name }}
            </el-option>
          </el-select>
          <p class="flow-setting-item-title margin-top-10">
            <span>审批类型</span>
          </p>
          <el-radio-group :size="flowMixin.size" class="w-fill">
            <el-radio label="人员自己" value="1"/>
            <el-radio label="人员上级" value="2"/>
            <el-radio label="人员部门负责人" value="3"/>
          </el-radio-group>
        </div>
        <!-- 表单内部门 -->
        <div v-else-if="group.approveType == 14">
          <p class="flow-setting-item-title">
            <span>部门控件</span>
          </p>
          <el-select v-model="group.approverIds" filterable clearable :size="flowMixin.size" default-first-option>
            <el-option :value="higherLevel.value" v-for="higherLevel in higherLevels" :key="higherLevel.value">
              {{ higherLevel.name }}
            </el-option>
          </el-select>
          <p class="flow-setting-item-title margin-top-10">
            <span>指定层级</span>
          </p>
          <el-radio-group v-model="group.levelMode" :size="flowMixin.size" class="w-fill">
            <el-radio v-for="(departmentHead, i) in departmentHeadModes" :key="i" :style="radioStyle"
                      :value="departmentHead.value">
              <span>{{ departmentHead.name }}</span>
              <el-popover v-if="departmentHead.popovers && departmentHead.popovers.length > 0"
                          :popper-style="{width: 'unset !important'}" placement="top-start"
                          trigger="hover">
                <template #reference>
                  <star-horse-icon style="margin-left: 5px;" size="18px" icon-class="question-circle"/>
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    <div v-for="(popover, k) in departmentHead.popovers" :key="k">
                      <p class="main-title">{{ popover.title }}</p>
                      <p class="content">{{ popover.content }}</p>
                    </div>
                  </div>
                </div>
              </el-popover>
            </el-radio>
          </el-radio-group>
          <el-select v-model="group.approverIds" filterable clearable default-first-option>
            <el-option v-for="item in departmentHeads" :key="item.value" :value="item.value" :label="item.name"/>
          </el-select>
        </div>
      </div>
    </el-card>
    <el-button v-if="show" link icon="plus" block @click="addApproval">添加{{ title }}</el-button>
  </el-space>
</template>
<style lang="scss" scoped>
:deep(.el-space) {
  width: 100%;
}
</style>
