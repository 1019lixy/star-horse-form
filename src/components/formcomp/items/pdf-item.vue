<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <iframe v-if="field.preps?.viewType=='view'" :src="filePath" width="100%"
            :web.xmlHeight="field.preps?.height||100"/>
    <el-button v-else type="primary" @click="pdfView" text>
      <star-horse-icon icon-class="pdf" color="var(--star-horse-style)"/>
      预览
    </el-button>
  </starhorse-form-item>
</template>
<script lang="ts" name="pdfItem">
import {computed, defineComponent, onMounted, ref, shallowRef} from 'vue';
import {warning} from '@/utils/message.ts';

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs['parentField'];
    const field = context.attrs['field'] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef('');
    let filePath = computed(() => {
      let path = context.attrs['formData'][field.preps['name']];
      if (path) {
        path = `?file=${path}`;
      } else {
        path = '';
      }
      return `/lib/pdfjs/web/viewer.html${encodeURIComponent(path)}`;
    });
    let pdfPages = ref(0); // pdf文件的页数
    const itemAction = () => {
      context.emit('selfFunc');
    };
    const pdfView = () => {
      if (!filePath.value.includes('file=')) {
        warning('请先上传文件');
        return;
      }
      window.open(`${filePath.value}`, '_blank');
    };
    onMounted(() => {

    });
    return {
      parentField, context, field, formItem, dataField, itemAction, pdfPages, filePath, pdfView
    };
  }
});
</script>
<style lang="scss" scoped>
.interviewVideo_main {
  height: 100%;
  width: 100%;
}
</style>
