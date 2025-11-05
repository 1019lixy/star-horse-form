import { reactive, Ref, ref } from "vue";
import {
  PageFieldInfo,
  searchMatchList,
  SelectOption,
} from "star-horse-lowcode";
import { ascOrDesc } from "@/api/system";

const tableVisible = ref<boolean>(true);
const relationRequired = ref<boolean>(false);
const sortTableVisible = ref<boolean>(true);
const limitFieldVisible = ref<boolean>(true);
let lineDatas: any = {};
const tableList = ref<SelectOption[]>([]);
// const fieldList = ref<SelectOption[]>([]);
export const line_height = 32;
export const table_width = 480;
export const consumerNodeData: any = {
  portName: "erPortPosition",
  name: "er-rect",
  entity: {
    inherit: "rect",
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
      {
        tagName: "rect",
        selector: "headerBg",
      },
      {
        tagName: "text",
        selector: "headerName",
      },
      {
        tagName: "text",
        selector: "headerType",
      },
      {
        tagName: "text",
        selector: "headerLength",
      },
      {
        tagName: "text",
        selector: "headerDesc",
      },
      {
        tagName: "line",
        selector: "separator1",
      },
      {
        tagName: "line",
        selector: "separator2",
      },
      {
        tagName: "line",
        selector: "separator3",
      },
    ],
    attrs: {
      body: {
        strokeWidth: 1,
        stroke: "var(--star-horse-style)",
        fill: "var(--star-horse-style)",
        height: 25,
        width: table_width,
      },
      rect: {
        strokeWidth: 1,
        stroke: "var(--star-horse-style)",
        fill: "var(--star-horse-style)",
        height: 25,
        width: table_width,
      },
      label: {
        fontWeight: "bold",
        fill: "#ffffff",
        fontSize: 14,
        textAnchor: "middle",
        textVerticalAnchor: "middle",
        refY: 12.5,
        textWrap: {
          width: table_width - 20,
          ellipsis: true,
          breakWord: true,
        },
      },
      headerBg: {
        refY: 25,
        refX: 0,
        width: table_width,
        height: line_height,
        strokeWidth: 1,
        stroke: "var(--star-horse-style)",
        fill: "#e6f3ff",
      },
      separator1: {
        refX1: 100,
        refY1: 25,
        refX2: 100,
        refY2: 25 + line_height,
        stroke: "var(--star-horse-style)",
        strokeWidth: 1,
      },
      separator2: {
        refX1: 200,
        refY1: 25,
        refX2: 200,
        refY2: 25 + line_height,
        stroke: "var(--star-horse-style)",
        strokeWidth: 1,
      },
      separator3: {
        refX1: 270,
        refY1: 25,
        refX2: 270,
        refY2: 25 + line_height,
        stroke: "var(--star-horse-style)",
        strokeWidth: 1,
      },
      headerName: {
        refY: 25 + line_height / 2,
        refX: 50,
        fontSize: 12,
        fontWeight: "bold",
        fill: "#2c5aa0",
        text: "列名",
        textAnchor: "middle",
        textVerticalAnchor: "middle",
      },
      headerType: {
        refY: 25 + line_height / 2,
        refX: 150,
        fontSize: 12,
        fontWeight: "bold",
        fill: "#2c5aa0",
        text: "类型",
        textAnchor: "middle",
        textVerticalAnchor: "middle",
      },
      headerLength: {
        refY: 25 + line_height / 2,
        refX: 235,
        fontSize: 12,
        fontWeight: "bold",
        fill: "#2c5aa0",
        text: "主键",
        textAnchor: "middle",
        textVerticalAnchor: "middle",
      },
      headerDesc: {
        refY: 25 + line_height / 2,
        refX: 375,
        fontSize: 12,
        fontWeight: "bold",
        fill: "#2c5aa0",
        text: "描述",
        textAnchor: "middle",
        textVerticalAnchor: "middle",
      },
    },
    ports: {
      groups: {
        list: {
          markup: [
            {
              tagName: "rect",
              selector: "portBody",
            },
            {
              tagName: "line",
              selector: "portSeparator1",
            },
            {
              tagName: "line",
              selector: "portSeparator2",
            },
            {
              tagName: "line",
              selector: "portSeparator3",
            },
            {
              tagName: "circle",
              selector: "leftAnchor",
            },
            {
              tagName: "circle",
              selector: "rightAnchor",
            },
            {
              tagName: "text",
              selector: "fieldName",
            },
            {
              tagName: "text",
              selector: "type",
            },
            {
              tagName: "text",
              selector: "primaryKey",
            },
            {
              tagName: "text",
              selector: "comment",
            },
          ],
          attrs: {
            portBody: {
              width: table_width,
              height: line_height,
              strokeWidth: 1,
              magnet: false,
              stroke: "var(--star-horse-style)",
              fill: "#ffffff",
            },
            portSeparator1: {
              refX1: 100,
              refY1: 0,
              refX2: 100,
              refY2: line_height,
              stroke: "#e0e0e0",
              strokeWidth: 1,
            },
            portSeparator2: {
              refX1: 200,
              refY1: 0,
              refX2: 200,
              refY2: line_height,
              stroke: "#e0e0e0",
              strokeWidth: 1,
            },
            portSeparator3: {
              refX1: 270,
              refY1: 0,
              refX2: 270,
              refY2: line_height,
              stroke: "#e0e0e0",
              strokeWidth: 1,
            },
            leftAnchor: {
              refX: 0,
              refY: line_height / 2,
              r: 4,
              magnet: true,
              stroke: "var(--star-horse-style)",
              strokeWidth: 2,
              fill: "#ffffff",
              cursor: "crosshair",
              opacity: 0,
              class: "table-row-anchor table-left-anchor",
            },
            rightAnchor: {
              refX: table_width,
              refY: line_height / 2,
              r: 4,
              magnet: true,
              stroke: "var(--star-horse-style)",
              strokeWidth: 2,
              fill: "#ffffff",
              cursor: "crosshair",
              opacity: 0,
              class: "table-row-anchor table-right-anchor",
            },
            fieldName: {
              refX: 25,
              refY: line_height / 2,
              fontSize: 10,
              ref: "portBody",
              fill: "#333",
              textVerticalAnchor: "middle",
              textWrap: {
                width: 90,
                ellipsis: true,
                breakWord: true,
              },
            },
            type: {
              ref: "portBody",
              refX: 125,
              refY: line_height / 2,
              fontSize: 10,
              fill: "#666",
              textVerticalAnchor: "middle",
              textWrap: {
                width: 90,
                ellipsis: true,
                breakWord: true,
              },
            },
            primaryKey: {
              ref: "portBody",
              refX: 225,
              refY: line_height / 2,
              fontSize: 10,
              fill: "#666",
              textVerticalAnchor: "middle",
              textWrap: {
                width: 60,
                ellipsis: true,
                breakWord: true,
              },
            },
            comment: {
              ref: "portBody",
              refX: 295,
              refY: line_height / 2,
              fontSize: 10,
              fill: "#666",
              textVerticalAnchor: "middle",
              textWrap: {
                width: 170,
                ellipsis: true,
                breakWord: true,
              },
            },
          },
          position: "erPortPosition",
        },
      },
    },
  },
  force: true,
};

