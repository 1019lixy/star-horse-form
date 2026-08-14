<script setup lang="ts" name="drawer-container">
import {onMounted, PropType, ref} from "vue";
import {getDesignFormStore, itemCheck} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  isDesign: {type: Boolean, default: false},
  showFormItem: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  formInfo: {type: Object as PropType<any>},
  field: {type: Object as PropType<any>},
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
let containerType: Array<string> = [
  "tab", "box", "table", "card", "dytable", "collapse", "splitter", "step", "condition",
  "dialog", "drawer", "fieldset", "descriptions", "anchor",
];
const isContainer = (data: any) => containerType.includes(data.itemType);
const drawerVisible = ref(false);
const tempFormData = ref<any>({});

const onDragAdd = (evt: Event | any, dataList: any) => {
  let newIndex = evt.newIndex;
  if (newIndex != null && newIndex != "undefined") {
    let dataInfo = dataList[newIndex];
    designForm.selectItem(dataInfo, dataInfo.itemType, "");
  }
};

const checkItem = (adata: any) => {
  if (!adata["items"]) adata["items"] = [];
};

const handleOpen = () => {
  tempFormData.value = JSON.parse(JSON.stringify(formData.value || {}));
  drawerVisible.value = true;
};

const handleClose = () => {
  const closeAction = props.field?.preps?.closeAction || "keep";
  if (closeAction === "clear") {
    drawerVisible.value = false;
  } else if (closeAction === "keep") {
    if (formData.value && tempFormData.value) {
      Object.keys(tempFormData.value).forEach(key => {
        formData.value[key] = tempFormData.value[key];
      });
    }
    drawerVisible.value = false;
  } else {
    drawerVisible.value = false;
  }
};

onMounted(() => {
  if (!props.field["preps"]) props.field["preps"] = {};
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {label: "Drawer", subTablePrimaryKey: "drawer", subTableName: "drawer", subFormFlag: "Y", items: []},
    ];
  }
});
</script>

<template>
  <group-container
      class="star-horse-form-container"
      :showFormItem="showFormItem"
      :isDesign="isDesign"
      :disabled="disabled"
      :parentField="parentField"
      :form-item="field"
  >
    <!-- 触发按钮 -->
    <div class="dialog-trigger" :class="{ 'design-mode': isDesign }">
      <el-button
          :type="field.preps['btnType'] || 'primary'"
          :icon="field.preps['btnIcon'] || undefined"
          @click="handleOpen"
          :disabled="disabled"
      >
        {{ field.preps['btnText'] || i18n('dyform.container.drawerDefaultBtn') }}
      </el-button>
    </div>

    <!-- 设计模式: 内嵌拖拽区域 -->
    <div v-if="isDesign" class="drawer-design-area">
      <div class="design-area-title">
        <star-horse-icon icon-class="component" size="14px"/>
        <span>{{ i18n('dyform.container.innerFields') }}</span>
      </div>
      <draggable
          v-for="adata in field['preps']['elements']"
          :key="adata.subTablePrimaryKey"
          @add="(evt: Event) => onDragAdd(evt, adata['items'])"
          @dragover="checkItem(adata)"
          class="drawer-design"
          :class="{ 'dragging-area': designForm.isDragging }"
          group="starHorseGroup"
          animation="100"
          item-key="id"
          ghostClass="ghost"
          v-model="adata['items']"
      >
        <template #item="{ element: item }">
          <div class="comp-item" :data-field-id="item.id">
            <component
                :key="item.id"
                :field="item"
                :isDesign="isDesign"
                :disabled="disabled"
                :showFormItem="showFormItem"
                :formInfo="formInfo"
                :is="itemCheck(item)"
                :parentField="field"
                v-model:formData="formData"
            />
          </div>
        </template>
      </draggable>
      <div v-if="isDesign" class="quick-add-bar">
        <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items)" icon="Plus">
          {{ i18n("dyform.condition.addLeaf") }}
        </el-button>
      </div>
    </div>

    <!-- 抽屉(设计模式和运行模式都可以打开) -->
    <star-horse-panel
        type="drawer"
        v-model="drawerVisible"
        :title="field.preps['drawerTitle'] || field.preps['btnText'] || i18n('dyform.container.drawerDefaultBtn')"
        :direction="field.preps['direction'] || 'rtl'"
        :size="field.preps['drawerSize'] || '40%'"
        :selfFunc="true"
        :modal="field.preps['modal'] !== undefined ? field.preps['modal'] : true"
        :close-on-click-modal="field.preps['closeOnClickModal'] !== undefined ? field.preps['closeOnClickModal'] : true"
        :close-on-press-escape="field.preps['closeOnPressEscape'] !== undefined ? field.preps['closeOnPressEscape'] : true"
        :show-close="field.preps['showClose'] !== undefined ? field.preps['showClose'] : true"
        :with-header="field.preps['withHeader'] !== undefined ? field.preps['withHeader'] : true"
        @merge="handleClose"
        @close="handleClose"
    >
      <div class="drawer-content">
        <template v-for="adata in field['preps']['elements']" :key="adata.subTablePrimaryKey">
          <draggable
              v-if="isDesign"
              @add="(evt: Event) => onDragAdd(evt, adata['items'])"
              @dragover="checkItem(adata)"
              class="drawer-inner-design"
              :class="{ 'dragging-area': designForm.isDragging }"
              group="starHorseGroup"
              animation="100"
              item-key="id"
              ghostClass="ghost"
              v-model="adata['items']"
          >
            <template #item="{ element: item }">
              <div class="comp-item" :data-field-id="item.id">
                <component
                    :key="item.id"
                    :field="item"
                    :isDesign="isDesign"
                    :disabled="disabled"
                    :showFormItem="showFormItem"
                    :formInfo="formInfo"
                    :is="itemCheck(item)"
                    :parentField="field"
                    v-model:formData="formData"
                />
              </div>
            </template>
          </draggable>
          <template v-else>
            <component
                v-for="item in adata['items']"
                :key="item.id"
                :field="item"
                :isDesign="false"
                :disabled="disabled"
                :showFormItem="showFormItem"
                :formInfo="formInfo"
                :is="itemCheck(item)"
                :parentField="field"
                v-model:formData="formData"
            />
          </template>
        </template>
        <div v-if="isDesign" class="quick-add-bar">
          <el-button size="small" type="info" plain @click.stop="quickAddItem(field.preps.elements[0].items)"
                     icon="Plus">
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </star-horse-panel>
  </group-container>
</template>

<style lang="scss" scoped>
.drawer-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  &.design-mode {
    padding: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #fafbfc 100%);
    border: 1px dashed #d0e8b8;
    border-radius: 6px;
  }
}

.drawer-design-area {
  margin-top: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.design-area-title {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f5f7fa;
  font-size: 12px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.drawer-design {
  min-height: 60px;
  padding: 8px;
}

.drawer-inner-design {
  min-height: 60px;
  padding: 4px;
}

.dragging-area {
  background: #f0f9eb;
  outline: 2px dashed #67c23a;
  outline-offset: -2px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border-top: 1px dashed #d0e8b8;

  &:hover {
    background: #f0f9eb;
  }
}

.drawer-content {
  padding: 0 4px;
}
</style>
