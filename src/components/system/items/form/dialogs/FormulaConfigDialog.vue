<script setup lang="ts">
import {computed, ref} from "vue";
import type {ConditionBranch, FormulaConfig, FormulaType, LookupMapping} from "@/components/types/FormulaConfig";
import {i18n} from "@/lang/index.js";

defineOptions({name: "FormulaConfigDialog"});

const props = defineProps<{
  itemType: string;
  prepsConfig:Record<string, any>;
  modelValue: FormulaConfig;
  fields: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: FormulaConfig): void;
}>();

const visible = ref(false);

const cfg = computed<FormulaConfig>({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/** 公式类型选项 - 通过 i18n 动态生成 */
const formulaTypeOptions = computed<Record<string, { label: string; value: FormulaType; desc: string }[]>>(() => ({
  number: [
    {label: i18n("dyform.formula.type.calc"), value: "calc", desc: i18n("dyform.formula.type.calc.desc")},
    {
      label: i18n("dyform.formula.type.aggregate"),
      value: "aggregate",
      desc: i18n("dyform.formula.type.aggregate.desc")
    },
    {
      label: i18n("dyform.formula.type.condition"),
      value: "condition",
      desc: i18n("dyform.formula.type.condition.desc")
    },
    {label: i18n("dyform.formula.type.ternary"), value: "ternary", desc: i18n("dyform.formula.type.ternary.desc")},
    {label: i18n("dyform.formula.type.format"), value: "format", desc: i18n("dyform.formula.type.format.desc.number")},
  ],
  input: [
    {label: i18n("dyform.formula.type.calc"), value: "calc", desc: i18n("dyform.formula.type.calc.desc")},
    {label: i18n("dyform.formula.type.concat"), value: "concat", desc: i18n("dyform.formula.type.concat.desc")},
    {
      label: i18n("dyform.formula.type.condition"),
      value: "condition",
      desc: i18n("dyform.formula.type.condition.desc")
    },
    {label: i18n("dyform.formula.type.ternary"), value: "ternary", desc: i18n("dyform.formula.type.ternary.desc")},
    {label: i18n("dyform.formula.type.lookup"), value: "lookup", desc: i18n("dyform.formula.type.lookup.desc")},
    {label: i18n("dyform.formula.type.dateCalc"), value: "dateCalc", desc: i18n("dyform.formula.type.dateCalc.desc")},
    {label: i18n("dyform.formula.type.format"), value: "format", desc: i18n("dyform.formula.type.format.desc.input")},
  ],
}));

const currentTypeOptions = computed(() => formulaTypeOptions.value[props.itemType] || []);

const formatTypes = computed(() => [
  {label: i18n("dyform.formula.format.type.thousands"), value: "thousands"},
  {label: i18n("dyform.formula.format.type.toFixed"), value: "toFixed"},
  {label: i18n("dyform.formula.format.type.padStart"), value: "padStart"},
  {label: i18n("dyform.formula.format.type.regex"), value: "regex"},
]);

const aggregateTypes = computed(() => [
  {label: i18n("dyform.formula.aggregate.sum"), value: "sum"},
  {label: i18n("dyform.formula.aggregate.avg"), value: "avg"},
  {label: i18n("dyform.formula.aggregate.count"), value: "count"},
  {label: i18n("dyform.formula.aggregate.min"), value: "min"},
  {label: i18n("dyform.formula.aggregate.max"), value: "max"},
]);

const dateUnits = computed(() => [
  {label: i18n("dyform.formula.dateCalc.unit.year"), value: "year"},
  {label: i18n("dyform.formula.dateCalc.unit.month"), value: "month"},
  {label: i18n("dyform.formula.dateCalc.unit.day"), value: "day"},
  {label: i18n("dyform.formula.dateCalc.unit.hour"), value: "hour"},
  {label: i18n("dyform.formula.dateCalc.unit.minute"), value: "minute"},
  {label: i18n("dyform.formula.dateCalc.unit.second"), value: "second"},
]);

const dateModes = computed(() => [
  {label: i18n("dyform.formula.dateCalc.mode.diff"), value: "diff"},
  {label: i18n("dyform.formula.dateCalc.mode.offset"), value: "offset"},
  {label: i18n("dyform.formula.dateCalc.mode.format"), value: "format"},
]);

const conditionBranches = computed<ConditionBranch[]>({
  get: () => cfg.value.branches || [{when: "", then: ""}],
  set: (val) => {
    cfg.value.branches = val;
  },
});

const addConditionBranch = () => {
  if (!cfg.value.branches) cfg.value.branches = [];
  cfg.value.branches.push({when: "", then: ""});
};

const removeConditionBranch = (index: number) => {
  cfg.value.branches?.splice(index, 1);
};

const lookupMappings = computed<LookupMapping[]>({
  get: () => cfg.value.lookupMappings || [{key: "", values: {}}],
  set: (val) => {
    cfg.value.lookupMappings = val;
  },
});

const addLookupMapping = () => {
  if (!cfg.value.lookupMappings) cfg.value.lookupMappings = [];
  cfg.value.lookupMappings.push({key: "", values: {}});
};

const removeLookupMapping = (index: number) => {
  cfg.value.lookupMappings?.splice(index, 1);
};

const onFormulaTypeChange = (type: FormulaType) => {
  const c = cfg.value;
  c.expression = "";
  c.branches = undefined;
  c.lookupMappings = undefined;
  c.precision = undefined;
  c.dateUnit = undefined;
  c.dateMode = undefined;
  c.dateOffset = undefined;
  c.dateFormat = undefined;
  c.formatType = undefined;
  c.formatArg = undefined;
  c.formatArg2 = undefined;
  c.aggregateField = undefined;
  c.defaultValue = undefined;

  switch (type) {
    case "condition":
      c.branches = [{when: "", then: ""}];
      c.defaultValue = "";
      break;
    case "lookup":
      c.lookupMappings = [{key: "", values: {}}];
      break;
    case "aggregate":
      c.expression = "sum";
      c.aggregateField = "";
      break;
    case "dateCalc":
      c.expression = "";
      c.dateUnit = "day";
      c.dateMode = "diff";
      break;
    case "format":
      c.expression = "";
      c.formatType = "thousands";
      break;
    case "ternary":
      c.expression = "";
      c.defaultValue = "";
      break;
  }
};

const insertFieldRef = (fieldName: string) => {
  const ref = `\${${fieldName}}`;
  const expr = cfg.value.expression || "";
  cfg.value.expression = expr + ref;
};

const open = () => {
  visible.value = true;
};
const close = () => {
  visible.value = false;
};

defineExpose({open, close});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      :title="i18n('dyform.formula.title')"
      @closeAction="close"
      @merge="close"
      :selfFunc="true"
      boxWidth="640px"
  >
    <el-form label-width="90px" label-position="right">
      <!-- 公式类型 -->
      <el-form-item :label="i18n('dyform.formula.type')">
        <el-select v-model="cfg.type" @change="onFormulaTypeChange"
                   :placeholder="i18n('dyform.formula.type.placeholder')" style="width: 100%">
          <el-option v-for="opt in currentTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value">
            <span>{{ opt.label }}</span>
            <span style="color: var(--el-text-color-secondary); font-size: 12px; margin-left: 8px">{{ opt.desc }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 依赖字段 -->
      <el-form-item :label="i18n('dyform.formula.sourceFields')">
        <el-select v-model="cfg.sourceFields" multiple filterable
                   :placeholder="i18n('dyform.formula.sourceFields.placeholder')" style="width: 100%">
          <el-option v-for="field in fields" :key="field.value" :label="field.label" :value="field.value"/>
        </el-select>
      </el-form-item>

      <!-- ===== calc: 数学运算 ===== -->
      <template v-if="cfg.type === 'calc'">
        <el-form-item :label="i18n('dyform.formula.expression')">
          <el-input v-model="cfg.expression" :placeholder="i18n('dyform.formula.expression.placeholder.calc')"
                    type="textarea" :rows="2"/>
          <div class="field-chips" v-if="cfg.sourceFields.length > 0">
            <el-tag v-for="fn in cfg.sourceFields" :key="fn" size="small" type="info" effect="plain"
                    @click="insertFieldRef(fn)" style="cursor: pointer; margin: 2px">
              {{ '${' + fn + '}' }}
            </el-tag>
          </div>
          <div class="form-help">{{ i18n('dyform.formula.expression.helpMsg.calc') }}</div>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.precision')">
          <el-input-number v-model="cfg.precision" controls-position="right" :min="0" :max="10"
                           :placeholder="i18n('dyform.formula.precision.placeholder')"/>
        </el-form-item>
      </template>

      <!-- ===== concat: 字符串拼接 ===== -->
      <template v-if="cfg.type === 'concat'">
        <el-form-item :label="i18n('dyform.formula.expression')">
          <el-input v-model="cfg.expression" :placeholder="i18n('dyform.formula.expression.placeholder.concat')"
                    type="textarea" :rows="2"/>
          <div class="field-chips" v-if="cfg.sourceFields.length > 0">
            <el-tag v-for="fn in cfg.sourceFields" :key="fn" size="small" type="info" effect="plain"
                    @click="insertFieldRef(fn)" style="cursor: pointer; margin: 2px">
              {{ '${' + fn + '}' }}
            </el-tag>
          </div>
          <div class="form-help">{{ i18n('dyform.formula.expression.helpMsg.concat') }}</div>
        </el-form-item>
      </template>

      <!-- ===== condition: 条件判断 ===== -->
      <template v-if="cfg.type === 'condition'">
        <el-form-item :label="i18n('dyform.formula.branches')">
          <div class="branch-list">
            <div v-for="(branch, index) in conditionBranches" :key="index" class="branch-item">
              <div class="branch-header">
                <span>{{ i18n('dyform.formula.branch.condition') }} {{ index + 1 }}</span>
                <el-button v-if="conditionBranches.length > 1" type="danger" text size="small"
                           @click="removeConditionBranch(index)">{{ i18n('dyform.formula.branch.delete') }}
                </el-button>
              </div>
              <el-input v-model="branch.when" :placeholder="i18n('dyform.formula.branch.when.placeholder')"
                        style="margin-bottom: 4px"/>
              <el-input v-model="branch.then" :placeholder="i18n('dyform.formula.branch.then.placeholder')"/>
            </div>
            <el-button type="primary" text size="small" @click="addConditionBranch">{{
                i18n('dyform.formula.branch.add')
              }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.defaultValue')">
          <el-input v-model="cfg.defaultValue"
                    :placeholder="i18n('dyform.formula.defaultValue.placeholder.condition')"/>
        </el-form-item>
      </template>

      <!-- ===== lookup: 联动回填 ===== -->
      <template v-if="cfg.type === 'lookup'">
        <el-form-item :label="i18n('dyform.formula.lookup.mappings')">
          <div class="branch-list">
            <div v-for="(mapping, index) in lookupMappings" :key="index" class="branch-item">
              <div class="branch-header">
                <span>{{ i18n('dyform.formula.lookup.mapping') }} {{ index + 1 }}</span>
                <el-button v-if="lookupMappings.length > 1" type="danger" text size="small"
                           @click="removeLookupMapping(index)">{{ i18n('dyform.formula.branch.delete') }}
                </el-button>
              </div>
              <el-input v-model="mapping.key" :placeholder="i18n('dyform.formula.lookup.key.placeholder')"
                        style="margin-bottom: 4px"/>
              <el-input
                  :model-value="JSON.stringify(mapping.values)"
                  @update:model-value="(val: string) => { try { mapping.values = JSON.parse(val); } catch {} }"
                  :placeholder="i18n('dyform.formula.lookup.values.placeholder')"
                  type="textarea"
                  :rows="2"
              />
            </div>
            <el-button type="primary" text size="small" @click="addLookupMapping">{{
                i18n('dyform.formula.lookup.add')
              }}
            </el-button>
          </div>
          <div class="form-help">{{ i18n('dyform.formula.lookup.helpMsg') }}</div>
        </el-form-item>
      </template>

      <!-- ===== aggregate: 聚合运算 ===== -->
      <template v-if="cfg.type === 'aggregate'">
        <el-form-item :label="i18n('dyform.formula.aggregate.method')">
          <el-select v-model="cfg.expression" :placeholder="i18n('dyform.formula.aggregate.method.placeholder')"
                     style="width: 100%">
            <el-option v-for="item in aggregateTypes" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.aggregate.field')">
          <el-input v-model="cfg.aggregateField" :placeholder="i18n('dyform.formula.aggregate.field.placeholder')"/>
          <div class="form-help">{{ i18n('dyform.formula.aggregate.field.helpMsg') }}</div>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.precision')">
          <el-input-number v-model="cfg.precision" controls-position="right" :min="0" :max="10"
                           :placeholder="i18n('dyform.formula.precision.placeholder')"/>
        </el-form-item>
      </template>

      <!-- ===== dateCalc: 日期计算 ===== -->
      <template v-if="cfg.type === 'dateCalc'">
        <el-form-item :label="i18n('dyform.formula.dateCalc.mode')">
          <el-select v-model="cfg.dateMode" :placeholder="i18n('dyform.formula.dateCalc.mode.placeholder')"
                     style="width: 100%">
            <el-option v-for="item in dateModes" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.expression')">
          <el-input
              v-model="cfg.expression"
              :placeholder="cfg.dateMode === 'diff' ? i18n('dyform.formula.dateCalc.expression.placeholder.diff') : i18n('dyform.formula.dateCalc.expression.placeholder.other')"
              type="textarea"
              :rows="2"
          />
          <div class="field-chips" v-if="cfg.sourceFields.length > 0">
            <el-tag v-for="fn in cfg.sourceFields" :key="fn" size="small" type="info" effect="plain"
                    @click="insertFieldRef(fn)" style="cursor: pointer; margin: 2px">
              {{ '${' + fn + '}' }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.dateCalc.unit')">
          <el-select v-model="cfg.dateUnit" :placeholder="i18n('dyform.formula.dateCalc.unit.placeholder')"
                     style="width: 100%">
            <el-option v-for="item in dateUnits" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="cfg.dateMode === 'offset'" :label="i18n('dyform.formula.dateCalc.offset')">
          <el-input-number v-model="cfg.dateOffset" controls-position="right"
                           :placeholder="i18n('dyform.formula.dateCalc.offset.placeholder')"/>
        </el-form-item>
        <el-form-item v-if="cfg.dateMode === 'format' || cfg.dateMode === 'offset'"
                      :label="i18n('dyform.formula.dateCalc.dateFormat')">
          <el-input v-model="cfg.dateFormat" :placeholder="i18n('dyform.formula.dateCalc.dateFormat.placeholder')"/>
        </el-form-item>
      </template>

      <!-- ===== format: 格式化 ===== -->
      <template v-if="cfg.type === 'format'">
        <el-form-item :label="i18n('dyform.formula.format.type')">
          <el-select v-model="cfg.formatType" :placeholder="i18n('dyform.formula.format.type.placeholder')"
                     style="width: 100%">
            <el-option v-for="item in formatTypes" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.expression')">
          <el-input v-model="cfg.expression" :placeholder="i18n('dyform.formula.expression.placeholder.format')"/>
          <div class="field-chips" v-if="cfg.sourceFields.length > 0">
            <el-tag v-for="fn in cfg.sourceFields" :key="fn" size="small" type="info" effect="plain"
                    @click="insertFieldRef(fn)" style="cursor: pointer; margin: 2px">
              {{ '${' + fn + '}' }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item v-if="cfg.formatType === 'toFixed'" :label="i18n('dyform.formula.format.decimalPlaces')">
          <el-input-number v-model="cfg.precision" controls-position="right" :min="0" :max="10"/>
        </el-form-item>
        <el-form-item v-if="cfg.formatType === 'padStart'" :label="i18n('dyform.formula.format.targetLength')">
          <el-input-number v-model="cfg.formatArg" controls-position="right" :min="1"/>
        </el-form-item>
        <el-form-item v-if="cfg.formatType === 'padStart'" :label="i18n('dyform.formula.format.padChar')">
          <el-input v-model="cfg.formatArg2" :placeholder="i18n('dyform.formula.format.padChar.placeholder')"/>
        </el-form-item>
        <el-form-item v-if="cfg.formatType === 'regex'" :label="i18n('dyform.formula.format.regexPattern')">
          <el-input v-model="cfg.formatArg" :placeholder="i18n('dyform.formula.format.regexPattern.placeholder')"/>
        </el-form-item>
        <el-form-item v-if="cfg.formatType === 'regex'" :label="i18n('dyform.formula.format.replaceValue')">
          <el-input v-model="cfg.formatArg2" :placeholder="i18n('dyform.formula.format.replaceValue.placeholder')"/>
        </el-form-item>
      </template>

      <!-- ===== ternary: 三元表达式 ===== -->
      <template v-if="cfg.type === 'ternary'">
        <el-form-item :label="i18n('dyform.formula.expression')">
          <el-input v-model="cfg.expression" :placeholder="i18n('dyform.formula.expression.placeholder.ternary')"
                    type="textarea" :rows="2"/>
          <div class="field-chips" v-if="cfg.sourceFields.length > 0">
            <el-tag v-for="fn in cfg.sourceFields" :key="fn" size="small" type="info" effect="plain"
                    @click="insertFieldRef(fn)" style="cursor: pointer; margin: 2px">
              {{ '${' + fn + '}' }}
            </el-tag>
          </div>
          <div class="form-help">{{ i18n('dyform.formula.expression.helpMsg.ternary') }}</div>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.defaultValue')">
          <el-input v-model="cfg.defaultValue" :placeholder="i18n('dyform.formula.defaultValue.placeholder.ternary')"/>
        </el-form-item>
      </template>

      <!-- ===== 前缀/后缀（与 formula 平级，属于 preps） ===== -->
      <div style="display: flex; gap: 12px">
        <el-form-item :label="i18n('dyform.formula.prefix')" style="flex: 1">
          <el-input v-model="props.prepsConfig.prefix" :placeholder="i18n('dyform.formula.prefix.placeholder')"/>
        </el-form-item>
        <el-form-item :label="i18n('dyform.formula.suffix')" style="flex: 1">
          <el-input v-model="props.prepsConfig.suffix" :placeholder="i18n('dyform.formula.suffix.placeholder')"/>
        </el-form-item>
      </div>
    </el-form>
  </star-horse-dialog>
</template>

<style lang="scss" scoped>
.field-chips {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.form-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 4px;
}

.branch-list {
  width: 100%;

  .branch-item {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
    background: var(--el-fill-color-lighter);

    .branch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-weight: 600;
    }
  }
}
</style>
