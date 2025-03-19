<script setup lang="ts">
  import { flowCommon } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import { uuid } from "@/api/system.ts";
  import FlowDrawerFooter from "@/views/workflow/plugin/common/DrawerFooter.vue";
  import { onMounted, ref, computed, onActivated, watch } from "vue";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import piniaInstance from "@/store";
  import { dictData, searchMatchList } from "@/api/star_horse_utils.ts";
  import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
  import { SelectOption } from "@/components/types/SearchProps";
  import { ModelRef } from "vue-demi";

  defineOptions({
    name: "BranchPrep"
  });
  let node: ModelRef<any> = defineModel("activeData");

  // 等级
  let levelOptions = ref<Array<any>>([]);
  let branchTypes = ref<SelectOption[]>([]);
  let columns = ref<Array<any>>([
    { label: "姓名", value: "姓名" },
    { label: "工号", value: "工号" },
    { label: "部门", value: "部门" },
    { label: "Base地", value: "Base地" },
    { label: "所属体系", value: "所属体系" },
    { label: "归属地", value: "归属地" }
  ]);
  let formColumns = ref<Array<any>>([{ label: "加班类型", value: "加班类型" }]);

  // 值类型
  let valueTypes = ref<Array<any>>([
    { label: "固定", value: "1" },
    { label: "动态值", value: "2" },
    { label: "流程值", value: "3" },
    { label: "数据源", value: "4" }
  ]);
  // 动态值类型
  let dynamicValueTypes = ref<Array<any>>([
    { label: "当前员工", value: "1" },
    { label: "当前员工工号", value: "2" },
    { label: "当前部门", value: "3" },
    { label: "当前组织", value: "4" },
    { label: "下级部门", value: "5" },
    { label: "上级部门", value: "6" },
    { label: "当前日期", value: "7" },
    { label: "当前时间", value: "8" }
  ]);
  // 流程值类型
  let flowValueTypes = ref<Array<any>>([
    { label: "流程状态", value: "1" },
    { label: "流程创建人", value: "2" }
  ]);
  // 表单数据
  const flowDesign = useFlowDesignStore(piniaInstance);
  const parentNode = computed(() => flowDesign.parentNode);
  const initLevel = () => {
    // 等级
    if (node.value.showPriorityLevel) {
      levelOptions.value = [];
      parentNode.value.conditionNodes.forEach((item: any, index: number) => {
        let priorityLevel = index + 1;
        if (!item.otherFlag) {
          levelOptions.value.push({ label: "优先" + priorityLevel, value: priorityLevel });
        }
      });
    }
  };
  const onClose = () => {
    flowDesign.setActive(false);
  };
  const handleChange = () => {};
  const addGroup = (type: number) => {
    if (type == 1) {
      node.value.conditionGroups.push({
        id: uuid(),
        condition: "OR",
        conditions: [
          {
            id: uuid(),
            columnId: "姓名",
            columnName: "姓名",
            columnValue: "姓名",
            columnType: undefined,
            optType: "eq",
            optTypeName: "等于",
            valueType: "1",
            conditionValue: [],
            conditionValueName: []
          }
        ]
      });
    }
  };
  const addCondition = (type: number, currGroup: any) => {
    if (type == 1) {
      node.value.conditionGroups.forEach((group: any) => {
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
            conditionValueName: []
          });
        }
      });
    }
  };
  const delCondition = (type: number, currGroup: any, CurrCondition: any) => {
    if (type == 1) {
      node.value.conditionGroups.forEach((group: any, k: number) => {
        if (currGroup.id == group.id) {
          group.conditions.forEach((condition: any, index: number) => {
            if (CurrCondition.id == condition.id) {
              group.conditions.splice(index, 1);
              // 当前组没有条件了，当前组也需要删除
              if (group.conditions.length == 0) {
                node.value.conditionGroups.splice(k, 1);
              }
            }
          });
        }
      });
    }
  };
  /**
   * 保存配置
   */
  const onSave = () => {
    // 更新节点显示信息
    let content = "";
    if (node.value.branchType == "rule") {
      node.value.conditionGroups.forEach((group: any, j: number) => {
        if (j != 0) {
          content += " 或 ";
        }
        if (group.conditions.length > 0) {
          group.conditions.forEach((condition: any, i: number) => {
            // const conditionValueName = condition.conditionValueName[0];
            // if (conditionValueName) {
            if (i != 0) {
              content += " 且 ";
            }
            content += "[" + condition.columnValue + " " + condition.optTypeName + " " + condition.conditionValue + "]";
            // }
          });
        }
      });
    } else {
      content += "任意(其他)";
    }
    onClose();
  };
  let currentLevel = ref<number>(0);
  let level = ref<number>(0);
  const levelChange = (newVal: any) => {
    parentNode.value.conditionNodes.forEach((item: any) => {
      if (item.priorityLevel == newVal) {
        item.priorityLevel = currentLevel.value;
      }
    });
    currentLevel.value = newVal;
    node.value.priorityLevel = newVal;
  };

  const init = async () => {
    branchTypes.value = await dictData("flow_branch_type");
    currentLevel.value = node.value.priorityLevel;
    level.value = currentLevel.value;
    initLevel();
  };
  onMounted(() => {
    init();
  });
  watch(
    () => node.value.id,
    () => {
      init();
    }
  );
