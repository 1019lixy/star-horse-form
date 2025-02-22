<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }"
           @click.stop="selectNode">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name"
               :class="nameClass(node, node.type == FlowNodeEnums.APPROVER_NODE ? 'node-sp' : 'node-transact')">
            <EditName :node="node"/>
            <star-horse-icon icon-class="audit_node" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              {{ node.type == FlowNodeEnums.APPROVER_NODE ? '审批人' : '办理人' }}:
              <el-tooltip placement="top" :content="node.content">
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">设置此节点</span>
          </div>
          <!-- 错误提示 -->
          <el-tooltip :content="node.errorMsg" placement="top" v-if="node.error">
            <star-horse-icon icon-class="exclamation-circle" theme="filled" class="node-error"/>
          </el-tooltip>
          <div v-if="!readable && !node.deletable" class="close-icon">
            <star-horse-icon iconClass="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- <div class="flow-node-toolbar">
            <star-horse-icon iconClass="copy" @click.stop="node.deletable = true" />
          </div> -->
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <!-- 如果子节点是意见分支,则只能添加一个意见分支 -->
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/node/AddNode.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, onMounted, ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'ApprovalNode',
});
const flowDesign = useFlowDesign(piniaInstance);
let currentNode = computed(() => flowDesign.currentNode);
const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  readable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['selectNode']);
props.node.error = computed(() => {
  let flag = false;
  let msg = "";
  if (!props.node.approveGroups
      || !props.node.approveGroups.length
      || !props.node.approveGroups[0].approveType
      || !props.node.approveGroups[0].approverIds?.length) {
    flag = true;
    msg += "未配置审批人";
  }
  props.node.errorMsg = msg;
  return flag;
});
const selectNode = () => {
  emits('selectNode', props.node);
}
let nameClass = computed(() => {
  return (node: any, defaultStyle: string) => {
    if (node.statusCode == -1) {
      return defaultStyle;
    }
    return {
      'node-status-not': node.statusCode == 0,
      'node-status-current': node.statusCode == 1,
      'node-status-complete': node.statusCode == 2
    };
  };
});
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(() => {
  init();
})
</script>
