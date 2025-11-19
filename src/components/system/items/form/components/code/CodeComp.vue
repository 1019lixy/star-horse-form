<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {piniaInstance, postRequest, useDesignFormStore, warning,} from "star-horse-lowcode";
import {FormConfig} from "@/components/types/FormConfig";

const props = defineProps<{
  optional: FormConfig
}>();
let designForm = useDesignFormStore(piniaInstance);
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let formData = computed(() => designForm.formData);
let compSize = computed(() => props.optional?.compSize ?? "default");
let tabName = ref<string>("vue3");
let pageInfo = ref<any>({});
const init = async () => {
  let dynameForm = formInfo.value;
  dynameForm!["relations"] =
      dynameForm["relations"] instanceof Array
          ? JSON.stringify(dynameForm["relations"])
          : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(compList.value);
  dynameForm!["details"]["fieldNames"] = JSON.stringify(formData.value);
  if (props.optional?.api?.basePrefix) {
    await postRequest(
        `${props.optional?.api?.basePrefix}/analysisFields`,
        dynameForm,
    ).then((res: any) => {
      if (res.data.code != 0) {
        warning(res.data.cnMessage);
        return;
      }
      pageInfo.value = res.data.data;
    });
  }
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <el-tabs v-model="tabName" type="border-card">
    <el-tab-pane name="vue3" label="Vue3">
      <vue3 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="vue2" label="Vue2">
      <vue2 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="react" label="React">
      <react :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="json" label="Json代码">
      <star-horse-json-editor :lang="'json'" v-model="compList"/>
    </el-tab-pane>
  </el-tabs>
</template>
<style scoped lang="scss">
.code-container {
  height: 100%;
  overflow: hidden;
}
</style>
