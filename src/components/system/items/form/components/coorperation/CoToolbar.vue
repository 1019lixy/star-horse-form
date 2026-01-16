<script lang="ts" setup>
import {FormConfig} from "@/components/types";
import {StarHorseIcon} from "star-horse-lowcode";
import {ref} from "vue";
import {ClickOutside as vClickOutside, PopoverInstance} from "element-plus";

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
  userListPopoverRef.value?.hide();
  userAddPopoverRef.value?.hide();
  formStatusPopoverRef.value?.hide();
};
</script>

<template>
  <div class="h-full flex justify-center items-center flex-row gap-2">
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
      width="200"
      header-class="hstyle"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
  >
    <template #header>
      <div class="flex justify-between items-center"><h3>人员列表</h3>
        <el-dropdown>
    <span class="el-dropdown-link">
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
      <el-card class="inner_content w-full">
        <div class="flex justify-between items-center w-full my-3 mx-3">
          <div class="flex justify-center items-center pointer rounded-sm border-[#f1f1f1] border-1 h-[35px]  flex-1">
            <star-horse-icon iconClass="user-add"/>
            添加人员
          </div>
          <div class="flex justify-center items-center pointer rounded-sm border-[#f1f1f1] border-1 h-[35px] flex-1">
            <star-horse-icon iconClass="user-edit"/>
            邀请成员加入
          </div>
        </div>
        <el-card class="inner_content w-full flex">
          <div class="w-full flex justify-start">
            <h3>正在看(2)</h3>
          </div>
          <div class="w-full  flex justify-start">
            <h3>其它成员(5)</h3>
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
    <el-card class="inner_content">
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
    <el-card class="inner_content">
    </el-card>
  </el-popover>
</template>

<style scoped lang="scss">
.hstyle {
  display: flex;
  align-items: center;
  justify-content: start;

  h3 {
    display: inline-flex;
    justify-content: start;
  }
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  padding-right: 1rem;
}
</style>
