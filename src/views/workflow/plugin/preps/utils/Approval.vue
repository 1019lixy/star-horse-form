<script setup lang="ts">
import {createCondition, piniaInstance, postRequest, uuid} from "star-horse-lowcode";
import {getApproveNodes} from "@/views/workflow/plugin/utils/nodeUtil";
import {computed, onMounted, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";

const props = defineProps({
  groups: {
    type: Array<any>,
    default: function () {
      return [];
    }
  },
  node: {
    type: Object,
    default: function () {
      return {};
    }
  },
  title: {
    type: String,
    default: "审批人"
  }
});
const flowDesign = useFlowDesignStore(piniaInstance);
let headStyle = ref<any>({
  background: "#f5f6f7",
  "min-height": "40px"
});

let approvals = ref<Array<any>>([]);
// 上级方式
let higherLevelModes = ref<Array<any>>([
  {
    name: "自下而上（以发起人的直属上级为第一级）",
    value: 1,
    popovers: [
      {
        title: "什么是上级 - 自下而上？",
        content: "以发起人的直属上级为第一级，向更高管理层级递增"
      },
      {
        content: "图示：若小王为发起人，则小张是小王的“直属上级”，小李是小王的“第二级上级”"
      }
    ],

    hrefName: "查看和设置上级信息"
  },
  {
    name: "自上而下（以公司的最高上级为第一级）",
    code: "higherLevel",
    value: 2,
    popovers: [
      {
        title: "什么是上级 - 自上而下？",
        content: "以公司组织架构中的最高上级为第一级，向更低管理层级递增"
      },
      {
        content: "图示：若小王为发起人，则小赵是小王的“最高上级”，小周是小王的“第二级上级”"
      }
    ],

    hrefName: "查看和设置上级信息"
  }
]);
// 上级层级
let higherLevels = ref<Array<any>>([
  {
    name: "直属上级",
    value: "1"
  },
  {
    name: "第二级上级",
    value: "2"
  },
  {
    name: "第三级上级",
    value: "3"
  },
  {
    name: "第四级上级",
    value: "4"
  },
  {
    name: "第五级上级",
    value: "5"
  },
  {
    name: "第六级上级",
    value: "6"
  },
  {
    name: "第七级上级",
    value: "7"
  },
  {
    name: "第八级上级",
    value: "8"
  },
  {
    name: "第九级上级",
    value: "9"
  },
  {
    name: "第十级上级",
    value: "10"
  },
  {
    name: "第十一级上级",
    value: "11"
  },
  {
    name: "第十二级上级",
    value: "12"
  }
]);
// 部门负责人方式
let departmentHeadModes = ref<Array<any>>([
  {
    name: "自下而上（以发起人的直接部门负责人为第一级）",
    value: 1,
    popovers: [
      {
        title: "什么是部门负责人 - 自下而上？",
        content: "以发起人的直接部门负责人为第一级，向更高管理层级递增"
      },
      {
        content: "图示：若小王为发起人，则小张是小王的“直接部门负责人”，小李是小王的“第二级部门负责人”"
      }
    ],

    hrefName: "如何配置部门负责人？"
  },
  {
    name: "自上而下（以公司的最高部门负责人为第一级）",
    code: "higherLevel",
    value: 2,
    popovers: [
      {
        title: "什么是部门负责人 - 自上而下？",
        content: "以公司组织架构中的最高部门负责人为第一级，向更低管理层级递增"
      },
      {
        content: "图示：若小王为发起人，则小赵是小王的“最高部门负责人”，小周是小王的“第二级部门负责人”"
      }
    ],

    hrefName: "查看和设置上级信息"
  }
]);
// 部门负责人层级
let departmentHeads = ref<Array<any>>([
  {
    name: "直属部门负责人",
    value: "1"
  },
  {
    name: "第二级部门负责人",
    value: "2"
  },
  {
    name: "第三级部门负责人",
    value: "3"
  },
  {
    name: "第四级部门负责人",
    value: "4"
  },
  {
    name: "第五级部门负责人",
    value: "5"
  },
  {
    name: "第六级部门负责人",
    value: "6"
  },
  {
    name: "第七级部门负责人",
    value: "7"
  },
  {
    name: "第八级部门负责人",
    value: "8"
  },
  {
    name: "第九级部门负责人",
    value: "9"
  },
  {
    name: "第十级部门负责人",
    value: "10"
  },
  {
    name: "第十一级部门负责人",
    value: "11"
  },
  {
    name: "第十二级部门负责人",
    value: "12"
  }
]);
// 部门审批人
let departmentApprovals = ref<Array<any>>([
  {
    name: "部长",
    value: "101"
  },
  {
    name: "体系负责人",
    value: "102"
  },
  {
    name: "HRBP",
    value: "103"
  },
  {
    name: "部门助理",
    value: "104"
  },
  {
    name: "资产助理",
    value: "105"
  },
  {
    name: "办公账号员",
    value: "106"
  },
  {
    name: "门禁员",
    value: "107"
  },
  {
    name: "转岗须知员",
    value: "108"
  },

  {
    name: "项目负责人",
    value: "110"
  }
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
  // 过滤自己
  return approveNodes.filter((approveNode) => approveNode.id != props.node.id);
});
let dataSelectorVisible = ref<boolean>(false);
let dataList = ref<any>([]);
let selectorParmas = ref<any>({});
/**
 * 改变审批人类型
 */
const changeApproveType = (group: any) => {
  group.approverIds = [];
  group.approverNames = [];
  dataSelectorVisible.value = false;
  let item = approvals.value.find((item: any) => item.idApprovalType == group.approveType);
  group.currentApproveType = item;
  selectorParmas.value = {
    placeholder: `请选${item.approveType}`,
    displayFieldName: "name",
    displayFieldValue: "id"
  };
  postRequest(
      "/userdb-manage/userdb/formInstance/flApprovalFields/idApprovalFields/337537414606095357/getAllByCondition",
      {
        fieldList: [createCondition("a.idApprovalType", group.approveType)]
      }
  ).then((res) => {
    dataList.value = res.data?.data;
    dataSelectorVisible.value = true;
  });
};
// 添加审批人
const addApproval = () => {
  props.groups.push({
    id: uuid(),
    // 审批人模式
    approveType: null,
    // 层级模式
    levelMode: 1,
    // 审批人ID
    approverIds: [],
    // 审批人名称
    approverNames: []
  });
};
// 删除审批人
const delApproval = (group: any) => {
  props.groups.forEach((element: any, i) => {
    if (element.id == group.id) {
      props.groups.splice(i, 1);
    }
  });
};
const init = async () => {
  props.node["audit"] = {};
  //加载职级
  postRequest("/system-config/system/rankDefine/rankTree", {}).then((res) => {
    rankList.value = res.data?.data;
  });
  //加载岗位
  postRequest("/system-config/system/stationDefine/stationTree", {}).then((res) => {
    stationList.value = res.data?.data;
  });

  //加载角色
  postRequest("/system-config/system/companyRole/getAllByCondition", {
    fieldList: [createCondition("a.roleType", "common_role")]
  }).then((res) => {
    roleList.value = res.data?.data;
  });
  postRequest(
      "/userdb-manage/userdb/formInstance/flApprovalType/idApprovalType/337537414606095357/getAllByCondition",
      {}
  ).then((res) => {
    approvals.value = res.data?.data;
  });
};
onMounted(() => {
  init();
});
</script>
<template>
  <el-form :model="groups" label-position="top">
    <div v-for="(group, index) in groups" :key="index" class="listener-box">
      <el-button
          class="listener-close"
          @click="delApproval(group)"
          plain
          circle
          icon="CircleClose"
          size="small"
          type="danger"
      />
      <el-form-item :label="title" :prop="`groups.${index}.approveType`">
        <el-select
            style="margin-bottom: 10px; width: 100%"
            v-model="group.approveType"
            filterable
            clearable
            default-first-option
            @change="changeApproveType(group)"
        >
          <el-option
              v-for="item in approvals"
              :key="item.idApprovalType"
              :value="item.approvalCode"
              :label="item.approvalType"
              :disabled="item.statusCode == '0' && groups.length > 1"
          >
            <div style="float: left">{{ item.approvalType }}</div>
            <div style="float: right; color: var(--el-text-color-secondary)">
              <el-popover
                  v-if="item.remark && item.remark.length > 0"
                  :popper-style="{ width: 'unset !important' }"
                  placement="top-start"
                  trigger="hover"
              >
                <template #reference>
                  <star-horse-icon style="margin-left: 5px" size="18px" icon-class="question-circle"/>
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    {{ item.remark }}
                  </div>
                </div>
              </el-popover>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
          v-if="group.approveType"
          :label="'指定' + (group.currentApproveType?.approvalType || '')"
          :prop="`groups.${index}.approverIds`"
      >
        <star-horse-data-selector
            multiple
            v-model="group.approverIds"
            :placeholder="'请选择' + (group.currentApproveType?.approvalType || '')"
        />
      </el-form-item>
    </div>
    <div class="listener-btn">
      <el-button link @click="addApproval" type="primary" icon="Plus">添加</el-button>
    </div>
  </el-form>
</template>
<style lang="scss" scoped>
:deep(.el-space) {
  width: 100%;
}
</style>
