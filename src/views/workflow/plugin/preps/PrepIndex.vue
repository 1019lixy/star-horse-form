<script setup lang="ts">
import {scale} from '@/views/workflow/plugin/utils/deviceUtil';
import {computed, ref} from 'vue';
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
import {piniaInstance} from 'star-horse-lowcode';

let headerStyle = ref<any>({
  background: 'linear-gradient(89.96deg,#fa6f32 .05%,#fb9337 79.83%)',
  'border-radius': '0px 0px 0 0',
});
const flowDesign = useFlowDesignStore(piniaInstance);
let activeNode = computed(() => flowDesign.currentNode);
let activePanel = computed(() => flowDesign.active);
const panels = ref<any>({
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

const onClose = () => {
  flowDesign.setActive(false);
};
</script>

<template>
  <el-drawer
    :width="scale.isMobile() ? '100%' : '40%'"
    :headerStyle="headerStyle"
    :bodyStyle="flowCommon.bodyStyle"
    placement="right"
    :closable="true"
    @click-outside="onClose"
    v-model="activePanel"
    @close="onClose"
  >
    <template #header>
      <div class="drawer-header">
        <!--        <star-horse-icon icon-class="audit_node" color="#fff" style="margin-left: 10px"/>-->
        <div class="flow-drawer-title">
          <EditName :node="activeNode" />
        </div>
      </div>
    </template>
    <component :is="panels[activeNode.type]" :activeData="activeNode" />
  </el-drawer>
</template>

<style scoped lang="scss">
:deep(.el-tabs__content) {
  margin-top: 10px;
}
</style>
