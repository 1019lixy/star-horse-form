import {useUserSelfOperation} from "@/store/SelfOperationStore.ts";
import piniaInstance from "@/store";
import {download, getRequest, postRequest, uploadRequest} from "@/api/star_horse.ts";
import {getUserInfo} from "@/utils/auth.ts";

/**
 * 动态表单用户自定义驱动
 */
const userOperation = useUserSelfOperation(piniaInstance);
/**
 * 用户自定义事件对接接口
 * @param code 需要执行的代码
 * @param context 组件上下文信息
 */
export const userFunction = (code: string, context: any) => {
    if (!code) {
        return;
    }
    //表单元素
    let formFields: any = userOperation.fieldItemList;
    //表单数据
    // let formData: any = userOperation.formData;
    //表单实例
    let formInstance: any = userOperation.formInstance;
    // console.log(formFields, formData, formInstance);
    /**
     * currentField 当前组件信息
     * formData 表单数据
     * formFields 表单所有属性
     * formInstance 表单实例
     * userInfo 当前登录信息
     * postRequest Post 请求接口
     * getRequest Get 请求接口
     * download 下载数据接口
     * upload 上传数据接口
     */
    let fun = new Function("currentField", "formData", "formFields", "formInstance", "userInfo", "postRequest",
        "getRequest", "download", "upload", code);
    fun.call(this, context.attrs["formInfo"], context.attrs["formData"], formFields, formInstance, getUserInfo(),
        postRequest, getRequest, download, uploadRequest);
}
