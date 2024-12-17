<template>
  <el-row :gutter="16">
    <el-col v-for="(item, i) in items" :key="i" :xs="24" :sm="24" :md="6" :lg="6" :xl="6" style="margin-bottom: 10px">
      <el-card hoverable class="w-fill card-xx" @click="setSetting(item)">
        <div class="flowSetting-card-header">
          <div class="flowSetting-card-header-title">
            <img :src="flowMixin.settingBaseIcon"/>
            <span>{{ item.name }}</span>
          </div>
          <div @click.stop>
            <!-- 阻止el-switch冒泡事件, 在父添加@click.stop-->
            <el-switch v-model="item.checked"/>
          </div>
        </div>
        <div class="flowSetting-card-des">
          {{ item.des }}
        </div>
      </el-card>
    </el-col>
  </el-row>
  <!-- 自动去重设置 -->
  <star-horse-dialog :dialog-visible="duplicateVisible" :box-width="scale.isMobile() ? '100%' : '40%'"
                     class="modalClass"
                     title="自动去重设置" @closeAction="duplicateVisible = false">
    <div class="flow-setting-module">
      <div class="flow-setting-content">
        <div class="flow-setting-block">
          <!-- <div class="flow-block-title">审批人设置</div>
          <div class="flow-block-desc">审批流程中审批人重复出现时</div> -->
          <div class="flow-block-content">
            <el-checkbox style="margin-bottom: 20px;">审批人是流程发起人时自动通过</el-checkbox>
            <br/>
            <el-checkbox style="margin-bottom: 20px;">审批人为空时自动通过</el-checkbox>
            <br/>
            <el-checkbox style="margin-bottom: 20px;">已经审批过的审批人自动通过</el-checkbox>
            <div class="flow-block-tabContent">
              <div class="flow-block-defaultTab">
                <div class="flow-block-defaultSample">示例：张三的业绩上报、李四的请假</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img class="w-fill"
           src="https://img.alicdn.com/imgextra/i3/O1CN01aoqAoi1MwaOr3pnmz_!!6000000001499-2-tps-1344-600.png"/>
      <img class="w-fill"
           src="https://img.alicdn.com/imgextra/i4/O1CN01Uehnoq1eesAPq0rlm_!!6000000003897-2-tps-1360-920.png"/>
    </div>
  </star-horse-dialog>
  <!-- 允许加签 -->
  <star-horse-dialog :dialog-visible="appendVisible" :box-width="scale.isMobile() ? '100%' : '40%'" class="modalClass"
                     title="允许加签"
                     @closeAction="appendVisible = false">
    <div class="flow-setting-module">
      <img class="w-fill"
           src="https://img.alicdn.com/imgextra/i2/O1CN01sONUxT1vSpDcicfBb_!!6000000006172-2-tps-1360-1090.png"/>
    </div>
  </star-horse-dialog>
  <!-- 审批撤销 -->
  <star-horse-dialog :dialog-visible="revokeVisible" :box-width="scale.isMobile() ? '100%' : '40%'" class="modalClass"
                     title="审批撤销"
                     @closeAction="revokeVisible = false">
    <div class="flow-setting-module">
      <img class="w-fill"
           src="https://img.alicdn.com/imgextra/i4/O1CN01mfeF241w8xed2adqL_!!6000000006264-2-tps-1360-920.png"/>
    </div>
  </star-horse-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__body), .el-card__body {
  padding: 20px !important;
}

</style>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";

const props = defineProps({
  read: {
    type: Boolean,
    default: false,
  },
  designPath: {
    type: String,
    default: '/design',
  },
});
// 自动去重设置
let duplicateVisible = ref<boolean>(false);
// 允许加签
let appendVisible = ref<boolean>(false);
// 审批撤销
let revokeVisible = ref<boolean>(false);
let items = ref<Array<any>>([
  {
    id: '',
    name: '自动去重',
    des: '审批流程中审批人重复出现时，只需审批一次其余自动通过',
    checked: true,
    code: 'duplicateVisible',
    icon: '',
  },
  {
    id: '',
    name: '秒批设置',
    des: '若审批人浏览单据小于3秒或通过快捷审批处理，系统会在审批记录中进行标记',
    checked: true,
    code: 'duplicateVisible',
    icon: '',
  },
  {
    id: '',
    name: '快捷审批',
    des: '可在审批bot的消息卡片、移动端列表卡片上进行快捷操作，无需进入具体详情页操作',
    checked: true,
    code: 'duplicateVisible',
    icon: '',
  },
  /* {
    id: '',
    name: '批量审批',
    des: '可在审批bot的消息卡片、移动端列表卡片上进行快捷操作，无需进入具体详情页操作',
    checked: true,
    code: 'duplicateVisible',
    icon: '',
  }, */
  {
    id: '',
    name: '允许加签',
    des: '开启后审批单可以新增临时审批人',
    checked: true,
    code: 'appendVisible',
    icon: '',
  },
  {
    id: '',
    name: '允许抄送',
    des: '审批流程中审批人可以添加抄送人(传阅人)',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '允许催办',
    des: '审批流程中允许发起人催办',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '允许分享',
    des: '开启后流程中人员可以将流程分享给流程外的其他人员',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '指定审批人',
    des: '审批流程中审批人可以允许指定下一步审批人,不设置就使用默认审批人',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '审批撤销',
    des: '开启后下一步未办理的任务，可进行取回撤销重做任务',
    checked: true,
    code: 'revokeVisible',
    icon: '',
  },
  {
    id: '',
    name: '审批转交',
    des: '开启后发起人可以将审批单转交指定人处理',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '代他人提交',
    des: '开启后指定人员可代他人提交审批',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '审批退回',
    des: '退回到指定环节，退回到上一步，退回到发起人',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '委托任务',
    des: '将任务委托给他人，他人办理完成后再回到委托人',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '自由流程',
    des: '根据环节选择，自由跳转到指定环节，特事特办',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '作废流程',
    des: '允许发起人快速终止流程，管理员维护终止流程',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '审批意见',
    des: '设置审批功能是否必填、评语可见范围、是否允许他们代提交',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '任务节点',
    des: '开启后处理人员可以查看任务节点过程',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '限时审批',
    des: '设置审批时间限制，自动提醒、转交、同意',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '效率诊断',
    des: '该流程数据不纳入效率统计,在效率诊断中排除该流程的审批耗时数据',
    checked: false,
    icon: '',
  },
  {
    id: '',
    name: '手写签名',
    des: '开启后审批人必须手写签名方可同意审批',
    checked: false,
    icon: '',
  },
]);
const setSetting = (item:any) => {
  console.log('item', item);
  if (item.code == 'duplicateVisible') {
    duplicateVisible.value = true;
  } else if (item.code == 'appendVisible') {
    appendVisible.value = true;
  } else if (item.code == 'revokeVisible') {
    revokeVisible.value = true;
  }

}
</script>
<style lang=“scss”></style>
