<script setup lang="ts">
  import { flowCommon, radioStyle } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import FlowDrawerFooter from "@/views/workflow/plugin/common/DrawerFooter.vue";
  import FlowNodeApproval from "@/views/workflow/plugin/preps/utils/Approval.vue";
  import FlowNodeApprovalConfigure from "@/views/workflow/plugin/preps/utils/ApproverConfigure.vue";
  import AuthForm from "@/views/workflow/plugin/common/AuthForm.vue";
  import { ref, computed, onMounted } from "vue";
  import { useFlowDesign } from "@/store/FlowDesignStore.ts";
  import piniaInstance from "@/store";
  import { ModelRef } from "vue-demi";
  import { FlowNodeEnums } from "../enums/FlowNodeEnums.ts";
  import { postRequest } from "@/api/star_horse.ts";
  import { createCondition } from "@/api/sh_api.ts";
  import ExecutionListeners from "@/views/workflow/plugin/preps/utils/ExecutionListeners.vue";

  defineOptions({
    name: "ApprovalPrep"
  });
  let node: ModelRef<any> = defineModel("activeData");
  let approvalTab = ref<string>("1");
  const flowFormInfo = computed(() => flowDesign.flowFormInfo);
  // 审批类型
  let approvalMethods = ref<Array<any>>([
    {
      name: "指定人员",
      value: "assign"
    },
    {
      name: "自动通过",
      value: "pass"
    },
    {
      name: "自动拒绝",
      value: "reject"
    }
  ]);
  // 审批方式
  let approvalModes = ref<Array<any>>([
    {
      name: "依次审批(一人通过再到下一个人处理)",
      value: "sequential"
    },
    {
      name: "多人会签",
      value: "joint"
    },
    {
      name: "多人或签(一人通过或否决)",
      value: "single"
    }
  ]);
  let approvalWithNulls = ref<Array<any>>([]);
  let sameApprovals = ref<Array<any>>([]);
  const flowDesign = useFlowDesign(piniaInstance);
  const onClose = () => {
    flowDesign.setActive(false);
  };
  /**
   * 保存配置
   */
  const onSave = () => {
    // 更新节点显示信息
    let content = "";
    node.value.approveGroups.forEach((group: any) => {
      if (Array.isArray(group.approverNames) && group.approverNames.length > 0) {
        content += group.approverNames.join(",");
      } else {
        content += group.approverNames;
      }
      if (content) {
        content += ",";
      }
    });

    onClose();
  };
  const init = () => {
    postRequest(
      "/userdb-manage/userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357/getAllByCondition",
      {
        fieldList: [createCondition("idFlowNode", ["applyEqAuditMode", "approvalNullOperationType"], "in")],
        orderBy: [{ fieldName: "createdTime", ascOrDesc: "ASC" }]
      }
    ).then((res) => {
      if (res.data.code) {
        console.log(res.data.cnMessage);
        return;
      }
      let reData: Array<any> = res.data.data;
      sameApprovals.value = reData.filter((item: any) => {
        return item.idFlowNode == "applyEqAuditMode";
      });
      approvalWithNulls.value = reData.filter((item: any) => {
        return item.idFlowNode == "approvalNullOperationType";
      });
    });
  };
  onMounted(() => {
    init();
  });
