<template>
  <div class="flow-setting-module">
    <div class="flow-setting-content">
      <el-form label-position="top">
        <div class="flow-setting-item">
          <el-form-item name="name" label="节点名称">
            <el-input v-model="node.name" :size="flowCommon.size" class="w-full" placeholder="节点名称"/>
          </el-form-item>
        </div>
        <div class="flow-setting-item">
          <p class="flow-setting-item-title">事件类型</p>
          <div class="flow-setting-option">
            <div class="flow-setting-option-item">
              <div class="flow-setting-option-item-left">
                <star-horse-icon icon-class="config1" size="36px"/>
                <div class="flow-setting-option-desc">
                  <p class="setting-option-title">前置事件</p>
                  <p class="setting-option-desc">用于节点前,常用于数据校验</p>
                </div>
              </div>
              <div class="flow-setting-option-item-switch">
                <el-switch v-model="node.preDataValid" active-text="开" inactive-text="关"/>
              </div>
            </div>
            <div class="flow-setting-item" v-if="node.preDataValid">
              <el-input type="textarea" v-model="node.preContext" :size="flowCommon.size" class="w-full"
                        placeholder="前置事件配置"/>
            </div>
          </div>
          <div class="flow-setting-option">
            <div class="flow-setting-option-item">
              <div class="flow-setting-option-item-left">
                <star-horse-icon icon-class="config1" size="36px"/>
                <div class="flow-setting-option-desc">
                  <p class="setting-option-title">后置事件</p>
                  <p class="setting-option-desc">用于节点后,常用于数据落地保存</p>
                </div>
              </div>
              <div class="flow-setting-option-item-switch">
                <el-switch v-model="node.afterDataValid" active-text="开" inactive-text="关"/>
              </div>
            </div>
            <div class="flow-setting-item" v-if="node.afterDataValid">
              <el-input type="textarea" v-model="node.afterContext" :size="flowCommon.size" class="w-full"
                        placeholder="后置事件配置"/>
            </div>
          </div>
          <div class="flow-setting-option">
            <div class="flow-setting-option-item">
              <div class="flow-setting-option-item-left">
                <star-horse-icon icon-class="config1" size="36px"/>
                <div class="flow-setting-option-desc">
                  <p class="setting-option-title">WebHook</p>
                  <p class="setting-option-desc">远程API调用</p>
                </div>
              </div>
              <div class="flow-setting-option-item-switch">
                <el-switch v-model="node.apiFlag" active-text="开" inactive-text="关"/>
              </div>
            </div>
          </div>
          <div class="flow-setting-item" v-if="node.apiFlag">
            <el-input type="textarea" v-model="node.apiContext" :size="flowCommon.size" class="w-full"
                      placeholder="配置回调接口"/>
          </div>
        </div>


      </el-form>
    </div>
  </div>
  <FlowDrawerFooter @close="onClose"/>
</template>
<script setup lang="ts" name="Event">
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon.ts';
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

let node: ModelRef<any> = defineModel("activeData");
const flowDesign = useFlowDesign(piniaInstance);
const onClose = () => {
  flowDesign.setActive(false);
}

</script>
