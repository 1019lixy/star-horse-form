/**
 * 工具参数
 */
import { reactive, ref } from 'vue';
import {
  apiInstance,
  ApiUrls,
  createCondition,
  FieldInfo,
  loadData,
  postRequest,
  SelectOption,
} from 'star-horse-lowcode';
import { loadDict } from '@/api/star_horse_apis';
import { createJoinCondition } from '@/api/star_horse_utils';

const apiUrl: ApiUrls = apiInstance(
  'userdb-manage',
  'userdb/formInstance/conToolManage/idToolManage/136',
);
const toolParamApi: ApiUrls = apiInstance(
  'continuous-manage',
  'continuous/toolParams',
);
const compileLanguageList = ref<SelectOption[]>([]);
const compileTypeList = ref<SelectOption[]>([]);
const languageVersionList = ref<SelectOption[]>([]);
const pluginVersionList = ref<SelectOption[]>([]);
const linkExecServerList = ref<SelectOption[]>([]);
const codeCommitorList = ref<SelectOption[]>([]);

const reportPersonList = ref<SelectOption[]>([]);
const reportTypeList = ref<SelectOption[]>([]);
const loadLanguageVersions = (val: string) => {
  let versionList = compileLanguageList.value.find(
    (item: any) => item.value == val,
  )?.versionList;
  languageVersionList.value =
    versionList?.map((item: any) => {
      return { name: item['toolVersion'], value: item['toolVersion'] };
    }) || [];
};

/**
 * 其它拓展配置
 */
const extendCommonFields: FieldInfo[] = [
  {
    fieldName: 'row1',
    collapseList: [
      {
        title: '高级设置',
        tabName: 'row1',
        subFormFlag: 'N',
        objectName: 'advancedSetting',
        fieldList: [
          [
            {
              label: '  ',
              type: 'checkbox',
              formVisible: true,

              fieldName: 'singleImageFlag',
              preps: {
                values: [{ name: '使用唯一镜像名称', value: 'Y' }],
                colspan: 6,
                border: 'Y',
              },
            },
            {
              label: '关联使用执行机',
              type: 'select',
              formVisible: true,

              fieldName: 'linkExecServer',
              preps: {
                values: linkExecServerList,
                colspan: 6,
              },
            },
          ],
        ],
      },
      {
        title: '运行结果通知',
        tabName: 'result',
        subFormFlag: 'Y',
        objectName: 'resultReport',
        fieldList: [
          [
            {
              label: '失败时通知',
              type: 'switch',
              defaultValue: 'N',
              fieldName: 'errorReport',
              formVisible: true,
              actions: {
                change: (val: any) => {
                  val['_errorReportPersonVisible'] = val['errorReport'];
                  val['_errorReportTypeVisible'] = val['errorReport'];
                },
              },
              preps: {
                activeValue: 'Y',
                inactiveValue: 'N',
                colspan: 6,
              },
            },
          ],
          {
            label: '通知人',
            type: 'checkbox',
            fieldName: 'errorReportPerson',
            actions: {
              change: (val: any) => {
                const temp = val['errorReportPerson'];
                val['_errorCodeCommitorVisible'] =
                  temp && temp.includes('coder') ? 'Y' : 'N';
              },
            },
            preps: {
              values: reportPersonList,
              border: 'Y',
            },
            brotherNodes: [
              {
                type: 'select',
                label: '  ',

                fieldName: 'errorCodeCommitor',
                preps: {
                  values: codeCommitorList,
                  multiple: true,
                },
              },
            ],
          },
          {
            label: '通知方式',
            type: 'checkbox',

            fieldName: 'errorReportType',
            preps: {
              values: reportTypeList,
              border: 'Y',
            },
          },
          [
            {
              label: '成功时通知',
              type: 'switch',
              defaultValue: 'N',
              fieldName: 'successReport',
              actions: {
                change: (val: any) => {
                  val['_successReportPersonVisible'] = val['successReport'];
                  val['_successReportTypeVisible'] = val['successReport'];
                },
              },
              formVisible: true,
              preps: {
                activeValue: 'Y',
                inactiveValue: 'N',
                colspan: 6,
              },
            },
          ],
          {
            label: '通知人',
            type: 'checkbox',

            actions: {
              change: (val: any) => {
                const temp = val['successReportPerson'];
                val['_successCodeCommitorVisible'] =
                  temp && temp.includes('coder') ? 'Y' : 'N';
              },
            },

            fieldName: 'successReportPerson',
            preps: {
              values: reportPersonList,
              border: 'Y',
            },
            brotherNodes: [
              {
                type: 'select',
                label: '  ',
                fieldName: 'successCodeCommitorVisible',
                preps: {
                  values: codeCommitorList,
                  multiple: true,
                },
              },
            ],
          },
          {
            label: '通知方式',
            type: 'checkbox',
            fieldName: 'successReportType',
            preps: {
              values: reportTypeList,
            },
          },
        ],
      },
    ],
  },
];

