<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {loadData, warning} from "star-horse-lowcode";
import {useVModel} from "@vueuse/core";

const emits = defineEmits<{ e: "update:modelValue"; modelValue: string }>();
let commonFieldList = ref<any>([]);
let dataList = ref<any>([]);
let currentData = ref<any>({});
const props = defineProps({
  compSize: {
    type: String,
    default: "small"
  },
  readable: {
    type: Boolean,
    default: false
  },
  node: {
    type: Object,
    default: function () {
      return {};
    }
  },
  formId: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    default: "edit"
  }
});
let privilege = useVModel(props, "modelValue", emits);
const dataChange = async (formId: string) => {
  if (!formId) {
    dataList.value = [];
    commonFieldList.value = [];
    currentData.value = [];
    return;
  }
  let {data, error} = await loadData("/userdb-manage/userdb/dynamicForm/getById/" + formId, {});
  if (error) {
    warning(error);
    return;
  }
  currentData.value = data;
  dataList.value = JSON.parse(data["details"].content);
  commonFieldList.value = data.commonFieldControllers;
};
const init = () => {
  dataChange(props.formId);
};
onMounted(() => {
  init();
});
watch(
    () => props.formId,
    (_val: any) => {
      init();
    },
    {
      immediate: false,
      deep: true
    }
);
</script>
<template>
  <el-divider content-position="left">表单权限</el-divider>
  <div class="form-detail" v-if="dataList && dataList.length > 0">
    <el-radio-group v-model="privilege">
      <el-radio value="edit" key="edit">可编辑</el-radio>
      <el-radio value="readonly" key="readonly">只读</el-radio>
      <el-radio value="forbidden" key="forbidden">禁止查看</el-radio>
    </el-radio-group>
    <el-divider content-position="left">表单预览</el-divider>
    <form-preview
        :formDisabled="privilege == 'readonly'"
        v-if="privilege != 'forbidden'"
        :commonFieldList="commonFieldList"
        :compSize="compSize"
        :list="dataList"
    />
  </div>
  <el-empty description="请选择表单" v-else/>
</template>
<style lang="scss" scoped>
.form-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>
