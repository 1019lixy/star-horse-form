<script setup lang="ts" name="ItemPropertiesPanel">
import {computed, nextTick, onMounted, ref, unref, watch} from 'vue'
import {formFieldMapping, isJson, searchMatchList} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import StarHorseEditor from "@/components/comp/StarHorseEditor.vue";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {
  compCommonFields,
  containerField,
  createData,
  dataSourceFields,
  paramsFields,
  relationDataField,
  validInterface
} from "@/views/dyform/utils/ItemPreps.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import {error, success} from "@/utils/message.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {Config} from "@/api/settings.ts";

let designForm = DesignForm(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let formInfo = computed(() => designForm.formInfo);
let list = computed(() => designForm.compList);
const formProps = computed(() => designForm.currentFormPreps);
const currentItemId = computed(() => designForm.currentItemId);
let currentItemType = computed(() => designForm.currentItemType);
let currentCompCategory = computed(() => designForm.currentCompCategory);
let parentCompType = computed(() => designForm.parentCompType);
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
let currentField = ref<any>({});
let jsEditor = ref<boolean>(false);
let containerDialogVisible = ref<boolean>(false);
let dataSourceDialogVisible = ref<boolean>(false);
let dataRelationDialogVisible = ref<boolean>(false);
let paramsDialogVisible = ref<boolean>(false);
let codeTab = ref<string>("code");
let formRules = ref<any>({});
let jsValue = ref<string>("console.log('hello world')");
let fieldName = ref<string>('');
const codeCompRef = ref<any>(null);
const dataSourceFormRef = ref<any>(null);
const dataRelationFormRef = ref<any>(null);
const paramsConfigRef = ref<any>(null);
const containerPrepRef = ref<any>(null);

//-----------------------数据源相关属性---------------------
let matchTypeList = ref<SelectOption[]>();
const jsButtonClick = (data: any, actionName: string) => {
  console.log(data);
  jsEditor.value = !jsEditor.value;
  if (!Object.keys(formProps.value).includes(actionName)) {
    data[actionName] = "";
  }
  fieldName.value = actionName;
  jsValue.value = data[actionName];
};
const condifRelationPolicy = async () => {
  dataRelationDialogVisible.value = true;
  await nextTick();
  dataRelationFormRef?.value.setFormData(formProps.value["dataRelation"] || {});
}
const configParams = async (params: any) => {
  fieldName.value = params;
  paramsDialogVisible.value = true;
  await nextTick();
  paramsConfigRef.value.setFormData(formProps.value);
}
const submitValid = async () => {
  await validInterface(formProps, dataSourceFormRef, (dataList: any, _successMsg: string, errorMsg: string) => {
    if (!errorMsg) {
      //只保存静态数据,
      formProps.value["values"] = createData(dataSourceFormRef, dataList).reDataList;
      closeAction();
    } else {
      error(errorMsg);
    }
  });
};
const dataRelationMerge = async () => {
  let flag: boolean = false;
  await dataRelationFormRef?.value?.$refs.starHorseFormRef.validate((res: boolean) => {
    flag = res;
  });
  if (!flag) {
    return;
  }
  formProps.value["dataRelation"] = dataRelationFormRef?.value.getFormData().value;
  console.log(formProps.value);
  closeAction();
}
const paramsValid = async () => {
  let flag = false;
  await paramsConfigRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    flag = res;
  });
  if (!flag) {
    return;
  }
  let formDdata = paramsConfigRef.value.getFormData();
  for (let key in formDdata.value) {
    formProps.value[key] = formDdata.value[key];
  }
  formProps.value["dataUrl"] = {
    loadByPageUrl: formDdata.value["preinterfaceUrl"] + formDdata.value["interfaceUrl"],
    redirect: true,
    condition: {
      // url: formDdata.value["preinterfaceUrl"] + formDdata.value["interfaceUrl"],
      httpMethod: formDdata.value.httpMethod,
      params: formDdata.value.params
    },
  }
  let searchFieldList: Array<any> = [];
  formProps.value["fieldLists"].forEach((item: any) => {
    item["listVisible"] = true;
    item["type"] = "input";
    item["formVisible"] = true;
    if (item.searchFlag == "Y") {
      searchFieldList.push({...item, matchType: "lk", defaultVisible: true})
    }
  });
  formProps.value["searchFieldList"] = searchFieldList;
  formProps.value["fieldList"] = {
    fieldList: formProps.value["fieldLists"]
  };
  //删除多余的属性
  formProps.value["orderBy"]?.forEach((item: any) => {
    delete item["xh"];
  })
  closeAction();
};
const resetForm = () => {
};
const resetDataSourceForm = () => {
  formProps.value["dataSource"] = "data";
  formProps.value["requestType"] = null;
  formProps.value["urlOrDictName"] = null;
  formProps.value["queryParams"] = [];
  formProps.value["values"] = [];
};
const dataRelationReset = () => {

}
const editContainerPrep = async () => {
  containerDialogVisible.value = true;
  await nextTick();
  containerPrepRef.value.setFormData(formProps.value);
}
const containerAction = () => {
  let formDdata = containerPrepRef.value.getFormData();
  for (let key in formDdata.value) {
    formProps.value[key] = formDdata.value[key];
  }
  closeAction();
};
const closeAction = () => {
  jsEditor.value = false;
  containerDialogVisible.value = false;
  dataSourceDialogVisible.value = false;
  paramsDialogVisible.value = false;
  dataRelationDialogVisible.value = false;
};
/**
 * 数据源操作框
 * @param _type
 */
