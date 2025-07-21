<script setup lang="ts">
import {loadDict} from '@/api/star_horse_apis';
import {loadSvgIconsByPath} from '@/api/star_horse_utils';
import {httpMethod} from '@/api/system';
import {createData, urlReturnDataHelpMsg, validInterface, validOperation,} from '@/views/dyform/utils/ItemPreps';
import {error, PageFieldInfo, searchMatchList, SelectOption,} from 'star-horse-lowcode';
import {ModelRef, nextTick, onMounted, PropType, reactive, ref, unref, watch,} from 'vue';

defineOptions({
  name: 'DataSourceComp',
});
const props = defineProps({
  formProps: { type: Object as PropType<any> },
  preps: { type: Object as PropType<any> },
  item: { type: Object as PropType<PageFieldInfo>, required: true },
});
const dataSourceList: Array<SelectOption> = [
  { value: 'data', name: '静态数据' },
  { value: 'url', name: '动态接口' },
  { value: 'dict', name: '数据字典' },
];
const dataSourceFormRef = ref();
const dataForm: ModelRef<any> = defineModel('dataForm');
const matchTypeList = searchMatchList();
const disableData = ref<boolean>(false);
const disableUrl = ref<boolean>(true);
const disableDict = ref<boolean>(true);
const dataRequired = ref<boolean>(true);
const urlRequired = ref<boolean>(false);
const dictRequired = ref<boolean>(false);
const currentTabName = ref<string>('data');
const fieldList = ref<SelectOption[]>([]);
let envList = ref<Array<SelectOption>>([]);

