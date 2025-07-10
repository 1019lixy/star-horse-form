import { PageComp } from "@/components/types/PageLayoutComp.ts";

export const pageCompList: PageComp[] = [
    {
        id: "a",
        label: "系统组件",
        name: "system",
        icon: "system",
        items: [{
            id: "1",
            label: "表格",
            name: "table",
            icon: "table",
            preps: {}
        },
        {
            id: "2",
            label: "分页条",
            name: "pagination",
            icon: "pagebar",
            preps: {}
        },
        {
            id: "3",
            label: "图片",
            name: "image",
            icon: "image",
            preps: {}
        },
        {
            id: "4",
            label: "走马灯",
            name: "carousel",
            icon: "carousel",
            preps: {}
        },
        {
            id: "5",
            label: "日历",
            name: "calendar",
            icon: "calendar",
            preps: {}
        },
        {
            id: "6",
            label: "分割面板",
            name: "splitter",
            icon: "splitter",
            preps: {}
        },
        {
            id: "7",
            label: "统计",
            name: "statistic",
            icon: "statistic",
            preps: {}
        },
        {
            id: "8",
            label: "页头",
            name: "pageHeader",
            icon: "pageHeader",
            preps: {}
        },
        {
            id: "9",
            label: "菜单",
            name: "menu",
            icon: "menu",
            preps: {}
        },
        {
            id: "10",
            label: "步骤条",
            name: "steps",
            icon: "steps",
            preps: {}
        },
        {
            id: "11",
            label: "时间线",
            name: "timeline",
            icon: "timeline",
            preps: {}
        }, {
            id: "12",
            label: "表单",
            name: "form",
            icon: "form",
            preps: {}
        }],
        container: {}
    },
    {
        id: "b",
        label: "自定义组件",
        name: "custom",
        icon: "custom",
        items: [],
        container: {}
    }
];