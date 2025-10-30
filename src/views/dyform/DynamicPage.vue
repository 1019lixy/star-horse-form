<script lang="ts" setup name="DynamicPage">
import {onMounted, ref, watch} from "vue";
import StarHorseFlexComp from "@/components/StarHorseFlexComp.vue";
import {useRoute, useRouter} from "vue-router";

let route = useRoute();
const router = useRouter();
const flexCompRef = ref();
const init = () => {

};
const loadData = (query: any) => {
  if (!query?.pageId) return;
  console.log(query);
};
onMounted(() => {
  init();
});
watch(() => route.query, (query) => {
  loadData(query);
}, {immediate: true});
onBeforeUnmount(() => {
  flexCompRef.value?.reset();
});
</script>
<template>
  <StarHorseFlexComp ref="flexCompRef"/>
</template>

<style lang="scss" scoped>

</style>
