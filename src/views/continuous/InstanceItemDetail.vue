<script setup lang="ts" name="InstanceItemDetail">
import { ref } from "vue";

const props = defineProps({
  isEdit: {
    type: Number,
    default: 1, //1 编辑 2 已发布
  },
});
const emits = defineEmits(["nodeDetail"]);
let dataSourceStatus = ref<number>(1);
let compileStatus = ref<number>(2);
const dataDetail = (type) => {
  emits("nodeDetail", type);
};
const operationAction = (type) => {
  alert(type);
};
const getStatus = (statusCode: number) => {
  switch (statusCode) {
    case 1:
      return "background:rgba(0,195,95,0.8)";
    case 2:
      return "background:rgba(239,83,91,0.9)";
    default:
      return "background:#d8d8d8";
  }
};
const showDetail = (nodeType: string, instanceId: string) => {};
const execLine = () => {
  console.log("执行");
};
const configLine = () => {};
const publishLine = () => {};
</script>
<template>
  <div class="instance-item">
    <div class="item-line overflow-hidden">
      <div class="line-node" style="transform: translate(10px, 0)">
        <div :style="getStatus(dataSourceStatus)" class="node-title">
          <div>数据源</div>
          <div>0s|成功</div>
        </div>
        <div class="node-content">
          <div @click="dataDetail('dataSource')" class="line-node-item">
            <div class="title">获取代码</div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(230px, 0)">
        <div :style="getStatus(compileStatus)" class="node-title">
          <div>编译</div>
          <div>0s|失败</div>
        </div>
        <div class="node-content">
          <div @click="dataDetail('compile')" class="line-node-item">
            <div class="title">编译</div>
            <div></div>
          </div>
        </div>
      </div>
      <div
        class="line-node multi-node"
        style="width: 228px; transform: translate(460px, 0)"
      >
        <div :style="getStatus(3)" class="node-title">
          <div>部署-扫描-单元测试</div>
          <div>0s|未执行</div>
        </div>
        <div class="node-content multi-node-content">
          <div @click="dataDetail('deploy_ci')" class="line-node-item">
            <div class="title">CI</div>
            <el-button
              @click="operationAction('deploy_ci')"
              size="small"
              style="
                background: var(--star-horse-style);
                color: var(--star-horse-white);
              "
            >
              <star-horse-icon
                icon-class="run"
                color="var(--star-horse-white)"
              />
              发起部署
            </el-button>
          </div>
          <div @click="dataDetail('deploy_test1')" class="line-node-item">
            <div class="title">Test1</div>
            <el-button
              @click="operationAction('deploy_test1')"
              size="small"
              style="
                background: var(--star-horse-style);
                color: var(--star-horse-white);
              "
            >
              <star-horse-icon
                icon-class="run"
                color="var(--star-horse-white)"
              />
              发起部署
            </el-button>
          </div>
          <div @click="dataDetail('deploy_test2')" class="line-node-item">
            <div class="title">Test2</div>
            <el-button
              @click="operationAction('deploy_test2')"
              size="small"
              style="
                background: var(--star-horse-style);
                color: var(--star-horse-white);
              "
            >
              <star-horse-icon
                icon-class="run"
                color="var(--star-horse-white)"
              />
              发起部署
            </el-button>
          </div>
          <div class="line-node-item">
            <div class="title">Sonar</div>
            <el-button text size="small">
              <star-horse-icon icon-class="reset" />
              再次执行
            </el-button>
          </div>
          <div class="line-node-item">
            <div class="title">Fortify</div>
            <el-button text size="small">
              <star-horse-icon icon-class="reset" />
              再次执行
            </el-button>
          </div>
          <div class="line-node-item">
            <div class="title">Junit</div>
            <el-button link size="small">
              <star-horse-icon icon-class="reset" />
              再次执行
            </el-button>
          </div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(738px, 0)">
        <div :style="getStatus(3)" class="node-title">
          <div>质量门禁</div>
          <div>未执行</div>
        </div>
        <div class="node-content"></div>
      </div>
      <div class="line-node" style="transform: translate(968px, 0)">
        <div :style="getStatus(3)" class="node-title">
          <div>预生产</div>
          <div>未执行</div>
        </div>
        <div class="node-content"></div>
      </div>
      <div class="line-node" style="transform: translate(1198px, 0)">
        <div :style="getStatus(3)" class="node-title">
          <div>生产</div>
          <div>未执行</div>
        </div>
        <div class="node-content"></div>
      </div>
      <svg width="100%">
        <defs></defs>
        <path
          class="svg-path"
          d="M 180,14 H230"
          style="stroke: rgb(0, 195, 95)"
        ></path>
        <path
          class="svg-path"
          d="M 400,14 H460"
          style="stroke: rgb(239, 83, 81)"
        ></path>
        <path
          class="svg-path"
          d="M 678,14 H738"
          style="stroke: rgb(204, 204, 204)"
        ></path>
        <path
          class="svg-path"
          d="M 908,14 H968"
          style="stroke: rgb(204, 204, 204)"
        ></path>
        <path
          class="svg-path"
          d="M 1138,14 H1198"
          style="stroke: rgb(204, 204, 204)"
        ></path>
        <path class="svg-path"></path>
      </svg>
    </div>
    <div class="node-detail"></div>
  </div>
</template>
<style lang="scss" scoped>
.svg-path {
  fill: none;
  stroke: #d8d8d8;
  stroke-width: 1;
}
</style>
