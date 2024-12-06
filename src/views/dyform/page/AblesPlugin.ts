import {MoveableManagerInterface} from "vue3-moveable";

const customizedButton = [];
import ableCss from './moveable-able.css?raw';

export let contentMenuData = [
    {
        type: 'button',
        text: '水平居中',
        icon: 'center',
        display: () => true,
        handler: () => {

        },
    },
    {
        type: 'button',
        text: '复制',
        icon: 'copy',
        display: () => true,
        handler: () => {

        },
    },
    {
        type: 'divider',
        direction: 'horizontal',
        display: () => {
            return true;
        },
    },
    {
        type: 'button',
        text: '上移一层',
        icon: 'up-layer',
        display: () => true,
        handler: () => {

        },
    },
    {
        type: 'button',
        text: '下移一层',
        icon: 'down-layer',
        display: () => true,
        handler: () => {

        },
    },
    {
        type: 'button',
        text: '置顶',
        icon: 'to-top',
        display: () => true,
        handler: () => {

        },
    },
    {
        type: 'button',
        text: '置底',
        icon: 'to-bottom',
        display: () => true,
        handler: () => {

        },
    },

    {
        type: 'divider',
        direction: 'horizontal',
        display: () => true,
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
    },
    {
        type: 'button',
        icon: 'empty_setting',
        text: '清空参考线',
        handler: () => {

        },
    },
];
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
