<script setup lang="ts">
import {i18n} from "@/lang";
import {createApiLinkageConfig} from "@/components/system/items/utils/ApiLinkageConfig";
import {PageFieldInfo, SelectOption} from "star-horse-lowcode";
import {nextTick, PropType, reactive, ref} from "vue";

defineOptions({
  name: "ApiLinkageComp",
});

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});

const linkageFormRef = ref();

const buildFieldConfig = () => {
  const linkageTabs = createApiLinkageConfig(props.formFields).tabList;
  return {
    fieldName: "triggerConfig",
    formVisible: true,
    tabList: [
      {
        title: i18n("dyform.apiLinkage.triggerEvent"),
        tabName: "triggerConfig",
        objectName: "triggerConfig",
        fieldList: [
          {
            label: i18n("dyform.apiLinkage.triggerEvent"),
            fieldName: "triggerEvent",
            type: "select",
            defaultValue: "change",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              values: [
                {name: i18n("dyform.apiLinkage.triggerEvent.change"), value: "change"},
                {name: i18n("dyform.apiLinkage.triggerEvent.input"), value: "input"},
              ],
              colspan: 24,
            },
          },
        ],
      },
      ...linkageTabs,
    ],
  };
};

const apiLinkageField = reactive<PageFieldInfo | any>({
    fieldList: [buildFieldConfig()]
});

const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.apiLinkage && linkageFormRef.value) {
      linkageFormRef.value.setFormData(data.apiLinkage);
    }
  });
};

const getFormData = () => {
  return linkageFormRef.value?.getFormData();
};

const submitValid = async () => {
  let flag = false;
  const starForm = linkageFormRef.value?.$refs?.starHorseFormRef;
  if (starForm) {
    await starForm.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      return flag;
    }
  }
  const formData = linkageFormRef.value?.getFormData();
  if (formData && props.formProps) {
    props.formProps["apiLinkage"] = formData.value ?? formData;
  }
  return true;
};

defineExpose({
  submitValid,
  setFormData,
  getFormData,
});
</script>

<template>
  <star-horse-form
    :fieldList="apiLinkageField"
    ref="linkageFormRef"
  />
</template>

<style scoped lang="scss"></style>
