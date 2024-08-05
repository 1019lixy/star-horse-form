<script setup lang="ts">
import {onMounted, ref} from "vue";

const currentItem = ref<number>(0);
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
const init = () => {

}
onMounted(() => {
  init();
})
</script>

<template>
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
