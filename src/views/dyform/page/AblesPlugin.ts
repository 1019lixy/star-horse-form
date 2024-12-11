import {MoveableManagerInterface} from "vue3-moveable";
import ableCss from './moveable-able.css?raw';
import {CopyerOperation} from "@/store/CopyerOperationStore.ts";
import piniaInstance from "@/store";
import {computed, reactive} from "vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import {uuid} from "@/api/system.ts";

const customizedButton: Array<any> = [];
const copyerAction = CopyerOperation(piniaInstance);
const designForm = DesignForm(piniaInstance);
let compList = computed(() => designForm.compList);
const pasteDisplay = computed(() => {
    const action = copyerAction.action;
    console.log("xxxxxxxxxxx", action);
    return !!action;
});

export function getParentComp(parentField: any) {
    return parentField &&
    (parentField.itemType == "box"
        || parentField.itemType == "tab"
        || parentField.itemType == "dytable"
        || parentField.itemType == "table")
        ? "container"
        : "item";
}

/**
 * 从舞台删除组件
 * @param isEdit
 * @param formItem
 * @param parentField
 */
export function removeItem(isEdit: boolean, formItem: any, parentField: any) {
    if (!isEdit) {
        return;
    }
    console.log(formItem, parentField);
    let parentItemType = parentField?.itemType;

    let dataList = compList.value;
    if (parentItemType == "tab" || parentItemType == "table" || parentItemType == "card" || parentItemType == "collapse") {
        let elements = parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
            let items = elements[i].items;
            for (let j = 0; j < items.length; j++) {
                if (formItem.id === items[j]?.id) {
                    items.splice(j, 1);
                    return;
                }
            }
        }
    } else if (parentItemType == "box" || parentItemType == "dytable") {
        let elements = parentField!.preps.elements;
        for (let index in elements) {
            let sdataTemp = elements[index];
            if (sdataTemp.columns.length > 0) {
                for (let i = 0; i < sdataTemp.columns.length; i++) {
                    let items = sdataTemp.columns[i].items;
                    for (let j = 0; j < items.length; j++) {
                        if (formItem.id === items[j].id) {
                            items.splice(j, 1);
                            return;
                        }
                    }
                }
            }
        }
    } else {
        for (let i = 0; i < dataList.length; i++) {
            if (formItem.id === dataList[i].id) {
                dataList.splice(i, 1);
                return;
            }
        }
    }
}

/**
 * 上移组件
 * @param formItem
 * @param parentField
 */
