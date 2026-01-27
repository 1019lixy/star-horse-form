<script lang="ts" setup>
import {FormConfig} from "@/components/types";
import {StarHorseIcon} from "star-horse-lowcode";
import {ref} from "vue";
import {ClickOutside as vClickOutside, PopoverInstance} from "element-plus";
import GroupUsers from "@/components/system/items/form/components/coorperation/GroupUsers.vue";
import ChatDialog from "@/components/system/items/form/components/coorperation/ChatDialog.vue";
import MeetingDialog from "@/components/system/items/form/components/coorperation/MeetingDialog.vue";

const props = defineProps<{
  optional: FormConfig;
}>();
const userListVisible = ref<boolean>(false);
const userAddRef = ref();
const formStatusRef = ref();
const userListPopoverRef = ref<PopoverInstance>();
const userAddPopoverRef = ref<PopoverInstance>();
const formStatusPopoverRef = ref<PopoverInstance>();
const onClickOutside = () => {
  userListPopoverRef?.value?.hide?.();
  userAddPopoverRef?.value?.hide?.();
  formStatusPopoverRef?.value?.hide?.();
};
const chatDialogVisible = ref<boolean>(false);
const meetingDialogVisible = ref<boolean>(false);
const groupOperation = (type: string) => {
  if (type == "chat") {
    chatDialogVisible.value = true;
  } else if (type == "meeting") {
    meetingDialogVisible.value = true;
  }
};
</script>

<template>
  <ChatDialog v-model:visible="chatDialogVisible" title="XX表单交流"/>
  <MeetingDialog v-model:visible="meetingDialogVisible" title="XX表单会议"/>
  <div class="h-full flex justify-center items-center flex-row gap-15">
    <el-tooltip content="7人">
      <star-horse-icon ref="userListRef" cursor="pointer" icon-class="user-edit" @click.stop="userListVisible=true"/>
    </el-tooltip>
    <el-tooltip content="邀请用户">
      <star-horse-icon ref="userAddRef" cursor="pointer" icon-class="user-add" v-click-outside="onClickOutside"/>
    </el-tooltip>
    <el-tooltip content="表单状态">
      <star-horse-icon ref="formStatusRef" cursor="pointer" icon-class="form" v-click-outside="onClickOutside"/>
    </el-tooltip>
  </div>

  <el-drawer
      ref="userListPopoverRef"
      v-model="userListVisible"
      size="350"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="flex items-center justify-start">人员列表</h3>
        <el-dropdown @command="groupOperation">
          <span class="cursor-pointer text-blue-500 flex items-center pr-4">
            <star-horse-icon iconClass="user-circle" color="#fff"/>
            <el-icon class="el-icon--right">
              <arrow-down/>
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="chat">发起聊天</el-dropdown-item>
              <el-dropdown-item command="meeting">发起会议</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <template #default>
      <el-card class="w-full">
        <div class="flex justify-center items-center w-[90%] my-3 mx-auto gap-5">
          <div class="flex justify-center items-center cursor-pointer rounded-sm border border-gray-200 h-[35px] flex-1">
            <star-horse-icon iconClass="user-add"/>
            添加人员
          </div>
          <div class="flex justify-center items-center cursor-pointer rounded-sm border border-gray-200 h-[35px] flex-1">
            <star-horse-icon iconClass="user-edit"/>
            邀请成员加入
          </div>
        </div>
        <el-card class="w-full flex px-5 py-2">
          <div class="w-full flex flex-col justify-start">
            <h3 class="font-bold my-3 justify-start flex">正在看.2</h3>
            <div class="flex flex-col w-full">
              <GroupUsers type="online"/>
            </div>
          </div>
          <div class="w-full flex-col flex justify-start">
            <h3 class="font-bold my-3 justify-start flex">其它成员.5</h3>
            <div class="flex flex-col w-full">
              <GroupUsers/>
            </div>
          </div>
        </el-card>
      </el-card>
    </template>
  </el-drawer>
  <el-popover
      ref="userAddPopoverRef"
      :virtual-ref="userAddRef"
      trigger="click"
      width="300"
      title="邀请人员"
      virtual-triggering
  >
    <el-card>
    </el-card>
  </el-popover>
  <el-popover
      ref="formStatusPopoverRef"
      :virtual-ref="formStatusRef"
      trigger="click"
      width="300"
      title="表单状态"
      virtual-triggering
  >
    <el-card>
    </el-card>
  </el-popover>
</template>
