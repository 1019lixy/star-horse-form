<script lang="ts">
import {defineComponent, onMounted, ref, shallowRef} from "vue";
import {PageProps} from "@/components/types/PageProps";
import {closeLoad, load} from "@/api/sh_api";
import {postRequest} from "@/api/star_horse";
import {FieldMapping, OrderByInfo} from "@/components/types/PageFieldInfo";
import {SearchParams} from "@/components/types/Params";

export default defineComponent({
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    let formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    const starHorseTableCompRef = ref();
    const filterCondtion = field.preps["filterCondition"] as Array<SearchParams>;
    const orderBy = field.preps["orderBy"] as Array<OrderByInfo>;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let multipleSelection = shallowRef<Array<any>>([]);
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      loadByPage();
    });
    let pageInfo = ref<PageProps>({
      pageSize: 20,
      currentPage: 1,
      totalData: 0,
      totalPage: 0,
      dataList: []
    });
    let searchData = shallowRef<Array<SearchParams>>([]);
    const pageSizeClick = (pageSize: number) => {
      pageInfo.value.pageSize = pageSize
      loadByPage()
    }
    const pageChangeClick = (currentPage: number) => {
      pageInfo.value.currentPage = currentPage
      loadByPage()
    }
    const loadByPage = () => {
      load('数据加载中');
      if (filterCondtion) {
        searchData.value.push(...filterCondtion);
      }
      let orderByTemp = [] as Array<OrderByInfo>;
      if (orderBy) {
        orderByTemp = orderBy;
      }
      postRequest(field.preps["dataUrl"]?.loadByPageUrl, {
        currentPage: pageInfo.value.currentPage,
        pageSize: pageInfo.value.pageSize,
        fieldList: searchData.value,
        orderBy: orderByTemp
      }).then((res) => {
        let redata = res.data.data
        pageInfo.value.dataList = redata.dataList;
        pageInfo.value.totalPage = redata.totalPages;
        pageInfo.value.totalData = redata.totalDatas;
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        closeLoad()
      });
    };
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    const searchDataFun = (data: any) => {
      searchData.value = data;
      loadByPage();
    };
    const getRowIdentity = (row: any) => {
      return row[field.preps.primaryKey]
    };
    const handleSelectionChange = (val: any) => {
      multipleSelection.value = val;
      assignVal();
    };
    const selectRow = (row: any, column: any, evt: any) => {
      const selected = multipleSelection.value.some((item: any) => item[field.preps.primaryKey] === row[field.preps.primaryKey]);
      if (!selected) {
        multipleSelection.value.push(row)
        starHorseTableCompRef.value.toggleRowSelection(row)
      } else {
        starHorseTableCompRef.value.toggleRowSelection(row, false)
      }
      assignVal();
    };
    const assignVal = () => {
      let fields = field.preps["needField"];
      let name = field.preps['name'];
      if (fields) {
        fields.forEach((temp: FieldMapping) => {
          context.attrs['formFieldList'][temp.distField] = multipleSelection.value.map(item => item[temp.sourceField]);
        });
      } else {
        context.attrs['formFieldList'][name] = multipleSelection.value.map(item => item[name]);
      }
      if (field.preps["recall"]) {
        field.preps["recall"](multipleSelection.value);
      }
    };
    return {
      parentCompType, formFieldList, context, field, formItem, formDatas,
      dataField, selectItem, keyEnterFun, actionName, pageInfo, pageSizeClick, pageChangeClick
      , getRowIdentity, searchDataFun, handleSelectionChange, starHorseTableCompRef, selectRow
    }
  }
});
</script>
<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType">
    <el-select
        :fid="field.preps['name']"
        :readonly="field.preps['readonly']=='yes'"
        :automatic-dropdown="field.preps['automaticDropdown']=='yes'"
        :clearable="true"
        :collapse-tags="true"
        :collapse-tags-tooltip="true"
        :default-first-option="field.preps['defaultFirstOption']=='yes'"
        :disabled="field.preps['disabled']=='yes'"
        :filterable="true"
        :multiple="true"
        :multiple-limit="field.preps['multipleLimit']"
        :name="field.preps['name']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :size="field.preps['size']"
        :tag-type="field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]">
      <template #empty="scope">
        <el-card>
<!--          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">-->
            <star-horse-search-comp :formData="field.preps['searchFieldList']"
                                    @searchData="(data)=>starHorseTableCompRef.createCreateParams(data)"
                                    :mutComp="true"
                                    :compUrl="field.preps['dataUrl']"/>
            <el-table
                ref="starHorseTableCompRef"
                :data="pageInfo.dataList"
                @selection-change="handleSelectionChange"
                @row-click="selectRow"
                :stripe="true"
                :row-key="getRowIdentity"
                :fit="true"
                height="250px"
                :highlight-current-row="true"
                :header-cell-style="{'background':'#f2f2f2',
      'color': '#707070',
      'font-size':'13px',
      'background-image': '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))'
      }"
                :cell-style="{'font-size':'12px'}"
                border
            >
              <el-table-column
                  type="selection"
                  align="center"
                  fixed="left"
                  :reserve-selection="true"
              />
              <template v-for="item in field.preps?.fieldList?.fieldList">
                <star-horse-table-column
                    :compUrl="field.preps['dataUrl']"
                    :cellEditable="false"
                    :data-format="field.preps['dataFormat']"
                    :item="item"
                />
              </template>
            </el-table>
        </el-card>
      </template>
      <template #footer>
        <el-pagination
            :total="pageInfo.totalData"
            @current-change="pageChangeClick"
            @size-change="pageSizeClick"
            layout="total, sizes, prev, pager, next, jumper"
            v-model:currentPage="pageInfo.currentPage"
            v-model:page-size="pageInfo.pageSize"
            v-model:pageCount="pageInfo.totalPage"
        />
      </template>
    </el-select>
  </starhorse-form-item>
</template>
<style lang="scss" scoped>
:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}
</style>