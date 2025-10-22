<script setup lang="ts" name="InstanceItem">
import {useRouter} from "vue-router";
import {apiInstance, ApiUrls, createCondition, createDatetime, success, warning,} from "star-horse-lowcode";
import {countHeight, currentNodeProcess, dynamicStyle, loadColor} from "@/views/continuous/utils/ToolsParams";
import {PropType} from "vue";
import {execLine, execNode} from "@/views/continuous/utils/PipelinetCfg.js";

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
  instanceInfo: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  isEdit: {
    type: Number,
    default: 1, //1 编辑 2 已发布
  },
  type: {
    type: String,
    default: "list", //list 列表详情 detail 详情 record 执行记录
  },
  showHeaderBar: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["selectNode"]);
const execRecord = () => {
  if (props.type == "record") {
    lineDetail();
  } else if (props.type == "list") {
    router.push({
      path: "/execRecord",
      query: {configId: props.nodeInfo.idPipelineConfig, isEdit: props.isEdit},
    });
  }

};
const lineDetail = () => {
  router.push({
    path: "/continuous/ContinusInstanceDetail",
    query: {
      configId: props.nodeInfo.idPipelineConfig,
      isEdit: props.isEdit,
      instanceId: props.instanceInfo?.idPipelineInstance
    },
  });
};

const configLine = () => {
  router.push({
    path: "/continuous/ContinusInstanceInit",
    query: {configId: props.nodeInfo.idPipelineConfig, isEdit: props.isEdit},
  });
};
const publishLine = () => {
  configUrl?.modifyColumnsAction({
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
const selectNode = (item: any) => {
  emits("selectNode", item);
};
/**
 *
 * @param item 节点信息
 * @returns 节点执行记录
 */
const getExecNode = (item: any) => {
  return props.instanceInfo.nodeExecRecords?.find((node: any) => node.nodeId == item.idNodeInfo);
};
</script>

<template>
  <div class="instance-item" :style="{
      border:'2px solid',
      borderColor: loadColor(instanceInfo),
    }">
    <div class="item-bar" v-if="showHeaderBar">
      <div class="item-bar-left items-center">
        <div class="flex items-center cursor-pointer" @click="execRecord(1)">
          <star-horse-icon icon-class="document" size="16px"/>
          {{ nodeInfo.lineName||nodeInfo.projectName }}
        </div>
        <el-divider direction="vertical" style="border:1px solid var(--star-horse-style)"/>
        <div class="flex items-center cursor-pointer">操作人:{{ instanceInfo?.createdBy || nodeInfo.createdBy }}</div>
        <el-divider direction="vertical" style="border:1px solid var(--star-horse-style)"/>
        <div class="flex items-center cursor-pointer">执行于: {{ createDatetime(instanceInfo?.createdTime) }}</div>
        <el-divider direction="vertical" style="border:1px solid var(--star-horse-style)"/>
        <div class="flex items-center cursor-pointer">总耗时：{{ instanceInfo.totalTimes || 0 }}s</div>
        <el-divider direction="vertical" style="border:1px solid var(--star-horse-style)"/>
        <div class="flex items-center cursor-pointer">#{{ instanceInfo.dataIndex || 0 }}</div>
      </div>
      <div class="item-bar-right">
        <ul class="nav_ul">
          <li v-if="!['detail','record'].includes(type)">
            <el-button @click="execLine(nodeInfo.idPipelineConfig, 'execPipeline')" link>
              <star-horse-icon icon-class="run" size="16px"/>
              执行
            </el-button>
          </li>
          <template v-if="Object.keys(instanceInfo||{}).length==0">
            <el-divider direction="vertical" style="border:1px solid var(--star-horse-style)"/>
            <li>
              <el-button @click="configLine" link>
                <star-horse-icon icon-class="setting" size="16px"/>
                配置
              </el-button>
            </li>
            <el-divider direction="vertical" v-if="'N' == nodeInfo?.isPublished"
                        style="border:1px solid var(--star-horse-style)"/>
            <li v-if="'N' == nodeInfo?.isPublished">
              <el-button @click="publishLine" link>
                <star-horse-icon icon-class="publish" size="16px"/>
                发布
              </el-button>
            </li>
          </template>
        </ul>
      </div>
    </div>
    <div class="item-line" :style="countHeight(nodeInfo)">
      <template v-for="(item, index) in nodeInfo?.nodeList" :key="index">
        <div @click="lineDetail" class="line-node" :style="dynamicStyle(item, index)">
          <div class="node-title" :style="{ 'background-color': loadColor(getExecNode(item)) }">
            <div class="flex items-center">
              <star-horse-icon icon-class="check" style="vertical-align: middle; "/>&nbsp;
              <el-tooltip class="item" :content="item.nodeName" placement="top">
                <div class="flex-1 cursor-pointer">{{ item.nodeName }}</div>
              </el-tooltip>
            </div>
            <div>{{ getExecNode(item)?.totalTimes ?? "0" }}s|{{ getExecNode(item)?.execStatus }}</div>
          </div>
          <div class="node-content" :class="{ 'multi-node-content': item.subNodeInfoList?.length > 0 }">
            <el-scrollbar style="height: 100px;width: 100%;">
              <div @click.stop="selectNode(item)" class="line-node-item">
                <div class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                  <el-tooltip class="item" :content="item.nodeName" placement="top">
                    <span class="node-item-name cursor-pointer">{{ item.nodeName }}</span>
                  </el-tooltip>
                  <!-- 使用run图标按钮 -->
                  <el-tooltip class="item" content="执行" placement="top"
                              v-if="item.nodeTriggerCondition == 'manual'||getExecNode(item)?.execStatus == 'FAILURE'">
                    <star-horse-icon icon-class="run" size="16px" cursor="pointer"
                                     @click.stop="execNode(item,instanceInfo,'execNode')"/>
                  </el-tooltip>
                </div>
                <!-- 自定义进度条，显示在文字下方 -->
                <div class="custom-progress absolute">
                  <div class="custom-progress-bar" :style="currentNodeProcess(getExecNode(item))">
                  </div>
                </div>
              </div>
              <template :key="subIndex" v-for="(subItem, subIndex) in item.subNodeInfoList">
                <div class="line-node-item" >
                  <div @click.stop="selectNode(subItem)"
                       class="node-item-header flex justify-between items-center absolute z-10 w-full ">
                    <el-tooltip class="item" :content="subItem.nodeName" placement="top">
                      <span class="node-item-name cursor-pointer">{{ subItem.nodeName }}</span>
                    </el-tooltip>
                    <!-- 使用run图标按钮 -->
                    <el-tooltip class="item" content="执行" placement="top"
                                v-if="subItem.nodeTriggerCondition == 'manual'||getExecNode(subItem)?.execStatus == 'FAILURE'">
                      <star-horse-icon icon-class="run" size="16px" cursor="pointer"
                                       @click.stop="execNode(subItem,instanceInfo,'execNode')"/>
                    </el-tooltip>
                  </div>
                  <!-- 自定义进度条，显示在文字下方 -->
                  <div class="custom-progress absolute">
                    <div class="custom-progress-bar" :style="currentNodeProcess(getExecNode(subItem))">
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
        <template v-for="(item, index) in nodeInfo?.nodeList?.slice(0, nodeInfo?.nodeList.length - 1)" :key="index">
          <path class="svg-path" :d="'M' + (index * 280 + 200) + ',0 H' + (index * 280 + 300)"
                :style="{ 'stroke': loadColor(getExecNode(item)) }"></path>
        </template>
        <path class="svg-path"></path>
      </svg>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
