<script setup lang="ts" name="ShDynamicForm">
import {inject, ref, Ref, watch, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {closeLoad, load, loadById} from "@/api/sh_api";
import {DialogProps} from "@/components/types/DialogProps";
import {ShallowReactive} from "@vue/reactivity";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object as PropType<any>, required: true},
  formInfo: {type: Object as PropType<any>, required: true},
  rules: {type: Object, required: true},
  typeModel: {type: String, default: "normal"}
});
const emits = defineEmits(["refresh"]);
const starHorseFormRef = ref(null);
const dataForm = inject("dataForm") as Ref;
const closeDialog = inject("closeDialog") as Function;
const dialogOperation = inject("dialogOperation") as ShallowReactive<Object>;
const dialogProps = inject<DialogProps>("dialogProps", {});
watch(
    () => dialogOperation,
    (val: any) => {
      if (val['funcName'] == "merge") {
        merge(val["type"]);
      } else if (val['funcName'] == "mergeDraft") {
        mergeDraft(val["type"]);
      } else if (val['funcName'] == "resetForm") {
        resetForm();
      }
      //为了触发多次点击响应
      dialogOperation["funcName"] = "";
      dialogOperation["type"] = "";
    }, {
      immediate: false,
      deep: true
    }
);
const assignDefault = () => {
  // let defaultDatas = {};
  // let tempList = props.fieldList.fieldList;
  // for (let key in tempList) {
  //   let temp = tempList[key] as FieldInfo;
  //   if (temp.defaultValue) {
  //     defaultDatas[temp.fieldName] = temp.defaultValue;
  //   }
  // }
  dataForm.value = {};
};
const loadData = async () => {
  let objData = await loadById(props.compUrl?.loadByIdUrl, dialogProps.ids, false);
  dataForm.value = objData;
  //解决关闭并再次打开不触发watch监听
  dialogProps.ids = -2;
};
watch(() => dialogProps.ids,
    (val) => {
      if (val == -2) {
      } else if (!val || val == -1) {
        assignDefault();
      } else {
        loadData();
      }
    }, {
      immediate: true,
      deep: true
    });

const merge = (type: string) => {
  starHorseFormRef.value.validate((result: boolean) => {
    if (!result) {
      return;
    }
    doMerge();
  });
};

const mergeDraft = (type: string) => {
  console.log("mergeDraft", type)
  doMerge();
};

const doMerge = () => {
  load("数据处理中");
  postRequest(props.compUrl.mergeUrl, dataForm.value).then(res => {
    closeLoad();
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return;
    } else {
      success(res.data.cnMessage);
    }
    emits("refresh");
    resetForm();
    closeDialog();
    //关闭弹窗
  }).catch(err => {
    error("接口调用异常" + err);
  }).finally(() => {
    closeLoad();
  });
};
const resetForm = () => {
  assignDefault();
};
defineExpose({
  merge, mergeDraft, resetForm, assignDefault
});
</script>

<style scoped></style>
<template>
  <el-form :model="dataForm" :rules="rules" class="data-form" ref="starHorseFormRef"
           :disabled="formInfo['disabled'] == 'Y'"
           :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'Y'"
           :inline="formInfo.inline == 'Y'"
           :inline-message="formInfo['inlineMessage'] == 'Y'"
           :label-position="formInfo['labelPosition']"
           :label-suffix="formInfo['labelSuffix']"
           :label-width="formInfo['labelWidth']"
           :require-asterisk-position="formInfo['requireAsteriskPosition']"
           :scroll-to-error="formInfo['scrollToError'] == 'Y'"
           :show-message="formInfo['showMessage'] == 'Y'"
           :size="formInfo['size']"
           :status-icon="formInfo['statusIcon'] == 'Y'"
           :validate-on-rule-change="formInfo['validateOnRuleChange']=='Y'"
  >
    <template v-for="data in fieldList">
      <component
          :id="data.id"
          :field="data"
          :formFieldList="dataForm"
          :is="data.itemType + '-container'"
          v-if="data.compType === 'container'"
      />
      <component
          :id="data.id"
          :field="data"
          :formFieldList="dataForm"
          :is="data.itemType + '-item'"
          v-if="data.compType === 'formItem'"
      />
    </template>
    <el-form-item v-if="typeModel=='tab'">
      <el-button @click="merge" style="background: var(--star-horse-style);color: var(--star-horse-white)">
        <star-horse-icon icon-class="save" style="color:var(--star-horse-white);"/>
        提交
      </el-button>
      <el-button @click="resetForm" link>
        <star-horse-icon icon-class="undo"/>
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>
