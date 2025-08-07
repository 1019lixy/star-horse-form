<script setup lang="ts" name="InstanceItem">
import { useRouter } from "vue-router";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createDatetime,
  success,
  warning,
} from "star-horse-lowcode";
import { PropType } from "vue";

const configUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/pipelineConfig",
);
const router = useRouter();
const props = defineProps({
  nodeInfo: {
    type: Object as PropType<any>,
    default: () => {},
  },
  isEdit: {
    type: Number,
    default: 1, //1 编辑 2 已发布
  },
});
const execRecord = (instanceId: string) => {
  router.push({
    path: "/continuous/instanceExecRecord",
    query: { instanceId: instanceId, isEdit: props.isEdit },
  });
};
const lineDetail = (instanceId: string) => {
  router.push({
    path: "/continuous/ContinusInstanceDetail",
    query: { instanceId: instanceId, isEdit: props.isEdit },
  });
};
const execLine = () => {
  console.log("执行");
};
const configLine = (instanceId: string) => {
  router.push({
    path: "/continuous/ContinusInstanceInit",
    query: { instanceId: instanceId, isEdit: props.isEdit },
  });
};
const publishLine = () => {
  configUrl
    .modifyColumnsAction({
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
    <div class="item-bar">
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
          <li v-if="'N' == nodeInfo?.isPublished">
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
    <div class="item-line">
      <div
        @click="lineDetail"
        class="line-node"
        style="transform: translate(15px, 0)"
      >
        <div class="node-title">
          <div class="flex items-center">
            <star-horse-icon
              icon-class="database"
              style="color: #f56c6c"
            />&nbsp;&nbsp;数据源
          </div>
          <div>0s</div>
        </div>
        <div class="node-content">
          <el-popover :width="200" trigger="hover">
            <el-button class="button" size="small" text>数据源</el-button>
            <div class="success">成功</div>
            <template #reference>
              <el-progress
                class="w-full"
                :stroke-width="16"
                :text-inside="true"
                percentage="50"
                status="exception"
              />
            </template>
          </el-popover>
        </div>
      </div>
      <div class="line-node" style="transform: translate(245px, 0)">
        <div class="node-title">
          <div class="flex items-center">
            <star-horse-icon
              icon-class="compile"
              style="vertical-align: middle; color: #5cb87a"
            />&nbsp;&nbsp;编译
          </div>
          <div>10s</div>
        </div>
        <div class="node-content">
          <el-popover
            :popper-style="{ width: 'unset !important' }"
            trigger="hover"
          >
            <el-button class="button" size="small" text>编译</el-button>
            <div class="success">成功</div>
            <template #reference>
              <el-progress
                class="w-full"
                :stroke-width="22"
                :text-inside="true"
                percentage="100"
                status="success"
              />
            </template>
          </el-popover>
        </div>
      </div>
      <div
        class="line-node"
        style="width: 228px; transform: translate(475px, 0)"
      >
        <div class="node-title">
          <div class="flex items-center">
            <star-horse-icon
              icon-class="check"
              style="vertical-align: middle; color: #5cb87a"
            />&nbsp;&nbsp;部署-扫描-单元测试
          </div>
          <div>10s</div>
        </div>
        <div class="node-content multi-node-content">
          <div class="line-node-item">
            <el-popover
              :popper-style="{ width: 'unset !important' }"
              trigger="hover"
            >
              <el-button class="button" text>CI</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="small">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress
                  class="w-full"
                  :stroke-width="22"
                  :text-inside="true"
                  percentage="0"
                />
              </template>
            </el-popover>
          </div>
          <div class="line-node-item">
            <el-popover
              :popper-style="{ width: 'unset !important' }"
              trigger="hover"
            >
              <el-button class="button" text>Test-1</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="small">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress
                  class="w-full"
                  :stroke-width="22"
                  :text-inside="true"
                  percentage="0"
                />
              </template>
            </el-popover>
          </div>
          <div class="line-node-item">
            <el-popover
              :popper-style="{ width: 'unset !important' }"
              trigger="hover"
            >
              <el-button class="button" text>Test-2</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="small">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress
                  class="w-full"
                  :stroke-width="22"
                  :text-inside="true"
                  percentage="0"
                />
              </template>
            </el-popover>
          </div>
          <div class="line-node-item">
            <el-popover
              :popper-style="{ width: 'unset !important' }"
              trigger="hover"
            >
              <el-button class="button" text>Test-3</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="small">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress
                  class="w-full"
                  :stroke-width="22"
                  :text-inside="true"
                  percentage="0"
                />
              </template>
            </el-popover>
          </div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(753px, 0)"></div>
      <div class="line-node" style="transform: translate(983px, 0)"></div>
      <div class="line-node" style="transform: translate(1213px, 0)"></div>
      <svg height="110px" width="100%">
        <defs></defs>
        <path
          class="svg-path"
          d="M 195,14 H245"
          style="stroke: rgb(0, 195, 95)"
        ></path>
        <path
          class="svg-path"
          d="M 425,14 H475"
          style="stroke: rgb(0, 195, 95)"
        ></path>
        <path
          class="svg-path"
          d="M 693,14 H753"
          style="stroke: rgb(0, 195, 95)"
        ></path>
        <path
          class="svg-path"
          d="M 933,14 H983"
          style="stroke: rgb(239, 83, 81)"
        ></path>
        <path
          class="svg-path"
          d="M 1163,14 H1213"
          style="stroke: rgb(204, 204, 204)"
        ></path>
        <path class="svg-path"></path>
      </svg>
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-progress-bar__outer) {
  border-radius: 0;
}

:deep(.el-progress-bar__inner) {
  border-radius: 0;
}

.el-card__header {
  padding: 5px;
  box-sizing: border-box;
}

.svg-path {
  fill: none;
  stroke: #d8d8d8;
  stroke-width: 1;
}
</style>