</script>
<template>
  <el-form v-model="node" label-position="top">
    <el-form-item v-if="node.showPriorityLevel" label="分支等级" prop="name">
      <el-select
        v-model="level"
        @change="levelChange"
        filterable
        clearable
        :size="flowCommon.size"
        placeholder="请选择等级"
      >
        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="分支类型" prop="name">
      <el-radio-group
        v-model="node.branchType"
        filterable
        clearable
        :size="flowCommon.size"
        placeholder="请选择分支类型"
      >
        <el-radio-button v-for="item in branchTypes" :key="item.value" :label="item.name" :value="item.value" />
      </el-radio-group>
    </el-form-item>
    <el-divider content-position="left">条件规则</el-divider>
    <div class="flow-content">
      <div v-if="node.branchType == 'rule'" class="flow-item">
        <div class="flow-condition-box">
          <div v-for="(group, i) in node.conditionGroups" :key="i">
            <div class="flow-condition-group">
              <div class="flow-condition-item" v-for="(condition, k) in group.conditions" :key="k">
                <el-row gutter="5">
                  <el-col :span="6">
                    <el-select
                      v-model="condition.columnValue"
                      :size="flowCommon.size"
                      placeholder="字段"
                      filterable
                      clearable
                      @change="handleChange"
                    >
                      <el-option-group label="基础字段">
                        <el-option :value="column.value" v-for="(column, i) in columns" :key="i"
                          >{{ column.label }}
                        </el-option>
                      </el-option-group>
                      <el-option-group label="表单字段">
                        <el-option :value="column.value" v-for="(column, i) in formColumns" :key="i"
                          >{{ column.label }}
                        </el-option>
                      </el-option-group>
                    </el-select>
                  </el-col>
                  <el-col :span="5">
                    <!-- 判断(操作)符 -->
                    <el-select
                      v-model="condition.optType"
                      :size="flowCommon.size"
                      placeholder="操作符"
                      @change="handleChange"
                    >
                      <el-option
                        :value="optType.value"
                        :label="optType.name"
                        v-for="optType in searchMatchList()"
                        :key="optType.value"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="5">
                    <!-- 值类型 -->
                    <el-select
                      v-model="condition.valueType"
                      :size="flowCommon.size"
                      @change="condition.conditionValue = []"
                      placeholder="值类型"
                    >
                      <el-option
                        :value="valueType.value"
                        :label="valueType.label"
                        v-for="valueType in valueTypes"
                        :key="valueType.value"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <!-- 动态值 -->
                    <el-select
                      v-if="condition.valueType == 2"
                      :size="flowCommon.size"
                      v-model="condition.conditionValue"
                    >
                      <el-option
                        :value="valueType.value"
                        :label="valueType.label"
                        v-for="valueType in dynamicValueTypes"
                        :key="valueType.value"
                      />
                    </el-select>

                    <!-- 流程值 -->
                    <el-select
                      v-else-if="condition.valueType == 3"
                      :size="flowCommon.size"
                      v-model="condition.conditionValue"
                    >
                      <el-option
                        :value="valueType.value"
                        :label="valueType.label"
                        v-for="valueType in flowValueTypes"
                        :key="valueType.value"
                      />
                    </el-select>
                    <!-- 数据源 -->
                    <el-select
                      v-else-if="condition.valueType == 4"
                      :size="flowCommon.size"
                      v-model="condition.conditionValue"
                    >
                      <el-option
                        :value="valueType.value"
                        :label="valueType.label"
                        v-for="valueType in columns"
                        :key="valueType.value"
                      />
                    </el-select>
                    <!-- 固定 -->
                    <el-input v-else v-model="condition.conditionValue" :size="flowCommon.size" />
                  </el-col>
                  <el-col :span="2">
                    <star-horse-icon
                      @click.stop="delCondition(1, group, condition)"
                      iconClass="delete"
                      color="var(--el-color-danger)"
                    />
                  </el-col>
                </el-row>
              </div>
              <div class="listener-btn">
                <el-button text icon="plus" :size="flowCommon.size" @click="addCondition(1, group)">且条件</el-button>
              </div>
            </div>
            <div
              v-if="node.conditionGroups.length > 1 && i != node.conditionGroups.length - 1"
              class="flow-condition-group-connector"
              >或
            </div>
          </div>
          <div class="listener-btn">
            <el-button text icon="plus" :size="flowCommon.size" @click="addGroup(1)">或条件</el-button>
          </div>
        </div>
      </div>
      <div v-else-if="node.branchType == 'formula'" class="flow-item">
        <p class="flow-item-title"></p>
      </div>
      <div v-else class="flow-item">
        <p class="flow-item-title">其他</p>
      </div>
    </div>
  </el-form>
  <FlowDrawerFooter @close="onClose" @save="onSave" />
</template>
<style lang="scss" scoped>
  :deep {
    .el-row {
      width: 100%;
      align-items: center;
    }
  }
</style>
