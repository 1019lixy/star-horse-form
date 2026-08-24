import { defineStore } from "pinia";
import { ref } from "vue";
import { ModuleEnums } from "@/components/enums/ModuleEnums";
import { message } from "star-horse-lowcode";
import { i18n } from "@/lang";

export const useCopyerOperationStore = defineStore("copyerOperation", () => {
  const action = ref<string>("");
  const module = ref<ModuleEnums>();
  const parentContainer = ref<any>({});
  const copyerData = ref<any>({});

  const keyboardOperation = (
    act: string,
    m: ModuleEnums,
    container: any,
    data: any,
  ) => {
    operation(act, container, data);
    module.value = m;
  };
  const operation = (act: string, container: any, data: any) => {
    action.value = act;
    parentContainer.value = container;
    copyerData.value = data;
    if (act == "copy") {
      message(i18n("common.copySuccess"));
    } else if (act == "cut") {
      message(i18n("common.cutSuccess"));
    }
  };
  const setAction = (act: string) => {
    action.value = act;
  };
  const setParentContainer = (container: any) => {
    parentContainer.value = container;
  };
  const setCopyerData = (data: any) => {
    copyerData.value = data;
  };
  const clearAll = () => {
    action.value = "";
    parentContainer.value = {};
    copyerData.value = {};
  };

  return {
    action,
    parentContainer,
    copyerData,
    keyboardOperation,
    operation,
    setAction,
    setParentContainer,
    setCopyerData,
    clearAll,
  };
});
