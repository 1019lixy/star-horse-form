<script setup lang="ts" name="anchor-container">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  PropType,
  ref,
} from "vue";
import { itemCheck } from "star-horse-lowcode";
import { getDesignFormStore } from "@/store/StoreManager";
import { i18n } from "@/lang";
import { quickAddItem } from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import { isContainer, ensureDefaultElements } from "./container-types";
import { useDragAdd, ensureItems } from "./container-utils";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
});
let designForm = getDesignFormStore();
const formData = defineModel("formData");
const contentRef = ref<HTMLElement>();
const activeSection = ref("");
const sectionRefs = ref<Record<string, HTMLElement>>({});

const { onDragAdd } = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);

// 锚点链接列表（支持 anchorItem 独立配置：anchorTitle/anchorHref/anchorIcon/anchorDisabled）
const anchorLinks = computed(() => {
  const elements = props.field?.preps?.elements || [];
  return elements.map((el: any, idx: number) => ({
    title:
      el.anchorTitle ||
      el.label ||
      `${i18n("dyform.container.anchorSection")} ${idx + 1}`,
    href: el.anchorHref || `#anchor-${props.field?.id}-${idx}`,
    icon: el.anchorIcon || "",
    disabled: el.anchorDisabled === true || el.anchorDisabled === "true",
    index: idx,
  }));
});

// 是否显示导航标题
const showNavTitle = computed(() => props.field?.preps?.showNavTitle !== false);
// 导航栏宽度
const navWidth = computed(() => `${props.field?.preps?.navWidth || 200}px`);
// 是否显示区块序号
const showSectionNumber = computed(
  () => props.field?.preps?.showSectionNumber !== false,
);
// 是否平滑滚动
const smoothScroll = computed(() => props.field?.preps?.smoothScroll !== false);
// 滚动偏移量（高亮计算用）
const scrollOffset = computed(
  () => Number(props.field?.preps?.scrollOffset) || 60,
);
// 吸顶偏移量
const stickyOffset = computed(
  () => `${props.field?.preps?.stickyOffset || 0}px`,
);
// 高亮颜色
const highlightColor = computed(() => props.field?.preps?.highlightColor || "");
// 内容区最大高度
const contentMaxHeight = computed(
  () => props.field?.preps?.contentMaxHeight || "70vh",
);

// 滚动到指定锚点
const scrollToSection = (href: string, disabled?: boolean) => {
  if (disabled) return;
  const el = sectionRefs.value[href];
  if (el && contentRef.value) {
    const offset = Number(props.field?.preps?.offset) || 0;
    const top = el.offsetTop - offset;
    contentRef.value.scrollTo({
      top,
      behavior: smoothScroll.value ? "smooth" : "auto",
    });
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
    if (el && el.offsetTop - scrollOffset.value <= scrollTop) {
      current = href;
    }
  }
  activeSection.value = current;
};

const setSectionRef = (href: string, el: any) => {
  if (el) sectionRefs.value[href] = el;
};

