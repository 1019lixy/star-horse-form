<script setup lang="ts">
import {isRef, nextTick, onMounted, ref, watch} from "vue";
import FlowSetting from "@/views/workflow/plugin/FlowSetting.vue"
import BasicInfo from "@/views/workflow/plugin/BasicInfo.vue"
import FlowNav from "@/views/workflow/plugin/common/FlowNav.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import DynamicForm from "@/views/dyform/DynamicForm.vue";
import UFlowDesign from "@/views/workflow/formItems/UFlowDesign.vue";
import {error, success} from "@/utils/message.ts";
import {postRequest} from "@/api/star_horse.ts";
import {useRouter} from "vue-router";
import {ApiUrls} from "@/components/types/ApiUrls";
import {apiInstance} from "@/api/sh_api.ts";

const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowDefine");
const props = defineProps({
  data: {
    type: Object
  },
  isView: {
    type: Boolean,
    default: false
  },

});
let router = useRouter();
let flowStyle = ref<string>("dingding");
const flowDesign = useFlowDesign(piniaInstance);
const basicInfoRef = ref();
const flowDesignRef = ref();
const flowSettingRef = ref();
let currentData = ref<number>(1);
const changeFlow = () => {
  if (flowStyle.value == "dingding") {
    flowStyle.value = "flowable";
  } else {
    flowStyle.value = "dingding";
  }
}
/**
 * 可以使用此成熟的框架，进行更改,对于bpmn-js 可以考虑去除，太技术化不太实用
 * git clone https://gitee.com/crowncloud/smart-sh-flow-editor.git
 */
const change = async (item: any) => {
  if (currentData.value == 1) {
    let flag = false;
    await basicInfoRef.value.$refs.flowFormRef.$refs.starHorseFormRef.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      return;
    }
    let formData = basicInfoRef.value.$refs.flowFormRef.getFormData();
    flowDesign.flowSetFormInfo(formData.value);
  }
  currentData.value = item.type;
  if (currentData.value == 1) {
    let formData = flowDesign.flowFormInfo;
    await nextTick();
    basicInfoRef.value.$refs.flowFormRef.setFormData(formData.value);
  }
}
const flowSave = (type: string) => {
  let formInfo = flowDesign.flowFormInfo;
  formInfo = isRef(formInfo) ? formInfo.value : formInfo;
  formInfo.submitType = type;
  formInfo.process = flowDesign.node;
  postRequest("/flow-engine/workflow/flowdefinition/saveOrDeployProcess", formInfo)
      .then(reData => {
        let res = reData.data;
        if (res.code) {
          error(res.message);
          return;
        } else {
          success(type == "publish" ? "发布成功" : "保存成功");
          router.push({
            path: "/workflow/FlowDefineUi",
          });
        }
      });

}
const init = () => {
  if (props.data) {
    flowDesign.flowSetFormInfo(props.data);
  }
}
const loadData = async () => {
  let id = router.currentRoute.value.query.data;
  let isView = router.currentRoute.value.query.isView;
  if (id) {
    let data = await dataUrl.loadByIdAction!(id, "Y" == isView);
    data["bindForm"] = data["bindForm"]?.split(";");
    data["flowManager"] = data["flowManager"]?.split(";");
    flowDesign.flowSetFormInfo(data);
    flowDesign.setNode(JSON.parse(data.jsonFile)?.process);
  }
  console.log(id, isView);
}
onMounted(() => {
  init();
});

watch(() => router.currentRoute.value.query, () => {
  loadData();
}, {immediate: true, deep: true})
</script>
<template>
  <el-card class="inner_content">
    <FlowNav :currentNav="currentData" @changeFlow="changeFlow" @flowSave="flowSave" @change="change"/>
    <BasicInfo ref="basicInfoRef" v-if="currentData==1"/>
    <DynamicForm ref="basicInfoRef" v-if="currentData==2"/>
    <UFlowDesign ref="flowDesignRef" :flowStyle="flowStyle" v-if="currentData==3"/>
    <FlowSetting ref="flowSettingRef" v-if="currentData==4"/>
  </el-card>
</template>

<style scoped lang="scss">

</style>
