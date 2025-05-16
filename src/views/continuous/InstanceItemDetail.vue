<script setup lang="ts" name="InstanceItemDetail">
import {ref} from "vue";

const props = defineProps({
  isEdit: {
    type: Number,
    default: 1 //1 编辑 2 已发布
  }
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
const showDetail = (nodeType: string, instanceId: string) => {
};
const execLine = () => {
  console.log("执行");
};
const configLine = () => {
};
const publishLine = () => {
};
</script>
<style lang="scss" scoped>
.svg-path {
  fill: none;
  stroke: #d8d8d8;
  stroke-width: 1;
}
</style>
<template>
  <div class="instance-item">
    <div class="item-bar" v-show="false">
      <div class="item-bar-left">
        <span>starhorse-continuous-01</span>
        <el-divider direction="vertical"/>
        <span>操作人:</span>
        <el-divider direction="vertical"/>
        <span>执行于: 2022-11-25 11:00:00</span>
        <el-divider direction="vertical"/>
        <span>#71992</span>
      </div>
      <div class="item-bar-right">
        <el-button
            @click="execLine"
            link
            title=""
            style="background: var(--star-horse-style); color: var(--star-horse-white)"
        >
          <star-horse-icon icon-class="fa-circle-play"/>
          <el-tooltip content="执行">执行</el-tooltip>
        </el-button>
        <el-button
            @click="configLine"
            link
            title=""
            style="background: var(--star-horse-style); color: var(--star-horse-white)"
        >
          <star-horse-icon icon-class="fa-gear"/>
          <el-tooltip content="配置">配置</el-tooltip>
        </el-button>
        <el-button
            @click="publishLine"
            link
            title=""
            style="background: var(--star-horse-style); color: var(--star-horse-white)"
        >
          <star-horse-icon icon-class="fa-gear"/>
          <el-tooltip content="发布">发布</el-tooltip>
        </el-button>
      </div>
    </div>
    <el-card class="item-line">
      <div class="line-node" style="transform: translate(10px, 14px)">
        <div :style="getStatus(dataSourceStatus)" class="node-title">
          <span>数据源</span>
          <span>0s|成功</span>
        </div>
        <div class="node-content">
          <div @click="dataDetail('dataSource')" class="line-node-item">
            <span class="title">获取代码</span>
            <div></div>
          </div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(230px, 14px)">
        <div :style="getStatus(compileStatus)" class="node-title">
          <span>编译</span>
          <span>0s|成功</span>
        </div>
        <div class="node-content">
          <div @click="dataDetail('compile')" class="line-node-item">
            <span class="title">编译</span>
            <div></div>
          </div>
        </div>
      </div>
      <div class="line-node" style="width: 228px; transform: translate(460px, 14px)">
        <div class="node-title">
          <span>部署-扫描-单元测试</span>
          <span>0s|成功</span>
        </div>
        <div class="node-content">
          <div @click="dataDetail('deploy_ci')" class="line-node-item">
            <span class="title">CI</span>
            <el-button
                @click="operationAction('deploy_ci')"
                size="mini"
                style="background: var(--star-horse-style); color: var(--star-horse-white)"
            >发起部署
            </el-button>
          </div>
          <div @click="dataDetail('deploy_test1')" class="line-node-item">
            <span class="title">Test1</span>
            <el-button
                @click="operationAction('deploy_test1')"
                size="mini"
                style="background: var(--star-horse-style); color: var(--star-horse-white)"
            >发起部署
            </el-button>
          </div>
          <div @click="dataDetail('deploy_test2')" class="line-node-item">
            <span class="title">Test2</span>
            <el-button
                @click="operationAction('deploy_test2')"
                size="mini"
                style="background: var(--star-horse-style); color: var(--star-horse-white)"
            >发起部署
            </el-button>
          </div>
          <div class="line-node-item">
            <span class="title">Sonar</span>
            <el-button link>
              <el-tooltip content="再次执行">
                <star-horse-icon icon-class="fa-rotate-right"/>
              </el-tooltip>
            </el-button>
          </div>
          <div class="line-node-item">
            <span class="title">Fortify</span>
            <el-button link>
              <el-tooltip content="再次执行">
                <star-horse-icon icon-class="fa-rotate-right"/>
              </el-tooltip>
            </el-button>
          </div>
          <div class="line-node-item">
            <span class="title">Junit</span>
            <el-button link>
              <el-tooltip content="再次执行">
                <star-horse-icon icon-class="fa-rotate-right"/>
              </el-tooltip>
            </el-button>
          </div>
          <div style="height: 30px"></div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(738px, 14px)">
        <div class="node-title">
          <span>质量门禁</span>
          <span>未执行</span>
        </div>
        <div class="node-content"></div>
      </div>
      <div class="line-node" style="transform: translate(968px, 14px)">
        <div class="node-title">
          <span>预生产</span>
          <span>未执行</span>
        </div>
        <div class="node-content"></div>
      </div>
      <div class="line-node" style="transform: translate(1198px, 14px)">
        <div class="node-title">
          <span>生产</span>
          <span>未执行</span>
        </div>
        <div class="node-content"></div>
      </div>
      <svg height="110px" width="100%">
        <defs></defs>
        <path class="svg-path" d="M 170,28 H210" style="stroke: rgb(0, 195, 95)"></path>
        <path class="svg-path" d="M 390,28 H440" style="stroke: rgb(239, 83, 81)"></path>
        <path class="svg-path" d="M 668,28 H718" style="stroke: rgb(204, 204, 204)"></path>
        <path class="svg-path" d="M 898,28 H948" style="stroke: rgb(204, 204, 204)"></path>
        <path class="svg-path" d="M 1128,28 H1178" style="stroke: rgb(204, 204, 204)"></path>
        <path class="svg-path"></path>
      </svg>
    </el-card>
    <div class="node-detail"></div>
  </div>
</template>
