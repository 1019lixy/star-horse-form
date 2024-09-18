<script setup lang="ts" name="InstanceItem">
import {useRouter} from "vue-router";

const router = useRouter();
const props = defineProps({
  isEdit: {
    type: Number,
    default: 1 //1 编辑 2 已发布
  }
});
const execRecord = (instanceId: string) => {
  this.$router.push({
    path: "/continus/instanceExecRecord",
    query: {instanceId: instanceId, isEdit: props.isEdit}
  })
};
const lineDetail = (instanceId: string) => {
  router.push({
    path: "/continus/instanceDetail",
    query: {instanceId: instanceId, isEdit: props.isEdit}
  })
};
</script>
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

.instance-item {
  box-shadow: rgb(232, 232, 232) 0px 0px 0px 1px;
  background: var(--star-horse-white);
  transition: all 0.5s linear 0s;

  .item-line {
    height: inherit;
    padding-bottom: 0px;

    .line-node {
      cursor: pointer;

      .node-content {
        margin: 10px 1px;
        width: 100%;
        display: table;

        .node-process {
          display: table-cell;
        }
      }
    }
  }
}

.svg-path {
  fill: none;
  stroke: #d8d8d8;
  stroke-width: 1;
}
</style>
<template>
  <div class="instance-item">
    <div class="item-bar">
      <div class="item-bar-left">
        <span @click="execRecord(1)">starhorse-continus-01</span>
        <el-divider direction="vertical"/>
        <span>操作人:</span>
        <el-divider direction="vertical"/>
        <span>执行于: 2022-11-25 11:00:00</span>
        <el-divider direction="vertical"/>
        <span>#71992</span>
      </div>
      <div class="item-bar-right">
        <el-button @click="execLine(1)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="fa-circle-play"/>
          <el-tooltip content="执行">执行</el-tooltip>
        </el-button>
        <el-button @click="configLine(1)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="fa-gear"/>
          <el-tooltip content="配置">配置</el-tooltip>
        </el-button>
        <el-button @click="publishLine(1)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="fa-gear"/>
          <el-tooltip content="发布">发布</el-tooltip>
        </el-button>
      </div>
    </div>
    <div class="item-line">
      <div @click="lineDetail(1)" class="line-node" style="transform: translate(15px,14px);">
        <div class=" node-title ">
          <span><star-horse-icon icon-class="fa-circle-xmark"
                                 style="vertical-align: middle;color: #f56c6c;"/>&nbsp;&nbsp;数据源</span>
          <span>0s</span>
        </div>
        <div class="node-content">
          <el-popover
              :width="200"
              trigger="hover">
            <el-button class="button" text>数据源</el-button>
            <div class="success">成功</div>
            <template #reference>
              <el-progress :stroke-width="16" :text-inside="true" percentage="50" status="exception"/>
            </template>
          </el-popover>
        </div>
      </div>
      <div class="line-node" style="transform: translate(245px,14px)">
        <div class="node-title"><span><star-horse-icon icon-class="fa-circle-check"
                                                       style="vertical-align: middle;color: #5cb87a;"/>&nbsp;&nbsp;编译</span>
          <span>10s</span>
        </div>
        <div class="node-content">
          <el-popover
              :popper-style="{width: 'unset !important'}"
              trigger="hover">
            <el-button class="button" text>编译</el-button>
            <div class="success">成功</div>
            <template #reference>
              <el-progress :stroke-width="16" :text-inside="true" percentage="100" status="success"/>
            </template>
          </el-popover>
        </div>
      </div>
      <div class="line-node" style="width:228px;transform: translate(475px,14px)">
        <div class="node-title"><span><star-horse-icon icon-class="fa-circle-check"
                                                       style="vertical-align: middle;color: #5cb87a;"/>&nbsp;&nbsp;部署-扫描-单元测试</span>
          <span>10s</span>
        </div>
        <div class="node-content">
          <div class="node-process">
            <el-popover
                :popper-style="{width: 'unset !important'}"
                trigger="hover">
              <el-button class="button" text>CI</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="mini">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress :stroke-width="16" :text-inside="true" percentage="0"/>
              </template>
            </el-popover>
          </div>
          <div class="node-process">
            <el-popover
                :popper-style="{width: 'unset !important'}"
                trigger="hover">
              <el-button class="button" text>Test-1</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="mini">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress :stroke-width="16" :text-inside="true" percentage="0"/>
              </template>
            </el-popover>
          </div>
          <div class="node-process">
            <el-popover
                :popper-style="{width: 'unset !important'}"
                trigger="hover">
              <el-button class="button" text>Test-2</el-button>
              <div class="info">
                <span>未执行</span>
                <el-button class="button" size="mini">发起部署</el-button>
              </div>
              <template #reference>
                <el-progress :stroke-width="16" :text-inside="true" percentage="0"/>
              </template>
            </el-popover>
          </div>
        </div>
      </div>
      <div class="line-node" style="transform: translate(753px,14px)"></div>
      <div class="line-node" style="transform: translate(983px,14px)"></div>
      <div class="line-node" style="transform: translate(1213px,14px)"></div>
      <svg height="110px" width="100%">
        <defs></defs>
        <path class="svg-path" d="M 195,28 H245" style="stroke:rgb(0,195,95);"></path>
        <path class="svg-path" d="M 425,28 H475" style="stroke:rgb(0,195,95);"></path>
        <path class="svg-path" d="M 693,28 H753" style="stroke:rgb(0,195,95);"></path>
        <path class="svg-path" d="M 933,28 H983" style="stroke:rgb(239,83,81);"></path>
        <path class="svg-path" d="M 1163,28 H1213" style="stroke:rgb(204,204,204);"></path>
        <path class="svg-path"></path>
      </svg>
    </div>
  </div>
</template>
