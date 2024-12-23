<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item flow-node-branch">
        <div class="flow-branch-suggest">
          <div class="node-name">
            <EditName v-model:nodeName="node.name" style="width: 90%"/>
            <star-horse-icon icon-class="parallel_node" style="margin-left: 10px"/>
          </div>
          <!--  <div class="close-icon"><star-horse-icon  iconClass="close" @click.stop="!read && delNode(node)" /></div> -->
        </div>
      </div>
      <!-- 如果子节点是意见分支,则只能添加一个意见分支 -->
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
    <FlowApproverSetting ref="flowApproverSetting" @close="close"/>
  </div>
</template>
<script setup lang="ts">
import {close} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import {ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

const flowApproverSetting = ref();
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
  }
});
</script>
