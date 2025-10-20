<script setup lang="ts" name="ContinusInstanceExecRecord">
import {onMounted, reactive, ref, watch} from "vue";
import {apiInstance, ApiUrls, createCondition, PageProps, postRequest, warning} from "star-horse-lowcode";
import {useRouter} from "vue-router";
import {loadPipelineCfg} from "@/views/continuous/utils/PipelinetCfg.js";

const apiUrl: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/continuousInstance",
);
const execRecordApi: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineInstance",
);
defineProps({
  param: {
    type: String,
    default: "",
  },
});
const router = useRouter();
const isEdit = ref<number>(0);
const primaryKey: string = "idPiplineInstance";
let activeName: string = ref<string>("first");
const piplineConfigId = ref<string>("");
const loading = ref<boolean>(false);
const isSearch = ref<boolean>(false);
let pageInfo = reactive<PageProps | any>({
  pageSize: 20,
  currentPage: 1,
  totalData: 0,
  totalPage: 0,
  dataList: [],
});
const nodeInfo = ref<any>({});
const execLine = () => {
  console.log("执行");
};
const handleClick = (tab: string, event: Event) => {
};
const loadCfgData = async (newVal: any) => {
  isEdit.value = newVal.isEdit;
  piplineConfigId.value = newVal.configId;
  await loadPipelineCfg(newVal.configId).then((data) => {
    if (data.error) {
      warning(data.error);
      return;
    }
    nodeInfo.value = data.data;
    init();
  });

};
// 滚动事件处理
const handleScroll = (e: Event) => {
  const scrollbar = e.currentTarget as HTMLElement;
  const {scrollTop, scrollHeight, clientHeight} = scrollbar;
  if (scrollHeight - (scrollTop + clientHeight) < 50) {
    init();
  }
};
// 初始化加载数据
const init = async () => {
  if (
      loading.value ||
      (pageInfo.totalData &&
          pageInfo.dataList.length >= pageInfo.totalData)
  )
    return;
  loading.value = true;
  try {
    postRequest(execRecordApi.pageListUrl, {
      currentPage: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      fieldList: [createCondition("idPipelineConfig", piplineConfigId.value, "eq")],
      orderBy: [{fieldName: "createdTime", ascOrDesc: "desc"}],
    }).then((res: any) => {
      if (res?.data?.code != 0) {
        res && console.error(res?.data?.cnMessage);
        return;
      }
      let redata = res?.data?.data;
      if (isSearch.value) {
        pageInfo.dataList = [];
      }
      //如果不是分页之间显示返回的所有数据
      pageInfo.dataList = [
        ...pageInfo.dataList,
        ...redata?.dataList,
      ];
      pageInfo.totalPage = redata?.totalPages;
      pageInfo.totalData = redata?.totalDatas;
      pageInfo.currentPage += 1;
      isSearch.value = false;
    });
  } finally {
    loading.value = false;
  }
};
//获取配置信息，然后获取执行记录
const getExecRecords = async () => {

};
onMounted(() => {
  getExecRecords();
});
watch(() => router.currentRoute.value, (newVal, oldVal) => {
  loadCfgData(newVal.query);
}, {
  immediate: true
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <span><star-horse-icon icon-class="flow"/>{{ nodeInfo.projectName }}</span>
      </div>
      <div class="nav-bar-right">
        <el-button @click="execLine('execPipeline')" link>
          <star-horse-icon icon-class="run" size="16px"/>
          执行
        </el-button>
      </div>
    </div>
    <el-tabs @tabClick="handleClick(tab, event)" type="card" v-model="activeName">
      <el-tab-pane label="执行记录" name="first">
        <div class="relative overflow-hidden h-full">
          <el-scrollbar height="100%" @scroll="handleScroll">
            <instance-item :nodeInfo="nodeInfo" :instanceInfo="item" :showHeaderBar="true" type="record"
                           v-for="item in pageInfo.dataList" :key="item.idPipelineInstance"/>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane label="修改历史" name="second">修改历史</el-tab-pane>
      <el-tab-pane label="回滚记录" name="third">回滚记录</el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped></style>
