<script setup lang="ts" name="ContinusInstanceConfig">
import {onBeforeUnmount, onMounted, onUpdated, reactive, ref} from 'vue';
import {useRouter} from 'vue-router';
import {apiInstance, ApiUrls, createCondition, PageProps, postRequest,} from 'star-horse-lowcode';

const dataUrl: ApiUrls = apiInstance(
  'continuous-manage',
  'continuous/pipelineConfig',
);
const router = useRouter();
const keyWords = ref<string>('');
const loading = ref<boolean>(false);
const isSearch = ref<boolean>(false);
let pageInfo = reactive<PageProps>({
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
  router.push('/continuous/ContinusInstanceInit');
};
// 滚动事件处理
const handleScroll = (e: Event) => {
  const scrollbar = e.currentTarget as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = scrollbar;
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
    params.push(createCondition('projectName', keyWords.value, 'lk'));
  }
  try {
    postRequest(dataUrl.pageListUrl, {
      currentPage: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      fieldList: params,
      orderBy: [{ fieldName: 'createdTime', orderType: 'desc' }],
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
        ...(redata?.dataList || redata),
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
const goBack = () => {
  router.push({
    path: '/home',
  });
};
// 生命周期
onBeforeUnmount(() => {
  const scrollbar = document.querySelector('.el-scrollbar__wrap');
  scrollbar?.removeEventListener('scroll', handleScroll);
});
onUpdated(() => {
  init();
});
onMounted(() => {
  const scrollbar = document.querySelector('.el-scrollbar__wrap');
  if (scrollbar) {
    scrollbar.addEventListener('scroll', handleScroll);
  }
  init();
});
</script>
<template>
  <el-card class="inner_content relative">
    <div class="config-nav-bar relative">
      <div class="nav-bar-left items-center">
        <span><star-horse-icon icon-class="flow" />流水线</span>
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return" />
          返回主页
        </el-button>
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
                <star-horse-icon
                  cursor="pointer"
                  icon-class="search"
                  title="搜索"
                />
              </template>
            </el-popover>
          </li>
          <li>
            <el-button @click="newPipeline" link>
              <star-horse-icon cursor="pointer" icon-class="add" />
              新建流水线
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <div class="relative overflow-hidden">
      <el-scrollbar height="100%" @scroll="handleScroll">
        <template v-for="(item, index) in pageInfo.dataList" :key="index">
          <instance-item :nodeInfo="item" />
        </template>
        <div v-if="loading" class="flex items-center justify-center p-10">
          加载中...
        </div>
      </el-scrollbar>
    </div>
  </el-card>
</template>
<style lang="scss" scoped></style>