export function moveUpItem(isEdit: boolean, formItem: any, parentField: any) {
    if (!isEdit) {
        return;
    }
    //这个数据解析好麻烦
    let dataList = compList.value;
    if (parentField?.itemType == "tab") {
        let elements = parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
            let items = elements[i].items;
            for (let j = 0; j < items.length; j++) {
                if (formItem.id === items[j]?.id && j > 0) {
                    let temp = items[j];
                    items[j] = items[j - 1];
                    items[j - 1] = temp;
                    return;
                }
            }
        }
    } else if (parentField?.itemType == "box") {
    }
    //console.log(props.parentField);
    let compType = getParentComp(parentField);
    if (compType === "item") {
        for (let i = 0; i < dataList.length; i++) {
            if (formItem.id === dataList[i].id && i > 0) {
                let temp = dataList[i];
                dataList[i] = dataList[i - 1];
                dataList[i - 1] = temp;
                break;
            }
        }
    } else {
        for (let i = 0; i < dataList.length; i++) {
            let dataTemp = dataList[i];
            if (dataTemp.compType !== "container") {
                continue;
            }
            let elements = dataTemp.preps.elements;
            for (let index in elements) {
                let sdataTemp = elements[index];
                if (sdataTemp.columns.length > 0) {
                    for (let i = 0; i < sdataTemp.columns.length; i++) {
                        let items = sdataTemp.columns[i].items;
                        for (let j = 0; j < items.length; j++) {
                            if (formItem.id === items[j].id && j > 0) {
                                let temp = items[j];
                                items[j] = items[j - 1];
                                items[j - 1] = temp;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

export function moveDownItem(isEdit: boolean, formItem: any, parentField: any) {
    if (!isEdit) {
        return;
    }
    let dataList = compList.value;
    if (parentField?.itemType == "tab") {
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
            let items = elements[i].items;
            for (let j = 0; j < items.length; j++) {
                if (formItem.id === items[j]?.id && j < items.length - 1) {
                    let temp = items[j];
                    items[j] = items[j + 1];
                    items[j + 1] = temp;
                    return;
                }
            }
        }
    } else if (parentField?.itemType == "box") {

    }
    let compType = getParentComp(parentField);
    if (compType === "item") {
        for (let i = 0; i < dataList.length; i++) {
            if (formItem.id === dataList[i].id && i < dataList.length - 1) {
                let temp = dataList[i];
                dataList[i] = dataList[i + 1];
                dataList[i + 1] = temp;
                break;
            }
        }
    } else {
        for (let i = 0; i < dataList.length; i++) {
            let dataTemp = dataList[i];
            if (dataTemp.compType !== "container") {
                continue;
            }
            let elements = dataTemp.preps.elements;
            for (let index in elements) {
                let sdataTemp = elements[index];
                if (sdataTemp.columns.length > 0) {
                    for (let i = 0; i < sdataTemp.columns.length; i++) {
                        let items = sdataTemp.columns[i].items;
                        for (let j = 0; j < items.length; j++) {
                            if (formItem.id === items[j].id && j < items.length - 1) {
                                let temp = items[j];
                                items[j] = items[j + 1];
                                items[j + 1] = temp;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * 拷贝容器
 * @param parentComp
 * @param containerType
 * @param currentContainer
 */
export const copyContainer = (parentComp: Array<any>, currentContainer: any) => {
    if (!currentContainer) {
        return;
    }
    const containerType = currentContainer.itemType;
    const container = JSON.parse(JSON.stringify(currentContainer));
    //box和dytable 有列属性
    if (containerType == "box" || containerType == "dytable") {
        const rows = container.preps.elements;
        for (const index in rows) {
            const row = rows[index];
            for (const cIndex in row.columns) {
                const col = row.columns[cIndex];
                col._uuid = uuid();
                complexFields(col.items);
            }
        }
    } else {
        const rows = container.preps.elements;
        for (const index in rows) {
            complexFields(rows[index].items);
        }
    }
    parentComp.push(container);
}

export function contextOperation(act: string, item: any, parentItem: any) {

}

export function cut(item: any, parentItem: any) {
    copyerAction.operation("cut", parentItem, item);
}

export function copy(item: any, parentItem: any) {
    copyerAction.operation("copy", parentItem, item);

}

export function paste(parentItem: any) {
    console.log("粘贴");
    let copyerData = copyerAction.copyerData;
    if (copyerData) {
        return;
    }
    if (parentItem) {
        let action = copyerAction.action;
        copyContainer(parentItem!.preps?.elements, copyerData);
    } else {
        //拷贝容器
        if (getParentComp(copyerData) == "container") {
            let parentContainer = copyerAction.parentContainer;
            copyContainer(parentContainer ? parentContainer!.preps?.elements : compList.value, copyerData);
        } else {
            copyerData = JSON.parse(JSON.stringify(copyerData));
            copyerData.id = uuid();
            copyerData.preps.id = parentItem.id;
            compList.value.push(copyerData);
        }
    }
    console.log(copyerData, parentContainer, action);
}

/**
 *
 * @param flag scene 场景 container 容器 item 组件
 */
export function dynamicFormContextMenuData(item: any, parentItem: any, flag: string = 'scene') {
    let menus = reactive<Array<any>>([]);
    menus.push({
            type: 'button',
            text: '剪切',
            icon: 'cut',
            display: true,
            handler: () => {
                cut(item, parentItem);
            },
        },
        {
            type: 'button',
            text: '复制',
            icon: 'copy',
            display: true,
            handler: () => {
                copy(item, parentItem);
            },
        },
        {
            type: 'button',
            text: '粘贴',
            icon: 'paste',
            display: pasteDisplay,
            handler: () => {
                paste(parentItem)
            },
        },
        {
            type: 'divider',
            direction: 'horizontal',
            display: () => true,
        },);
    if (flag == 'scene') {
        menus = [{
            type: 'button',
            text: '新建',
            icon: 'new',
            display: true,
            handler: () => {
            },
        }, {
            type: 'button',
            text: '全选',
            icon: 'select-all',
            display: true,
            handler: () => {
            },
        }, {
            type: 'button',
            text: '清空',
            icon: 'dustbin',
            display: true,
            handler: () => {
            },
        }, {
            type: 'divider',
            direction: 'horizontal',
            display: true,
        }, {
            type: 'button',
            text: '预览',
            icon: 'preview',
            display: true,
            handler: () => {
            },
        },];
    } else {
        if (flag == 'container') {
            menus.push({
                type: 'button',
                text: '添加组件',
                icon: 'new',
                display: true,
                handler: () => {
                },
            },);
        }
        menus.push(
            {
                type: 'button',
                text: '撤销',
                icon: 'undo',
                display: true,
                handler: () => {
                },
            },
            {
                type: 'divider',
                direction: 'horizontal',
                display: true,
            },
            {
                type: 'button',
                text: '删除',
                icon: 'delete',
                display: () => true,
                handler: () => {
                },
            },
            {
                type: 'divider',
                direction: 'horizontal',
                display: true,
            },
            {
                type: 'button',
                text: '属性',
                icon: 'prep',
                display: true,
                handler: () => {
                },
            });
    }
    return menus;
}

export function dynamicPageContextMenuData() {
    let contentMenuData: Array<any> = [];
    contentMenuData = [
        {
            type: 'button',
            text: '水平居中',
            icon: 'center',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'button',
            text: '复制',
            icon: 'copy',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'divider',
            direction: 'horizontal',
            display: true,
        },
        {
            type: 'button',
            text: '上移一层',
            icon: 'up-layer',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'button',
            text: '下移一层',
            icon: 'down-layer',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'button',
            text: '置顶',
            icon: 'to-top',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'button',
            text: '置底',
            icon: 'to-bottom',
            display: true,
            handler: () => {

            },
        },

        {
            type: 'divider',
            direction: 'horizontal',
            display: true,
        },
        {
            type: 'button',
            text: '删除',
            icon: 'delete',
            display: true,
            handler: () => {

            },
        },
        {
            type: 'divider',
            direction: 'horizontal',
            display: true,
        },
        {
            type: 'button',
            icon: 'empty_setting',
            text: '清空参考线',
            display: true,
            handler: () => {

            },
        },
    ];
    return contentMenuData;
}


export let Editable = {
    name: "editable",
    props: [],
    always: true,
    events: [],
    render(moveable: MoveableManagerInterface<any, any>, React: Renderer) {
        const rect = moveable.getRect();
        const {pos2} = moveable.state;
        const editableViewer = moveable.useCSS("div", `
            {
             position: absolute;
            left: 0px;
            top: 0px;
            will-change: transform;
            transform-origin: 60px 28px;
            display: flex;
            }
         ${ableCss}
            `);
        return React.createElement(
            editableViewer,
            {
                className: 'moveable-editable',
                style: {
                    transform: `translate(${pos2[0] - (customizedButton.length + 3) * 20}px, ${pos2[1] - 28}px) rotate(${
                        rect.rotation
                    }deg)`,
                },
            },
            [
                ...customizedButton.map((buttonRenderer) => {
                    const options = buttonRenderer(React);
                    return React.createElement('button', options.props || {}, ...(options.children || []));
                }),

                React.createElement(
                    'button',
                    {
                        className: 'moveable-button moveable-rerender-button',
                        title: '重新收集依赖后渲染',
                        onClick: () => {
                            handler(AbleActionEventType.RERENDER);
                        },
                    },
                    React.createElement('img', {
                        src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb24tdGFibGVyLXJlcGxhY2UiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZT0iI2ZmZmZmZiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICA8cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgLz4KICA8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxIiAvPgogIDxwYXRoIGQ9Ik0yMSAxMXYtM2EyIDIgMCAwIDAgLTIgLTJoLTZsMyAzbTAgLTZsLTMgMyIgLz4KICA8cGF0aCBkPSJNMyAxM3YzYTIgMiAwIDAgMCAyIDJoNmwtMyAtM20wIDZsMyAtMyIgLz4KPC9zdmc+CgoK',
                        width: '16',
                        height: '16',
                    }),
                ),
                React.createElement(
                    'button',
                    {
                        className: 'moveable-button',
                        title: '选中父组件',
                        onClick: () => {
                            handler(AbleActionEventType.SELECT_PARENT);
                        },
                    },
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-top-icon',
                    }),
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-body-icon',
                    }),
                ),
                React.createElement('button', {
                    className: 'moveable-button moveable-remove-button',
                    title: '删除',
                    onClick: () => {
                        handler(AbleActionEventType.REMOVE);
                    },
                }),
                React.createElement(
                    'button',
                    {
                        className: 'moveable-button moveable-drag-area-button',
                        title: '拖动',
                    },
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-top',
                    }),
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-bottom',
                    }),
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-left',
                    }),
                    React.createElement('div', {
                        className: ' moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-right',
                    }),
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-body-icon-horizontal',
                    }),
                    React.createElement('div', {
                        className: 'moveable-select-parent-arrow-body-icon-vertical',
                    }),
                ),
            ],
        );
    }
};
