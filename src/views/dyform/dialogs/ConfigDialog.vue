<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import {i18n} from "@/lang";
import {validDynamicFormCompParams} from "@/views/dyform/utils/preview.js";
import {
  apiInstance,
  closeLoad,
  error,
  load,
  piniaInstance,
  postRequest,
  success,
  useDesignFormStore,
  warning
} from "star-horse-lowcode";
import {delCacheData} from "@/api/cached_utils.js";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicForm");
const designForm = useDesignFormStore(piniaInstance);
const list = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
const activeTab = ref("first");
let cacheName = "dynamicFormCache";
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "saveDraft"): void;
}>();

defineProps<{
  visible: boolean;
  compSize: string;
}>();

const formPropertyRef = ref();

const closeAction = () => {
  emit("close");
};
/**
 * 创建表单信息
 */
const createFormInfo = () => {
  let dynameForm = JSON.parse(JSON.stringify(formInfo.value));
  //解决多次转换
  dynameForm!["relations"] =
      dynameForm["relations"] && dynameForm["relations"] instanceof Array
          ? JSON.stringify(dynameForm["relations"])
          : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(list.value);
  dynameForm!["details"]["fieldNames"] = "{}"; //JSON.stringify(formData.value);
  return dynameForm;
};
let isSubmit = ref<boolean>(true);
const doSave = async (isDraft: boolean = false) => {
  let formData = formPropertyRef.value.getFormData();
  designForm.setFormInfo(formData.value);
  if (!isSubmit.value) {
    closeAction();
    return;
  }

  let flag = false;
  await nextTick();
  if (!isDraft) {
    let errMessage = validDynamicFormCompParams(list.value, true);
    if (errMessage) {
      warning(errMessage);
      return;
    }
  }
  await formPropertyRef.value.$refs.dynamicFormItemRef.$refs.starHorseFormRef.validate(
      (evt: boolean) => {
        flag = evt;
      },
  );
  if (!flag) {
    warning("请先填写表单信息");
    return;
  }
  load("数据提交中，请等待");
  postRequest(
      `${dataUrl.basePrefix}/${isDraft ? "mergeDraft" : "merge"}`,
      createFormInfo(),
  )
      .then((res: any) => {
        if (res.data.code != 0) {
          activeTab.value = "second";
          warning(res.data.cnMessage);
          return;
        }
        closeAction();
        delCacheData(cacheName);
        //添加成功清空缓存
        designForm.clearAll(false);
        success(res.data.cnMessage);
      })
      .catch((err: any) => {
        closeAction();
        error("操作异常:" + err);
      })
      .finally(() => {
        closeLoad();
      });
};

const analysisDynamicFields = (submit: boolean) => {
  isSubmit.value = submit;
  nextTick(() => {
    if (formPropertyRef.value) {
      formPropertyRef.value.analysisDynamicFields(createFormInfo());
    }
  });
};

defineExpose({
  analysisDynamicFields,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="() => doSave(false)"
      boxHeight="70%"
      :title="i18n('dyform.config.dialog.title')"
  >
    <FormPropertyPanel ref="formPropertyRef"/>
    <template #extend>
      <el-button
          @click="() => doSave(true)"
          style="
          background: var(--star-horse-style);
          color: var(--star-horse-white);
        "
          :size="compSize"
      >
        <star-horse-icon
            icon-class="short_save"
            cursor="pointer"
            style="color: var(--star-horse-white)"
        />
        {{ i18n("dyform.config.draft.save") }}
      </el-button>
    </template>
  </star-horse-dialog>
</template>
