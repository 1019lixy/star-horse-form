<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { loadData, warning } from "star-horse-lowcode";
import { useVModel } from "@vueuse/core";
import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums.js";

const props = defineProps({
  compSize: {
    type: String,
    default: "small",
  },
  readable: {
    type: Boolean,
    default: false,
  },
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  formId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: "edit",
  },
});
const emits = defineEmits<{ e: "update:modelValue"; modelValue: string }>();
let commonFieldList = ref<any>([]);
let dataList = ref<any>([]);
let currentData = ref<any>({});

const isPreview = ref<boolean>(false);
const formAuthorityVisible = ref<boolean>(false);
let privilege = useVModel(props, "modelValue", emits);
const dataChange = async (formId: string) => {
  if (!formId) {
    dataList.value = [];
    commonFieldList.value = [];
    currentData.value = [];
    return;
  }
  let { data, error } = await loadData(
    "/userdb-manage/userdb/dynamicForm/getById/" + formId,
    {},
  );
  if (error) {
    warning(error);
    return;
  }
  currentData.value = data;
  dataList.value = JSON.parse(data["details"].content);
  commonFieldList.value = data.commonFieldControllers;
};
const previewForm = () => {
  isPreview.value = true;
};
const formAuthority = () => {
  formAuthorityVisible.value = true;
};
const editFormAutority = (data: any) => {
  //todo;
};
const closeAction = () => {
  isPreview.value = false;
  formAuthorityVisible.value = false;
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
    deep: true,
  },
);
</script>
<template>
  <star-horse-dialog
    :dialogVisible="isPreview"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    :title="'表单预览'"
    :source="3"
  >
    <form-preview
      :formDisabled="privilege == 'readonly'"
      v-if="privilege != 'forbidden'"
      :commonFieldList="commonFieldList"
      :compSize="compSize"
      :list="dataList"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="formAuthorityVisible"
    @merge="editFormAutority"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    :title="'设置表单权限'"
    :source="3"
  >
    <el-divider content-position="center">表单权限</el-divider>
    <div class="flex flex-col w-full items-center justify-center gap-[10px]">
      <el-radio-group v-model="privilege" fill="var(--star-horse-style)">
        <el-radio-button value="edit" key="edit">可编辑</el-radio-button>
        <el-radio-button value="readonly" key="readonly">只读</el-radio-button>
        <el-radio-button value="forbidden" key="forbidden"
          >禁止查看</el-radio-button
        >
      </el-radio-group>
    </div>
  </star-horse-dialog>
  <template v-if="dataList?.length > 0">
    <el-divider content-position="center">表单预览</el-divider>
    <div class="flex mx-[10px] items-center w-full justify-center">
      <el-button @click="previewForm" icon="search" type="success"
        >预览</el-button
      >
      <el-button
        @click="formAuthority"
        v-if="node.type != FlowNodeEnums.APPLY_NODE"
        icon="setting"
        type="info"
        >表单权限配置
      </el-button>
    </div>
  </template>
  <el-empty description="请选择表单" v-else />
</template>
<style lang="scss" scoped></style>
