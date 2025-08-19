<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {scale} from "@/views/workflow/plugin/utils/deviceUtil";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  loadData,
  PageFieldInfo,
  piniaInstance,
  StarHorseDialog,
  StarHorseForm,
} from "star-horse-lowcode";

const dataUrl: ApiUrls = apiInstance(
    "flow-engine",
    "workflow/categoryItemConfig",
);
const flowDesign = useFlowDesignStore(piniaInstance);
const suggestBranchEnable = computed(() => flowDesign.suggestBranchEnable);
const parallelBranchEnable = computed(() => flowDesign.parallelBranchEnable);
const dynamicFlow = ref<boolean>(false);
let visibleHelper = ref<boolean>(false);
let visibleAdvice = ref<boolean>(false);
let visibleSelf = ref<boolean>(false);
const processVariablesRef = ref();
let processVariableVisible = ref<boolean>(false);
let placement = ref<string>("ltr");
let helpItemList = ref<any>([]);
let advancedItemList = ref<any>([]);
let selfItemList = ref<any>([]);
const wrapStyle = {
  top: "50px",
};
const processVariablesFields = reactive<PageFieldInfo>({
  fieldList: [],
  batchFieldList: [{
    batchName: "variables",
    fieldList: [
      [{
        label: "变量名称",
        formVisible: true,
        required: true,
        fieldName: "paramLabel",
      }, {
        label: "变量属性名",
        formVisible: true,
        required: true,
        fieldName: "paramName",
      }], [{
        label: "变量值类型",
        fieldName: "paramValueType",
        formVisible: true,
        required: true,
        type: "select",
        preps: {
          values: [{name: "字符串", value: "string"}, {name: "数字", value: "number"}, {
            name: "数组",
            value: "array"
          }, {name: "Json对象", value: "json"}]
        }
      }, {
        label: "默认值",
        formVisible: true,
        fieldName: "defaultValue",
      }], [{
        label: "变量类型",
        type: "radio",
        formVisible: true,
        defaultValue: "process",
        fieldName: "type",
        preps: {
          values: [{name: "流程变量", value: "process"}, {name: "任务变量", value: "task"}]
        }
      }, {
        label: "是否内置变量",
        type: "radio",
        formVisible: true,
        defaultValue: "inner",
        fieldName: "systemFlag",
        preps: {
          values: [{name: "内置变量", value: "inner"}, {name: "扩展变量", value: "extend"}]
        }
      }]],
  }],
});
const processVariables = computed(() => flowDesign.processVariables);
const outerFormData = ref<any>({});
const showHelperDrawer = () => {
  visibleHelper.value = true;
};
const showAdviceDrawer = () => {
  visibleAdvice.value = true;
};
const showSelfDrawer = () => {
  visibleSelf.value = true;
};
const editProcessVariable = () => {
  outerFormData.value = {
    variables: processVariables.value,
  };
  processVariableVisible.value = true;
};
const submitVariable = () => {
  processVariablesRef.value.validate().then((res: boolean) => {
    if (res) {
      const formData: any = processVariablesRef.value.getFormData().value;
      flowDesign.setProcessVariables(formData["variables"]);
      onClose();
    }
  });
};
const onClose = () => {
  visibleHelper.value = false;
  visibleAdvice.value = false;
  visibleSelf.value = false;
  processVariableVisible.value = false;
};
const init = async () => {
  let params = [createCondition("a.cfgCategory", ["help", "advanced"], "in")];
  let res = await loadData(dataUrl.listConditionUrl!, params);
  helpItemList.value = res?.data?.filter(
      (item: any) => item.cfgCategory == "help",
  );
  advancedItemList.value = res?.data?.filter(
      (item: any) => item.cfgCategory == "advanced",
  );
};
onMounted(() => {
  init();
});
</script>
<template>
  <star-horse-dialog :dialogVisible="processVariableVisible" @merge="submitVariable" @closeAction="onClose"
                     :selfFunc="true" compSize="default"
                     :title="'配置流程变量'">
    <star-horse-form :outerFormData="outerFormData" :fieldList="processVariablesFields" ref="processVariablesRef"/>
  </star-horse-dialog>
  <div class="flow-helper" id="flow-helper">
    <div class="flow-helper-variable" @click="editProcessVariable">
      <star-horse-icon icon-class="setting" size="22px"/>
      <span class="flow-helper-title">流程变量</span>
      <star-horse-icon icon-class="arrow-right" size="16px"/>
    </div>
    <div class="flow-helper-template" @click="showHelperDrawer">
      <star-horse-icon icon-class="template" size="22px"/>
      <span class="flow-helper-title">系统模板</span>
      <star-horse-icon icon-class="arrow-right" size="16px"/>
    </div>
    <div class="flow-helper-strengthen" @click="showAdviceDrawer">
      <star-horse-icon icon-class="advanced_template" size="22px"/>
      <span class="flow-helper-title">高级模板</span>
      <star-horse-icon icon-class="arrow-right" size="16px"/>
    </div>
    <div class="flow-helper-self" @click="showSelfDrawer">
      <star-horse-icon icon-class="self_template" size="22px"/>
      <span class="flow-helper-title">自定义模板</span>
      <star-horse-icon icon-class="arrow-right" size="16px"/>
    </div>
    <el-drawer
        :direction="placement"
        getContainer="flow-helper"
        :wrapStyle="wrapStyle"
        :size="scale.isMobile() ? '100%' : '300px'"
        :with-header="false"
        v-model="visibleHelper"
        @close="onClose"
    >
      <div class="flow-helper-drawer-header">
        <div class="flow-helper-drawer-header-title">流程助手</div>
        <div class="flow-helper-drawer-header-content">
          一键启用精选流程模板，提升效率
        </div>
      </div>

      <el-popover
          placement="right"
          trigger="hover"
          :popper-style="{ width: 'unset !important' }"
          v-for="item in helpItemList"
          :key="item.idCategoryItemConfig"
      >
        <template #reference>
          <div class="flow-helper-drawer-item">
            <div class="flow-helper-drawer-item-icon">
              <star-horse-icon
                  icon-class="flow_temp_icon"
                  size="22px"
                  boxShow="true"
              />
            </div>
            <div>
              <div class="flow-helper-drawer-item-title">{{ item.name }}</div>
              <div class="flow-helper-drawer-item-content">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>
        <img class="flow-helper-drawer-item-popover-img" :src="item.imageUrl"/>
      </el-popover>
    </el-drawer>

    <el-drawer
        :direction="placement"
        getContainer="flow-helper"
        :wrapStyle="wrapStyle"
        :size="scale.isMobile() ? '100%' : '300px'"
        :with-header="false"
        v-model="visibleAdvice"
        @close="onClose"
    >
      <div class="flow-helper-drawer-header">
        <div class="flow-helper-drawer-header-title">流程增强</div>
        <div class="flow-helper-drawer-header-content">
          提升审批流程灵活性，满足复杂业务场景
        </div>
      </div>
      <el-divider/>
      <div class="flow-helper-drawer-row">
        <span class="flow-helper-drawer-row-title">动态流程</span>
        <el-switch v-model="dynamicFlow"/>
      </div>
      <div class="flow-helper-drawer-row" style="margin-top: 10px">
        <span class="flow-helper-drawer-row-title">意见分支</span>
        <el-switch v-model="suggestBranchEnable"/>
      </div>
      <div class="flow-helper-drawer-row" style="margin-top: 10px">
        <span class="flow-helper-drawer-row-title">并行节点</span>
        <el-switch v-model="parallelBranchEnable"/>
      </div>
      <div class="flow-helper-drawer-row">
        <p class="flow-helper-drawer-row-foot-text">
          并行节点可在添加节点时使用
        </p>
      </div>
      <el-popover
          placement="right"
          trigger="hover"
          :popper-style="{ width: 'unset !important' }"
          v-for="item in advancedItemList"
          :key="item.idCategoryItemConfig"
      >
        <template #reference>
          <div class="flow-helper-drawer-item">
            <div class="flow-helper-drawer-item-icon">
              <star-horse-icon
                  :iconClass="item.icon || 'document'"
                  :style="item.style"
                  boxShow="true"
              />
            </div>
            <div>
              <div class="flow-helper-drawer-item-title">{{ item.name }}</div>
              <div class="flow-helper-drawer-item-content">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>
        <img class="flow-helper-drawer-item-popover-img" :src="item.imageUrl"/>
      </el-popover>
    </el-drawer>
    <el-drawer
        :direction="placement"
        getContainer="flow-helper"
        :wrapStyle="wrapStyle"
        :size="scale.isMobile() ? '100%' : '300px'"
        :with-header="false"
        v-model="visibleSelf"
        @close="onClose"
    >
      <div class="flow-helper-drawer-header">
        <div class="flow-helper-drawer-header-title">自定义模板</div>
        <div class="flow-helper-drawer-header-content">提升流程设计效率</div>
      </div>

      <el-popover
          placement="right"
          trigger="hover"
          :popper-style="{ width: 'unset !important' }"
          v-for="item in selfItemList"
          :key="item.idCategoryItemConfig"
      >
        <template #reference>
          <div class="flow-helper-drawer-item">
            <div class="flow-helper-drawer-item-icon">
              <star-horse-icon
                  :iconClass="item.icon || 'document'"
                  :style="item.style"
                  boxShow="true"
              />
            </div>
            <div>
              <div class="flow-helper-drawer-item-title">{{ item.name }}</div>
              <div class="flow-helper-drawer-item-content">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>
        <img class="flow-helper-drawer-item-popover-img" :src="item.imageUrl"/>
      </el-popover>
    </el-drawer>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-popper),
:deep(.el-popover) {
  width: 100% !important;
}
</style>
