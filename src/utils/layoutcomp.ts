import { PageComp } from "@/components/types/PageLayoutComp";
import { i18n } from "@/lang";

export const pageCompList: PageComp[] = [
  {
    id: "a",
    label: i18n("system.flex.layoutcomp.system"),
    name: "system",
    icon: "system",
    items: [
      {
        id: "1",
        label: i18n("system.flex.layoutcomp.table"),
        name: "ptable",
        icon: "table",
        styles: {
          width: 100,
          height: 100,
        },
        preps:{

        }
      },
      {
        id: "2",
        label: i18n("system.flex.layoutcomp.pagination"),
        name: "ppagebar",
        icon: "pagebar",
        styles: {
          width: 100,
          height: 40,
        },
        preps: {
          layout: "prev,pager,next",
          total: 1000,
        },
      },
      {
        id: "3",
        label: i18n("system.flex.layoutcomp.image"),
        name: "pimage",
        icon: "image",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "4",
        label: i18n("system.flex.layoutcomp.carousel"),
        name: "pcarousel",
        icon: "carousel",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "5",
        label: i18n("system.flex.layoutcomp.calendar"),
        name: "pcalendar",
        icon: "calendar",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "6",
        label: i18n("system.flex.layoutcomp.splitter"),
        name: "psplitter",
        icon: "splitter",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "7",
        label: i18n("system.flex.layoutcomp.statistic"),
        name: "pstatistic",
        icon: "statistic",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "8",
        label: i18n("system.flex.layoutcomp.pageheader"),
        name: "ppageheader",
        icon: "pageHeader",
        preps: {},
      },
      {
        id: "9",
        label: i18n("system.flex.layoutcomp.menu"),
        name: "pmenubar",
        icon: "menu",
        styles: {
          width: 100,
          height: 50,
        },
        preps: {},
      },
      {
        id: "10",
        label: i18n("system.flex.layoutcomp.steps"),
        name: "psteps",
        icon: "steps",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "11",
        label: i18n("system.flex.layoutcomp.timeline"),
        name: "ptimeline",
        icon: "timeline",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "12",
        label: i18n("system.flex.layoutcomp.form"),
        name: "pform",
        icon: "form",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "13",
        label: i18n("system.flex.layoutcomp.banner"),
        name: "pbanner",
        icon: "banner",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "14",
        label: i18n("system.flex.layoutcomp.card"),
        name: "pcard",
        icon: "card",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "15",
        label: i18n("system.flex.layoutcomp.content"),
        name: "pcontent",
        icon: "content",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "16",
        label: i18n("system.flex.layoutcomp.copyright"),
        name: "pcopyright",
        icon: "copyright",
        styles: {
          width: 100,
          height: 40,
        },
        preps: {},
      },
      {
        id: "17",
        label: i18n("system.flex.layoutcomp.hmenu"),
        name: "phmenu",
        icon: "hmenu",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "18",
        label: i18n("system.flex.layoutcomp.link"),
        name: "plink",
        icon: "links",
        styles: {
          width: 100,
          height: 40,
        },
        preps: {},
      },
      {
        id: "19",
        label: i18n("system.flex.layoutcomp.logo"),
        name: "plogo",
        icon: "logo",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "20",
        label: i18n("system.flex.layoutcomp.navbar"),
        name: "pnavbar",
        icon: "navbar",
        styles: {
          width: 100,
          height: 100,
        },
        preps: {},
      },
      {
        id: "21",
        label: i18n("system.flex.layoutcomp.chart"),
        name: "chart",
        icon: "chart",
        preps: {
          type: "line",
          option: {
            title: { text: i18n("system.flex.layoutcomp.chart.example") },
            tooltip: { trigger: "axis" },
            xAxis: {
              type: "category",
              data: [
                i18n("system.flex.layoutcomp.chart.week.monday"),
                i18n("system.flex.layoutcomp.chart.week.tuesday"),
                i18n("system.flex.layoutcomp.chart.week.wednesday"),
                i18n("system.flex.layoutcomp.chart.week.thursday"),
                i18n("system.flex.layoutcomp.chart.week.friday"),
                i18n("system.flex.layoutcomp.chart.week.saturday"),
                i18n("system.flex.layoutcomp.chart.week.sunday"),
              ],
            },
            yAxis: { type: "value" },
            series: [
              {
                data: [120, 200, 150, 80, 70, 110, 130],
                type: "line",
                smooth: true,
              },
            ],
          },
        },
      },
    ],
    container: {},
  },
  {
    id: "b",
    label: i18n("system.flex.layoutcomp.custom"),
    name: "custom",
    icon: "custom",
    items: [],
    container: {},
  },
];
