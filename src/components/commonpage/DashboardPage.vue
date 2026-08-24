<script setup lang="ts">
import {computed, ref} from "vue";
import {useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const stats = ref<any[]>([]);
const chartData = ref<any[]>([]);
const activeStat = ref(0);

const { isLoading, hasData, errorMsg, tableFieldList } = useCommonPage({
  props,
  formRef: ref(null) as any,
});

const buildDashboard = () => {
  const list = props.compList as any[];
  const dashComp = list?.find((c: any) => c?.preps?.dashboard);
  stats.value = dashComp?.preps?.stats || [
    { label: i18n("commonPage.dashboard.total"), value: 128, color: "#409eff" },
    {
      label: i18n("commonPage.dashboard.monthAdd"),
      value: 32,
      color: "#67c23a",
    },
    { label: i18n("commonPage.dashboard.pending"), value: 8, color: "#e6a23c" },
    { label: i18n("commonPage.dashboard.done"), value: 88, color: "#909399" },
  ];
  chartData.value = dashComp?.preps?.chartData || [
    { label: "1", value: 12 },
    { label: "2", value: 19 },
    { label: "3", value: 25 },
    { label: "4", value: 18 },
    { label: "5", value: 32 },
    { label: "6", value: 27 },
    { label: "7", value: 22 },
    { label: "8", value: 35 },
  ];
};
buildDashboard();

const maxChartValue = computed(() =>
  Math.max(...chartData.value.map((d) => d.value || 0), 1),
);
const totalStat = computed(() =>
  stats.value.reduce((s, v) => s + (v.value || 0), 0),
);
const formatNum = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1) + "w" : n.toString();
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showTable="true"
      :tableRowCount="4"
    />

    <template v-else-if="hasData">
      <el-card class="inner_content flex flex-col gap-4">
        <div class="stat-cards">
          <el-row :gutter="16">
            <el-col
              v-for="(s, i) in stats"
              :key="i"
              :xs="12"
              :sm="6"
              :md="6"
              :lg="6"
            >
              <el-card
                shadow="hover"
                class="stat-card"
                :style="{ borderTop: `3px solid ${s.color}` }"
                @click="activeStat = i"
              >
                <div class="stat-label">{{ s.label }}</div>
                <div class="stat-value" :style="{ color: s.color }">
                  {{ formatNum(s.value) }}
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="chart-section">
          <div class="section-title">
            {{ i18n("commonPage.dashboard.trend") }}
          </div>
          <div class="bar-chart">
            <div v-for="(d, i) in chartData" :key="i" class="bar-col">
              <div class="bar-wrap">
                <div
                  class="bar"
                  :style="{
                    height: ((d.value || 0) / maxChartValue) * 100 + '%',
                    background: stats[activeStat]?.color || '#409eff',
                  }"
                >
                  <span class="bar-val">{{ d.value }}</span>
                </div>
              </div>
              <div class="bar-label">{{ d.label }}</div>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">
            {{ i18n("commonPage.dashboard.summary") }}
          </div>
          <el-descriptions :column="3" border>
            <el-descriptions-item
              :label="i18n('commonPage.dashboard.totalCount')"
            >
              {{ totalStat }}
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('commonPage.dashboard.fieldCount')"
            >
              {{ (tableFieldList.fieldList || []).length }}
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('commonPage.dashboard.updateTime')"
            >
              {{ new Date().toLocaleString() }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style lang="scss" scoped>
.section-title {
  font-weight: 600;
  padding: 4px 0;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
  margin-bottom: 12px;
}
.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 240px;
  padding: 16px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
  justify-content: center;
}
.bar {
  width: 60%;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.bar-val {
  position: absolute;
  top: -20px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.bar-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
