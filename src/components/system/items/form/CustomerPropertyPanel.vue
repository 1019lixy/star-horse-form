<script setup lang="ts" name="CustomerPropertyPanel">
import {computed, defineAsyncComponent, nextTick, onMounted, PropType, provide, ref, unref, watch,} from "vue";
import {i18n} from "@/lang";
import {formFieldMapping, isJson, PageFieldInfo} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {loadSvgIcons} from "@/api/star_horse_form_utils.js";
import {useDialogManager} from "@/components/system/items/form/composables/useDialogManager.js";
import {FormConfig} from "@/components/types";
import {deepClone} from "@/api/system.js";
import {OtherPreps, otherPreps,} from "@/components/system/items/form/composables/otherPreps";
import PropertyDescriptionsItem
  from "@/components/system/items/form/components/PropertyDescriptionsItem.vue";
// 对话框类组件改为异步加载，减小首屏 bundle
const ButtonEventDialog = defineAsyncComponent(
    () => import("@/components/system/items/form/dialogs/ButtonEventDialog.vue"),
);
const JsEditorDialog = defineAsyncComponent(
    () => import("@/components/system/items/form/dialogs/JsEditorDialog.vue"),
);
const ParamsDialog = defineAsyncComponent(
    () => import("@/components/system/items/form/dialogs/ParamsDialog.vue"),
);
const PreOrPendDialog = defineAsyncComponent(
    () => import("@/components/system/items/form/dialogs/PreOrPendDialog.vue"),
);
const UserDefinePrepsDialog = defineAsyncComponent(
    () =>
        import("@/components/system/items/form/components/AllPropsOverviewPanel.vue"),
);
const FieldLayerDrawer = defineAsyncComponent(
    () => import("@/components/system/items/form/dialogs/FieldLayerDrawer.vue"),
);

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
  inDialog: {type: Boolean, default: false},
});
provide("propertyPanelInDialog", computed(() => props.inDialog));
let designForm = getDesignFormStore();
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerDataList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let currentItemType = computed(() => {
  let comp = designForm.currentComp;
  comp.type = comp?.itemType;
  return comp?.itemType ?? "";
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
    if (
        !Object.keys(formProps.value).includes(item.fieldName) &&
        Object.keys(item).includes("defaultValues")
    ) {
      formProps.value[item.fieldName] = item["defaultValues"];
    }
  }
};
/**
 * 将组件定义（CompType）fields/advancedFields 中配置的 defaultValues
 * 写入当前组件 preps。key 已存在（用户已配置/已保存过）则不覆盖。
 */
const applyCompTypeDefaultValues = (items: any) => {
  (items || []).forEach((item: any) => {
    if (
        item?.fieldName &&
        item.defaultValues !== undefined &&
        item.defaultValues !== "" &&
        !Object.keys(formProps.value).includes(item.fieldName)
    ) {
      formProps.value[item.fieldName] = item.defaultValues;
    }
  });
};
/**
 * 根据属性类别获取对应参数

 */
