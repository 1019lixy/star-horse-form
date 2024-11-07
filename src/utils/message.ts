import {ElMessageBox} from "element-plus";
import Message from 'vue-m-message';
import 'vue-m-message/dist/style.css';

export const confirm = (msg: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
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
/**
 * 消息提
 * @param msg 消息内容
 * @param type 类型
 * @param duration 持续时间
 * @param title 标题
 * @param position 位置
 */
export const message = (msg: string, type: string = "info", duration: number = 2000, title: string = "提示", position: string = "top-right") => {
    Message({
        message: msg,
        type: type,
        duration: duration,
        title: title,
        position: position,
        supportHTML: true,
        stopTimerOnHover: true,
    });
}
/**
 * 成功提示
 * @param msg 消息内容
 */
export const success = (msg: string) => {
    Message.success(msg, {
        title: "成功",
        supportHTML: true,
        stopTimerOnHover: true,
        position: "bottom-right"
    });
}
/**
 * 警告提示
 * @param msg 消息内容
 */
export const warning = (msg: string) => {
    Message.warning(msg, {
        title: "警告",
        supportHTML: true,
        stopTimerOnHover: true,
        position: "bottom-right"
    });
}
/**
 * 错误提示
 * @param msg 消息内容
 */
export const error = (msg: string) => {
    Message.error(msg, {
        title: "错误",
        supportHTML: true,
        stopTimerOnHover: true,
        position: "bottom-right"
    });
}
