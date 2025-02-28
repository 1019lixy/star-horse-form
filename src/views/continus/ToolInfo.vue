<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { continusNodeList } from "@/views/continus/utils/ToolsParams.ts";

  const currentItem = ref<number>(0);
  const currentNode = ref<any>({});
  let categoryNodeList = ref<Array<any>>([]);
  let nodeList = ref<Array<any>>([]);

  const changeNode = (itemIndex: number) => {
    currentItem.value = itemIndex;
    if (!itemIndex) {
      categoryNodeList.value = nodeList.value;
    } else {
      categoryNodeList.value = nodeList.value.filter((item) => item.index == itemIndex);
    }
    currentNode.value = categoryNodeList.value.find((item) => item.default == "Y");
  };
  const selectNode = (item: any) => {
    currentNode.value = item;
  };
  const setNode = (nodeName: string) => {
    currentNode.value = nodeList.value.find((item) => item.code == nodeName);
  };
  const getNode = () => {
    return currentNode.value;
  };
  const init = () => {
    nodeList.value = continusNodeList.value;
    changeNode(0);
  };
  onMounted(() => {
    init();
  });
  defineExpose({
    getNode,
    setNode
  });
</script>

<template>
  <div class="content-tools">
    <div class="node-menu">
      <div :class="{ active: currentItem == 0 }" @click="changeNode(0)" class="node-item">全部</div>
      <div :class="{ active: currentItem == 1 }" @click="changeNode(1)" class="node-item">编译</div>
      <div :class="{ active: currentItem == 2 }" @click="changeNode(2)" class="node-item">测试</div>
      <div :class="{ active: currentItem == 3 }" @click="changeNode(3)" class="node-item">扫描</div>
      <div :class="{ active: currentItem == 4 }" @click="changeNode(4)" class="node-item">安全</div>
      <div :class="{ active: currentItem == 5 }" @click="changeNode(5)" class="node-item">部署</div>
      <div :class="{ active: currentItem == 6 }" @click="changeNode(6)" class="node-item">其他</div>
    </div>

    <div class="node-list">
      <div class="content-node">
        <el-scrollbar height="100%">
          <div class="node">
            <div class="item-box" v-for="(item, index) in categoryNodeList">
              <div
                class="node-info"
                @click="selectNode(item)"
                :class="{ 'item-active': item.code == currentNode?.code }"
              >
                <div class="item-logo">
                  <div class="node-icon">
                    <star-horse-icon :icon-class="item.icon" size="40px" />
                  </div>
                  <span class="text text-overflow">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="node-desc"></div>
  </div>
</template>

<style scoped lang="scss">
  .content-tools {
    display: flex;
    flex-direction: row;
    height: 100%;
    min-height: 400px;
    overflow: hidden;

    .node-menu {
      box-shadow: inset -1px 0 0 0 #e8e8e8;
      flex-shrink: 0;
      overflow: hidden;
      width: 110px;

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
      background-color: var(--star-horse-shadow);
      border-radius: 4px;
      box-shadow: 1px 1px 2px 2px rgba(233, 112, 75, 0.4);
      font-weight: bold;
      height: 100%;
    }

    .node-list {
      display: flex;
      flex-direction: column;
      padding: 20px 0 72px;
      position: relative;
      width: calc(100% - 110px);
      height: 100%;
      overflow: hidden;

      .content-node {
        height: 100%;
        overflow: hidden;

        .node {
          display: flex;
          flex-wrap: wrap;
          padding: 0 20px 8px 0;
          overflow: auto;
          height: 100%;

          .item-box {
            display: inline-block;
            margin: 10px;
            padding: 0;
            max-width: 200px;
            border: 1px solid #e8e8e8;
            width: calc(33.3333% - 20px);
            border-radius: 4px;

            .node-info {
              display: flex;
              width: 100%;
              align-items: center;

              .item-logo {
                display: flex;
                width: 100%;
                justify-content: space-between;
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
