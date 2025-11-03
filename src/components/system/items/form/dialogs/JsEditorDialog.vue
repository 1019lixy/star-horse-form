<script setup lang="ts">
import { ref } from "vue";
import { i18n } from "@/lang/index.js";
import JSON5 from "json5";

const props = defineProps<{
  visible: boolean;
  formProps: any;
  fieldName: string;
  currentField: any;
  list?: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const codeTab = ref<string>("code");
const codeCompRef = ref<any>(null);

const hmsg: string = `
   {{i18n("dyform.js.editor.customEvent")}：
   currentField:Object {{i18n("dyform.js.editor.currentFieldInfo")}
   formData:Object {{i18n("dyform.js.editor.formData")}
   formFields：Array<any>{{i18n("dyform.js.editor.formElements")}
   formInstance:Object {{i18n("dyform.js.editor.formInstance")}
   {{i18n("dyform.js.editor.parametersMethods")}
`;
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="i18n('dyform.js.editor.title')"
    :isBatch="false"
    @merge="emit('close')"
    @closeAction="emit('close')"
    @resetForm="emit('close')"
    :selfFunc="true"
    boxHeight="80%"
  >
    <el-tabs v-model="codeTab">
      <el-tab-pane :label="i18n('dyform.js.editor.tab.code')" name="code">
        <star-horse-editor
          v-model:value="formProps[fieldName]"
          lang="javascript"
          ref="codeCompRef"
          :helpMsg="hmsg"
          style="height: 100%"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="i18n('dyform.js.editor.tab.currentField')"
        name="currentField"
      >
        <pre>{{ JSON5.stringify(currentField, null, 4) }}</pre>
      </el-tab-pane>
      <el-tab-pane
        :label="i18n('dyform.js.editor.tab.formInstance')"
        name="formInstance"
      >
        {{ i18n("dyform.js.editor.objectName") }}：formInstance
        <table
          border="1"
          cellpadding="0"
          cellspacing="0"
          style="width: 100%; border: 1px dashed var(--star-horse-style)"
        >
          <thead style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <th>{{ i18n("dyform.js.editor.table.name") }}</th>
              <th>{{ i18n("dyform.js.editor.table.description") }}</th>
              <th>{{ i18n("dyform.js.editor.table.type") }}</th>
            </tr>
          </thead>
          <tbody style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <td>validate</td>
              <td>
                {{ i18n("dyform.js.editor.formInstance.validate") }}
                <code>Promise</code>。
              </td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>validateField</td>
              <td>{{ i18n("dyform.js.editor.formInstance.validateField") }}</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>resetFields</td>
              <td>{{ i18n("dyform.js.editor.formInstance.resetFields") }}</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>scrollToField</td>
              <td>{{ i18n("dyform.js.editor.formInstance.scrollToField") }}</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>clearValidate</td>
              <td>{{ i18n("dyform.js.editor.formInstance.clearValidate") }}</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>fields</td>
              <td>{{ i18n("dyform.js.editor.formInstance.fields") }}</td>
              <td><span class="inline-flex items-center">Array</span></td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>
      <el-tab-pane
        :label="i18n('dyform.js.editor.tab.formProperties')"
        name="formDatas"
        v-if="list"
      >
        <pre>{{ JSON5.stringify(list, null, 4) }}</pre>
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
</template>
<style lang="scss" scoped>
pre {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
</style>
