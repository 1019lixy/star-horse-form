<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" @click.stop="selectNode">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          分隔
          <div v-if="!readable" class="close-icon">
            <star-horse-icon iconClass="close" />
          </div>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.SUGGEST_NODE" :readable="readable" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import FlowAddNode from "@/views/workflow/plugin/node/AddNode.vue";
  import { computed, onMounted } from "vue";
  import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
  import { closeLoad } from "@/api/star_horse_utils.ts";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import {piniaInstance} from "star-horse-lowcode";

  defineOptions({
    name: "DivideNode"
  });
  const flowDesign = useFlowDesignStore(piniaInstance);
  const props = defineProps({
    node: {
      type: Object,
      default: function () {
        return {};
      }
    },
    readable: {
      type: Boolean,
      default: false
    }
  });

  const emits = defineEmits(["selectNode"]);
  const selectNode = () => {
    emits("selectNode", props.node);
  };
  let nameClass = computed(() => {
    return (node: any, defaultStyle: string) => {
      if (node.statusCode == -1) {
        return defaultStyle;
      }
      return {
        "node-status-not": node.statusCode == 0,
        "node-status-current": node.statusCode == 1,
        "node-status-complete": node.statusCode == 2
      };
    };
  });
  const init = () => {
    closeLoad();
    flowDesign.refreshMap();
  };
  onMounted(() => {
    init();
  });
</script>
