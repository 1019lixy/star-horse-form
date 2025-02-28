<script setup lang="ts">
  import { Config } from "@/api/settings.ts";
  import { computed, ref } from "vue";
  import { commonField } from "@/api/system.ts";

  const props = defineProps({
    list: { type: Array<any>, required: true },
    commonFieldList: { type: Array<any>, default: [] },
    compSize: { type: String, default: Config.compSize },
    formDisabled: { type: Boolean, default: false }
  });
  let commonFields = commonField();
  let fieldList = computed(() => {
    let tempList: any = [];
    props.commonFieldList
      ?.filter((item) => item.formVisible == "Y")
      .forEach((item) => {
        let tempItem = commonFields.find((item2) => item2.fieldName == item.fieldName);
        if (tempItem) {
          tempItem["required"] = item.required;
          tempItem["preps"] = { ...tempItem };
          tempList.push(tempItem);
        }
      });
    return tempList;
  });
  let formData = ref<any>({});

  defineExpose({
    formData
  });
</script>

<template>
  <div class="form-preview">
    <el-scrollbar height="100%" style="width: inherit">
      <el-form
        label-width="auto"
        label-position="left"
        require-asterisk-position="right"
        :disabled="formDisabled"
        :model="formData"
        :size="compSize"
      >
        <template v-for="data in list">
          <component
            :field="data"
            :formData="formData"
            :isDesign="false"
            :is="data?.itemType + '-container'"
            v-if="data?.compType === 'container'"
          >
          </component>
          <el-form-item
            :label="data.preps.label"
            :prop="data.preps.fieldName"
            :required="data.preps.required == 'Y'"
            v-else-if="data?.compType == 'formItem'"
          >
            <component :field="data" :formData="formData" :isDesign="false" :is="data?.itemType + '-item'" />
          </el-form-item>
        </template>
        <template v-for="data in fieldList">
          <el-form-item :label="data.label" :prop="data.fieldName" :required="data.required == 'Y'">
            <component :field="data" :formData="formData" :isDesign="false" :is="data?.type + '-item'" />
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
    margin: 5px auto;
    padding: 5px;
    flex: 1;
    overflow: hidden;
  }
</style>
