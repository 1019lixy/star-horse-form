import {useUserSelfOperation} from "@/store/SelfOperationStore.ts";
import piniaInstance from "@/store";

/**
 * 动态表单用户自定义驱动
 */
const userOperation = useUserSelfOperation(piniaInstance);
/**
 *
 * @param code 需要执行的代码
 * @param context 组件上下文信息
 */
export const userFunction = (code: string, context: any) => {
    if (!code) {
        return;
    }
    let formFields: any = userOperation.fieldItemList;
    let formData: any = userOperation.formData;
    console.log(formFields, formData);
    let fun = new Function("currentField", "formData", "formFields", code);
    fun.call(this, context.attrs["formInfo"], context.attrs["formData"], formFields);
}