const assignPrep = () => {
  nextTick(() => {
    let formDatas = unref(formDataList);
    let selfFormDatas = unref(selfFormDataList);
    let containers = unref(containerList);

    // 当前实例为"我的组件"时,优先按idCustomComponent精确匹配配置定义,
    // 避免因itemType与同名系统组件相同而误命中系统组件的参数
    const currentComp = designForm.currentComp;
    if (currentComp?.isCustom && currentComp?.idCustomComponent) {
      for (let key in selfFormDatas) {
        let temp: any = selfFormDatas[key];
        if (
          temp.isCustom &&
          temp.idCustomComponent === currentComp.idCustomComponent
        ) {
          assignValue(temp);
          return temp;
        }
      }
    }

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
    if (
        item["selectValues"] &&
        (isJson(item["selectValues"]) || Array.isArray(item["selectValues"]))
    ) {
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
    applyCompTypeDefaultValues(fieldInfo.fields);
    applyCompTypeDefaultValues(fieldInfo.advancedFields);
    // 即使命中缓存也要同步 currentField，避免对话框展示上一次组件的字段信息
    currentField.value = fieldInfo;
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
  handleDialogClose();
};

const handleDialogClose = () => {
  userDefinePrepsVisible.value = false;
  closeAllDialogs();
};
const init = () => {
  recordPreps.value = {};
};
const prependOrAppend = () => {
  openDialog("preOrPendDialog");
};
const userDefinePrepsVisible = ref<boolean>(false);
const configPreps = () => {
  userDefinePrepsVisible.value = true;
};

/**
 * 预过滤的 otherPreps，避免在 v-for 中逐项调用 checkMatchComp
 */
const filteredOtherPreps = computed(() => {
  const type = currentItemType.value;
  return otherPreps.filter((item: OtherPreps) => {
    if (item.matchComp) {
      return item.matchComp.includes(type);
    }
    return true;
  });
});
/**
 * 容器类型时，容器专属属性（fields + advancedFields）统一在
 * ContainerConfigPanel 的"容器属性"tab 管理，此处不重复渲染，
 * 避免与"基础属性"tab 的容器配置不对称、让用户困惑。
 */
const visibleBasePreps = computed(() => {
  if (currentCompCategory.value == "container") return [];
  return basePreps.value;
});
const dataBind = (data: any) => {
  if (!formProps.value["labelFor"]) {
    formProps.value["labelFor"] = [];
  }
  const labelFor = formProps.value["labelFor"];
  if (!labelFor.includes(data.value)) {
    labelFor.push(data.value);
  } else {
    formProps.value["labelFor"] = labelFor.filter(
        (item) => item !== data.value,
    );
  }
};
onMounted(() => {
  init();
});
defineExpose({
  assignPrep,
});
watch(
    () => [currentItemId.value, currentItemType.value],
    () => {
      // 选中组件、切换组件、取消选中均需刷新属性面板，
      // 原先仅在两个字段均为空时刷新，导致首次挂载且已有选中组件时 actionPreps 不更新
      assignPrep();
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

  <star-horse-panel
      v-model="userDefinePrepsVisible"
      :title="i18n('dyform.params.dialog.title')"
      :isBatch="false"
      :userAction="true"
      boxHeight="60%"
      @merge="handleDialogClose"
      @closeAction="handleDialogClose"
  >
    <UserDefinePrepsDialog :formProps="formProps" :compSize="compSize"/>
  </star-horse-panel>

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
      :itemType="currentItemType"
      :model="optional?.model ?? 'full'"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
  />
  <FieldLayerDrawer
      v-model:visible="dialogStates.bindFieldVisible"
      @dataBind="dataBind"
      operType="bind"
  />
  <el-scrollbar>
    <el-collapse v-model="activeNames">
      <el-collapse-item name="base">
        <template #title="{ isActive }">
          <div :class="['title-wrapper', { 'is-active': isActive }]">
            <star-horse-icon iconClass="base_preps"/>
            <span>{{ i18n("dyform.custProp.compProps") }}</span>
          </div>
        </template>
        <div class="props-list" :class="{ 'in-dialog': inDialog }">
        <property-descriptions-item
            :label="i18n('dyform.custProp.403')"
            label-position="left"
            v-if="
            [
              'input',
              'autocomplete',
              'password',
              'number',
              'number-range',
            ].includes(currentItemType)
          "
        >
          <el-button @click="prependOrAppend" icon="setting">
            {{ i18n("dyform.custProp.config") }}
          </el-button
          >
        </property-descriptions-item>
        <template v-for="item in visibleBasePreps" :key="item.fieldName">
          <property-descriptions-item
              :label="item.label"
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
              {{ i18n("dyform.custProp.config") }}
            </el-button>
            <component
                v-else
                :is="item.type + '-item'"
                v-model:formData="formProps"
                :field="{
                fieldName: item.fieldName,
                preps: {
                  ...item.preps,
                  clearable: true,
                  filterable: true,
                },
              }"
            />
          </property-descriptions-item>
        </template>
        <property-descriptions-item
            :label="i18n('dyform.custProp.404')"
            label-position="left"
        >
          <el-button type="primary" plain @click="configPreps" icon="Setting">
            {{ i18n("dyform.custProp.config") }}
          </el-button>
        </property-descriptions-item>
        </div>
      </el-collapse-item>
      <el-collapse-item name="other">
        <template #title="{ isActive }">
          <div :class="['title-wrapper', { 'is-active': isActive }]">
            <star-horse-icon iconClass="other"/>
            <span>{{ i18n("dyform.custProp.otherConfig") }}</span>
          </div>
        </template>
        <div class="props-list" :class="{ 'in-dialog': inDialog }">
        <template v-for="item in filteredOtherPreps" :key="item.fieldName">
          <property-descriptions-item
              :label="item.label"
              :label-position="
              item.fieldType == 'switch' || item.fieldType == 'button' ? 'left' : 'top'
            "
          >
            <div class="flex flex-col" v-if="item.fieldType == 'button'">
              <div class="flex gap-3 justify-start items-center w-full">
                <help v-if="item.helpMsg" :message="item.helpMsg"/>
                <el-button
                    type="primary"
                    plain
                    @click="item.actions?.click?.(dialogStates, formProps)"
                    icon="Setting"
                >
                  {{ i18n("dyform.custProp.config") }}
                </el-button>
              </div>
              <div class="my-3">
                <component
                    :is="'input-tag-item'"
                    v-model:formData="formProps"
                    :field="{
                    fieldName: item.fieldName,
                    preps: {
                      ...item.preps,
                      clearable: true,
                      filterable: true
                    }
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
                  preps: {
                    ...item.preps,
                    clearable: true,
                    filterable: true
                  }
                }"
              />
            </template>
          </property-descriptions-item>
        </template>
        </div>
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

.props-list {
  display: flex;
  flex-direction: column;

  > * + * {
    margin-top: -1px;
  }

  &.in-dialog {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 8px;

    > * + * {
      margin-top: 0;
    }

    > * {
      height: 100%;
    }

    :deep(.el-descriptions__body) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(table) {
      height: 100%;
    }
  }
}
</style>
