<script lang="ts" setup>
import {apiInstance, getRequest, postRequest, SelectOption} from "star-horse-lowcode";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import { ref } from "vue";
import {FormConfig} from "@/components/types";

const starHorseFormDesignRef = ref();
const loadMenu = (type: string, sysId: string) => {
  const userId = "";
  postRequest(
    `system-config/system/menusinfo/permissionMenus/${userId}/${sysId}`,
    {},
  );
};
const loadTableColumns = (
  type: string,
  dataSourceId: string,
  tbName: string,
) => {
  getRequest(
    `/userdb-manage/dbsearch/dbinfo/tableColumns/${dataSourceId}/${tbName}`,
  ).then((res: any) => {
    if (res.data.code != 0) {
      return;
    }
    let resData = res.data.data;
    let tableColumnsList: SelectOption[] = [];
    resData.forEach((item: any) => {
      tableColumnsList.push({
        name: item.comment,
        value: item.fieldName,
      });
    });
    starHorseFormDesignRef.value.setTableColumns(type, tableColumnsList);
  });
};
/**
 * 需要逐步的把StarHorseFormDesign 需要的参数给拎出来,
 */
const api = apiInstance("userdb-manage", "userdb/dynamicForm");
const optional:FormConfig={
  model:"full",
  primaryKey:"idDynamicForm",
  api:api
}
</script>

<template>
  <StarHorseFormDesign
    ref="starHorseFormDesignRef"
    :optional="optional"
    @loadMenu="loadMenu"
    @loadTableColumns="loadTableColumns"
  />
</template>

<style scoped lang="scss"></style>