const dataSource = async (_type: string) => {
  dataSourceDialogVisible.value = true;
  await nextTick();
  dataSourceFormRef.value.setFormData(formProps.value);
};
/**
 * 根据属性类别获取对应参数
 * @param itemType
 * @param isItem
 */
const assignPrep = async (itemType: string, isItem: boolean) => {
  await nextTick();
  let formDatas = unref(formDataList);
  let selfFormDatas = unref(selfFormDataList);
  let containers = unref(containerList);
  if (!isItem) {
    for (let key in containers) {
      let temp = containers[key];
      if (temp.itemType == itemType) {
        assignValue(temp);
        return temp;
      }
    }
  }
  for (let key in formDatas) {
    let temp = formDatas[key];
    if (temp.itemType == itemType) {
      assignValue(temp);
      return temp;
    }
  }
  for (let key in selfFormDatas) {
    let temp = selfFormDatas[key];
    if (temp.itemType == itemType) {
      assignValue(temp);
      return temp;
    }
  }
};
let relationComps = ref<Array<string>>(["select", "tselect", "switch", "autocomplete",
  "checkbox", "radio", "cascade", "page-select", "dialog-input"]);
let exclusionDataSource = ref<Array<string>>(["page-select","switch", "dialog-input"]);
let formFields = ref<PageFieldInfo>({
  fieldList: []
});
const parseSelectData = (items: any, type: string) => {
  items.forEach((item: any) => {
    item["formVisible"] = true;
    item["type"] = item["fieldType"];
    item["required"] = item["required"] == 'Y';
    if (item["selectValues"] && isJson(item["selectValues"])) {
      item["optionList"] = [];
      let datas = JSON.parse(item.selectValues);
      for (let i in datas) {
        let data: any = datas[i];
        item["optionList"].push({
          name: data.name || data,
          value: data.value || data
        })
      }
    }
    if (item["type"] == "button") {
      switch (type) {
        case "base":
          item["actions"] = "";
          break;
        case "other":
          item["actions"] = "";
          break;
        default:
          item["actions"] = (data: any) => jsButtonClick(data, item.actionName);
      }
    }
    if (item["type"] == "config") {
      item["type"] = "button";
      item["label"] = "参数配置";
      item["actions"] = (_data: any) => configParams(item.actionName);
    }
  });
}
const assignValue = (fieldInfo: any) => {
  try {
    let temp = JSON.parse(JSON.stringify(fieldInfo))
    currentField.value = temp;
    parseSelectData(temp.fields, "base");
    parseSelectData(temp.advancedFields, "other");
    parseSelectData(temp.actions, "action");
    //如果是组件动态增加公共属性，公共属性不应该维护在数据库
    //如果是select,checkbox,radio 等，增加联动属性
    console.log(currentCompCategory.value);
    if (currentCompCategory.value == "container") {
      if (currentItemType.value != 'table') {
        temp.fields.splice(0, 0, {
          label: "编辑容器属性",
          fieldName: "rows",
          type: "button",
          actions: (_data: any) => editContainerPrep(),
          formVisible: true,
        });
      }
    } else {
      let commonFields = compCommonFields();
      if (relationComps.value.includes(currentItemType.value)) {
        console.log(currentItemType.value);
        commonFields.push({
          label: "配置联动策略",
          fieldName: "dataRelation",
          type: "button",
          actions: (_data: any) => condifRelationPolicy(),
          formVisible: true,
        });
        if (!exclusionDataSource.value.includes(currentItemType.value)) {
          commonFields.push({
            label: "配置数据源",
            fieldName: "dataSource",
            type: "button",
            actions: (_data: any) => dataSource(formProps.value['itemType']),
            formVisible: true,
          });
        }
      }
      for (let i in commonFields) {
        temp.fields.splice(i, 0, commonFields[i]);
      }
      // console.log(temp.fields);
      temp.advancedFields.push({
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true,
      });
    }

    formFields.value.fieldList = [{
      fieldName: "base",
      collapseList: [{
        title: "基础属性",
        icon: "base_preps",
        tabName: "base",
        fieldList: temp.fields
      }, {
        title: "其它属性",
        tabName: "other",
        icon: "advance_preps",
        preps: {
          labelPosition: "top",
        },
        fieldList: temp.advancedFields
      }, {
        title: "自定义事件",
        tabName: "action",
        icon: "event-action",
        preps: {
          labelPosition: "top",
        },
        fieldList: temp.actions
      }]
    }];
    let defaultValues: any = formFieldMapping(formFields.value).defaultDatas;
    for (let key in defaultValues) {
      if (!Object.keys(formProps.value).includes(key)) {
        formProps.value[key] = defaultValues[key];
      }
    }
  } catch (e) {
    console.log(e)
  }
};
let dataList = ref<SelectOption[]>([]);
const recall = (options: SelectOption[], successMsg: string, errorMsg: string) => {
  dataList.value = options;
  if (successMsg) {
    success(successMsg);
  }
  if (errorMsg) {
    error(errorMsg);
  }
}
const hmsg: string = `
   自定义事件,提供了如下系统参数：
   currentField:Object 当前组件的信息
   formData:Object 表单数据
   formFields：Array<any>表单的所有元素
   formInstance:Object 表单实例对象
   具体参数或方法切换Tab查看
`;
onMounted(() => {
  matchTypeList.value = searchMatchList();
});
watch(() => [currentItemId, currentItemType],
    () => {
      assignPrep(currentItemType.value, parentCompType.value == "item");
    }, {
      immediate: true,
      deep: true
    });
