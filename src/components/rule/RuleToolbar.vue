<template>
<!-- 顶部菜单栏 -->
<div class="designer-toolbar">
  <!-- 左：规则名 + 状态 + 分类 -->
  <div class="toolbar-left">
    <el-button
      v-if="props.formId"
      link
      @click="emit('back')"
      :title="i18n('rule.backToForm')"
    >
      <el-icon>
        <Back />
      </el-icon>
    </el-button>
    <div class="rule-title-wrap">
      <span
        class="status-dot"
        :class="'dot-' + (props.ruleData.status || 'DRAFT').toLowerCase()"
      ></span>
      <el-input
        v-model="props.ruleData.ruleName"
        :placeholder="i18n('rule.msg.ruleName')"
        class="rule-name-input"
        size="large"
      >
        <template #prefix>
          <el-icon>
            <EditPen />
          </el-icon>
        </template>
      </el-input>
    </div>
    <el-tag
      :type="getStatusType(props.ruleData.status)"
      size="small"
      effect="plain"
      round
    >
      {{ getStatusText(props.ruleData.status) }}
    </el-tag>
    <!-- 规则分类：下拉选择 -->
    <el-select
      v-model="props.ruleData.ruleCategory"
      :placeholder="i18n('rule.ph.selectRuleCategory')"
      size="small"
      class="rule-category-input"
      clearable
    >
      <template #prefix>
        <el-icon><FolderOpened /></el-icon>
      </template>
      <el-option
        v-for="cat in props.ruleCategoryOptions"
        :key="cat.value"
        :label="i18n(cat.label)"
        :value="cat.value"
      />
    </el-select>
  </div>
  <!-- 中：主操作分组下拉 -->
  <div class="toolbar-center">
    <!-- 文件组：保存/发布/测试 -->
    <el-dropdown
      trigger="click"
      @command="onCommand"
      popper-class="toolbar-dropdown-popper"
    >
      <el-button size="small">
        <star-horse-icon iconClass="save" />
        <span>{{ i18n("rule.toolbar.file") }}</span>
        <el-icon class="dropdown-caret"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="save" :icon="null">
            <star-horse-icon iconClass="save" />
            <span>{{ i18n("rule.save") }}</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-if="props.ruleData.status !== 'PUBLISHED'"
            command="publish"
            :icon="null"
          >
            <star-horse-icon iconClass="publish" />
            <span>{{ i18n("rule.publish") }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="test" :icon="null" divided>
            <star-horse-icon iconClass="run" />
            <span>{{ i18n("rule.test") }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 视图组：设计/代码 -->
    <el-dropdown
      trigger="click"
      @command="onCommand"
      popper-class="toolbar-dropdown-popper"
    >
      <el-button size="small">
        <star-horse-icon iconClass="data-view" />
        <span>{{ i18n("rule.toolbar.view") }}</span>
        <el-icon class="dropdown-caret"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            command="viewDesign"
            :icon="null"
            :class="{ 'is-active': props.viewMode === 'design' }"
          >
            <star-horse-icon iconClass="data-view" />
            <span>{{ i18n("rule.codeView.design") }}</span>
            <el-icon v-if="props.viewMode === 'design'" class="active-check"
              ><Check
            /></el-icon>
          </el-dropdown-item>
          <el-dropdown-item
            command="viewCode"
            :icon="null"
            :class="{ 'is-active': props.viewMode === 'code' }"
          >
            <star-horse-icon iconClass="document" />
            <span>{{ i18n("rule.codeView.code") }}</span>
            <el-icon v-if="props.viewMode === 'code'" class="active-check"
              ><Check
            /></el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <!-- 右：更多操作分组下拉 -->
  <div class="toolbar-right">
    <!-- 校验徽标（独立显示，方便快速查看问题数） -->
    <el-popover
      placement="bottom-end"
      :width="420"
      trigger="click"
      popper-class="validation-popper"
    >
      <template #reference>
        <el-badge
          :value="props.validationResult.errorCount"
          :hidden="props.validationResult.errorCount === 0"
          type="danger"
        >
          <el-button
            size="small"
            :class="{
              'val-ok':
                props.validationResult.errorCount === 0 &&
                props.validationResult.warningCount === 0,
            }"
          >
            <star-horse-icon
              iconClass="check"
              v-if="
                props.validationResult.errorCount === 0 &&
                props.validationResult.warningCount === 0
              "
            />
            <star-horse-icon iconClass="warning" v-else />
            <span>{{ i18n("rule.val.title") }}</span>
          </el-button>
        </el-badge>
      </template>
      <div class="validation-panel">
        <div class="validation-head">
          <div class="vh-title">
            <star-horse-icon iconClass="warning" />
            {{ i18n("rule.val.title") }}
          </div>
          <div class="vh-stats">
            <el-tag
              v-if="props.validationResult.errorCount"
              type="danger"
              size="small"
              effect="dark"
            >
              {{
                i18n("rule.val.errorCount", [props.validationResult.errorCount])
              }}
            </el-tag>
            <el-tag
              v-if="props.validationResult.warningCount"
              type="warning"
              size="small"
              effect="dark"
            >
              {{
                i18n("rule.val.warningCount", [
                  props.validationResult.warningCount,
                ])
              }}
            </el-tag>
            <el-tag
              v-if="
                props.validationResult.errorCount === 0 &&
                props.validationResult.warningCount === 0
              "
              type="success"
              size="small"
              effect="dark"
            >
              {{ i18n("rule.val.allPass") }}
            </el-tag>
          </div>
        </div>
        <el-divider style="margin: 8px 0" />
        <div class="validation-list">
          <div
            v-if="props.validationResult.issues.length === 0"
            class="val-empty"
          >
            <star-horse-icon iconClass="check" />
            <p>{{ i18n("rule.val.allPassDesc") }}</p>
          </div>
          <div
            v-for="(iss, idx) in props.validationResult.issues"
            :key="idx"
            class="val-item"
            :class="'vi-' + iss.level"
            @click="iss.nodeId && emit('locateNode', iss.nodeId)"
          >
            <span class="vi-bullet">{{
              iss.level === "error" ? "✗" : "⚠"
            }}</span>
            <div class="vi-body">
              <div class="vi-msg">{{ iss.message }}</div>
              <div class="vi-meta">
                <span v-if="iss.nodeId" class="vi-node">{{
                  iss.nodeName
                }}</span>
                <span v-else class="vi-node">{{
                  i18n("rule.val.graphLevel")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-popover>

    <!-- 更多操作下拉 -->
    <el-dropdown
      trigger="click"
      @command="onCommand"
      popper-class="toolbar-dropdown-popper"
    >
      <el-button size="small">
        <star-horse-icon iconClass="setting" />
        <span>{{ i18n("rule.toolbar.more") }}</span>
        <el-icon class="dropdown-caret"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="import" :icon="null">
            <star-horse-icon iconClass="upload" />
            <span>{{ i18n("rule.importRule") }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="export" :icon="null">
            <star-horse-icon iconClass="download" />
            <span>{{ i18n("rule.exportRule") }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="demo" :icon="null" divided>
            <star-horse-icon iconClass="info" />
            <span>{{ i18n("rule.demo") }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="help" :icon="null" divided>
            <star-horse-icon iconClass="help" />
            <span>{{ i18n("rule.help") }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 帮助面板（隐藏触发，由"更多"下拉调用） -->
    <el-popover
      ref="helpPopoverRef"
      placement="bottom-end"
      :width="420"
      trigger="click"
      popper-class="help-popper"
    >
      <template #reference>
        <span style="display: none"></span>
      </template>
      <div class="help-panel">
        <div class="help-title">
          <star-horse-icon iconClass="help" />
          {{ i18n("rule.help.title") }}
        </div>
        <el-divider style="margin: 8px 0" />
        <div class="help-section">
          <div class="help-section-title">
            {{ i18n("rule.help.basic") }}
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.dragAdd") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.dragConnect") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.doubleClick") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.rightClick") }}</kbd>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-title">
            {{ i18n("rule.help.select") }}
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.clickSelect") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.shiftSelect") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.boxSelect") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.middlePan") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.ctrlA") }}</kbd>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-title">{{ i18n("rule.help.edit") }}</div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.delete") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.ctrlZ") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.ctrlY") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.ctrlC") }}</kbd> /
            <kbd>{{ i18n("rule.help.ctrlV") }}</kbd>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-title">
            {{ i18n("rule.help.canvas") }}
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.wheelZoom") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.alignTool") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.edgeStyle") }}</kbd>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-title">{{ i18n("rule.help.test") }}</div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.openConsole") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.executeHighlight") }}</kbd>
          </div>
          <div class="help-row">
            <kbd>{{ i18n("rule.help.closeRestore") }}</kbd>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-title">{{ i18n("rule.msg.tip") }}</div>
          <div class="help-row">
            <kbd>{{ i18n("rule.msg.canvasTip") }}</kbd>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</div>
