<script setup lang="ts">
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon.ts';
import {ref} from 'vue';

let radioGroup = ref<number>(0);
</script>
<template>
  <div class="flow-module">
    <div class="flow-content">
      <div class="flow-block">
        <div class="flow-block-title">打印模板</div>
        <div class="flow-block-desc">通过设置推送提醒指定成员填写表单</div>
        <div class="flow-block-content">
          <el-radio-group v-model="radioGroup" :size="flowCommon.size" :default-value="1">
            <el-radio :value="1">
              默认
            </el-radio>
            <el-radio :value="2">
              自定义打印模板
            </el-radio>
          </el-radio-group>
          <div class="flow-block-tabContent">
            <div class="flow-block-defaultTab">
              <div class="flow-block-defaultTpl">
                <span class="flow-block-var">提交人</span>
                <span>的</span>
                <span class="flow-block-var">表单名称</span>
              </div>
              <div class="flow-block-defaultSample">示例：张三的业绩上报、李四的请假</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang=“scss”></style>
