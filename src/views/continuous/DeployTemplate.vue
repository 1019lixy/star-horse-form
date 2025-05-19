<script setup lang="ts">
import {onMounted, ref} from "vue";
import {apiInstance, ApiUrls, createJoinCondition, loadData, postRequest, warning} from "star-horse-lowcode";

const apiUrl: ApiUrls = apiInstance("userdb-manage", "/userdb/formInstance/conTemplate/idTemplate/136");
const nodeCfgUrl: ApiUrls = apiInstance("userdb-manage", "userdb/formInstance/conNodeConfigures/idNodeConfigure/136")
const nodeList = ref<any>([]);
const templateList = ref<any>([]);
let currentTemplate = ref<any>({});
const loadTemplate = async () => {
  let fields = ["idTemplate", "templateName", "templateCode"];
  let reData = await loadData(nodeCfgUrl.listConditionUrl!, {});
  nodeList.value = reData?.data;
  postRequest(apiUrl.basePrefix + "/joinQuery", {
    limitFields: fields,
    groupByFields: fields,
    groupName: "nodeList",
    joinTables: [
      {
        tableName: "conTemplateNode",
        joinType: "inner",
        aliasName: "b",
        limitFields: ["nodeName"],
        joinCondition: {
          joinFieldList: [createJoinCondition("a.idTemplate", "b.idTemplate")]
        }
      }
    ]
  }).then((res) => {
    if (res.data?.code) {
      warning(res.data?.cnMessage);
      return;
    }
    let reData = res.data?.data;
    reData?.forEach((item: any) => {
      item.nodeList = item.nodeList.map((node: any) => {
        return nodeList.value.find((nodeItem: any) => nodeItem.nodeCode == node.nodeName);
      }).filter((item: any) => item);
    });
    templateList.value = reData;
    console.log(templateList.value);
  });
};

const selectItem = (item: any) => {
  currentTemplate.value = item;
};
const getTemplate = () => {
  return currentTemplate.value;
};
const setTemplate = (item: any) => {
  currentTemplate.value = item;
};
onMounted(() => {
  loadTemplate();
});
defineExpose({
  getTemplate,
  setTemplate
});
</script>

<template>
  <div class="template-list">
    <template v-for="item in templateList">
      <div
          class="template-item"
          :class="{ 'is-active': currentTemplate?.idTemplate == item.idTemplate }"
          @click="selectItem(item)"
      >
        <div class="title">
          <el-tag type="info">{{ item.templateName }}</el-tag>
          {{ item.remark || item.templateName }}
        </div>
        <div class="contents">
          <div class="content" v-for="(sitem, index) in item.nodeList">
            <div class="relative flex flex-row items-center justify-center">
              <star-horse-icon :icon-class="sitem.icon||'document'" size="30px"/>
              <span>{{ sitem.nodeName }}</span>
            </div>
            <star-horse-icon icon-class="arrow-double-right" v-if="index < item.nodeList.length - 1"/>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.template-list {
  height: 420px;
  width: 100%;
  padding: 0 24px;

  .is-active {
    border: 2px dotted var(--star-horse-style) !important;
  }

  .template-item {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 16px;
    margin: 5px auto;
    position: relative;
    width: 99%;

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
          box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12);
          display: inline-block;
          padding: 0 24px;
          text-align: center;
        }
      }
    }
  }
}
</style>
