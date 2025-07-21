<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {piniaInstance, postRequest, useDesignFormStore, useGlobalConfigStore, warning,} from 'star-horse-lowcode';
import {Config} from '@/api/settings';

let configStore = useGlobalConfigStore(piniaInstance);
let designForm = useDesignFormStore(piniaInstance);
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let formData = computed(() => designForm.formData);
let compSize = computed(
  () => configStore.configFormInfo?.buttonSize || Config.compSize,
);
let tabName = ref<string>('vue3');
let pageInfo = ref<any>({});
const init = async () => {
  let dynameForm = formInfo.value;
  dynameForm!['relations'] =
    dynameForm['relations'] instanceof Array
      ? JSON.stringify(dynameForm['relations'])
      : dynameForm['relations'];
  dynameForm!['details'] = {};
  dynameForm!['details']['content'] = JSON.stringify(compList.value);
  dynameForm!['details']['fieldNames'] = JSON.stringify(formData.value);
  await postRequest(
    '/userdb-manage/userdb/dynamicForm/analysisFields',
    dynameForm,
  ).then((res: any) => {
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return;
    }
    pageInfo.value = res.data.data;
  });
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <div class="code-container">
    <el-tabs v-model="tabName">
      <el-tab-pane name="vue3" label="Vue3">
        <vue3 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize" />
      </el-tab-pane>
      <el-tab-pane name="vue2" label="Vue2">
        <vue2 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize" />
      </el-tab-pane>
      <el-tab-pane name="react" label="React">
        <react :formInfo="formInfo" :compList="pageInfo" :compSize="compSize" />
      </el-tab-pane>
      <el-tab-pane name="json" label="Json代码">
        <star-horse-json-editor :lang="'json'" v-model:value="compList" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped lang="scss">
.code-container {
  height: 100%;
  overflow: hidden;
}
</style>
