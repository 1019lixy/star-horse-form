<template>
  <el-drawer
      v-if="node.attr"
      :width="scale.isMobile() ? '100%' : '40%'"
      :headerStyle="headerStyle"
      :bodyStyle="flowMixin.bodyStyle"
      placement="right"
      :closable="true"
      v-model="visible"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
  >
    <template #header>
      <div class="drawer-header">
      <img :src="flowMixin.branchIcon2" class="anticon"/>
      <span class="flow-drawer-title">
        <EditName v-model:nodeName="node.name"/>
      </span>
      </div>
    </template>
    <div class="flow-setting-module">
      <div class="flow-setting-content">
        <div v-if="node.attr.showPriorityLevel" class="flow-setting-item">
          <p class="flow-setting-item-title">分支等级</p>
          <el-select v-model="node.attr.priorityLevel" :size="flowMixin.size" placeholder="请选择等级" :options="levelOptions"
                    class="w-fill"></el-select>
        </div>
        <div class="flow-setting-item">
          <p class="flow-setting-item-title">分支类型</p>
          <el-radio-group v-model="node.attr.branchType">
            <el-radio :value="branchType.value" v-for="(branchType, i) in branchTypes" :key="i">
              {{ branchType.label }}
            </el-radio>
          </el-radio-group>
        </div>
        <div v-if="node.attr.branchType == 1" class="flow-setting-item">
          <p class="flow-setting-item-title">条件规则</p>
          <div class="flow-setting-condition-box">
            <div v-for="(group, i) in node.conditionGroup" :key="i">
              <div class="flow-setting-condition-group">
                <div class="flow-setting-condition-item" v-for="(condition, k) in group.conditions" :key="k">
                  <el-select v-model="condition.columnValue" :size="flowMixin.size" style="width: 40%" placeholder="字段"
                            @change="handleChange">
                    <el-option-group label="基础字段">
                      <el-option :value="column.value" v-for="(column, i) in columns" :key="i">{{
                          column.label
                        }}
                      </el-option>
                    </el-option-group>
                    <el-option-group label="表单字段">
                      <el-option :value="column.value" v-for="(column, i) in formColumns" :key="i">{{
                          column.label
                        }}
                      </el-option>
                    </el-option-group>
                  </el-select>
                  <div class="flow-setting-condition-option">
                    <!-- 判断(操作)符 -->
                    <FlowSimpleSelect v-model="condition.optType" :name="condition.optTypeName" :datas="optTypes"
                                      labelName="label" style="width: 26%"/>
                    <!-- 值类型 -->
                    <FlowSimpleSelect v-model="condition.valueType" :datas="valueTypes" labelName="label"
                                      style="width: 26%" @change="condition.conditionValue = []"/>
                    <!-- 值 -->
                    <div class="flow-setting-condition-value">
                      <!-- 动态值 -->
                      <FlowSelect
                          v-if="condition.valueType == 2"
                          v-model="condition.conditionValue"
                          :name="condition.conditionValueName"
                          :datas="dynamicValueTypes"
                          labelName="label"
                      />
                      <!-- 流程值 -->
                      <FlowSelect
                          v-else-if="condition.valueType == 3"
                          v-model="condition.conditionValue"
                          :name="condition.conditionValueName"
                          :datas="flowValueTypes"
                          labelName="label"
                      />
                      <!-- 数据源 -->
                      <FlowSelect
                          v-else-if="condition.valueType == 4"
                          v-model="condition.conditionValue"
                          :name="condition.conditionValueName"
                          :datas="columns"
                          labelName="label"
                      />
                      <!-- 固定 -->
                      <FlowInput v-else v-model="condition.conditionValue" :name="condition.conditionValueName"
                                 :size="flowMixin.size"/>
                    </div>
                  </div>
                  <div class="flow-setting-condition-del" @click="delCondition(1, group, condition)">
                    <star-horse-icon iconClass="delete" theme="filled"/>
                  </div>
                </div>
                <div class="flow-setting-condition-add" @click="addCondition(1, group)">
                  <star-horse-icon iconClass="plus" theme="filled"/>
                  <span style="margin-left: 5px">且条件</span>
                </div>
              </div>
              <div v-if="node.conditionGroup.length > 1 && i != node.conditionGroup.length - 1"
                   class="flow-setting-condition-group-connector">或
              </div>
            </div>
            <div class="flow-setting-condition-add" @click="addGroup(1)">
              <star-horse-icon iconClass="plus" theme="filled"/>
              <span style="margin-left: 5px">或条件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FlowDrawerFooter @close="onClose" @save="onSave"/>
  </el-drawer>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {uuid} from "@/api/system.ts";
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import FlowSelect from '@/views/workflow/plugin/Component/FlowSelect.vue';
import FlowSimpleSelect from '@/views/workflow/plugin/Component/FlowSimpleSelect.vue';
import FlowInput from '@/views/workflow/plugin/Component/FlowInput.vue';
import FlowDrawerFooter from '@/views/workflow/plugin/Common/DrawerFooter.vue';
import {ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let headerStyle = ref<any>({
  'background-color': '#5ccc98',
  'border-radius': '0px 0px 0 0',
});
// 等级
let levelOptions = ref<Array<any>>([]);
let branchTypes = ref<Array<any>>([
  {label: '规则', value: 1},
  {label: '公式', value: 2},
  {label: '其他', value: 3},
]);
let columns = ref<Array<any>>([
  {label: '姓名', value: '姓名'},
  {label: '工号', value: '工号'},
  {label: '部门', value: '部门'},
  {label: 'Base地', value: 'Base地'},
  {label: '所属体系', value: '所属体系'},
  {label: '归属地', value: '归属地'},
]);
let formColumns = ref<Array<any>>([{label: '加班类型', value: '加班类型'}]);
let optTypes = ref<Array<any>>([
  {label: '等于', value: 'eq'},
  {label: '不等于', value: 'ne'},
  {label: '大于', value: 'gt'},
  {label: '大于等于', value: 'ge'},
  {label: '小于', value: 'lt'},
  {label: '小于等于', value: 'le'},
  /*  { label: '为空', value: '7' },
  { label: '不为空', value: '8' }, */
]);
// 值类型
let valueTypes = ref<Array<any>>([
  {label: '固定', value: '1'},
  {label: '动态值', value: '2'},
  {label: '流程值', value: '3'},
  /* { label: '数据源', value: '4' }, */
]);
// 动态值类型
let dynamicValueTypes = ref<Array<any>>([
  {label: '当前员工', value: '1'},
  {label: '当前员工工号', value: '2'},
  {label: '当前部门', value: '3'},
  {label: '当前组织', value: '4'},
  {label: '下级部门', value: '5'},
  {label: '上级部门', value: '6'},
  {label: '当前日期', value: '7'},
  {label: '当前时间', value: '8'},
]);
// 流程值类型
let flowValueTypes = ref<Array<any>>([
  {label: '流程状态', value: '1'},
  {label: '流程创建人', value: '2'},
]);
// 表单数据
let dataSourceOptions = ref<Array<any>>([
  {
    value: '1',
    label: '本表单',
    children: [
      {label: '姓名', value: '姓名'},
      {label: '工号', value: '工号'},
      {label: '部门', value: '部门'},
      {label: 'Base地', value: 'Base地'},
      {label: '所属体系', value: '所属体系'},
      {label: '归属地', value: '归属地'},
    ],
  },
]);
const flowDesign = useFlowDesign(piniaInstance);
const afterVisibleChange = (val) => {
  console.log('visible', val);
}
const showDrawer = (snode, routeNode) => {
  visible.value = true;
  node.value = snode;
  // 等级
  if (snode.attr.showPriorityLevel) {
    levelOptions.value = [];
    routeNode.conditionNodes.forEach((item, index) => {
      let priorityLevel = index + 1;
      levelOptions.value.push({label: '优先' + priorityLevel, value: priorityLevel});
    });
  }
}
const onClose = () => {
  visible.value = false;
  emits('close');
}
const handleChange = () => {
}
const addGroup = (type) => {
  if (type == 1) {
    node.value.conditionGroup.push({
      id: uuid(),
      condition: 'OR',
      conditions: [
        {
          id: uuid(),
          columnId: '姓名',
          columnName: '姓名',
          columnValue: '姓名',
          columnType: undefined,
          optType: 'eq',
          optTypeName: '等于',
          valueType: '1',
          conditionValue: [],
          conditionValueName: [],
        },
      ],
    });
  }
}
const addCondition = (type, currGroup) => {
  if (type == 1) {
    node.value.conditionGroup.forEach((group) => {
      if (currGroup.id == group.id) {
        group.conditions.push({
          id: uuid(),
          columnId: undefined,
          columnName: undefined,
          columnValue: undefined,
          columnType: undefined,
          optType: undefined,
          optTypeName: undefined,
          valueType: undefined,
          conditionValue: [],
          conditionValueName: [],
        });
      }
    });
  }
}
const delCondition = (type, currGroup, CurrCondition) => {
  if (type == 1) {
    node.value.conditionGroup.forEach((group, k) => {
      if (currGroup.id == group.id) {
        group.conditions.forEach((condition, index) => {
          if (CurrCondition.id == condition.id) {
            group.conditions.splice(index, 1);
            // 当前组没有条件了，当前组也需要删除
            if (group.conditions.length == 0) {
              node.value.conditionGroup.splice(k, 1);
            }
          }
        });
      }
    });
  }
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  let content = '';
  if (node.value.attr.branchType == 1) {
    node.value.conditionGroup.forEach((group, j) => {
      if (j != 0) {
        content += ' 或 ';
      }
      if (group.conditions.length > 0) {
        group.conditions.forEach((condition, i) => {
          const conditionValueName = condition.conditionValueName[0];
          if (conditionValueName) {
            if (i != 0) {
              content += ' 且 ';
            }
            content += '[' + condition.columnValue + ' ' + condition.optTypeName + ' ' + conditionValueName + ']';
          }
        });
      }
    });
  } else {
    content += '任意(其他)';
  }
  flowDesign.flowUpdateNode( {currNode: node.value, field: 'content', value: null});
  flowDesign.flowUpdateNode(  {currNode: node.value, field: 'error', value: true});
  if (content) {
    console.info('content', content);
    flowDesign.flowUpdateNode(  {currNode: node.value, field: 'error', value: false});
    flowDesign.flowUpdateNode(  {currNode: node.value, field: 'content', value: content});
    onClose();
  }
}
defineExpose({
  showDrawer
})
</script>
