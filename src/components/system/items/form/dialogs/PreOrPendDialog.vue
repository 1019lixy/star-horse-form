<script setup lang="ts">
import { nextTick, ref, unref, watch } from "vue";
import {i18n} from "@/lang";
import { loadSvgIcons } from "@/api/star_horse_form_utils.js";

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

const preOrPendRef = ref<any>(null);

/**
 * 表单字段配置
 */
const preOrPendFields = () => {
  return {
    fieldList: [
      // Prepend配置
      {
        label: i18n("dyform.dialog.415"),
        fieldName: "prefixIcon",
        type: "icon",
        formVisible: true,
        listVisible: false,
        preps: {
          iconType: "user",
          values: loadSvgIcons(),
        },
      },
      {
        label: i18n("dyform.dialog.416"),
        fieldName: "prefix",
        formVisible: true,
        listVisible: false,
      },
      {
        label: i18n("dyform.dialog.417"),
        fieldName: "prependText",
        type: "input",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.prependText.helpMsg"),
      },
      {
        label: i18n("dyform.dialog.418"),
        fieldName: "prependList",
        type: "json-array",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.prependList.helpMsg"),
        preps: {
          jsonConfig: {
            dialogTitle: i18n("dyform.preOrPend.prependList.title"),
            columns: [
              { title: i18n("dyform.dialog.419"), fieldName: "name", required: true },
              { title: i18n("dyform.dialog.420"), fieldName: "value", required: true },
            ],
          },
        },
      },
      // Append配置
      {
        label: i18n("dyform.dialog.421"),
        fieldName: "suffixIcon",
        type: "icon",
        formVisible: true,
        listVisible: false,
        preps: {
          iconType: "user",
          values: loadSvgIcons(),
        },
      },
      {
        label: i18n("dyform.dialog.422"),
        fieldName: "suffix",
        formVisible: true,
        listVisible: false,
      },
      {
        label: i18n("dyform.dialog.423"),
        fieldName: "appendText",
        type: "input",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.appendText.helpMsg"),
      },
      {
        label: i18n("dyform.dialog.424"),
        fieldName: "appendAction",
        type: "json",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.appendAction.helpMsg"),
        preps: {
          jsonConfig: {
            dialogTitle: i18n("dyform.preOrPend.appendAction.title"),
            columns: [
              { title: i18n("dyform.dialog.425"), fieldName: "actionTitle", required: true },
              { title: i18n("dyform.item.139"), fieldName: "icon", required: true },
              {
                title: i18n("dyform.dialog.426"),
                fieldName: "actions",
                required: false,
                type: "textarea",
              },
            ],
          },
        },
      },
      {
        label: i18n("dyform.dialog.427"),
        fieldName: "appendList",
        type: "json-array",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.appendList.helpMsg"),
        preps: {
          jsonConfig: {
            dialogTitle: i18n("dyform.preOrPend.appendList.title"),
            columns: [
              { title: i18n("dyform.dialog.419"), fieldName: "name", required: true },
              { title: i18n("dyform.dialog.420"), fieldName: "value", required: true },
            ],
          },
        },
      },
    ],
  };
};

/**
 * 表单验证和提交
 */
const preOrPendValid = async () => {
  let flag = false;
  await nextTick();
  await preOrPendRef.value?.$refs.starHorseFormRef.validate((res: boolean) => {
    flag = res;
  });

  if (!flag) {
    return;
  }

  const formData = unref(preOrPendRef.value.getFormData());
  for (const key in formData) {
    props.formProps[key] = formData[key];
  }
  emit("merge");
};

const resetDataSourceForm = () => {
  // 重置表单逻辑
};

const setFormData = async (data: any) => {
  await nextTick();
  if (preOrPendRef.value) {
    setTimeout(() => {
      // 提取preps中的数据到表单
      const formData = {
        prefixIcon: data.prefixIcon,
        prefix: data.prefix,
        suffixIcon: data.suffixIcon,
        suffix: data.suffix,
        prependText: data.prependText || "",
        prependList: data.prependList || [],
        appendText: data.appendText || "",
        appendAction: data.appendAction,
        appendList: data.appendList || [],
      };
      preOrPendRef.value?.setFormData(formData);
    }, 200);
  }
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
    :title="i18n('dyform.preOrPend.dialog.title')"
    :isBatch="false"
    @merge="preOrPendValid"
    @closeAction="emit('close')"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
  >
    <star-horse-form ref="preOrPendRef" :fieldList="preOrPendFields()" />
  </star-horse-dialog>
</template>
