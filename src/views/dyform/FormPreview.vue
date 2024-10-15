<script setup lang="ts">
defineProps({
  list: {type: Array, required: true}
});
let formData = ref<any>({});
defineExpose({
  formData
})
</script>

<template>
  <div class="form-preview">
    <el-scrollbar height="100%" style="width: inherit">
      <template v-for="data in list">
        <component
            :field="data"
            :formData="formData"
            :is="data?.itemType+'-container'"
            v-if="data?.compType==='container'"
        >
        </component>
        <component
            :field="data"
            :formData="formData"
            :is="data?.itemType + '-item'"
            v-else-if="data?.compType=='formItem'"
        />
      </template>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.form-preview {
  border: 1px solid #e3e9f2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 99%;
  height: 100%;
  margin: 0 auto;
  padding: 5px;
}
</style>
