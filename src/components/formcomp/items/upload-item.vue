<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
  >
    <el-upload
        :fid="field.preps['name']"
        :accept="field.preps['accept']"
        :action="field.preps['action']"
        :auto-upload="field.preps['autoUpload']=='yes'"
        :before-remove="field.preps['beforeRemove']"
        :before-upload="field.preps['beforeUpload']"
        :data="field.preps['data']"
        :disabled="field.preps['disabled']=='yes'"
        :drag="field.preps['drag']=='yes'"
        :headers="field.preps['headers']"
        :http-request="field.preps['httpRequest']"
        :limit="field.preps['limit']"
        :list-type="field.preps['listType']"
        :method="field.preps['method']"
        :multiple="field.preps['multiple']=='yes'"
        :name="field.preps['name']"
        :on-change="field.preps['onChange']"
        :on-error="field.preps['onError']"
        :on-exceed="field.preps['onExceed']"
        :on-preview="field.preps['onPreview']"
        :on-progress="field.preps['onProgress']"
        :on-remove="field.preps['onRemove']"
        :on-success="field.preps['onSuccess']"
        :show-file-list="field.preps['showFileList']=='yes'"
        :with-credentials="field.preps['withCredentials']=='yes'"
        v-model:file-list="dataField"
    >
      <star-horse-icon icon-class="plus"/>
    </el-upload>
  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef([]);
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem, formDatas, dataField, selectItem}
  }
});
</script>

<style scoped>

</style>