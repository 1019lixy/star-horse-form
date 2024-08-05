<script setup lang="ts" name="SubNodeInfo">
import {onMounted, reactive, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";

const nodeInfoRef = ref<any>();
const nodeInfo = ref<any>({});
const successFlag = ref<number>(2);
const errorFlag = ref<number>(2);
const nodeTypeList = ref<SelectOption[]>([]);
const fieldList = reactive<PageFieldInfo | any>({
  fieldList: [{
    cardList: [{
      title: "节点信息",
      subFormFlag: true,
      tabName: "subNodeInfo2",
      objectName: "subNodeInfo2",
      headerFieldList: [{
        label: "拷贝已配置信息",
        type: "button",
        fieldName: "copyNodeBtn",
        actionName: "click",
        actions: (val: any) => {
          if (val["starHorseBtnName"] == "copyNodeBtn") {

          }
        },
        preps: {
          text: "Y",
          icon: "plus",
        }
      }],
      fieldList: []}]
  }]
});
const init = async () => {
  /**
   * [{
   *         label: "节点类型",
   *         fieldName: "nodeType",
   *         type: "select",
   *         optionList: nodeTypeList,
   *         required: true,
   *         formShow: true
   *       }, {
   *         label: "节点名称",
   *         fieldName: "nodeName",
   *         type: "input",
   *         required: true,
   *         formShow: true
   *       },
   *       ]
   */
}
onMounted(async () => {
  await init();
})
</script>

<template>
  <star-horse-form ref="nodeInfoRef" class="node-info" :fieldList="fieldList"/>
</template>
<style lang="scss" scoped>
.report-switch {
  display: block;
  width: 100%;
  vertical-align: middle;
  margin-left: 15px;
}

.report-content {
  margin: 0 20px;
}

.el-sub-menu {
  margin-top: 10px;
  border: 1px solid #e8e8e8;
}
</style>
