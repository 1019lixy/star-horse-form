<script setup lang="ts" name="UserTransfer">
import { onMounted, ref } from 'vue';
import { analysisData } from '@/api/deptment';
import { closeLoad, postRequest, SelectOption } from 'star-horse-lowcode';

const deptUserList = ref<SelectOption>([]);
const selectUsers = ref<Array<number>>([]);
const pageInfo = ref<any>({
  currentPage: 1,
  pageSize: 100,
});
const init = async () => {
  // deptUserList.value = await loadDeptUser(false, []);
  // console.log(deptUserList.value);
  await loadByPage();
};
onMounted(() => {
  init();
});
const pageSizeClick = (pageSize: number) => {
  pageInfo.value.pageSize = pageSize;
  loadByPage();
};
const pageChangeClick = (currentPage: number) => {
  pageInfo.value.currentPage = currentPage;
  loadByPage();
};
const searchFields = ref<Array<any>>([]);
const filterMethod = (query, item) => {
  searchFields.value = [];
  // if (item) {
  //   searchFields.value.push({
  //     propertyName: "userName",
  //     value: item,
  //     operation: "lk",
  //     orOperList: [{
  //       propertyName: "name",
  //       value: item,
  //       operation: "lk",
  //     }]
  //   });
  // }
  // loadByPage();
};
const loadByPage = async () => {
  await postRequest('/system-config/system/usersinfoEntity/pageList', {
    currentPage: pageInfo.value.currentPage,
    pageSize: pageInfo.value.pageSize,
    fieldList: searchFields.value,
  })
    .then((res) => {
      let redata = res.data.data;
      pageInfo.value['dataList'] = redata.dataList;
      redata.dataList.forEach((item) => {
        let { listNames, listValues } = analysisData(
          item.deptList,
          '',
          'deptName',
          'idDepartment',
        );
        deptUserList.value.push({
          name:
            listNames.join('/') + '_' + item.name + '(' + item.username + ')',
          value: item.idUsersinfo,
        });
      });
      console.log(deptUserList.value);
      pageInfo.value['totalPage'] = redata.totalPages;
      pageInfo.value['totalData'] = redata.totalDatas;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      closeLoad();
    });
};
const getSelectedUsers = () => {
  return selectUsers.value;
};
const resetSelect = (val: Array<number> | null) => {
  selectUsers.value = val ? val : [];
};
defineExpose({
  getSelectedUsers,
  resetSelect,
});
</script>
<template>
  <div class="f-full text-center">
    <el-transfer
      filterable
      :props="{
        key: 'value',
        label: 'name',
      }"
      v-model="selectUsers"
      :data="deptUserList"
      :titles="['用户列表', '已选用户']"
      :button-texts="['移除', '添加']"
      :format="{
        noChecked: '${total}',
        hasChecked: '${checked}/${total}',
      }"
    >
      <template #left-footer>
        <el-pagination
          :total="pageInfo.totalData || 0"
          @current-change="pageChangeClick"
          @size-change="pageSizeClick"
          layout="prev, pager, next"
          :currentPage="pageInfo.currentPage || 1"
          :pageSize="pageInfo.pageSize || 50"
          :pageCount="pageInfo.totalPage || 1"
        />
      </template>
      <template #right-footer>
        <el-pagination
          :total="deptUserList.length"
          @current-change="pageChangeClick"
          @size-change="pageSizeClick"
          layout="prev, pager, next"
          :currentPage="1"
          :pageSize="50"
          :pageCount="1"
        />
      </template>
    </el-transfer>
  </div>
</template>
<style scoped lang="scss">
:deep(.el-transfer-panel) {
  width: 400px;
}
</style>
