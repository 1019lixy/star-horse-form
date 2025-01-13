<script setup lang="ts">
import {useVModel} from '@vueuse/core'
import DataTag from '@/components/comp/utils/DataTag.vue';
import DataPicker, {type ModelValueType} from '@/components/comp/utils/DataPicker.vue';
import {useFormDisabled, useFormSize} from 'element-plus'
import type {CSSProperties} from 'vue'
import {computed, ref} from 'vue';
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

export interface DataSelectorProps {
  modelValue: ModelValueType
  placeholder?: string
  dataUrl?: string,
  datas?: Array<any>,
  pageSize?: number,
  title?: string,
  compSize?: string,
  displayName?: string,
  displayValue?: string,
  multiple?: boolean
  disabled?: boolean
  style?: CSSProperties
}

const props = withDefaults(defineProps<DataSelectorProps>(), {
  multiple: false,
  disabled: false,
  compSize: 'small',
  pageSize: 0,
  displayName: 'name',
  displayValue: 'value',
  placeholder: '请选择数据'
})
const emits = defineEmits<{
  (e: 'update:modelValue', modelValue: ModelValueType): void
}>()
const value: any = useVModel(props, 'modelValue', emits)
const valueArr = computed<string[]>(() => {
  if (!value.value) return []
  return Array.isArray(value.value) ? value.value : [value.value]
})
const dataPickerRef = ref<InstanceType<typeof DataPicker>>()
const formDisabled = useFormDisabled()
const formSize = useFormSize()
const disabled = computed<boolean>(() => {
  return formDisabled.value || props.disabled
})
const openDataPicker = () => {
  dataPickerRef.value?.open()
}
const onClose = (data: string) => {
  if (!value.value) return
  if (props.multiple && Array.isArray(value.value)) {
    value.value.splice(value.value.indexOf(data), 1)
  } else {
    value.value = null
  }
}
</script>

<template>
  <data-picker ref="dataPickerRef"
               :title="title"
               :datas="datas"
               :data-url="dataUrl"
               :page-size="pageSize"
               :display-name="displayName"
               :display-value="displayValue"
               :multiple="multiple" v-model="value"/>
  <div class="data-wrapper">
    <star-horse-icon @click="openDataPicker" cursor="pointer" icon-class="select-data" border="true"/>
    <DataTag
        v-for="item in valueArr"
        :closable="!disabled"
        :data="item"
        :display-name="displayName"
        :display-value="displayValue"
        @close="onClose"
    />
    <el-text v-show="!value || value.length === 0" class="placeholder">
      {{ placeholder }}
    </el-text>
  </div>
</template>

<style scoped lang="scss">
.el-tag {
  padding: 0 3px;
}

.data-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  grid-gap: 7px;
  gap: 7px;

  .placeholder {
    color: var(--el-text-color-placeholder);
  }

  .data-but-item {
    border-style: dashed;

    &:hover {
      border-style: solid;
    }
  }
}
</style>
