<script setup lang="ts">
import { onMounted, reactive, ref, unref } from "vue";
import {
  closeLoad,
  createCondition,
  createDatetime,
  dialogPreps,
  isJson,
  loadData,
  message,
  OrderByInfo,
  PageFieldInfo,
  SearchParams,
} from "star-horse-lowcode";
import websocket from "@/api/websocket";
import { getUserInfo } from "@/utils/auth";
import { postRequest } from "@/api/star_horse_apis";
import { i18n } from "@/lang";
import WorkflowTimelineView from "./WorkflowTimelineView.vue";

defineProps({
  compSize: { type: String, default: "small" },
});
let currentTab = ref<string>("notice");
let messageList = ref<Array<any>>([]);
let auditList = ref<Array<any>>([]);
let totals = ref<number>(0);
let totalMessages = ref<number>(0);
let totalAudit = ref<number>(0);
const url = "/system-config/system/messageRecord/getAllByCondition";
const pageUrl = "/system-config/system/messageRecord/pageList";

// Drawer related refs
const drawerVisible = ref(false);
const drawerTitle = ref("");
const activeWorkflowType = ref("");
const selectedWorkflowData = ref<any>(null);

const init = async () => {
  let params = createParams("notice");
  let resultData = await loadData(url, params.fieldList, params.orderBy);
  let msgTemp: Array<any> = resultData.data;
  params = createParams("pending");
  resultData = await loadData(url, params.fieldList, params.orderBy);
  let auditTemp: Array<any> = resultData.data;
  reCount(msgTemp, auditTemp);
  webSocketOperation();
  loadByPage();
};
const reCount = (msgList: Array<any>, auditList: Array<any>) => {
  totalMessages.value =
    msgList?.filter((item) => item.statusCode == "1")?.length || 0;
  totalAudit.value =
    auditList?.filter((item) => item.statusCode == "1")?.length || 0;
  totals.value = totalMessages.value + totalAudit.value;
};
const webSocketOperation = () => {
  console.log("当前环境:", import.meta.env.MODE);
  websocket.init(import.meta.env.VITE_WEBSOCKET_URL, getUserInfo().idUsersinfo);
  websocket.setMessageCallback((data: any) => {
    let reData = JSON.parse(data);
    if (!isJson(reData.data)) {
      return;
    }
    reData = JSON.parse(reData.data);
    if (reData.type == "notice") {
      let temp = messageList.value.find(
        (item) => item.idMessageRecord == reData.idMessageRecord,
      );
      if (temp?.idMessageRecord) {
        return;
      }
      // messageList.value.splice(0, 0, reData);
    } else {
      let temp = auditList.value.find(
        (item) => item.idMessageRecord == reData.idMessageRecord,
      );
      if (temp?.idMessageRecord) {
        return;
      }
      // auditList.value.splice(0, 0, reData);
    }
    message(
      i18n("message.newMessage") + reData.title,
      "info",
      2500,
      i18n("message.newMessageNotification"),
      "top-right",
    );
    init();
  });
};
const dialogProps = dialogPreps();
let outerData = ref<any>({});
let noticePageInfo = ref<any>({
  currentPage: 1,
  pageSize: 20,
  totalData: 0,
  totalPage: 0,
});
let auditPageInfo = ref<any>({
  currentPage: 1,
  pageSize: 20,
  totalData: 0,
  totalPage: 0,
});
const formField = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "标题",
      fieldName: "title",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "内容",
      fieldName: "content",
      type: "markdown",
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const readMessage = (item: any) => {
  outerData.value = item;
  dialogProps.viewVisible = true;
};
const close = () => {
  dialogProps.viewVisible = false;
  updateMessage();
};
const updateMessage = async () => {
  let temp = unref(outerData);
  if (temp.type == "notice") {
    temp.statusName = "已读";
  } else {
    temp.statusName = "已处理";
  }
  temp.statusCode = "2";
  await loadData("/system-config/system/messageResult/merge", temp);
  await init();
};
const pageChangeClick = async (page: number) => {
  if (currentTab.value == "notice") {
    noticePageInfo.value.currentPage = page;
  } else {
    auditPageInfo.value.currentPage = page;
  }
  loadByPage();
};
const pageSizeClick = async (size: number) => {
  if (currentTab.value == "notice") {
    noticePageInfo.value.pageSize = size;
  } else {
    auditPageInfo.value.pageSize = size;
  }
  loadByPage();
};
const tabChange = (tab: string) => {
  currentTab.value = tab;
  loadByPage();
};

// Function to open workflow drawer based on category
const openWorkflowDrawer = (item: any) => {
  // Determine workflow type based on item category or other properties
  // For now, we'll use a default type, but this should be determined from the item data
  activeWorkflowType.value = "processing"; // This should be dynamic based on item data

  // Set the selected workflow data
  selectedWorkflowData.value = item;

  // Set drawer title
  drawerTitle.value = item.title || i18n("workflow.process.details");

  // Show the drawer
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  activeWorkflowType.value = "";
  selectedWorkflowData.value = null;
};

const handleWorkflowAction = (action: string, workflowData: any) => {
  // Handle workflow actions (claim, complete, etc.)
  console.log("Workflow action:", action, workflowData);
  // In a real implementation, you would call the appropriate API

  // Show success message
  message(
    i18n(`home.task.${action}`) || i18n("message.functionDevelopment"),
    "success",
    2500,
    i18n("message.tip"),
    "bottom-right",
  );

  // Close the drawer after action
  closeDrawer();
};

const handleWorkflowBack = () => {
  closeDrawer();
};