const gradleTools = reactive<any>([
  [
    {
      label: 'Gradle版本',
      fieldName: 'pluginVersion',
      type: 'select',
      required: true,
      formVisible: true,
      preps: {
        values: pluginVersionList,
      },
    },
    {
      label: 'Gradle文件',
      fieldName: 'fileName',

      defaultValue: 'gradlew.bat',
      required: false,
      formVisible: true,
    },
  ],
  {
    label: '编译脚本',
    fieldName: 'compileScript',
    type: 'textarea',
    defaultValue: 'gradle build ',
    required: false,
    formVisible: true,
  },
]);
const antTools = reactive<any>([
  [
    {
      label: 'Ant版本',
      fieldName: 'pluginVersion',
      type: 'select',
      required: true,
      formVisible: true,
      preps: {
        values: pluginVersionList,
      },
    },
    {
      label: 'Ant文件',
      fieldName: 'fileName',

      defaultValue: 'build.xml',
      required: false,
      formVisible: true,
    },
  ],
  {
    label: '编译脚本',
    fieldName: 'compileScript',
    type: 'textarea',
    defaultValue: 'ant build ',
    required: false,
    formVisible: true,
  },
]);

const dataInit = () => {
  if (!compileLanguageList.value || compileLanguageList.value.length == 0) {
    let masterFields = ['toolType', 'toolCode', 'toolName', 'defaultParams'];
    postRequest(apiUrl.basePrefix + '/joinQuery', {
      limitFields: masterFields,
      groupByFields: masterFields,
      groupName: 'versionList',
      joinTables: [
        {
          tableName: 'conToolVersion',
          joinType: 'inner',
          aliasName: 'b',
          limitFields: ['toolVersion', 'toolSubVersion', 'privateParams'],
          joinCondition: {
            joinFieldList: [
              createJoinCondition('a.idToolManage', 'b.idToolManage'),
            ],
          },
        },
      ],
      whereCondition: {
        fieldList: [
          createCondition('a.toolType', ['language', 'compile'], 'in'),
        ],
      },
    }).then((res: any) => {
      let reData = res.data;
      if (reData.code) {
        console.log('加载编译语言失败');
        return;
      }
      compileLanguageList.value = reData?.data
        .filter((item: any) => item.toolType == 'language')
        .map((item: any) => {
          return {
            name: item['toolName'],
            value: item['toolCode'],
            versionList: item['versionList'],
          };
        }); // 加载编译语言
      compileTypeList.value = reData?.data
        .filter((item: any) => item.toolType == 'compile')
        .map((item: any) => {
          return {
            name: item['toolName'],
            value: item['toolCode'],
            versionList: item['versionList'],
          };
        }); // 加载编译工具
    });
  }
  loadDict('message_tools').then((res: any) => {
    reportTypeList.value = res;
  });
  loadDict('CONTINUS_JOB_REPORT_PERSON').then((res: any) => {
    reportPersonList.value = res;
  });
};
const loadToolParams = async (toolName: string) => {
  let reData = await loadData(
    `${toolParamApi.basePrefix}/queryByToolName/${toolName}`,
    {},
  );
  return reData?.data;
};
// 加载插件
const loadPlugin = async (name: string) => {
  let versionList = compileTypeList.value.find(
    (item: any) => item.value == name,
  )?.versionList;
  pluginVersionList.value =
    versionList?.map((item: any) => {
      return { name: item['toolVersion'], value: item['toolVersion'] };
    }) || [];
  return await loadToolParams(name);
};
export {
  gradleTools,
  antTools,
  compileLanguageList,
  compileTypeList,
  languageVersionList,
  pluginVersionList,
  linkExecServerList,
  codeCommitorList,
  extendCommonFields,
  loadPlugin,
  dataInit,
};
