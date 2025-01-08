import {getId} from '../util/nodeUtil';
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const flowDesign = useFlowDesign(piniaInstance);

export function uuid() {
    return getId();
}

/**
 * 打开侧边配置
 * @param {*} name
 * @param {*} node
 * @param {*} routeNode
 */
export function open(name: any, node: any, routeNode: any) {
    flowDesign.activeNode(node);
    // 高亮
    // flowMixin.isActive = true;
    //  打开配置
    // name.showDrawer(node, routeNode);
}

/**
 * 关闭是取消当前设定的节点
 */
export function close() {
    flowDesign.setActive(false);
}

/**
 * 删除节点
 * @param {*} node
 * @param {*} fun
 */
export function delNode(node: any, fun: Function) {
    flowDesign.flowDelNode(node);
    // 回调
    if (fun) {
        fun(node);
    }
}

/**
 * 添加分支节点
 * @param {*} node
 */
export function addBranch(node: any) {
    flowDesign.flowAddBranch(node);
}

/**
 * 审批配置审批人Radio组件样式
 * @returns
 */
export function radioStyle() {
    return {
        display: 'block',
        height: '22px',
        lineHeight: '22px',
        'margin-bottom': '16px',
    };
}

/**
 * 审批配置审批人Radio组件样式
 * @returns
 */
export function approvalRadioStyle() {
    const width = scale.isMobile() ? '45%' : '31%';
    return {
        width: width,
        lineHeight: '22px',
        marginBottom: '16px',
    };
}

/**
 * 节点头部样式
 * @returns
 */
export function nameClass(node: any, defaultStyle: any) {
    if (node.status == -1) {
        return defaultStyle;
    }
    return {
        'node-status-not': node.status == 0,
        'node-status-current': node.status == 1,
        'node-status-complete': node.status == 2
    };
}

export const flowMixin = {
    isActive: false,
    // 大小，可选值为 small large
    size: 'default',
    // el-drawer内容滚动
    bodyStyle: {
        height: 'calc(100vh - 114px)',
        'overflow-y': 'auto',
    }
};
