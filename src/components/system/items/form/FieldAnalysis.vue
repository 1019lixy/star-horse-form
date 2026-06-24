<script setup lang="ts" name="FieldAnalysis">
import {Config} from "@/api/settings.js";
import {i18n} from "@/lang";
import {onMounted, PropType} from "vue";
import {fieldPlaceholder} from "@/components/system/items/utils/ItemPreps.js";
import camelCase from "camelcase";

const props = defineProps({
  container: {type: String, default: ""},
  field: {type: Object as PropType<any>, required: true},
  index: {type: Number, required: true, default: 1},
  size: {type: String, default: Config.compSize},
});
const numberLengthComp: Array<string> = [
  "number",
  "rate",
  "number-range",
  "slider",
];
const exclusionLengthComp: Array<string> = ["time", "time-picker", "datetime"];
const needBigLengthComp: Array<string> = [
  "textarea",
  "htmleditor",
  "json",
  "json-array",
  "html",
  "signature",
  "markdown",
];
const itemKey = (item: any) => {
  if (item.name) {
    item.name = camelCase(item.name);
  }
}
onMounted(() => {
  let preps = props.field.preps;
  if (needBigLengthComp.includes(props.field.itemType)) {
    preps.maxLength = preps.maxLength ?? 2000;
  } else if (props.field.itemType == "switch") {
    preps.maxLength = 20;
  } else if (numberLengthComp.includes(props.field.itemType)) {
    preps.precision = preps.precision ?? 2;
    preps.maxLength = preps.maxLength ?? 15;
  } else if (!exclusionLengthComp.includes(props.field.itemType)) {
    preps.maxLength = preps.maxLength ?? 100;
  }
});
</script>
<template>
  <template v-if="field?.compType == 'container'">
    <!-- condition容器：遍历items和children -->
    <template v-if="field.itemType === 'condition'">
      <!-- condition直接叶子节点（items在根级别） -->
      <template v-for="(leafItem, leafIndex) in (field.items || field.preps.items || [])">
        <FieldAnalysis
            :index="index + leafIndex + 1"
            :field="leafItem"
            :container="container + '>' + (field.preps.label || field.label)"
        />
      </template>
      <!-- condition子条件节点 -->
      <template v-for="child in (field.children || field.preps.children || [])">
        <FieldAnalysis
            :index="index"
            :field="child"
            :container="container + '>' + (field.preps.label || field.label)"
        />
      </template>
    </template>
    <!-- 其他容器：遍历preps.elements -->
    <template v-else-if="field.preps['elements']?.length > 0" v-for="sitem in field.preps['elements']">
      <template v-for="sitem1 in sitem['columns']">
        <template v-for="(sitem2, sindex) in sitem1.items">
          <FieldAnalysis
              :index="index + sindex + 1"
              :field="sitem2"
              :container="container + '>' + field.preps.label"
          />
        </template>
      </template>
      <template v-for="(sitem2, sindex) in sitem.items">
        <FieldAnalysis
            :index="index + sindex + 1"
            :field="sitem2"
            :container="container + '>' + field.preps.label"
        />
      </template>
    </template>
  </template>
  <template v-else-if="field?.preps">
    <tr class="field-row" :class="{ 'field-row-even': index % 2 == 0 }" :key="itemKey(field.preps)">
      <td class="field-cell">
        <el-tag size="small">{{ container }}</el-tag>
      </td>
      <td class="field-cell">
        <el-input
            v-model="field.preps['label']"
            @blur="fieldPlaceholder(field.preps, field)"
            :size="size"
            :placeholder="i18n('dyform.fieldAnalysis.406')"
            clearable
        />
      </td>
      <td class="field-cell">
        <el-input
            v-model="field.preps['name']"
            @blur="fieldPlaceholder(field.preps, field)"
            :size="size"
            :placeholder="i18n('dyform.fieldAnalysis.407')"
            clearable
        />
      </td>
      <td class="field-cell">
        <el-row :gutter="10" :align="'middle'">
          <el-col :span="12">
            <el-input-number
                v-model="field.preps['maxLength']"
                :size="size"
                :placeholder="i18n('dyform.fieldAnalysis.408')"
                min="1"
                :controls="false"
                v-if="!exclusionLengthComp.includes(field.itemType)"
                clearable
            />
          </el-col>
          <el-col :span="12">
            <el-input-number
                min="0"
                v-model="field.preps['precision']"
                :size="size"
                :placeholder="i18n('dyform.fieldAnalysis.409')"
                v-if="numberLengthComp.includes(field.itemType)"
                :controls="false"
                clearable
            />
          </el-col>
        </el-row>
      </td>
      <td class="field-cell">
        <el-switch
            v-model="field.preps['required']"
            :size="size"
            :active-value="true"
            :inactive-value="false"
        />
      </td>
      <td class="field-cell">
        <el-switch
            v-model="field.preps['formVisible']"
            :size="size"
            :active-value="true"
            :inactive-value="false"
        />
      </td>
      <td class="field-cell">
        <el-switch
            v-model="field.preps['searchVisible']"
            :size="size"
            :active-value="true"
            :inactive-value="false"
        />
      </td>
      <td class="field-cell">
        <el-switch
            v-model="field.preps['listVisible']"
            :size="size"
            :active-value="true"
            :inactive-value="false"
        />
      </td>
      <td class="field-cell">
        <el-input-number
            v-model="field.preps['dataIndex']"
            :size="size"
            controls-position="right"
            :placeholder="i18n('dyform.extend.352')"
        />
      </td>
      <td class="field-cell">
        <el-input
            v-model="field.preps['defaultValue']"
            :size="size"
            :placeholder="i18n('dyform.fieldAnalysis.410')"
        />
      </td>
    </tr>
  </template>
</template>
<style scoped lang="scss">
.field-row {
  background-color: #ffffff;

  &:hover {
    background-color: #f5f7fa;
  }

  &.field-row-even {
    background-color: #fafafa;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .field-cell {
    padding: 10px 8px;
    border: 1px solid #ebeef5;
    vertical-align: middle;

    :deep(.el-input) {
      width: 100% !important;
    }

    :deep(.el-input-number) {
      width: 100% !important;
    }

    :deep(.el-input-number .el-input__inner) {
      text-align: center;
    }

    :deep(.el-switch) {
      display: flex;
      justify-content: center;
    }
  }
}

.batch-edit-table {
  table-layout: fixed;
  width: 100%;
}

.el-input-number,
.el-input-number-small {
  width: unset;
}
</style>
