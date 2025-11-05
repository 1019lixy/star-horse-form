import {CompType} from "star-horse-lowcode";

export const formContainer: CompType[] = [
    {
        "itemName": "栅格",
        "itemType": "box",
        "itemIcon": "box",
        "category": 2,
        "remark": "帮助排列组件风格",
        "fields": [
            {
                "label": "垂直排列方式",
                "fieldName": "align",
                "fieldType": "select",
                "required": false,
                "selectValues": [
                    {"name": "顶部", "value": "top"},
                    {"name": "居中", "value": "middle"},
                    {"name": "底部", "value": "bottom"}
                ],
                "defaultValues": "",
                "category": 1,
                "configParams": []
            }
        ],
        "advancedFields": [
            {
                "label": "水平排列方式",
                "fieldName": "justify",
                "fieldType": "select",
                "required": false,
                "selectValues": [
                    {"name": "Start", "value": "start"},
                    {"name": "End", "value": "end"},
                    {"name": "Center", "value": "center"},
                    {"name": "SpaceAround", "value": "space-around"},
                    {"name": "SpaceBetween", "value": "space-between"},
                    {"name": "SpaceEvenly", "value": "space-evenly"}
                ],
                "defaultValues": "",
                "category": 2,
                "configParams": []
            },
            {
                "label": "栅格间隔",
                "fieldName": "gutter",
                "fieldType": "number",
                "required": false,
                "selectValues": "0",
                "defaultValues": "",
                "category": 2,
                "configParams": []
            },
            {
                "label": "自定义元素标签",
                "fieldName": "tag",
                "fieldType": "input",
                "required": false,
                "selectValues": "div",
                "defaultValues": "",
                "category": 2,
                "configParams": []
            }
        ],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "Tab",
        "itemType": "tab",
        "itemIcon": "tab",
        "category": 2,
        "fields": [
            {
                "label": "标签的宽度是否自撑开",
                "fieldName": "stretch",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            },
            {
                "label": "标签是否同时可增加和关闭",
                "fieldName": "editable",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            },
            {
                "label": "标签是否可增加",
                "fieldName": "addable",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            },
            {
                "label": "选项卡所在位置",
                "fieldName": "tablePosition",
                "fieldType": "select",
                "required": false,
                "selectValues": [
                    {"name": "顶部", "value": "top"},
                    {"name": "右侧", "value": "right"},
                    {"name": "底部", "value": "bottom"},
                    {"name": "左侧", "value": "left"}
                ],
                "defaultValues": "",
                "category": 1,
                "configParams": []
            },
            {
                "label": "风格",
                "fieldName": "type",
                "fieldType": "select",
                "required": false,
                "selectValues": [
                    {"name": "无", "value": "—"},
                    {"name": "卡片", "value": "card"},
                    {"name": "有边框卡片", "value": "border-card"}
                ],
                "defaultValues": "",
                "category": 1,
                "configParams": []
            },
            {
                "label": "标签可关闭",
                "fieldName": "closable",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            }
        ],
        "advancedFields": [],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "动态列表",
        "itemType": "table",
        "itemIcon": "table",
        "category": 2,
        "fields": [
            {
                "label": "列表描述",
                "fieldName": "label",
                "fieldType": "input",
                "required": true,
                "category": 1,
                "configParams": []
            },
            {
                "label": "是否支持模板下载",
                "fieldName": "templateDownFlag",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            },
            {
                "label": "是否支持导入",
                "fieldName": "importFlag",
                "fieldType": "switch",
                "required": false,
                "category": 1,
                "configParams": []
            },
            {
                "label": "是否子表",
                "fieldName": "subFormFlag",
                "fieldType": "switch",
                "required": false,
                "defaultValues": true,
                "category": 1,
                "configParams": []
            },
            {
                "label": "主键",
                "fieldName": "primaryKeyName",
                "fieldType": "input",
                "required": true,
                "category": 1,
                "configParams": []
            },
            {
                "label": "集合名称",
                "fieldName": "batchFieldName",
                "fieldType": "input",
                "required": true,
                "category": 1,
                "configParams": []
            },
            {
                "label": "表格列数",
                "fieldName": "columns",
                "fieldType": "number",
                "required": false,
                "selectValues": "1",
                "defaultValues": "",
                "category": 1,
                "configParams": []
            }
        ],
        "advancedFields": [
            {
                "label": "表格间隔",
                "fieldName": "gutter",
                "fieldType": "number",
                "required": false,
                "selectValues": "0",
                "defaultValues": "",
                "category": 2,
                "configParams": []
            },
            {
                "label": "布局下的垂直排列方式",
                "fieldName": "align",
                "fieldType": "select",
                "required": false,
                "selectValues": [
                    {"name": "顶部", "value": "top"},
                    {"name": "居中", "value": "middle"},
                    {"name": "底部", "value": "bottom"}
                ],
                "defaultValues": "",
                "category": 2,
                "configParams": []
            }
        ],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "折叠面板",
        "itemType": "collapse",
        "itemIcon": "text",
        "category": 2,
        "fields": [],
        "advancedFields": [],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "卡片",
        "itemType": "card",
        "itemIcon": "text",
        "category": 2,
        "fields": [],
        "advancedFields": [],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "动态表格",
        "itemType": "dytable",
        "itemIcon": "text",
        "category": 2,
        "fields": [
            {
                "label": "行间距",
                "fieldName": "rowSpan",
                "fieldType": "input",
                "required": false,
                "selectValues": "",
                "defaultValues": "",
                "category": 1,
                "configParams": []
            },
            {
                "label": "列间距",
                "fieldName": "colSpan",
                "fieldType": "input",
                "required": false,
                "selectValues": "",
                "defaultValues": "",
                "category": 1,
                "configParams": []
            }
        ],
        "advancedFields": [],
        "selfFields": [],
        "actions": [],
        "preps": []
    },
    {
        "itemName": "分栏容器",
        "itemType": "splitter",
        "itemIcon": "text",
        "category": 2,
        "fields": [
            {
                "label": "懒加载",
                "fieldName": "lazy",
                "fieldType": "switch",
                "required": false,
                "selectValues": "",
                "defaultValues": "false",
                "category": 1,
                "configParams": []
            },
            {
                "label": "布局",
                "fieldName": "layout",
                "fieldType": "select",
                "required": false,
                "selectValues": [{"name": "水平", "value": "horizontal"}, {"name": "垂直", "value": "vertical"}],
                "defaultValues": "horizontal",
                "category": 1,
                "configParams": []
            }
        ],
        "advancedFields": [],
        "selfFields": [],
        "actions": [],
        "preps": []
    }
];
