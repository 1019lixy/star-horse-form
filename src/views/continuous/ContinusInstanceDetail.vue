<script setup lang="ts" name="ContinusInstanceDetail">
import { useRouter } from "vue-router";
import { ref, watch } from "vue";
import {
  execLine,
  loadPipelineCfg,
  loadPipelineInstance,
} from "@/views/continuous/utils/PipelinetCfg.js";
import { createDatetime, warning } from "star-horse-lowcode";
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
    path: "/continuous/ContinusInstanceConfig",
  });
};
const isEdit = ref<number>(1);
const pipelineConfigId = ref<string>("");
const pipelineInstanceId = ref<string>("");
const loadCfgData = async (query: any) => {
  isEdit.value = query.isEdit;
  pipelineConfigId.value = query.configId;
  pipelineInstanceId.value = query.instanceId;
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
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return" />
          返回
        </el-button>
        <span>{{ nodeInfo.projectName }}</span>
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
        <el-button
          @click="execLine(nodeInfo.idPipelineConfig, 'execPipeline')"
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
    <div class="w-full mt-5">
      <instance-item
        :nodeInfo="nodeInfo"
        :instanceInfo="instanceInfo"
        type="detail"
        @selectNode="nodeDetail"
        :showHeaderBar="false"
      />
    </div>
    <exec-result :instanceInfo="instanceInfo" :nodeItem="nodeItem" />
  </div>
</template>
<style lang="scss" scoped></style>
