<script setup lang="ts" name="ContinusInstanceConfig">
import {onMounted, onUpdated, ref} from "vue";
import {useRouter} from "vue-router";
import {postRequest, success} from "star-horse-lowcode";

const router = useRouter();
const keyWords = ref<string>("");
const loading = ref(false);
let pageInfo = reactive<PageProps>({
  pageSize: 20,
  currentPage: 1,
  totalData: 0,
  totalPage: 0,
  dataList: []
});

const addDataFun = () => {
  router.push("/continuous/instanceInit");
};
const dataFilter = () => {
  success(keyWords.value);
}
const newPipeline = () => {
  router.push("/continuous/ContinusInstanceInit");
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
      if (loading.value || (pageInfo.totalData && pageInfo.dataList.length >= pageInfo.totalData)) return;
      loading.value = true;
      try {
        postRequest("/continuous-manage/continuous/projectInfo/pageList",
            {
              currentPage: pageInfo.currentPage,
              pageSize: pageInfo.pageSize,
              fieldList: [],
              orderBy: []
            }).then((res: any) => {
          if (res?.data?.code != 0) {
            res && console.error(res?.data?.cnMessage);
            return;
          }
          let redata = res?.data?.data;
          //如果不是分页之间显示返回的所有数据
          pageInfo.dataList = redata?.dataList || redata;
          pageInfo.totalPage = redata?.totalPages;
          pageInfo.totalData = redata?.totalDatas;
          pageInfo.currentPage += 1;
        })
      } finally {
        loading.value = false;
      }
    }
;
// 生命周期
onBeforeUnmount(() => {
  const scrollbar = document.querySelector('.el-scrollbar__wrap');
  scrollbar?.removeEventListener('scroll', handleScroll);
});
onUpdated(() => {
  init();
})
onMounted(() => {
  const scrollbar = document.querySelector('.el-scrollbar__wrap');
  if (scrollbar) {
    scrollbar.addEventListener('scroll', handleScroll);
  }
  init();
})
</script>
<template>
  <el-card class="inner_content relative">
    <div class="config-nav-bar relative">
      <div class="nav-bar-left items-center">
        <span><star-horse-icon icon-class="flow"/>流水线</span>
      </div>
      <div class="nav-bar-right">
        <ul class="nav_ul">
          <li>
            <el-popover :popper-style="{ width: '300px !important' }" trigger="hover">
              <el-input placeholder="请输入要查询的关键字" v-model="keyWords" @keydown.enter="dataFilter"/>
              <template #reference>
                <star-horse-icon cursor="pointer" icon-class="search" title="搜索"/>
              </template>
            </el-popover>

          </li>
          <li>
            <el-button
                @click="addDataFun"
                link>
              <star-horse-icon @click="newPipeline" cursor="pointer" icon-class="add"/>
              新建流水线
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <div class="relative overflow-hidden">
      <el-scrollbar height="100%" @scroll="handleScroll">
        <template v-for="(item, index) in pageInfo.dataList" :key="index">
          <instance-item :nodeInfo="item"/>
        </template>
        <div v-if="loading" class="loading-text">加载中...</div>
      </el-scrollbar>
    </div>
  </el-card>
</template>
<style lang="scss" scoped>
.loading-text {
  text-align: center;
  padding: 10px;
  color: #999;
}
</style>
