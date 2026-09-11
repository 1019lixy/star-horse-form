<script setup lang="ts">
/**
 * 流程参数与表单字段绑定表（可复用）。
 *
 * 在流程 reuse 模式下，选定已有流程定义后，将该流程的参数列表与表单字段做映射。
 * 本组件为纯 UI 通道：参数列表由外部传入（或通过 loadFlowParams 回调加载），
 * 可绑定字段列表由外部传入，不包含任何业务 API 调用。
 */
import {ref, watch} from "vue";
import {SelectOption, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";
import type {FlowParam, FlowParamBinding} from "@/components/workflow/types";

defineOptions({name: "FlowParamBindingTable"});

const props = withDefaults(
    defineProps<{
      /** 流程参数绑定列表（v-model） */
      modelValue?: FlowParamBinding[];
      /** 流程参数列表 */
      params?: FlowParam[];
      /** 可绑定的表单字段列表 */
      fields?: SelectOption[];
      /** 组件大小 */
      compSize?: string;
      /** 加载中状态 */
      loading?: boolean;
    }>(),
    {
      modelValue: () => [],
      params: () => [],
      fields: () => [],
      compSize: "default",
      loading: false,
    },
);

const emit = defineEmits(["update:modelValue"]);

/** 绑定列表（双向绑定） */
const bindings = ref<FlowParamBinding[]>(props.modelValue);

watch(
    () => props.modelValue,
    (val) => {
      bindings.value = val || [];
    },
);

/** 参数列表变化时，以新参数为基准重建绑定项，保留旧绑定中同参数名的字段映射 */
watch(
    () => props.params,
    (newParams) => {
      const old = bindings.value;
      const rebuilt = (newParams || []).map((p) => {
        const existing = old.find((b) => b.param === p.name);
        return {
          id: existing?.id || uuid(),
          param: p.name,
          fieldName: existing?.fieldName || "",
          required: !!p.required,
        };
      });
      bindings.value = rebuilt;
      emit("update:modelValue", rebuilt);
    },
    {immediate: true},
);

/** 字段变更时同步到 v-model */
const onFieldChange = () => {
  emit("update:modelValue", bindings.value);
};
</script>

<template>
  <el-table
      v-loading="loading"
      :data="bindings"
      :size="compSize"
      border
      class="flow-param-binding-table"
  >
    <el-table-column
        :label="i18n('dyform.step.flowParamName')"
        prop="param"
        min-width="120"
    >
      <template #default="{ row }">
        <span>{{ row.param }}</span>
        <el-tag
            v-if="row.required"
            :size="compSize"
            type="danger"
            class="fpbt-required-tag"
        >*
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
        :label="i18n('dyform.step.bindFieldLabel')"
        min-width="160"
    >
      <template #default="{ row }">
        <el-tree-select
            v-model="row.fieldName"
            filterable
            clearable
            :data="fields"
            :props="{
              label:'name'
            }"
            :multiple="true"
            :placeholder="i18n('dyform.step.assigneeFieldPlaceholder')"
            :size="compSize"
            @change="onFieldChange"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<style lang="scss" scoped>
.flow-param-binding-table {
  margin-top: 4px;

  .fpbt-required-tag {
    margin-left: 4px;
  }
}
</style>
