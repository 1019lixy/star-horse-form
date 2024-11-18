<script setup lang="ts">
import {Config} from "@/api/settings.ts";
import {ref} from "vue";

defineProps({
  list: {type: Array<any>, required: true},
  compSize: {type: String, default: Config.compSize}
});
let formData = ref<any>({});
defineExpose({
  formData
})
</script>

<template>
  <div class="form-preview">
    <el-scrollbar height="100%" style="width: inherit">
      <el-form
          label-width="auto"
          label-position="left"
          require-asterisk-position="right"
          :model="formData"
          :size="compSize"
      >
        <template v-for="data in list">
          <component
              :field="data"
              :formData="formData"
              :isDesign="false"
              :is="data?.itemType+'-container'"
              v-if="data?.compType==='container'"
          >
          </component>
          <el-form-item :label="data.preps.label" :prop="data.preps.fieldName" :required="data.preps.required=='Y'"
                        v-else-if="data?.compType=='formItem'">
            <component
                :field="data"
                :formData="formData"
                :isDesign="false"
                :is="data?.itemType + '-item'"

            />
          </el-form-item>
        </template>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.form-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 99%;
  height: 100%;
  margin: 0 auto;
  padding: 5px;
  flex: 1;
  overflow: hidden;
}
</style>
