<script setup lang = "ts">
import {ref} from 'vue'
import CodeJs6 from "./CodeJs6.vue";

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>
  <code-js6/>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
