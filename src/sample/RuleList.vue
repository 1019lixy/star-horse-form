<template>
  <div class="rule-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>规则引擎管理</h2>
        <span class="header-desc">配置和管理表单联动、数据校验及业务规则</span>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon>
          <Plus />
        </el-icon>
        新建规则
      </el-button>
    </div>

    <!-- 搜索筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="规则类型">
          <el-select v-model="filterForm.ruleType" placeholder="全部类型" clearable style="width: 150px;">
            <el-option label="表单联动" value="FORM_LINKAGE" />
            <el-option label="数据校验" value="DATA_VALID" />
            <el-option label="业务规则" value="BUSINESS" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 130px;">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="规则名称/编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 规则表格 -->
    <div class="table-wrapper">
      <el-table :data="ruleList" border style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="ruleCode" label="规则编码" width="160">
          <template #default="{ row }">
            <span class="rule-code">{{ row.ruleCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" min-width="200">
          <template #default="{ row }">
            <span class="rule-name">{{ row.ruleName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ruleType" label="规则类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRuleTypeTag(row.ruleType)" effect="plain">
              {{ getRuleTypeText(row.ruleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleCategory" label="规则分类" width="120" />
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 'Y' ? 'success' : 'info'">
              {{ row.enabled === "Y" ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="success" link @click="handleTest(row)">
              <el-icon>
                <VideoPlay />
              </el-icon>
              测试
            </el-button>
            <el-button
              v-if="row.status !== 'PUBLISHED'"
              type="warning"
              link
              @click="handlePublish(row)"
            >
              <el-icon>
                <Upload />
              </el-icon>
              发布
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 规则设计器弹窗 -->
    <star-horse-dialog
      v-model="designerVisible"
      :title="currentRuleId ? '编辑规则' : '新建规则'"
      boxWidth="95%"
      boxHeight="90vh"
      :selfFunc="true"
      @closeAction="designerVisible = false"
      @merge="handleRuleSaved"
    >
      <RuleDesigner
        v-if="designerVisible"
        :rule-id="currentRuleId"
        @saved="handleRuleSaved"
        @close="designerVisible = false"
      />
    </star-horse-dialog>

    <!-- 测试执行弹窗 -->
    <RuleTestDialog
      :visible="testVisible"
      :rule-id="currentTestRuleId"
      @close="testVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Delete, Edit, Plus, Search, Upload, VideoPlay } from "@element-plus/icons-vue";
import { ruleDefinitionApi } from "@/api/rule_engine_api";
import RuleDesigner from "../components/rule/RuleDesigner.vue";
import RuleTestDialog from "../components/rule/dialogs/RuleTestDialog.vue";
import { error, operationConfirm, success } from "../shplugin/src";

const loading = ref(false);
const ruleList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const filterForm = reactive({
  ruleType: "",
  status: "",
  keyword: ""
});

const designerVisible = ref(false);
const currentRuleId = ref("");

const testVisible = ref(false);
const currentTestRuleId = ref("");

// 加载规则列表
const loadRuleList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm
    };
    const res = await ruleDefinitionApi.getRuleList(params);
    if (res.data.code === 200) {
      ruleList.value = res.data.data.records || [];
      total.value = res.data.data.total || 0;
    }
  } catch (err) {
    error("加载规则列表失败");
  } finally {
    loading.value = false;
  }
};

// 新建规则
const handleCreate = () => {
  currentRuleId.value = "";
  designerVisible.value = true;
};

// 编辑规则
const handleEdit = (row: any) => {
  currentRuleId.value = row.idRuleDefinition;
  designerVisible.value = true;
};

// 测试规则
const handleTest = (row: any) => {
  currentTestRuleId.value = row.idRuleDefinition;
  testVisible.value = true;
};

// 发布规则
const handlePublish = async (row: any) => {
  await operationConfirm("确定要发布此规则吗？发布后将立即生效。");
  try {
    const updateData = { ...row, status: "PUBLISHED" };
    await ruleDefinitionApi.updateRule(updateData);
    success("发布成功");
    loadRuleList();
  } catch (err) {
    error("发布失败");
  }
};

// 删除规则
const handleDelete = async (row: any) => {
  await operationConfirm("确定要删除此规则吗？此操作不可恢复。");
  try {
    await ruleDefinitionApi.deleteRule(row.idRuleDefinition);
    success("删除成功");
    loadRuleList();
  } catch (err) {
    error("删除失败");
  }
};

// 规则保存成功
const handleRuleSaved = () => {
  designerVisible.value = false;
  loadRuleList();
};

// 查询
const handleSearch = () => {
  currentPage.value = 1;
  loadRuleList();
};

// 重置
const handleReset = () => {
  filterForm.ruleType = "";
  filterForm.status = "";
  filterForm.keyword = "";
  currentPage.value = 1;
  loadRuleList();
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadRuleList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadRuleList();
};

// 工具方法
const getRuleTypeTag = (type: string) => {
  const map: any = { FORM_LINKAGE: "primary", DATA_VALID: "success", BUSINESS: "warning" };
  return map[type] || "info";
};

const getRuleTypeText = (type: string) => {
  const map: any = { FORM_LINKAGE: "表单联动", DATA_VALID: "数据校验", BUSINESS: "业务规则" };
  return map[type] || type;
};

const getStatusTag = (status: string) => {
  const map: any = { DRAFT: "info", PUBLISHED: "success", DISABLED: "danger" };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: any = { DRAFT: "草稿", PUBLISHED: "已发布", DISABLED: "已禁用" };
  return map[status] || status;
};

const formatTime = (time: string) => {
  if (!time) return "";
  return new Date(time).toLocaleString("zh-CN");
};

onMounted(() => {
  loadRuleList();
});
</script>

<style scoped lang="scss">
.rule-list-page {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f0f2f5;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .header-info {
      h2 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: #1f2937;
      }

      .header-desc {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  .filter-bar {
    padding: 16px 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .rule-code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #6366f1;
    }

    .rule-name {
      font-weight: 500;
      color: #1f2937;
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
