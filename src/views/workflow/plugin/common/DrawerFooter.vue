<template>
  <div :style="{ height: scale.isMobile() ? '5px' : '50px' }"></div>
  <div class="flow-drawer-footer" :style="{ 'text-align': scale.isMobile() ? 'center' : 'left' }">
    <el-button type="primary" :size="flowCommon.size" :style="{ marginRight: '8px' }" @click="onSave">
      <star-horse-icon icon-class="save" color="var(--star-horse-white)" />
      保存
    </el-button>
    <el-button :size="flowCommon.size" link @click="onClose">
      <star-horse-icon icon-class="cancel" />
      取消
    </el-button>
  </div>
</template>
<script setup lang="ts">
  import { flowCommon } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import { scale } from "@/views/workflow/plugin/utils/deviceUtil";
  import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

  const emits = defineEmits(["save", "close"]);
  const onSave = () => {
    emits("save");
  };
  const onClose = () => {
    emits("close");
  };
</script>
