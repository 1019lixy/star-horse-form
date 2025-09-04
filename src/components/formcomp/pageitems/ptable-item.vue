<script setup lang="ts">
defineOptions({
  name: "PageTableItem",
});

interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
}

interface TableData {
  [key: string]: any;
}

defineProps({
  columns: {
    type: Array as () => TableColumn[],
    default: () => [
      { prop: "date", label: "日期", width: "180" },
      { prop: "name", label: "姓名", width: "180" },
      { prop: "address", label: "地址" }
    ]
  },
  data: {
    type: Array as () => TableData[],
    default: () => []
  },
  height: {
    type: String,
    default: ""
  },
  stripe: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <el-table
    :data="data"
    :height="height"
    :stripe="stripe"
    :border="border"
    class="w-full"
  >
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :width="column.width"
      :sortable="column.sortable"
    />
  </el-table>
</template>

<style scoped lang="scss"></style>