onMounted(() => {
  ensureDefaultElements(props.field, "anchor");
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
      <div
        v-for="(adata, idx) in field['preps']['elements']"
        :key="adata.subTablePrimaryKey"
        class="anchor-section-design"
      >
        <div class="section-header-design">
          <span v-if="showSectionNumber" class="section-index">{{
            idx + 1
          }}</span>
          <star-horse-icon
            v-if="adata.anchorIcon"
            :icon-class="adata.anchorIcon"
            size="14px"
          />
          <span class="section-title">{{
            adata.anchorTitle ||
            adata.label ||
            i18n("dyform.container.anchorSection") + " " + (idx + 1)
          }}</span>
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
              <DesignItemWrapper
                :field="item"
                :isDesign="isDesign"
                :parentField="field"
                :disabled="disabled"
              >
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
              </DesignItemWrapper>
            </div>
          </template>
        </draggable>
        <div v-if="isDesign" class="quick-add-bar">
          <el-button
            size="small"
            type="info"
            plain
            @click.stop="quickAddItem(adata.items)"
            icon="Plus"
          >
            {{ i18n("dyform.condition.addLeaf") }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 运行模式: 锚点导航 + 内容区 -->
    <div
      v-else
      class="anchor-layout"
      :class="`placement-${field.preps['placement'] || 'right'}`"
      :style="{
        '--anchor-nav-width': navWidth,
        '--anchor-highlight-color': highlightColor,
        '--anchor-sticky-top': stickyOffset,
        '--anchor-content-max-height': contentMaxHeight,
      }"
    >
      <!-- 内容区 -->
      <div class="anchor-content" ref="contentRef">
        <div
          v-for="(adata, idx) in field['preps']['elements']"
          :key="adata.subTablePrimaryKey"
          :ref="(el) => setSectionRef(`#anchor-${field.id}-${idx}`, el)"
          class="anchor-section"
        >
          <div class="section-title-bar">
            <span v-if="showSectionNumber" class="section-dot">{{
              idx + 1
            }}</span>
            <star-horse-icon
              v-if="adata.anchorIcon"
              :icon-class="adata.anchorIcon"
              size="16px"
            />
            <span class="section-name">{{
              adata.anchorTitle ||
              adata.label ||
              i18n("dyform.container.anchorSection") + " " + (idx + 1)
            }}</span>
          </div>
          <div class="section-items">
            <DesignItemWrapper
              v-for="item in adata['items']"
              :key="item.id"
              :field="item"
              :isDesign="false"
              :parentField="field"
              :disabled="disabled"
            >
              <component
                :field="item"
                :isDesign="false"
                :disabled="disabled"
                :showFormItem="showFormItem"
                :formInfo="formInfo"
                :is="itemCheck(item)"
                :parentField="field"
                v-model:formData="formData"
              />
            </DesignItemWrapper>
          </div>
        </div>
      </div>
      <!-- 锚点导航 -->
      <div
        class="anchor-nav"
        :class="`direction-${field.preps['direction'] || 'vertical'}`"
      >
        <div v-if="showNavTitle" class="anchor-nav-title">
          <star-horse-icon icon-class="list-left" size="14px" />
          <span>{{ i18n("dyform.container.anchorNavTitle") }}</span>
        </div>
        <div class="anchor-nav-list">
          <a
            v-for="link in anchorLinks"
            :key="link.href"
            :class="[
              'anchor-link',
              { active: activeSection === link.href, disabled: link.disabled },
            ]"
            @click.prevent="scrollToSection(link.href, link.disabled)"
          >
            <star-horse-icon
              v-if="link.icon"
              :icon-class="link.icon"
              size="14px"
              class="link-icon"
            />
            <span v-else class="link-dot"></span>
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
    .anchor-content {
      flex: 1;
      order: 1;
    }
    .anchor-nav {
      width: var(--anchor-nav-width, 200px);
      order: 2;
    }
  }

  &.placement-left {
    flex-direction: row;
    .anchor-content {
      flex: 1;
      order: 2;
    }
    .anchor-nav {
      width: var(--anchor-nav-width, 200px);
      order: 1;
    }
  }

  &.placement-top {
    flex-direction: column;
    .anchor-nav {
      width: 100%;
      &.direction-horizontal {
        .anchor-nav-list {
          flex-direction: row;
        }
      }
    }
  }

  &.placement-bottom {
    flex-direction: column-reverse;
    .anchor-nav {
      width: 100%;
      &.direction-horizontal {
        .anchor-nav-list {
          flex-direction: row;
        }
      }
    }
  }
}

.anchor-content {
  max-height: var(--anchor-content-max-height, 70vh);
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
  top: var(--anchor-sticky-top, 0);
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  max-height: var(--anchor-content-max-height, 70vh);
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

  .link-icon {
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
    background: var(--anchor-highlight-color, var(--star-horse-style, #409eff));
    color: #fff;
    font-weight: 500;

    .link-dot {
      background: #fff;
      transform: scale(1.3);
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
