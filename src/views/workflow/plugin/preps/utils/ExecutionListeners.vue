<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { postRequest } from "@/api/star_horse_apis.ts";
  import { createCondition } from "@/api/star_horse_utils.ts";
  import Help from "@/components/help.vue";

  const props = defineProps({
    node: {
      type: Object,
      default: function () {
        return {};
      }
    }
  });
  const addListener = () => {
    if (!props.node.executionListeners) {
      props.node.executionListeners = [];
    }
    props.node.executionListeners?.push({
      event: "start",
      implementationType: "delegateExpression",
      implementation: ""
    });
  };
  const delListener = (index: number) => {
    props.node.executionListeners?.splice(index, 1);
  };
  let implementationTypeList = ref<Array<any>>([]);
  const init = () => {
    postRequest(
      "/userdb-manage/userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357/getAllByCondition",
      {
        fieldList: [createCondition("idFlowNode", "implementationType")],
        orderBy: [{ fieldName: "createdTime", ascOrDesc: "ASC" }]
      }
    ).then((res) => {
      if (res.data.code) {
        console.log(res.data.cnMessage);
        return;
      }
      implementationTypeList.value = res.data.data;
    });
  };
  onMounted(() => {
    init();
  });
</script>

<template>
  <div v-for="(item, index) in node.executionListeners" :key="index" class="listener-box">
    <el-button
      class="listener-close"
      @click="delListener(index)"
      plain
      circle
      icon="CircleClose"
      size="small"
      type="danger"
    />
    <el-form-item label="事件" :prop="`executionListeners.${index}.event`">
      <el-radio-group v-model="item.event">
        <el-radio-button label="开始" value="start" />
        <el-radio-button label="结束" value="end" />
        <el-radio-button label="迁移" value="take" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="类型" :prop="`executionListeners.${index}.implementationType`">
      <el-radio-group v-model="item.implementationType">
        <el-radio-button v-for="item in implementationTypeList" :label="item.attrName" :value="item.attrValue" />
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="item.implementationType == 'script'" prop="implementation" label="执行脚本">
      <star-horse-data-selector
        v-model="node.implementation"
        data-url="/userdb-manage/script/scriptInfo/pageList"
        display-name="scriptName"
        display-value="idScript"
        :pageSize="100"
        placeholder="请选择"
      />
      <help :message="'待运维模块对接'" />
    </el-form-item>
    <el-form-item v-else label="监听器" :prop="`executionListeners.${index}.implementation`">
      <template #label>
        <div class="flex-items-center gap3px">
          <span>监听器</span>
          <el-tooltip placement="top-start">
            <template #content>
              实现 ExecutionListener 接口 <br />
              委托表达式：${myExecutionListener} <br />
              表达式: ${myExecutionListener.notify(execution)} <br />
              java类：${com.example.listener.MyExecutionListener}
            </template>
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-input v-model="item.implementation" type="textarea" placeholder="请输入监听器" clearable> </el-input>
    </el-form-item>
  </div>
  <div class="listener-btn">
    <el-button link @click="addListener" type="primary" icon="Plus">添加监听器</el-button>
  </div>
</template>

<style lang="scss">
  .listener-box {
    border: 1px dashed var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    margin-top: 10px;
    padding: 7px;
    position: relative;

    &:hover {
      border-color: var(--el-color-primary);

      .listener-close {
        display: block;
      }
    }

    .listener-close {
      position: absolute;
      top: -7px;
      right: -7px;
      z-index: 1;
      display: none;
    }
  }

  .listener-btn {
    border: 1px dashed var(--el-border-color);
    height: 30px;
    margin-top: 5px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