/**
 * 关联属性信息
 */
export function viewFieldInfo(
  viewTypeList: Ref<SelectOption[]>,
  consumeAuthorityList: Ref<SelectOption[]>,
  viewConfigInfo: any,
) {
  lineDatas = {};
  tableList.value = [];
  const tables = viewConfigInfo.tables;
  for (const index in tables) {
    const table = tables[index];
    lineDatas[table.from] = [];
    tableList.value.push({
      name: table.from,
      value: table.from,
    });
    table.fromData?.items?.forEach((item: any) => {
      lineDatas[table.from].push({
        name: item.comment || item.fieldName,
        value: item.fieldName,
      });
    });
  }
  return reactive<PageFieldInfo>({
    fieldList: [
      [
        {
          label: "视图名称",
          fieldName: "viewName",

          required: true,
          formVisible: true,
        },
        {
          label: "视图类型",
          fieldName: "viewType",
          type: "select",
          required: true,
          formVisible: true,
          preps: {
            values: viewTypeList,
          },
        },
      ],
      [
        {
          label: "消费权限",
          fieldName: "consumeAuthority",
          type: "select",
          required: true,
          formVisible: true,
          preps: {
            values: consumeAuthorityList,
          },
        },
        {
          label: "单次最大数量",
          fieldName: "dataLimits",
          type: "number",
          required: true,
          formVisible: true,
          min: 1,
          defaultValue: 100,
        },
      ],
      [
        {
          label: "是否认证",
          fieldName: "isAudit",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
        {
          label: "是否去重",
          fieldName: "isDistinct",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
      ],
      [
        {
          label: "是否需要公共字段",
          fieldName: "isCommonField",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          helpMsg: "如果指定返回字段，该设置失效",
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
        {
          label: "是否创建菜单",
          fieldName: "isCreateMenu",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
      ],
      [
        {
          label: "是否字段排序",
          fieldName: "dataSortType",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          actions: {
            change: (val: any) => {
              sortTableVisible.value = val["dataSortType"] == "Y";
            },
          },
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
        {
          label: "是否指定返回字段",
          fieldName: "limitFieldType",
          type: "switch",
          formVisible: true,
          defaultValue: "N",
          actions: {
            change: (val: any) => {
              limitFieldVisible.value = val["limitFieldType"] == "Y";
            },
          },
          preps: {
            activeValue: "Y",
            inactiveValue: "N",
          },
        },
      ],
      {
        label: "视图描述",
        fieldName: "remark",
        type: "textarea",
        formVisible: true,
      },
      {
        fieldName: "sortFields",
        batchFieldList: [
          {
            batchName: "sortFields",
            title: "排序方式",
            tabName: "sortFields",
            disVisible: sortTableVisible,
            fieldList: [
              {
                label: "表名",
                fieldName: "tableName",
                type: "select",
                actions: {
                  change: (val: any) => {
                    val["fieldNameOptionList"] = lineDatas[val["tableName"]];
                    console.log(val);
                  },
                },
                formVisible: true,
                preps: {
                  values: tableList,
                },
              },
              {
                label: "属性名",
                fieldName: "fieldName",
                type: "select",
                formVisible: true,
              },
              {
                label: "排序方式",
                fieldName: "sortType",
                type: "select",
                formVisible: true,
                preps: {
                  values: ascOrDesc(),
                },
              },
            ],
          },
          {
            batchName: "limitFields",
            title: "指定返回字段",
            tabName: "limitFields",
            disVisible: limitFieldVisible,
            fieldList: [
              {
                label: "表名",
                fieldName: "tableName",
                type: "select",
                actions: {
                  change: (val: any) => {
                    val["fieldNameOptionList"] = lineDatas[val["tableName"]];
                    val["exclusionFieldNameOptionList"] =
                      lineDatas[val["tableName"]];
                    console.log(val);
                  },
                },
                formVisible: true,
                preps: {
                  values: tableList,
                },
              },
              {
                label: "返回字段",
                fieldName: "fieldName",
                type: "select",
                helpMsg: "返回字段和排除字段设置一个",
                formVisible: true,
                preps: {
                  multiple: true,
                },
              },
              {
                label: "排除字段",
                fieldName: "exclusionFieldName",
                type: "select",
                formVisible: true,
                preps: {
                  multiple: true,
                },
              },
            ],
          },
        ],
      },
    ],
  });
}

const fieldNameList = ref<SelectOption[]>([]);

/**
 * 关联属性信息
 */
export function relationFieldInfo(datas: any) {
  lineDatas = {};
  tableVisible.value = true;
  lineDatas[datas.from] = [];
  datas.fromData?.items?.forEach((item: any) => {
    lineDatas[datas.from].push({
      name: item.comment || item.fieldName,
      value: item.fieldName,
    });
  });
  console.log(datas);
  lineDatas[datas.to] = [];
  datas.toData?.items?.forEach((item: any) => {
    lineDatas[datas.to].push({
      name: item.comment || item.fieldName,
      value: item.fieldName,
    });
  });
  tableList.value = [];
  tableList.value.push({
    name: datas.from,
    value: datas.from,
  });
  tableList.value.push({
    name: datas.to,
    value: datas.to,
  });
  return reactive<PageFieldInfo>({
    fieldList: [
      [
        {
          label: "关联主表名",
          fieldName: "from",
          type: "tag",
          formVisible: true,
        },
        {
          label: "关联主表字段名",
          fieldName: "fromPort",
          type: "tag",
          formVisible: true,
        },
      ],
      [
        {
          label: "被关联表名",
          fieldName: "to",
          type: "tag",
          formVisible: true,
        },
        {
          label: "被关联表字段名",
          fieldName: "toPort",
          type: "tag",
          formVisible: true,
        },
      ],
      {
        label: "自定义条件",
        fieldName: "condition",
        type: "switch",
        formVisible: true,
        defaultValue: "N",
        actions: {
          change: (val: any) => {
            tableVisible.value = val["condition"] == "N";
            relationRequired.value = val["condition"] == "Y";
          },
        },
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
      {
        batchFieldList: [
          {
            batchName: "conditionList",
            title: "自定义条件",
            disVisible: tableVisible,
            fieldList: [
              {
                label: "表名",
                fieldName: "tableName",
                type: "select",
                actions: {
                  change: (val: any) => {
                    fieldNameList.value = lineDatas[val["tableName"]];
                    console.log(val, fieldNameList.value);
                  },
                },
                required: relationRequired,
                formVisible: true,
                preps: {
                  values: tableList,
                },
              },
              {
                label: "属性名",
                fieldName: "fieldName",
                type: "select",
                required: relationRequired,
                formVisible: true,
                preps: {
                  values: fieldNameList,
                },
              },
              {
                label: "匹配方式",
                fieldName: "matchType",
                type: "select",
                required: relationRequired,
                formVisible: true,
                preps: {
                  values: searchMatchList(),
                },
              },
              {
                label: "匹配值",
                fieldName: "matchValue",

                required: relationRequired,
                formVisible: true,
              },
            ],
          },
        ],
      },
    ],
  });
}
