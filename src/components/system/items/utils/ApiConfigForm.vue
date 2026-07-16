<script setup lang="ts">
import {createApiConfig} from "@/components/system/items/utils/ApiSharedConfig";
import {PageFieldInfo, postRequest, SelectOption, StarHorseDialog, success, warning} from "star-horse-lowcode";
import {nextTick, PropType, reactive, ref, unref, watch} from "vue";
import {i18n} from "@/lang";
import DynamicQueryBuilder from "@/components/system/DynamicQueryBuilder.vue";
import {getInterfaceUtils} from "@/components/system/items/utils/ItemPreps";

defineOptions({name: "ApiConfigForm"});
const props = defineProps({
  /** "dataSource" - shows labelField/valueField in response; "linkage" - shows fieldMappings in response */
  mode: {
    type: String as PropType<"dataSource" | "linkage">,
    required: true,
  },
  /** Form field options for linkage mode target field dropdown */
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
  currentField: {
    type: String,
    default: "",
  }
});

const formRef = ref();

const apiConfig = reactive<PageFieldInfo | any>(
    createApiConfig(props.mode, props.formFields, props.currentField, getInterfaceUtils())
);

// ─── Public API ───
const setFormData = (data: any) => {
  nextTick(() => formRef.value?.setFormData(data));
};

const getFormData = () => formRef.value?.getFormData();

const submitValid = async () => {
  const starForm = formRef.value?.$refs?.starHorseFormRef;
  if (starForm) {
    let flag = false;
    await starForm.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) return false;
  }
  return true;
};
const apiValid = async () => {
  const result = await submitValid();
  if (!result) {
    warning(i18n("dyform.apiConfig.warning.incomplete"));
    return;
  }
  const formDta = unref(formRef.value?.getFormData()) ?? {};
  postRequest(formDta.proxyUrl ?? "/userdb-manage/redirect/apiValid", formDta).then((data) => {
    const result = data.data;
    if (result.code) {
      warning(result.cnMessage);
      return;
    }
    success(result.cnMessage);
  })
};
const visible = ref<boolean>(false);
const condition = ref<any>({});
const sortCondition = ref<any>({});
const aggCondition = ref<any>({});
const openDialog = () => {
  visible.value = true;
};
defineExpose({submitValid, setFormData, getFormData});
</script>

<template>
  <star-horse-dialog
      v-model="visible"
      @closeAction="()=>visible=false"
      :selfFunc="true"
      @merge="apiValid"
      :title="i18n('dyform.apiConfig.btn.verify')"
      boxHeight="90%"
      boxWidth="70%"
  >
    {{ condition }}
    <dynamic-query-builder ref="dynamicQueryBuilderRef"
                           property-name="fieldName"
                           or-condition-name="orList"
                           :properties="formFields"
                           v-model="condition"
                           v-model:sortValue="sortCondition"
                           v-model:agg-value="aggCondition"/>
  </star-horse-dialog>
  <div class="api-config-form">
    <div class="flex my-[3px] justify-end w-full">
      <el-button size="small" @click="openDialog">
        <star-horse-icon iconClass="valid"/>
        {{ i18n('dyform.apiConfig.btn.verify') }}
      </el-button>
    </div>
    <star-horse-form :fieldList="apiConfig" ref="formRef"/>
  </div>
</template>

<style scoped lang="scss">
.api-config-form {
  width: 100%;
}
</style>
