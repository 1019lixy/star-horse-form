<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useFlowDesignStore } from '@/store/FlowDesign';
import { apiInstance, ApiUrls, piniaInstance } from 'star-horse-lowcode';
import { useRouter } from 'vue-router';
import { doSaveData } from '@/views/workflow/utils/FlowFormUtils';

const dataUrl: ApiUrls = apiInstance('flow-engine', 'workflow/flowDefine');
const props = defineProps({
  data: {
    type: Object,
  },
  isView: {
    type: Boolean,
    default: false,
  },
});
let router = useRouter();
let flowStyle = ref<string>('dingding');
const flowDesign = useFlowDesignStore(piniaInstance);
const basicInfoRef = ref();
const flowDesignRef = ref();
const flowSettingRef = ref();
let currentData = ref<number>(1);
const changeFlow = () => {
  if (flowStyle.value == 'dingding') {
    flowStyle.value = 'flowable';
  } else {
    flowStyle.value = 'dingding';
  }
};
/**
 * 可以使用此成熟的框架，进行更改,对于bpmn-js 可以考虑去除，太技术化不太实用
 * git clone https://gitee.com/crowncloud/smart-sh-flow-editor.git
 */
const change = async (item: any) => {
  if (currentData.value == 1) {
    let flag = false;
    await basicInfoRef.value.$refs.flowFormRef.$refs.starHorseFormRef.validate(
      (res: boolean) => {
        flag = res;
      },
    );
    if (!flag) {
      return;
    }
    let formData = basicInfoRef.value.$refs.flowFormRef.getFormData();
    flowDesign.flowSetFormInfo(formData.value);
  }
  currentData.value = item.type;
  if (currentData.value == 1) {
    let formData = flowDesign.flowFormInfo;
    await nextTick();
    basicInfoRef.value.$refs.flowFormRef.setFormData(formData.value);
  }
};
const flowSave = (type: string) => {
  let formInfo = flowDesign.flowFormInfo;
  doSaveData(formInfo, type, router);
};

const init = () => {
  if (props.data) {
    flowDesign.flowSetFormInfo(props.data);
  }
};
const loadData = async () => {
  let id = router.currentRoute.value.query.data;
  let isView = router.currentRoute.value.query.isView;
  if (id) {
    let data = await dataUrl.loadByIdAction!(id, 'Y' == isView);
    data['bindForm'] = data['bindForm']?.split(';');
    data['flowManager'] = data['flowManager']?.split(';');
    flowDesign.flowSetFormInfo(data);
    flowDesign.setNode(JSON.parse(data.jsonFile)?.process);
  }
  console.log(id, isView);
};
onMounted(() => {
  init();
});

watch(
  () => router.currentRoute.value.query,
  () => {
    loadData();
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <el-card class="inner_content">
    <FlowNav
      :currentNav="currentData"
      @changeFlow="changeFlow"
      @flowSave="flowSave"
      @change="change"
    />
    <BasicInfo ref="basicInfoRef" v-if="currentData == 1" />
    <DynamicForm ref="basicInfoRef" v-if="currentData == 2" />
    <UFlowDesign
      ref="flowDesignRef"
      :flowStyle="flowStyle"
      v-if="currentData == 3"
    />
    <FlowSetting ref="flowSettingRef" v-if="currentData == 4" />
  </el-card>
</template>

<style scoped lang="scss"></style>
