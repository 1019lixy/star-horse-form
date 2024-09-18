<template>
  <star-horse-dialog :title="dialogTitle" :visible="batchDialogTableVisible" @merge="merge"
                     @mergeDraft="mergeDraft"
                     @reset="resetForm"
                     is-batch="true">
    <el-form :model="ruleForm" :rules="rules" class="demo-ruleForm" ref="ruleForm">
      <el-table
          :data="ruleForm.batchDataList"
          :row-class-name="rowClassName"
          @selection-change="handleDetailSelectionChange"
          border
          fit=true
          ref="tb"
          v-loading="loading"
      >
        <el-table-column align="center" fixed="left" type="selection" width="50"/>
        <el-table-column align="center" label="序号" prop="xh" width="80"></el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="主键"
            min-width="200px"
            prop="idToolConfig"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.idToolConfig'" required>
              <el-input clearable placeholder="请输入主键"
                        v-model="scope.row.idToolConfig"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="主键"
            min-width="200px"
            prop="idToolCategory"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.idToolCategory'" required>
              <el-input clearable placeholder="请输入主键"
                        v-model="scope.row.idToolCategory"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="部署地址"
            min-width="200px"
            prop="deployHost"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.deployHost'" required>
              <el-input clearable placeholder="请输入部署地址"
                        v-model="scope.row.deployHost"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="端口"
            min-width="200px"
            prop="deployPort"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.deployPort'" required>
              <el-input clearable placeholder="请输入端口"
                        v-model="scope.row.deployPort"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="管理员账号"
            min-width="200px"
            prop="adminAccount"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.adminAccount'" required>
              <el-input clearable placeholder="请输入管理员账号"
                        v-model="scope.row.adminAccount"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="管理员密码"
            min-width="200px"
            prop="adminSecurity"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.adminSecurity'" required>
              <el-input clearable placeholder="请输入管理员密码"
                        v-model="scope.row.adminSecurity"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="修改人"
            min-width="200px"
            prop="updatedBy"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.updatedBy'">
              <el-input clearable placeholder="请输入修改人"
                        v-model="scope.row.updatedBy"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="修改时间"
            min-width="200px"
            prop="updatedDate"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.updatedDate'">
              <el-date-picker clearable placeholder="请选择修改时间"
                              type="date"
                              v-model="scope.row.updatedDate">
              </el-date-picker>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="创建人"
            min-width="200px"
            prop="createdBy"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.createdBy'">
              <el-input clearable placeholder="请输入创建人"
                        v-model="scope.row.createdBy"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="创建时间"
            min-width="200px"
            prop="createdDate"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.createdDate'">
              <el-date-picker clearable placeholder="请选择创建时间"
                              type="date"
                              v-model="scope.row.createdDate">
              </el-date-picker>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="数据编号"
            min-width="200px"
            prop="dataNo"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.dataNo'">
              <el-input clearable placeholder="请输入数据编号"
                        v-model="scope.row.dataNo"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="是否删除 1 是 2 否 默认2"
            min-width="200px"
            prop="isDel"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.isDel'">
              <el-input clearable placeholder="请输入是否删除 1 是 2 否 默认2"
                        v-model="scope.row.isDel"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="状态名称"
            min-width="200px"
            prop="statusName"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.statusName'">
              <el-input clearable placeholder="请输入状态名称"
                        v-model="scope.row.statusName"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="状态编码"
            min-width="200px"
            prop="statusCode"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.statusCode'" required>
              <el-select clearable placeholder="请选择状态" v-model="scope.row.statusCode">
                <el-option
                    :key="sitem.statusCode"
                    :label="sitem.statusName"
                    :value="sitem.statusCode"
                    v-for="sitem in selectData"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150px">
          <template #header="scope">
            <span>操作</span>&nbsp;&nbsp;
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini"
                       style="background: var(--star-horse-style);color: var(--star-horse-white)">
              <el-tooltip content="添加一行">
                <star-horse-icon icon-class="plus" style="vertical-align: middle;color:#409EFF;"/>
              </el-tooltip>
            </el-button>
          </template>
          <template #default="scope">
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini"
                       style="background: var(--star-horse-style);color: var(--star-horse-white)">
              <el-tooltip content="添加一行">添加</el-tooltip>
            </el-button>
            <el-button @click="handleAddDetails(scope.row,2)" link size="mini" type="danger">
              <el-tooltip content="删除当前行">删除</el-tooltip>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </star-horse-dialog>
  <star-horse-dialog :title="dialogTitle" :visible="dialogTableVisible" @merge="merge" @mergeDraft="mergeDraft"
                     @reset="resetForm">
    <el-form :model="ruleForm" :rules="rules" class="demo-ruleForm" ref="ruleForm">
      <el-form-item label="主键" prop="idToolConfig" v-if="false">
        <el-input clearable placeholder="请输入主键"
                  v-model="ruleForm.idToolConfig"></el-input>
      </el-form-item>
      <el-form-item label="主键" prop="idToolCategory"
                    required v-if="true">
        <el-input-number clearable placeholder="请输入主键"
                         v-model="ruleForm.idToolCategory"/>
      </el-form-item>
      <el-form-item label="部署地址" prop="deployHost"
                    required v-if="true">
        <el-input clearable placeholder="请输入部署地址"
                  v-model="ruleForm.deployHost"></el-input>
      </el-form-item>
      <el-form-item label="端口" prop="deployPort"
                    required v-if="true">
        <el-input clearable placeholder="请输入端口"
                  v-model="ruleForm.deployPort"></el-input>
      </el-form-item>
      <el-form-item label="管理员账号" prop="adminAccount"
                    required v-if="true">
        <el-input clearable placeholder="请输入管理员账号"
                  v-model="ruleForm.adminAccount"></el-input>
      </el-form-item>
      <el-form-item label="管理员密码" prop="adminSecurity"
                    required v-if="true">
        <el-input clearable placeholder="请输入管理员密码"
                  v-model="ruleForm.adminSecurity"></el-input>
      </el-form-item>
      <el-form-item label="修改人" prop="updatedBy"
                    v-if="!true">
        <el-input clearable placeholder="请输入修改人"
                  v-model="ruleForm.updatedBy"></el-input>
      </el-form-item>
      <el-form-item label="修改时间" prop="updatedDate"
                    v-if="!true">
        <el-date-picker clearable placeholder="请选择修改时间" type="date"
                        v-model="ruleForm.updatedDate">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建人" prop="createdBy"
                    v-if="!true">
        <el-input clearable placeholder="请输入创建人"
                  v-model="ruleForm.createdBy"></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdDate"
                    v-if="!true">
        <el-date-picker clearable placeholder="请选择创建时间" type="date"
                        v-model="ruleForm.createdDate">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="数据编号" prop="dataNo"
                    v-if="!true">
        <el-input clearable placeholder="请输入数据编号"
                  v-model="ruleForm.dataNo"></el-input>
      </el-form-item>
      <el-form-item label="是否删除 1 是 2 否 默认2" prop="isDel"
                    v-if="!true">
        <el-input-number clearable placeholder="请输入是否删除 1 是 2 否 默认2"
                         v-model="ruleForm.isDel"/>
      </el-form-item>
      <el-form-item label="状态名称" prop="statusName"
                    v-if="!true">
        <el-input clearable placeholder="请输入状态名称"
                  v-model="ruleForm.statusName"></el-input>
      </el-form-item>
      <el-form-item label="状态编码" prop="statusCode"
                    required v-if="true">
        <el-select placeholder="请选择状态编码" v-model="ruleForm.statusCode">
          <el-option
              :key="sitem.statusCode"
              :label="sitem.statusName"
              :value="sitem.statusCode"
              clearable
              v-for="sitem in selectData"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <star-horse-dialog :is-view="true" :title="'查看数据'" :visible="viewVisible">
    <el-form :model="ruleForm" class="view-ruleForm" label-width="15%" ref="ruleForm">
      <el-form-item label="主键" prop="idToolConfig">
        <span>{{ ruleForm.idToolConfig }}</span>
      </el-form-item>
      <el-form-item label="主键" prop="idToolCategory">
        <span>{{ ruleForm.idToolCategory }}</span>
      </el-form-item>
      <el-form-item label="部署地址" prop="deployHost">
        <span>{{ ruleForm.deployHost }}</span>
      </el-form-item>
      <el-form-item label="端口" prop="deployPort">
        <span>{{ ruleForm.deployPort }}</span>
      </el-form-item>
      <el-form-item label="管理员账号" prop="adminAccount">
        <span>{{ ruleForm.adminAccount }}</span>
      </el-form-item>
      <el-form-item label="管理员密码" prop="adminSecurity">
        <span>{{ ruleForm.adminSecurity }}</span>
      </el-form-item>
      <el-form-item label="修改人" prop="updatedBy">
        <span>{{ ruleForm.updatedBy }}</span>
      </el-form-item>
      <el-form-item label="修改时间" prop="updatedDate">
        <span>{{ ruleForm.updatedDate }}</span>
      </el-form-item>
      <el-form-item label="创建人" prop="createdBy">
        <span>{{ ruleForm.createdBy }}</span>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdDate">
        <span>{{ ruleForm.createdDate }}</span>
      </el-form-item>
      <el-form-item label="数据编号" prop="dataNo">
        <span>{{ ruleForm.dataNo }}</span>
      </el-form-item>
      <el-form-item label="是否删除 1 是 2 否 默认2" prop="isDel">
        <span>{{ ruleForm.isDel }}</span>
      </el-form-item>
      <el-form-item label="状态名称" prop="statusName">
        <span>{{ ruleForm.statusName }}</span>
      </el-form-item>
      <el-form-item label="状态编码" prop="statusCode">
        <span>{{ ruleForm.statusCode }}</span>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <el-card>
    <el-form class="search_area" size="small">
      <el-form-item label="状态名称">
        <el-input placeholder="请输入状态名称" v-model="searchForm.statusName"/>
      </el-form-item>
      <el-form-item label="添加时间">
        <el-date-picker
            end-placeholder="结束日期" placeholder="请选择添加时间"
            range-separator="到"
            start-placeholder="开始日期"
            type="daterange"
            v-model="searchForm.createdDate"
        />
      </el-form-item>
      <el-form-item label="     ">
        <el-button @click="dataSearch" link style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="search"/>
          <span style="vertical-align: middle;"> 查询 </span>
        </el-button>
        <el-button @click="dataSearch(1)" link small>
          <span style="vertical-align: middle;"> 重置 </span>
        </el-button>
      </el-form-item>
    </el-form>
    <hr>
    <ul class="inner_button">
      <li v-if="permission.add">
        <el-button @click="btnOperation(1)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="add"/>
          <el-tooltip content="新增">新增</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.batchAdd">
        <el-button @click="btnOperation(11)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="batch-add"/>
          <el-tooltip content="批量新增">批量新增</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.delete">
        <el-button @click="btnOperation(4)" link title="" type="danger">
          <star-horse-icon icon-class="batch_delete1"/>
          <el-tooltip content="批量删除">批量删除</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.view">
        <el-button @click="btnOperation(5)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="refresh"/>
          <el-tooltip content="刷新">刷新</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.download">
        <el-button @click="btnOperation(6)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="document_download"/>
          <el-tooltip content="下载模板">下载模板</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.execution">
        <el-button @click="btnOperation(7)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="run"/>
          <el-tooltip content="执行">执行</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.upload">
        <el-upload
            :action="uploadUrl"
            :auto-upload="true"
            :on-change="upload"
            :on-error="uploadError"
            :on-progress="uploadProcess"
            :on-success="uploadSuccess"
            :show-file-list="false"
            class="upload-demo"
            name="file"
        >
          <el-button link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
            <star-horse-icon icon-class="excel-upload"/>
            <el-tooltip content="上传">上传</el-tooltip>
          </el-button>
        </el-upload>
      </li>
      <li v-if="permission.export">
        <el-button @click="btnOperation(8)" link title=""
                   style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="excel-export"/>
          <el-tooltip content="导出">导出</el-tooltip>
        </el-button>
      </li>
    </ul>
    <el-table
        :data="dataList"
        :row-key="getRowIdentity"
        @row-dblclick="editData"
        @selection-change="handleSelectionChange"
        border
        fit=true
        highlight-current-row=true
        id="toolsConfigs"
        ref="multipleTable"
        strip=true
    >
      <el-table-column fixed width="1"/>
      <el-table-column
          :reserve-selection="true"
          align="center"
          fixed="left"
          type="selection"
      />
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="主键"
          min-width="200px"
          prop="idToolConfig"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="主键"
          min-width="200px"
          prop="idToolCategory"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="部署地址"
          min-width="200px"
          prop="deployHost"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="端口"
          min-width="200px"
          prop="deployPort"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="管理员账号"
          min-width="200px"
          prop="adminAccount"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="管理员密码"
          min-width="200px"
          prop="adminSecurity"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="修改人"
          min-width="200px"
          prop="updatedBy"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="修改时间"
          min-width="200px"
          prop="updatedDate"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="创建人"
          min-width="200px"
          prop="createdBy"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="创建时间"
          min-width="200px"
          prop="createdDate"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="数据编号"
          min-width="200px"
          prop="dataNo"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="是否删除 1 是 2 否 默认2"
          min-width="200px"
          prop="isDel"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="状态名称"
          min-width="200px"
          prop="statusName"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="状态编码"
          min-width="200px"
          prop="statusCode"
          v-if=" false ">
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="180px">
        <template #default="scope">
          <el-button @click="editById(scope.row[primaryKey])" link title=""
                     style="background: var(--star-horse-style);color: var(--star-horse-white)"
                     v-if="permission.edit">
            <el-tooltip content="编辑">编辑</el-tooltip>
          </el-button>
          <el-button @click="viewById(scope.row[primaryKey])" link title=""
                     style="background: var(--star-horse-style);color: var(--star-horse-white)"
                     v-if="permission.view">
            <el-tooltip content="查看">查看</el-tooltip>
          </el-button>
          <el-button @click="deleteById(scope.row[primaryKey])" link title="" type="danger"
                     v-if="permission.delete">
            <el-tooltip content="删除">删除</el-tooltip>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <hr>
    <el-pagination
        :total="totalData"
        @current-change="pageChangeClick"
        @size-change="pageSizeClick"
        layout="total, sizes, prev, pager, next, jumper"
        v-model:currentPage="currentPage"
        v-model:page-size="pageSize"
        v-model:pageCount="totalPage"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
<script setup lang="ts" name="ToolsConfigs">
import {apiInstance} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";

const dataUrl: ApiUrls = apiInstance("devops-continus", "continus/toolsConfigs");
const dataFormat = (row, column, cellValue, index) => {
  //cellValue = commonDataFormat(row, column, cellValue, index);
  return cellValue;
};
/**
 * 初始化数据
 */
const init = () => {
  //commonSelectData("cts_env_info");
};
onMounted(() => {
  init();
});
</script>
