<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
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
import {defineComponent, nextTick, reactive, ref, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let pdfDoc = reactive<any>({}); // 保存加载的pdf文件流
    let pdfPages = ref(0); // pdf文件的页数
    let pdfUrl = ref(""); //pdf文件的链接
    let pdfScale = ref(1.0); // 缩放比例
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };

//获取pdf文档流与pdf文件的页数
    const loadFile = async (url) => {

    };
//渲染pdf文件
    const renderPage = (num) => {

    };
    return {
      parentCompType, formFieldList, context, field, formItem, formDatas, dataField, selectItem,
      keyEnterFun, pdfPages
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