</template>

<script setup lang="ts">
import {ref, nextTick} from "vue";
import {ArrowDown, Back, Check, EditPen, FolderOpened, InfoFilled} from "@element-plus/icons-vue";
import {i18n} from "@/lang";

const props = defineProps<{
  formId?: string;
  ruleData: any;
  viewMode: string;
  validationResult: any;
  ruleCategoryOptions: any[];
}>();

const emit = defineEmits<{
  (e: "command", cmd: string): void;
  (e: "back"): void;
  (e: "locateNode", nodeId: string): void;
}>();

const helpPopoverRef = ref();

const onCommand = (cmd: string) => {
  if (cmd === "help") {
    nextTick(() => {
      const popper = helpPopoverRef.value as any;
      if (popper && typeof popper.show === "function") popper.show();
      else if (popper?.popperRef?.show) popper.popperRef.show();
    });
    return;
  }
  emit("command", cmd);
};

const getStatusType = (s: string) =>
  ({DRAFT: "info", PUBLISHED: "success", DISABLED: "danger"})[s] || "info";
const getStatusText = (s: string) =>
  ({
    DRAFT: i18n("rule.status.draft"),
    PUBLISHED: i18n("rule.status.published"),
    DISABLED: i18n("rule.status.disabled"),
  })[s] || s;
