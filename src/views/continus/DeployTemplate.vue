<script setup lang="ts">
import {onMounted} from "vue";
import {continusNodeList} from "@/views/continus/utils/ToolsParams.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {apiInstance} from "@/api/sh_api.ts";
import {postRequest} from "@/api/star_horse.ts";

const apiUrl: ApiUrls = apiInstance("userdb-manage", "/userdb/formInstance/conTemplate/idTemplate/136");
const nodeList = ref<any>([]);
const loadTemplate = () => {
  postRequest(apiUrl.basePrefix+"/joinQuery", {
    joinTables: [
      {
        tableName: "conTemplateNode",
        joinType: "inner",
        queryCondition:{

        }
      }
    ],
  }).then(res => {
    if (res.data.code) {
      return;
    }
    let reData = res.data.data;
    console.log(reData);
  })
}
onMounted(() => {
  nodeList.value = continusNodeList.value;
  loadTemplate();
})
</script>

<template>
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
            <star-horse-icon icon-class="arrow-double-right"/>
          </i>
        </div>
        <div class="content">
          <span class="content-title">ssss2</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.template-list {
  height: 420px;
  width: 100%;
  padding: 0 24px;

  .template-item {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 16px;
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
          box-shadow: 0 0 4px 0 rgba(0, 0, 0, .12);
          display: inline-block;
          padding: 0 24px;
          text-align: center;
        }
      }
    }
  }
}
</style>
