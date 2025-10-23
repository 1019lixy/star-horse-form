import { PageFieldInfo } from "star-horse-lowcode";
import { i18n } from "@/lang";

export const flexBoxContainerConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: "display",
      label: i18n("system.flexbox.containerConfig.display.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.display.helpMsg"),
      type: "select",
      defaultValue: "flex",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.display.flex"),
            value: "flex",
          },
          {
            name: i18n("system.flexbox.containerConfig.display.block"),
            value: "block",
          },
        ],
      },
    },
    {
      fieldName: "flexDirection",
      label: i18n("system.flexbox.containerConfig.flexDirection.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.flexDirection.helpMsg"),
      type: "select",
      defaultValue: "row",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.flexDirection.row"),
            value: "row",
          },
          {
            name: i18n("system.flexbox.containerConfig.flexDirection.column"),
            value: "column",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.flexDirection.rowReverse",
            ),
            value: "row-reverse",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.flexDirection.columnReverse",
            ),
            value: "column-reverse",
          },
        ],
      },
    },
    {
      fieldName: "flexWrap",
      label: i18n("system.flexbox.containerConfig.flexWrap.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.flexWrap.helpMsg"),
      type: "select",
      defaultValue: "nowrap",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.flexWrap.nowrap"),
            value: "nowrap",
          },
          {
            name: i18n("system.flexbox.containerConfig.flexWrap.wrap"),
            value: "wrap",
          }, // 修正原值错误：flex-wrap改为wrap
          {
            name: i18n("system.flexbox.containerConfig.flexWrap.wrapReverse"),
            value: "wrap-reverse",
          },
        ],
      },
    },
    {
      fieldName: "justifyContent",
      label: i18n("system.flexbox.containerConfig.justifyContent.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.justifyContent.helpMsg"),
      type: "select",
      defaultValue: "start",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.justifyContent.start"),
            value: "start",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.justifyContent.flexStart",
            ),
            value: "flex-start",
          },
          {
            name: i18n("system.flexbox.containerConfig.justifyContent.center"),
            value: "center",
          },
          {
            name: i18n("system.flexbox.containerConfig.justifyContent.flexEnd"),
            value: "flex-end",
          },
          {
            name: i18n("system.flexbox.containerConfig.justifyContent.end"),
            value: "end",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.justifyContent.spaceBetween",
            ),
            value: "space-between",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.justifyContent.spaceAround",
            ),
            value: "space-around",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.justifyContent.spaceEvenly",
            ),
            value: "space-evenly",
          },
        ],
      },
    },
    {
      fieldName: "alignItems",
      label: i18n("system.flexbox.containerConfig.alignItems.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.alignItems.helpMsg"),
      type: "select",
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.alignItems.stretch"),
            value: "stretch",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignItems.center"),
            value: "center",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignItems.end"),
            value: "end",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignItems.baseline"),
            value: "baseline",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignItems.start"),
            value: "start",
          },
        ],
      },
    },
    {
      fieldName: "alignContent",
      label: i18n("system.flexbox.containerConfig.alignContent.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.alignContent.helpMsg"),
      type: "select",
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.containerConfig.alignContent.stretch"),
            value: "stretch",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignContent.start"),
            value: "start",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignContent.center"),
            value: "center",
          },
          {
            name: i18n("system.flexbox.containerConfig.alignContent.end"),
            value: "end",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.alignContent.spaceBetween",
            ),
            value: "space-between",
          },
          {
            name: i18n(
              "system.flexbox.containerConfig.alignContent.spaceAround",
            ),
            value: "space-around",
          },
        ],
      },
    },
    {
      fieldName: "gap",
      label: i18n("system.flexbox.containerConfig.gap.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.containerConfig.gap.helpMsg"),
      type: "input",
      defaultValue: "20px",
      preps: {
        icon: "",
        appendList: [
          {
            name: i18n("system.flexbox.containerConfig.gap.pixel"),
            value: "px",
          },
          {
            name: i18n("system.flexbox.containerConfig.gap.percent"),
            value: "%",
          },
        ],
      },
    },
  ],
};
