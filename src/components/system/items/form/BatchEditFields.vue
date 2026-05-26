<script setup lang="ts" name="BatchEditFields">
import {computed, reactive} from "vue";
import {getDesignFormStore} from "star-horse-lowcode";
import {Config} from "@/api/settings.js";
import {i18n} from "@/lang/index.js";

defineProps({
  compSize: {type: String, default: Config.compSize},
});
let designForm = getDesignFormStore();
const list = computed(() => designForm.compList);
let batchModifyData = reactive<any>({
  maxLength: 100,
  precision: 0,
  required: false,
  formVisible: true,
  searchVisible: true,
  listVisible: true,
});
// 递归处理condition容器的子条件节点
const batchModifyConditionChildren = (children: any[], val: any, fieldName: string) => {
  for (const child of children) {
    // 处理子条件节点的items（在根级别）
    if (child.items && Array.isArray(child.items)) {
      batchModifyAction(child.items, fieldName == "dataIndex" ? val++ : val, fieldName);
    }
    // 递归处理更深层的子条件
    if (child.children && Array.isArray(child.children)) {
      batchModifyConditionChildren(child.children, val, fieldName);
    }
  }
};

const batchModifyAction = (items: Array<any>, val: any, fieldName: string) => {
  for (const index in items) {
    const item = items[index];
    if (item.compType == "container") {
      // condition容器：处理preps.items/preps.children和根级别items/children
      if (item.itemType === "condition") {
        // 根级别的items（子条件节点）
        if (item.children && Array.isArray(item.children)) {
          batchModifyAction(item.children, fieldName == "dataIndex" ? val++ : val, fieldName);
        }
      } else {
        // 其他容器：处理preps.elements
        const sitems = item.preps?.elements;
        if (sitems) {
          for (const sindex in sitems) {
            const col = sitems[sindex];
            if (col.columns && Array.isArray(col.columns)) {
              col.columns.forEach((temp: any) => {
                batchModifyAction(temp.items, fieldName == "dataIndex" ? val++ : val, fieldName);
              });
            } else {
              batchModifyAction(col.items, fieldName == "dataIndex" ? val++ : val, fieldName);
            }
          }
        }
      }
    } else {
      item.preps[fieldName] = fieldName == "dataIndex" ? val++ : val;
    }
  }
};
const batchOperation = (val: any, fieldName: string) => {
  if (fieldName == "dataIndex") {
    val = 1;
  }
  batchModifyAction(list.value, val, fieldName);
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden batch-edit-fields">
    <div class="table-container">
      <div class="table-header-wrapper">
        <table class="batch-edit-table batch-edit-table-header">
          <colgroup>
            <col class="w-[15%]"/>
            <col class="w-[15%]"/>
            <col class="w-[15%]"/>
            <col class="w-[20%]"/>
            <col class="w-[7%]"/>
            <col class="w-[7%]"/>
            <col class="w-[7%]"/>
            <col class="w-[7%]"/>
            <col class="w-[10%]"/>
            <col class="w-[10%]"/>
          </colgroup>
          <thead>
          <tr class="table-header">
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.containerName") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.labelName") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.fieldName") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.maxLengthPrecision") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.required") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.formDisplay") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.searchDisplay") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.listDisplay") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.compSort") }}
            </th>
            <th class="header-cell">
              {{ i18n("dyform.batch.edit.field.defaultValue") }}
            </th>
          </tr>
          <tr class="batch-row">
            <td class="batch-cell">
              {{ i18n("dyform.batch.edit.field.batchSetting") }}
            </td>
            <td class="batch-cell">--</td>
            <td class="batch-cell">--</td>
            <td class="batch-cell">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number
                      v-model="batchModifyData.maxLength"
                      controls-position="right"
                      :size="compSize"
                      @change="(val: any) => batchOperation(val, 'maxLength')"
                      :placeholder="
                        i18n('dyform.batch.edit.field.placeholder.fieldLength')
                      "
                      clearable
                  />
                </el-col>
                <el-col :span="12">
                  <el-input-number
                      v-model="batchModifyData.precision"
                      controls-position="right"
                      :size="compSize"
                      @change="(val: any) => batchOperation(val, 'precision')"
                      :placeholder="
                        i18n('dyform.batch.edit.field.placeholder.precision')
                      "
                      clearable
                  />
                </el-col>
              </el-row>
            </td>
            <td class="batch-cell">
              <el-switch
                  v-model="batchModifyData.required"
                  :size="compSize"
                  @change="(val: any) => batchOperation(val, 'required')"
              />
            </td>
            <td class="batch-cell">
              <el-switch
                  v-model="batchModifyData.formVisible"
                  :size="compSize"
                  @change="(val: any) => batchOperation(val, 'formVisible')"
              />
            </td>
            <td class="batch-cell">
              <el-switch
                  v-model="batchModifyData.searchVisible"
                  :size="compSize"
                  @change="(val: any) => batchOperation(val, 'searchVisible')"
              />
            </td>
            <td class="batch-cell">
              <el-switch
                  v-model="batchModifyData.listVisible"
                  :size="compSize"
                  @change="(val: any) => batchOperation(val, 'listVisible')"
              />
            </td>
            <td class="batch-cell">
              <el-switch
                  v-model="batchModifyData.dataIndex"
                  :size="compSize"
                  @change="(val: any) => batchOperation(val, 'dataIndex')"
              />
            </td>
            <td class="batch-cell"></td>
          </tr>
          </thead>
        </table>
      </div>
      <div class="table-body-container">
        <el-scrollbar>
          <table class="batch-edit-table batch-edit-table-body">
            <colgroup>
              <col class="w-[15%]"/>
              <col class="w-[15%]"/>
              <col class="w-[15%]"/>
              <col class="w-[20%]"/>
              <col class="w-[7%]"/>
              <col class="w-[7%]"/>
              <col class="w-[7%]"/>
              <col class="w-[7%]"/>
              <col class="w-[10%]"/>
              <col class="w-[10%]"/>
            </colgroup>
            <tbody>
            <template v-for="(item, index) in list">
              <!-- 容器类型：通过FieldAnalysis递归处理（包括condition容器） -->
              <template v-if="item.compType == 'container'">
                <FieldAnalysis
                    :index="index + 1"
                    :size="compSize"
                    :field="item"
                    :container="item.preps.label || item.label || '--'"
                />
              </template>
              <!-- 非容器类型 -->
              <FieldAnalysis
                  :index="index + 1"
                  :field="item"
                  :size="compSize"
                  v-else-if="item.compType == 'item' || item.compType == 'formItem'"
                  :container="'--'"
              />
            </template>
            </tbody>
          </table>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.batch-edit-fields {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-header-wrapper {
  flex-shrink: 0;
  overflow: hidden;
}

.table-body-container {
  flex: 1;
  overflow: hidden;
}

.batch-edit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  table-layout: fixed;
}

.table-header {
  background-color: #f5f7fa;

  .header-cell {
    padding: 12px 8px;
    font-weight: 600;
    color: #606266;
    border: 1px solid #ebeef5;
    vertical-align: middle;
  }
}

.batch-row {
  background-color: #f0f9eb;

  .batch-cell {
    padding: 10px 8px;
    border: 1px solid #ebeef5;
    vertical-align: middle;
  }
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

.el-input-number,
.el-input-number-small {
  width: unset;
}
</style>
