<template>
  <star-horse-dialog :title="'更换模板'" :visible="tempDialog">
    <el-scrollbar>
      <div class="template-list">
        <div class="template-item">
          <div class="title">
            <el-tag type="info">标签二</el-tag>
            脚本部署模板
          </div>
          <div class="contents">
            <div class="content">
              <span class="content-title">ssss1</span>
              <i>
                <star-horse-icon icon-class="fa-solid fa-arrow-right-long"/>
              </i>
            </div>
            <div class="content">
              <span class="content-title">ssss2</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </star-horse-dialog>
  <star-horse-dialog :title="'节点列表'" :visible="nodeDialog">
    <div class="content-tools">
      <div class="node-menu">
        <div :class="{'active':currentItem==0}" class="node-item">全部</div>
        <div :class="{'active':currentItem==1}" class="node-item">编译</div>
        <div :class="{'active':currentItem==2}" class="node-item">测试</div>
        <div :class="{'active':currentItem==3}" class="node-item">扫描</div>
        <div :class="{'active':currentItem==4}" class="node-item">安全</div>
        <div :class="{'active':currentItem==5}" class="node-item">部署</div>
        <div :class="{'active':currentItem==6}" class="node-item">其他</div>
      </div>
      <div class="node-list">
        <div class="content-node">
          <div class="node">
            <div class="item-box" v-for="(item,index) in nodeList">
              <div>
                <div class="item-logo">
                  <div class="node-icon"></div>
                  <span class="text text-overflow">{{ item.name }}</span>
                </div>
                <span class="item-desc">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="node-desc"></div>
    </div>
  </star-horse-dialog>
  <div class="config-nav-bar">
    <div class="nav-bar-left">
      <span>xxxx-----</span>
      <span style="width: 40px;"></span>
      <apan>当前模板：XXX</apan>&nbsp;&nbsp;
      <el-button @click="changeTemplate">
        <star-horse-icon icon-class="fa-screwdriver-wrench" style="vertical-align: middle;"/>
        更换模板
      </el-button>
    </div>
    <div>
      <el-button type="primary">保存并启用</el-button>
      <el-button>保存并执行</el-button>
    </div>
  </div>
  <div style="height: 20px;"></div>
  <div class="pipeline-nav">
    <div class="nav">
      <div :class="{'is-active':-1==currentNode}" @click="editNode(-1)" class="nav-setting nav-panel">
        <i class="icon">
          <star-horse-icon icon-class="fa-solid fa-screwdriver-wrench" style="vertical-align: middle;"/>
        </i>&nbsp;
        流水线配置
      </div>
      <div class="nav-line"></div>
      <div class="start_end">开始</div>
      <div class="nav-nodes">
        <div class="node-content" v-for="(item,index) in processList">
          <div class="step">
            <i class="icon node-arrow">
              <star-horse-icon icon-class="fa-circle-chevron-right" style="vertical-align: middle;"/>
            </i>
            <i @click="addNode(index)" class="icon node-add">
              <el-tooltip content="插入节点">
                <star-horse-icon icon-class="fa-circle-plus" style="vertical-align: middle;"/>
              </el-tooltip>
            </i>
          </div>
          <div :class="{'is-active':index==currentNode}" @click="editNode(index)" class="nav-panel">
                        <span class="label text-overflow">{{ item.name }}
                           <i class="icon pright"><star-horse-icon icon-class="fa-close"
                                                                   style="vertical-align: middle;"/></i>
                        </span>
          </div>
        </div>
      </div>
      <div class="step">

        <i class="icon node-arrow">
          <star-horse-icon icon-class="fa-circle-chevron-right" style="vertical-align: middle;"/>
        </i>
        <i @click="addNode(processList.length)" class="icon node-add">
          <el-tooltip content="插入节点">
            <star-horse-icon icon-class="fa-circle-plus" style="vertical-align: middle;"/>
          </el-tooltip>
        </i>

      </div>
      <div class="start_end">结束</div>
      <el-button @click="addNode(-1)" class="init-btn" text>
        <star-horse-icon icon-class="fa-plus" style="vertical-align: middle;"/>
        添加节点
      </el-button>
    </div>
  </div>
  <div class="config-content">
    <el-form label-position="top" v-model="dataForm">
      <el-card v-if="currentNode==-1">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基础信息</span>
            </div>
          </template>
          <el-row>
            <el-col :span="11">
              <el-form-item label="流水线名称" prop="instanceName" required>
                <el-input clearable placeholder="请输入流水线名称" v-model="dataForm.instanceName"/>
              </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="11">
              <el-form-item label="代码分支" prop="codeBranch" required>
                <el-select clearable filterable placeholder="请选择流水线名称" v-model="dataForm.codeBranch">

                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="流水线类型" prop="execType" required>
                <el-select clearable placeholder="请选择流水线类型" v-model="dataForm.execType">
                  <el-option label="独占模式" value="single"/>
                  <el-option label="并行模式" value="multiple"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="11">
              <el-form-item label="Cron定时触发" prop="cron" required>
                <el-input clearable placeholder="请输入Cron定时触发" v-model="dataForm.cron"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        <div style="height: 15px;"/>
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据源</span>
              <el-select @change="addRepo" clearable filterable placeholder="请选择数据源类型"
                         required v-model="dataForm.repoType">
                <el-option label="SVN" value="svn"/>
                <el-option label="Git" value="git"/>
              </el-select>
            </div>
          </template>
          <el-form-item label="数据源名称" prop="repoInstName" required>
            <el-input placeholder="请输入数据源名称" v-model="dataForm.repoInstName"/>
          </el-form-item>
          <el-row>
            <el-col :span="20">
              <el-form-item label="URL" prop="repoInstUrl" required>
                <el-input placeholder="请输入数据源URL" v-model="dataForm.repoInstUrl"/>
              </el-form-item>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="3">
              <el-form-item label="自动触发" prop="autoExecution">
                <el-checkbox v-model="dataForm.autoExecution"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="版本号" prop="dataVersion">
                <el-input placeholder="请输入版本号" v-model="dataForm.dataVersion"/>
              </el-form-item>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="11">
              <el-form-item label="代码下载目标目录" prop="targetDir">
                <el-input placeholder="请输入代码下载目标目录" v-model="dataForm.targetDir"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-card>
      <el-card v-else>
        <el-row>
          <el-col :span="11">
            <el-form-item label="节点名称" prop="nodeName" required>
              <el-input clearable placeholder="请输入节点名称" v-model="dataForm.nodeName"/>
            </el-form-item>
          </el-col>
          <el-col :span="2"></el-col>
          <el-col :span="11">
            <el-form-item label="执行方式" prop="nodeExecType">
              <el-radio-group v-model="dataForm.nodeExecType">
                <el-radio label="1">并行</el-radio>
                <el-radio label="2">串行</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="节点成功条件" prop="nodeSuccessCondition">
              <el-radio-group v-model="dataForm.nodeSuccessCondition">
                <el-radio checked label="1">成功完成所有子任务</el-radio>
                <el-radio label="2">成功完成任意子任务</el-radio>
                <el-radio label="3">成功完成指定子任务&nbsp;<el-select clearable
                                                                       filterable placeholder="请选择子节点"
                                                                       v-model="dataForm.subNodeList">

                </el-select>
                </el-radio>

              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>节点配置</span>
              <el-button @click="addSubNode" class="init-btn" text>
                <star-horse-icon icon-class="fa-plus" style="vertical-align: middle;"/>
                添加子节点
              </el-button>
            </div>
          </template>
          <el-tabs>
            <el-tab-pane label="节点一">
              <sub-node-info/>
            </el-tab-pane>
            <el-tab-pane label="节点二"></el-tab-pane>
            <el-tab-pane label="节点三"></el-tab-pane>
            <el-tab-pane label="节点四"></el-tab-pane>
          </el-tabs>
        </el-card>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="ContinusInstanceInit">
