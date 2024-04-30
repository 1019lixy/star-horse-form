<script setup lang="ts" name="StarHorseForm">
import {inject, ref, Ref, watch} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PropType} from "vue/dist/vue";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {closeLoad, formFieldMapping, load, loadById} from "@/api/sh_api";
import {DialogProps} from "@/components/types/DialogProps";
import {BatchFieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ShallowReactive} from "@vue/reactivity";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object, required: true},
});
const emits = defineEmits(["refresh"]);
const starHorseFormRef = ref(null);
const dataForm = inject("dataForm") as Ref;
const closeDialog = inject("closeDialog") as Function;
let dialogOperation = inject("dialogOperation") as ShallowReactive<Object>;
const dialogProps = inject<DialogProps>("dialogProps", {});
const selectData = ref<any>([]);
const formFields = inject("formFields") as ShallowReactive<Array<any>>;
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
let batchDefaultValues = ref({});

const loadData = async () => {
  let objData = await loadById(props.compUrl.loadByIdUrl!, dialogProps.ids, false);
  dataForm.value = objData;
  checkActionRelation();
};
/**
 * 加载了数据，检查是否有数据联动的相关方法
 */
const checkActionRelation = () => {
  for (let key in formFields) {
    let temp = formFields[key].value;
    //有事件联动的方法
    if (temp?.preps["actionRelation"]) {
      temp.preps["actionRelation"](dataForm.value[temp.preps["name"]]);
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
      console.log(val);
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
  <el-form :model="dataForm" :rules="rules" class="data-form" ref="starHorseFormRef">
    <template v-for="item in fieldList.fieldList">
      <el-row v-if="item instanceof Array">
        <el-col :span="24/item.length" v-for="sitem in item">
          <el-form-item
              :size="'small'"
              :label="sitem.label"
              :required="sitem.required"
              :prop="sitem.fieldName"
              :rules="sitem.required?[{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}]:[]"
              v-if="sitem.formShow">
            <star-horse-item :primaryKey="primaryKey" v-model:dataForm="dataForm" :item="sitem"
                             :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-tabs v-if="item.tabList&&item.tabList.length>0">
        <el-tab-pane v-for="tabItem in item.tabList" :label="tabItem.tabName">
          <star-horse-form :compUrl="compUrl" :fieldList="{
            fieldList:tabItem.fieldList,
            batchFieldList:tabItem.batchFieldList}" :rules="rules"
                           :primaryKey="primaryKey"/>
        </el-tab-pane>
      </el-tabs>
      <star-horse-item v-else-if="item.type=='comp'" :primaryKey="primaryKey" v-model:dataForm="dataForm" :item="item"
                       :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
      <el-form-item
          v-else
          :size="'small'"
          :label="item.label"
          :required="item.required"
          :rules="item.required?[{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}]:[]"
          :prop="item.fieldName"
          v-if="item.formShow">
        <star-horse-item :primaryKey="primaryKey" v-model:dataForm="dataForm" :item="item"
                         :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
      </el-form-item>
    </template>
    <el-tabs
        v-if="fieldList[batchFieldName]?.length > 0">
      <el-tab-pane v-for="item in fieldList[batchFieldName]" :label="item['title']">
        <star-horse-form-list
            style="min-height:100px"
            :compUrl="item['compUrl']"
            :primaryKey="item['primaryKey']"
            :batchName="item['batchName']"
            :initRows="item['initRows']"
            :batchUrl="item['batchUrl']"
            :downloadTemplateUrl="item['downloadTemplateUrl']"
            :importInfo="item['importInfo']"
            :defaultValues="batchDefaultValues[item['batchName']]"
            :ref="setTableRef"
            :field-list="item['fieldList']"
            :rules="item['rules']||rules"
        />
      </el-tab-pane>
    </el-tabs>
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
