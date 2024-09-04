<template>
  <div :style="{height:scale.isMobile() ? '5px' : '50px'}"></div>
  <div class="flow-drawer-footer" :style="{ 'text-align': scale.isMobile() ? 'center' : 'left'}">
    <el-button type="primary" :size="flowMixin.size" :style="{ marginRight: '8px' }" @click="onSave">
      保存
    </el-button>
    <el-button :size="flowMixin.size" @click="onClose">
      取消
    </el-button>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {scale} from '@/views/workflow/plugin/util/deviceUtil';

const emits = defineEmits(["save", "close"]);
const onSave = () => {
  emits('save');
}
const onClose = () => {
  emits('close');
}
</script>
