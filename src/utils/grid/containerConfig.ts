import { PageFieldInfo } from "star-horse-lowcode";
import { i18n } from "@/lang";

export const gridContainerConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: "display",
      label: i18n("system.grid.containerConfig.display.label"),
      helpMsg: i18n("system.grid.containerConfig.display.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "grid",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.display.grid"), value: "grid" },
          { name: i18n("system.grid.containerConfig.display.block"), value: "block" },
        ],
      },
    },
    {
      fieldName: "gridTemplateColumns",
      label: i18n("system.grid.containerConfig.gridTemplateColumns.label"),
      helpMsg: i18n("system.grid.containerConfig.gridTemplateColumns.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "1fr 1fr",
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.fr"), value: "fr" },
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "gridTemplateRows",
      label: i18n("system.grid.containerConfig.gridTemplateRows.label"),
      helpMsg: i18n("system.grid.containerConfig.gridTemplateRows.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "1fr 1fr",
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.fr"), value: "fr" },
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "gap",
      label: i18n("system.grid.containerConfig.gap.label"),
      helpMsg: i18n("system.grid.containerConfig.gap.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "10px 10px",
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "rowGap",
      label: i18n("system.grid.containerConfig.rowGap.label"),
      type: "input",
      formVisible: true,
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "columnGap",
      label: i18n("system.grid.containerConfig.columnGap.label"),
      type: "input",
      formVisible: true,
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },

    {
      fieldName: "justifyItems",
      label: i18n("system.grid.containerConfig.justifyItems.label"),
      helpMsg: i18n("system.grid.containerConfig.justifyItems.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.stretch"), value: "stretch" },
          { name: i18n("system.grid.containerConfig.start"), value: "start" },
          { name: i18n("system.grid.containerConfig.center"), value: "center" },
          { name: i18n("system.grid.containerConfig.end"), value: "end" },
        ],
      },
    },
    {
      fieldName: "alignItems",
      label: i18n("system.grid.containerConfig.alignItems.label"),
      helpMsg: i18n("system.grid.containerConfig.alignItems.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.stretch"), value: "stretch" },
          { name: i18n("system.grid.containerConfig.start"), value: "start" },
          { name: i18n("system.grid.containerConfig.center"), value: "center" },
          { name: i18n("system.grid.containerConfig.end"), value: "end" },
        ],
      },
    },
    {
      fieldName: "justifyContent",
      label: i18n("system.grid.containerConfig.justifyContent.label"),
      helpMsg: i18n("system.grid.containerConfig.justifyContent.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "start",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.start"), value: "start" },
          { name: i18n("system.grid.containerConfig.center"), value: "center" },
          { name: i18n("system.grid.containerConfig.end"), value: "end" },
          { name: i18n("system.grid.containerConfig.spaceAround"), value: "space-around" },
          { name: i18n("system.grid.containerConfig.spaceBetween"), value: "space-between" },
          { name: i18n("system.grid.containerConfig.spaceEvenly"), value: "space-evenly" },
        ],
      },
    },
    {
      fieldName: "alignContent",
      label: i18n("system.grid.containerConfig.alignContent.label"),
      helpMsg: i18n("system.grid.containerConfig.alignContent.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "start",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.start"), value: "start" },
          { name: i18n("system.grid.containerConfig.center"), value: "center" },
          { name: i18n("system.grid.containerConfig.end"), value: "end" },
          { name: i18n("system.grid.containerConfig.spaceAround"), value: "space-around" },
          { name: i18n("system.grid.containerConfig.spaceBetween"), value: "space-between" },
          { name: i18n("system.grid.containerConfig.spaceEvenly"), value: "space-evenly" },
        ],
      },
    },
    {
      fieldName: "gridAutoColumns",
      label: i18n("system.grid.containerConfig.gridAutoColumns.label"),
      helpMsg: i18n("system.grid.containerConfig.gridAutoColumns.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.auto"), value: "auto" },
          { name: i18n("system.grid.containerConfig.fr"), value: "fr" },
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "gridAutoRows",
      label: i18n("system.grid.containerConfig.gridAutoRows.label"),
      helpMsg: i18n("system.grid.containerConfig.gridAutoRows.helpMsg"),
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          { name: i18n("system.grid.containerConfig.auto"), value: "auto" },
          { name: i18n("system.grid.containerConfig.fr"), value: "fr" },
          { name: i18n("system.grid.containerConfig.pixel"), value: "px" },
          { name: i18n("system.grid.containerConfig.percent"), value: "%" },
        ],
      },
    },
    {
      fieldName: "gridAutoFlow",
      label: i18n("system.grid.containerConfig.gridAutoFlow.label"),
      helpMsg: i18n("system.grid.containerConfig.gridAutoFlow.helpMsg"),
      type: "select",
      formVisible: true,
      defaultValue: "row",
      preps: {
        icon: "",
        values: [
          { name: i18n("system.grid.containerConfig.row"), value: "row" },
          { name: i18n("system.grid.containerConfig.column"), value: "column" },
          { name: i18n("system.grid.containerConfig.rowDense"), value: "row dense" },
          { name: i18n("system.grid.containerConfig.columnDense"), value: "column dense" },
        ],
      },
    },
  ],
};