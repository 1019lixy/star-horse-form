<script lang="ts" setup>

import RuleDesigner from "@/components/rule/RuleDesigner.vue";
import { uuid } from "star-horse-lowcode";

const currentRuleId = uuid();
</script>

<template>
  <RuleDesigner
    :rule-id="currentRuleId"
  />
</template>

<style scoped lang="scss">

</style>