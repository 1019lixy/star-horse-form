<script setup lang="ts">
import { nextTick, reactive, ref, unref, watch } from "vue";
import { PageFieldInfo } from "star-horse-lowcode";
import { i18n } from "@/lang/index.js";
import JSON5 from "json5";

const props = defineProps<{
  visible: boolean;
  formProps: any;
  formInfo: any;
  fieldName: string;
  currentField: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const paramsConfigRef = ref<any>(null);
const formInfo = reactive<PageFieldInfo>({
  fieldList: [
    {
      fieldName: "userDefinePreps",
      type: "json",
      preps: {
        rows: 10,
      },
    },
  ],
});

const dataSubmit = async () => {
  let flag = false;
  await paramsConfigRef.value.$refs.starHorseFormRef.validate(
    (res: boolean) => {
      flag = res;
    },
  );
  if (!flag) {
    return;
  }
  const formData = unref(paramsConfigRef.value.getFormData());
  const userDefinePreps = JSON5.parse(formData["userDefinePreps"]);
  Object.entries(userDefinePreps).forEach(([key, value]) => {
    props.formProps[key] = value;
  });
  emit("close");
};
const resetDataSourceForm = () => {
  // Reset logic if needed
};
const setFormData = async (data: any) => {
  // 确保 paramsConfigRef 已经初始化
  const setData = () => {
    if (paramsConfigRef.value) {
      paramsConfigRef.value.setFormData({
        userDefinePreps: JSON5.stringify(data, null, 4),
      });
    } else {
      // 如果还没有初始化，延迟后重试
      setTimeout(setData, 100);
    }
  };

  // 等待下一个 DOM 更新周期
  await nextTick();
  // 开始尝试设置数据
  setData();
};
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      setFormData(props.formProps);
    }
  },
  { immediate: true },
);
defineExpose({
  setFormData,
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="i18n('dyform.params.dialog.title')"
    :isBatch="false"
    @merge="dataSubmit"
    @closeAction="emit('close')"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
    :boxHeight="'40%'"
  >
    <star-horse-form ref="paramsConfigRef" :fieldList="formInfo" />
  </star-horse-dialog>
</template>
<style scoped lang="scss">
:deep(.json-comp) {
  height: 250px !important;
}
</style>
