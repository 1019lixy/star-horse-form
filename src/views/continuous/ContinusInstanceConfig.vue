<script setup lang="ts" name="ContinusInstanceConfig">
import {onActivated, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {apiInstance, ApiUrls, createCondition, PageProps, postRequest,} from "star-horse-lowcode";
import InstanceItem from "@/views/continuous/InstanceItem.vue";

const dataUrl: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineConfig",
);
const router = useRouter();
const keyWords = ref<string>("");
const loading = ref<boolean>(false);
const isSearch = ref<boolean>(false);
let pageInfo = reactive<PageProps | any>({
  pageSize: 20,
  currentPage: 1,
  totalData: 0,
  totalPage: 0,
  dataList: [],
});

const dataFilter = () => {
  pageInfo.currentPage = 1;
  isSearch.value = true;
  init();
};
const newPipeline = () => {
  router.push("/continuous/ContinusInstanceInit");
};
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
      (pageInfo.totalData &&
          pageInfo.dataList.length >= pageInfo.totalData &&
          !isSearch.value)
  )
    return;
  loading.value = true;
  const params = [];
  if (keyWords.value) {
    params.push(createCondition("lineName", keyWords.value, "lk"));
  }
  try {
    postRequest(dataUrl.pageListUrl, {
      currentPage: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      fieldList: params,
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
const goBack = () => {
  router.push({
    path: "/home",
  });
};
// 生命周期
onBeforeUnmount(() => {
  const scrollbar = document.querySelector(".el-scrollbar__wrap");
  scrollbar?.removeEventListener("scroll", handleScroll);
});
onActivated(() => {
  init();
});

onMounted(() => {
  const scrollbar = document.querySelector(".el-scrollbar__wrap");
  if (scrollbar) {
    scrollbar.addEventListener("scroll", handleScroll);
  }
  init();
});
</script>
<template>
  <el-card class="inner_content relative">
    <div class="config-nav-bar relative">
      <div class="nav-bar-left items-center">
        <div class="flex items-center font-[600] text-[14px]">
          <star-horse-icon icon-class="workstation_setting"/>
          流水线
        </div>
        <el-divider
            direction="vertical"
            style="border: 1px solid var(--star-horse-style)"
        />
        <div @click="goBack" link class="flex items-center cursor-pointer">
          <star-horse-icon icon-class="return"/>
          返回主页
        </div>
      </div>
      <div class="nav-bar-right">
        <ul class="nav_ul">
          <li>
            <el-popover
                :popper-style="{ width: '300px !important' }"
                trigger="hover"
            >
              <el-input
                  placeholder="请输入要查询的关键字"
                  v-model="keyWords"
                  @keydown.enter="dataFilter"
              />
              <template #reference>
                <div class="flex items-center cursor-pointer px-2 py-1"
                     style="border:0px solid var(--star-horse-style);border-radius:4px;">
                  <star-horse-icon
                      cursor="pointer"
                      icon-class="search"
                      size="16px"
                      title="搜索"
                  />
                </div>
              </template>
            </el-popover>
          </li>
          <li>
            <div class="flex items-center cursor-pointer px-2 py-1"
                 style="border:0px solid var(--star-horse-style);border-radius:4px;" @click="newPipeline" link>
              <star-horse-icon cursor="pointer" icon-class="add"/>
              新建流水线
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="relative overflow-hidden">
      <el-scrollbar height="100%" @scroll="handleScroll">
        <template v-for="(item, index) in pageInfo.dataList" :key="index">
          <instance-item :nodeInfo="item" :instanceInfo="item.lastInstance"/>
        </template>
        <div v-if="loading" class="flex items-center justify-center p-10">
          加载中...
        </div>
      </el-scrollbar>
    </div>
  </el-card>
</template>
<style lang="scss" scoped></style>
