<script setup lang="ts" name="ItemPropertiesPanel">
import {computed, nextTick, onMounted, ref, unref, watch} from 'vue'
import {rowClassName, searchMatchList} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import StarHorseEditor from "@/components/comp/StarHorseEditor.vue";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {
  containerField,
  createData,
  dataSourceFields,
  paramsFields,
  validInterface
} from "@/views/dyform/utils/ItemPreps.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {error, success} from "@/utils/message.ts";

let designForm = DesignForm(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let formInfo = computed(() => designForm.formInfo);
const fieldList = ref<any>({});
const formProps = computed(() => designForm.currentFormPreps);
// provide("dataForm", formProps);
let currentItemType = computed(() => designForm.currentItemType);
let currentCompCategory = computed(() => designForm.currentCompCategory);
let parentCompType = computed(() => designForm.parentCompType);
let formData = computed(() => designForm.formData);
const advancedFieldList = ref<any>({});
const actions = ref<any>({});
let currentField = ref<any>({});
let jsEditor = ref<boolean>(false);
let containerDialogVisible = ref<boolean>(false);
let dataSourceDialogVisible = ref<boolean>(false);
let paramsDialogVisible = ref<boolean>(false);
let activeNames = ref("1");
let formRules = ref({});
let jsValue = ref<string>("console.log('hello world')");
let fieldName = ref<string>('');
const codeCompRef = ref<any>(null);
const dataSourceFormRef = ref<any>(null);
const paramsConfigRef = ref<any>(null);
const containerPrepRef = ref<any>(null);
//-----------------------数据源相关属性---------------------
let matchTypeList = ref<SelectOption[]>();
const jsButtonClick = (name: string) => {
  jsEditor.value = !jsEditor.value;
  if (!Object.keys(formProps.value).includes(name)) {
    formProps.value[name] = "";
  }
  fieldName.value = name;
  jsValue.value = formProps.value[name];
};
// let fieldName = ref<String>("");
const configParams = async (params: any) => {
  fieldName.value = params["fieldName"];
  paramsDialogVisible.value = true;
  await nextTick();
  paramsConfigRef.value.setDataForm(formProps.value);
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
    item["tableShow"] = true;
    item["type"] = "input";
    item["formShow"] = true;
    if (item.searchFlag == "Y") {
      searchFieldList.push({...item, matchType: "lk", defaultShow: true})
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
const editContainerPrep = async () => {
  containerDialogVisible.value = true;
  await nextTick();
  containerPrepRef.value.setDataForm(formProps.value);
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
};
/**
 * 数据源操作框
 * @param _type
 */
const dataSource = async (_type: string) => {
  dataSourceDialogVisible.value = true;
  await nextTick();
  dataSourceFormRef.value.setDataForm(formProps.value);
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
const assignValue = (temp: any) => {
  try {
    currentField.value = temp;
    fieldList.value = temp.fields;
    advancedFieldList.value = temp.advancedFields;
    actions.value = temp.actions;
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
const handelAddItem = (_row: any) => {
  if (!formProps.value.values) {
    formProps.value["values"] = [];
  }
  formProps.value.values.push({});
};
const handelDeleteItem = (row: any) => {
  let data = formProps.value.values;
  for (let item in data) {
    let temp = data[item];
    if (temp.label == row.label) {
      data.splice(item, 1)
    }
  }
};
onMounted(() => {
  matchTypeList.value = searchMatchList();
});
watch(() => formProps,
    (_val: any) => {
      assignPrep(currentItemType.value, parentCompType.value == "item");
    }, {
      immediate: true,
      deep: true
    });
</script>
<template>
  <star-horse-dialog :dialogVisible="dataSourceDialogVisible" :title="'数据源配置'" :isBatch="false"
                     @merge="submitValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <star-horse-form :outerFormData="formProps" primary-key="" ref="dataSourceFormRef"
                     :fieldList="dataSourceFields(dataSourceFormRef,recall)"/>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="paramsDialogVisible" :title="'参数配置'" :isBatch="false"
                     @merge="paramsValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <star-horse-form :outerFormData="formInfo" ref="paramsConfigRef" :fieldList="paramsFields(fieldName,currentField)"/>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="containerDialogVisible"
                     :title="'设置容器'" :isBatch="false" @merge="containerAction"
                     @closeAction="closeAction"
                     @reset="resetForm" :selfFunc="true">
    <star-horse-form ref="containerPrepRef" :outerFormData="formInfo" :fieldList="containerField(currentItemType)"/>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="jsEditor" :title="'自定义信息'" :isBatch="false" @merge="closeAction"
                     @closeAction="closeAction"
                     @reset="closeAction" :selfFunc="true">
    <star-horse-editor
        v-model:value="formProps[fieldName]"
        lang=""
        ref="codeCompRef"
        style="height: 100%"
    />
  </star-horse-dialog>
  <el-form
      :model="formProps"
      :rules="formRules"
      class="dynamic-form"
      ref="itemPropertiesRef"
      size="small"
      label-position="top"
  >
    <el-collapse
        class="widget-collapse"
        :accordion="true"
        v-model="activeNames">
      <el-collapse-item name="1">
        <template #title>
          &nbsp;<star-horse-icon icon-class="base_preps"
                                 style="color: var(--star-horse-style)"/>&nbsp;&nbsp;<span>常用属性</span>
        </template>
        <el-scrollbar height="500">
          <template v-if="currentCompCategory==='container'&&currentItemType!='table'">
            <el-form-item
                label=""
                prop="rows"
            >
              <el-button @click="editContainerPrep">编辑容器属性</el-button>
            </el-form-item>
            <template v-for="(item) in fieldList">
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='input'"
              >
                <el-input
                    :placeholder="'请输入'+item.label"
                    v-model="formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='radio'"
              >
                <el-radio-group v-model="formProps[item.fieldName]">
                  <el-radio
                      :label="data"
                      :value="data"
                      v-for="data in JSON.parse(item.selectValues)"
                  />
                </el-radio-group>
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='checkbox'"
              >
                <el-checkbox-group v-model="formProps[item.fieldName]">
                  <el-checkbox
                      :label="data"
                      :value="data"
                      v-for="data in JSON.parse(item.selectValues)"
                  />
                </el-checkbox-group>
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='number'"
              >
                <el-input-number
                    :placeholder="'请输入'+item.label"
                    v-model="formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='switch'"
              >
                <el-switch
                    :active-value="JSON.parse(item.selectValues)[0]"
                    :inactive-value="JSON.parse(item.selectValues)[1]"
                    active-text="是"
                    inactive-text="否"
                    v-model="formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='button'"
              >
                <el-button>Click</el-button>
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='select'"
              >
                <el-select v-model="formProps[item.fieldName]">
                  <el-option
                      :label="data"
                      :value="data"
                      v-for="data in JSON.parse(item.selectValues)"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                  :label="item.label"
                  :prop="item.fieldName"
                  v-if="item.fieldType==='textarea'"
              >
                <el-input
                    :placeholder="'请输入'+item.label"
                    type="textarea"
                    v-model="formProps[item.fieldName]"
                />
              </el-form-item>
            </template>
          </template>
          <template v-else-if="currentItemType" v-for="(item) in fieldList">
            <el-form-item :label="item.label" :prop="item.fieldName" :required="item.required=='Y'"
                          :rules="[{required: item.required=='Y', message: '必填项不能为空', trigger: 'blur'}]">
              <el-input
                  v-if="item.fieldType==='input'"
                  :placeholder="'请输入'+item.label"
                  v-model="formProps[item.fieldName]"/>
              <el-radio-group v-model="formProps[item.fieldName]" v-if="item.fieldType==='radio'">
                <el-radio :label="data" :value="data" v-for="data in JSON.parse(item.selectValues)"/>
              </el-radio-group>
              <el-checkbox-group v-model="formProps[item.fieldName]" v-if="item.fieldType==='checkbox'">
                <el-checkbox :label="data" :value="data" v-for="data in JSON.parse(item.selectValues)"/>
              </el-checkbox-group>
              <el-input-number v-if="item.fieldType==='number'" :placeholder="'请输入'+item.label" v-model=
                  "formProps[item.fieldName]"/>
              <el-switch v-if="item.fieldType==='switch'"
                         :active-value="JSON.parse(item.selectValues)[0]"
                         :inactive-value="JSON.parse(item.selectValues)[1]"
                         active-text="是"
                         inactive-text="否"
                         v-model="formProps[item.fieldName]"
              />
              <el-button v-if="item.fieldType==='button'" @click="jsButtonClick(item.fieldName)">添加代码
              </el-button>
              <el-button v-if="item.fieldType==='config'" @click="configParams(item)">参数配置
              </el-button>
              <el-button v-if="item.fieldType==='data'" @click="dataSource(formProps['itemType'])">添加数据源
              </el-button>
              <el-select v-model="formProps[item.fieldName]" v-if="item.fieldType==='select'">
                <el-option :label="data.name||data" :value="data.value||data"
                           v-for="data in JSON.parse(item.selectValues)"/>
              </el-select>
              <el-input v-if="item.fieldType==='textarea'"
                        :placeholder="'请输入'+item.label"
                        type="textarea" v-model="formProps[item.fieldName]"/>
            </el-form-item>
          </template>
          <template v-if="currentField?.itemType==='checkbox'||currentField?.itemType==='radio'">
            <el-table
                :data="formProps.values"
                :fit=true
                :row-class-name="rowClassName">
              <el-table-column label="标签名称" prop="label">
                <template #default="scope">
                  <el-input v-model="scope.row.label"/>
                </template>
              </el-table-column>
              <el-table-column label="选中值" prop="trueLabel">
                <template #default="scope">
                  <el-input v-model="scope.row.trueLabel"/>
                </template>
              </el-table-column>
              <el-table-column label="未选中值" prop="falseLabel">
                <template #default="scope">
                  <el-input v-model="scope.row.falseLabel"/>
                </template>
              </el-table-column>
              <el-table-column
                  align="center"
                  prop="oper"
                  label="操作"
                  width="60px">
                <template #default="scope">
                <span
                    @click="handelDeleteItem(scope.row)"
                    class="oper-btn"
                    title="删除行"
                    v-if="formProps.values?.length>1">
											<star-horse-icon icon-class="delete" style="color:indianred"/>
										</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="add-row" @click="handelAddItem">
              <star-horse-icon icon-class="plus" color="var(--star-horse-style)"/>
              加一行
            </div>
          </template>
        </el-scrollbar>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          &nbsp;<star-horse-icon icon-class="advance_preps" style="color: var(--star-horse-style)"/>&nbsp;&nbsp;<span>其他属性</span>
        </template>
        <el-scrollbar height="500">
          <template v-if="currentCompCategory==='container'">
          </template>
          <template v-if="currentItemType" v-for="(item) in advancedFieldList">
            <el-form-item
                :label="item.label"
                :prop="item.fieldName"
                :rules="[{required: item.required=='Y'||item.required, message: '必填项不能为空', trigger: 'blur'}]"
                :required="item.required=='Y'||item.required">
              <el-input v-if="item.fieldType==='input'"
                        :placeholder="'请输入'+item.label" v-model="formProps[item.fieldName]"/>
              <el-radio-group v-model="formProps[item.fieldName]" v-if="item.fieldType==='radio'">
                <el-radio :label="data" :value="data" v-for="data in JSON.parse(item.selectValues)"/>
              </el-radio-group>
              <el-checkbox-group v-model="formProps[item.fieldName]" v-if="item.fieldType==='checkbox'">
                <el-checkbox :label="data" :value="data" v-for="data in JSON.parse(item.selectValues)"/>
              </el-checkbox-group>
              <el-input-number v-if="item.fieldType==='number'"
                               :placeholder="'请输入'+item.label"
                               v-model="formProps[item.fieldName]"/>
              <el-switch v-if="item.fieldType==='switch'"
                         :active-value="JSON.parse(item.selectValues)[0]"
                         :inactive-value="JSON.parse(item.selectValues)[1]"
                         active-text="是"
                         inactive-text="否"
                         v-model="formProps[item.fieldName]"/>
              <el-button v-if="item.fieldType==='button'" @click="jsButtonClick(item.fieldName)">添加代码
              </el-button>
              <el-button v-if="item.fieldType==='config'" @click="configParams(item)">参数配置
              </el-button>
              <el-select v-model="formProps[item.fieldName]" v-if="item.fieldType==='select'">
                <el-option :label="data.name||data" :value="data||data.value"
                           v-for="data in JSON.parse(item.selectValues)"/>
              </el-select>
              <el-input v-if="item.fieldType==='textarea'"
                        :placeholder="'请输入'+item.label" type="textarea" v-model="formProps[item.fieldName]"/>
            </el-form-item>
          </template>
        </el-scrollbar>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          &nbsp;<star-horse-icon icon-class="event-action" style="color: var(--star-horse-style)"/>&nbsp;&nbsp;<span>自定义事件</span>
        </template>
        <el-scrollbar height="500">
          <template v-if="currentCompCategory==='container'">
          </template>
          <template
              v-else-if="currentItemType"
              v-for="(item) in actions">
            <el-form-item
                :label="item.label"
                :prop="item.actionName"
                v-if="item.fieldType==='button'">
              <el-button
                  @click="jsButtonClick(item.actionName)" size="small">
                <star-horse-icon icon-class="code" size="16px" style="color: var(--star-horse-style)"/>
                编辑事件代码
              </el-button>
            </el-form-item>
          </template>
        </el-scrollbar>
      </el-collapse-item>
    </el-collapse>
  </el-form>
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
  width: 200px;
  height: 100%;
}
</style>
