<script setup lang="ts" name="EnvInfo">
  import { apiInstance, closeLoad, dialogPreps, dictData, load } from "@/api/sh_api.ts";
  import { createDatetime } from "@/api/date_utils.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { onMounted, provide, reactive, ref } from "vue";
  import { SearchFields, SelectOption } from "@/components/types/SearchProps.d.ts";
  import { Config } from "@/api/settings.ts";
  import { OrderByInfo, PageFieldInfo, UserFuncInfo } from "@/components/types/PageFieldInfo.d.ts";
  import { initDbList, tableList } from "@/views/dbsearch/utils/DbSearchUtils.ts";
  import { download } from "@/api/star_horse.ts";
  import { warning } from "@/utils/message.ts";

  const dataUrl: ApiUrls = apiInstance("code-generator", "generator/code");

  let dbInfoList = ref<Array<SelectOption>>([]);
  let tableInfoList = ref<Array<SelectOption>>([]);
  let templateVersionList = ref<Array<SelectOption>>([]);
  let languageList = ref<Array<SelectOption>>([]);
  let fileTypeList = ref<Array<SelectOption>>([]);
  //,可用值:VUE_3,VUE_3_TS,REACT,REACT_TS
  let uiTypeList = ref<Array<SelectOption>>([]);
  let packagingList = ref<Array<SelectOption>>([]);
  const loadTabInfo = async (val: any) => {
    let dataId = val["datasourceConfigId"];
    if (!dataId || dataId == "undefined") {
      return;
    }
    tableInfoList.value = await tableList(dataId);
  };
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      {
        label: "数据库信息",
        fieldName: "datasourceConfigId",
        type: "select",
        optionList: dbInfoList,
        defaultVisible: true
      },
      { label: "应用名称", fieldName: "projectName", type: "input", matchType: "lk", defaultVisible: true },
      { label: "项目名称", fieldName: "applicationName", type: "input", matchType: "lk", defaultVisible: true }
    ]
  });
  const tableFieldList = reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "主键",
        fieldName: "idCodeGenerator",
        type: "long"
      },
      [
        {
          label: "数据库信息",
          fieldName: "datasourceConfigId",
          type: "select",
          required: true,
          formVisible: true,
          optionList: dbInfoList,
          actionNames: "change",
          actions: loadTabInfo,
          listVisible: true,
          preps: {
            needInitLink: true
          }
        },
        {
          label: "后端程序语言",
          fieldName: "language",
          type: "select",
          formVisible: true,
          defaultValue: "java",
          helpMsg: "目前只支持Java,选择其它语言会构建失败",
          optionList: languageList,
          listVisible: true
        }
      ],
      [
        {
          label: "后端模版版本",
          fieldName: "backendTemplateVersion",
          type: "select",
          formVisible: true,
          defaultValue: "2_0",
          optionList: templateVersionList,
          listVisible: true
        },
        {
          label: "前端模版版本",
          fieldName: "frontTemplateVersion",
          type: "select",
          formVisible: true,
          defaultValue: "2_0",
          optionList: templateVersionList,
          listVisible: true
        }
      ],
      {
        label: "需要生成的表名",
        fieldName: "tablesList",
        type: "select",
        multiple: "Y",
        optionList: tableInfoList,
        helpMsg: `该属性为空表示生成所有数据库表的代码,
如果表数量太多（>100），程序自动转异步执行，
有构建失败风险.`,
        formVisible: true,
        listVisible: true
      },
      {
        label: "需要排除的表",
        fieldName: "excludesList",
        type: "select",
        multiple: "Y",
        optionList: tableInfoList,
        formVisible: true,
        listVisible: true
      },
      [
        {
          label: "去除表前缀",
          fieldName: "prefixesStr",
          type: "input",
          aliasName: "prefixes",
          formVisible: true,
          helpMsg: `如果该属性为空，所生成的文件会带上表前缀，
eg: 表：dev_userinfo ,生成的文件是DevUserinfo.java;
多个前缀请用英文分号（;）隔开。`,
          listVisible: true
        },
        {
          label: "包名",
          fieldName: "packageName",
          type: "input",
          required: true,
          formVisible: true,
          helpMsg: "eg: com.starhorse.test",
          listVisible: true
        }
      ],
      {
        label: "要生成的文件",
        fieldName: "fileTypesList",
        type: "select",
        formVisible: true,
        multiple: "Y",
        optionList: fileTypeList,
        helpMsg: "为空生成所有类型文件",
        listVisible: true
      },
      {
        fieldName: "tab2",
        tabList: [
          {
            title: "模块相关",
            tabName: "tab2",
            fieldList: [
              {
                label: "项目名称",
                fieldName: "projectName",
                type: "input",
                formVisible: true,
                helpMsg: "生成代码归属项目"
              },
              {
                label: "模块名称",
                fieldName: "categoryName",
                type: "input",
                required: true,
                formVisible: true,
                helpMsg: "Maven 项目的模块名会追加到包名的后面",
                listVisible: true
              },
              {
                label: "应用名称",
                fieldName: "applicationName",
                type: "input",
                required: true,
                formVisible: true,
                helpMsg: "在配置文件application.yml中对应spring.application.name",
                listVisible: true
              },
              {
                label: "应用端口",
                fieldName: "port",
                type: "number",
                formVisible: true,
                helpMsg: "在配置文件application.yml中对应server.port"
              },
              {
                label: "发布目录",
                fieldName: "targetDir",
                type: "input",
                formVisible: true,
                helpMsg: "文件部署到服务器上的目录"
              },
              {
                label: "RestFul风格接口",
                fieldName: "restFul",
                type: "switch",
                formVisible: true,
                defaultValue: "Y"
              },
              {
                label: "包构建类型",
                fieldName: "war",
                type: "select",
                formVisible: true,
                defaultValue: "jar",
                optionList: packagingList,
                helpMsg: "对应pom.xml文件中的packaging"
              },
              {
                label: "代码版本",
                fieldName: "version",
                type: "input",
                helpMsg: "对应pom.xml文件中version",
                formVisible: true
              }
            ]
          },
          {
            title: "注释相关",
            tabName: "tab1",
            fieldList: [
              {
                label: "开发人员",
                fieldName: "author",
                type: "input",
                formVisible: true
              },
              {
                label: "邮箱地址",
                fieldName: "email",
                type: "input",
                formVisible: true
              },
              {
                label: "是否需要版权",
                fieldName: "needCopyright",
                type: "switch",
                formVisible: true
              }
            ]
          },
          {
            title: "UI相关",
            tabName: "tab3",
            fieldList: [
              {
                label: "是否生成UI页面",
                fieldName: "needUi",
                type: "switch",
                formVisible: true,
                defaultValue: "Y"
              },
              {
                label: "是否分离UI",
                fieldName: "needSplitUI",
                type: "switch",
                formVisible: true,
                helpMsg: "UI文件和业务文件是否放在同一个module里面",
                defaultValue: "N"
              },
              {
                label: "Ui 文件后缀",
                fieldName: "uiSuffix",
                type: "input",
                formVisible: true,
                defaultValue: ".vue"
              },
              {
                label: "UI 类型",
                fieldName: "uiType",
                type: "select",
                formVisible: true,
                optionList: uiTypeList,
                defaultValue: "VUE_3_TS"
              }
            ]
          },
          {
            title: "Dto相关",
            tabName: "tab4",
            fieldList: [
              {
                label: "是否分离DTO",
                fieldName: "needSplitDto",
                type: "switch",
                formVisible: true,
                helpMsg: "DTO文件和业务文件是否放在同一个module里面",
                defaultValue: "N"
              }
            ]
          }
        ]
      },
      {
        label: "创建人",
        disabled: "Y",
        fieldName: "createdBy",
        type: "input",
        listVisible: true
      },
      {
        label: "创建日期",
        disabled: "Y",
        fieldName: "createdTime",
        type: "date",
        listVisible: true
      },
      {
        label: "修改人",
        disabled: "Y",
        fieldName: "updatedBy",
        type: "input",
        listVisible: true
      },

      {
        label: "修改日期",
        disabled: "Y",
        fieldName: "updatedTime",
        type: "date",
        listVisible: true
      },
      {
        label: "是否已逻辑",
        fieldName: "isDel",
        type: "number"
      },
      {
        label: "数据编号",
        fieldName: "dataNo",
        type: "input"
      },
      {
        label: "状态码",
        fieldName: "statusCode",
        type: "input"
      },
      {
        label: "状态码名称",
        fieldName: "statusName",
        type: "input"
      },
      {
        label: "国际码",
        fieldName: "local",
        type: "input"
      }
    ],
    batchFieldList: []
  });
  const primaryKey = "idCodeGenerator";
  const codeGeneratorRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);
  const orderBy = ref<OrderByInfo[]>([
    {
      fieldName: "updatedTime",
      ascOrDesc: "desc"
    }
  ]);

  const selectItemFun = (_data: any) => {};
  const dataFormat = (name: string, cellValue: object): any => {
    if (name == "datasourceConfigId") {
      return dbInfoList.value.find((item) => item.value == cellValue)?.name || cellValue;
    }
    if (name == "createdTime" || name == "updatedTime") {
      return createDatetime(cellValue);
    }
    return cellValue;
  };
  const init = async () => {
    dbInfoList.value = await initDbList();
    fileTypeList.value = await dictData("program_file_type");
    templateVersionList.value = await dictData("template_version");
    languageList.value = await dictData("program_language");
    uiTypeList.value = await dictData("ui_type");
    packagingList.value = await dictData("packaging_type");
  };
  onMounted(async () => {
    await init();
  });
  let extandBtns = ref<UserFuncInfo[]>([
    {
      btnName: "重新生成代码",
      authority: "add",
      icon: "code",
      priority: 1,
      funcName: (row: any) => {
        load("代码生成中，请稍后");
        download(`/code-generator/generator/code/convertToCodeById/${row[primaryKey]}`)
          .catch((err) => {
            warning(err);
          })
          .finally(() => {
            closeLoad();
          });
      }
    }
  ]);
  const generateFormRef = ref();
  const generateMerge = (type: string) => {
    generateFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
      let dataForm: any = generateFormRef.value.getFormData()?.value;
      if (res) {
        load("代码生成中,请稍后...");
        if (dataForm["prefixesStr"]) {
          dataForm["prefixesList"] = dataForm["prefixesStr"].split(";");
        }
        download("/code-generator/generator/code/convertToCode", dataForm)
          .catch((err) => {
            warning(err);
          })
          .finally(() => {
            closeLoad();
            if (type != "continue") {
              closeAction();
            }
          });
      }
    });
  };
  const closeAction = () => {
    dialogProps.editVisible = false;
  };
</script>
<template>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
    :selfFunc="true"
    @merge="generateMerge"
    @closeAction="closeAction"
  >
    <star-horse-form
      ref="generateFormRef"
      @refresh="codeGeneratorRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => codeGeneratorRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => codeGeneratorRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
      ref="codeGeneratorRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :orderBy="orderBy"
      :extandBtns="extandBtns"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
