<script setup lang="ts">
  import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
  import { apiInstance, closeLoad, dialogPreps, load, loadGetData } from "@/api/sh_api";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { useRoute, useRouter } from "vue-router";
  import { navBarList } from "@/store/NavbarListStore";
  import { SearchProps } from "@/components/types/SearchProps";
  import { PageFieldInfo } from "@/components/types/PageFieldInfo";
  import { Config } from "@/api/settings.ts";

  const navBarListStore = navBarList();
  const router = useRouter();
  const starHorseTableCompRef = ref();
  const currentRoute = useRoute();
  const dataUrl = ref<ApiUrls>(apiInstance("", ""));
  const errorMsg = ref("数据加载中");
  let searchFormData = ref<SearchProps[]>();
  const tableFieldList = ref<PageFieldInfo>({
    fieldList: []
  });
  const primaryKey = ref("");
  const rules = ref({});
  const hasData = ref(false);
  const props = defineProps({
    param: { type: String, required: true }
  });
  const clear = () => {
    hasData.value = false;
  };
  const loadFormData = async (formId: string) => {
    let { data, error } = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`);
    if (error) {
      errorMsg.value = error;
      hasData.value = false;
      closeLoad();
      return;
    }
    hasData.value = data && Object.keys(data).length > 0;
    dataUrl.value = data["dataUrl"];
    searchFormData.value = data["searchFormData"] as SearchProps[];
    primaryKey.value = data["primaryKey"];
    tableFieldList.value = data["tableFieldList"] as PageFieldInfo;
    rules.value = data["rules"];
    await nextTick();
    closeLoad();
    starHorseTableCompRef.value.init();
  };
  watch(
    () => props.param,
    (val) => {
      clear();
      try {
        load("数据加载中。。。");
        loadFormData(val as string);
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    { deep: true }
  );
  //记录表单的属性
  const formFields = reactive<Array<any>>([]);
  provide("formFields", formFields);
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const dataFormat = (name: string, cellValue: object): any => {
    return cellValue;
  };
  const init = async () => {
    await loadFormData(props.param);
  };
  onMounted(async () => {
    await init();
  });
</script>
<style scoped></style>
<template>
  <template v-if="hasData">
    <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form
        @refresh="starHorseTableCompRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
    >
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
    </star-horse-dialog>
    <el-card class="inner_content">
      <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
        <star-horse-search-comp
          @searchData="(data: any) => starHorseTableCompRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
        <hr />
        <star-horse-button-list
          @tableCompFunc="(fun: any) => starHorseTableCompRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
        />
      </div>
      <hr />
      <star-horse-table-comp
        ref="starHorseTableCompRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :showBatchField="true"
        :dataFormat="dataFormat"
      />
    </el-card>
  </template>
</template>
