<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id == node.id }" @click.stop="selectNode">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-temmi')">
            <EditName :node="node" />
            <star-horse-icon icon-class="event" style="margin-left: 10px" />
          </div>
          <div class="node-main">
            <span v-if="node.content">
              事件:
              <el-tooltip placement="top" :content="node.content">
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">默认无事件</span>
          </div>
          <!-- 错误提示 -->
          <el-tooltip :content="node.errorMsg" placement="top" v-if="node.error">
            <star-horse-icon icon-class="exclamation-circle" theme="filled" class="node-error" />
          </el-tooltip>
          <!-- 只有是填写节点才能删除，发起节点不能删除 -->
          <div v-if="!readable && !node.deletable && node.type == FlowNodeEnums.EVENT_NODE" class="close-icon">
            <star-horse-icon icon-class="close" @click.stop="node.deletable = true" />
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node" />
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import FlowAddNode from "@/views/workflow/plugin/node/AddNode.vue";
  import { computed, onMounted } from "vue";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import piniaInstance from "@/store";
  import { closeLoad } from "@/api/star_horse_utils.ts";
  import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
  import EditName from "@/views/workflow/plugin/common/EditName.vue";
  import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
  import DeleteConfirm from "@/views/workflow/plugin/common/DeleteConfirm.vue";

  defineOptions({
    name: "FlowNodeEvent"
  });
  const flowDesign = useFlowDesignStore(piniaInstance);
  let currentNode = computed(() => flowDesign.currentNode);
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
