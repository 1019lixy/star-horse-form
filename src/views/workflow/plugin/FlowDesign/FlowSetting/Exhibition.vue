<template>
  <div class="flow-setting-module">
    <div class="flow-setting-content">
      <div class="flow-setting-block">
        <div class="flow-block-title">标题设置</div>
        <div class="flow-block-desc">通过设置数据的显示标题，快速识别一条数据</div>
        <div class="flow-block-content">
          <el-radio-group v-model="radioGroup" :size="flowMixin.size" :default-value="1">
            <el-radio :value="1">
              默认
            </el-radio>
            <el-radio :value="2">
              自定义模式
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
      <div class="flow-setting-block" style="margin-top: 32px;">
        <div class="flow-block-title">摘要设置</div>
        <div class="flow-block-desc">自定义表单摘要展示信息，灵活设置提升工作效率</div>
        <div class="flow-block-content">
          <el-radio-group v-model="radioGroup2" :size="flowMixin.size" :default-value="1">
            <el-radio :value="1">
              默认
            </el-radio>
            <el-radio :value="2">
              自定义模式
            </el-radio>
          </el-radio-group>
          <div class="flow-block-tabContent">
            <div class="flow-block-defaultTab">
              <div class="flow-block-defaultTpl">
                <span>默认设置（展示表单中前3个字段，必填字段优先）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {ref} from "vue";

let radioGroup = ref<number>(0);
let radioGroup2 = ref<number>(0);
</script>
<style lang=“scss”></style>