import {ref} from "vue";

import SubNodeInfo from "@/views/continus/SubNodeInfo.vue";


const step = ref<number>(2);
const currentItem = ref<number>(0);
const dataForm = ref<any>({});
const tempDialog = ref<boolean>(false);
const nodeDialog = ref<boolean>(false);
const currentNode = ref<number>(-1);
const processList = ref<any>([
  {name: "编译"},
  {name: "合规"},
  {name: "Sql审核"},
  {name: "质量门禁"},
  {name: "PRD"}
]);
const nodeList = ref<any>([
  {icon: "", name: "普通编译"},
  {icon: "", name: "Caas编译"},
  {icon: "", name: "ApaasCaas编译"},
  {icon: "", name: "增量包制作"},
  {icon: "", name: "pafa5编译"},
  {icon: "", name: "WindowsMSBuild构建任务"},
  {icon: "", name: "Windows批处理脚本执行"},
  {icon: "", name: "Go编译"},
  {icon: "", name: "Java编译"},
  {icon: "", name: "Python编译"},
  {icon: "", name: "Node.js编译"},
  {icon: "", name: "Android编译"},
  {icon: "", name: "IOS编译"},
  {icon: "", name: "API接口测试"},
  {icon: "", name: "Power新能测试"},
  {icon: "", name: "C++单元测试"},
  {icon: "", name: "Junit单元测试"},
  {icon: "", name: "Node.js单元测试"},
  {icon: "", name: "Golang单元测试"},
  {icon: "", name: "Python单元测试"},
  {icon: "", name: "代码风格检查"},
  {icon: "", name: "Fortify代码检查"},
  {icon: "", name: "BlankDuck代码安全检查"},
  {icon: "", name: "一致性检查"},
  {icon: "", name: "Sonar代码扫描"},
  {icon: "", name: "应用Sql性能审核"},
  {icon: "", name: "Db审核"},
  {icon: "", name: "安卓娜迦加固"},
  {icon: "", name: "质量门禁"},
  {icon: "", name: "Caas部署"},
  {icon: "", name: "普通部署"},
  {icon: "", name: "脚本部署"},
  {icon: "", name: "padis部署"},
  {icon: "", name: "pafa5部署"},
  {icon: "", name: "制品库下载链接"},
  {icon: "", name: "通用测试任务"},
  {icon: "", name: "镜像移交"},
  {icon: "", name: "http请求任务"},
  {icon: "", name: "镜像推送"},
  {icon: "", name: "Jenkins任务"},
  {icon: "", name: "大文件外发"}
]);

