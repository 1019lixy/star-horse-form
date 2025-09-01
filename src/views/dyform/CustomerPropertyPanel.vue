<script setup lang="ts" name="CustomerPropertyPanel">
import {computed, nextTick, onMounted, ref, unref} from "vue";
import {formFieldMapping, isJson, PageFieldInfo, piniaInstance, useDesignFormStore} from "star-horse-lowcode";
import {loadSvgIcons} from "@/api/star_horse_utils.js";
import {useDialogManager} from "@/views/dyform/composables/useDialogManager.js";
import ButtonEventDialog from "@/views/dyform/dialogs/ButtonEventDialog.vue";
import JsEditorDialog from "@/views/dyform/dialogs/JsEditorDialog.vue";
import ParamsDialog from "@/views/dyform/dialogs/ParamsDialog.vue";

defineProps({
  compSize: {type: String, default: "default"},
});
let designForm = useDesignFormStore(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let currentItemType = computed(() => designForm.currentItemType);
let currentCompCategory = computed(() => designForm.currentCompCategory);
let list = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
const formProps = computed(() => designForm.currentFormPreps);
const {dialogStates, openDialog, closeAllDialogs} = useDialogManager();
let currentField = ref<any>({});
let fieldName = ref<string>("");
const jsButtonClick = (data: any, actionName: string) => {
  openDialog("jsEditor");
  if (!Object.keys(formProps.value).includes(actionName)) {
    data[actionName] = "";
  }
  fieldName.value = actionName;
};
let formFields = ref<PageFieldInfo>({
  fieldList: [],
});
let rules: any = {};

const configParams = async (params: any) => {
  openDialog("paramsDialog");
  fieldName.value = params;
  await nextTick();
  // Params dialog will handle its own form data setting
};
/**
 * 根据属性类别获取对应参数

 */
const assignPrep = () => {
  nextTick(() => {
    let formDatas = unref(formDataList);
    let selfFormDatas = unref(selfFormDataList);
    let containers = unref(containerList);
    let isContainer = currentCompCategory.value == "container";
    if (isContainer) {
      for (let key in containers) {
        let temp = containers[key];
        if (temp.itemType == currentItemType.value) {
          assignValue(temp);
          return temp;
        }
      }
    }

    for (let key in formDatas) {
      let temp = formDatas[key];
      if (temp.itemType == currentItemType.value) {
        assignValue(temp);
        return temp;
      }
    }
    for (let key in selfFormDatas) {
      let temp = selfFormDatas[key];
      if (temp.itemType == currentItemType.value) {
        assignValue(temp);
        return temp;
      }
    }
  });
};

const convertFormFieldData = (items: any, type: string) => {
  items.forEach((item: any) => {
    item["formVisible"] = true;
    item["type"] = item["fieldType"];
    if (!item.preps) {
      item.preps = {};
    }
    //增加Help
    item["helpMsg"] = `${item["remark"] ?? ""}`;
    if (item["selectValues"] && isJson(item["selectValues"])) {
      item.preps["values"] = [];
      let datas = JSON.parse(item.selectValues?.replace(/'/g, '"'));
      for (let i in datas) {
        let data: any = datas[i];
        item.preps["values"].push({
          name: data.name || data,
          value: data.value || data,
        });
      }
    }
    if (item["type"] == "button") {
      switch (type) {
        case "base":
          item["actions"] = {};
          break;
        case "other":
          item["actions"] = {};
          break;
        default:
          item["actions"] = {
            click: (data: any) => jsButtonClick(data, item.actionName),
          };
      }
    } else if (item["type"] == "config") {
      item["type"] = "button";
      item["label"] = "参数配置";
      item["actions"] = (_data: any) => configParams(item.actionName);
    } else if (item["type"] == "icon") {
      item.preps["iconType"] = "user";
      item.preps["values"] = loadSvgIcons();
    }
  });
};
const btnClickOpen = () => {
  openDialog("buttonEventDialog");
};


const assignValue = (fieldInfo: any) => {
      try {
        let temp = JSON.parse(JSON.stringify(fieldInfo));
        currentField.value = temp;
        convertFormFieldData(temp.fields, "base");
        convertFormFieldData(temp.advancedFields, "other");
        convertFormFieldData(temp.actions, "action");
        //如果是组件动态增加公共属性，公共属性不应该维护在数据库
        //如果是select,checkbox,radio 等，增加联动属性

        if (currentItemType.value == "button") {
          temp.fields.splice(5, 0, {
            label: "配置点击事件",
            fieldName: "cfgClickEvent",
            type: "button",
            formVisible: true,
            actions: {click: (_data: any) => btnClickOpen()},
          });
        }
        formFields.value.fieldList = [
          {
            fieldName: "base",
            collapseList: [
              {
                title: "基础属性",
                icon: "base_preps",
                tabName: "base",
                fieldList: temp.fields,
              },
              {
                title: "其它属性",
                tabName: "other",
                icon: "advance_preps",
                preps: {
                  labelPosition: "top",
                  labelWidth: "120px",
                },
                fieldList: temp.advancedFields,
              },
              {
                title: "自定义事件",
                tabName: "action",
                icon: "event-action",
                preps: {
                  labelPosition: "top",
                  labelWidth: "120px",
                },
                fieldList: temp.actions,
              },
            ],
          },
        ];
        let defaultValues: any = formFieldMapping(formFields.value).defaultDatas;
        for (let key in defaultValues) {
          if (!Object.keys(formProps.value).includes(key)) {
            formProps.value[key] = defaultValues[key];
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
;
// Dialog event handlers
const handleDialogMerge = () => {
  closeAllDialogs();
};

const handleDialogClose = () => {
  closeAllDialogs();
};
const init = () => {
};
onMounted(() => {
  init();
});
defineExpose({
  assignPrep,
});
</script>
<template>
  <!-- Button Event Dialog -->
  <ButtonEventDialog
      :visible="dialogStates.buttonEventDialog"
      :formProps="formProps"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
  />


  <!-- Params Dialog -->
  <ParamsDialog
      :visible="dialogStates.paramsDialog"
      :formProps="formProps"
      :formInfo="formInfo"
      :fieldName="fieldName"
      :currentField="currentField"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
  />


  <!-- JS Editor Dialog -->
  <JsEditorDialog
      :visible="dialogStates.jsEditor"
      :formProps="formProps"
      :fieldName="fieldName"
      :currentField="currentField"
      :list="list"
      @close="handleDialogClose"
  />
  <el-scrollbar>
    <star-horse-form-item
        :fieldList="formFields"
        :rules="rules"
        :compSize="compSize"
        v-model:dataForm="formProps"
    />
  </el-scrollbar>
</template>
<style lang="scss" scoped></style>
