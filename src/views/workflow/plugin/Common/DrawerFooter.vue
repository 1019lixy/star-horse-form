<template>
  <div class="flow-ant-drawer-footer" :style="{ 'text-align': scale.isMobile() ? 'center' : 'left'}">
    <a-button type="primary" :size="flowMixin.size" :style="{ marginRight: '8px' }" @click="onSave">
      保存
    </a-button>
    <a-button :size="flowMixin.size" @click="onClose">
      取消
    </a-button>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '../mixins/flowMixin';
import {scale} from '../util/deviceUtil';

const emits = defineEmits(["save", "close"]);
const onSave = () => {
  emits('save');
}
const onClose = () => {
  emits('close');
}
</script>
