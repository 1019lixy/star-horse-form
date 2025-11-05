<script setup lang="ts">
import { PageFieldInfo, piniaInstance } from "star-horse-lowcode";
import { computed, reactive, ref, unref } from "vue";
import { useFlowDesignStore } from "@/store/FlowDesign.js";

interface BasePrepProps {
  source: any;
  dataForm: boolean;
}

const props = withDefaults(defineProps<BasePrepProps>(), {
  source: 1,
  dataForm: true,
});
const flowDesign = useFlowDesignStore(piniaInstance);
const signHelpMsg = `
  assigneeList：多实例用户集合变量\n
nrOfInstances：实例总数\n
nrOfActiveInstances：当前活动的（即未完成的），实例数量。对于顺序多实例，这个值总为1\n
nrOfCompletedInstances：已完成的实例数量\n
multiNumOfInstances：实例总数（多实例节点后使用这个变量判断）\n
multiAgreeCount：同意实例数量\n
multiRefuseCount：拒绝实例数量\n
multiAbstainCount：弃权实例数量\n
`;
const nodeInfo = defineModel("nodeInfo");
const basePrepRef = ref();
const processVariables = computed(() => flowDesign.processVariables);
const basePrepField = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "任务ID",
      fieldName: "id",
      formVisible: true,
      preps: {
        disabled: true,
      },
    },
    {
      label: "任务名称",
      fieldName: "name",
      formVisible: true,
    },
    {
      label: "任务变量",
      type: "select",
      fieldName: "taskVariables",
      formVisible: true,
      preps: {
        multiple: true,
        values: unref(processVariables),
        props: {
          label: "paramLabel",
          value: "paramName",
        },
      },
    },
  ],
});
</script>
<template>
  <el-scrollbar height="100%">
    <star-horse-form-item
      ref="basePrepRef"
      :fieldList="basePrepField"
      :dataIndex="0"
      compSize="default"
      v-model:dataForm="nodeInfo"
    />
  </el-scrollbar>
</template>
