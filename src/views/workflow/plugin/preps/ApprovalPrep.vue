<script setup lang="ts">
import {flowCommon, radioStyle,} from "@/views/workflow/plugin/utils/flowCommon";
import {computed, ModelRef, onMounted, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {createCondition, piniaInstance, postRequest, StarHorseDataSelector,} from "star-horse-lowcode";
import {FlowNodeEnums} from "../enums/FlowNodeEnums";
import Approval from "@/views/workflow/plugin/preps/utils/Approval.vue";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";

defineOptions({
  name: "ApprovalPrep",
});
const flowDesign = useFlowDesignStore(piniaInstance);
let node: ModelRef<any> = defineModel("activeData");
let approvalTab = ref<string>("basic");
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
const nodePreName=computed(() => node.value.type == FlowNodeEnums.HANDLE_NODE?"办理":"审批");
const formId = computed(() => flowDesign.getFormId());
let dataList = ref<any>({
  interOrDict: "",
  displayName: "",
  displayValue: "",
  params: {},
  proxy: false,
});


// 审批方式
let approvalModes = ref<Array<any>>([
  {
    name: "依次审批(一人通过再到下一个人处理)",
    value: "sequential",
  },
  {
    name: "多人会签",
    value: "joint",
  },
  {
    name: "多人或签(一人通过或否决)",
    value: "single",
  },
]);
let approvalWithNulls = ref<Array<any>>([]);
let operatorApprovals = ref<Array<any>>([]);
let sameApprovals = ref<Array<any>>([]);

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
        fieldList: [
          createCondition(
              "idFlowNode",
              [
                "applyEqAuditMode",
                "approvalNullOperationType",
                "operatorApprovalsType",
              ],
              "in",
          ),
        ],
        orderBy: [{fieldName: "createdTime", ascOrDesc: "ASC"}],
      },
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
    operatorApprovals.value = reData.filter((item: any) => {
      return item.idFlowNode == "operatorApprovalsType";
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
      <el-alert
          v-if="node.type == FlowNodeEnums.HANDLE_NODE"
          title="当流程中某个节点不需要审批，但需要对审批单进行业务办理时，可设置办理人节点，场景如财务打款、处理盖章等"
          type="success"
      />
      <el-tabs
          type="border-card"
          v-model="approvalTab"
      >
        <el-tab-pane key="basic" name="basic" label="节点信息">
          <BasePrep :nodeInfo="node"/>
        </el-tab-pane>
        <el-tab-pane key="audit" name="audit" :label="`任务${nodePreName}人设置`">
          <approval :node="node" :groups="node.approveGroups"/>
        </el-tab-pane>
        <el-tab-pane key="optional" name="optional" :label="`${nodePreName}设置`">
          <el-form-item :label="`${nodePreName}方式`" prop="approvalMode">
            <el-radio-group
                v-model="node.approvalMode"
                button-style="solid"
                class="w-full"
            >
              <el-radio
                  :value="approvalMode.value"
                  v-for="(approvalMode, i) in approvalModes"
                  :key="i"
              >
                {{ approvalMode.name.replace('审批',nodePreName) }}
              </el-radio>
            </el-radio-group>
            <div
                class="my-[15px] flex items-center w-full"
                v-if="node.approvalMode === 'joint'"
            >
              <span>需要</span>
              <el-input-number
                  class="!w-[200px]"
                  v-model="node.multiPercent"
                  :min="1"
                  :max="100"
              />
              <span>%人员通过</span>
            </div>
          </el-form-item>
          <el-form-item :label="`${nodePreName}人与发起人为同一人时`" prop="sameMode">
            <el-radio-group
                v-model="node.sameMode"
                :size="flowCommon.size"
                class="w-full"
            >
              <el-radio
                  v-for="(sameApproval, i) in sameApprovals"
                  :key="i"
                  :value="sameApproval.attrValue"
                  :style="radioStyle"

              >
                <div class="flex flex-row items-center mx-[10px] ">
                  <span>{{ sameApproval.attrName.replace('审批',nodePreName) }}</span>
                  <el-popover
                      v-if="sameApproval.defaultValue?.length > 0"
                      placement="top-start"
                      trigger="hover"
                      :popper-style="{ width: 'unset !important' }"
                  >
                    <template #reference>
                      <star-horse-icon
                          style="margin-left: 5px"
                          icon-class="question-circle"
                      />
                    </template>

                    <div class="approver-tip-content">
                      <div class="approver-tip-main-content">
                        {{ sameApproval.defaultValue }}
                      </div>
                    </div>
                  </el-popover>
                </div>
              </el-radio>
            </el-radio-group>
            <template v-if="node.sameMode==''||node.sameMode==''">

            </template>
          </el-form-item>

          <el-form-item prop="noHander">
            <template #label>
              <div class="flex items-center">
                {{nodePreName }}人为空时
                <el-popover
                    placement="top-start"
                    trigger="hover"
                    :popper-style="{ width: 'unset !important' }"
                >
                  <template #reference>
                    <star-horse-icon
                        style="margin-left: 5px"
                        icon-class="question-circle"
                    />
                  </template>
                  <div class="approver-tip-content">
                    <div class="approver-tip-main-content">
                      <p class="main-title">
                        什么情况下会出现{{nodePreName }}人为空？
                      </p>
                      <p class="content">
                        设置了“上级”{{nodePreName }}，但申请人在管理后台 -
                        组织架构中没有上级
                      </p>
                      <p class="content">
                        设置了“部门负责人”{{nodePreName }}，但申请人在管理后台 -
                        组织架构中没有部门负责人
                      </p>
                      <p class="content">
                        设置了“角色”{{nodePreName }}，但该角色在管理后台 -
                        组织架构中没有任何成员
                      </p>
                      <p class="content">
                        设置了“用户组”{{nodePreName }}，但该用户组在管理后台 -
                        组织架构中没有任何成员
                      </p>
                    </div>
                  </div>
                </el-popover>
              </div>
            </template>
            <el-radio-group
                v-model="node.noHander"
                :size="flowCommon.size"
                class="w-full"
            >
              <el-radio
                  v-for="(approvalWithNull, i) in approvalWithNulls"
                  :key="i"
                  :value="approvalWithNull.attrValue"
                  :style="radioStyle"
              >
                <div class="flex flex-row items-center mx-[10px] ">
                  <span>{{ approvalWithNull.attrName.replace('审批',nodePreName) }}</span>
                  <el-popover
                      v-if="approvalWithNull.defaultValue?.length > 0"
                      placement="top-start"
                      trigger="hover"
                      :popper-style="{ width: 'unset !important' }"
                  >
                    <template #reference>
                      <star-horse-icon
                          style="margin-left: 5px"
                          icon-class="question-circle"
                      />
                    </template>
                    <div class="approver-tip-content">
                      <div class="approver-tip-main-content">
                        {{ approvalWithNull.defaultValue }}
                      </div>
                    </div>
                  </el-popover>
                </div>
              </el-radio>
            </el-radio-group>
            <template v-if="node.noHander=='B'">
              <star-horse-data-selector multiple v-model="node.noHanderApproverIds" :dataUrl="dataList.interOrDict"
                                        :displayName="dataList.displayName" :displayValue="dataList.displayValue"
                                        :params="dataList.params"
                                        :proxy="dataList.proxy" :placeholder="'请选择' + (approvalWithNulls?.find(item=>item.attrValue==node.noHander)?.attrName || '')
            "/>
            </template>
          </el-form-item>

          <div class="flow-content">
            <div class="flow-item">
              <p class="flow-item-title">提示：</p>
              <div class="hint-info">
                <p v-if="node.type == FlowNodeEnums.HANDLE_NODE">
                  办理人不涉及{{nodePreName }}人去重设置，不同节点相同的办理人仍需要执行。
                </p>
                <p>若{{nodePreName }}人离职，会自动转交给{{nodePreName }}人的上级代为处理</p>
                <p>抄送的人数最多支持100人以内</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="formAuthority" name="formAuthority" label="表单权限">
          <el-form-item
              label="表单权限"
              prop="privilege"
          >
            <AuthForm
                v-model="node.privilege"
                :form-id="formId"
            />
          </el-form-item>

        </el-tab-pane>
        <el-tab-pane
            key="executionListeners"
            name="executionListeners"
            label="任务监听"
        >
          <ExecutionListeners :node="node"/>
        </el-tab-pane>
        <el-tab-pane
            key="advancedSettings"
            name="advancedSettings"
            label="高级设置"
        >
          <ApproverConfigure v-model:configure="node.operations"/>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <DrawerFooter @close="onClose" @save="onSave"/>
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: 800;
}
</style>
