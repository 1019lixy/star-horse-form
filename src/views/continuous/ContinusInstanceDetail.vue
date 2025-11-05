<script setup lang="ts" name="ContinusInstanceDetail">
import {useRouter} from "vue-router";
import {ref, watch} from "vue";
import {execLine, loadPipelineCfg, loadPipelineInstance,} from "@/views/continuous/utils/PipelinetCfg.js";
import {createDatetime, warning} from "star-horse-lowcode";
import ExecResult from "@/views/continuous/nodeDetail/ExecResult.vue";
import InstanceItem from "@/views/continuous/InstanceItem.vue";

const router = useRouter();
const nodeInfo = ref<any>({});
const instanceInfo = ref<any>({});
const nodeItem = ref<any>({});
const nodeDetail = (item: any) => {
  nodeItem.value = item;
};
const goBack = () => {
  router.push({
    path: "/execRecord",
    query: {
      configId: pipelineConfigId.value,
      isEdit: isEdit.value,
    },
  });
};
const isEdit = ref<number>(1);
const pipelineConfigId = ref<string>("");
const pipelineInstanceId = ref<string>("");
const nodeId = ref<string>("");
const loadCfgData = async (query: any) => {
  isEdit.value = query.isEdit;
  pipelineConfigId.value = query.configId;
  pipelineInstanceId.value = query.instanceId;
  nodeId.value = query.nodeId;
  if (query.instanceId) {
    await loadPipelineInstance(query.instanceId).then((data) => {
      if (data.error) {
        warning(data.error);
        return;
      }
      instanceInfo.value = data.data;
      nodeInfo.value = data.data.pipelineConfig;
    });
  } else {
    await loadPipelineCfg(query.configId).then((data) => {
      if (data.error) {
        warning(data.error);
        return;
      }
      nodeInfo.value = data.data;
    });
  }
  if (query.nodeId) {
    // 在 nodeList 及其 subNodeInfoList 中查找匹配的节点
    let found: any = nodeInfo.value.nodeList?.find((n: any) => n.idNodeInfo === query.nodeId);
    if (!found) {
      for (const n of nodeInfo.value.nodeList || []) {
        const sub = n.subNodeInfoList?.find((sn: any) => sn.idNodeInfo === query.nodeId);
        if (sub) { found = sub; break; }
      }
    }
    if (found) {
      nodeItem.value = found;
    }
  }
};
watch(
    () => router.currentRoute.value,
    (newVal, oldVal) => {
      loadCfgData(newVal.query);
    },
    {
      immediate: true,
    },
);
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="config-nav-bar h-[50px]!">
      <div class="nav-bar-left">
        <div class="flex items-center font-[600] text-[14px]">
          <star-horse-icon icon-class="config"/>
          流水线:{{ nodeInfo.lineName }}
        </div>
        <el-divider
            direction="vertical"
            style="border: 1px solid var(--star-horse-style)"
        />
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return"/>
          返回记录
        </el-button>
        <el-divider
            direction="vertical"
            style="border: 1px solid var(--star-horse-style)"
        />

        <span>操作人:{{ instanceInfo.createdBy || nodeInfo.createdBy }}</span>
        <el-divider
            direction="vertical"
            style="border: 1px solid var(--star-horse-style)"
        />
        <span
        >执行于:
          {{
            createDatetime(instanceInfo.createdTime || nodeInfo.createdTime)
          }}</span
        >
        <el-divider
            direction="vertical"
            style="border: 1px solid var(--star-horse-style)"
        />
        <span>#{{ instanceInfo.dataIndex }}</span>
      </div>
      <div class="nav-bar-right">
        <div
            @click="execLine(nodeInfo.idPipelineConfig, 'execPipeline')"
            class="flex items-center px-2 py-1"
            style="
            border-radius: 4px;
            border: 1px solid var(--star-horse-style);
          "
        >
          <star-horse-icon icon-class="run"/>
          <el-tooltip content="执行">执行</el-tooltip>
        </div>
      </div>
    </div>
    <div class="w-full mt-5">
      <instance-item
          :nodeInfo="nodeInfo"
          :instanceInfo="instanceInfo"
          type="detail"
          @selectNode="nodeDetail"
          :selectedNodeId="nodeId"
          :showHeaderBar="false"
      />
    </div>
    <exec-result :instanceInfo="instanceInfo" :nodeItem="nodeItem"/>
  </div>
</template>
<style lang="scss" scoped></style>
