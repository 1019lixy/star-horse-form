<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, ref, PropType} from "vue";
import {i18n} from "@/lang";
import {
  dynamicFormContextMenuData,
  getParentComp,
  moveDownItem,
  moveUpItem,
  removeItem,
} from "@/plugins/AblesPlugin";
import {getDesignFormStore} from "@/store/StoreManager";
import FieldList from "@/components/formcomp/utils/FieldList.vue";
import {
  warning,
  isMobile,
} from "star-horse-lowcode";

const props = defineProps({
  field: {type: Object as PropType<any>, required: true},
  parentField: {type: Object as PropType<any>, default: null},
  isDesign: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
});

const designForm = getDesignFormStore();
const isEdit = computed(() => props.isDesign);
const currentItemId = computed(() => designForm.currentItemId);
const itemId = computed(() => props.field?.id || props.field?.preps?.id);
const isDisabled = computed(() => props.disabled);

const editUserInfo = computed(() => {
  const userInfo = designForm.getCurrentCompEditUserInfo(
    props.field?.id || props.field?.preps.id,
  );
  return userInfo ? userInfo.name + i18n("api.editingByOthers") : "";
});

const isContainer = computed(() => props.field?.compType === "container");
const shouldWrap = computed(() => isEdit.value && !isContainer.value && !isDisabled.value);

let componentVisible = computed(() => {
  return designForm.componentVisible && currentItemId.value == itemId.value;
});

let selectDebounceTimer: any = null;
const refreshFlag = ref(0);

const selectData = (data: any) => {
  if (!isEdit.value || isDisabled.value) return;
  if (editUserInfo.value.length > 0) {
    warning(i18n("api.fieldEditingByOthers"));
    return;
  }
  if (currentItemId.value === itemId.value) return;
  if (selectDebounceTimer) clearTimeout(selectDebounceTimer);
  selectDebounceTimer = setTimeout(() => {
    designForm.setParentContainer(props.parentField);
    designForm.selectItem(
      props.field,
      data.itemType,
      getParentComp(props.parentField),
    );
    nextTick(() => { refreshFlag.value++; });
  }, 50);
};

const selectParentContainer = () => {
  if (!isEdit.value || isDisabled.value) return;
  designForm.selectItem(props.parentField, "", "container");
};

const exchangeItem = () => { designForm.setComponentVisible(true); };
const close = () => { designForm.setComponentVisible(false); };
const changeItem = (item: any) => {
  props.field["itemType"] = item["itemType"];
  if (item.category == 2) props.field["compType"] = "container";
  props.field["preps"] = { ...props.field["preps"], itemNameLabel: item.itemName };
  close();
  selectData(props.field);
};

const itemContextMenuRef = ref();
const itemContextMenu = (evt: MouseEvent | any) => {
  if (!isEdit.value || isDisabled.value) return;
  evt.stopPropagation();
  evt.preventDefault();
  evt.props = props;
  itemContextMenuRef.value?.show(evt);
};

onBeforeUnmount(() => {
  if (selectDebounceTimer) { clearTimeout(selectDebounceTimer); selectDebounceTimer = null; }
});
</script>

<template>
  <star-horse-panel
    :type="dialogType"
    v-if="isDesign"
    box-width="450px"
    box-height="70%"
    :source="3"
    :full-screen="false"
    :title="i18n('form.changeComponent')"
    :self-func="true"
    v-model="componentVisible"
    @closeAction="close"
  >
    <template #footer>
      <el-button type="primary" size="default" @click="close">
        {{ i18n("form.confirm") }}
      </el-button>
    </template>
    <field-list @selectData="changeItem" />
  </star-horse-panel>

  <template v-if="shouldWrap">
    <div
      class="design-item-wrapper"
      :class="{ 'active-item': currentItemId == itemId }"
      @click="selectData(field)"
      @contextmenu="itemContextMenu"
    >
      <slot></slot>
      <div
        class="component-header-actions"
        v-if="currentItemId == itemId"
        :key="`header-actions-${currentItemId}-${refreshFlag}`"
      >
        <div class="drag-handler">
          <el-tooltip :content="i18n('form.drag')" :trigger="isMobile ? 'click' : 'hover'">
            <star-horse-icon icon-class="drag" style="cursor: move; color: var(--star-horse-white)" />
          </el-tooltip>
          <el-tooltip :content="field?.preps['itemNameLabel']" :trigger="isMobile ? 'click' : 'hover'">
            <span style="color: var(--star-horse-white); cursor: pointer" @click="selectData(field)">
              {{ field?.preps["itemNameLabel"] }}
            </span>
          </el-tooltip>
        </div>
        <div v-if="editUserInfo.length > 0" class="field-action">{{ editUserInfo }}</div>
        <div class="field-action" v-else>
          <el-tooltip :content="i18n('form.selectParentContainer')" :trigger="isMobile ? 'click' : 'hover'" v-if="parentField?.itemType">
            <star-horse-icon @click.stop="selectParentContainer()" icon-class="select-parent" cursor="pointer" style="color: var(--star-horse-white)" />
          </el-tooltip>
          <el-tooltip :content="i18n('form.changeComponent')" :trigger="isMobile ? 'click' : 'hover'">
            <star-horse-icon @click.stop="exchangeItem" icon-class="exchange" cursor="pointer" style="color: var(--star-horse-white)" />
          </el-tooltip>
          <el-tooltip :content="i18n('form.moveUp')" :trigger="isMobile ? 'click' : 'hover'">
            <star-horse-icon @click.stop="moveUpItem(isEdit, field?.preps, parentField)" icon-class="move-up" cursor="pointer" style="color: var(--star-horse-white)" />
          </el-tooltip>
          <el-tooltip :content="i18n('form.moveDown')" :trigger="isMobile ? 'click' : 'hover'">
            <star-horse-icon @click.stop="moveDownItem(isEdit, field?.preps, parentField)" icon-class="move-down" cursor="pointer" style="color: var(--star-horse-white)" />
          </el-tooltip>
          <el-tooltip :content="i18n('form.deleteComponent')" :trigger="isMobile ? 'click' : 'hover'">
            <star-horse-icon @click.stop="removeItem(isEdit, field?.preps, parentField)" icon-class="clear-all" cursor="pointer" style="color: var(--star-horse-white)" />
          </el-tooltip>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <ContentMenu
        ref="itemContextMenuRef"
        :menu-data="dynamicFormContextMenuData(field, parentField, 'item')"
      />
    </Teleport>
  </template>

  <slot v-else></slot>
</template>

<style lang="scss" scoped>
.design-item-wrapper {
  position: relative;
  width: 100%;
}

.active-item {
  border: 1px dashed var(--star-horse-style);
}


.component-header-actions {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 99;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 2px;
  transform: translate(0, -100%) translateZ(0);
  .drag-handler {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--star-horse-style);
    border-radius: 3px;
    padding: 2px 4px;
    height: 22px;
  }

  .field-action {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--star-horse-style);
    border-radius: 3px;
    padding: 2px 4px;
    height: 22px;
  }
}
</style>
