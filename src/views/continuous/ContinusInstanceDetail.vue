<script setup lang="ts" name="ContinusInstanceDetail">
import { useRouter } from "vue-router";

const router = useRouter();
const execLine = () => {
  console.log("执行");
};
const nodeInfoData ={
  projectName: "测试1技术等级佛山街覅三等奖覅手打激发",
  createdBy: "admin",
  createdTime: "2023-08-01",
  dataNo: "123456",
  nodeList: [{
    nodeCode: "node1",
    nodeName: "节点1积分时间哦对附件四范围额金娃IE就",
    nodeType: "start",
    subNodeList: [

    ]
  }, {
    nodeCode: "node2",
    nodeName: "节点2",
    nodeType: "end",
    subNodeList: []
  }, {
    nodeCode: "node3",
    nodeName: "节点3",
    nodeType: "process",
    subNodeList: []
  }, {
    nodeCode: "node4",
    nodeName: "节点4",
    nodeType: "process",
    subNodeList: [
      {
        nodeCode: "node4-1",
        nodeName: "节点4-1",
        nodeType: "process",
        subNodeList: []
      }, {
        nodeCode: "node4-2",
        nodeName: "节点4-2",
        nodeType: "process",
        subNodeList: []
      }, {
        nodeCode: "node4-3",
        nodeName: "节点4-3",
        nodeType: "process",
        subNodeList: []
      }, {
        nodeCode: "node4-4",
        nodeName: "节点4-4",
        nodeType: "process",
        subNodeList: []
      }
    ]
  }]
};
const nodeDetail = (id: number) => {};
const goBack = () => {
  router.push({
    path: "/continuous/ContinusInstanceConfig",
  });
};
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return" />
          返回
        </el-button>
        <span>starhorse-continuous-01</span>
        <el-divider direction="vertical" />
        <span>操作人:</span>
        <el-divider direction="vertical" />
        <span>执行于: 2022-11-25 11:00:00</span>
        <el-divider direction="vertical" />
        <span>#71992</span>
      </div>
      <div class="nav-bar-right">
        <el-button
          @click="execLine"
          title=""
          style="
            background: var(--star-horse-style);
            color: var(--star-horse-white);
          "
        >
          <star-horse-icon icon-class="run" color="var(--star-horse-white)" />
          <el-tooltip content="执行">执行</el-tooltip>
        </el-button>
      </div>
    </div>
    <instance-item-detail :nodeInfo="nodeInfoData" @nodeDetail="nodeDetail" />
    <compliance />
  </div>
</template>
<style lang="scss" scoped></style>
