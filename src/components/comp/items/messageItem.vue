<script setup lang="ts">
import {onMounted, reactive, ref, unref} from "vue";
import {SearchParams} from "@/components/types/Params";
import {createCondition, dialogPreps, loadData} from "@/api/sh_api.ts";
import {createDatetime} from "../../../api/date_utils.ts";
import {OrderByInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import websocket from "@/api/websocket.ts";
import {getUserInfo} from "@/utils/auth.ts";

let currentTab = ref<string>("message");
let messageList = ref<any[]>([]);
let auditList = ref<any[]>([]);
let totals = ref<number>(0);
let totalMessages = ref<number>(0);
let totalAudit = ref<number>(0);
const url = "/system-config/system/messageRecord/getAllByCondition";
const init = async () => {
  let params: SearchParams[] = [];
  params.push(createCondition("type", "notice"));
  let orderBy: OrderByInfo[] = [
    {fieldName: "statusCode", ascOrDesc: "asc"},
    {fieldName: "createdTime", ascOrDesc: "desc"},
  ];
  let resultData = await loadData(url, params, orderBy);
  messageList.value = resultData.data;
  params = [];
  params.push(createCondition("type", "pending"));
  resultData = await loadData(url, params, orderBy);
  auditList.value = resultData.data;
  reCount();
  webSocketOperation();
}
const reCount = () => {
  totalMessages.value = messageList.value.filter(item => item.statusCode == "1")?.length || 0;
  totalAudit.value = auditList.value.filter(item => item.statusCode == "1")?.length || 0;
  totals.value = totalMessages.value + totalAudit.value;
}
const webSocketOperation = () => {
  websocket.init("127.0.0.1:8749/system-config-dev/websocket/socketHandler", getUserInfo().idUsersinfo);
  websocket.setMessageCallback((data: any) => {
    let reData = JSON.parse(data);
    reData = JSON.parse(reData.data);
    if (reData.type == "notice") {
      let temp = messageList.value.find(item => item.idMessageRecord == reData.idMessageRecord);
      if (temp?.idMessageRecord) {
        return;
      }
      messageList.value.splice(0, 0, reData);
    } else {
      let temp = auditList.value.find(item => item.idMessageRecord == reData.idMessageRecord);
      if (temp?.idMessageRecord) {
        return;
      }
      auditList.value.splice(0, 0, reData);
    }
    console.log(messageList.value,auditList.value);
    reCount();
  });
}
const dialogProps = dialogPreps();
let outerData = ref<any>({});
const formField = reactive<PageFieldInfo>({
  fieldList: [{
    label: "标题",
    fieldName: "title",
    type: "input",
    required: true,
    formShow: !false,
    tableShow: !false,
  }, {
    label: "内容",
    fieldName: "content",
    type: "markdown",
    required: true,
    formShow: !false,
    tableShow: !false,
  },]
})
const readMessage = (item: any) => {
  outerData.value = item;
  dialogProps.viewVisible = true;
}
const close = () => {
  dialogProps.viewVisible = false;
  updateMessage();
}
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
}
const auditMessage = (item: any) => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true" self-func="true" @closeAction="close">
    <star-horse-data-view :outerData="outerData" :field-list="formField"/>
  </star-horse-dialog>
  <el-popover :popper-style="{width: 'unset !important'}" placement="bottom-end" :width="600" trigger="hover"
              :show-arrow="false">
    <template #reference>
      <el-badge :value="totals">
        <star-horse-icon icon-class="messages" color="var(--star-horse-white)"/>
      </el-badge>
    </template>
    <el-tabs v-model="currentTab">
      <el-tab-pane label="消息" name="message">
        <template #label>
          <el-badge :value="totalMessages">
            消息
          </el-badge>
        </template>
        <ul class="message-list">
          <li class="message-item" v-for="(item,index) in messageList" :key="index"
              @click="readMessage(item)"
              :class="{
            'unread': item.statusCode == '1'
           }"
          >
            <div class="message-title">
              <span class="message-title-name">{{ item.title }}</span>
              <span class="message-title-time">{{ createDatetime(item.createdTime) }}</span>
            </div>
          </li>
        </ul>

      </el-tab-pane>
      <el-tab-pane label="待办" name="dealt">
        <template #label>
          <el-badge :value="totalAudit">
            待办
          </el-badge>
        </template>
        <ul class="message-list">
          <li class="message-item" v-for="(item,index) in auditList" :key="index"
              @click="auditMessage(item)"
              :class="{
            'unread': item.statusCode == '1'
           }"
          >
            <div class="message-title">
              <span class="message-title-name">{{ item.title }}</span>
              <span class="message-title-time">{{ createDatetime(item.createdTime) }}</span>
            </div>
          </li>
        </ul>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<style scoped lang="scss">
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
</style>
