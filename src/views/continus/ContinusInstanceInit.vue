<script setup lang="ts" name="ContinusInstanceInit">
  import { computed, nextTick, onMounted, ref } from "vue";
  import ToolInfo from "@/views/continus/ToolInfo.vue";
  import DeployTemplate from "@/views/continus/DeployTemplate.vue";
  import { warning } from "@/utils/message.ts";
  import { continusConfig } from "@/store/ContinusConfigStore.ts";
  import piniaInstance from "@/store";

  const nodeCompRef = ref<any>();
  const toolInfoRef = ref<any>();
  const deployTemplateRef = ref<any>();
  const tempDialog = ref<boolean>(false);
  const nodeDialog = ref<boolean>(false);
  const currentNode = ref<number>(-1);
  const continusStore = continusConfig(piniaInstance);
  const nodeInfo = computed(() => continusStore.nodeInfo);
  let currentCompName = ref<string>("PipelineCfg");
  const processList = ref<any>([]);
  const changeTemplate = () => {
    tempDialog.value = !tempDialog.value;
    nextTick(() => {
      deployTemplateRef.value.setTemplate(nodeInfo.value.pipelineCfg);
    });
  };
  const addNode = (currentIndex: number) => {
    currentNode.value = currentIndex;
    addSubNode();
  };
  const editNode = (compName: string, currentIndex: number) => {
    currentCompName.value = compName;
    currentNode.value = currentIndex;
  };
  const delNode = (item: any) => {
    let index = processList.value.indexOf(item);
    processList.value.splice(index, 1);
  };
  const addSubNode = () => {
    nodeDialog.value = true;
  };
  const closeAction = () => {
    nodeDialog.value = false;
    tempDialog.value = false;
  };
  const dataSubmit = () => {
    let node = toolInfoRef.value.getNode();
    if (!node) {
      warning("请先选择要配置的节点");
      return;
    }
    let index = currentNode.value == -1 ? processList.value.length : currentNode.value;
    processList.value.splice(index, 0, { name: node.name, value: node.code, icon: node.icon });
    currentNode.value = index;
    currentCompName.value = node.code;
    closeAction();
  };
  const selectTemplate = () => {
    let template = deployTemplateRef.value.getTemplate();
    if (!template || Object.keys(template).length == 0) {
      warning("请选择要更换的模板");
      return;
    }
    if (!nodeInfo.value.pipelineCfg) {
      nodeInfo.value["pipelineCfg"] = {};
    }
    nodeInfo.value.pipelineCfg.templateName = template.templateName;
    nodeInfo.value.pipelineCfg.idTemplate = template.idTemplate;
    processList.value = template.nodeList;
    closeAction();
  };
  const save = (type: string) => {
    console.log(type);
  };
  const init = async () => {};
  onMounted(async () => {
    await init();
  });
