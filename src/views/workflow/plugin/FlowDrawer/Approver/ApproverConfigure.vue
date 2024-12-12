<template>
  <div class="flow-setting-content">
    <div class="flow-setting-item">
      <p class="flow-setting-item-title">操作配置</p>
      <div class="flow-setting-option" v-for="(operation, i) in operations" :key="i">
        <div class="flow-setting-option-item">
          <div class="flow-setting-option-item-left">
            <star-horse-icon icon-class="config1" size="36px"/>
            <div class="flow-setting-option-desc">
              <p class="setting-option-title">{{ operation.name }}</p>
              <p class="setting-option-desc">{{ operation.content }}</p>
            </div>
          </div>
          <div class="flow-setting-option-item-switch">
            <el-switch v-model="operation.code" active-text="开" inactive-text="关"
                       @change="changeConfigure"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flow-setting-item">
      <p class="flow-setting-item-title">超时配置</p>
      <div class="flow-setting-option" v-for="(timeout, i) in timeouts" :key="i">
        <div class="flow-setting-option-item">
          <div class="flow-setting-option-item-left">
            <star-horse-icon icon-class="config1" size="36px"/>
            <div class="flow-setting-option-desc">
              <p class="setting-option-title">{{ timeout.name }}</p>
              <p class="setting-option-desc">{{ timeout.content }}</p>
            </div>
          </div>
          <div class="flow-setting-option-item-switch">
            <el-switch v-model="timeout.code" active-text="开" inactive-text="关"/>
          </div>
        </div>
      </div>
    </div>
    <div class="flow-setting-item">
      <p class="flow-setting-item-title">安全配置</p>
      <div class="flow-setting-option" v-for="(security, i) in securities" :key="i">
        <div class="flow-setting-option-item">
          <div class="flow-setting-option-item-left">
            <star-horse-icon icon-class="config1" size="36px"/>
            <div class="flow-setting-option-desc">
              <p class="setting-option-title">{{ security.name }}</p>
              <p class="setting-option-desc">{{ security.name }}</p>
            </div>
          </div>
          <div class="flow-setting-option-item-switch">
            <el-switch v-model="security.code" active-text="开" inactive-text="关"/>
          </div>
        </div>
      </div>
    </div>

    <!-- 填写密码 -->
    <star-horse-dialog :dialog-visible="passwordVisible" :box-width="scale.isMobile()?'100%':'40%'" title="填写密码"
                       @closeAction="passwordVisible = false">
      <div class="flow-setting-module">
        <el-input type="password" placeholder="输入密码"/>
      </div>
    </star-horse-dialog>
  </div>
</template>
<script setup lang="ts">
import {uuid} from "@/api/system.ts";
import {ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";


const props = defineProps({
  value: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits = defineEmits(["input"]);
let passwordVisible = ref<boolean>(false);
// 操作配置
let operations = ref<Array<any>>([
  {
    id: uuid(),
    name: '转交',
    value: '1',
    content: '转交给他人办理，依然在当前节点',
    code: 'turn',
  },
  {
    id: uuid(),
    name: '抄送',
    value: '2',
    content: '选择抄送给谁，可以在待阅和已阅中查看',
    code: 'cc',
  },
  {
    id: uuid(),
    name: '退回',
    value: '3',
    content: '退回给申请人，申请人修改完成后，流程按节点开始走',
    code: 'back',
  },
  {
    id: uuid(),
    name: '撤回',
    value: '4',
    content: '允许申请人对未进入流程（第一个流程节点为待处理状态）的申请进行撤回',
    code: 'revoke',
  },
  {
    id: uuid(),
    name: '加签',
    value: '5',
    content: '这个事情我不能完全做主，需要某些人先处理，再由我处理',
    code: 'addSign',
  },
  {
    id: uuid(),
    name: '跟踪',
    value: '6',
    content: '流程实例所有的进度我要发短信和email给我，可在我的跟踪查看',
    code: 'trace',
  },
  {
    id: uuid(),
    name: '拒绝',
    value: '7',
    content: '节点负责人可以拒绝该流程（拒绝后流程直接结束，标记为已拒绝）',
    code: 'end',
  },
]);
// 超时配置
let timeouts = ref<Array<any>>([
  {
    id: uuid(),
    name: '审批限时处理',
    value: '1',
    content: '支持自动提醒、转交等，为每条审批流设一个智能闹钟',
    code: 'timeout',
  },
]);
// 安全配置
let securities = ref<Array<any>>([
  {
    id: uuid(),
    name: '审批同意是否需要手写签名',
    value: '1',
    content: '如果全局设置了需要签字，则此处不生效',
    code: 'sign',
  },
  {
    id: uuid(),
    name: '填写密码',
    value: '1',
    content: '凭密码才能填写表单',
    code: 'password',
  },
]);
const openPasswordModal = (checked) => {
  if (checked) {
    passwordVisible.value = true;
  }
}
const changeConfigure = () => {
  emits('input', props.value);
}
</script>
