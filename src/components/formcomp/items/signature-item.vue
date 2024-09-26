<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField">
    <div class="pcDemo">
      <div class="actions">
        <button @click="clear">清除</button>
        <button @click="undo">后退</button>
        <button @click="handleColor">修改颜色</button>
        <button @click="handlePreview">预览</button>
      </div>
      <canvas ref="canvas" id="singatureCanvas"/>
    </div>
  </starhorse-form-item>
</template>
<script lang="ts" name="signature-item">
import {defineComponent, onMounted, shallowRef, ref, nextTick, watch, onUpdated} from "vue";
import SmoothSignature from "smooth-signature";
import {warning} from "@/utils/message.ts";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let signature = ref<SmoothSignature>(null);
    let canvas = ref();
    const options = {
      width: Math.min(window.innerWidth, 1000),
      height: 600,
      minWidth: 4,
      maxWidth: 12,
      // color: '#1890ff',
      bgColor: '#f6f6f6'
    };
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const init = async () => {
      await nextTick(() => {
        let singatureCanvas = document.querySelector("#singatureCanvas");
        if (!signature.value && canvas.value) {
          signature.value = new SmoothSignature(singatureCanvas, options);
        }
      });


    };
    const clear = () => {
      signature.value && signature.value.clear();
    }
    const undo = () => {
      signature.value && signature.value.undo();
    }

    const handleColor = () => {
      signature.value.color = '#' + Math.random().toString(16).slice(-6);
    };
    const handlePreview = () => {
      const isEmpty = signature.value.isEmpty();
      if (isEmpty) {
        warning("请先签名");
        return;
      }
      const pngUrl = signature.value.getPNG();
      window.previewImage(pngUrl);
    }
    onMounted(() => {
      init();
    });
    onUpdated(() => {
      init();
    })

    // watch(signature.value?.getPNG(),
    //     (val: any) => {
    //       context.attrs['formData'][field.preps['name']] = val;
    //     }, {deep: true, immediate: false})
    return {
      parentField, context, field, formItem, dataField, handlePreview, keyEnterFun,
      clear, undo, handleColor, canvas
    }
  }
});
</script>
<style lang="scss" scoped>
.pcDemo {
  button {
    margin-right: 10px;
    font-size: 18px;
  }
  canvas {
    border: 2px dashed #ccc;
    cursor: crosshair;
  }
  .actions {
    margin: 30px 0;
  }
  .tip {
    color: #108eff;
  }
}
.mbDemo {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  button {
    font-size: 18px;
  }

  canvas {
    border-radius: 10px;
    border: 2px dashed #ccc;
  }

  .wrap1 {
    margin-top: 100px;

    .actions {
      margin-bottom: 20px;
    }
  }

  .wrap2 {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 15px;
    display: flex;
    justify-content: center;

    .actionsWrap {
      width: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .canvas {
      flex: 1;
    }

    .actions {
      margin-right: 10px;
      white-space: nowrap;
      transform: rotate(90deg);
    }
  }
}
</style>
