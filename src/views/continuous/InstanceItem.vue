<script setup lang="ts" name="InstanceItem">
import { useRouter } from "vue-router";
import { apiInstance, ApiUrls, createCondition, createDatetime, success, warning, } from "star-horse-lowcode";
import { countHeight, currentNodeProcess, dynamicStyle, loadColor } from "@/views/continuous/utils/ToolsParams";
import { PropType } from "vue";

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
  showHeaderBar: {
    type: Boolean,
    default: true,
  },
});
const execRecord = () => {
  router.push({
    path: `/execRecord`,
    query: { configId: props.nodeInfo.idPipelineConfig, isEdit: props.isEdit },
  });
};
const lineDetail = () => {
  router.push({
    path: "/continuous/ContinusInstanceDetail",
    query: { configId: props.nodeInfo.idPipelineConfig,isEdit: props.isEdit },
  });
};
const execLine = () => {
  warning("执行流水线功能开发中");
};
const execNode = () => {
  warning("执行节点功能开发中");
};
const configLine = () => {
  router.push({
    path: "/continuous/ContinusInstanceInit",
    query: { configId: props.nodeInfo.idPipelineConfig, isEdit: props.isEdit },
  });
};
const publishLine = () => {
  configUrl?.modifyColumnsAction({
      columnsInfo: { isPublished: "Y" },
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


</script>

<template>
  <div class="instance-item">
    <div class="item-bar" v-if="showHeaderBar">
      <div class="item-bar-left">
        <span @click="execRecord(1)">{{ nodeInfo.projectName }}</span>
        <el-divider direction="vertical" />
        <span>操作人:{{ nodeInfo.createdBy }}</span>
        <el-divider direction="vertical" />
        <span>执行于: {{ createDatetime(nodeInfo.createdTime) }}</span>
        <el-divider direction="vertical" />
        <span>{{ nodeInfo.dataNo }}</span>
      </div>
      <div class="item-bar-right">
        <ul class="nav_ul">
          <li>
            <el-button @click="execLine" link>
              <star-horse-icon icon-class="run" size="16px" />
              执行
            </el-button>
          </li>
          <li >
            <el-button @click="configLine" link>
              <star-horse-icon icon-class="setting" size="16px" />
              配置
            </el-button>
          </li>
          <li v-if="'N' == nodeInfo?.isPublished">
            <el-button @click="publishLine" link>
              <star-horse-icon icon-class="publish" size="16px" />
              发布
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <div class="item-line" :style="countHeight(nodeInfo)">
        <template v-for="(item, index) in nodeInfo?.nodeList" :key="index">
          <div @click="lineDetail" class="line-node" :style="dynamicStyle(item, index)">
            <div class="node-title" :style="{ 'background-color': loadColor(item) }">
              <div class="flex items-center">
                <star-horse-icon icon-class="check" style="vertical-align: middle; " />&nbsp;
                <el-tooltip class="item" :content="item.nodeName" placement="top">
                  <div class="flex-1 cursor-help">{{ item.nodeName }}</div>
                </el-tooltip>
              </div>
              <div>{{ item.times ?? "0" }}s|未执行</div>
            </div>
            <div class="node-content" :class="{ 'multi-node-content': item.subNodeInfoList?.length > 0 }">
              <el-scrollbar style="height: 100px;width: 100%;" >
                <div class="line-node-item">
                  <div class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                    <el-tooltip class="item" :content="item.nodeName" placement="top">
                      <span class="node-item-name cursor-help">{{ item.nodeName }}</span>
                    </el-tooltip>
                    <!-- 使用run图标按钮 -->
                    <el-tooltip class="item" content="执行" placement="top">
                      <star-horse-icon icon-class="run" size="16px" cursor="pointer" @click="execNode(item)" />
                    </el-tooltip>
                  </div>
                  <!-- 自定义进度条，显示在文字下方 -->
                  <div class="custom-progress absolute">
                    <div class="custom-progress-bar" :style="currentNodeProcess(item)">
                    </div>
                  </div>
                </div>
                <template v-for="(subItem, subIndex) in item.subNodeInfoList" :key="subIndex" >
                  <div class="line-node-item">
                    <div class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                      <el-tooltip class="item" :content="subItem.nodeName" placement="top">
                        <span class="node-item-name cursor-help">{{ subItem.nodeName }}</span>
                      </el-tooltip>
                      <!-- 使用run图标按钮 -->
                      <el-tooltip class="item" content="执行" placement="top">
                        <star-horse-icon icon-class="run" size="16px" cursor="pointer" @click="execNode(subItem)" />
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

            </div>
          </div>
        </template>
        <!-- 调整SVG位置和层级，确保连线回到正确的位置并显示在节点下层 -->
        <svg height="40px" width="100%" style="position: absolute; top: 10px; z-index: 0;">
          <defs></defs>
          <template v-for="(item, index) in nodeInfo?.nodeList.slice(0, nodeInfo?.nodeList.length - 1)" :key="index">
            <path class="svg-path" :d="'M' + (index * 280 + 230) + ',0 H' + (index * 280 + 300)"
              :style="{ 'stroke': loadColor(item) }"></path>
          </template>
          <path class="svg-path"></path>
        </svg>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