</script>

<style scoped lang="scss">
@use "./styles/design-tokens.scss" as tokens;
.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: tokens.$rd-space-2 tokens.$rd-space-4;
  background: tokens.$rd-bg-surface;
  border-bottom: 1px solid tokens.$rd-border;
  box-shadow: tokens.$rd-shadow-xs;
  z-index: 10;
  min-height: 56px;
  // 防止分辨率变化时按钮被挤出/重叠：不允许换行，三栏自适应
  flex-wrap: nowrap;
  gap: tokens.$rd-space-2;
  overflow: hidden;

  // 主工具栏所有按钮统一为"图标+文字"风格
  :deep(.el-button) {
    // 图标与文字间距
    .el-icon + span {
      margin-left: 4px;
    }

    .el-icon {
      font-size: 16px;

      svg {
        width: 1.05em;
        height: 1.05em;
      }
    }

    // 文字字号统一
    > span {
      font-size: 13px;
      font-weight: 500;
    }

    // 下拉触发按钮：图标 + 文字 + 箭头 三段式布局
    .dropdown-caret {
      margin-left: 4px;
      font-size: 12px;
      color: tokens.$rd-text-tertiary;
    }
  }

  // 左侧返回按钮保持纯图标（link 样式，区别于主操作）
  .toolbar-left :deep(.el-button.el-button--link) {
    padding: 6px 8px;

    .el-icon {
      font-size: 18px;
    }
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-3;
    // 允许收缩：分辨率变化时规则名输入框自适应
    flex: 1 1 auto;
    min-width: 0;

    .rule-title-wrap {
      display: flex;
      align-items: center;
      gap: tokens.$rd-space-2;
      min-width: 0;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: tokens.$rd-radius-pill;
        flex-shrink: 0;
        background: tokens.$rd-text-tertiary;

        &.dot-draft {
          background: tokens.$rd-text-tertiary;
        }

        &.dot-published {
          background: tokens.$rd-success;
        }

        &.dot-disabled {
          background: tokens.$rd-error;
        }
      }
    }

    .rule-name-input {
      // 自适应宽度：分辨率变化时自动收缩，但保留最小可用宽度
      width: 100%;
      max-width: 240px;
      min-width: 80px;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        background: transparent;
        padding-left: 0;
      }

      :deep(.el-input__inner) {
        font-size: tokens.$rd-font-md;
        font-weight: tokens.$rd-font-weight-semibold;
        color: tokens.$rd-text-primary;
      }
    }

    // 规则分类下拉选择：紧凑样式，与状态标签并列
    .rule-category-input {
      width: 160px !important;
      flex-shrink: 0;

      :deep(.el-input__wrapper) {
        background: tokens.$rd-bg-active;
        box-shadow: 0 0 0 1px tokens.$rd-border inset;
        border-radius: tokens.$rd-radius-sm;
        padding-left: 8px;
      }

      :deep(.el-input__inner) {
        font-size: tokens.$rd-font-sm;
        color: tokens.$rd-text-secondary;
      }

      :deep(.el-input__prefix) {
        color: tokens.$rd-text-tertiary;
        margin-right: 4px;
      }

      :deep(.el-select__caret) {
        color: tokens.$rd-text-tertiary;
      }
    }

    // 状态标签不可压缩
    .el-tag {
      flex-shrink: 0;
    }
  }

  .toolbar-center {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    // 中间分组下拉按钮固定尺寸，不允许挤压
    flex: 0 0 auto;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    flex: 0 0 auto;
    // 校验通过时按钮文字置灰，存在问题时由图标颜色区分
    .val-ok {
      color: tokens.$rd-text-tertiary;

      .el-icon {
        color: tokens.$rd-success;
      }
    }
  }
}
</style>

