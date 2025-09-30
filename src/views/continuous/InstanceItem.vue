<script setup lang="ts" name="InstanceItem">
import {useRouter} from "vue-router";
import {apiInstance, ApiUrls, createCondition, createDatetime, success, warning,} from "star-horse-lowcode";
import {PropType} from "vue";

const configUrl: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineConfig",
);
const router = useRouter();
const props = defineProps({
  nodeInfo: {
    type: Object as PropType<any>,
    default: () => {
    },
  },
  isEdit: {
    type: Number,
    default: 1, //1 编辑 2 已发布
  },
});
const execRecord = (instanceId: string) => {
  router.push({
    path: "/continuous/instanceExecRecord",
    query: {instanceId: instanceId, isEdit: props.isEdit},
  });
};
const lineDetail = (instanceId: string) => {
  router.push({
    path: "/continuous/ContinusInstanceDetail",
    query: {instanceId: instanceId, isEdit: props.isEdit},
  });
};
const execLine = () => {
  warning("执行流水线功能开发中");
};
const execNode = () => {
  warning("执行节点功能开发中");
};
const configLine = (instanceId: string) => {
  router.push({
    path: "/continuous/ContinusInstanceInit",
    query: {instanceId: instanceId, isEdit: props.isEdit},
  });
};
const publishLine = () => {
  configUrl
      .modifyColumnsAction({
        columnsInfo: {isPublished: "Y"},
        conditions: [
          createCondition(
              "idPipelineConfig",
              props.nodeInfo.idPipelineConfig,
              "eq",
          ),
        ],
      })
      .then((res) => {
        if (res?.data?.code == 0) {
          props.nodeInfo.isPublished = "Y";
          success("发布成功");
        } else {
          warning(res?.data?.cnMessage);
        }
      });
};
const loadColor = (item: any) => {
  return item.status == "SUCCESS" ?
      "var(--star-horse-success)" :
      item.status == "RUNNING" ? "var(--star-horse-warning)" :
          "var(--star-horse-default)";
};
const dynamicStyle = (item: any, index: number) => {
  let styles: any = {
    "border-color": loadColor(item),
  };
  styles["transform"] = `translate(${index * 230 + 15}px, 0)`;
  return styles;
};
const currentNodeProcess = (item: any) => {
  return {
    "background-color": !item.width ? "var(--star-horse-success)" : loadColor(item),
    width: item.width ?? "1%"
  };
};
const countHeight = () => {
  // 获取所有节点的子节点数量，找出最大值
  let maxSubNodeCount = 0;
  props.nodeInfo?.nodeList?.forEach(item => {
    const subNodeCount = item.subNodeList?.length || 0;
    if (subNodeCount > maxSubNodeCount) {
      maxSubNodeCount = subNodeCount;
    }
  });
  // 如果子节点数量超过一个，高度取150px；否则取80px
  return {height: maxSubNodeCount > 3 ? "150px" :maxSubNodeCount > 1?"130px": "80px"};
};
</script>

<template>
  <div class="instance-item">
    <div class="item-bar">
      <div class="item-bar-left">
        <span @click="execRecord(1)">{{ nodeInfo.projectName }}</span>
        <el-divider direction="vertical"/>
        <span>操作人:{{ nodeInfo.createdBy }}</span>
        <el-divider direction="vertical"/>
        <span>执行于: {{ createDatetime(nodeInfo.createdTime) }}</span>
        <el-divider direction="vertical"/>
        <span>{{ nodeInfo.dataNo }}</span>
      </div>
      <div class="item-bar-right">
        <ul class="nav_ul">
          <li>
            <el-button @click="execLine" link>
              <star-horse-icon icon-class="run" size="16px"/>
              执行
            </el-button>
          </li>
          <li v-if="'N' == nodeInfo?.isPublished">
            <el-button @click="configLine" link>
              <star-horse-icon icon-class="setting" size="16px"/>
              配置
            </el-button>
          </li>
          <li v-if="'N' == nodeInfo?.isPublished">
            <el-button @click="publishLine" link>
              <star-horse-icon icon-class="publish" size="16px"/>
              发布
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <div class="item-line" :style="countHeight()">
      <template v-for="(item, index) in nodeInfo?.nodeList" :key="index">
        <div
            @click="lineDetail"
            class="line-node"
            :style="dynamicStyle(item,index)"
        >
          <div class="node-title" :style="{'background-color': loadColor(item)}">
            <div class="flex items-center">
              <star-horse-icon
                  icon-class="check"
                  style="vertical-align: middle; "
              />&nbsp;
              <el-tooltip class="item" :content="item.nodeName" placement="top">
                <div class="flex-1 cursor-help">{{ item.nodeName }}</div>
              </el-tooltip>
            </div>
            <div>{{ item.times ?? "--" }}</div>
          </div>
          <div class="node-content" :class="{'multi-node-content': item.subNodeList?.length > 0}">
            <el-scrollbar style="height: 100px;width: 100%;" v-if="item.subNodeList?.length > 0">
              <template v-for="(subItem, subIndex) in item.subNodeList" :key="subIndex">
                <div class="line-node-item">
                  <div class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                    <el-tooltip class="item" :content="subItem.nodeName" placement="top">
                      <span class="node-item-name cursor-help">{{ subItem.nodeName }}</span>
                    </el-tooltip>
                    <!-- 使用run图标按钮 -->
                    <el-tooltip class="item" content="执行" placement="top">
                      <star-horse-icon icon-class="run" size="16px" cursor="pointer" @click="execNode(subItem)"/>
                    </el-tooltip>
                  </div>
                  <!-- 自定义进度条，显示在文字下方 -->
                  <div class="custom-progress absolute">
                    <div class="custom-progress-bar" :style="currentNodeProcess(subItem)">
                    </div>
                  </div>
                </div>
              </template>
            </el-scrollbar>
            <div class="line-node-item" v-else>
              <div class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                <el-tooltip class="item" :content="item.nodeName" placement="top">
                  <span class="node-item-name cursor-help">{{ item.nodeName }}</span>
                </el-tooltip>
                <!-- 使用run图标按钮 -->
                <el-tooltip class="item" content="执行" placement="top">
                  <star-horse-icon icon-class="run" size="16px" cursor="pointer" @click="execNode(item)"/>
                </el-tooltip>
              </div>
              <!-- 自定义进度条，显示在文字下方 -->
              <div class="custom-progress absolute">
                <div class="custom-progress-bar" :style="currentNodeProcess(item)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- 调整SVG位置和层级，确保连线回到正确的位置并显示在节点下层 -->
      <svg height="40px" width="100%" style="position: absolute; top: 10px; z-index: 0;">
        <defs></defs>
        <template v-for="(item, index) in nodeInfo?.nodeList.splice(0,nodeInfo?.nodeList.length-1)" :key="index">
          <path
              class="svg-path"
              :d="'M'+ (index * 230 + 195) +',0 H'+ (index * 230 + 245)"
              :style="{'stroke': loadColor(item)}"
          ></path>
        </template>
        <path class="svg-path"></path>
      </svg>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$bg-color: #f5f7fa;
