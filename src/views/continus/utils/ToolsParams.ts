/**
 * 工具参数
 */
import {reactive, ref} from "vue";
import {FieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {loadData} from "@/api/sh_api.ts";
import {loadDict} from "@/api/star_horse.ts";

const compileLanguageList = ref<SelectOption[]>([]);
const languageVersionList = ref<SelectOption[]>([]);
const pluginVersionList = ref<SelectOption[]>([]);
const linkExecServerList = ref<SelectOption[]>([]);
const codeCommitorList = ref<SelectOption[]>([]);
const reportPersonList = ref<SelectOption[]>([
    {name: "作业操作人", value: "1"},
    {name: "流水线操作人", value: "2"},
    {name: "代码提交人", value: "3"},
]);
const reportTypeList = ref<SelectOption[]>([
    {name: "企业微信", value: "1"},
    {name: "钉钉", value: "2"},
    {name: "邮件", value: "3"},
    {name: "系统提醒", value: "4"},
]);
const loadLanguageVersions = async (val: any) => {
    languageVersionList.value = await loadDict(val["languageVersion"]);
}

const commonFields: FieldInfo[] = [{
    label: "编译语言",
    fieldName: "compileLanguage",
    type: "select",
    optionList: compileLanguageList,
    required: true,
    formShow: true,
    actionName: "change",
    actions: (val: any) => {
        loadLanguageVersions(val);
    },
    brotherNodes: [{
        fieldName: "languageVersion",
        type: "select",
        label: "版本",
        optionList: languageVersionList,
        required: true,
        formShow: true
    }]
}];
const errorPerson = ref<boolean>(false);
const successPerson = ref<boolean>(false);
const errorFlag = ref<boolean>(false);
const successFlag = ref<boolean>(false);
/**
 * 其它拓展配置
 */
const extendCommonFields: FieldInfo[] = [{
    fieldName: "row1",
    collapseList: [{
        title: "高级设置",
        tabName: "row1",
        subFormFlag: "N",
        objectName: "advancedSetting",
        fieldList: [[{
            label: "  ",
            type: "checkbox",
            formShow: true,
            optionList: [{name: "使用唯一镜像名称", value: "Y"}],
            fieldName: "singleImageFlag",
            preps: {
                colspan: 6,
                border: "Y"
            }
        }, {
            label: "关联使用执行机",
            type: "select",
            formShow: true,
            optionList: linkExecServerList,
            fieldName: "linkExecServer",
            preps: {
                colspan: 6
            }
        }]]
    }, {
        title: "运行结果通知",
        tabName: "result",
        subFormFlag: "N",
        objectName: "resultReport",
        fieldList: [[{
            label: "失败时通知",
            type: "switch",
            defaultValue: "N",
            fieldName: "errorReport",
            formShow: true,
            actionName: "change",
            actions: (val: any) => {
                console.log(val);
                errorFlag.value = val["errorReport"] == "Y";
            },
            preps: {
                colspan: 6
            }
        }], {
            label: "通知人",
            type: "checkbox",
            formShow: errorFlag,
            optionList: reportPersonList,
            fieldName: "errorReportPerson",
            actionName: "change",
            actions: (val: any) => {
                const temp = val["errorReportPerson"];
                errorPerson.value = temp && temp.indexOf("3") != -1;
            },
            preps: {
                border: "Y"
            },
            brotherNodes: [{
                type: "select",
                label: "  ",
                formShow: errorPerson,
                optionList: codeCommitorList,
                fieldName: "codeCommitor",
                preps: {
                    multiple: "Y"
                }
            }]
        }, {
            label: "通知方式",
            type: "checkbox",
            formShow: errorFlag,
            optionList: reportTypeList,
            fieldName: "errorReportType",
            preps: {
                border: "Y"
            },
        }, [{
            label: "成功时通知",
            type: "switch",
            defaultValue: "N",
            fieldName: "successReport",
            actionName: "change",
            actions: (val: any) => {
                successFlag.value = val["successReport"] == "Y";
            },
            formShow: true,
            preps: {
                colspan: 6
            }
        }], {
            label: "通知人",
            type: "checkbox",
            formShow: successFlag,
            actionName: "change",
            actions: (val: any) => {
                const temp = val["successReportPerson"];
                successPerson.value = temp && temp.indexOf("3") != -1;
            },
            optionList: reportPersonList,
            fieldName: "successReportPerson",
            preps: {
                border: "Y"
            },
            brotherNodes: [{
                type: "select",
                label: "  ",
                formShow: successPerson,
                optionList: codeCommitorList,
                fieldName: "codeCommitor",
                preps: {
                    multiple: "Y"
                }
            }]
        }, {
            label: "通知方式",
            type: "checkbox",
            formShow: successFlag,
            optionList: reportTypeList,
            fieldName: "successReportType",
        }]
    }]
}];
const mavenTools = reactive<FieldInfo[]>([
    [...commonFields, {
        label: "Maven版本",
        fieldName: "pluginVersion",
        type: "select",
        optionList: pluginVersionList,
        required: true,
        formShow: true,
    }, {
        label: "Pom文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "pom.xml",
        required: false,
        formShow: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "mvn clean compile package ",
        required: false,
        formShow: true,
    },
    ...extendCommonFields
]);
const gradleTools = reactive<FieldInfo[]>([
    [...commonFields, {
        label: "Gradle版本",
        fieldName: "pluginVersion",
        type: "select",
        optionList: pluginVersionList,
        required: true,
        formShow: true,
    }, {
        label: "Gradle文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "gradlew.bat",
        required: false,
        formShow: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "gradle build ",
        required: false,
        formShow: true,
    },
    ...extendCommonFields
]);
const antTools = reactive<FieldInfo[]>([
    [...commonFields, {
        label: "Ant版本",
        fieldName: "pluginVersion",
        type: "select",
        optionList: pluginVersionList,
        required: true,
        formShow: true,
    }, {
        label: "Ant文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "build.xml",
        required: false,
        formShow: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "ant build ",
        required: false,
        formShow: true,
    },
    ...extendCommonFields
]);
const goTools = reactive<PageFieldInfo | any>({});
const rustTools = reactive<PageFieldInfo | any>({});
const nodeTools = reactive<PageFieldInfo | any>({});
const viteTools = reactive<PageFieldInfo | any>({});
const webpackTools = reactive<PageFieldInfo | any>({});
const dockerTools = reactive<PageFieldInfo | any>({});
const userTools = reactive<PageFieldInfo | any>({});
const loadPlugin = (name: string) => {
    switch (name) {
        case "maven":
            return mavenTools;
        case "gradle":
            return gradleTools;
        case "ant":
            return antTools;
        case "vite":
            return viteTools;
        case "webpack":
            return webpackTools;
        default:
            console.log("不支持的编译类型");
    }
}
const init = async () => {
    compileLanguageList.value = (await loadData("/devops-continus/continus/baseInfo/programLanguage", {})).data;
    // compileLanguageList.value=(await loadData("/devops-continus/continus/baseInfo/programLanguage",{})).data;
    // compileLanguageList.value=(await loadData("/devops-continus/continus/baseInfo/programLanguage",{})).data;
}
await init();
export {
    mavenTools,
    gradleTools,
    antTools,
    goTools,
    rustTools,
    nodeTools,
    viteTools,
    webpackTools,
    dockerTools,
    userTools,
    loadPlugin
}