const innerFunc = (type: string) => {
  disableData.value = true;
  disableUrl.value = true;
  disableDict.value = true;
  dataRequired.value = false;
  urlRequired.value = false;
  dictRequired.value = false;
  currentTabName.value = type;
  if (type == 'url') {
    disableUrl.value = false;
    urlRequired.value = true;
  } else if (type == 'data') {
    disableData.value = false;
    dataRequired.value = true;
  } else if (type == 'dict') {
    disableDict.value = false;
    dictRequired.value = true;
  }
};
const analysisOptionData = (val: any) => {
  const temp = unref(val);
  console.log('开始解析数据', temp);
  const analysisValue = temp['analysisValue'];
  if (temp['analysisType'] === 'path') {
    if (!analysisValue) {
      error('请填写解析路径');
      return;
    }
    // 添加public路径处理
    const publicPath = `/${analysisValue}`.replace(/\/+/g, '/');
    temp['values'] = loadSvgIconsByPath(publicPath);
  } else if (temp['analysisType'] === 'func') {
    if (!analysisValue) {
      error('请填写函数名');
      return;
    }
    import('@/api/star_horse_utils').then(async (utils) => {
      if (utils && utils[analysisValue]) {
        // 确保函数存在
        if (typeof utils[analysisValue] === 'function') {
          try {
            const result = await utils[analysisValue]();
            temp.values = Array.isArray(result) ? result : [];
          } catch (e) {
            error(`函数执行失败: ${e.message}`);
          }
        } else {
          error('指定函数不存在');
        }
      } else {
        error('未找到指定的工具函数');
      }
    });
  }
};
const dataSourceField = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: '表单属性',
        fieldName: 'label',
        type: 'tag',
        formVisible: true,
        listVisible: true,
        preps: {
          colspan: 8,
        },
      },
      {
        label: '数据源类型',
        fieldName: 'dataSource',
        type: 'radio',
        required: true,
        formVisible: true,
        listVisible: true,
        defaultValue: 'data',
        actions: {
          change: (val: any) => {
            const type = val['dataSource'];
            innerFunc(type);
          },
        },
        preps: {
          values: dataSourceList,
          radioType: 'button',
        },
      },
    ],
    {
      fieldName: currentTabName,
      tabList: [
        {
          title: '静态数据',
          tabName: 'data',
          disabled: disableData,
          fieldList: [
            [
              {
                label: '解析方式',
                fieldName: 'analysisType',
                helpMsg:
                  '路径解析：只能解析项目public下的子路径，格式为 test/*.svg，\n函数解析：只能解析src/api/star_horse_utils.ts下的无参函数，格式为: analysisData',
                type: 'radio',
                formVisible: true,
                defaultValue: 'func',
                preps: {
                  values: [
                    { name: '路径', value: 'path', disabled: true },
                    { name: '函数', value: 'func' },
                  ],
                  colspan: 8,
                },
              },
              {
                label: '值',
                fieldName: 'analysisValue',
                type: 'input',
                formVisible: true,
                preps: {
                  colspan: 14,
                },
              },
              {
                label: '解析',
                fieldName: 'btn',
                type: 'button',
                formVisible: true,
                actions: { click: (val: any) => analysisOptionData(val) },
                preps: {
                  colspan: 2,
                },
              },
            ],
          ],
          batchFieldList: [
            {
              batchName: 'values',
              importInfo: {
                importDataUrl: '/api/star_horse/dyform/importData',
                downloadTemplateUrl: '/api/star_horse/dyform/downloadData',
              },
              fieldList: [
                {
                  label: '属性名',
                  fieldName: 'name',

                  required: dataRequired,
                  formVisible: true,
                  listVisible: true,
                },
                {
                  label: '属性值',
                  fieldName: 'value',

                  required: dataRequired,
                  formVisible: true,
                  listVisible: true,
                },
              ],
            },
          ],
        },
        {
          title: '动态接口参数',
          tabName: 'url',
          disabled: disableUrl,
          fieldList: [
            [
              {
                label: '系统环境',
                fieldName: 'env',
                type: 'select',
                required: urlRequired,
                defaultValue: '',
                formVisible: true,
                listVisible: true,
                preps: {
                  values: envList,
                },
              },
              {
                label: '请求方式',
                fieldName: 'httpMethod',
                type: 'select',
                required: urlRequired,
                defaultValue: 'POST',
                formVisible: true,
                listVisible: true,
                preps: {
                  values: httpMethod(),
                },
              },
              {
                label: '协议',
                fieldName: 'protocol',
                type: 'select',
                required: urlRequired,
                defaultValue: 'http',
                formVisible: true,
                listVisible: true,
                preps: {
                  values: [
                    { name: 'HTTP', value: 'http' },
                    { name: 'HTTPS', value: 'https' },
                  ],
                },
              },
            ],
            [
              {
                label: 'IP/域名/服务名',
                fieldName: 'host',
                required: urlRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 16,
                },
              },
              {
                label: '端口',
                fieldName: 'port',
                type: 'number',
                min: 1,
                max: 65535,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 8,
                },
              },
            ],
            [
              {
                label: '接口地址',
                fieldName: 'interfaceUrl',
                required: urlRequired,
                helpMsg: urlReturnDataHelpMsg,
                formVisible: true,
                preps: {
                  colspan: 20,
                },
              },
              {
                label: '校验',
                type: 'button',
                formVisible: true,
                actions: {
                  click: async (val: any) => {
                    await validOperation(
                      val,
                      dataSourceFormRef,
                      fieldList,
                      disableUrl,
                      !dataForm.value,
                      dataForm,
                    );
                  },
                },
                preps: {
                  icon: 'valid',
                  colspan: 4,
                },
              },
            ],
            [
              {
                label: '标签名字段',
                fieldName: 'selectLabel',
                type: 'select',

                required: urlRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  values: fieldList,
                },
              },
              {
                label: '标签值字段',
                fieldName: 'selectValue',
                type: 'select',
                preps: {
                  values: fieldList,
                },
                required: urlRequired,
                formVisible: true,
                listVisible: true,
              },
            ],
            {
              fieldName: 'queryParams',
              tabList: [
                {
                  title: '标准参数',
                  tabName: 'queryParams',
                  objectName: 'queryParams',
                  batchFieldList: [
                    {
                      batchName: 'queryParams',
                      fieldList: [
                        {
                          label: '参数名',
                          fieldName: 'name',
                          type: 'select',
                          required: urlRequired,
                          formVisible: true,
                          listVisible: true,
                          preps: {
                            values: fieldList,
                            allowCreate: 'Y',
                          },
                        },
                        {
                          label: '参数值',
                          fieldName: 'value',

                          required: urlRequired,
                          formVisible: true,
                          listVisible: true,
                        },
                        {
                          label: '匹配方式',
                          fieldName: 'matchType',
                          type: 'select',
                          defaultValue: 'eq',
                          required: urlRequired,
                          formVisible: true,
                          listVisible: true,
                          preps: {
                            values: matchTypeList,
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  title: '自定义参数',
                  tabName: 'customParams',
                  objectName: 'customParams',
                  fieldList: [
                    {
                      fieldName: 'customParams',
                      label: '自定义JSON参数',
                      type: 'json',
                      formVisible: true,
                      listVisible: true,
                      required: urlRequired,
                      defaultValue: '',
                      preps: {
                        devType: 'Y',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: '数据字典',
          tabName: 'dict',
          disabled: disableDict,
          fieldList: [
            [
              {
                label: '字典名称',
                fieldName: 'urlOrDictName',
                required: dictRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 20,
                },
              },
              {
                label: '验证',
                fieldName: 'urlOrDictNameBtn',
                type: 'button',
                actions: {
                  click: async (val: any) => {
                    await validOperation(
                      val,
                      dataSourceFormRef,
                      fieldList,
                      disableUrl,
                      !dataForm.value,
                      dataForm,
                    );
                  },
                },
                required: dictRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 4,
                  icon: 'valid',
                },
              },
            ],
          ],
        },
      ],
    },
  ],
});
const submitValid = async () => {
  let flag: boolean = false;
  await validInterface(
    props.formProps,
    dataSourceFormRef,
    (dataList: any, _successMsg: string, errorMsg: string) => {
      if (!errorMsg) {
        //只保存静态数据,
        if (props.formProps) {
          props.formProps['values'] = createData(
            dataSourceFormRef,
            dataList,
          ).reDataList;
        }
        flag = true;
      } else {
        error(errorMsg);
        flag = false;
      }
    },
    !dataForm.value,
    dataForm,
  );
  return flag;
};
const isInited = ref<boolean>(false);
const init = () => {
  loadDict('system_environment').then((res) => {
    envList.value = res;
  });
  nextTick(() => {
    if (props.preps?.objectName && dataForm.value) {
      let temp = dataForm.value;

      setFormData(temp);
      currentTabName.value = temp.dataSource || 'data';
      isInited.value = true;
    }
  });
};
const setFormData = (data: any) => {
  !dataForm.value && dataSourceFormRef.value?.setFormData(data);
};
const getFormData = () => {
  return dataSourceFormRef.value?.getFormData();
};
watch(
  () => dataForm.value?.dataSource,
  (val) => {
    currentTabName.value = val || 'data';
  },
);
onMounted(() => {
  init();
});

defineExpose({
  submitValid,
  setFormData,
  getFormData,
});
</script>

<template>
  <el-scrollbar height="100%">
    <star-horse-form
      :fieldList="dataSourceField"
      ref="dataSourceFormRef"
      v-if="!dataForm"
    />
    <star-horse-form-item
      v-else
      ref="dataSourceFormRef"
      :fieldList="dataSourceField"
      :dataIndex="(props.preps?.params?.totalTab || 1) - 1"
      :subFormFlag="'Y'"
      :objectName="'dataSource'"
      v-model:dataForm="dataForm"
    />
  </el-scrollbar>
</template>

<style scoped lang="scss"></style>