const addRepo = () => {

};
const addSubNode = () => {
  nodeDialog.value = !nodeDialog.value;
};
const changeTemplate = () => {
  tempDialog.value = !tempDialog.value;
};
const addNode = (currentIndex: number) => {
  alert(currentIndex);
};
const editNode = (currentIndex: number) => {
  currentNode.value = currentIndex;
};
</script>

<style lang="scss" scoped>
.content-tools {
  display: flex;
  visibility: visible;
  overflow-x: hidden;
  overflow-y: auto;

  .node-menu {
    box-shadow: inset -1px 0 0 0 #e8e8e8;
    flex-shrink: 0;
    overflow: auto;
    width: 110px;
    height: calc(100% - 200px);

    .node-item {
      box-shadow: inset -1px -1px 0 0 #e8e8e8;
      cursor: pointer;
      font-size: 14px;
      height: 48px;
      line-height: 48px;
      padding-left: 16px;
      position: relative;


    }

    .node-item.active {
      color: #398bf7;

      &:before {
        background-color: #398bf7;
        bottom: 0;
        content: "";
        left: 0;
        position: absolute;
        top: 0;
        width: 4px;
      }
    }
  }

  .node-list {
    display: flex;
    flex-direction: column;
    padding: 20px 0 72px;
    position: relative;
    width: calc(100% - 110px);
    height: 90%;

    .content-node {
      max-height: calc(100vh - 200px);
      overflow: auto;

      .node {
        display: flex;
        flex-wrap: wrap;
        padding: 0 20px 8px 0;

        .item-box {
          display: inline-block;
          margin: 0 0 12px 20px;
          max-width: 200px;
          width: calc(33.3333% - 20px);

          div {
            .item-logo {
              align-items: center;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              color: #383838;
              cursor: pointer;
              font-size: 14px;
              height: 64px;
              padding: 12px;

              .node-icon {
                width: 40px;
                height: 40px;
              }
            }

            .item-desc {
              border-radius: 4px;
              bottom: 0;
              color: #606060;
              display: none;
              font-size: 14px;
              height: 72px;
              left: 20px;
              line-height: 20px;
              padding-top: 10px;
              position: absolute;
              right: 200px;
              text-align: left;
            }
          }
        }
      }
    }
  }

  .node-desc {

  }
}

.config-content {
  height: calc(100% - 150px);
  overflow: auto;

  .el-card {
    height: inherit;
  }
}

.template-list {
  height: 420px;
  padding: 0 24px;

  .template-item {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 16px;
    position: relative;
    width: 98%;

    .title {
      color: #383838;
      font-weight: 600;
    }

    .contents {
      display: flex;
      flex-wrap: wrap;

      .content {
        align-items: center;
        cursor: pointer;
        display: flex;
        height: 40px;
        line-height: 40px;
        margin-top: 12px;

        .content-title {
          border-radius: 4px;
          box-shadow: 0 0 4px 0 rgba(0, 0, 0, .12);
          display: inline-block;
          padding: 0 24px;
          text-align: center;
        }
      }
    }
  }
}

.config-nav-bar {
  .nav-bar-left {
    width: 75%;
  }

  .nav-bar-right {
    justify-items: right;
    align-items: center;
    text-align: center;
  }
}

.pipeline-nav {
  display: inline-block;
  max-width: calc(100% - 250px);
  position: relative;

  .icon {
    font-style: normal;
    text-align: center;
    line-height: 0;
    color: #e8e8e8;
    display: inline-block;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
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
    background-color: #ffffff;
    border: 1px solid #dadada;
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .04);
    cursor: pointer;
    flex-shrink: 0;
    font-size: 14px;
    height: 50px;
    line-height: 50px;
    position: relative;
    text-align: center;
    width: 110px;

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
    background-color: #398bf7;
    border: 1px solid #398bf7;
    box-shadow: none;
    color: #ffffff !important;

    &:after {
      border: 9px solid transparent;
      border-top-color: #398bf7;
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
    width: 30px;

    .node-add {
      cursor: pointer;
      display: none;
      color: #398bf7;
      font-size: 16px;
    }

    .node-arrow {
      cursor: pointer;
      font-size: 16px;

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
      top: 9px;
      width: 6px;
    }

  }

  .nav {
    align-items: center;
    color: #606060;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 40px 0 20px;

    .nav-setting {
      align-items: center;
      color: #383838;
      display: flex;
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
      color: #398bf7;
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

      }
    }
  }
}
</style>