<script setup lang="ts">
import { ref } from "vue";
import { i18n } from "@/lang";

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
    :title="i18n('dyform.batch.edit.title')"
  >
    <el-tabs v-model="prepsModel">
      <el-tab-pane
        name="one"
        :label="i18n('dyform.batch.edit.tab.business')"
        class="flex overflow-hidden flex-col"
      >
        <batch-edit-fields :compSize="compSize" />
      </el-tab-pane>
      <el-tab-pane name="two" :label="i18n('dyform.batch.edit.tab.common')">
        {{ i18n("dyform.batch.edit.commonFieldsMessage") }}
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
</template>
