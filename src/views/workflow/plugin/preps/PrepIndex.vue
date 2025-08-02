<script setup lang="ts">
import {scale} from '@/views/workflow/plugin/utils/deviceUtil';
import {computed, ref, shallowRef} from 'vue';
import ApplyPrep from '@/views/workflow/plugin/preps/ApplyPrep.vue';
import ApprovalPrep from '@/views/workflow/plugin/preps/ApprovalPrep.vue';
import BranchPrep from '@/views/workflow/plugin/preps/BranchPrep.vue';
import CopyerPrep from '@/views/workflow/plugin/preps/CopyerPrep.vue';
import EventPrep from '@/views/workflow/plugin/preps/EventPrep.vue';
import NoticePrep from '@/views/workflow/plugin/preps/NoticePrep.vue';
import ServicePrep from '@/views/workflow/plugin/preps/ServicePrep.vue';
import TimerPrep from '@/views/workflow/plugin/preps/TimerPrep.vue';
import EndPrep from '@/views/workflow/plugin/preps/EndPrep.vue';
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon';
import {useFlowDesignStore} from '@/store/FlowDesign';
import {piniaInstance, StarHorseIcon} from 'star-horse-lowcode';

let headerStyle = ref<any>({
  background: 'linear-gradient(89.96deg,#fa6f32 .05%,#fb9337 79.83%)',
  'border-radius': '0px 0px 0 0',
});
const flowDesign = useFlowDesignStore(piniaInstance);
let activeNode = computed(() => flowDesign.currentNode);
let activePanel = computed(() => flowDesign.active);
const panels = shallowRef<any>({
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
      @click-outside="onClose"
      v-model="activePanel"
      @close="onClose"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="drawer-header">
        <div :id="titleId" :class="titleClass" class="flow-drawer-title">
          <EditName :node="activeNode"/>
        </div>
        <div class="flex items-center">
          <el-button
              style="
                  background: var(--star-horse-style);
                  color: var(--star-horse-white);
                "
              @click="fullScreenOperation"
              link
              v-if="!!isFullScreen "
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
              v-if="!isFullScreen "
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
        <star-horse-icon icon-class="close" color="var(--star-horse-white)" cursor="pointer" @click="close"/>
      </div>
    </template>
    <component :is="panels[activeNode.type]" :activeData="activeNode"/>
  </el-drawer>
</template>

<style scoped lang="scss">

:deep {
  .el-tabs__content {
    margin-top: 10px;
  }
}
</style>
