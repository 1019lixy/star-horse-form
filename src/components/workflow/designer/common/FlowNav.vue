<script setup lang="ts">
import { computed, ref } from "vue";
import { flowCommon } from "@/components/workflow/utils/flowCommon";
import { scale } from "@/components/workflow/utils/deviceUtil";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance } from "star-horse-lowcode";

const props = defineProps({
  buttonName: {
    type: String,
    default: "发布",
  },
});
const emits = defineEmits([
  "flowSave",
  "changeFlow",
  "openBasicInfo",
  "openFormBinding",
  "openMoreConfig",
]);
const flowDesign = useFlowDesignStore(piniaInstance);
let formInfo = computed(() => flowDesign.flowFormInfo);
const flowName = computed(() => formInfo.value?.name || "未命名流程");

const flowSave = (type: string) => {
  emits("flowSave", type);
};
const changeFlow = () => {
  emits("changeFlow");
};
const handleMenuCommand = (command: string) => {
  switch (command) {
    case "basicInfo":
      emits("openBasicInfo");
      break;
    case "formBinding":
      emits("openFormBinding");
      break;
    case "moreConfig":
      emits("openMoreConfig");
      break;
    case "save":
      emits("flowSave", "save");
      break;
    case "changeFlow":
      emits("changeFlow");
      break;
  }
};
</script>

<template>
  <div class="designer-nav-box" :class="{ 'designer-nav-box-mobile': scale.isMobile() }">
    <!-- PC端布局 -->
    <template v-if="!scale.isMobile()">
      <!-- 左侧：返回 + 标题 -->
      <div class="designer-nav-return">
        <router-link
          :to="{ path: '/workflow/FlowDefineUi' }"
          class="nav-back-link"
        >
          <star-horse-icon icon-class="back" />
          <span>返回</span>
        </router-link>
        <el-divider
          direction="vertical"
          style="border: 1px solid var(--star-horse-style)"
        />
        <div class="nav-title">
          <span class="nav-title-text">{{ flowName }}</span>
        </div>
      </div>

      <!-- 中间：功能按钮 -->
      <div class="designer-nav-center">
        <el-tooltip content="基础信息" placement="bottom" :show-after="300">
          <el-button
            class="nav-action-btn"
            text
            @click="emits('openBasicInfo')"
          >
            <star-horse-icon icon-class="setting" size="16px" />
            <span class="nav-action-label">基础信息</span>
          </el-button>
        </el-tooltip>
        <el-tooltip content="表单绑定" placement="bottom" :show-after="300">
          <el-button
            class="nav-action-btn"
            text
            @click="emits('openFormBinding')"
          >
            <star-horse-icon icon-class="document" size="16px" />
            <span class="nav-action-label">表单绑定</span>
          </el-button>
        </el-tooltip>
        <el-tooltip content="更多配置" placement="bottom" :show-after="300">
          <el-button
            class="nav-action-btn"
            text
            @click="emits('openMoreConfig')"
          >
            <star-horse-icon icon-class="advanced_template" size="16px" />
            <span class="nav-action-label">更多配置</span>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="designer-nav-button">
        <el-button link :size="flowCommon.size" @click="changeFlow">
          <span>切换</span>
        </el-button>
        <el-divider direction="vertical" />
        <el-button type="info" :size="flowCommon.size" @click="flowSave('save')">
          <star-horse-icon icon-class="save" color="var(--star-style-white)" />
          暂存
        </el-button>
        <el-divider direction="vertical" />
        <el-button
          type="primary"
          :size="flowCommon.size"
          @click="flowSave('publish')"
        >
          <star-horse-icon icon-class="publish" color="var(--star-style-white)" />
          {{ buttonName }}
        </el-button>
      </div>
    </template>

    <!-- 移动端布局：紧凑导航栏 -->
    <template v-else>
      <!-- 左侧：返回 -->
      <div class="m-nav-left">
        <router-link
          :to="{ path: '/workflow/FlowDefineUi' }"
          class="m-back-btn"
        >
          <star-horse-icon icon-class="back" size="18px" />
        </router-link>
        <span class="m-nav-title">{{ flowName }}</span>
      </div>

      <!-- 右侧：发布 + 更多菜单 -->
      <div class="m-nav-right">
        <el-button
          type="primary"
          size="small"
          class="m-publish-btn"
          @click="flowSave('publish')"
        >
          <star-horse-icon icon-class="publish" color="var(--star-style-white)" size="14px" />
          {{ buttonName }}
        </el-button>
        <el-dropdown trigger="click" @command="handleMenuCommand">
          <el-button size="small" class="m-more-btn">
            <el-icon><More /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="basicInfo" icon="Setting">
                基础信息
              </el-dropdown-item>
              <el-dropdown-item command="formBinding" icon="Document">
                表单绑定
              </el-dropdown-item>
              <el-dropdown-item command="moreConfig" icon="Operation">
                更多配置
              </el-dropdown-item>
              <el-dropdown-item divided command="save" icon="DocumentChecked">
                暂存
              </el-dropdown-item>
              <el-dropdown-item command="changeFlow" icon="Switch">
                切换流程
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.designer-nav-box {
  width: 100%;
  height: 50px;
  box-shadow: 0 2px 8px rgba(92, 99, 115, 0.15);
  box-sizing: border-box;
  display: flex;
  position: relative;
  z-index: 100;
}
.designer-nav-return {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 14px;
  font-weight: 700;
  color: #575757;
  cursor: pointer;
}
.nav-back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #575757;
  text-decoration: none;
  font-weight: 700;
  &:hover {
    color: var(--star-horse-style);
  }
}
.nav-title {
  display: flex;
  align-items: center;
  margin-right: 16px;
}
.nav-title-text {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.designer-nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.nav-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px !important;
  border-radius: 6px;
  color: #606266;
  &:hover {
    color: var(--star-horse-style);
    background: rgba(64, 158, 255, 0.06);
  }
}
.nav-action-label {
  font-size: 13px;
  font-weight: 500;
}
.designer-nav-button {
  flex: 0 0 auto;
  margin-right: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 移动端导航栏 */
.designer-nav-box-mobile {
  height: 44px;
  padding: 0 8px;
  justify-content: space-between;

  .m-nav-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .m-back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    color: #575757;
    flex-shrink: 0;
    &:active {
      background: #f0f2f5;
    }
  }
  .m-nav-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .m-nav-right {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .m-publish-btn {
    font-size: 13px;
    padding: 0 12px;
    height: 30px;
  }
  .m-more-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
}
</style>
