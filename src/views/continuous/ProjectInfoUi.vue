<script setup lang="ts" name="ProjectInfoUi">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  SearchFields,
  SelectOption,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/projectInfo",
);
let libTypeList = ref<Array<SelectOption>>([]);
let languageList = ref<Array<SelectOption>>([]);
let charsetList = ref<Array<SelectOption>>([]);
let projectRoleList = ref<Array<SelectOption>>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("project.info.project.name"),
      fieldName: "projectName",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("project.info.program.language"),
      fieldName: "programLanguage",
      type: "select",
      matchType: "lk",
      defaultVisible: true,
      preps: {
        values: languageList,
      },
    },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: i18n("project.info.primary.key"),
      fieldName: "idProjectInfo",
      type: "long",
    },
    {
      label: i18n("project.info.repo.type"),
      fieldName: "repoType",
      type: "select",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        values: libTypeList,
      },
    },
    [
      {
        label: i18n("project.info.repo.url"),
        fieldName: "repoUrl",

        helpMsg: "eg:[http://|https://|ssh://|git@]192.168.0.1/test",
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("project.info.program.language"),
        fieldName: "programLanguage",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: languageList,
        },
      },
    ],
    [
      {
        label: i18n("project.info.project.name"),
        fieldName: "projectName",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("project.info.project.charset"),
        fieldName: "projectCharset",
        type: "select",
        defaultValue: "UTF-8",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: charsetList,
        },
      },
    ],
    [
      {
        label: i18n("project.info.line.account"),
        fieldName: "lineAccount",

        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("project.info.line.security"),
        fieldName: "lineSecurity",

        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: i18n("project.info.remark"),
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
    },
    {
      batchFieldList: [
        {
          batchName: "memberList",
          title: i18n("project.info.project.members"),
          fieldList: [
            {
              label: i18n("project.info.username"),
              fieldName: "username",
              type: "dialog-input",
              formVisible: true,
              preps: {
                primaryKey: "idEmployeeInfo",
                dataUrl: {
                  pageListUrl: "system-config/system/employeeInfo/pageList",
                },
                needField: [
                  { sourceField: "employeeNo", distField: "username" },
                  { sourceField: "name", distField: "name" },
                ],

                fieldList: [
                  {
                    label: i18n("project.info.name"),
                    fieldName: "name",

                    required: true,
                    prefix: "a",
                    formVisible: true,
                    listVisible: true,
                    searchVisible: true,
                  },
                  {
                    label: i18n("project.info.employee.no"),
                    fieldName: "employeeNo",

                    prefix: "a",
                    helpMsg: i18n("project.info.if.not.filled.system.auto.generate"),
                    required: false,
                    formVisible: true,
                    listVisible: true,
                    searchVisible: true,
                    preps: {
                      editdisabled: true,
                    },
                  },
                  {
                    label: i18n("project.info.rank"),
                    fieldName: "rank",
                    type: "tselect",
                    required: false,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      showCode: "Y",
                    },
                  },
                  {
                    label: i18n("project.info.station"),
                    fieldName: "station",
                    type: "tselect",
                    required: false,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      showCode: "Y",
                    },
                  },
                ],
              },
            },
            {
              label: i18n("project.info.name"),
              fieldName: "name",
              type: "tag",
              formVisible: true,
            },
            {
              label: i18n("project.info.role.name"),
              fieldName: "roleName",
              type: "select",
              formVisible: true,
              preps: {
                values: projectRoleList,
              },
            },
            {
              label: i18n("project.info.effective.date"),
              fieldName: "effectiveDate",
              type: "datetime",
              formVisible: true,
            },
            {
              label: i18n("project.info.expiration.date"),
              fieldName: "expirationDate",
              type: "datetime",
              formVisible: true,
            },
            {
              label: i18n("project.info.is.manager"),
              fieldName: "isManager",
              type: "switch",
              defaultValue: "2",
              formVisible: true,
              preps: {
                activeValue: "1",
                activeText: i18n("project.info.yes"),
                inactiveValue: "2",
                inactiveText: i18n("project.info.no"),
              },
            },
          ],
        },
      ],
    },
    {
      label: i18n("project.info.created.by"),
      disabled: true,
      fieldName: "createdBy",

      listVisible: true,
    },
    {
      label: i18n("project.info.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("project.info.updated.by"),
      disabled: true,
      fieldName: "updatedBy",

      listVisible: true,
    },

    {
      label: i18n("project.info.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("project.info.data.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("project.info.is.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("project.info.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("project.info.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("project.info.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("project.info.international.code"),
      fieldName: "local",
    },
  ],
  batchFieldList: [],
});