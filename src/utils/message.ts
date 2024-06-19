import {ElMessage, ElMessageBox} from "element-plus";

export const confirm = (msg:string):Promise<boolean> => {
    return new Promise((resolve,reject)=>{
        ElMessageBox.confirm(msg, "警告", {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            resolve(true);
        }).catch(() => {
            reject(false);
        });
    });
   
}
export const message = (msg:string) => {
    ElMessage(msg)
}
export const success = (msg:string) => {
    ElMessage({
        message: msg,
        type: 'success',
    })
}
export const warning = (msg:string) => {
    ElMessage({
        message: msg,
        type: 'warning',
    })
}
export const error = (msg:string) => {
    ElMessage.error(msg)
}
