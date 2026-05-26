<script setup lang="ts" name="CustomerPropertyPanel">
import {computed, nextTick, onMounted, PropType, ref, unref, watch,} from "vue";
import {i18n} from "@/lang";
import {formFieldMapping, getDesignFormStore, isJson, PageFieldInfo,} from "star-horse-lowcode";
import {loadSvgIcons} from "@/api/star_horse_form_utils.js";
import {useDialogManager} from "@/components/system/items/form/composables/useDialogManager.js";
import ButtonEventDialog from "@/components/system/items/form/dialogs/ButtonEventDialog.vue";
import JsEditorDialog from "@/components/system/items/form/dialogs/JsEditorDialog.vue";
import ParamsDialog from "@/components/system/items/form/dialogs/ParamsDialog.vue";
import PreOrPendDialog from "@/components/system/items/form/dialogs/PreOrPendDialog.vue";
import {FormConfig} from "@/components/types";
import {deepClone} from "@/api/system.js";
import UserDefinePrepsDialog from "@/components/system/items/form/dialogs/UserDefinePrepsDialog.vue";
import {OtherPreps, otherPreps} from "@/components/system/items/form/composables/otherPreps";
import FieldLayerDrawer from "@/components/system/items/form/dialogs/FieldLayerDrawer.vue";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
});
let designForm = getDesignFormStore();
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let currentItemType = computed(() => {
  let comp = designForm.currentComp;
  comp.type = comp.itemType;
  return comp.itemType;
});
let compSize = computed(() => props.optional?.compSize ?? "default");
let currentCompCategory = computed(() => designForm.currentCompCategory);
let currentItemId = computed(() => designForm.currentItemId);
let list = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
const formProps = computed(() => designForm.currentFormPreps);
const {dialogStates, openDialog, closeAllDialogs} = useDialogManager();
let currentField = ref<any>({});
let fieldName = ref<string>("");
let activeNames = ref<string[]>(["base"]);
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
const configParams = async (params: any) => {
  openDialog("paramsDialog");
  fieldName.value = params;
};
const otherDefaultValues = () => {
  for (let key in otherPreps) {
    const item = otherPreps[key];
    if (!Object.keys(formProps.value).includes(item.fieldName) && Object.keys(item).includes("defaultValues")) {
      formProps.value[item.fieldName] = item["defaultValues"];
    }
  }
}
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
    if (item["selectValues"] && (isJson(item["selectValues"]) || Array.isArray(item["selectValues"]))) {
      item.preps["values"] = [];
      let datas = item.selectValues;
      if (typeof datas == "string") {
        datas = JSON.parse(item.selectValues?.replace(/'/g, '"'));
      }
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
          item["actions"] = item["actions"] ?? {};
          break;
        case "other":
          item["actions"] = item["actions"] ?? {};
          break;
        default:
          item["actions"] = {
            click: (data: any) => jsButtonClick(data, item.actionName),
          };
      }
    } else if (item["type"] == "config") {
      item["type"] = "button";
      item["label"] = i18n("dyform.extend.347");
      item["actions"] = {
        click: (_data: any) => configParams(item.actionName),
      };
    } else if (item["type"] == "icon") {
      item.preps["iconType"] = "user";
      item.preps["values"] = loadSvgIcons();
    }
  });
};
const btnClickOpen = () => {
  openDialog("buttonEventDialog");
};
const recordPreps = ref<Record<string, any>>({});
const basePreps = ref<Array<any>>([]);
const actionPreps = ref<Array<any>>([]);
const assignValue = (fieldInfo: any) => {
  try {
    basePreps.value = [];
    actionPreps.value = [];
    otherDefaultValues();
    if (recordPreps.value[fieldInfo.itemType]) {
      basePreps.value = recordPreps.value[fieldInfo.itemType].basePreps;
      actionPreps.value = recordPreps.value[fieldInfo.itemType].actionPreps;
      return;
    }
    // basePreps.value = [];
    // actionPreps.value = [];
    //let temp = JSON.parse(JSON.stringify(fieldInfo));
    let temp = deepClone(fieldInfo);
    currentField.value = temp;
    convertFormFieldData(temp.fields, "base");
    convertFormFieldData(temp.advancedFields, "other");
    convertFormFieldData(temp.actions, "action");
    //如果是组件动态增加公共属性，公共属性不应该维护在数据库
    //如果是select,checkbox,radio 等，增加联动属性

    if (currentItemType.value == "button") {
      temp.fields.splice(5, 0, {
        label: i18n("dyform.custProp.402"),
        fieldName: "cfgClickEvent",
        type: "button",
        formVisible: true,
        actions: {click: (_data: any) => btnClickOpen()},
      });
    }
    recordPreps.value[temp.itemType] = {
      basePreps: [...temp.fields, ...temp.advancedFields],
      actionPreps: temp.actions,
    };
    basePreps.value = recordPreps.value[fieldInfo.itemType].basePreps;
    actionPreps.value = recordPreps.value[fieldInfo.itemType].actionPreps;
    let defaultValues: any = formFieldMapping(formFields.value).defaultDatas;
    for (let key in defaultValues) {
      if (!Object.keys(formProps.value).includes(key)) {
        formProps.value[key] = defaultValues[key];
      }
    }


  } catch (e) {
    console.log(e);
  }
};
// Dialog event handlers
const handleDialogMerge = () => {
  closeAllDialogs();
};

