<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {analysisCompDatas, error, piniaInstance, success, useDesignFormStore} from "star-horse-lowcode";
import {FormConfig} from "@/components/types/FormConfig";

const props = defineProps<{
  optional: FormConfig;
}>();
let designForm = useDesignFormStore(piniaInstance);
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let compSize = computed(() => props.optional?.compSize ?? "default");
let tabName = ref<string>("vue3");
let pageInfo = ref<any>({});
const init = async () => {
  let {fieldList, searchItemList} = analysisCompDatas(compList);
  pageInfo.value["searchFormData"] = {
    fieldList: searchItemList,
  };
  pageInfo.value["tableFieldList"] = {
    fieldList,
  };
};
const exportCode = () => {
  try {
    // 获取要导出的数据
    const exportData = {
      formInfo: formInfo.value,
      dataList: compList.value,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };

    // 格式化JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonString], {type: 'application/json'});

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-design-${new Date().getTime()}.json`;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 提示用户
    success('导出成功');
  } catch (err) {
    console.error('导出失败:', err);
    error('导出失败，请重试');
  }
}
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
      <div class="flex justify-end my-3">
        <el-button type="primary" @click="exportCode">导出代码</el-button>
      </div>
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
