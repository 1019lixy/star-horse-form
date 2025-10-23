/**
 * 工具参数
 */
import { reactive, ref } from "vue";
import { FieldInfo, SelectOption } from "star-horse-lowcode";
// @ts-ignore
import { loadDict } from "@/api/star_horse_apis";

const linkExecServerList = ref<SelectOption[]>([]);
const codeCommitorList = ref<SelectOption[]>([]);

const reportPersonList = ref<SelectOption[]>([]);
const reportTypeList = ref<SelectOption[]>([]);

/**
 * 其它拓展配置
 */
const extendCommonFields = () => {
  return {
    title: "运行结果通知",
    tabName: "result",
    subFormFlag: "Y",
    objectName: "resultReport",
    fieldList: [
      [
        {
          label: "失败时通知",
          type: "switch",
          fieldName: "errorReport",
          formVisible: true,
          preps: {
            dataRelation: {
              actionName: "change",
              relationDetails: [
                {
                  matchType: "eq",
                  controlCondition: "eqVisible",
                  relationFields: [
                    "errorReportPersonList",
                    "errorReportTypeList",
                  ],
                  matchFieldValue: "Y",
                },
              ],
            },
            activeValue: "Y",
            inactiveValue: "N",
            colspan: 6,
          },
        },
      ],
      {
        label: "通知人",
        type: "checkbox",
        formVisible: false,
        fieldName: "errorReportPersonList",
        preps: {
          dataRelation: {
            actionName: "change",
            relationDetails: [
              {
                matchType: "eq",
                controlCondition: "eqVisible",
                relationFields: ["errorCodeCommitorList"],
                matchFieldValue: "coder",
              },
            ],
          },
          values: reportPersonList,
          border: "Y",
        },
        brotherNodes: [
          {
            type: "select",
            label: "  ",
            fieldName: "errorCodeCommitorList",
            preps: {
              values: codeCommitorList,
              allowCreate: true,
              multiple: true,
            },
          },
        ],
      },
      {
        label: "通知方式",
        type: "checkbox",
        formVisible: false,
        fieldName: "errorReportTypeList",
        preps: {
          values: reportTypeList,
          border: "Y",
        },
      },
      [
        {
          label: "成功时通知",
          type: "switch",
          fieldName: "successReport",
          formVisible: true,
          preps: {
            dataRelation: {
              actionName: "change",
              relationDetails: [
                {
                  matchType: "eq",
                  controlCondition: "eqVisible",
                  relationFields: [
                    "successReportPersonList",
                    "successReportTypeList",
                  ],
                  matchFieldValue: "Y",
                },
              ],
            },
            activeValue: "Y",
            inactiveValue: "N",
            colspan: 6,
          },
        },
      ],
      {
        label: "通知人",
        type: "checkbox",
        formVisible: false,
        fieldName: "successReportPersonList",
        preps: {
          dataRelation: {
            actionName: "change",
            relationDetails: [
              {
                matchType: "eq",
                controlCondition: "eqVisible",
                relationFields: ["successCodeCommitorList"],
                matchFieldValue: "coder",
              },
            ],
          },
          values: reportPersonList,
          border: "Y",
        },
        brotherNodes: [
          {
            type: "select",
            label: "  ",
            fieldName: "successCodeCommitorList",
            preps: {
              values: codeCommitorList,
              allowCreate: true,
              multiple: true,
            },
          },
        ],
      },
      {
        label: "通知方式",
        type: "checkbox",
        formVisible: false,
        fieldName: "successReportTypeList",
        preps: {
          values: reportTypeList,
        },
      },
    ],
  };
};

/**
 * 高级设置
 * @param formField 高级设置表单信息
 */
const advancedFormFields = (formField: FieldInfo[]) => {
  if (!reportTypeList.value.length) {
    dataInit();
  }
  const collapseList = [];
  let tabName = "";
  if (formField?.length > 0) {
    tabName = "advancedSetting";
    collapseList.push({
      title: "扩展设置",
      tabName: "advancedSetting",
      subFormFlag: "Y",
      objectName: "advancedSetting",
      fieldList: formField,
    });
  } else {
    tabName = "result";
  }
  collapseList.push(extendCommonFields());
  return reactive<any>({
    fieldName: tabName,
    collapseFlag: "advancedSetting",
    collapseList: collapseList,
  });
};

const dataInit = () => {
  loadDict("message_tools").then((res: any) => {
    reportTypeList.value = res;
  });
  loadDict("CONTINUS_JOB_REPORT_PERSON").then((res: any) => {
    console.log(res);
    reportPersonList.value = res;
  });
};
const loadColor = (item: any) => {
  return item?.execStatus == "SUCCESS"
    ? "var(--star-horse-success)"
    : item?.execStatus == "RUNNING"
      ? "var(--star-horse-warning)"
      : "var(--star-horse-default)";
};
const dynamicStyle = (item: any, index: number) => {
  let styles: any = {
    "border-color": loadColor(item),
  };
  styles["transform"] = `translate(${index * 280 + 15}px, 0)`;
  if (item?.subNodeInfoList?.length > 0) {
    styles["height"] = "100%";
  } else if (item?.subNodeInfoList?.length == 0) {
    styles["height"] = "80px";
  }
  return styles;
};
const currentNodeProcess = (item: any) => {
  let process = item?.process ? item.process + "%" : "";
  return {
    "background-color": process ? "var(--star-horse-success)" : loadColor(item),
    width: process ?? "0%",
  };
};
/** 计算节点高度
 * @param nodeInfo 节点信息
 */
const countHeight = (nodeInfo: any) => {
  // 获取所有节点的子节点数量，找出最大值
  let maxSubNodeCount = 0;
  nodeInfo?.nodeList?.forEach((item: any) => {
    const subNodeCount = item.subNodeInfoList?.length || 0;
    if (subNodeCount > maxSubNodeCount) {
      maxSubNodeCount = subNodeCount;
    }
  });
  // 如果子节点数量超过一个，高度取150px；否则取80px
  return {
    height:
      maxSubNodeCount > 2 ? "150px" : maxSubNodeCount > 0 ? "115px" : "80px",
  };
};

export {
  linkExecServerList,
  codeCommitorList,
  extendCommonFields,
  advancedFormFields,
  dataInit,
  loadColor,
  dynamicStyle,
  currentNodeProcess,
  countHeight,
};
