<template>
  <div class="flow-content">
    <div class="flow-item">
      <p class="flow-item-title">配置</p>
      <div class="flow-option" v-for="(operation, i) in operations" :key="i">
        <div class="flow-item">
          <div class="flow-item-left">
            <star-horse-icon icon-class="config1" size="36px" :border="true" />
            <div class="flow-desc">
              <p class="option-title">{{ operation.attrName }}</p>
              <p class="option-desc">{{ operation.defaultValue }}</p>
            </div>
          </div>
          <div class="flow-item-switch">
            <el-switch
              v-model="config[operation.attrValue]"
              active-value="Y"
              inactive-value="N"
              active-text="开"
              inactive-text="关"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useVModel} from '@vueuse/core';
import {createCondition, postRequest} from 'star-horse-lowcode';

defineOptions({
  name: 'CopyerConfigure',
});
const props = defineProps({
  modelValue: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits = defineEmits(['update:modelValue']);
let config = useVModel(props, 'modelValue', emits);
let operations = ref<Array<any>>([]);
const init = () => {
  postRequest(
    '/userdb-manage/userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357/getAllByCondition',
    {
      fieldList: [createCondition('idFlowNode', 'cc_advance_config')],
      orderBy: [{ fieldName: 'createdTime', ascOrDesc: 'ASC' }],
    },
  ).then((res) => {
    if (res.data.code) {
      console.log(res.data.cnMessage);
      return;
    }
    operations.value = res.data.data;
  });
};
onMounted(() => {
  init();
});
</script>
