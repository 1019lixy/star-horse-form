import { PageFieldInfo } from "star-horse-lowcode";
import { i18n } from "@/lang";
import {unitList} from "@/utils/sh_design.js";

export const gridItemsConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: "gridColumn",
      label: i18n("system.grid.itemsConfig.gridColumn.label"),
      helpMsg: i18n("system.grid.itemsConfig.gridColumn.helpMsg"),
      type: "number-range",
      formVisible: true,
      defaultValue: "0 / 0",
      preps: {
        icon: "",
        maxName: "gridColumnEnd",
        minName: "gridColumnStart",
        splitName: "/",
      },
    },
    {
      fieldName: "gridRow",
      label: i18n("system.grid.itemsConfig.gridRow.label"),
      helpMsg: i18n("system.grid.itemsConfig.gridRow.helpMsg"),
      type: "number-range",
      formVisible: true,
      defaultValue: "0 / 0",
      preps: {
        icon: "",
        maxName: "gridRowEnd",
        minName: "gridRowStart",
        splitName: "/",
      },
    },
    {
      fieldName: "justifySelf",
      label: i18n("system.grid.itemsConfig.justifySelf.label"),
      helpMsg: i18n("system.grid.itemsConfig.justifySelf.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.itemsConfig.stretch"), value: "stretch" },
          { name: i18n("system.grid.itemsConfig.start"), value: "start" },
          { name: i18n("system.grid.itemsConfig.center"), value: "center" },
          { name: i18n("system.grid.itemsConfig.end"), value: "end" },
        ],
      },
    },
    {
      fieldName: "alignSelf",
      label: i18n("system.grid.itemsConfig.alignSelf.label"),
      helpMsg: i18n("system.grid.itemsConfig.alignSelf.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.itemsConfig.stretch"), value: "stretch" },
          { name: i18n("system.grid.itemsConfig.start"), value: "start" },
          { name: i18n("system.grid.itemsConfig.center"), value: "center" },
          { name: i18n("system.grid.itemsConfig.end"), value: "end" },
        ],
      },
    },
    {
      fieldName: "width",
      label: i18n("system.grid.itemsConfig.width.label"),
      helpMsg: i18n("system.grid.itemsConfig.width.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: unitList,
      },
    },
    {
      fieldName: "height",
      label: i18n("system.grid.itemsConfig.height.label"),
      helpMsg: i18n("system.grid.itemsConfig.height.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: unitList,
      },
    },
  ],
};
