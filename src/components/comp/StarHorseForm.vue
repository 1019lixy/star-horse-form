<script setup lang="ts" name="StarHorseForm">
import {computed, inject, nextTick, PropType, ref, Ref, watch} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {closeLoad, formFieldMapping, load, loadById} from "@/api/sh_api";
import {DialogProps} from "@/components/types/DialogProps";
import {BatchFieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ShallowReactive} from "@vue/reactivity";
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  isView: {type: Boolean, default: false},
});
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "small");
const emits = defineEmits(["refresh", "dataLoaded"]);
const starHorseFormRef = ref(null);
const dataForm = inject("dataForm") as Ref;
const closeDialog = inject("closeDialog") as Function;
let dialogOperation = inject("dialogOperation") as ShallowReactive<Object>;
const dialogProps = inject<DialogProps>("dialogProps", {});
const selectData = ref<any>([]);
const formFields = inject("formFields") as ShallowReactive<any>;
watch(
    () => dialogOperation,
    (val: any) => {
      console.log("form", val);
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
let batchDefaultValues = ref({});

const loadData = async () => {
  if (!props.compUrl || !props.compUrl.loadByIdUrl) {
    return;
  }
  let objData = await loadById(props.compUrl.loadByIdUrl!, dialogProps.ids, false);
  dataForm.value = {...objData};
  let data = formFieldMapping(props.fieldList);
  dataForm.value = objData;
  let mapping = data.mappingFields;
  if (mapping) {
    for (let index in mapping) {
      let temp = mapping[index];
      if (!Object.keys(objData).includes(temp.name)) {
        dataForm.value[temp.name] = dataForm.value[temp.alias];
      }
    }
  }
  let actions = data.actions;
  if (actions && actions.length > 0) {
    for (let index in actions) {
      let temp = actions[index];
      let data = objData;
      if (temp.actionNames == "change") {
        temp.actions(data);
      }
    }
  }
  await nextTick(() => {
    emits("dataLoaded", objData);
    checkActionRelation();
  });


};
/**
 * 加载了数据，检查是否有数据联动的相关方法
 */
const checkActionRelation = () => {
  // if (formFields instanceof Array) {
  //   console.log("is array");

  for (let key in formFields) {
    let temp = formFields[key];
    let preps = temp?.preps;
    //有事件联动的方法
    if (preps?.actionRelation) {
      temp.preps["actionRelation"](dataForm.value[temp.preps["name"]]);
    }
    if (preps?.actions) {
      temp.preps["actions"](dataForm.value);
    }
  }
};

const merge = (type: string) => {
  starHorseFormRef.value!.validate((result: boolean) => {
    if (!result) {
      return;
    }
    doMerge(type);
  });
};

/**
 * 对状态名称赋值
 */
const assignStatusName = () => {
  if (dataForm.value.statusCode) {
    let sData = selectData.value.find((item: any) => item.value === dataForm.value.statusCode);
    if (sData) {
      dataForm["statusName"] = sData.statusName;
    }
  }
  let batchFields = props.fieldList.batchFieldList || [];
  batchFields?.forEach((item: BatchFieldInfo) => {
    if (dataForm.value[item.batchName]) {
      for (let index = 0; index < dataForm.value[item.batchName]?.length; index++) {
        let temp = dataForm.value[item.batchName][index];
        let sData = selectData.value.find((sitem: any) => sitem.value === temp.statusCode);
        if (sData && sData.statusName) {
          dataForm.value[item.batchName][index]["statusName"] = sData.statusName;
        }
      }
    }
  });
};
const mergeDraft = (type: string) => {
  doMerge(type);
};

const doMerge = (type: string) => {
  load("数据处理中");
  assignStatusName();
  let tempForm: any;
  let tempDatas = JSON.parse(JSON.stringify(dataForm.value));
  let mergeUrl = props.compUrl.mergeUrl;
  let batchFields = props.fieldList.batchFieldList || [];
  let flag = true;
  batchFields.forEach((item: BatchFieldInfo) => {
    if (item.sameParentTable) {
      flag = false;
      mergeUrl = props.compUrl.batchMergeUrl;
      tempForm = [];
      let batchDatas = tempDatas[item.batchName];
      delete tempDatas[item.batchName];
      for (let i in batchDatas) {
        let temp = {...tempDatas, ...batchDatas[i]}
        tempForm.push(temp);
      }
    }
  });
  if (flag) {
    tempForm = dataForm.value;
  }
  postRequest(mergeUrl!, tempForm).then(res => {
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
    dialogProps.ids = -1;
    //关闭弹窗
  }).catch(err => {
    error("接口调用异常" + err);
  }).finally(() => {
    closeLoad();
  });
};
const resetForm = () => {
  dataForm.value = formFieldMapping(props.fieldList).defaultDatas;
};
const setDataForm = (data: object) => {
  let defaultDatas = formFieldMapping(props.fieldList).defaultDatas;
  dataForm.value = {...defaultDatas, ...data};

}
const tableListRef = ref<any>([]);
const setTableRef = (el: any) => {
  if (el) {
    tableListRef.value.push(el);
  }
}
watch(() => dialogProps.ids,
    (val) => {
      if (!val || val == -1) {
        // dataForm.value = formFieldMapping(props.fieldList).defaultDatas;
        setDataForm(dataForm.value);
      } else {
        loadData();
      }
    }, {
      immediate: true,
      deep: true
    });

defineExpose({
  merge, mergeDraft, resetForm, setDataForm, starHorseFormRef, tableListRef
});
</script>
<template>
  <el-form :model="dataForm" :size="compSize" :rules="rules" class="data-form" ref="starHorseFormRef">
    <star-horse-form-item :primaryKey="primaryKey"
                          :compUrl="compUrl"
                          :fieldList="fieldList"
                          :rules="rules"
                          :isView="isView"
                          :batchName="batchName"
                          :batchFieldName="batchFieldName"
    />
  </el-form>
</template>
<style lang="scss" scoped>
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content ) {
  height: 100%;
  flex: 1;
}

:deep(.el-tab-pane) {
  height: 100%;
  flex: 1;
}

:deep(.el-form) {
  display: block;
  width: 100%;
}

.data-form {
  height: 100%;
}
</style>
