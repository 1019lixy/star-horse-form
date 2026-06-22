<script setup lang="ts">
import {createApiConfig} from "@/components/system/items/utils/ApiSharedConfig";
import {PageFieldInfo, postRequest, SelectOption, StarHorseDialog, success, warning} from "star-horse-lowcode";
import {nextTick, PropType, reactive, ref, unref} from "vue";
import DynamicQueryBuilder from "@/components/system/DynamicQueryBuilder.vue";

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
});

const formRef = ref();

const apiConfig = reactive<PageFieldInfo | any>(
    createApiConfig(props.mode, props.formFields)
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
    warning("接口配置不完整,请检查");
    return;
  }
  const formDta = unref(formRef.value?.getFormData()) ?? {};
  postRequest("/userdb-manage/redirect/apiLinkage", formDta).then((data) => {
    const result = data.data;
    if (result.code) {
      warning(result.cnMessage);
      return;
    }
    success(result.cnMessage);
  })
};
const visible = ref<boolean>(false);
const condition=ref<any>({});
const openDialog = () => {
  visible.value = true;
};
defineExpose({submitValid, setFormData, getFormData});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="()=>visible=false"
      :selfFunc="true"
      @merge="apiValid"
      title="验证"
      boxHeight="90%"
      boxWidth="70%"
  >
    {{condition}}
    <dynamic-query-builder ref="dynamicQueryBuilderRef"
                           property-name="fieldName"
                           or-condition-name="orList"
                           :properties="[
                               {name:'name',value:'value'},
                               {name:'name1',value:'value1'},
                           ]"
                           v-model="condition"/>
  </star-horse-dialog>
  <div class="api-config-form">
    <div class="flex my-[3px] justify-end w-full">
      <el-button size="small" @click="openDialog">
        <star-horse-icon iconClass="valid"/>
        验证
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
