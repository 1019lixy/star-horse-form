<script setup lang="ts">
import { ref } from "vue";
import { uuid, itemCheck } from "star-horse-lowcode";
import { dynamicFormContextMenuData } from "@/plugins/AblesPlugin.ts";

const emit = defineEmits<{
  (e: "dragAdd", event: Event, dataList: Array<any>): void;
  (e: "contextMenu", event: MouseEvent): void;
  (e: "update:formData", value: any): void;
}>();

const props = defineProps<{
  list: any[];
  formData: any;
  formInfo: any;
  isDragging: boolean;
  currentPageClass: string;
}>();

const onDragAdd = (evt: Event, dataList: Array<any>) => {
  emit("dragAdd", evt, dataList);
};

const contextMenu = (evt: MouseEvent) => {
  emit("contextMenu", evt);
};

const dynamicFormRef = ref();
const contentMenuRef = ref();
</script>

<template>
  <sh-form
    ref="dynamicFormRef"
    :needScroller="false"
    class="design-form-container"
    :class="{ 'dragging-area': isDragging }"
    :disabled="formInfo['disabled'] == 'Y'"
    :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'Y'"
    :inline="formInfo.inline == 'Y'"
    :inline-message="formInfo['inlineMessage'] == 'Y'"
    :label-position="formInfo['labelPosition']"
    :label-suffix="formInfo['labelSuffix']"
    :label-width="formInfo['labelWidth']"
    :dataForm="formData"
    @update:dataForm="$emit('update:formData', $event)"
    :require-asterisk-position="formInfo['requireAsteriskPosition']"
    :rules="formInfo.rules || {}"
    :scroll-to-error="formInfo['scrollToError'] == 'Y'"
    :show-message="formInfo['showMessage'] == 'Y'"
    :size="'default'"
    :status-icon="formInfo['statusIcon'] == 'Y'"
    :validate-on-rule-change="formInfo['validateOnRuleChange'] == 'Y'"
    style="width: 100% !important"
  >
    <template v-if="list.length === 0">
      <div class="empty-info">
        请从左侧组件库中选择一个组件,
        然后用鼠标双击或者拖动该组件放置于此处
      </div>
    </template>
    <div
      :class="currentPageClass"
      style=""
      @contextmenu="contextMenu"
    >
      <draggable
        @add="(evt: Event) => onDragAdd(evt, list)"
        style="scrollbar-width: thin"
        tag="div"
        class="h-full w-full "
        group="starHorseGroup"
        ghost-class="ghost"
        :list="list"
        :itemKey="uuid()"
      >
        <template #item="{ element: data, index }">
          <div
            :class="{ 'comp-item': data.preps?.headerFlag == 'Y' }"
            class="overflow-visible"
            :data-field-id="data.id"
            :key="data.id"
          >
            <component
              :key="data.id"
              :field="data"
              :isDesign="true"
              :formInfo="formInfo"
              :showFormItem="true"
              :index-of-parent-list="index"
              :is="itemCheck(data)"
              :formData="formData"
              @update:formData="$emit('update:formData', $event)"
            />
          </div>
        </template>
      </draggable>
    </div>
  </sh-form>
  <Teleport to="body">
    <ContentMenu
      ref="contentMenuRef"
      :menu-data="dynamicFormContextMenuData({}, {})"
    />
  </Teleport>
</template>
<style lang="scss" scoped> 
.empty-info {
  position: absolute;
  left: 0;
  right: 0;
  top: 30px;
  bottom: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  color: #999999;
}
</style>