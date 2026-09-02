<script setup lang="ts">
import {
  createCondition,
  dictData,
  postRequest,
  StarHorseDataSelector,
  uuid,
} from "star-horse-lowcode";
import { computed, onMounted, ref } from "vue";
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";
import Help from "@/components/workflow/designer/common/Help.vue";

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
    default: "审批人",
  },
  multiple: {
    type: Boolean,
    default: true,
  },
});
const nodePreName = computed(() =>
  props.node.type == FlowNodeEnums.HANDLE_NODE ? "办理" : "审批",
);
let approvals = ref<Array<any>>([]);
let dataSelectorVisible = ref<boolean>(false);
let selectorParmas = ref<any>({});
/**
 * 改变审批人类型
 */
const changeApproveType = (group: any) => {
  group.approverIds = [];
  group.approverNames = [];

  dataSelectorVisible.value = false;
  let item = approvals.value.find(
    (item: any) => item.approvalCode == group.approveType,
  );
  group.currentApproveType = item;
  selectorParmas.value = {
    placeholder: `请选${item.approveType}`,
    displayFieldName: "name",
    displayFieldValue: "id",
  };
  postRequest(
    "/userdb-manage/userdb/formInstance/flApprovalFields/idApprovalFields/337537414606095357/getOneByCondition",
    {
      fieldList: [createCondition("a.idApprovalType", item.idApprovalType)],
    },
  ).then((res) => {
    const reData = res.data?.data;
    if (reData.datasourceType == "dict") {
      dictData(reData.interOrDict).then((res) => {
        group.dataList = {
          data: res,
          displayName: "name",
          displayValue: "value",
        };
      });
    } else {
      group.dataList = {
        dataUrl: reData?.interOrDict,
        displayName: reData?.fieldName,
        displayValue: reData?.fieldValue,
        params: reData?.params ? JSON.parse(reData?.params) : [],
        proxy: reData?.proxy ?? true,
      };
    }

    dataSelectorVisible.value = true;
  });
};
// 添加审批人
const addApproval = () => {
  props.groups.push({
    id: uuid(),
    // 审批人模式
    approveType: "directLeader",
    // 层级模式
    levelMode: 1,
    // 审批人ID
    approverIds: [],
    // 审批人名称
    approverNames: [],
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
  postRequest(
    "/userdb-manage/userdb/formInstance/flApprovalType/idApprovalType/337537414606095357/getAllByCondition",
    {},
  ).then((res) => {
    approvals.value = res.data?.data;
  });
};
onMounted(() => {
  init();
});
</script>
<template>
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
    <el-form-item
      :label="node.type==FlowNodeEnums.COPYER_NODE?'':nodePreName + '人'"

      :prop="`approveGroups.${index}.approveType`"
      :rules="[{ required: true, message: '必须项不能为空', trigger: 'blur' }]"
      required
    >
      <el-radio-group
        style="margin-bottom: 10px; width: 100%"
        v-model="group.approveType"
        filterable
        clearable
        default-first-option
        @change="changeApproveType(group)"
        class="audit-type-radio"
      >
        <el-radio
          v-for="item in approvals"
          :key="item.idApprovalType"
          :value="item.approvalCode"
          :label="item.approvalType"
          :disabled="item.statusCode == '0' && groups.length > 1"
        >
          <div class="flex flex-row justify-between gap-2 items-center">
            <div>{{ item.approvalType.replace("审批", nodePreName) }}</div>
            <help v-if="item.remark" :message="item.remark" />
          </div>
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="group.approveType"
      :label="'指定' + (group.currentApproveType?.approvalType || '')"
      :prop="`groups.${index}.approverIds`"
    >
      <el-radio-group
        v-if="
          group.approveType == 'directLeader' ||
          group.approveType == 'deptManager'
        "
        v-model="group.levelMode"
        class="flex flex-col !justify-start w-full"
        style="align-items: start; margin-bottom: 8px"
      >
        <el-radio value="lowToHigh">
          <div class="flex items-center">
            自下而上（以发起人的直属上级为第一级）
            <help
              message="什么是部门负责人 - 自下而上？
以发起人的直接部门负责人为第一级，向更高管理层级递增
图示：若小王为发起人，则小张是小王的“直接部门负责人”，小李是小王的“第二级部门负责人”"
            />
          </div>
        </el-radio>
        <el-radio value="highToLow">
          <div class="flex items-center">
            自上而下（以公司的最高上级为第一级）
            <help
              message="什么是部门负责人 - 自上而下？
以公司组织架构中的最高部门负责人为第一级，向更低管理层级递增
图示：若小王为发起人，则小赵是小王的“最高部门负责人”，小周是小王的“第二级部门负责人”"
            />
          </div>
        </el-radio>
      </el-radio-group>
      <star-horse-data-selector
        :multiple="multiple"
        v-model="group.approverIds"
        v-bind="group.dataList"
        :placeholder="'请选择' + (group.currentApproveType?.approvalType || '')"
      />
    </el-form-item>
  </div>
  <div class="listener-btn">
    <el-button link @click="addApproval" type="primary" icon="Plus"
      >添加
    </el-button>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-space) {
  width: 100%;
}

.audit-type-radio {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
</style>
