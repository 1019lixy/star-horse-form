<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const props = defineProps<{
  visible: boolean;
  compSize: string;
}>();

const closeAction = () => {
  emit("close");
};

const prepsModel = ref("one");
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    @merge="() => emit('save')"
    :title="'批量修改属性'"
  >
    <el-tabs v-model="prepsModel">
      <el-tab-pane
        name="one"
        label="业务字段"
        class="flex overflow-hidden flex-col"
      >
        <batch-edit-fields :compSize="compSize" />
      </el-tab-pane>
      <el-tab-pane name="two" label="公共字段">
        在配置或者提交功能里设置
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
</template>