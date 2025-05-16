<script setup lang="ts">
import {uuid} from "star-horse-lowcode";
import {ModelRef, onMounted, ref} from "vue";
import {scale} from "@/views/workflow/plugin/utils/deviceUtil.ts";

defineOptions({
  name: "ApproverConfigure"
});
const configure: ModelRef<any> = defineModel("configure");
let currentForm = ref<any>({});
let passwordVisible = ref<boolean>(false);
// 操作配置
let operations = ref<Array<any>>([
  {
    id: uuid(),
    name: "同意",
    value: "1",
    icon: "flow-agree",
    content: "审批通过，流转到下一个节点",
    code: "complete"
  },
  {
    id: uuid(),
    name: "转交",
    value: "1",
    icon: "flow-turn",
    content: "转交给他人办理，依然在当前节点",
    code: "turn"
  },
  {
    id: uuid(),
    name: "抄送",
    value: "2",
    icon: "flow-cc",
    content: "选择抄送给谁，可以在待阅和已阅中查看",
    code: "cc"
  },
  {
    id: uuid(),
    name: "退回",
    value: "3",
    icon: "flow-back",
    content: "退回给申请人，申请人修改完成后，流程按节点开始走",
    code: "back"
  },
  {
    id: uuid(),
    name: "撤回",
    value: "4",
    icon: "flow-revoke",
    content: "允许申请人对未进入流程（第一个流程节点为待处理状态）的申请进行撤回",
    code: "revoke"
  },
  {
    id: uuid(),
    name: "加签",
    value: "5",
    icon: "flow-add-user",
    content: "这个事情我不能完全做主，需要某些人先处理，再由我处理",
    code: "addSign"
  },
  {
    id: uuid(),
    name: "减签",
    value: "5",
    icon: "flow-reduce-user",
    content: "在当前任务中减少处理人员数量，以简化流程或重新分配责任",
    code: "subSign"
  },
  {
    id: uuid(),
    name: "跟踪",
    value: "6",
    icon: "flow-trace",
    content: "流程实例所有的进度需要发短信和email给我，可在我的跟踪查看",
    code: "trace"
  },
  {
    id: uuid(),
    name: "拒绝",
    value: "7",
    icon: "flow-reject",
    content: "节点负责人可以拒绝该流程（拒绝后流程直接结束，标记为已拒绝）",
    code: "end"
  },
  {
    id: uuid(),
    name: "委派",
    value: "8",
    icon: "user-add",
    content: "将当前任务暂时交由他人处理，待其完成后再交回自己处理",
    code: "delegate"
  }
]);
// 超时配置
let timeouts = ref<Array<any>>([
  {
    id: uuid(),
    name: "审批限时处理",
    value: "1",
    icon: "timer",
    content: "支持自动提醒、转交等，为每条审批流设一个智能闹钟",
    code: "timeout"
  }
]);
// 安全配置
let securities = ref<Array<any>>([
  {
    id: uuid(),
    name: "审批同意是否需要手写签名",
    value: "1",
    icon: "sign",
    content: "如果全局设置了需要签字，则此处不生效",
    code: "sign"
  },
  {
    id: uuid(),
    name: "填写密码",
    value: "1",
    icon: "password",
    content: "凭密码才能填写表单",
    code: "password"
  }
]);
const openPasswordModal = (checked: any, security: any) => {
  currentForm.value = security;
  if (checked && security.code == "password") {
    passwordVisible.value = true;
  }
};
const changeConfigure = () => {
};
const init = () => {
  let datas: Array<any> = [...operations.value, ...timeouts.value, ...securities.value];
  datas.forEach((item) => {
    if (Object.keys(configure.value).includes(item.code)) {
      item.value = configure.value[item.code];
    }
  });
};
onMounted(() => {
  init();
});
</script>
<template>
  <el-scrollbar>
    <div class="flow-content">
      <div class="flow-item">
        <p class="flow-item-title">操作配置</p>
        <div class="flow-option" v-for="(operation, i) in operations" :key="i">
          <div class="flow-item">
            <div class="flow-item-left">
              <star-horse-icon :icon-class="operation.icon" size="36px" boxShow="true"/>
              <div class="flow-desc">
                <p class="option-title">{{ operation.name }}</p>
                <p class="option-desc">{{ operation.content }}</p>
              </div>
            </div>
            <div class="flow-item-switch">
              <el-switch
                  v-model="configure[operation.code]"
                  active-text="开"
                  inactive-text="关"
                  @change="changeConfigure"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <p class="flow-item-title">超时配置</p>
        <div class="flow-option" v-for="(timeout, i) in timeouts" :key="i">
          <div class="flow-item">
            <div class="flow-item-left">
              <star-horse-icon :icon-class="timeout.icon" size="36px" boxShow="true"/>
              <div class="flow-desc">
                <p class="option-title">{{ timeout.name }}</p>
                <p class="option-desc">{{ timeout.content }}</p>
              </div>
            </div>
            <div class="flow-item-switch">
              <el-switch v-model="configure[timeout.code]" active-text="开" inactive-text="关"/>
            </div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <p class="flow-item-title">安全配置</p>
        <div class="flow-option" v-for="(security, i) in securities" :key="i">
          <div class="flow-item">
            <div class="flow-item-left">
              <star-horse-icon :icon-class="security.icon" size="36px" boxShow="true"/>
              <div class="flow-desc">
                <p class="option-title">{{ security.name }}</p>
                <p class="option-desc">{{ security.name }}</p>
              </div>
            </div>
            <div class="flow-item-switch">
              <el-switch
                  v-model="configure[security.code]"
                  active-text="开"
                  inactive-text="关"
                  @change="(checked) => openPasswordModal(checked, security)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="height: 30px"/>
  </el-scrollbar>
  <!-- 填写密码 -->
  <star-horse-dialog
      self-func="true"
      :dialog-visible="passwordVisible"
      @merge="passwordVisible = false"
      :box-width="scale.isMobile() ? '100%' : '40%'"
      title="填写密码"
      @closeAction="passwordVisible = false"
  >
    <el-input type="password" v-model="configure.passwordValue" placeholder="输入密码"/>
  </star-horse-dialog>
</template>
<style scoped lang="scss">
.flow-item-title {
  font-weight: 800;
}
</style>
