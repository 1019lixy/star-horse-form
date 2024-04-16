<script setup lang="ts" name="ShDynamicForm">
import {inject, reactive, ref, watch} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PropType} from "vue/dist/vue";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {closeLoad, load, loadById} from "@/api/sh_api";
import {DialogProps} from "@/components/types/DialogProps";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object as PropType<any>, required: true},
  formInfo: {type: Object as PropType<any>, required: true},
  rules: {type: Object, required: true},
  typeModel: {type: String, default: "normal"}
});
const emits = defineEmits(["refresh"]);
const starHorseFormRef = ref(null);
const dataForm = ref<any>({});// inject("dataForm");
const closeDialog = inject("closeDialog") as Function;
const dialogOperation = inject("dialogOperation") as reactive<Object>;
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
    //  assignStatusName();
    doMerge(type);
  });
};

/**
 * 对状态名称赋值
 */
const assignStatusName = () => {
  if (dataForm.statusCode) {
    let sData = selectData.find((item: string) => item.statusCode === dataForm.statusCode);
    if (sData) {
      dataForm["statusName"] = sData.statusName;
    }
  }
}
const mergeDraft = (type: string) => {
  doMerge(type);
};

const doMerge = (type: string) => {
  load("数据处理中");
  assignStatusName();
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
    if (type == "close") {
      closeDialog();
    }
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
           :disabled="formInfo['disabled'] == 'yes'"
           :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'yes'"
           :inline="formInfo.inline == 'yes'"
           :inline-message="formInfo['inlineMessage'] == 'yes'"
           :label-position="formInfo['labelPosition']"
           :label-suffix="formInfo['labelSuffix']"
           :label-width="formInfo['labelWidth']"
           :require-asterisk-position="formInfo['requireAsteriskPosition']"
           :scroll-to-error="formInfo['scrollToError'] == 'yes'"
           :show-message="formInfo['showMessage'] == 'yes'"
           :size="formInfo['size']"
           :status-icon="formInfo['statusIcon'] == 'yes'"
           :validate-on-rule-change="formInfo['validateOnRuleChange']=='yes'"
  >
    <template v-for="data in fieldList">
      <component
          :id="data.id"
          :field="data"
          :formDatas="{}"
          :formFieldList="dataForm"
          :is="data.itemType + '-container'"
          v-if="data.compType === 'container'"
      />
      <component
          :id="data.id"
          :field="data"
          :formDatas="{}"
          :formFieldList="dataForm"
          :is="data.itemType + '-item'"
          v-if="data.compType === 'formItem'"
      />
    </template>
    <el-form-item v-if="typeModel=='tab'">
      <el-button @click="merge" type="primary">
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