</script>
<template>
  <star-horse-dialog :dialogVisible="dataRelationDialogVisible" :title="'数据联动策略配置'" :isBatch="false"
                     @merge="dataRelationMerge"
                     @closeAction="closeAction"
                     @reset="dataRelationReset" :selfFunc="true">
    <div class="dialog-body">
      <star-horse-form :outerFormData="formProps" primary-key="" ref="dataRelationFormRef"
                       :fieldList="relationDataField()"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="dataSourceDialogVisible" :title="'数据源配置'" :isBatch="false"
                     @merge="submitValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <div class="dialog-body">
      <star-horse-form :outerFormData="formProps" primary-key="" ref="dataSourceFormRef"
                       :fieldList="dataSourceFields(dataSourceFormRef,recall)"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="paramsDialogVisible" :title="'参数配置'" :isBatch="false"
                     @merge="paramsValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <div class="dialog-body">
    <star-horse-form :outerFormData="formInfo" ref="paramsConfigRef" :fieldList="paramsFields(fieldName,currentField)"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="containerDialogVisible"
                     :title="'容器设置'" :isBatch="false" @merge="containerAction"
                     @closeAction="closeAction"
                     @reset="resetForm" :selfFunc="true">
    <div class="dialog-body">
    <star-horse-form ref="containerPrepRef" :outerFormData="formInfo" :fieldList="containerField(currentItemType)"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="jsEditor" :title="'自定义信息'" :isBatch="false" @merge="closeAction"
                     @closeAction="closeAction"
                     @reset="closeAction" :selfFunc="true">
    <div class="dialog-body">
      <el-tabs v-model="codeTab">
        <el-tab-pane label="代码" name="code">
          <star-horse-editor
              v-model:value="formProps[fieldName]"
              lang="javascript"
              ref="codeCompRef"
              :helpMsg="hmsg"
              style="height: 100%"
          />
        </el-tab-pane>
        <el-tab-pane label="当前组件属性" name="currentField">
        <pre>
          {{ JSON.stringify(currentField, null, 4) }}
        </pre>
        </el-tab-pane>
        <el-tab-pane label="表单实例" name="formInstance">
          对象名字：formInstance
          <table border="1" cellpadding="0" cellspacing="0"
                 style="width: 100%;border: 1px dashed var(--star-horse-style)">
            <thead style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <th>名称</th>
              <th>说明</th>
              <th>类型</th>
            </tr>
            </thead>
            <tbody style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <td>validate</td>
              <td>对整个表单的内容进行验证。 接收一个回调函数，或返回 <code>Promise</code>。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>validateField</td>
              <td>验证具体的某个字段。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>resetFields</td>
              <td>重置该表单项，将其值重置为初始值，并移除校验结果</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>scrollToField</td>
              <td>滚动到指定的字段</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>clearValidate</td>
              <td>清理某个字段的表单验证信息。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>fields</td>
              <td>获取所有字段的 context</td>
              <td><span class="inline-flex items-center">Array</span></td>
            </tr>
            </tbody>
          </table>
        </el-tab-pane>
        <el-tab-pane label="表单属性" name="formDatas">
        <pre>
          {{ JSON.stringify(list, null, 4) }}
        </pre>
        </el-tab-pane>
      </el-tabs>
    </div>
  </star-horse-dialog>
  <div class="dynamic-form" v-if="currentItemType">
    <el-scrollbar>
      <el-form
          :model="formProps"
          :rules="formRules"
          class="dynamic-form"
          ref="itemPropertiesRef"
          :size="compSize"
          label-width="auto"
          label-position="left"
          require-asterisk-position="right"
      >
        <star-horse-form-item :fieldList="formFields"
                              :compSize="compSize"
                              v-model:dataForm="formProps"/>
      </el-form>
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>

:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

:deep(.el-form-item__content) {
  width: 90%;
  margin-left: 5px;
  padding-left: 5px;
}

:deep(.el-scrollbar) {
  border-top-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.widget-collapse {
  height: 99%;
}

.oper-btn {
  cursor: pointer;
}

.dynamic-form {
  width: 300px;
  height: 100%;
  overflow: hidden;
}
</style>
