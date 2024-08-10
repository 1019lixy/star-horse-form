<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field" :parentField="parentField"
  >
    <div class="interviewVideo_main" id="videoContainer">
      <!--此处根据pdf的页数动态生成相应数量的canvas画布-->
      <canvas
          v-for="pageIndex in pdfPages"
          :id="`pdf-canvas-` + pageIndex"
          :key="pageIndex"
          style="display: block"
      ></canvas>
    </div>
  </starhorse-form-item>
</template>
<script lang="ts" name="pdfItem">
import {defineComponent, ref, shallowRef} from "vue";
export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let pdfPages = ref(0); // pdf文件的页数
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    return {
      parentField,  context, field, formItem, dataField, keyEnterFun, pdfPages
    }
  }
});
</script>
<style lang="scss" scoped>
.interviewVideo_main {
  height: 100%;
  width: 100%;
  border: 1px solid red;
}
</style>
