import { PageFieldInfo } from "star-horse-lowcode";
import { i18n } from "@/lang";

export const flexBoxItemsConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: "order",
      label: i18n("system.flexbox.itemsConfig.order.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.order.helpMsg"),
      type: "number",
      defaultValue: "",
      preps: {
        icon: "",
      },
    },
    {
      fieldName: "flexGrow",
      label: i18n("system.flexbox.itemsConfig.flexGrow.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.flexGrow.helpMsg"),
      preps: {
        icon: "",
      },
      type: "number",
      defaultValue: "",
    },
    {
      fieldName: "flexShrink",
      label: i18n("system.flexbox.itemsConfig.flexShrink.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.flexShrink.helpMsg"),
      preps: {
        icon: "",
      },
      type: "number",
      defaultValue: "1",
    },
    {
      fieldName: "flexBasis",
      label: i18n("system.flexbox.itemsConfig.flexBasis.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.flexBasis.helpMsg"),
      preps: {
        icon: "",
        appendList: [
          {
            name: i18n("system.flexbox.itemsConfig.flexBasis.auto"),
            value: "auto",
          },
          {
            name: i18n("system.flexbox.itemsConfig.flexBasis.pixel"),
            value: "px",
          },
          {
            name: i18n("system.flexbox.itemsConfig.flexBasis.percent"),
            value: "%",
          },
        ],
      },
      type: "input",
      defaultValue: "auto",
    },
    {
      fieldName: "alignSelf",
      label: i18n("system.flexbox.itemsConfig.alignSelf.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.alignSelf.helpMsg"),
      type: "select",
      defaultValue: "auto",
      preps: {
        icon: "",
        values: [
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.auto"),
            value: "auto",
          },
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.flexStart"),
            value: "flex-start",
          },
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.flexEnd"),
            value: "flex-end",
          },
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.center"),
            value: "center",
          },
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.baseline"),
            value: "baseline",
          },
          {
            name: i18n("system.flexbox.itemsConfig.alignSelf.stretch"),
            value: "stretch",
          },
        ],
      },
    },
    {
      fieldName: "width",
      label: i18n("system.flexbox.itemsConfig.width.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.width.helpMsg"),
      type: "input",
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          {
            name: i18n("system.flexbox.itemsConfig.width.auto"),
            value: "auto",
          },
          { name: i18n("system.flexbox.itemsConfig.width.pixel"), value: "px" },
          {
            name: i18n("system.flexbox.itemsConfig.width.percent"),
            value: "%",
          },
        ],
      },
    },
    {
      fieldName: "height",
      label: i18n("system.flexbox.itemsConfig.height.label"),
      formVisible: true,
      helpMsg: i18n("system.flexbox.itemsConfig.height.helpMsg"),
      type: "input",
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          {
            name: i18n("system.flexbox.itemsConfig.height.auto"),
            value: "auto",
          },
          {
            name: i18n("system.flexbox.itemsConfig.height.pixel"),
            value: "px",
          },
          {
            name: i18n("system.flexbox.itemsConfig.height.percent"),
            value: "%",
          },
        ],
      },
    },
  ],
};
