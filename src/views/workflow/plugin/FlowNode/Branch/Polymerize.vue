<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item flow-node-branch">
        <div class="flow-branch-suggest">
          <div class="node-name">
            <EditName v-model="node.name" style="width: 90%" />
            <img :src="flowMixin.parallelIcon" style="margin-left: 10px;" />
          </div>
          <!--  <div class="close-icon"><star-horse-icon  iconClass="close" @click.stop="!read && delNode(node)" /></div> -->
        </div>
      </div>
      <!-- 如果子节点是意见分支,则只能添加一个意见分支 -->
      <FlowAddNode :node.sync="node" :nodeType="node.type" :readable="readable" />
    </div>
    <FlowApproverSetting ref="flowApproverSetting" @close="flowMixin.isActive = false" />
  </div>
</template>
<script setup lang="ts">
  import { flowMixin } from '@/views/workflow/plugin/mixins/flowMixin';
  import FlowAddNode from '../Add/index.vue';
  import FlowApproverSetting from '../../FlowDrawer/Approver/index.vue';
  import EditName from '@/views/workflow/plugin/Common/EditName.vue';
  const props=defineProps({
    node: {
      type: Object,
      default: function() {
        return {};
      },
    },
    readable: {
      type: Boolean,
      default: false,
    }
  });
</script>
