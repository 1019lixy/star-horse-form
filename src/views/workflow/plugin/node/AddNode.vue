<template>
  <div class="after-node-btn">
    <el-popover
        placement="right"
        ref="nodeRef"
        trigger="hover"
        aria-hidden="true"
        :popper-style="{ width: 'unset !important' }"
    >
      <template #reference>
        <!-- 当审批节点下添加意见分支,就不允许添加其他类型的节点了 -->
        <star-horse-icon
            icon-class="plus_circle"
            v-if="
            !readable &&
            (nodeType != FlowNodeEnums.APPROVER_NODE || (nodeType == FlowNodeEnums.APPROVER_NODE && node.addable))
          "
        />
      </template>
      <el-menu mode="vertical" class="flow-menu-vertical">
        <template v-for="item in nodeList">
          <el-menu-item :key="item.idFlowNode" @click="addNode(item)" v-if="checkVisible(item)">
            <star-horse-icon :icon-class="item.nodeIcon"/>
            <span>{{ item.nodeName }}</span>
            <help v-if="item.remark" :message="item.remark"/>
          </el-menu-item>
        </template>
      </el-menu>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {apiInstance, ApiUrls, createCondition, piniaInstance, SearchParams} from "star-horse-lowcode";
import {nodeInfoList, nodePrepList} from "@/views/workflow/plugin/utils/nodePreps";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums";

const nodeRef = ref();
const prepUrl: ApiUrls = apiInstance(
    "userdb-manage",
    "userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357"
);
defineOptions({
  name: "FlowNodeAdd"
});
const props = defineProps({
  node: {
    type: Object,
    default: {
      addable: true
    }
  },
  nodeType: {
    type: String,
    default: FlowNodeEnums.APPROVER_NODE
  },
  id: {
    type: String,
    default: ""
  },
  readable: {
    type: Boolean,
    default: false
  }
});
const flowDesign = useFlowDesignStore(piniaInstance);
const suggestBranchEnable = computed(() => flowDesign.suggestBranchEnable);
const parallelBranchEnable = computed(() => flowDesign.parallelBranchEnable);
// const node: ModelRef<any> = defineModel("node");
let commonPreps = computed(() => flowDesign.commonPreps);
let nodeList = nodeInfoList();
const checkVisible = (item: any) => {
  //nodeType == 1 && suggestBranchEnable
  if (item.nodeCode == FlowNodeEnums.SUGGEST_NODE) {
    if (props.nodeType != FlowNodeEnums.APPROVER_NODE || !suggestBranchEnable.value) {
      return false;
    }
  }
  //nodeType != 10 && parallelBranchEnable
  if (item.nodeCode == FlowNodeEnums.PARALLEL_NODE) {
    if (!parallelBranchEnable.value || props.nodeType == FlowNodeEnums.PARALLEL_SUB_NODE) {
      return false;
    }
  }
  return true;
};
const loadNodePrep = async (item: any) => {
  let prep = flowDesign.getPrepMap(item.idFlowNode);
  if (!prep) {
    let params: SearchParams[] = [createCondition("idFlowNode", item.idFlowNode)];
    let res = await prepUrl.queryConditionAction!(params);
    let temp: any = {};
    res?.data?.forEach((item: any) => {
      temp[item.attrName] = temp[item.defaultValue];
    });
    prep = temp;
    flowDesign.putNodePrepMap(item.idFlowNode, prep);
  }
  return prep;
};
const addNode = async (item: any) => {
  let currentNode = JSON.parse(JSON.stringify(commonPreps.value));
  let preps = await loadNodePrep(item);
  nodeRef.value.hide();
  let currentPreps: any = JSON.parse(JSON.stringify(nodePrepList(item.nodeCode)));
  currentNode = {...currentNode, ...currentPreps};
  if (preps && Object.keys(preps).length > 0) {
    currentNode = {...currentNode, ...preps};
  }
  currentNode["nodeId"] = item.idFlowNode;
  let parentNode = props.node;
  let nodeType = props.nodeType;
  let id = props.id;
  flowDesign.flowAddNode(currentNode, parentNode, nodeType, id);
  if (nodeType == FlowNodeEnums.APPROVER_NODE && item.nodeCode == FlowNodeEnums.SUGGEST_NODE) {
    // 当审批节点下添加意见分支,就不允许添加其他类型的节点了
    flowDesign.flowUpdateNode({currentNode, field: "addable", value: false});
  }
};
const init = async () => {
};
onMounted(() => {
  init();
});
</script>
