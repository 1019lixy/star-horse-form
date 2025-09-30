<script setup lang="ts" name="ContinusInstanceConfig">
import {onActivated, onBeforeUnmount, onMounted, reactive, ref,} from "vue";
import {useRouter} from "vue-router";
import {apiInstance, ApiUrls, createCondition, PageProps, postRequest,} from "star-horse-lowcode";

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
          pageInfo.dataList.length >= pageInfo.totalData &&
          !isSearch.value)
  )
    return;
  loading.value = true;
  const params = [];
  if (keyWords.value) {
    params.push(createCondition("projectName", keyWords.value, "lk"));
  }
  try {
    postRequest(dataUrl.pageListUrl, {
      currentPage: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      fieldList: params,
      orderBy: [{fieldName: "createdTime", orderType: "desc"}],
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

const configList = [{
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
},{
  projectName: "测试2",
  createdBy: "admin",
  createdTime: "2023-08-02",
  dataNo: "123457",
  nodeList: [{
    nodeCode: "node5",
    nodeName: "节点5",
    nodeType: "start",
    subNodeList: []
  }, {
    nodeCode: "node6",
    nodeName: "节点6",
    nodeType: "end",
    subNodeList: []
  }, {
    nodeCode: "node7",
    nodeName: "节点7",
    nodeType: "process",
    subNodeList: []
  }]
},{
  projectName: "测试3",
  createdBy: "admin",
  createdTime: "2023-08-03",
  dataNo: "123458",
  nodeList: [{
    nodeCode: "node8",
    nodeName: "节点8",
    nodeType: "start",
    subNodeList: [{
      nodeCode: "node8-1",
      nodeName: "节点8-1",
      nodeType: "process",
      subNodeList: []
    }, {
      nodeCode: "node8-2",
      nodeName: "节点8-2",
      nodeType: "process",
      subNodeList: []
    }]
  }, {
    nodeCode: "node9",
    nodeName: "节点9",
    nodeType: "end",
    subNodeList: [{
      nodeCode: "node9-1",
      nodeName: "节点9-1",
      nodeType: "process",
      subNodeList: []
    }]
  }, {
    nodeCode: "node10",
    nodeName: "节点10",
    nodeType: "process",
    subNodeList: []
  }]
}];

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
        <span><star-horse-icon icon-class="flow"/>流水线</span>
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return"/>
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
              <star-horse-icon cursor="pointer" icon-class="add"/>
              新建流水线
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <div class="relative overflow-hidden">
      <el-scrollbar height="100%" @scroll="handleScroll">
        <!--pageInfo.dataList-->
        <template v-for="(item, index) in configList" :key="index">
          <instance-item :nodeInfo="item"/>
        </template>
        <div v-if="loading" class="flex items-center justify-center p-10">
          加载中...
        </div>
      </el-scrollbar>
    </div>
  </el-card>
</template>
<style lang="scss" scoped></style>
