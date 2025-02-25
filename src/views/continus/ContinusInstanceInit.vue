<script setup lang="ts" name="ContinusInstanceInit">
import {onMounted, ref} from "vue";
import ToolInfo from "@/views/continus/ToolInfo.vue";
import DeployTemplate from "@/views/continus/DeployTemplate.vue";
import {warning} from "@/utils/message.ts";

const nodeCompRef = ref<any>();
const toolInfoRef = ref<any>();
const tempDialog = ref<boolean>(false);
const nodeDialog = ref<boolean>(false);
const currentNode = ref<number>(-1);
let currentCompName = ref<string>("PipelineCfg");

const processList = ref<any>([
  {name: "编译", value: "BuildCfg"},
  {name: "合规", value: "AuditCfg"},
  {name: "Sql审核", value: "SqlAuditCfg"},
  {name: "质量门禁", value: "InspectCfg"},
  {name: "PRD", value: "DeployCfg"}
]);


const changeTemplate = () => {
  tempDialog.value = !tempDialog.value;
};
const addNode = (currentIndex: number) => {
  currentNode.value = currentIndex;
  addSubNode();
};
const editNode = (compName: string, currentIndex: number) => {
  currentCompName.value = compName;
  currentNode.value = currentIndex;
};
const addSubNode = () => {
  nodeDialog.value = true;
};
const closeAction = () => {
  nodeDialog.value = false;
}
const dataSubmit = () => {
  let node = toolInfoRef.value.getNode();
  if (!node) {
    warning("请先选择要配置的节点");
    return;
  }
  let index = currentNode.value == -1 ? processList.value.length : currentNode.value;
  processList.value.splice(index, 0, {name: node.name, value: node.code});
  closeAction();
}
const init = async () => {

}
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog :title="'节点列表'" :dialogVisible="nodeDialog" :self-func="true" @closeAction="closeAction"
                     @merge="dataSubmit" :is-batch="false" :is-show-btn-continue="false">
    <ToolInfo ref="toolInfoRef"/>
  </star-horse-dialog>
  <star-horse-dialog :title="'更换模板'" :dialogVisible="tempDialog">
    <deploy-template/>
  </star-horse-dialog>

  <el-card class="inner_content">
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <span>xxxx-----</span>
        <span style="width: 40px;"></span>
        <span>当前模板：XXX</span>&nbsp;&nbsp;
        <el-button @click="changeTemplate" link>
          <star-horse-icon icon-class="transfer" style="vertical-align: middle;"/>
          更换模板
        </el-button>
      </div>
      <div class="nav-bar-right">
        <el-button style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="save" color="white"/>
          保存并启用
        </el-button>
        <el-button>
          <star-horse-icon icon-class="save"/>
          保存并执行
        </el-button>
      </div>
    </div>
    <div class="pipeline-nav">
      <div class="nav">
        <div :class="{'is-active':-1==currentNode}" @click="editNode('PipelineCfg',-1)" class="nav-setting nav-panel">
          <star-horse-icon icon-class="setting" :style="{'vertical-align': 'middle',
            color:-1==currentNode? 'var(--star-horse-white)':'var(--star-horse-style)'}"/>
          流水线配置
        </div>
        <div class="nav-line"></div>
        <div class="start_end">开始</div>
        <div class="nav-nodes">
          <div class="node-content" v-for="(item,index) in processList">
            <div class="step">
              <i class="icon node-arrow">
                <star-horse-icon icon-class="arrow-double-right" />
              </i>
              <i @click="addNode(index)" class="icon node-add">
                <el-tooltip content="插入节点">
                  <star-horse-icon icon-class="add" />
                </el-tooltip>
              </i>
            </div>
            <div :class="{'is-active':index==currentNode}" @click="editNode(item.value,index)" class="nav-panel">
                        <span class="label text-overflow">{{ item.name }}
                           <i class="icon pright"><star-horse-icon icon-class="close"
                                                                   :style="{'vertical-align': 'middle',
                                                                   color:index==currentNode? 'var(--star-horse-white)':'var(--star-horse-style)'}"/></i>
                        </span>
            </div>
          </div>
        </div>
        <div class="step">
          <i class="icon node-arrow">
            <star-horse-icon icon-class="arrow-double-right" style="vertical-align: middle;"/>
          </i>
          <i @click="addNode(processList.length)" class="icon node-add">
            <el-tooltip content="插入节点">
              <star-horse-icon icon-class="add" style="vertical-align: middle;"/>
            </el-tooltip>
          </i>
        </div>
        <div class="start_end">结束</div>
        <el-button @click="addNode(-1)" class="init-btn" text>
          <star-horse-icon icon-class="add" style="vertical-align: middle;"/>
          添加节点
        </el-button>
      </div>
    </div>
    <div class="config-content">
      <keep-alive>
        <component :is="currentCompName" ref="nodeCompRef"/>
      </keep-alive>
    </div>
  </el-card>
