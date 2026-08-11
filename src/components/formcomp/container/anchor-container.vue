<script setup lang="ts" name="anchor-container">
import {computed, nextTick, onMounted, onBeforeUnmount, PropType, ref} from "vue";
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
const contentRef = ref<HTMLElement>();
const activeSection = ref("");
const sectionRefs = ref<Record<string, HTMLElement>>({});

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

// 锚点链接列表
const anchorLinks = computed(() => {
  const elements = props.field?.preps?.elements || [];
  return elements.map((el: any, idx: number) => ({
    title: el.label || `${i18n('dyform.container.anchorSection')} ${idx + 1}`,
    href: `#anchor-${props.field?.id}-${idx}`,
    index: idx,
  }));
});

// 滚动到指定锚点
const scrollToSection = (href: string) => {
  const el = sectionRefs.value[href];
  if (el && contentRef.value) {
    const offset = props.field?.preps?.offset || 0;
    const top = el.offsetTop - offset;
    contentRef.value.scrollTo({top, behavior: "smooth"});
  }
};

// 滚动监听,高亮当前锚点
const handleScroll = () => {
  if (!contentRef.value) return;
  const scrollTop = contentRef.value.scrollTop;
  const elements = props.field?.preps?.elements || [];
  let current = "";
  for (let i = 0; i < elements.length; i++) {
    const href = `#anchor-${props.field?.id}-${i}`;
    const el = sectionRefs.value[href];
    if (el && el.offsetTop - 60 <= scrollTop) {
      current = href;
    }
  }
  activeSection.value = current;
};

const setSectionRef = (href: string, el: any) => {
  if (el) sectionRefs.value[href] = el;
};

onMounted(() => {
  if (!props.field["preps"]) props.field["preps"] = {};
  if (!props.field["preps"]?.["elements"]) {
    props.field["preps"]["elements"] = [
      {label: i18n("dyform.container.anchorSection") + " 1", tabName: "anchor1", objectName: "anchor1", subFormFlag: "Y", items: []},
      {label: i18n("dyform.container.anchorSection") + " 2", tabName: "anchor2", objectName: "anchor2", subFormFlag: "Y", items: []},
    ];
  }
  if (!props.isDesign) {
    nextTick(() => {
      contentRef.value?.addEventListener("scroll", handleScroll);
      handleScroll();
    });
  }
});

onBeforeUnmount(() => {
  contentRef.value?.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <group-container
      class="star-horse-form-container anchor-wrapper"
      :showFormItem="showFormItem"
      :isDesign="isDesign"
      :disabled="disabled"
      :parentField="parentField"
      :form-item="field"
  >
    <!-- 设计模式: 拖拽区域 -->
    <div v-if="isDesign" class="anchor-design-wrapper">
      <div v-for="(adata, idx) in field['preps']['elements']" :key="adata.tabName" class="anchor-section-design">
        <div class="section-header-design">
          <span class="section-index">{{ idx + 1 }}</span>
          <span class="section-title">{{ adata.label || i18n('dyform.container.anchorSection') + ' ' + (idx + 1) }}</span>
        </div>
        <draggable
            @add="(evt: Event) => onDragAdd(evt, adata['items'])"
            @dragover="checkItem(adata)"
            class="anchor-design"
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
          <el-button size="small" type="info" plain @click.stop="quickAddItem(adata.items)" icon="Plus">
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 运行模式: 锚点导航 + 内容区 -->
    <div v-else class="anchor-layout" :class="`placement-${field.preps['placement'] || 'right'}`">
      <!-- 内容区 -->
      <div class="anchor-content" ref="contentRef">
        <div
            v-for="(adata, idx) in field['preps']['elements']"
            :key="adata.tabName"
            :ref="(el) => setSectionRef(`#anchor-${field.id}-${idx}`, el)"
            class="anchor-section"
        >
          <div class="section-title-bar">
            <span class="section-dot">{{ idx + 1 }}</span>
            <span class="section-name">{{ adata.label || i18n('dyform.container.anchorSection') + ' ' + (idx + 1) }}</span>
          </div>
          <div class="section-items">
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
          </div>
        </div>
      </div>
      <!-- 锚点导航 -->
      <div class="anchor-nav" :class="`direction-${field.preps['direction'] || 'vertical'}`">
        <div class="anchor-nav-title">
          <star-horse-icon icon-class="list-left" size="14px"/>
          <span>{{ i18n('dyform.container.anchorNavTitle') }}</span>
        </div>
        <div class="anchor-nav-list">
          <a
              v-for="link in anchorLinks"
              :key="link.href"
              :class="['anchor-link', { active: activeSection === link.href }]"
              @click.prevent="scrollToSection(link.href)"
          >
            <span class="link-dot"></span>
            <span class="link-text">{{ link.title }}</span>
          </a>
        </div>
      </div>
    </div>
  </group-container>
</template>

<style lang="scss" scoped>
.anchor-wrapper {
  width: 100%;
}

/* ── 设计模式 ── */
.anchor-design-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anchor-section-design {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.section-header-design {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.section-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--star-horse-style, #409eff);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.anchor-design {
  min-height: 50px;
  padding: 8px;
}

.dragging-area {
  background: #ecf5ff;
  outline: 2px dashed #409eff;
  outline-offset: -2px;
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  border-top: 1px dashed #d9ecff;

  &:hover {
    background: #ecf5ff;
  }
}

/* ── 运行模式 ── */
.anchor-layout {
  display: flex;
  gap: 16px;
  width: 100%;

  &.placement-right {
    flex-direction: row;
    .anchor-content { flex: 1; order: 1; }
    .anchor-nav { width: 200px; order: 2; }
  }

  &.placement-left {
    flex-direction: row;
    .anchor-content { flex: 1; order: 2; }
    .anchor-nav { width: 200px; order: 1; }
  }

  &.placement-top {
    flex-direction: column;
    .anchor-nav {
      width: 100%;
      &.direction-horizontal { .anchor-nav-list { flex-direction: row; } }
    }
  }

  &.placement-bottom {
    flex-direction: column-reverse;
    .anchor-nav {
      width: 100%;
      &.direction-horizontal { .anchor-nav-list { flex-direction: row; } }
    }
  }
}

.anchor-content {
  max-height: 70vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding-right: 4px;
}

.anchor-section {
  margin-bottom: 24px;
  scroll-margin-top: 20px;
}

.section-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
  border-left: 3px solid var(--star-horse-style, #409eff);
  border-radius: 0 6px 6px 0;
}

.section-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--star-horse-style, #409eff);
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.section-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-items {
  padding: 0 12px;
}

/* ── 锚点导航 ── */
.anchor-nav {
  position: sticky;
  top: 0;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  max-height: 70vh;
  overflow-y: auto;
}

.anchor-nav-title {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.anchor-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.anchor-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #606266;
  font-size: 13px;

  .link-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c0c4cc;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  &:hover {
    background: #ecf5ff;
    color: var(--star-horse-style, #409eff);

    .link-dot {
      background: var(--star-horse-style, #409eff);
    }
  }

  &.active {
    background: var(--star-horse-style, #409eff);
    color: #fff;
    font-weight: 500;

    .link-dot {
      background: #fff;
      transform: scale(1.3);
    }
  }
}
</style>
