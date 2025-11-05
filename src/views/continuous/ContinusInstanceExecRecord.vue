<script setup lang="ts" name="ContinusInstanceExecRecord">
import {onMounted, reactive, ref, watch} from "vue";
import {apiInstance, ApiUrls, createCondition, PageProps, postRequest, warning,} from "star-horse-lowcode";
import {useRouter} from "vue-router";
import {execLine, loadPipelineCfg} from "@/views/continuous/utils/PipelinetCfg.js";
import InstanceItem from "@/views/continuous/InstanceItem.vue";

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
// 滚动事件处理
const handleScroll = (payload: any) => {
  let scrollTop = 0;
  let scrollHeight = 0;
  let clientHeight = 0;

  // 兼容 ElScrollbar 的 @scroll 事件（传入 { scrollTop, scrollLeft }）
  if (payload && typeof payload.scrollTop === "number") {
    scrollTop = payload.scrollTop;
    const wrap = document.querySelector(".el-scrollbar__wrap") as HTMLElement | null;
    if (!wrap) return;
    scrollHeight = wrap.scrollHeight;
    clientHeight = wrap.clientHeight;
  } else {
    // 兼容原生滚动事件（传入 Event）
    const target = (payload?.currentTarget || payload?.target) as HTMLElement | null;
    if (!target) return;
    scrollTop = target.scrollTop;
    scrollHeight = target.scrollHeight;
    clientHeight = target.clientHeight;
  }
  if (scrollHeight - (scrollTop + clientHeight) < 50) {
    init();
  }
};
// 初始化加载数据
const init = async () => {
  if (
      loading.value ||
      (pageInfo.totalData && pageInfo.dataList.length >= pageInfo.totalData)
  )
    return;
  loading.value = true;
  try {
    postRequest(execRecordApi.pageListUrl, {
      currentPage: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      fieldList: [
        createCondition("idPipelineConfig", piplineConfigId.value, "eq"),
      ],
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
      pageInfo.dataList = [...pageInfo.dataList, ...redata?.dataList];
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
const goBack = () => {
  router.push({
    path: "/continuous/ContinusInstanceConfig",
  });
};
onMounted(() => {
  getExecRecords();
});
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
      <div class="nav-bar-left items-center">
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
          返回列表
        </el-button>
      </div>
      <div class="nav-bar-right">
        <ul class="nav_ul">
          <li class="cursor-pointer" @click="execLine(nodeInfo.idPipelineConfig, 'execPipeline')">
            <div class="flex items-center px-2 py-1"
                 style="
            border-radius: 4px;
            border: 1px solid var(--star-horse-style);
          "
            >
              <star-horse-icon icon-class="run" size="16px"/>
              执行
            </div>
          </li>
        </ul>
      </div>
    </div>
    <el-tabs
        @tabClick="handleClick(tab, event)"
        type="card"
        v-model="activeName"
    >
      <el-tab-pane label="执行记录" name="first">
        <div class="relative overflow-hidden h-full">
          <el-scrollbar height="100%" @scroll="handleScroll">
            <instance-item
                :nodeInfo="nodeInfo"
                :instanceInfo="item"
                :showHeaderBar="true"
                type="record"
                v-for="item in pageInfo.dataList"
                :key="item.idPipelineInstance"
            />
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane label="修改历史" name="second">修改历史</el-tab-pane>
      <el-tab-pane label="回滚记录" name="third">回滚记录</el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped></style>
