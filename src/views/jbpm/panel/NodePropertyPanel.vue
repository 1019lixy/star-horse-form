<script setup lang="ts" name="NodePropertyPanel">
import {computed, ref, watch} from "vue";

const props = defineProps({
  modeler: {
    type: Object,
    required: true
  },
  nodeElement: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
});
const emits = defineEmits(["modifyFormData"]);
let localFormData = computed(() => props.formData);
const bpmnData = ref({
  assignees: [{
    value: "${assignee}",
    label: "表达式"
  }, {
    value: "1001",
    label: "张三"
  }, {
    value: "1002",
    label: "李四"
  }, {
    value: "1003",
    label: "王五"
  }],
  candidateUsers: [{
    value: "1001",
    label: "张三"
  }, {
    value: "1002",
    label: "李四"
  }, {
    value: "1003",
    label: "王五"
  }],
  roles: [
    {
      value: "manager",
      label: "经理"
    },
    {
      value: "personnel",
      label: "人事"
    },
    {
      value: "charge",
      label: "主管"
    }
  ]
});
watch(() => props.nodeElement,
    (val) => {
      if (props.nodeElement.type == "bpmn:StartEvent") {
        updateName("开始");
      }
      if (props.nodeElement.type == "bpmn:EndEvent") {
        updateName("结束");
      }
    }
);
const updateProperties = (properties) => {
  let modeling = props.modeler.get('modeling');
  let shape = props.modeler.get('elementRegistry').get(props.nodeElement.id);
  modeling.updateProperties(shape, properties);
};
const updateId = (name: string) => {
  updateProperties({id: name});
};
const updateName = (name: string) => {
  updateProperties({name: name});
};
const changeServiceType = () => {
};
const changeUserType = () => {
};
const updateSequenceFlow = (val: any) => {
  let newCondition = props.modeler.get("moddle").create('bpmn:FormalExpression', {
    body: val
  });
  updateProperties({conditionExpression: newCondition});
};
const addUser = (properties: any) => {
  updateProperties(properties);
  Object.assign(properties, {
    userType: Object.keys(properties)[0]
  });
  emits('modifyFormData', properties);
}
</script>
<style scoped>
</style>
<template>
  <div>
    <!-- 流程属性 -->
    <el-collapse accordion v-if="panelIndex==1">
      <el-collapse-item name="1">
        <template v-slot:title style="color: #999999;">
          基本设置
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <el-form label-position="right" label-width="70px">
            <el-form-item label="ID">
              <el-input v-model="formData.id"></el-input>
            </el-form-item>
            <el-form-item label="名称">
              <el-input v-model="formData.name"></el-input>
            </el-form-item>
            <el-form-item label="描述信息">
              <el-input @input="nameChange" type="textarea" v-model="formData.document"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template v-slot:title>
          执行监听器
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <div style="margin-bottom: 4px;">
            <el-button link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
              添加
            </el-button>
            <el-button link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
              选择
            </el-button>
          </div>
          <el-table
              border
              style="width: 100%">
            <el-table-column
                label="事件">
            </el-table-column>
            <el-table-column
                label="类型">
            </el-table-column>
            <el-table-column
                label="实现">
            </el-table-column>
            <el-table-column
                label="操作">
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template v-slot:title>
          权限设置
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <el-form label-position="right" label-width="70px">
            <el-form-item label="允许启动">
              <el-radio label="1" v-model="radio">所有成员</el-radio>
              <el-radio label="2" v-model="radio">指导成员</el-radio>
            </el-form-item>
            <el-form-item label="添加用户">
              <el-input class="input-with-select" placeholder="请选择" v-model="input3">
                <el-button icon="el-icon-search" slot="append"></el-button>
              </el-input>
            </el-form-item>
            <el-form-item label="添加角色">
              <el-input class="input-with-select" placeholder="请选择" v-model="input3">
                <el-button icon="el-icon-search" slot="append"></el-button>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!-- 开始节点 -->
    <el-collapse accordion v-if="panelIndex==1">
      <el-collapse-item name="1">
        <template v-slot:title>
          基本设置
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <el-form label-position="right" label-width="70px">
            <el-form-item label="ID">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="名称">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="描述信息">
              <el-input type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="发起人">
              <el-input></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template v-slot:title>
          执行监听器
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <div class="collapse-item-header">
            <el-button icon="el-icon-plus" link size="mini"
                       style="background: var(--star-horse-style);color: var(--star-horse-white)">添加
            </el-button>
            <el-button icon="el-icon-edit-outline" link size="mini"
                       style="background: var(--star-horse-style);color: var(--star-horse-white)">修改
            </el-button>
            <el-button icon="el-icon-delete" link size="mini"
                       style="background: var(--star-horse-style);color: var(--star-horse-white)">删除
            </el-button>
          </div>
          <el-table
              border
              style="width: 100%">
            <el-table-column
                label=""
                width="40px"
            >
            </el-table-column>
            <el-table-column
                label="表单名称">
            </el-table-column>
            <el-table-column
                label="版本">
            </el-table-column>
            <el-table-column
                label="表单key">
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template v-slot:title>
          监听器
          <i class="header-icon el-icon-info"></i>
        </template>
        <div>
          <div style="margin-bottom: 4px;">
            <el-button link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
              添加
            </el-button>
            <el-button link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
              选择
            </el-button>
          </div>
          <el-table
              border
              style="width: 100%">
            <el-table-column
                label="事件">
            </el-table-column>
            <el-table-column
                label="类型">
            </el-table-column>
            <el-table-column
                label="实现">
            </el-table-column>
            <el-table-column
                label="操作">
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-form :inline="false"
             label-position="right"
             label-width="100px">
      <el-form-item label="节点类型">
        <el-input disabled v-model="localFormData.type"></el-input>
      </el-form-item>
      <el-form-item label="节点ID">
        <el-input @input="updateId" v-model="localFormData.id"></el-input>
      </el-form-item>
      <el-form-item label="节点名称">
        <el-input @input="updateName" v-model="localFormData.name"></el-input>
      </el-form-item>
      <el-form-item label="服务任务" v-if="localFormData.type=='bpmn:ServiceTask'">
        <el-select @change="changeServiceType" placeholder="请选择" v-model="localFormData.userType">
          <el-option label="关联脚本" value="script"></el-option>
          <el-option label="关联表单" value="form"></el-option>
          <el-option label="关联接口" value="interface"></el-option>
        </el-select>
      </el-form-item>
      <!--usertask-->
      <el-form-item label="节点人员" v-if="localFormData.type=='bpmn:UserTask'">
        <el-select @change="changeUserType" placeholder="请选择" v-model="localFormData.userType">
          <el-option label="指定人员" value="assignee"></el-option>
          <el-option label="候选人员" value="candidateUsers"></el-option>
          <el-option label="角色/岗位" value="candidateGroups"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="指定人员"
                    v-if="localFormData.type=='bpmn:UserTask' && localFormData.userType === 'assignee'">
        <el-select
            @change="(value) => addUser({assignee: value})"
            key="1"
            placeholder="请选择"
            v-model="localFormData.assignee"
        >
          <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in bpmnData.assignees"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="候选人员"
                    v-else-if="localFormData.type=='bpmn:UserTask' && localFormData.userType === 'candidateUsers'">
        <el-select
            @change="(value) => addUser({candidateUsers: value.join(',') || value})"
            key="2"
            multiple
            placeholder="请选择"
            v-model="localFormData.candidateUsers"
        >
          <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in bpmnData.candidateUsers"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="角色/岗位"
                    v-else-if="localFormData.type=='bpmn:UserTask' && localFormData.userType === 'candidateGroups'">
        <el-select
            @change="(value) => addUser({candidateGroups: value})"
            placeholder="请选择"
            v-model="localFormData.candidateGroups"
        >
          <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in bpmnData.roles"
          ></el-option>
        </el-select>
      </el-form-item>
      <!--sequenceFlow-->
      <el-form-item label="分支条件" v-if="localFormData.type=='bpmn:SequenceFlow'">
        <el-input @input="updateSequenceFlow" v-model="localFormData.sequenceFlow"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
