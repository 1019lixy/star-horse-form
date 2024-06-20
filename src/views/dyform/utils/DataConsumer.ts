import {reactive, Ref, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {searchMatchList} from "@/api/sh_api.ts";

let tableVisible = ref<boolean>(true);
let relationRequired = ref<boolean>(false);
let sortTableVisible = ref<boolean>(true);
let limitFieldVisible = ref<boolean>(true);
let lineDatas: any = {};
let tableList = ref<SelectOption[]>([]);
let fieldList = ref<SelectOption[]>([]);

export const line_height = 24;
export const table_width = 320;

export const consumerNodeData: any = {
    portName: "erPortPosition",
    name: 'er-rect',
    entity: {
        inherit: 'rect',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label',
            },
        ],
        attrs: {
            rect: {
                strokeWidth: 1,
                stroke: 'var(--star-horse-style)',
                fill: 'var(--star-horse-style)',
            },
            label: {
                fontWeight: 'bold',
                fill: '#ffffff',
                fontSize: 12,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                textWrap: {
                    width: 300,
                    ellipsis: true,
                    breakWord: true
                }
            },
        },
        ports: {
            groups: {
                list: {
                    markup: [
                        {
                            tagName: 'rect',
                            selector: 'portBody',
                        },
                        {
                            tagName: 'text',
                            selector: 'fieldName',
                        },
                        /*       {
                                 tagName: 'text',
                                 selector: 'type',
                               },*/
                        {
                            tagName: 'text',
                            selector: 'comment',
                        },
                        /*   {
                             tagName: 'text',
                             selector: 'primaryFlag',
                           },*/
                    ],
                    attrs: {
                        portBody: {
                            width: table_width,
                            height: line_height,
                            strokeWidth: 1,
                            magnet: true,
                            stroke: 'var(--star-horse-style)',
                            fill: '#EFF4FF',
                        },
                        name: {
                            refX: 6,
                            refY: 6,
                            fontSize: 10,
                            ref: "portBody",
                            textWrap: {
                                width: 78,
                                ellipsis: true,
                                breakWord: true
                            }
                        },
                        /* type: {
                           ref: "portBody",
                           refX: 80,
                           refY: 6,
                           fontSize: 10,
                         },*/
                        comment: {
                            ref: "portBody",
                            refX: 150,
                            refY: 6,
                            fontSize: 10,
                            textWrap: {
                                width: 150,
                                ellipsis: true,
                                breakWord: true
                            }
                        },
                        /*  primaryFlag: {
                            refX: 300,
                            refY: 6,
                            fontSize: 10,
                            ref: "portBody",
                          },*/
                    },
                    position: 'erPortPosition',
                },
            },
        },
    },
    force: true
};

/**
 * 关联属性信息
 */
