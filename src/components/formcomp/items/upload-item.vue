<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-upload
        :fid="field.preps['name']"
        :accept="field.preps['accept']"
        :action="field.preps['action']"
        :auto-upload="field.preps['autoUpload']=='Y'"
        :before-remove="field.preps['beforeRemove']"
        :before-upload="field.preps['beforeUpload']"
        :data="field.preps['data']||{}"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled'] == 'Y'"
        :drag="field.preps['drag']=='Y'"
        :headers="headers"
        :http-request="field.preps['httpRequest']"
        :limit="field.preps['limit']"
        :list-type="field.preps['listType']||'picture-card'"
        :method="field.preps['method']||'post'"
        :multiple="field.preps['multiple']=='Y'"
        :name="field.preps['aliasName']||'file'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :on-change="(uploadFile: any, uploadFiles: any)=>selfAction('change',uploadFile,uploadFiles)"
        :on-error="(error: any, uploadFile: any, uploadFiles: any)=>selfAction('error',uploadFile,uploadFiles,error)"
        :on-exceed="(files: any, uploadFiles: any)=>selfAction('exceed',files,uploadFiles)"
        :on-preview="(uploadFile: any)=>selfAction('preview',uploadFile)"
        :on-progress="(evt: any, uploadFile: any, uploadFiles: any)=>selfAction('progress',uploadFile,uploadFiles,evt)"
        :on-remove="(uploadFile: any, uploadFiles: any)=>selfAction('remove',uploadFile,uploadFiles)"
        :on-success="(response: any, uploadFile: any, uploadFiles: any)=>selfAction('success',uploadFile,uploadFiles,response)"
        style="width: 100%!important;display:flex;align-items:center;"
        :show-file-list="field.preps['showFileList']=='Y'"
        :with-credentials="field.preps['withCredentials']=='Y'"
        v-model:file-list="dataField"
    >
      <el-icon class="el-icon--upload" v-if="field.preps['drag']=='Y'">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text" v-if="field.preps['drag']=='Y'">
        将文件拖到此处 或 <em>点击上传</em>
      </div>
      <template #tip v-if="field.preps['maxSize']">
        <div class="el-upload__tip">
          文件大小不能超过{{ field.preps['maxSize'] }}
        </div>
      </template>
      <star-horse-icon v-if="field.preps['drag']!='Y'" icon-class="plus" color="var(--star-horse-style)"/>
    </el-upload>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef, onMounted, nextTick, ref} from "vue";
import {getToken} from "@/utils/auth.ts";

export default defineComponent({
  emits: ["selectItem", "selfFunc"],
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef([]);
    let headers = ref<any>({});
    const selfAction = (prep: any, uploadFile: any, uploadFiles: any = [], param: any = {}) => {
      if (prep == "success") {
        context.attrs['formData'][field.preps['name']] = param.data.path;
        //console.log(param.data.path);
      }
      context.emit('selfFunc', prep, uploadFile, uploadFiles, param);
    };
    onMounted(async () => {
      await nextTick();
      let datas = context.attrs['formData'][field.preps['name']];
      if (datas) {
        dataField.value.push({url: (field.preps["context"]||'/system-config') + datas});
      }
      let temp = field.preps?.headers;
      if (temp && Object.keys(temp).length > 0) {
        headers.value = JSON.parse(temp);
      }
      headers.value["token"] = getToken();
    });
    return {parentField, context, field, formItem, dataField, selfAction, headers}
  }
});
</script>
<style lang="scss" scoped>
:deep(.el-upload) {
  // --el-upload-picture-card-size: 80px !important;
}

:deep(.el-upload-list--picture-card) {
  width: 100% !important;

  .is-drag {
    height: 100% !important;
    width: 100% !important;
  }
}
</style>