<style lang="scss">
/* 帮助面板样式 */
.help-popper.help-popper {
  z-index: 9999 !important;
}

.help-popper .help-panel {
  max-height: 480px;
  overflow-y: auto;
}

.help-popper .help-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.help-popper .help-section {
  margin-bottom: 10px;
}

.help-popper .help-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 4px;
  padding-left: 2px;
}

.help-popper .help-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  padding: 2px 0;
}

.help-popper .help-row span {
  color: #94a3b8;
  margin-left: auto;
}

.help-popper kbd {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-family: "Consolas", "Monaco", monospace;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

/* 实时校验汇总面板（popper 渲染在 body，需放在非 scoped 块） */
.validation-popper.validation-popper {
  z-index: 9999 !important;
}

.validation-popper .validation-panel {
  max-height: 460px;
  overflow-y: auto;
}

.validation-popper .validation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.validation-popper .vh-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.validation-popper .vh-stats {
  display: flex;
  gap: 4px;
}

.validation-popper .validation-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validation-popper .val-empty {
  text-align: center;
  padding: 24px 0;
  color: #10b981;
}

.validation-popper .val-empty p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.validation-popper .val-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  border: 1px solid transparent;
}

.validation-popper .val-item:hover {
  background: #f4f5f7;
}

.validation-popper .val-item.vi-error {
  background: #fef2f2;
  border-color: #fecaca;
}

.validation-popper .val-item.vi-error:hover {
  background: #fee2e2;
}

.validation-popper .val-item.vi-warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.validation-popper .val-item.vi-warning:hover {
  background: #fef3c7;
}

.validation-popper .vi-bullet {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.4;
}

.validation-popper .vi-error .vi-bullet {
  color: #ef4444;
}

.validation-popper .vi-warning .vi-bullet {
  color: #f59e0b;
}

.validation-popper .vi-body {
  flex: 1;
  min-width: 0;
}

.validation-popper .vi-msg {
  font-size: 12px;
  color: #111827;
  line-height: 1.5;
  word-break: break-word;
}

.validation-popper .vi-meta {
  margin-top: 2px;
  font-size: 11px;
  color: #9ca3af;
}

.validation-popper .vi-node {
  font-family: ui-monospace, monospace;
}
</style>