export function viewFieldInfo(viewTypeList: Ref<SelectOption[]>, consumeAuthorityList: Ref<SelectOption[]>, viewConfigInfo: any) {
    lineDatas = {};
    tableList.value = [];
    let tables = viewConfigInfo.tables;
    for (let index in tables) {
        let table = tables[index];
        lineDatas[table.from] = [];
        tableList.value.push({
            name: table.from,
            value: table.from,
        });
        table.fromData?.items?.forEach(item => {
            lineDatas[table.from].push({
                name: item.name,
                value: item.name
            })
        });
    }
    return reactive<PageFieldInfo>({
        fieldList: [
            [
                {
                    label: "视图名称", fieldName: "viewName", type: "input",
                    required: true, formShow: true,

                },
                {
                    label: "视图类型", fieldName: "viewType", type: "select",
                    required: true, formShow: true,
                    optionList: viewTypeList,

                },
            ],
            [{
                label: "消费权限", fieldName: "consumeAuthority", type: "select",
                optionList: consumeAuthorityList,
                required: true, formShow: true,

            }, {
                label: "单次最大数量", fieldName: "dataLimits", type: "number",
                required: true, formShow: true,
                min: 1,
                defaultValue: 100,

            },],
            [{
                label: "是否认证", fieldName: "isAudit", type: "switch",
                formShow: true,
                defaultValue: "N",

            }, {
                label: "是否去重", fieldName: "isDistinct", type: "switch",
                formShow: true,
                defaultValue: "N",

            },],
            [{
                label: "是否需要公共字段", fieldName: "isCommonField", type: "switch",
                formShow: true,
                defaultValue: "N",
                helpMsg: "如果指定返回字段，该设置失效",

            }, {
                label: "是否创建菜单", fieldName: "isCreateMenu", type: "switch",
                formShow: true,
                defaultValue: "N",

            },],
            [{
                label: "是否字段排序", fieldName: "dataSortType", type: "switch",
                formShow: true,
                defaultValue: "N",
                actionName: "change",
                actions: (val: any) => {
                    sortTableVisible.value = val["dataSortType"] == "N";
                },

            }, {
                label: "是否指定返回字段", fieldName: "limitFieldType", type: "switch",
                formShow: true,
                defaultValue: "N",
                actionName: "change",
                actions: (val: any) => {
                    limitFieldVisible.value = val["limitFieldType"] == "N";
                },

            },],
            {
                label: "视图描述", fieldName: "remark", type: "textarea",
                formShow: true,

            },
            {
                batchFieldList: [{
                    batchName: "sortFields",
                    title: "排序方式",
                    disVisible: sortTableVisible,
                    fieldList: [
                        {
                            label: "表名", fieldName: "tableName",
                            type: "select",
                            optionList: tableList,
                            actionName: "change",
                            actions: (val: any) => {
                                val["fieldNameOptionList"] = lineDatas[val["tableName"]];
                                console.log(val);
                            },
                            formShow: true,

                        },
                        {
                            label: "属性名", fieldName: "fieldName",
                            type: "select",
                            formShow: true,

                        },
                        {
                            label: "排序方式", fieldName: "sortType",
                            type: "select",
                            formShow: true,

                        },

                    ]
                }, {
                    batchName: "limitFields",
                    title: "指定返回字段",
                    disVisible: limitFieldVisible,
                    fieldList: [
                        {
                            label: "表名", fieldName: "tableName",
                            type: "select",
                            optionList: tableList,
                            actionName: "change",
                            actions: (val: any) => {
                                val["fieldNameOptionList"] = lineDatas[val["tableName"]];
                                val["exclusionFieldNameOptionList"] = lineDatas[val["tableName"]];
                                console.log(val);
                            },
                            formShow: true,

                        },
                        {
                            label: "返回字段", fieldName: "fieldName",
                            type: "select",
                            helpMsg: "返回字段和排除字段设置一个",
                            formShow: true,

                            preps: {
                                multiple: "Y",
                            }
                        },
                        {
                            label: "排除字段", fieldName: "exclusionFieldName",
                            type: "select",
                            formShow: true,

                            preps: {
                                multiple: "Y",
                            }
                        },
                    ]
                }]
            }
        ]
    });
}


export function relationFieldInfo(datas: any) {
    lineDatas = {};
    tableVisible.value = true;
    lineDatas[datas.from] = [];
    datas.fromData?.items?.forEach(item => {
        lineDatas[datas.from].push({
            name: item.name,
            value: item.name
        })
    });
    lineDatas[datas.to] = [];
    datas.toData?.items?.forEach(item => {
        lineDatas[datas.to].push({
            name: item.name,
            value: item.name
        })
    });
    tableList.value = [];
    tableList.value.push({
        name: datas.from,
        value: datas.from,
    });
    tableList.value.push({
        name: datas.to,
        value: datas.to,
    })
    return reactive<PageFieldInfo>({
        fieldList: [
            [
                {
                    label: "关联主表名", fieldName: "from", type: "text",
                    formShow: true,

                },
                {
                    label: "关联主表字段名", fieldName: "fromPort", type: "text",
                    formShow: true,

                },
            ],
            [{
                label: "被关联表名", fieldName: "to", type: "text",
                formShow: true,

            }, {
                label: "被关联表字段名", fieldName: "toPort", type: "text",
                formShow: true,

            },],
            {
                label: "自定义条件", fieldName: "condition", type: "switch",
                formShow: true,
                defaultValue: "N",
                actionName: "input",
                actions: (val: any) => {
                    tableVisible.value = val["condition"] == "N";
                    relationRequired.value = val["condition"] == "Y";
                },

            },
            {
                batchFieldList: [{
                    batchName: "conditionList",
                    title: "自定义条件",
                    disVisible: tableVisible,
                    fieldList: [
                        {
                            label: "表名", fieldName: "tableName",
                            type: "select",
                            optionList: tableList,
                            actionName: "change",
                            actions: (val: any) => {
                                val["fieldNameOptionList"] = lineDatas[val["tableName"]];
                                console.log(val);
                            },
                            required: relationRequired, formShow: true,

                        },
                        {
                            label: "属性名", fieldName: "fieldName",
                            type: "select",
                            required: relationRequired, formShow: true,

                        },
                        {
                            label: "匹配方式", fieldName: "matchType",
                            type: "select",
                            optionList: searchMatchList(),
                            required: relationRequired, formShow: true,

                        },
                        {
                            label: "匹配值", fieldName: "matchValue",
                            type: "input",
                            required: relationRequired, formShow: true,

                        }
                    ]
                }]
            }
        ]
    });
}
