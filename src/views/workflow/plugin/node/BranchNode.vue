<script setup lang="ts">
import { addBranch } from "@/views/workflow/plugin/utils/flowCommon";
import { computed, onMounted, watch } from "vue";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { closeLoad, piniaInstance } from "star-horse-lowcode";
import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums";

defineOptions({
  name: "BranchNode",
});
const flowDesign = useFlowDesignStore(piniaInstance);
let currentNode = computed(() => flowDesign.currentNode);
const props = defineProps({
  node: {
    type: Object,
    default: {},
  },
  readable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["selectNode"]);
const selectNode = (node: any) => {
  emits("selectNode", node, props.node);
};
let nameClass = computed(() => {
  return (node: any, defaultStyle: string) => {
    if (node.statusCode == -1) {
      return defaultStyle;
    }
    return {
      "node-status-not": node.statusCode == 0,
      "node-status-current": node.statusCode == 1,
      "node-status-complete": node.statusCode == 2,
    };
  };
});
const errorCheck = () => {
  props.node.conditionNodes.forEach((conditionNode: any) => {
    let flag = false;
    let msg = "";
    if (conditionNode.otherFlag) {
      conditionNode.error = false;
      conditionNode.errorMsg = "";
      return;
    }
    if (!conditionNode.branchType) {
      flag = true;
      msg += "未配置条件规则\n";
    }
    if (
      !conditionNode.conditionGroups ||
      !conditionNode.conditionGroups.length
    ) {
      flag = true;
      msg += "未配置条件\n";
    } else {
      conditionNode.conditionGroups.forEach((condition: any, index: number) => {
        condition.conditions.forEach((condition: any, sindex: number) => {
         /* if (!condition.columnName) {
            flag = true;
            msg += `条件${index}未配置条件字段\n`;
          }*/
          if (!condition.optType) {
            flag = true;
            msg += `条件${index}未配置条件操作符\n`;
          }
          if (!condition.valueType) {
            flag = true;
            msg += `条件${index}未配置条件值类型\n`;
          }
        });
      });
    }
    conditionNode.error = flag;
    conditionNode.errorMsg = msg;
  });
};
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
};
onMounted(() => {
  init();
});
watch(
  () => props.node.conditionNodes,
  () => {
    errorCheck();
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <div class="flow-row">
    <div class="flow-branch">
      <div class="branch-node" @click="!readable && addBranch(node)">
        <el-button icon="plus">添加条件</el-button>
      </div>
      <div
        class="flow-col"
        v-for="(conditionNode, index) in node.conditionNodes"
        :key="conditionNode.id"
      >
        <div class="clear-left-border" v-if="index == 0"></div>
        <div
          class="clear-right-border"
          v-if="node.conditionNodes.length - 1 == index"
        ></div>
        <div class="flow-row">
          <div class="flow-box">
            <!-- 其他情况不支持配置 -->
            <div
              class="flow-item flow-node-branch"
              :class="{
                'flow-item-active': currentNode.id == conditionNode.id,
              }"
              @click.stop="
                !readable &&
                node.conditionNodes.length - 1 != index &&
                selectNode(conditionNode)
              "
            >
              <div
                class="flow-node-box"
                :class="{ 'has-error': conditionNode.error }"
              >
                <div
                  class="node-name"
                  :class="nameClass(conditionNode, 'node-sub-branch')"
                >
                  <EditName
                    :node="conditionNode"
                    @edit="
                      (showPriorityLevel: boolean) =>
                        (conditionNode.showPriorityLevel = showPriorityLevel)
                    "
                  />
                  <div
                    class="node-name-level"
                    v-if="conditionNode.showPriorityLevel"
                  >
                    优先{{ conditionNode.priorityLevel }}
                  </div>
                  <star-horse-icon
                    icon-class="branch_node"
                    style="margin-left: 5px"
                  />
                </div>
                <div class="node-main">
                  <span v-if="conditionNode.content">
                    <el-tooltip
                      placement="top"
                      :content="conditionNode.content"
                    >
                      {{ conditionNode.content }}
                    </el-tooltip>
                  </span>
                  <span v-else class="hint-title">配置筛选条件</span>
                </div>
                <!-- 错误提示 -->
                <el-tooltip
                  :content="conditionNode.errorMsg"
                  placement="top"
                  v-if="conditionNode.error"
                >
                  <star-horse-icon
                    icon-class="exclamation-circle"
                    theme="filled"
                    class="node-error"
                  />
                </el-tooltip>
                <!-- 删除按钮,其他情况不支持删除 -->
                <div
                  v-if="
                    !readable &&
                    !conditionNode.deletable &&
                    !conditionNode.otherFlag
                  "
                  class="close-icon"
                >
                  <star-horse-icon
                    iconClass="close"
                    @click.stop="conditionNode.deletable = true"
                  />
                </div>
                <!-- 删除提示 -->
                <DeleteConfirm :node="conditionNode" />
              </div>
            </div>
            <AddNode
              :node="node"
              :nodeType="FlowNodeEnums.BRANCH_CONDITION_NODE"
              :id="conditionNode.id"
              :readable="readable"
            />
          </div>
        </div>
        <FlowNode
          v-if="
            conditionNode.childNode &&
            conditionNode.childNode.hasOwnProperty('name')
          "
          :node="conditionNode.childNode"
          :readable="readable"
        />
      </div>
    </div>
    <div class="after-branch-btn">
      <AddNode
        :node="node"
        :nodeType="FlowNodeEnums.BRANCH_NODE"
        :readable="readable"
      />
    </div>
  </div>
</template>