</template>
<style lang="scss" scoped>
.config-content {
  flex: 1;
  overflow: hidden;
}

.config-nav-bar {
  display: flex;
  justify-content: space-between; // 左右分散对齐
  align-items: center;
  padding: 10px 0;
  .nav-bar-left {
    display: flex;
    align-items: center;
    gap: 20px; // 添加间隙
  }

  .nav-bar-right {
    justify-items: right;
    align-items: center;
    text-align: center;
  }
}

.pipeline-nav {
  display: block;
  margin: 15px 0;
  position: relative;
  min-width: 1200px; // 添加最小宽度


  .icon {
    font-style: normal;
    text-align: center;
    line-height: 0;
    color: #e8e8e8;
    display: inline-block;
    align-items: center;
    margin: 0 5px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    &.node-add, &.node-arrow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e8e8e8;
    }
  }

  .pright {
    color: #e8e8e8;
    cursor: pointer;
    font-size: 16px;
    right: 3px;
    top: 2px;
    display: none;
    position: absolute;
  }

  .nav-panel {
    background: var(--star-horse-background);
    border: 1px solid #dadada;
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .04);
    cursor: pointer;
    font-size: 14px;
    height: 40px;
    line-height: 40px;

    position: relative;
    text-align: center;
    flex-shrink: 0; // 禁止面板缩小
    width: 140px; // 加宽面板

    .label {
      display: block;
      width: 110px;
    }

    &:hover .pright {
      display: block;
    }

    .text-overflow {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .nav-panel.is-active {
    background: var(--star-horse-style);
    border: 1px solid var(--star-horse-style);
    box-shadow: none;
    color: var(--star-horse-white) !important;
    &:after {
      border: 9px solid transparent;
      border-top-color: var(--star-horse-style);
      content: "";
      height: 0;
      left: 47px;
      position: absolute;
      top: 100%;
      width: 0;
    }
  }
  .step {
    flex-shrink: 0;
    position: relative;
    text-align: center;
    width: 40px;
    display: flex;
    align-items: center;
    .node-add {
      cursor: pointer;
      display: none;
      color: var(--star-horse-style);
      font-size: 16px;

    }

    .node-arrow {
      cursor: pointer;
      font-size: 16px;
      align-items: center;
      display: flex;
    }

    &:hover .node-arrow {
      display: none;
    }

    &:hover .node-add {
      display: block;
    }

    &:before {
      left: 0;
    }

    &:after {
      right: 0;
    }

    &:after, &:before {
      background-color: #e8e8e8;
      content: "";
      height: 1px;
      position: absolute;
      top: 50%;
      width: 10px;
    }
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    flex-wrap: nowrap; // 禁止换行
    overflow-x: auto;

    .nav-setting {
      align-items: center;
      color: #383838;
      display: flex;
      margin-left: 5px;
      justify-content: center;
    }

    .nav-line {
      background-color: #dadada;
      height: 52px;
      margin: 0 20px;
      width: 1px;
    }

    .start_end {
      border: 1px solid #e8e8e8;
      border-radius: 100%;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .04);
      color: #898989;
      flex-shrink: 0;
      font-size: 12px;
      height: 44px;
      width: 44px;
      line-height: 44px;
      text-align: center;
      vertical-align: middle;
    }

    .init-btn {
      margin-left: 20px;
      background: 0 0;
      color: var(--star-horse-style);
      padding-left: 0;
      padding-right: 0;

      &:hover {
        background-color: transparent;
        -webkit-box-shadow: none;
        box-shadow: none;
      }
    }

    .nav-nodes {
      align-items: center;
      display: flex;

      .node-content {
        align-items: center;
        display: flex;
        gap: 8px; // 添加节点间隙
      }
    }
  }
}
</style>
