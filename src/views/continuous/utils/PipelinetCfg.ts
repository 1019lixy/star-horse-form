import {apiInstance, ApiUrls, loadData, loadGetData, postRequest, success, warning} from "star-horse-lowcode";

const execRecordApi: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineConfig",
);
const execUrl: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineInstance",
);
/**
 * 加载流水线配置
 * @param idPipelineInfo 流水线ID
 */
export const loadPipelineCfg = (idPipelineInfo: string) => {
    return loadData(`${execRecordApi.basePrefix}/loadConfigInfoById/${idPipelineInfo}`, {});
};
/**
 * 加载流水线执行记录
 * @param idPipelineInfo 流水线ID
 */
export const loadPipelineInstance = (idPipelineInfo: string) => {
    return loadData(`${execUrl.basePrefix}/loadInstanceById/${idPipelineInfo}`, {});
};
/**
 * 执行流水线
 * @param idPipelineConfig
 * @param methodName
 */
export const execLine = (idPipelineConfig: string, methodName: string) => {
    postRequest(execUrl.basePrefix + `/${methodName}/` + idPipelineConfig, {}).then((res) => {
        if (res?.data?.code == 0) {
            success("执行成功");
        } else {
            warning(res?.data?.cnMessage);
        }
    });
};
/**
 * 执行节点
 * @param item
 * @param methodName
 */
export const execNode = (item: any,instance:any, methodName: string) => {
    console.log(item);
    postRequest(execUrl.basePrefix + `/${methodName}/${instance.idPipelineInstance}/` + item.idNodeInfo, {}).then((res) => {
        if (res?.data?.code == 0) {
            success("执行成功");
        } else {
            warning(res?.data?.cnMessage);
        }
    });
};
/**
 * 加载表单字段
 * @param formNo 表单编号
 */
export const loadFormFields = async (formNo: string) => {
    return await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formNo}`,);
};
