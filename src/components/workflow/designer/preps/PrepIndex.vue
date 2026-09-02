<script setup lang="ts">
import { scale } from "@/components/workflow/utils/deviceUtil";
import { computed, ref, shallowRef } from "vue";
import ApplyPrep from "@/components/workflow/designer/preps/ApplyPrep.vue";
import ApprovalPrep from "@/components/workflow/designer/preps/ApprovalPrep.vue";
import BranchPrep from "@/components/workflow/designer/preps/BranchPrep.vue";
import CopyerPrep from "@/components/workflow/designer/preps/CopyerPrep.vue";
import EventPrep from "@/components/workflow/designer/preps/EventPrep.vue";
import NoticePrep from "@/components/workflow/designer/preps/NoticePrep.vue";
import ServicePrep from "@/components/workflow/designer/preps/ServicePrep.vue";
import TimerPrep from "@/components/workflow/designer/preps/TimerPrep.vue";
import EndPrep from "@/components/workflow/designer/preps/EndPrep.vue";
import StartPrep from "@/components/workflow/designer/preps/StartPrep.vue";
import { flowCommon } from "@/components/workflow/utils/flowCommon";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance, StarHorseIcon } from "star-horse-lowcode";

let headerStyle = ref<any>({
  background: "linear-gradient(89.96deg,#fa6f32 .05%,#fb9337 79.83%)",
  "border-radius": "0px 0px 0 0",
});
const flowDesign = useFlowDesignStore(piniaInstance);
let activeNode = computed(() => flowDesign.currentNode);
let activePanel = computed(() => flowDesign.active);
const panels = shallowRef<any>({
  StartNode: StartPrep,
  ApplyNode: ApplyPrep,
  ApprovalNode: ApprovalPrep,
  HandleNode: ApprovalPrep,
  CopyerNode: CopyerPrep,
  TimerNode: TimerPrep,
  NoticeNode: NoticePrep,
  ConditionNode: BranchPrep,
  ParallelSubNode: BranchPrep,
  EventNode: EventPrep,
  ServiceNode: ServicePrep,
  EndNode: EndPrep,
});
const drawerWidth = ref(40); // 添加宽度响应式变量

// 拖拽逻辑
let isFullScreen = false;

const fullScreenOperation = () => {
  if (isFullScreen) {
    drawerWidth.value = 40;
  } else {
    drawerWidth.value = 50;
  }
  isFullScreen = !isFullScreen;
};

const onClose = () => {
  flowDesign.setActive(false);
};
</script>

<template>
  <el-drawer
    :size="scale.isMobile() ? '100%' : `${drawerWidth}%`"
    :headerStyle="headerStyle"
    :bodyStyle="flowCommon.bodyStyle"
    placement="right"
    :show-close="false"
    :z-index="1999"
    @click-outside="onClose"
    v-model="activePanel"
    @close="onClose"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="drawer-header">
        <div :id="titleId" :class="titleClass" class="flow-drawer-title">
          <EditName :node="activeNode" />
        </div>
        <div class="flex items-center">
          <el-button
            style="
              background: var(--star-horse-style);
              color: var(--star-horse-white);
            "
            @click="fullScreenOperation"
            link
            v-if="!!isFullScreen"
            :title="''"
          >
            <star-horse-icon
              icon-class="fullscreen-shrink"
              color="var(--star-horse-white)"
              cursor="pointer"
            />
          </el-button>
          <el-button
            style="
              background: var(--star-horse-style);
              color: var(--star-horse-white);
            "
            @click="fullScreenOperation"
            v-if="!isFullScreen"
            link
            :title="''"
          >
            <star-horse-icon
              icon-class="fullscreen-expand"
              color="var(--star-horse-white)"
              cursor="pointer"
            />
          </el-button>
        </div>
        <star-horse-icon
          icon-class="close"
          color="var(--star-horse-white)"
          cursor="pointer"
          @click="close"
        />
      </div>
    </template>
    <div class="drawer-body flex flex-col flex-1 w-full h-full">
      <el-scrollbar>
        <div class="drawer-body-content">
          <component :is="panels[activeNode.type]" :activeData="activeNode" />
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.drawer-body-content {
  padding-bottom: 60px;
}
:deep {
  .el-tabs__content {
    margin-top: 10px;
  }
}
</style>
