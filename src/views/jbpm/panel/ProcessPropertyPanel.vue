<script setup lang="ts" name="ProcessProperty">
  import { onMounted, reactive, ref } from "vue";
  import { PageFieldInfo } from "star-horse-lowcode";
  import {
    dataTypeList,
    entityTypeList,
    execListener,
    extendPrep,
    processEventTypeList
  } from "@/views/jbpm/panel/Fields.ts";

  const props = defineProps({
    modeler: {
      type: Object,
      required: true
    },
    element: {
      type: Object,
      required: true
    }
  });

  const processField = reactive<PageFieldInfo | any>({
    fieldList: [
      {
        fileName: "normal",
        collapseList: [
          {
            title: "常规",
            tabName: "normal",
            fieldList: [
              {
                label: "ID",
                fieldName: "processId",
                type: "input",
                disabled: "Y",
                formVisible: true,
                listVisible: true
              },
              {
                label: "流程名称",
                fieldName: "processName",
                type: "input",
                required: true,
                formVisible: true,
                listVisible: true
              },
              {
                label: "可执行",
                fieldName: "executeAble",
                type: "switch",
                defaultValue: "Y",
                formVisible: true,
                listVisible: true
              },
              {
                label: "流程启动人",
                fieldName: "executeOperator",
                type: "dialog-input",
                formVisible: true,
                listVisible: true,
                params: {}
              },
              {
                label: "流程启角色",
                fieldName: "executeRole",
                type: "dialog-input",
                formVisible: true,
                listVisible: true,
                params: {}
              }
            ]
          },
          {
            title: "全局事件",
            tabName: "globalEvent",
            fieldList: [
              {
                fieldName: "message",
                collapseList: [
                  {
                    title: "消息列表",
                    tabName: "message",
                    batchFieldList: [
                      {
                        batchName: "messageList",
                        staticData: "Y",
                        fieldList: [
                          {
                            label: "ID",
                            fieldName: "id",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "名称",
                            fieldName: "name",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          }
                        ]
                      }
                    ]
                  },
                  {
                    title: "错误列表",
                    tabName: "error",
                    batchFieldList: [
                      {
                        batchName: "errorList",
                        staticData: "Y",
                        fieldList: [
                          {
                            label: "ID",
                            fieldName: "id",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "名称",
                            fieldName: "name",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "错误编码",
                            fieldName: "errorCode",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          }
                        ]
                      }
                    ]
                  },
                  {
                    title: "信号列表",
                    tabName: "signal",
                    batchFieldList: [
                      {
                        batchName: "signalList",
                        staticData: "Y",
                        fieldList: [
                          {
                            label: "ID",
                            fieldName: "id",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "名称",
                            fieldName: "name",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "作用域",
                            fieldName: "area",
                            type: "switch",
                            formVisible: true,
                            listVisible: true,
                            preps: {
                              inactiveText: "全局",
                              activeText: "当前实例"
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    title: "升级列表",
                    tabName: "improve",
                    batchFieldList: [
                      {
                        batchName: "improveList",
                        staticData: "Y",
                        fieldList: [
                          {
                            label: "ID",
                            fieldName: "id",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "名称",
                            fieldName: "name",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          },
                          {
                            label: "升级编码",
                            fieldName: "code",
                            type: "input",
                            formVisible: true,
                            listVisible: true
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          execListener("process", "执行监听器", "execListener", "execListeners"),
          {
            title: "事件监听器",
            tabName: "eventListener",
            batchFieldList: [
              {
                batchName: "eventListeners",
                staticData: "Y",
                fieldList: [
                  {
                    label: "事件类型",
                    fieldName: "eventType",
                    type: "select",
                    optionList: processEventTypeList,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      multiple: "Y"
                    }
                  },
                  {
                    label: "监听器类型",
                    fieldName: "listenerType",
                    type: "radio",
                    optionList: [
                      { name: "Java类", value: "java" },
                      { name: "代理表达式", value: "proxyExp" }
                    ],
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      radioType: "button"
                    }
                  },
                  {
                    label: "抛出事件",
                    fieldName: "throwEvent",
                    type: "radio",
                    optionList: [
                      { name: "是", value: "Y" },
                      { name: "否", value: "N" }
                    ],
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      radioType: "button"
                    }
                  },
                  {
                    label: "监听器",
                    fieldName: "listenerName",
                    type: "input",
                    formVisible: true,
                    listVisible: true
                  },
                  {
                    label: "实体类型",
                    fieldName: "entityType",
                    type: "select",
                    optionList: entityTypeList,
                    formVisible: true,
                    listVisible: true
                  }
                ]
              }
            ]
          },
          {
            title: "数据对象",
            tabName: "dataObject",
            batchFieldList: [
              {
                batchName: "dataObjects",
                staticData: "Y",
                fieldList: [
                  {
                    label: "名称",
                    fieldName: "name",
                    type: "input",
                    formVisible: true,
                    listVisible: true
                  },
                  {
                    label: "数据类型",
                    fieldName: "dataType",
                    type: "select",
                    optionList: dataTypeList,
                    formVisible: true,
                    listVisible: true
                  },
                  {
                    label: "默认值",
                    fieldName: "defaultValue",
                    type: "input",
                    formVisible: true,
                    listVisible: true
                  }
                ]
              }
            ]
          },
          extendPrep,
          {
            title: "描述文档",
            tabName: "description",
            fieldList: [
              {
                label: "文档",
                fieldName: "desc",
                type: "textarea",
                formVisible: true,
                listVisible: true
              }
            ]
          }
        ]
      }
    ]
  });
  let localProcessData = ref<any>();
  onMounted(() => {
    localProcessData.value = props.processData;
  });
  const updateId = (name: string) => {
    props.modeler.get("modeling").updateProperties(props.element, { id: name });
  };
  const updateName = (name: string) => {
    props.modeler.get("modeling").updateProperties(props.element, { name: name });
  };
  const updateDesc = (name: string) => {
    let doc = props.modeler.get("bpmnFactory").create("bpmn:Documentation", { text: name });
    props.modeler.get("modeling").updateProperties(props.element, { documentation: [doc] });
  };
</script>
<style scoped></style>
<template>
  <star-horse-form :field-list="processField" />
</template>
