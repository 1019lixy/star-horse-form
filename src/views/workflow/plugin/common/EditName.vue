<template>
  <div class="node-name-title">
    <div v-if="!isInput" @click.stop="clickEvent()">
      <star-horse-icon icon-class="data_edit" size="16px" color="var(--star-horse-white)"/>
      {{ dataValue }}
    </div>
    <el-input v-if="isInput" type="text" @blur="blurEvent()" @focus="$event.target.select()" autofocus
              v-model="dataValue" :style="{ width: width }"/>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

const props = defineProps({
  value: {
    type: String,
    required: false,
  },
  width: {
    type: String,
    required: false,
    default: '100%',
  },
});
let dataValue = defineModel("nodeName");
let isInput = ref<boolean>(false);
const clickEvent = () => {
  isInput.value = true;
}
const blurEvent = () => {
  isInput.value = false;
}
</script>
