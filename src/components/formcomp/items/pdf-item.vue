<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <div class="interviewVideo_main" id="videoContainer">
      <!--此处根据pdf的页数动态生成相应数量的canvas画布-->
      <VuePdfEmbed annotation-layer text-layer :source="pdfSource" />
    </div>
  </starhorse-form-item>
</template>
<script lang="ts" name="pdfItem">
import {defineComponent, ref, shallowRef} from "vue";
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'
export default defineComponent({
  components: {
    VuePdfEmbed
  },
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let pdfSource = ref('e:/test.pdf'); // pdf文件的路径
    let pdfPages = ref(0); // pdf文件的页数
    const itemAction = () => {
      context.emit('selfFunc');
    };
    return {
      parentField, context, field, formItem, dataField, itemAction, pdfPages,pdfSource
    }
  }
});
</script>
<style lang="scss" scoped>
.interviewVideo_main {
  height: 100%;
  width: 100%;
}
</style>
