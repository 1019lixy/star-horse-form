<script setup lang="ts" name="RoleCompanyPanel">
const props = defineProps({
  data: {type: Object},
  item: {type: Object}
});
</script>

<template>
  <el-card class="inner_content">
    <template #header>
      {{ item.label }}
    </template>
    <div class="content">
      <el-tag v-for="temp in data.companyList">{{ temp.name }}</el-tag>
    </div>

  </el-card>

</template>

<style scoped lang="scss">
.inner_content{
  margin: 0;
  width: 400px;
  .content{
    margin: 10px 5px;
    display: flex;
    justify-content: start;
    .el-tag{
      margin-left: 10px;
    }
  }
}
</style>