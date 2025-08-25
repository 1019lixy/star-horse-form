<script setup lang="ts">
import { ref } from "vue";

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
   自定义事件,提供了如下系统参数：
   currentField:Object 当前组件的信息
   formData:Object 表单数据
   formFields：Array<any>表单的所有元素
   formInstance:Object 表单实例对象
   具体参数或方法切换Tab查看
`;
</script>

<template>
  <star-horse-dialog 
    :dialogVisible="visible" 
    title="自定义信息" 
    :isBatch="false" 
    @merge="emit('close')"
    @closeAction="emit('close')" 
    @resetForm="emit('close')" 
    :selfFunc="true">
    <el-tabs v-model="codeTab">
      <el-tab-pane label="代码" name="code">
        <star-horse-editor 
          v-model:value="formProps[fieldName]" 
          lang="javascript" 
          ref="codeCompRef" 
          :helpMsg="hmsg"
          style="height: 100%" />
      </el-tab-pane>
      <el-tab-pane label="当前组件属性" name="currentField">
        <pre>{{ JSON.stringify(currentField, null, 4) }}</pre>
      </el-tab-pane>
      <el-tab-pane label="表单实例" name="formInstance">
        对象名字：formInstance
        <table border="1" cellpadding="0" cellspacing="0"
          style="width: 100%; border: 1px dashed var(--star-horse-style)">
          <thead style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <th>名称</th>
              <th>说明</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <td>validate</td>
              <td>
                对整个表单的内容进行验证。 接收一个回调函数，或返回
                <code>Promise</code>。
              </td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>validateField</td>
              <td>验证具体的某个字段。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>resetFields</td>
              <td>重置该表单项，将其值重置为初始值，并移除校验结果</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>scrollToField</td>
              <td>滚动到指定的字段</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>clearValidate</td>
              <td>清理某个字段的表单验证信息。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>fields</td>
              <td>获取所有字段的 context</td>
              <td><span class="inline-flex items-center">Array</span></td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>
      <el-tab-pane label="表单属性" name="formDatas" v-if="list">
        <pre>{{ JSON.stringify(list, null, 4) }}</pre>
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
</template>