</script>
<template>
  <star-horse-dialog
    :title="'节点列表'"
    :dialogVisible="nodeDialog"
    :self-func="true"
    @closeAction="closeAction"
    @merge="dataSubmit"
    :is-batch="false"
    :is-show-btn-continue="false"
  >
    <ToolInfo ref="toolInfoRef" />
  </star-horse-dialog>
  <star-horse-dialog
    :title="'更换模板'"
    @merge="selectTemplate"
    :dialogVisible="tempDialog"
    :self-func="true"
    @closeAction="closeAction"
  >
    <deploy-template ref="deployTemplateRef" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <span>{{ nodeInfo.pipelineCfg?.lineName || "未定义" }}</span>
        <span style="width: 40px"></span>
        <span>当前模板：{{ nodeInfo.pipelineCfg?.templateName || "默认" }}</span
        >&nbsp;&nbsp;
        <el-button @click="changeTemplate" link class="flex items-center">
          <star-horse-icon icon-class="transfer" />
          更换模板
        </el-button>
      </div>
      <div class="nav-bar-right">
        <el-button @click="save('publish')" style="background: var(--star-horse-style); color: var(--star-horse-white)">
          <star-horse-icon icon-class="publish" color="white" />
          保存并启用
        </el-button>
        <el-button @click="save('exec')">
          <star-horse-icon icon-class="run" />
          保存并执行
        </el-button>
      </div>
    </div>
    <div class="pipeline-nav">
      <div class="nav">
        <div
          :class="{ 'is-active': -1 == currentNode }"
          @click="editNode('PipelineCfg', -1)"
          class="nav-setting nav-panel"
        >
          <star-horse-icon
            icon-class="setting"
            :style="{
              'vertical-align': 'middle',
              color: -1 == currentNode ? 'var(--star-horse-white)' : 'var(--star-horse-style)'
            }"
          />
          流水线配置
        </div>
        <div class="nav-line"></div>
        <div class="start_end" v-if="processList.length > 0">开始</div>
        <el-scrollbar>
          <div class="nav-nodes">
            <div class="continus-node-content" v-for="(item, index) in processList">
              <div class="step">
                <i class="icon node-arrow">
                  <star-horse-icon icon-class="arrow-double-right" />
                </i>
                <i @click="addNode(index)" class="icon node-add">
                  <el-tooltip content="插入节点">
                    <star-horse-icon icon-class="add" cursor="pointer" />
                  </el-tooltip>
                </i>
              </div>
              <div :class="{ 'is-active': index == currentNode }" @click="editNode(item.code, index)" class="nav-panel">
                <div class="relative flex flex-row items-center justify-center">
                  <star-horse-icon :icon-class="item.icon" size="30px" />
                  <span>{{ item.name }}</span>
                  <i class="icon pright">
                    <star-horse-icon @click.stop="delNode(item)" icon-class="close" cursor="pointer" color="red" />
                  </i>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
        <div class="step" v-if="processList.length > 0">
          <i class="icon node-arrow">
            <star-horse-icon icon-class="arrow-double-right" style="vertical-align: middle" />
          </i>
          <i @click="addNode(processList.length)" class="icon node-add">
            <el-tooltip content="插入节点">
              <star-horse-icon icon-class="add" cursor="pointer" style="vertical-align: middle" />
            </el-tooltip>
          </i>
        </div>
        <div class="start_end" v-if="processList.length > 0">结束</div>
        <el-button @click="addNode(-1)" class="init-btn" text>
          <star-horse-icon icon-class="add" cursor="pointer" style="vertical-align: middle" />
          添加节点
        </el-button>
      </div>
    </div>
    <div class="config-content">
      {{ currentCompName }}
      <keep-alive>
        <component :is="currentCompName" ref="nodeCompRef" />
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
    position: relative;

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

      &.node-add,
      &.node-arrow {
        position: absolute;
        top: 50%;
        left: 40%;
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
      right: -7px;
      top: -2px;
      display: none;
      position: absolute;
    }

    .nav-panel {
      background: var(--star-horse-background);
      border: 1px solid #dadada;
      border-radius: 4px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04);
      cursor: pointer;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 8px;
      height: 35px;
      line-height: 35px;
      position: relative;
      text-align: center;
      flex-shrink: 0; // 禁止面板缩小
      width: 120px; // 加宽面板
      .relative {
        // 内部flex容器
        min-width: 0; // 允许内容收缩
        span {
          display: inline-block;
          max-width: 80px; // 控制文本最大宽度
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

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
      flex-shrink: 0;
      color: var(--star-horse-white) !important;

      &:after {
        border: 10px solid transparent;
        border-top-color: var(--star-horse-style);
        content: "";
        height: 0;
        left: 45%;
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
        position: absolute;
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
        display: flex;
      }

      &:before {
        left: 0;
      }

      &:after {
        right: 0;
      }
    }

    .nav {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 2px solid #e8e8e8;

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
        font-weight: bold;
        margin: 0 5px;
        width: 2px;
      }

      .start_end {
        border: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04);
        color: #898989;
        flex-shrink: 0;
        font-size: 12px;
        height: 35px;
        width: 35px;
        line-height: 35px;
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
        height: 74px;

        .continus-node-content {
          align-items: center;
          height: 35px;
          display: flex;
        }
      }
    }
  }
</style>