$white: #ffffff;

.item-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0;
}

.item-bar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.item-bar-left > span:first-child {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    color: $primary-color;
  }
}

.item-bar-left > span:not(:first-child) {
  font-size: 12px;
  color: $text-secondary;
}

.nav_ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav_ul li {
  margin-left: 6px;
}

.nav_ul el-button {
  font-size: 12px;
  padding: 0 6px;
  background: transparent;
  color: $text-regular !important;
  border: none;
}

.nav_ul el-button:hover {
  color: $primary-color !important;
  background: transparent;
}

:deep(.el-divider--vertical) {
  background-color: #e4e7ed;
  width: 1px;
  height: 12px;
  margin: 0 6px;
}

// 节点样式优化
.item-line {
  position: relative;

}

.line-node {
  position: absolute;
  width: 240px;
  background: $white;
  border-radius: 6px;
  max-height: 140px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  z-index: 5;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: $primary-color;
  }
}


.node-title {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex-shrink: 0; /* 防止标题区域被压缩 */
  position: relative;
  max-width: 100%; /* 确保不超过父元素line-node */
}


.node-title > div:first-child {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  max-width: calc(100% - 30px); /* 为右侧时间留出空间 */
}

.node-title > div:last-child {
  font-size: 11px;
  color: $text-secondary;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 8px;
  min-width: 25px;
}

.node-content {
  width: 100%;
}

// 多子节点样式优化 - 优先考虑实用性
.multi-node-content {
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px; /* 调整最大高度，确保不会超出父节点 */
  overflow: hidden;
  flex: 1; /* 占据剩余空间 */
  margin: 4px auto !important; /* 轻微上移，减少不必要的空间浪费 */
  width: 98% !important;
}

/* 优化滚动条样式 */
.multi-node-content::-webkit-scrollbar {
  width: 4px;
}

.multi-node-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.multi-node-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.multi-node-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 子节点样式 - 整合定义，确保进度条显示在文字下方 */
.line-node-item {
  width: 100%;
  background: $white;
  border-radius: 3px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  clear: both;
  gap: 8px;

  &:hover {
    border-color: $primary-color;
  }
}

/* 节点头部布局 - 简化布局，优化间距 */
.node-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  position: relative;
  z-index: 10; /* 确保头部在进度条上方 */
}

/* 节点文字样式 - 增加文字显示空间 */
.node-item-name {
  flex: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 进度条样式 - 增强可见性并确保在文字下方 */
.custom-progress {
  height: 100%;
  background-color: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
  display: block;
  clear: both;
  border: 1px solid #ebeef5;
  position: absolute;
  z-index: 1; /* 确保进度条在文字的下一层 */
}

.custom-progress-bar {
  height: 100%;
  background-color: #dcdfe6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 执行中的进度条显示主色调 */
.custom-progress-bar.running {
  background-color: $primary-color;
}

/* 图标按钮样式 */
.button-icon {
  padding: 0 !important;
  width: 24px !important;
  height: 24px !important;
  min-width: auto !important;
}

/* 节点名称样式 - 保持清晰可见 */
.node-item-name {
  font-size: 12px;
  font-weight: 500;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 4px;
}


// 连接线样式
.svg-path {
  fill: none;
  stroke-width: 8px;
  stroke-linecap: round;
}

// 响应式设计
@media (max-width: 1200px) {
  .item-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .nav_ul {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