</script>
<template>
  <el-card class="inner_content h100">
    <el-form :model="node" label-position="top" :size="flowCommon.size">
      <el-form-item v-if="node.type == FlowNodeEnums.APPROVER_NODE" label="审批类型" prop="approvalMethod">
        <el-radio-group v-model="node.approvalMethod" button-style="solid">
          <el-radio :value="approvalMethod.value" v-for="(approvalMethod, i) in approvalMethods" :key="i">
            {{ approvalMethod.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-alert
        v-if="node.type == FlowNodeEnums.HANDLE_NODE"
        title="当流程中某个节点不需要审批，但需要对审批单进行业务办理时，可设置办理人节点，场景如财务打款、处理盖章等"
        type="success"
      />
      <el-tabs v-if="node.approvalMethod == 'assign'" v-model="approvalTab">
        <el-tab-pane key="1" name="1" label="审批设置">
          <el-form-item>
            <FlowNodeApproval
              :groups="node.approveGroups"
              :node="node"
              :title="node.type == FlowNodeEnums.APPROVER_NODE ? '审批人' : '办理人'"
            />
          </el-form-item>
          <el-form-item label="审批方式" prop="approvalMode">
            <el-radio-group v-model="node.approvalMode" button-style="solid" class="w-full">
              <el-radio :value="approvalMode.value" v-for="(approvalMode, i) in approvalModes" :key="i">
                {{ approvalMode.name }}
              </el-radio>
            </el-radio-group>
            <div style="margin-top: 15px" v-if="node.approvalMode === 'joint'">
              需要
              <el-input-number v-model="node.multiPercent" :min="1" :max="100" />
              %人员通过
            </div>
          </el-form-item>
          <el-form-item label="审批人与发起人为同一人时" prop="sameMode">
            <el-radio-group v-model="node.sameMode" :size="flowCommon.size" class="w-full">
              <el-radio
                v-for="(sameApproval, i) in sameApprovals"
                :key="i"
                :value="sameApproval.attrValue"
                :style="radioStyle"
              >
                <span>{{ sameApproval.attrName }}</span>
                <el-popover
                  v-if="sameApproval.popovers && sameApproval.popovers.length > 0"
                  placement="top-start"
                  trigger="hover"
                  :popper-style="{ width: 'unset !important' }"
                >
                  <template #reference>
                    <star-horse-icon style="margin-left: 5px" icon-class="question-circle" />
                  </template>

                  <div class="approver-tip-content">
                    <div class="approver-tip-main-content">
                      {{ sameApproval.defaultValue }}
                    </div>
                  </div>
                </el-popover>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="noHander">
            <template #label>
              {{ node.type == FlowNodeEnums.APPROVER_NODE ? "审批人" : "办理人" }}为空时
              <el-popover placement="top-start" trigger="hover" :popper-style="{ width: 'unset !important' }">
                <template #reference>
                  <star-horse-icon style="margin-left: 5px" icon-class="question-circle" />
                </template>
                <div class="approver-tip-content">
                  <div class="approver-tip-main-content">
                    <p class="main-title"
                      >什么情况下会出现{{ node.type == FlowNodeEnums.APPROVER_NODE ? "审批人" : "办理人" }}为空？</p
                    >
                    <p class="content">设置了“上级”审批，但申请人在管理后台 - 组织架构中没有上级</p>
                    <p class="content">设置了“部门负责人”审批，但申请人在管理后台 - 组织架构中没有部门负责人</p>
                    <p class="content">设置了“角色”审批，但该角色在管理后台 - 组织架构中没有任何成员</p>
                    <p class="content">设置了“用户组”审批，但该用户组在管理后台 - 组织架构中没有任何成员</p>
                  </div>
                </div>
              </el-popover>
            </template>
            <el-radio-group v-model="node.noHander" :size="flowCommon.size" class="w-full">
              <el-radio
                v-for="(approvalWithNull, i) in approvalWithNulls"
                :key="i"
                :value="approvalWithNull.attrValue"
                :style="radioStyle"
              >
                <span>{{ approvalWithNull.attrName }}</span>
                <el-popover
                  v-if="approvalWithNull.popovers && approvalWithNull.popovers.length > 0"
                  placement="top-start"
                  trigger="hover"
                  :popper-style="{ width: 'unset !important' }"
                >
                  <template #reference>
                    <star-horse-icon style="margin-left: 5px" icon-class="question-circle" />
                  </template>
                  <div class="approver-tip-content">
                    <div class="approver-tip-main-content">
                      {{ approvalWithNull.defaultValue }}
                    </div>
                  </div>
                </el-popover>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="flow-content">
            <div class="flow-item">
              <p class="flow-item-title">提示：</p>
              <div class="hint-info">
                <p v-if="node.type == FlowNodeEnums.HANDLE_NODE">
                  办理人不涉及审批人去重设置，不同节点相同的办理人仍需要执行。</p
                >
                <p>若审批人离职，会自动转交给审批人的上级代为处理</p>
                <p>抄送的人数最多支持100人以内</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="2" name="2" label="表单权限">
          <el-form-item v-if="node.type == FlowNodeEnums.APPROVER_NODE" label="表单权限" prop="privilege">
            <AuthForm v-model="node.privilege" :form-id="flowFormInfo?.formId" />
          </el-form-item>
          <template v-else>
            <star-horse-data-selector
              data-url="/userdb-manage/userdb/dynamicForm/pageList"
              display-name="formName"
              display-value="idDynamicForm"
              :pageSize="100"
              placeholder="请选择表单"
              v-model="node.formId"
            />
            <AuthForm v-model="node.privilege" :formId="node.formId" writable />
          </template>
        </el-tab-pane>
        <el-tab-pane key="3" name="3" label="任务监听">
          <ExecutionListeners :node="node" />
        </el-tab-pane>
        <el-tab-pane key="4" name="4" label="高级设置">
          <FlowNodeApprovalConfigure v-model:configure="node.operations" />
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <FlowDrawerFooter @close="onClose" @save="onSave" />
</template>
<style lang="scss" scoped>
  :deep(.el-form-item__label) {
    font-weight: 800;
  }
</style>
