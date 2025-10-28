<script setup lang="ts">
import {
  createCondition,
  postRequest,
  StarHorseDataSelector,
  uuid,
} from "star-horse-lowcode";
import { computed, onMounted, ref } from "vue";
import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums.js";

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
    default: false,
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
    group.dataList = {
      interOrDict: reData?.interOrDict,
      displayName: reData?.fieldName,
      displayValue: reData?.fieldValue,
      params: reData?.params ? JSON.parse(reData?.params) : [],
      proxy: reData?.proxy ?? true,
    };
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
      :label="nodePreName + '人'"
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
      >
        <el-radio
          v-for="item in approvals"
          :key="item.idApprovalType"
          :value="item.approvalCode"
          :label="item.approvalType"
          :disabled="item.statusCode == '0' && groups.length > 1"
        >
          <div class="flex flex-row justify-between items-center">
            <div>{{ item.approvalType.replace("审批", nodePreName) }}</div>
            <div style="color: var(--el-text-color-secondary)">
              <el-popover
                v-if="item.remark?.length > 0"
                :popper-style="{ width: 'unset !important' }"
                placement="top-start"
                trigger="hover"
              >
                <template #reference>
                  <star-horse-icon
                    style="margin-left: 5px"
                    size="18px"
                    icon-class="question-circle"
                  />
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    {{ item.remark }}
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="
        group.approveType && group.currentApproveType?.approvalCode != 'reject'
      "
      :label="'指定' + (group.currentApproveType?.approvalType || '')"
      :prop="`groups.${index}.approverIds`"
    >
      <star-horse-data-selector
        :multiple="multiple"
        v-model="group.approverIds"
        :dataUrl="group.dataList?.interOrDict"
        :displayName="group.dataList?.displayName"
        :displayValue="group.dataList?.displayValue"
        :params="group.dataList?.params"
        :proxy="group.dataList?.proxy"
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
</style>
