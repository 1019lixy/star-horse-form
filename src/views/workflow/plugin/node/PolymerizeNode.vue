<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item flow-node-branch" @click.stop="selectNode">
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
  </div>
</template>
<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/node/AddNode.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import {onMounted} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {closeLoad} from "@/api/sh_api.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {warning} from "@/utils/message.ts";

const flowDesign = useFlowDesign(piniaInstance);
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
const emits=defineEmits(['selectNode']);
const selectNode = () => {
  warning("该节点无法编辑");
  // emits('selectNode',props.node);
}
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(() => {
  init();
})
</script>
