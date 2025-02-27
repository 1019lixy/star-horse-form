<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {GlobalConfig} from '@/store/GlobalConfigStore.ts';
import piniaInstance from '@/store';
import {DesignForm} from '@/store/DesignFormStore.ts';
import Vue3 from '@/views/dyform/code/Vue3.vue';
import Vue2 from '@/views/dyform/code/Vue2.vue';
import React from '@/views/dyform/code/React.vue';
import {postRequest} from '@/api/star_horse.ts';
import {warning} from '@/utils/message.ts';
import {Config} from '@/api/settings.ts';

let configStore = GlobalConfig(piniaInstance);
let designForm = DesignForm(piniaInstance);
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let formData = computed(() => designForm.formData);
let compSize = computed(() => configStore.configFormInfo?.buttonSize || Config.compSize);
let tabName = ref<string>('vue3');
let pageInfo = ref<any>({});
const init = async () => {
  let dynameForm = formInfo.value;
  dynameForm!['relations'] = (dynameForm['relations'] instanceof Array) ? JSON.stringify(dynameForm['relations']) : dynameForm['relations'];
  dynameForm!['details'] = {};
  dynameForm!['details']['content'] = JSON.stringify(compList.value);
  dynameForm!['details']['fieldNames'] = JSON.stringify(formData.value);
  await postRequest('/userdb-manage/userdb/dynamicForm/analysisFields', dynameForm).then((res: any) => {
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
        <vue3 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
      </el-tab-pane>
      <el-tab-pane name="vue2" label="Vue2">
        <vue2 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
      </el-tab-pane>
      <el-tab-pane name="react" label="React">
        <react :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
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
