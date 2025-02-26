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
const continusNodeList = ref<Array<any>>([
    {icon: "continus-java", index: 1, name: "Java编译", code: "JavaCompile", default: "Y"},
    {icon: "continus-compile", index: 1, name: "普通编译", code: "BuildCfg"},
    {icon: "continus-golang", index: 1, name: "Go编译", code: "GoCompile"},
    {icon: "continus-python", index: 1, name: "Python编译", code: "PythonCompile"},
    {icon: "continus-nodejs", index: 1, name: "Node.JS编译", code: "NodeCompile"},
    {icon: "continus-android", index: 1, name: "Android编译", code: "AndroidCompile"},
    {icon: "continus-ios", index: 1, name: "IOS编译", code: "IosCompile"},
    {icon: "continus-junit", index: 2, name: "通用测试任务", code: "GenerateTest", default: "Y"},
    {icon: "continus-api", index: 2, name: "API接口测试", code: "ApiInterfaceTest"},
    {icon: "continus-cpp", index: 2, name: "C++单元测试", code: "CppUnitTest"},
    {icon: "continus-junit", index: 2, name: "Junit单元测试", code: "JunitTest"},
    {icon: "continus-nodejs", index: 2, name: "Node.JS单元测试", code: "NodeUnitTest"},
    {icon: "continus-golang", index: 2, name: "Golang单元测试", code: "GoUnitTest"},
    {icon: "continus-python", index: 2, name: "Python单元测试", code: "PythonUnitTest"},
    {icon: "continus-sonar", index: 3, name: "Sonar代码扫描", code: "SonarScan", default: "Y"},
    {icon: "continus-app-sql-audit", index: 3, name: "应用Sql性能审核", code: "AppSqlAudit"},
    {icon: "continus-db-audit", index: 3, name: "Db审核", code: "DbAudit"},
    {icon: "continus-quality-gates", index: 4, name: "质量门禁", code: "EntranceGuard", default: "Y"},
    {icon: "continus-fortify", index: 4, name: "Fortify代码检查", code: "FortifyScan"},
    {icon: "continus-safe", index: 4, name: "安全加固", code: "SecurityReinforcement"},
    {icon: "continus-deploy", index: 5, name: "普通部署", code: "GeneralDeploy", default: "Y"},
    {icon: "continus-script-task", index: 5, name: "脚本部署", code: "ScriptDeploy"},
    {icon: "continus-archive", index: 6, name: "制品库下载链接", code: "PackageDownload", default: "Y"},
    {icon: "continus-http", index: 6, name: "http请求任务", code: "HttpRequest"},
    {icon: "continus-docker", index: 6, name: "镜像移交", code: "ImageHandOver"},
    {icon: "continus-docker", index: 6, name: "镜像推送", code: "ImageSend"},
    {icon: "continus-jenkins", index: 6, name: "Jenkins任务", code: "JenkinsTask"},
    {icon: "file_transfer", index: 6, name: "大文件外发", code: "BigFileSendOut"},
    {icon: "continus-increment", index: 6, name: "增量包制作", code: "IncPackageCreate"},
    {icon: "continus-windows", index: 6, name: "WindowsMSBuild构建任务", code: "WmsBuildTask"},
    {icon: "continus-windows", index: 6, name: "Windows批处理脚本执行", code: "WBatchScriptExec"},
]);
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
    formVisible: true,
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
        formVisible: true
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
            formVisible: true,
            optionList: [{name: "使用唯一镜像名称", value: "Y"}],
            fieldName: "singleImageFlag",
            preps: {
                colspan: 6,
                border: "Y"
            }
        }, {
            label: "关联使用执行机",
            type: "select",
            formVisible: true,
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
            formVisible: true,
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
            formVisible: errorFlag,
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
                formVisible: errorPerson,
                optionList: codeCommitorList,
                fieldName: "codeCommitor",
                preps: {
                    multiple: "Y"
                }
            }]
        }, {
            label: "通知方式",
            type: "checkbox",
            formVisible: errorFlag,
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
            formVisible: true,
            preps: {
                colspan: 6
            }
        }], {
            label: "通知人",
            type: "checkbox",
            formVisible: successFlag,
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
                formVisible: successPerson,
                optionList: codeCommitorList,
                fieldName: "codeCommitor",
                preps: {
                    multiple: "Y"
                }
            }]
        }, {
            label: "通知方式",
            type: "checkbox",
            formVisible: successFlag,
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
        formVisible: true,
    }, {
        label: "Pom文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "pom.xml",
        required: false,
        formVisible: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "mvn clean compile package ",
        required: false,
        formVisible: true,
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
        formVisible: true,
    }, {
        label: "Gradle文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "gradlew.bat",
        required: false,
        formVisible: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "gradle build ",
        required: false,
        formVisible: true,
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
        formVisible: true,
    }, {
        label: "Ant文件",
        fieldName: "fileName",
        type: "input",
        defaultValue: "build.xml",
        required: false,
        formVisible: true,
    },],
    {
        label: "编译脚本",
        fieldName: "compileScript",
        type: "textarea",
        defaultValue: "ant build ",
        required: false,
        formVisible: true,
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
    let reData = await loadData("/devops-continus/continus/baseInfo/programLanguage", {});
    compileLanguageList.value = reData?.data;
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
    continusNodeList,
    loadPlugin
}
