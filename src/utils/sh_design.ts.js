const commands = [
    {
        icon: "left_panel",
        defaultEdit: true,
        key: 'leftPanel',
        label: '左侧工具栏',
    },
    {
        icon: "zoom_in",
        defaultEdit: true,
        key: 'zoomIn',
        label: '放大(0.2)',
    },
    {
        icon: "zoom_out",
        defaultEdit: true,
        key: 'zoomOut',
        label: '缩小(-0.2)',
    },
    {
        icon: "auto_fit",
        defaultEdit: true,
        key: 'zoomToFit',
        label: '自适应',
    },
    {
        icon: "equal",
        defaultEdit: true,
        key: 'zoomTo',
        label: '1:1大小',
    },
    {
        icon: "line_arrow",
        key: 'lineMode',
        label: '直线连接模式',
    },
    {
        icon: "vertical_arrow",
        key: 'verticalMode',
        label: '直角连接模式',
    },
    {
        icon: "align_top",
        key: 'alignTop',
        label: '向上对齐',
    },
    {
        icon: "align_bottom",
        key: 'alignBottom',
        label: '向下对齐',
    },
    {
        icon: "align_left",
        key: 'alignLeft',
        label: '向左对齐',
    },
    {
        icon: "align_right",
        key: 'alignRight',
        label: '向右对齐',
    },
    {
        icon: "center",
        key: 'centerContent',
        label: '居中',
    },
    {
        icon: "dustbin",
        key: 'deleteItem',
        label: '删除元素',
    },
    {
        icon: "empty_setting",
        key: 'empty',
        label: '清空画布',
    },
    {
        icon: "undo",
        key: 'unDo',
        label: '后退一步',
    },
    {
        icon: "redo",
        key: 'reDo',
        label: '前进一步',
    },
    {
        icon: "json_file",
        key: 'json',
        label: 'JSON数据',
    },
    {
        icon: "valid",
        key: 'valid',
        label: '校验',
    },
    {
        icon: "preview",
        key: 'preview',
        label: '预览',
    },
    {
        icon: "save",
        key: 'save',
        label: '保存',
    },

];
const ports = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
    items: [
        {
            group: 'top',
        },
        {
            group: 'right',
        },
        {
            group: 'bottom',
        },
        {
            group: 'left',
        },
    ],
};
export {commands, ports};