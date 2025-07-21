<template>
  <div class="flow-module">
    <div class="flow-content">
      <el-form label-position="top">
        <div class="flow-item">
          <p class="flow-item-title">事件类型</p>
          <div class="flow-option">
            <div class="flow-item">
              <div class="flow-item-left">
                <star-horse-icon icon-class="config1" size="36px" />
                <div class="flow-desc">
                  <p class="option-title">前置事件</p>
                  <p class="option-desc">用于节点前,常用于数据校验</p>
                </div>
              </div>
              <div class="flow-item-switch">
                <el-switch
                  v-model="node.preDataValid"
                  active-text="开"
                  inactive-text="关"
                />
              </div>
            </div>
            <div class="flow-item" v-if="node.preDataValid">
              <el-input
                type="textarea"
                v-model="node.preContext"
                :size="flowCommon.size"
                class="w-full"
                placeholder="前置事件配置"
              />
            </div>
          </div>
          <div class="flow-option">
            <div class="flow-item">
              <div class="flow-item-left">
                <star-horse-icon icon-class="config1" size="36px" />
                <div class="flow-desc">
                  <p class="option-title">后置事件</p>
                  <p class="option-desc">用于节点后,常用于数据落地保存</p>
                </div>
              </div>
              <div class="flow-item-switch">
                <el-switch
                  v-model="node.afterDataValid"
                  active-text="开"
                  inactive-text="关"
                />
              </div>
            </div>
            <div class="flow-item" v-if="node.afterDataValid">
              <el-input
                type="textarea"
                v-model="node.afterContext"
                :size="flowCommon.size"
                class="w-full"
                placeholder="后置事件配置"
              />
            </div>
          </div>
          <div class="flow-option">
            <div class="flow-item">
              <div class="flow-item-left">
                <star-horse-icon icon-class="config1" size="36px" />
                <div class="flow-desc">
                  <p class="option-title">WebHook</p>
                  <p class="option-desc">远程API调用</p>
                </div>
              </div>
              <div class="flow-item-switch">
                <el-switch
                  v-model="node.apiFlag"
                  active-text="开"
                  inactive-text="关"
                />
              </div>
            </div>
          </div>
          <div class="flow-item" v-if="node.apiFlag">
            <el-input
              type="textarea"
              v-model="node.apiContext"
              :size="flowCommon.size"
              class="w-full"
              placeholder="配置回调接口"
            />
          </div>
        </div>
      </el-form>
    </div>
  </div>
  <FlowDrawerFooter @close="onClose" />
</template>
<script setup lang="ts" name="Event">
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon';
import {useFlowDesignStore} from '@/store/FlowDesign';
import {piniaInstance} from 'star-horse-lowcode';
import {ModelRef} from 'vue';

let node: ModelRef<any> = defineModel('activeData');
const flowDesign = useFlowDesignStore(piniaInstance);
const onClose = () => {
  flowDesign.setActive(false);
};
</script>
