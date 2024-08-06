<script setup lang="ts">
import {onMounted, ref} from "vue";

const currentItem = ref<number>(0);
const currentNode = ref<any>({});
let categoryNodeList = ref<Array<any>>([]);
const nodeList = ref<Array<any>>([
  {icon: "", index: 1, name: "Java编译", code: "JavaCompile", default: "Y"},
  {icon: "", index: 1, name: "普通编译", code: "BuildCfg"},
  {icon: "", index: 1, name: "Caas编译", code: "CaasCompile"},
  {icon: "", index: 1, name: "ApaasCaas编译", code: "ApaasCaasCompile"},
  {icon: "", index: 1, name: "Go编译", code: "GoCompile"},
  {icon: "", index: 1, name: "Python编译", code: "PythonCompile"},
  {icon: "", index: 1, name: "Node.JS编译", code: "NodeCompile"},
  {icon: "", index: 1, name: "Android编译", code: "AndroidCompile"},
  {icon: "", index: 1, name: "IOS编译", code: "IosCompile"},
  {icon: "", index: 2, name: "通用测试任务", code: "GenerateTest", default: "Y"},
  {icon: "", index: 2, name: "API接口测试", code: "ApiInterfaceTest"},
  {icon: "", index: 2, name: "Power性能测试", code: "PowerTest"},
  {icon: "", index: 2, name: "C++单元测试", code: "CPPUnitTest"},
  {icon: "", index: 2, name: "Junit单元测试", code: "JunitTest"},
  {icon: "", index: 2, name: "Node.JS单元测试", code: "NodeUnitTest"},
  {icon: "", index: 2, name: "Golang单元测试", code: "GoUnitTest"},
  {icon: "", index: 2, name: "Python单元测试", code: "PythonUnitTest"},
  {icon: "", index: 3, name: "Sonar代码扫描", code: "SonarScan", default: "Y"},
  {icon: "", index: 3, name: "代码风格检查", code: "CodeStyleCheck"},
  {icon: "", index: 3, name: "一致性检查", code: "ConsistenceCheck"},
  {icon: "", index: 3, name: "应用Sql性能审核", code: "AppSqlAudit"},
  {icon: "", index: 3, name: "Db审核", code: "DbAudit"},
  {icon: "", index: 4, name: "质量门禁", code: "EntranceGuard", default: "Y"},
  {icon: "", index: 4, name: "BlankDuck代码安全检查", code: "BlankDuckScan"},
  {icon: "", index: 4, name: "Fortify代码检查", code: "FortifyScan"},
  {icon: "", index: 4, name: "安全加固", code: "SecurityReinforcement"},
  {icon: "", index: 5, name: "普通部署", code: "GeneralDeploy", default: "Y"},
  {icon: "", index: 5, name: "Caas部署", code: "CaasDeploy"},
  {icon: "", index: 5, name: "脚本部署", code: "ScriptDeploy"},
  {icon: "", index: 5, name: "padis部署", code: "PadisDeploy"},
  {icon: "", index: 5, name: "pafa5部署", code: "PafaDeploy"},
  {icon: "", index: 6, name: "制品库下载链接", code: "PackageDownload", default: "Y"},
  {icon: "", index: 6, name: "http请求任务", code: "HttpRequest"},
  {icon: "", index: 6, name: "镜像移交", code: "ImageHandOver"},
  {icon: "", index: 6, name: "镜像推送", code: "ImageSend"},
  {icon: "", index: 6, name: "Jenkins任务", code: "JenkinsTask"},
  {icon: "", index: 6, name: "大文件外发", code: "BigFileSendOut"},
  {icon: "", index: 6, name: "增量包制作", code: "IncPackageCreate"},
  {icon: "", index: 6, name: "pafa5编译", code: "PafaCompile"},
  {icon: "", index: 6, name: "WindowsMSBuild构建任务", code: "WmsBuildTask"},
  {icon: "", index: 6, name: "Windows批处理脚本执行", code: "WBatchScriptExec"},
]);
const changeNode = (itemIndex: number) => {
  currentItem.value = itemIndex;
  if (!itemIndex) {
    categoryNodeList.value = nodeList.value;
  } else {
    categoryNodeList.value = nodeList.value.filter(item => item.index == itemIndex);
  }
  currentNode.value = categoryNodeList.value.find(item => item.default == "Y");

}
const selectNode = (item: any) => {
  currentNode.value = item;
}
const setNode = (nodeName: string) => {
  currentNode.value = nodeList.value.find(item => item.code == nodeName);
}
const getNode = () => {
  return currentNode.value;
}
const init = () => {
  changeNode(0);
}
onMounted(() => {
  init();
})
defineExpose({
  getNode,
  setNode
});
</script>

<template>
  <div class="content-tools">
    <div class="node-menu">
      <div :class="{'active':currentItem==0}" @click="changeNode(0)" class="node-item">全部</div>
      <div :class="{'active':currentItem==1}" @click="changeNode(1)" class="node-item">编译</div>
      <div :class="{'active':currentItem==2}" @click="changeNode(2)" class="node-item">测试</div>
      <div :class="{'active':currentItem==3}" @click="changeNode(3)" class="node-item">扫描</div>
      <div :class="{'active':currentItem==4}" @click="changeNode(4)" class="node-item">安全</div>
      <div :class="{'active':currentItem==5}" @click="changeNode(5)" class="node-item">部署</div>
      <div :class="{'active':currentItem==6}" @click="changeNode(6)" class="node-item">其他</div>
    </div>
    <div class="node-list">
      <div class="content-node">
        <div class="node">
          <div class="item-box" v-for="(item,index) in categoryNodeList">
            <div @click="selectNode(item)" :class="{'item-active':item.code==currentNode?.code}">
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
</template>

<style scoped lang="scss">
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
      color: var(--star-horse-style);

      &:before {
        background-color: var(--star-horse-style);
        bottom: 0;
        content: "";
        left: 0;
        position: absolute;
        top: 0;
        width: 4px;
      }
    }
  }

  .item-active {
    border: 2px dotted var(--star-horse-style);
    font-weight: bold;
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
</style>
