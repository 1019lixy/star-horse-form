<script setup lang="ts">
defineOptions({
  name: "PageFormItem",
});

interface FormField {
  label: string;
  prop: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

defineProps({
  fields: {
    type: Array as () => FormField[],
    default: () => []
  },
  labelPosition: {
    type: String,
    default: "right" // left, right, top
  },
  labelWidth: {
    type: String,
    default: "100px"
  },
  inline: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="relative flex flex-col flex-wrap w-full">
    <sh-form
      :label-position="labelPosition"
      :label-width="labelWidth"
      :inline="inline"
    >
      <template #default>
        <el-form-item
          v-for="field in fields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
          :required="field.required"
        >
          <el-input
            v-if="field.type === 'input'"
            :placeholder="field.placeholder"
          />
          <el-select
            v-else-if="field.type === 'select'"
            :placeholder="field.placeholder"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-date-picker
            v-else-if="field.type === 'date'"
            :placeholder="field.placeholder"
            type="date"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            :placeholder="field.placeholder"
          />
          <el-switch
            v-else-if="field.type === 'switch'"
          />
          <el-checkbox-group
            v-else-if="field.type === 'checkbox'"
          >
            <el-checkbox
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-checkbox-group>
          <el-radio-group
            v-else-if="field.type === 'radio'"
          >
            <el-radio
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-radio-group>
        </el-form-item>
      </template>
      <template #empty>
        <div class="text-center text-gray-500 py-4">
          请配置表单属性
        </div>
      </template>
    </sh-form>
  </div>
</template>

<style scoped lang="scss"></style>