const handleDialogClose = () => {
  closeAllDialogs();
};
const init = () => {
  recordPreps.value = {};
};
const prependOrAppend = () => {
  openDialog("preOrPendDialog");
};
const configPreps = () => {
  // userDefinePreps.value = formProps.value;
  openDialog("userDefinePrepsDialog");
};
const checkMatchComp = (item: OtherPreps) => {
  if (item.matchComp) {
    return item.matchComp.includes(currentItemType.value);
  }
  return true;
}
const dataBind = (data: any) => {
  if (!formProps.value["labelFor"]) {
    formProps.value["labelFor"] = [];
  }
  const labelFor = formProps.value["labelFor"];
  if (!labelFor.includes(data.value)) {
    labelFor.push(data.value);
  } else {
    formProps.value["labelFor"] = labelFor.filter(item => item !== data.value);
  }
}
onMounted(() => {
  init();
});
defineExpose({
  assignPrep,
});
watch(
    () => [currentItemId.value, currentItemType.value],
    () => {
      if (!currentItemId.value && !currentItemType.value) {
        assignPrep();
      }
    },
    {
      immediate: true,
    },
);
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

  <UserDefinePrepsDialog
      :visible="dialogStates.userDefinePrepsDialog"
      :formProps="formProps"
      :formInfo="formInfo"
      :fieldName="fieldName"
      :currentField="currentField"
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
  <PreOrPendDialog
      :visible="dialogStates.preOrPendDialog"
      :formProps="formProps"
      :formInfo="formInfo"
      :fieldName="fieldName"
      :currentField="currentField"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
  />
  <FieldLayerDrawer v-model:visible="dialogStates.bindFieldVisible"
                    @dataBind="dataBind"
                    operType="bind"/>
  <el-scrollbar>
    <el-collapse v-model="activeNames">
      <el-collapse-item name="base">
        <template #title="{ isActive }">
          <div :class="['title-wrapper', { 'is-active': isActive }]">
            <star-horse-icon iconClass="base_preps"/>
            <span>{{ i18n('dyform.custProp.compProps') }}</span>
          </div>
        </template>
        <el-form-item
            :label="i18n('dyform.custProp.403')"
            prop="cfg"
            v-if="
            [
              'input',
              'autocomplete',
              'password',
              'number',
              'number-range',
            ].includes(currentItemType)
          "
            :size="compSize"
        >
          <el-button @click="prependOrAppend" icon="setting"> {{ i18n('dyform.custProp.config') }}</el-button>
        </el-form-item>
        <template v-for="item in basePreps">
          <el-form-item
              :label="item.label"
              :prop="item.fieldName"
              :size="compSize"
              :label-position="
              item.type == 'switch' || item.type == 'button' ? 'left' : 'top'
            "
          >
            <el-button
                v-if="item.type == 'button'"
                type="primary"
                plain
                @click="item.actions?.click?.(formProps)"
                icon="Setting"
            >
              {{ i18n('dyform.custProp.config') }}
            </el-button>
            <component
                v-else
                :is="item.type + '-item'"
                v-model:formData="formProps"
                :field="{
                fieldName: item.fieldName,
                preps: item.preps,
              }"
            />
          </el-form-item>
        </template>
        <el-form-item
            :label="i18n('dyform.custProp.404')"
            prop="userDefinePreps"
            :size="compSize"
        >
          <el-button type="primary" plain @click="configPreps" icon="Setting">
            {{ i18n('dyform.custProp.config') }}
          </el-button>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item name="other">
        <template #title="{ isActive }">
          <div :class="['title-wrapper', { 'is-active': isActive }]">
            <star-horse-icon iconClass="other"/>
            <span>{{ i18n('dyform.custProp.otherConfig') }}</span>
          </div>
        </template>
        <template v-for="item in otherPreps">
          <el-form-item
              :label="item.label"
              :prop="item.fieldName"
              :size="compSize"
              v-if="checkMatchComp(item)"
              :label-position="
              item.fieldType == 'switch' || item.fieldType == 'button' ? 'left' : 'top'
            "
          >
            <div class="flex flex-col " v-if="item.fieldType == 'button'">
              <div class="flex gap-3 justify-start items-center w-full">
                <help v-if="item.helpMsg" :message="item.helpMsg"/>
                <el-button
                    type="primary"
                    plain
                    @click="item.actions?.click?.(dialogStates,formProps)"
                    icon="Setting"
                >
                  {{ i18n('dyform.custProp.config') }}
                </el-button>
              </div>
              <div class="my-3">
                <component
                    :is="'input-tag-item'"
                    v-model:formData="formProps"
                    :field="{
                fieldName: item.fieldName,
                preps: item.preps,
              }"
                />
              </div>
            </div>
            <template v-else>
              <help v-if="item.helpMsg" :message="item.helpMsg"/>
              <component
                  :is="item.fieldType + '-item'"
                  v-model:formData="formProps"
                  :field="{
                fieldName: item.fieldName,
                preps: item.preps,
              }"
              />
            </template>

          </el-form-item>
        </template>
      </el-collapse-item>
      <el-collapse-item name="action">
        <template #title="{ isActive }">
          <div :class="['title-wrapper', { 'is-active': isActive }]">
            <star-horse-icon iconClass="event-action"/>
            <span>{{ i18n('dyform.custProp.customEvent') }}</span>
          </div>
        </template>
        <template v-for="item in actionPreps">
          <el-form-item
              :label="item.label"
              :prop="item.name"
              :size="compSize"
              label-position="top"
          >
            <el-button
                type="primary"
                plain
                @click="item.actions.click()"
                icon="Setting"
            >{{ i18n('dyform.custProp.config') }}
            </el-button>
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </el-scrollbar>
</template>
<style lang="scss" scoped>
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title-wrapper.is-active {
  color: var(--el-color-primary);
}
</style>
