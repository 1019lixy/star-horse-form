<script setup lang="ts">
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {
  analysisAppComps,
  analysisCompDatas,
  apiInstance,
  ApiUrls, convertCompToAppComps,
  createDatetime,
  dialogPreps,
  SearchFields,
  UserFuncInfo,
} from "star-horse-lowcode";
import {TabsPaneContext} from "element-plus";
import {i18n} from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";
import {useFormRuleRuntime} from "@/components/rule/useFormRuleRuntime";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview: {type: Boolean, default: false},
  compList: {
    type: Array,
    required: true,
  },
});
const starHorseTableCompRef = ref();
const tabPageFormRef = ref();
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields | any>({});
const tableFieldList = ref<any>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
const fieldMappingList = ref<any>([]);
const dataSource = ref<any>({});
let dateFields = ref<Array<string>>([]);
const activeName = ref<string>("form");
let extBtns = ref<Array<UserFuncInfo>>([]);

// ==================== 规则引擎集成 ====================
const ruleFormId = computed(() => {
  const list = props.compList as any[];
  if (!list || list.length === 0) return '';
  return list[0]?.formId || list[0]?.preps?.formId || '';
});

const ruleFormData = computed(() => {
  return tabPageFormRef.value?.getFormData()?.value ?? {};
});

const {
  triggerOnLoad,
  triggerOnSubmit,
  loading: ruleLoading,
  currentFormId,
  isEnabled,
} = useFormRuleRuntime({
  formId: ruleFormId,
  formFields: tableFieldList,
  formData: ruleFormData,
  enabled: computed(() => !!ruleFormId.value),
});

const onFormDataLoaded = async () => {
  if (isEnabled.value && currentFormId.value) {
    await nextTick();
    await triggerOnLoad();
  }
};

const handleBeforeSubmit = async ({type, formData: fd}: {type: string; formData: any}) => {
  if (isEnabled.value && currentFormId.value) {
    const ok = await triggerOnSubmit();
    if (!ok) return false;
  }
};

const handleClick = (_tab: TabsPaneContext, _event: Event) => {
};

const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  primaryKey.value = "id";
  tableFieldList.value = analysisCompDatas(props.compList);
  if (props.currentPageClass == "main-design-phone") {
    tableFieldList.value = convertCompToAppComps(tableFieldList.value);
  }
  await nextTick();
  hasData.value = true;
  isLoading.value = false; // 加载完成
};

const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  await loadFormData();
};
const dataFormat = (name: string, cellValue: object, row: any): any => {
  if (dateFields.value.length > 0) {
    if (dateFields.value.includes(name)) {
      return createDatetime(cellValue);
    }
  }
  const subFormat = (name: string, cellValue: any, row: any) => {
    if (dataSource.value && Object.keys(dataSource.value).length > 0) {
      let temp = dataSource.value[name];
      if (temp) {
        let stemp = temp.datas?.find(
            (item: any) => item[temp.valueField] == cellValue,
        );
        return stemp ? stemp[temp.labelField] : cellValue || "--";
      }
    }
    return "null" == cellValue ? "--" : cellValue || "--";
  };
  if (fieldMappingList.value?.length > 0) {
    let temp = fieldMappingList.value.find(
        (item: any) => item["fieldName"] == name,
    );
    if (temp) {
      return row[temp.mappingDisplayField] || subFormat(name, cellValue, row);
    }
  }
  return subFormat(name, cellValue, row);
};
const dataRecall = (formData: any, result: any) => {
  if (props.preview) {
    starHorseTableCompRef.value?.assignStaticData(formData);
  } else {
    starHorseTableCompRef.value?.loadByPage()
  }
};
onMounted(async () => {
  await init();
});
watch(
    () => props.compList,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
watch(
    () => props.currentPageClass,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 - 带标签页样式 -->
    <CommonSkeleton
        v-if="isLoading"
        :showSearch="false"
        :showHeader="true"
        :showTabs="true"
        :showForm="true"
        :showTable="false"
        :formRowCount="6"
    />

    <template v-else-if="hasData">
      <star-horse-dialog
          :dialog-visible="dialogProps.viewVisible"
          :dialogProps="dialogProps"
          :source="3"
      >
        <star-horse-data-view
            :dataFormat="dataFormat"
            :primary-key="primaryKey"
            :dynamicForm="true"
            :preview="preview"
            :field-list="tableFieldList"
            :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <el-card class="inner_content">
        <el-tabs
            v-model="activeName"
            type="border-card"
            @tab-click="handleClick"
        >
          <el-tab-pane
              :label="i18n('commonPage.tab.form')"
              name="form"
              class="flex flex-col"
          >
            <star-horse-form
                @refresh="dataRecall"
                @dataLoaded="onFormDataLoaded"
                @beforeSubmit="handleBeforeSubmit"
                :dynamicForm="true"
                :compUrl="dataUrl"
                :formInfo="formInfo"
                :preview="preview"
                :fieldList="tableFieldList"
                :rules="rules"
                :globalCondition="relationTables"
                :typeModel="'form'"
                ref="tabPageFormRef"
            />
          </el-tab-pane>
          <el-tab-pane :label="i18n('commonPage.tab.dataList')" name="table">
            <div
                class="search-content"
                v-if="searchFormData.fieldList?.length > 0"
            >
              <div class="search_btn">
                <star-horse-search-comp
                    @searchData="
                    (data: any) =>
                      starHorseTableCompRef?.createSearchParams(data)
                  "
                    :formData="searchFormData"
                    :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
                ref="starHorseTableCompRef"
                :fieldList="tableFieldList"
                :primaryKey="primaryKey"
                :compUrl="dataUrl"
                :globalConfig="relationTables"
                :isDynamic="true"
                :preview="preview"
                :btnPermissions="{
                add: 'add',
                edit: 'eidt',
                view: 'view',
              }"
                :extendBtns="extBtns"
                :showBatchField="true"
                :dataFormat="dataFormat"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
<style scoped></style>
