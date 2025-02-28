<template>
  <div class="node-name-title">
    <div v-if="!isInput" @click.stop="clickEvent()" class="flex">
      <star-horse-icon
        icon-class="data_edit"
        size="16px"
        :color="node.type == 'ConditionNode' ? '' : 'var(--star-horse-white)'"
      />
      {{ node.name }}
    </div>
    <el-input
      v-if="isInput"
      type="text"
      @blur="blurEvent()"
      @focus="$event.target.select()"
      autofocus
      v-model="node.name"
      :style="{ width: width }"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref } from "vue";
  import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

  defineProps({
    node: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      required: false,
      default: "100%"
    }
  });
  let isInput = ref<boolean>(false);
  const clickEvent = () => {
    isInput.value = true;
  };
  const blurEvent = () => {
    isInput.value = false;
  };
</script>
