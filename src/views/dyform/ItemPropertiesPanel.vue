<script setup lang = "ts" name = "ItemPropertiesPanel">
import {inject, nextTick, onMounted, reactive, ref, Ref, unref} from 'vue'
import {confirm} from "@/utils/message";
import {dictData, loadData, rowClassName, searchMatchList} from "@/api/sh_api";
import type {FormRules} from 'element-plus'
import {SelectOption} from "@/components/types/SearchProps";

let formDatas = inject("activeItemData") as Ref;
const fieldList = ref<any>({});
const formProps = ref<any>({});
const advancedFieldList = ref<any>({});
const actions = ref<any>({});
const currentField = ref<any>({});
let jsEditor = ref<boolean>(false);
let containerDialogVisible = ref<boolean>(false);
let dataSourceDialogVisible = ref<boolean>(false);
let activeNames = ref("1");
let formRules = ref({});
let jsValue = ref<string>("console.log('hello world')");
let fieldName = ref<string>('');
const codeCompRef = ref<any>(null);
const dataSourceFormRef = ref<any>(null);
let validErrorMsg = ref<string>();
let validSuccessMsg = ref<string>();
const urlValid = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error("必填项不能为空"));
  }
  let temp = unref(formProps);
  let dataSource = temp['dataSource'];
  let requestType = temp['requestType'];
  let values = temp['values'] as string;
  if (dataSource == "url" && !checkHttpUrl(values)) {
    callback(new Error("非法接口地址"));
  }
  callback();
};
const dataRules = reactive<FormRules>({
  values: [{validator: urlValid, trigger: "blur"}],
  requestType: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  name: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  value: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  matchType: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  selectLabel: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  selectValue: [{required: true, message: "必填项不能为空", trigger: "blur"}],

});
//-----------------------数据源相关属性---------------------
let matchTypeList = ref<SelectOption[]>();
onMounted(() => {
  matchTypeList.value = searchMatchList();

})
const jsButtonClick = (name: string) => {
  jsEditor.value = !jsEditor.value;
  let code = formProps.value[name];
  jsValue.value = code ? code : "";
  fieldName.value = name;
};
const changeValue = (name: string, data: any) => {
  formProps.value[name] = data;
};
const handelDelete = (rows: any) => {
  let items = formProps.value.elements;
  confirm('删除行，已设置组件可能丢失，确认删除吗？').then(res => {
    if (res) {
      for (let item in items) {
        let temp = items[item];
        if (temp.xh == rows.xh) {
          items.splice(item, 1)
        }

      }
    }

  })
};
const handelDeleteCol = (row: any, srow: any) => {
  confirm('删除列，已设置组件将丢失，确认删除吗？').then(res => {
    if (res) {
      for (let item in row.columns) {
        let temp = row.columns[item];
        if (temp.colIndex == srow.colIndex) {
          row.columns.splice(item, 1)
        }
      }
      countColumns(row);
    }
  });
};
const handelAddRow = () => {

  if (!formProps.value.elements) {
    formProps.value["elements"] = [];
  }
  if (currentField.value.itemType == "tab") {
    formProps.value.elements.push({
      items: []
    });
  } else {
    formProps.value.elements.push({
      rowIndex: formProps.value.elements.length + 1,
      columns: [{colIndex: 1, colspan: 24, items: []}]
    })
  }

};
const handelAddData = () => {
  if (!formProps.value.values) {
    formProps.value["values"] = [];
  }
  formProps.value.values.push({})
};
const handelDeleteData = (row: any) => {
  let data = formProps.value.values;
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
/**
 * 验证是否url
 * @param url
 */
const checkHttpUrl = (url: string): boolean => {
  let givenURL;
  try {
    givenURL = new URL(url);
  } catch (error) {
    console.log("error is", error)
    return false;
  }
  return givenURL.protocol === "http:" || givenURL.protocol === "https:";
}

const validEmpty = async () => {
  let flag = false;
  await dataSourceFormRef.value.validate((res: boolean) => {
    flag = res;
  });
  return flag;
};
const submitValid = async () => {
  let flag = await validInterface();
  if (flag) {
    closeAction();
  }
};
const handelAddParamData = () => {
  if (!formProps.value.queryParams) {
    formProps.value["queryParams"] = [];
  }
  formProps.value.queryParams.push({matchType: "eq"});
};
const handelDeleteParamData = (row: any) => {
  let data = formProps.value.queryParams;
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
const handelAddItem = (row: any) => {
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
const handelAddCol = (row: any) => {
  if (!row.columns) {
    row.columns = [];
  }
  row.columns.push({
    colIndex: row.columns.length + 1,
    colspan: 24,
    items: []
  });
  countColumns(row);
};
const countColumns = (row: any) => {
  let span = parseInt(String(24 / row.columns.length));
  row.columns.forEach((item: any) => {
    item.colspan = span;
  });
};

const merge = () => {
  let code = unref(codeCompRef).exportCode();
  let eventName = unref(codeCompRef).eventName;
  jsEditor.value = false;
  formProps.value[eventName] = code;
  // console.log(code, eventName);
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
let dataList = ref<SelectOption[]>([]);
let tempData = ref<string>();
const validInterface = async () => {
  let flag = await validEmpty();
  clearMsg();
  if (!flag) {
    return flag;
  }
  let temp = unref(formProps);
  let dataSource = temp['dataSource'];
  let requestType = temp['requestType'];
  let urlOrDictName = temp['urlOrDictName'];
  let params = temp['queryParams'];
  if (dataSource == "url") {
    let requestParams = [] as any;
    if (params && params.length > 0) {
      params.forEach((item: any) => {
        requestParams.push({
          propertyName: item.name,
          value: item.value,
          operation: item.matchType
        });
      });
    }
    let checkParams: any = {
      url: urlOrDictName,
      httpMethod: requestType.toUpperCase(),
      params: requestParams
    };
    let {data, error} = await loadData("/userdb-manage/userdb/dynamicForm/validInterface", checkParams);
    if (error) {
      flag = false;
      validErrorMsg.value = error;
    } else {
      let element = data[0];
      let keys = Object.keys(element);
      if (!(keys.find(item => item == temp["selectLabel"]))) {
        flag = false;
        validErrorMsg.value = "验证失败\n【标签名字段】错误：" + JSON.stringify(keys);
      } else if (!(keys.find(item => item == temp["selectValue"]))) {
        flag = false;
        validErrorMsg.value = "验证失败\n【标签值字段】错误：" + JSON.stringify(keys);
      } else {
        validSuccessMsg.value = "验证成功";
        data.forEach(item => {
          if (dataList.value) {
            dataList.value.push({name: item[temp["selectLabel"]], value: item[temp["selectValue"]]});
          }
        })
      }
    }
  } else if (dataSource == "dict") {
    let dicts = await dictData(urlOrDictName);
    if (Object.keys(dicts).length == 0) {
      flag = false;
      validErrorMsg.value = "验证失败\n数据字典可能未配置";
    } else {
      dataList.value = dicts;
      validSuccessMsg.value = "验证成功";
    }
  } else {
    //静态数据
    let datas = temp['values'] as SelectOption[];
    if (Object.keys(datas).length == 0) {
      flag = false;
      validErrorMsg.value = "验证失败\n请设置数据";
    } else {
      dataList.value = datas;
      validSuccessMsg.value = "验证成功";
    }

  }
  setTimeout(() => {
    clearMsg();
  }, 10000);
  return flag;
};
const clearMsg = () => {
  validErrorMsg.value = "";
  validSuccessMsg.value = "";
};
const editContainerPrep = () => {
  containerDialogVisible.value = true;
}
const closeAction = () => {
  jsEditor.value = false;
  containerDialogVisible.value = false;
  dataSourceDialogVisible.value = false;
};
/**
 * 数据源操作框
 * @param type
 */
const dataSource = (type: string) => {
  dataSourceDialogVisible.value = true;
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
  currentField.value = temp;
  fieldList.value = temp.fields;
  advancedFieldList.value = temp.advancedFields;
  actions.value = temp.actions;
};
let formDataList = ref<any>();
let containerList = ref<any>();
let selfFormDataList = ref<any>();
/**
 * 集合当前编辑属性对应的参数信息
 * @param item
 * @param itemType
 * @param isItem
 */
const activeItem = (item: any, itemType: string, isItem: boolean) => {
  formProps.value = item;
  assignPrep(itemType, isItem);
};
const dataInit = (container: any, items: any, selfItems: any) => {
  containerList.value = container;
  formDataList.value = items;
  selfFormDataList.value = selfItems;
};
defineExpose({
  dataInit, activeItem
})
</script>
<template>
  <star-horse-dialog :dialogVisible = "dataSourceDialogVisible" :title = "'数据源配置'" :isBatch = "false"
                     @merge = "submitValid"
                     @closeAction = "closeAction"
                     @reset = "resetDataSourceForm" :selfFunc = "true">
    <el-form :model = "formProps" :rules = "dataRules" ref = "dataSourceFormRef">
      <el-row>
        <el-col :span = "8">
          <el-form-item label = "表单属性">{{ formProps["label"] }}</el-form-item>
        </el-col>
        <el-col :span = "16">
          <el-form-item label = "数据源类型" prop = "dataSource" required>
            <el-select placeholder = "请选择数据源类型" v-model = "formProps['dataSource']">
              <el-option value = "url" label = "动态接口"/>
              <el-option value = "dict" label = "数据字典"/>
              <el-option value = "data" label = "静态数据"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if = "formProps['dataSource']=='url'||formProps['dataSource']=='dict'">
        <el-col :span = "20">
          <template v-if = "formProps['dataSource']=='url'">
            <el-row>
              <el-col :span = "18">
                <el-form-item label = "接口地址" prop = "values" required>
                  <el-input v-model = "formProps['urlOrDictName']" clearable placeholder = "请输入地址"/>
                </el-form-item>
              </el-col>
              <el-col :span = "6">
                <el-form-item label = "请求方式" prop = "requestType" required>
                  <el-select v-model = "formProps['requestType']" filterable clearable placeholder = "请选择请求方式">
                    <el-option label = "POST" value = "post"/>
                    <el-option label = "GET" value = "get"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span = "12">
                <el-form-item label = "标签名字段" prop = "selectLabel" required>
                  <el-input v-model = "formProps['selectLabel']" clearable placeholder = "请输入标签名字段名，如：name"/>
                </el-form-item>
              </el-col>
              <el-col :span = "12">
                <el-form-item label = "标签值字段" prop = "selectValue" required>
                  <el-input v-model = "formProps['selectValue']" clearable placeholder = "请输入标签值字段名,如：value"/>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label = "参数" v-if = "formProps['requestType']=='post'">
              <el-table
                  :data = "formProps['queryParams']"
                  :fit = true
                  :row-class-name = "rowClassName"
                  border
                  :height = "'200px'"
                  ref = "queryParamsRef"
              >
                <el-table-column
                    :show-overflow-tooltip = "true"
                    :width = "60"
                    label = "行号"
                    prop = "rowIndex"
                    v-if = "true ">
                  <template #default = "scope">
                    <el-form-item :prop = "'queryParams.'+scope.$index+'.rowIndex'">
                      {{ scope.row.xh }}
                    </el-form-item>
                  </template>

                </el-table-column>
                <el-table-column prop = "name" label = "参数名">
                  <template #default = "scope">
                    <el-form-item required
                                  :rules = "dataRules['name']"
                                  :prop = "'queryParams.'+scope.$index+'.name'">
                      <el-input v-model = "scope.row.name"/>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop = "value" label = "参数值">
                  <template #default = "scope">
                    <el-form-item required :rules = "dataRules['value']" :prop = "'queryParams.'+scope.$index+'.value'">
                      <el-input v-model = "scope.row.value"/>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop = "matchType" label = "匹配方式">
                  <template #default = "scope">
                    <el-form-item required :rules = "dataRules['matchType']"
                                  :prop = "'queryParams.'+scope.$index+'.matchType'">
                      <el-select v-model = "scope.row.matchType">
                        <el-option :value = "item.value" :label = "item.name" :key = "item.value" v-for = "item in
                      matchTypeList"/>
                      </el-select>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                    align = "center"
                    prop = "oper"
                    width = "100px"
                >
                  <template #header>
										<span
                        @click = "handelAddParamData"
                        class = "oper-btn"
                        title = "添加"
                    >
                      操作
											<star-horse-icon icon-class = "add"/>
										</span>
                  </template>
                  <template #default = "scope">
										<span
                        @click = "handelAddParamData"
                        class = "oper-btn"
                        title = "添加"
                    >
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
                    <span
                        @click = "handelDeleteParamData(scope.row)"
                        class = "oper-btn"
                        title = "删除"
                        v-if = "formProps.queryParams.length>1"
                    >
											<star-horse-icon icon-class = "delete"/>
										</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </template>
          <el-form-item label = "字典名称" prop = "urlOrDictName" required v-else>
            <el-input v-model = "formProps['urlOrDictName']" clearable placeholder = "请输入字典名称"/>
          </el-form-item>
        </el-col>
        <el-col :span = "4">
          <el-button type = "primary" @click = "validInterface">
            <star-horse-icon icon-class = "check" style = "color:#f1f2f3"/>
            验证
          </el-button>
        </el-col>
      </el-row>

      <el-form-item label = "静态数据" v-else-if = "formProps['dataSource']=='data'">
        <el-table
            :data = "formProps['values']"
            :fit = true
            :row-class-name = "rowClassName"
            border
            :height = "'300px'"
            ref = "dataSourceRef"
        >
          <el-table-column
              :show-overflow-tooltip = "true"
              :width = "60"
              label = "行号"
              align = "center"
              prop = "rowIndex"
              v-if = "true ">
            <template #default = "scope">
              <el-form-item :prop = "'values.'+scope.$index+'.rowIndex'">
                {{ scope.row.xh }}
              </el-form-item>
            </template>

          </el-table-column>
          <el-table-column prop = "name" label = "属性名">
            <template #default = "scope">
              <el-form-item required :rules = "dataRules['name']"
                            :prop = "'values.'+scope.$index+'.name'">
                <el-input v-model = "scope.row.name"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop = "value" label = "属性值">
            <template #default = "scope">
              <el-form-item
                  required :rules = "dataRules['value']"
                  :prop = "'values.'+scope.$index+'.value'">
                <el-input v-model = "scope.row.value"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              align = "center"
              prop = "oper"
              width = "100px"
          >
            <template #header>
										<span
                        @click = "handelAddData"
                        class = "oper-btn"
                        title = "添加"
                    >
                      操作
											<star-horse-icon icon-class = "add"/>
										</span>
            </template>
            <template #default = "scope">
										<span
                        @click = "handelAddData"
                        class = "oper-btn"
                        title = "添加"
                    >
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
              <span
                  @click = "handelDeleteData(scope.row)"
                  class = "oper-btn"
                  title = "删除"
                  v-if = "formProps.values.length>1"
              >
											<star-horse-icon icon-class = "delete"/>
										</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <el-alert
        title = "正确"
        type = "success"
        :description = "validSuccessMsg"
        show-icon
        :closable = "false"
        v-if = "validSuccessMsg"
    >
      <el-select v-model = "tempData">
        <el-option v-for = "item in dataList" :value = "item.value" :label = "item.name" :key = "item.value"/>
      </el-select>
    </el-alert>
    <el-alert
        title = "错误"
        type = "error"
        :description = "validErrorMsg"
        show-icon
        :closable = "false"
        v-if = "validErrorMsg"
    />
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible = "containerDialogVisible"
                     :title = "'设置容器'" :isBatch = "false" @merge = "closeAction"
                     @closeAction = "closeAction"
                     @reset = "resetForm" :selfFunc = "true">
    <el-table
        v-if = "currentField.itemType!='tab'"
        :data = "formProps?.elements"
        :fit = true
        :row-class-name = "rowClassName"
        border
        max-height = "470px"
        ref = "containerRef"
    >
      <el-table-column
          :show-overflow-tooltip = "true"
          :width = "60"
          label = "行号"
          align = "center"
          prop = "rowIndex"
          v-if = "true ">
        <template #default = "scope">
          <el-form-item
              :prop = "'formProps.'+scope.$index+'.rowIndex'"
              v-if = "!false">
            {{ scope.row.xh }}
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
          :show-overflow-tooltip = "true"
          label = "列"
          prop = "colIndex"
          v-if = "true "
      >
        <template #default = "scope">
          <el-table
              :data = "scope.row.columns"
              :fit = true
              :row-class-name = "rowClassName"
              border
              ref = "stb"
          >
            <el-table-column label = "列宽">
              <template #default = "sscope">
                <el-form-item
                    :prop = "'scope.row.columns.'+sscope.$index+'.colspan'"

                >
                  <el-input-number
                      :min = "1"
                      :max = "24"
                      :step = "4"
                      controls-position = "right"
                      v-model = "sscope.row.colspan"

                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
                align = "center"
                prop = "oper"
                width = "100px"
            >
              <template #header>
										<span
                        @click = "handelAddCol(scope.row)"
                        class = "oper-btn"
                        title = "添加列"
                    >
                      操作
											<star-horse-icon icon-class = "add"/>
										</span>
              </template>
              <template #default = "sscope">
										<span
                        @click = "handelAddCol(scope.row)"
                        class = "oper-btn"
                        title = "添加列"
                    >
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
                <span
                    @click = "handelDeleteCol(scope.row,sscope.row)"
                    class = "oper-btn"
                    title = "删除列"
                    v-if = "scope.row.columns.length>1"
                >
											<star-horse-icon icon-class = "delete"/>
										</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
          align = "center"
          prop = "oper"
          width = "100px"
      >
        <template #header>
										<span
                        @click = "handelAddRow"
                        class = "oper-btn"
                        title = "添加行"
                    >
                      操作
											<star-horse-icon icon-class = "add"/>
										</span>
        </template>
        <template #default = "scope">
										<span
                        @click = "handelAddRow"
                        class = "oper-btn"
                        title = "添加行"
                    >
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
          <span
              @click = "handelDelete(scope.row)"
              class = "oper-btn"
              title = "删除行"
              v-if = "formProps.elements.length>1"
          >
											<star-horse-icon
                          icon-class = "delete"
                      />
										</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table
        v-else
        :data = "formProps?.elements"
        :fit = true
        :row-class-name = "rowClassName"
        border
        max-height = "470px"
        ref = "containerRef"
    >
      <el-table-column
          :show-overflow-tooltip = "true"
          :width = "60"
          label = "行号"
          align = "center"
          prop = "rowIndex"
          v-if = "true ">
        <template #default = "scope">
          <el-form-item
              :prop = "'formProps.'+scope.$index+'.rowIndex'"
              v-if = "!false">
            {{ scope.row.xh }}
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
          label = "Tab名字"
          prop = "label"
      >
        <template #default = "scope">
          <el-form-item
              :prop = "'scope.row.columns.'+scope.$index+'.label'"

          >
            <el-input
                clearable
                placeholder = "请输入Tab名称"
                v-model = "scope.row.label"

            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
          label = "Tab属性"
          prop = "name"
      >
        <template #default = "scope">
          <el-form-item
              :prop = "'scope.row.columns.'+scope.$index+'.name'"

          >
            <el-input
                clearable
                placeholder = "请输入Tab属性"
                v-model = "scope.row.name"

            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
          align = "center"
          prop = "oper"
          width = "100px"
      >
        <template #header>
										<span
                        @click = "handelAddRow"
                        class = "oper-btn"
                        title = "添加行"
                    >
                      操作
											<star-horse-icon icon-class = "add"/>
										</span>
        </template>
        <template #default = "scope">
										<span
                        @click = "handelAddRow"
                        class = "oper-btn"
                        title = "添加行"
                    >
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
          <span
              @click = "handelDelete(scope.row)"
              class = "oper-btn"
              title = "删除行"
              v-if = "formProps.elements.length>1"
          >
											<star-horse-icon
                          icon-class = "delete"
                      />
										</span>
        </template>
      </el-table-column>
    </el-table>
  </star-horse-dialog>

  <star-horse-dialog :dialogVisible = "jsEditor" :title = "'自定义事件'" :isBatch = "false" @merge = "merge"
                     @closeAction = "closeAction"
                     @reset = "resetForm" :selfFunc = "true">
    <!--    <code-js
            :fieldName = "fieldName"
            :value = "jsValue"
            ref = "codeCompRef"
            style = "height: 100%"
            @changeValue = "changeValue"
        />-->
  </star-horse-dialog>
  <el-scrollbar>
    <el-form
        :model = "formProps"
        :rules = "formRules"
        class = "dynamic-form"
        ref = "itemPropertiesRef"
        size = "small"
        label-position = "top"
    >
      <el-collapse
          class = "widget-collapse"
          v-model = "activeNames"
      >
        <el-collapse-item name = "1">
          <template #title>
            &nbsp;<star-horse-icon icon-class = "base_preps"/>&nbsp;&nbsp;<span>基础属性</span>
          </template>
          <template v-if = "formDatas?.compType==='container'">
            <el-form-item
                label = ""
                prop = "rows"
            >
              <el-button @click = "editContainerPrep">编辑容器属性</el-button>
            </el-form-item>
            <template v-for = "(item) in fieldList">
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='input'"
              >
                <el-input
                    :placeholder = "'请输入'+item.label"
                    v-model = "formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='radio'"
              >
                <el-radio-group v-model = "formProps[item.fieldName]">
                  <el-radio
                      :label = "data"
                      :value = "data"
                      v-for = "data in JSON.parse(item.selectValues)"
                  />
                </el-radio-group>
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='checkbox'"
              >
                <el-checkbox-group v-model = "formProps[item.fieldName]">
                  <el-checkbox
                      :label = "data"
                      :value = "data"
                      v-for = "data in JSON.parse(item.selectValues)"
                  />
                </el-checkbox-group>
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='number'"
              >
                <el-input-number
                    :placeholder = "'请输入'+item.label"
                    v-model = "formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='switch'"
              >
                <el-switch
                    :active-value = "JSON.parse(item.selectValues)[0]"
                    :inactive-value = "JSON.parse(item.selectValues)[1]"
                    active-text = "是"
                    inactive-text = "否"
                    v-model = "formProps[item.fieldName]"
                />
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='button'"
              >
                <el-button>Click</el-button>
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='select'"
              >
                <el-select v-model = "formProps[item.fieldName]">
                  <el-option
                      :label = "data"
                      :value = "data"
                      v-for = "data in JSON.parse(item.selectValues)"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                  :label = "item.label"
                  :prop = "item.fieldName"
                  v-if = "item.fieldType==='textarea'"
              >
                <el-input
                    :placeholder = "'请输入'+item.label"
                    type = "textarea"
                    v-model = "formProps[item.fieldName]"
                />
              </el-form-item>
            </template>
          </template>
          <template v-else v-for = "(item) in fieldList">

            <el-form-item :label = "item.label" :prop = "item.fieldName" :required = "item.required=='yes'"
                          :rules="[{required: item.required=='yes', message: '必填项不能为空', trigger: 'blur'}]">
              <el-input
                  v-if = "item.fieldType==='input'"
                  :placeholder = "'请输入'+item.label"
                  v-model = "formProps[item.fieldName]"/>
              <el-radio-group v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='radio'">
                <el-radio :label = "data" :value = "data" v-for = "data in JSON.parse(item.selectValues)"/>
              </el-radio-group>
              <el-checkbox-group v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='checkbox'">
                <el-checkbox :label = "data" :value = "data" v-for = "data in JSON.parse(item.selectValues)"/>
              </el-checkbox-group>
              <el-input-number v-if = "item.fieldType==='number'" :placeholder = "'请输入'+item.label" v-model =
                  "formProps[item.fieldName]"/>
              <el-switch v-if = "item.fieldType==='switch'"
                         :active-value = "JSON.parse(item.selectValues)[0]"
                         :inactive-value = "JSON.parse(item.selectValues)[1]"
                         active-text = "是"
                         inactive-text = "否"
                         v-model = "formProps[item.fieldName]"
              />
              <el-button v-if = "item.fieldType==='button'" @click = "jsButtonClick(item.eventName)">添加事件
              </el-button>
              <el-button v-if = "item.fieldType==='data'" @click = "dataSource(formProps['itemType'])">添加数据源
              </el-button>
              <el-select v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='select'">
                <el-option :label = "data.name||data" :value = "data.value||data"
                           v-for = "data in JSON.parse(item.selectValues)"/>
              </el-select>
              <el-input v-if = "item.fieldType==='textarea'"
                        :placeholder = "'请输入'+item.label"
                        type = "textarea" v-model = "formProps[item.fieldName]"/>
            </el-form-item>
          </template>
          <el-table v-if = "currentField?.itemType==='checkbox'||currentField?.itemType==='radio'"
                    :data = "formProps.values"
                    :fit = true
                    :row-class-name = "rowClassName">
            <el-table-column label = "标签名称" prop = "label">
              <template #default = "scope">
                <el-input v-model = "scope.row.label"/>
              </template>
            </el-table-column>
            <el-table-column label = "选中值" prop = "trueLabel">
              <template #default = "scope">
                <el-input v-model = "scope.row.trueLabel"/>
              </template>
            </el-table-column>
            <el-table-column label = "未选中值" prop = "falseLabel">
              <template #default = "scope">
                <el-input v-model = "scope.row.falseLabel"/>
              </template>
            </el-table-column>
            <el-table-column
                align = "center"
                prop = "oper"
                width = "60px">
              <template #header>
										<span
                        @click = "handelAddItem"
                        class = "oper-btn"
                        title = "添加行">
											<star-horse-icon icon-class = "add"/>
										</span>
              </template>
              <template #default = "scope">
										<span
                        @click = "handelAddItem"
                        class = "oper-btn"
                        title = "添加行">
											<star-horse-icon icon-class = "add"/>
										</span>&nbsp;&nbsp;
                <span
                    @click = "handelDeleteItem(scope.row)"
                    class = "oper-btn"
                    title = "删除行"
                    v-if = "formProps.values?.length>1">
											<star-horse-icon
                          icon-class = "delete"
                          style = "color:indianred"
                      />
										</span>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item name = "2">
          <template #title>
            &nbsp;<star-horse-icon icon-class = "advance_preps"/>&nbsp;&nbsp;<span>高级属性(未验证,慎用)</span>
          </template>
          <template v-if = "formDatas?.compType==='container'">
          </template>
          <template v-else v-for = "(item) in advancedFieldList">
            <el-form-item
                :label = "item.label"
                :prop = "item.fieldName"
                :rules="[{required: item.required=='yes'||item.required, message: '必填项不能为空', trigger: 'blur'}]"
                :required = "item.required=='yes'||item.required">
              <el-input v-if = "item.fieldType==='input'"
                        :placeholder = "'请输入'+item.label" v-model = "formProps[item.fieldName]"/>
              <el-radio-group v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='radio'">
                <el-radio :label = "data" :value = "data" v-for = "data in JSON.parse(item.selectValues)"/>
              </el-radio-group>

              <el-checkbox-group v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='checkbox'">
                <el-checkbox :label = "data" :value = "data" v-for = "data in JSON.parse(item.selectValues)"/>
              </el-checkbox-group>
              <el-input-number v-if = "item.fieldType==='number'"
                               :placeholder = "'请输入'+item.label"
                               v-model = "formProps[item.fieldName]"/>
              <el-switch v-if = "item.fieldType==='switch'"
                         :active-value = "JSON.parse(item.selectValues)[0]"
                         :inactive-value = "JSON.parse(item.selectValues)[1]"
                         active-text = "是"
                         inactive-text = "否"
                         v-model = "formProps[item.fieldName]"/>
              <el-button v-if = "item.fieldType==='button'" @click = "jsButtonClick(item.eventName)">添加事件
              </el-button>
              <el-select v-model = "formProps[item.fieldName]" v-if = "item.fieldType==='select'">
                <el-option :label = "data.name||data" :value = "data||data.value"
                           v-for = "data in JSON.parse(item.selectValues)"/>
              </el-select>
              <el-input v-if = "item.fieldType==='textarea'"
                        :placeholder = "'请输入'+item.label" type = "textarea" v-model = "formProps[item.fieldName]"/>
            </el-form-item>
          </template>
        </el-collapse-item>
        <el-collapse-item name = "3">
          <template #title>
            &nbsp;<star-horse-icon icon-class = "event-action"/>&nbsp;&nbsp;<span>自定义事件(未验证,慎用)</span>
          </template>
          <template v-if = "formDatas?.compType==='container'">
          </template>
          <template
              v-else
              v-for = "(item) in actions"
          >
            <el-form-item
                :label = "item.label"
                :prop = "item.actionName"
                v-if = "item.fieldType==='button'">
              <el-button
                  @click = "jsButtonClick(item.actionName)" size = "small">
                <star-horse-icon icon-class = "code" size = "16px"/>
                编辑事件代码
              </el-button>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </el-scrollbar>
</template>
<style lang = "scss" scoped>
:deep(.el-scrollbar) {
  height: 90% !important;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.oper-btn {
  cursor: pointer;
}

.dynamic-form {
  width: inherit;
  padding: 0 5px;
  height: 100%;
}
</style>