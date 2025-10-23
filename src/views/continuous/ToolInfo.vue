<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dictData,
  postRequest,
  SelectOption,
  warning,
} from "star-horse-lowcode";

const emits = defineEmits(["selectNode"]);
const apiUrl: ApiUrls = apiInstance(
  "userdb-manage",
  "userdb/formInstance/conNodeConfigures/idNodeConfigure/136",
);
const currentItem = ref<string>("all");
const currentNode = ref<any>({});
let categoryNodeList = ref<Array<any>>([]);
let nodeList = ref<Array<any>>([]);
let nodeTypeList = ref<SelectOption[]>([]);

const changeNode = (nodeType: string) => {
  currentItem.value = nodeType;
  if (nodeType == "all") {
    categoryNodeList.value = nodeList.value;
  } else {
    categoryNodeList.value = nodeList.value.filter(
      (item) => item.nodeType == nodeType,
    );
  }
  currentNode.value = categoryNodeList.value.find(
    (item) => item.defaultFlag == "Y",
  );
};
const selectNode = (item: any, action: string) => {
  currentNode.value = item;
  if (action == "dblClick") {
    emits("selectNode", item);
  }
};
const setNode = (nodeCode: string) => {
  currentNode.value = nodeList.value.find((item) => item.nodeCode == nodeCode);
};
const getNode = () => {
  return currentNode.value;
};
const init = async () => {
  nodeList.value = [];
  nodeTypeList.value = await dictData("CONTINUS_NODE_TYPE");
  postRequest(apiUrl.listConditionUrl!, {
    fieldList: [
      createCondition("dynamicFormNo", "", "notnull"),
      createCondition("dynamicFormNo", "", "neq"),
    ],
    orderBy: [{ fieldName: "dataSort", ascOrDesc: "asc" }],
  }).then((res) => {
    let resData = res.data;
    if (resData?.code) {
      warning(resData.cnMessage);
      return;
    }
    nodeList.value = resData?.data;
    changeNode("all");
  });
};
onMounted(() => {
  init();
});
defineExpose({
  getNode,
  setNode,
});
</script>

<template>
  <div class="content-tools">
    <div class="node-menu">
      <div
        v-for="item in nodeTypeList"
        :class="{ active: currentItem == item.value }"
        @click="changeNode(item.value)"
        class="node-item"
      >
        {{ item.name }}
      </div>
    </div>

    <div class="node-list">
      <div class="content-node">
        <el-scrollbar height="100%">
          <div class="node">
            <div class="item-box" v-for="(item, index) in categoryNodeList">
              <div
                class="node-info"
                @dblclick="selectNode(item, 'dblClick')"
                @click="selectNode(item, 'click')"
                :class="{
                  'item-active': item.nodeCode == currentNode?.nodeCode,
                }"
              >
                <div class="item-logo">
                  <div class="node-icon">
                    <star-horse-icon
                      :icon-class="item.icon"
                      size="40px"
                      width="44px"
                      height="42px"
                    />
                  </div>
                  <span class="text text-overflow">{{ item.nodeName }}</span>
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
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .content-node {
      height: 100%;
      width: 100%;
      overflow: hidden;

      .node {
        grid-template-columns: 35px 1fr 35px;
        /* 左右内边距 + 中间内容 */
        grid-template-rows: 40px 1fr 50px;
        /* 上下内边距 + 中间内容 */
        gap: 5px;
        flex-wrap: wrap;
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
