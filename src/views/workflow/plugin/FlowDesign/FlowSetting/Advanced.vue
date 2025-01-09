<script setup lang="ts">
import {onMounted, ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";
import {ApiUrls} from "@/components/types/ApiUrls";
import {apiInstance, createCondition} from "@/api/sh_api.ts";

const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/categoryItemConfig");
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
let items = ref<Array<any>>([]);
const setSetting = (item: any) => {
  console.log('item', item);
  if (item.code == 'duplicateVisible') {
    duplicateVisible.value = true;
  } else if (item.code == 'appendVisible') {
    appendVisible.value = true;
  } else if (item.code == 'revokeVisible') {
    revokeVisible.value = true;
  }

}
const init = async () => {
  let params = [createCondition("a.cfgCategory", "basic")];
  let res = await dataUrl.queryConditionAction!(params);
  items.value = res.data;
}
onMounted(() => {
  init();
})
</script>
<template>
  <el-row :gutter="16">
    <el-col v-for="item in items" :key="item.idCategoryItemConfig" :xs="24" :sm="24" :md="6" :lg="6" :xl="6"
            style="margin-bottom: 10px">
      <el-card hoverable class="w-fill card-xx" @click="setSetting(item)">
        <div class="flowSetting-card-header">
          <div class="flowSetting-card-header-title">
            <star-horse-icon icon-class="document" size="22px" boxShow="true"/>
            <span>{{ item.name }}</span>
          </div>
          <div @click.stop>
            <!-- 阻止el-switch冒泡事件, 在父添加@click.stop-->
            <el-switch v-model="item.checkedFlag" active-value="Y" inactive-value="N"/>
          </div>
        </div>
        <div class="flowSetting-card-des">
          {{ item.description }}
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