const createParams = (type: string) => {
  let fieldList: SearchParams[] = [];
  fieldList.push(createCondition("type", type || currentTab.value));
  let param: SearchParams = createCondition("commonFlag", "Y");
  param.orOperList = [
    createCondition("receivePersons", getUserInfo()?.username),
  ];
  fieldList.push(param);
  let orderBy: OrderByInfo[] = [
    { fieldName: "statusCode", ascOrDesc: "asc" },
    { fieldName: "createdTime", ascOrDesc: "desc" },
  ];
  return { fieldList, orderBy };
};
const loadByPage = () => {
  let params = createParams("");
  postRequest(pageUrl, {
    fieldList: params.fieldList,
    orderBy: params.orderBy,
    currentPage:
      currentTab.value == "notice"
        ? noticePageInfo.value.currentPage
        : auditPageInfo.value.currentPage,
    pageSize:
      (currentTab.value == "notice"
        ? noticePageInfo.value.pageSize
        : auditPageInfo.value.pageSize) || 20,
  })
    .then((res: any) => {
      if (res.data?.code != 0) {
        console.error(res.data.cnMessage);
        return;
      }
      let redata = res?.data.data;
      if (currentTab.value == "notice") {
        noticePageInfo.value.totalData = redata.totalDatas;
        noticePageInfo.value.totalPage = redata.totalPages;
        noticePageInfo.value.currentPage = redata.currentPage;
        noticePageInfo.value.pageSize = redata.pageSize;
        messageList.value = redata.dataList;
      } else {
        auditPageInfo.value.totalData = redata.totalDatas;
        auditPageInfo.value.totalPage = redata.totalPages;
        auditPageInfo.value.currentPage = redata.currentPage;
        auditPageInfo.value.pageSize = redata.pageSize;
        auditList.value = redata.dataList;
      }
    })
    .catch((err: any) => {
      console.log(err);
    })
    .finally(() => {
      closeLoad();
    });
};
const auditMessage = (item: any) => {
  // Open workflow drawer instead of showing function development message
  openWorkflowDrawer(item);
};
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :source="3"
    :selfFunc="true"
    @closeAction="close"
  >
    <star-horse-data-view :outerData="outerData" :field-list="formField" />
  </star-horse-dialog>

  <!-- Workflow Drawer - Show only timeline view -->
  <el-drawer
    v-model="drawerVisible"
    :title="drawerTitle"
    direction="rtl"
    size="80%"
    @close="closeDrawer"
  >
    <div class="workflow-drawer-content">
      <WorkflowTimelineView
        :workflow-type="activeWorkflowType"
        :workflow-data="selectedWorkflowData"
        @close="closeDrawer"
        @action="handleWorkflowAction"
        @back="handleWorkflowBack"
      />
    </div>
  </el-drawer>

  <el-popover
    :popper-style="{ width: 'unset !important' }"
    placement="bottom-end"
    :width="600"
    trigger="hover"
    :show-arrow="false"
  >
    <template #reference>
      <el-badge :value="totals">
        <star-horse-icon
          icon-class="messages"
          cursor="pointer"
          color="var(--star-horse-white)"
        />
      </el-badge>
    </template>
    <el-tabs v-model="currentTab" @tab-change="tabChange">
      <el-tab-pane :label="i18n('message.tab.notice')" name="notice">
        <template #label>
          <el-badge :value="totalMessages">
            {{ i18n("message.tab.notice") }}
          </el-badge>
        </template>
        <div class="message-body">
          <el-scrollbar>
            <ul class="message-list">
              <li
                class="message-item"
                v-for="(item, index) in messageList"
                :key="index"
                @click="readMessage(item)"
                :class="{
                  unread: item.statusCode == '1',
                }"
              >
                <div class="message-title">
                  <span class="message-title-name">{{ item.title }}</span>
                  <span class="message-title-time">{{
                    createDatetime(item.createdTime)
                  }}</span>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </div>
        <div class="message-footer">
          <el-pagination
            :total="noticePageInfo.totalData"
            @current-change="pageChangeClick"
            @size-change="pageSizeClick"
            :size="compSize"
            v-model:currentPage="noticePageInfo.currentPage"
            v-model:page-size="noticePageInfo.pageSize"
            v-model:pageCount="noticePageInfo.totalPage"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="i18n('message.tab.pending')" name="pending">
        <template #label>
          <el-badge :value="totalAudit">
            {{ i18n("message.tab.pending") }}
          </el-badge>
        </template>
        <div class="message-body">
          <el-scrollbar>
            <ul class="message-list">
              <li
                class="message-item"
                v-for="(item, index) in auditList"
                :key="index"
                @click="auditMessage(item)"
                :class="{
                  unread: item.statusCode == '1',
                }"
              >
                <div class="message-title">
                  <span class="message-title-name">{{ item.title }}</span>
                  <span class="message-title-time">{{
                    createDatetime(item.createdTime)
                  }}</span>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </div>
        <div class="message-footer">
          <el-pagination
            :total="auditPageInfo.totalData"
            @current-change="pageChangeClick"
            @size-change="pageSizeClick"
            :size="compSize"
            v-model:currentPage="auditPageInfo.currentPage"
            v-model:page-size="auditPageInfo.pageSize"
            v-model:pageCount="auditPageInfo.totalPage"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<style scoped lang="scss">
.message-body {
  height: 400px;
  overflow: hidden;

  .message-list {
    margin: 0;
    min-width: 450px;

    .unread {
      color: #5cb87a;

      &:hover {
        cursor: pointer;
      }
    }

    .message-item {
      line-height: 30px;

      .message-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #eee;
      }
    }
  }
}

.message-footer {
  height: 30px;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.workflow-drawer-content {
  height: 100%;
  overflow: auto;
}
</style>
