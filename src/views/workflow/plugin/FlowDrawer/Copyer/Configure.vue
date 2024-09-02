<template>
  <div class="flow-setting-content">
    <div class="flow-setting-item">
      <p class="flow-setting-item-title">配置</p>
      <div class="flow-setting-option" v-for="(operation, i) in operations" :key="i">
        <div class="flow-setting-option-item">
          <div class="flow-setting-option-item-left">
            <img :src="flowMixin.optionIcon"/>
            <div class="flow-setting-option-desc">
              <p class="setting-option-title">{{ operation.name }}</p>
              <p class="setting-option-desc">{{ operation.content }}</p>
            </div>
          </div>
          <div class="flow-setting-option-item-switch">
            <a-switch v-model="value[operation.code]" checked-children="开" un-checked-children="关"
                      @change="changeConfigure"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '../../mixins/flowMixin';
import {ref} from "vue";
import {uuid} from "vue-uuid";

const props = defineProps({
  value: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits = defineEmits(["input"]);
let operations = ref<Array<any>>([
  {
    id: uuid(),
    name: '发起人填写',
    value: '1',
    content: '允许发起人添加抄送人',
    code: 'customCc',
  },
]);
const changeConfigure = () => {
  emits('input', props.value);
}
</script>
