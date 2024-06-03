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
            prop="idContinusInst"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.idContinusInst'" required>
              <el-input clearable placeholder="请输入主键"
                        v-model="scope.row.idContinusInst"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="名称"
            min-width="200px"
            prop="instanceName"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.instanceName'" required>
              <el-input clearable placeholder="请输入名称"
                        v-model="scope.row.instanceName"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="模板"
            min-width="200px"
            prop="template"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.template'" required>
              <el-input clearable placeholder="请输入模板"
                        v-model="scope.row.template"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="是否独占 1是 2否 默认2"
            min-width="200px"
            prop="isAlone"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.isAlone'" required>
              <el-input clearable placeholder="请输入是否独占 1是 2否 默认2"
                        v-model="scope.row.isAlone"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="关联计划"
            min-width="200px"
            prop="linkDataPlan"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.linkDataPlan'" required>
              <el-input clearable placeholder="请输入关联计划"
                        v-model="scope.row.linkDataPlan"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="Cron定时触发执行"
            min-width="200px"
            prop="cron"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.cron'" required>
              <el-input clearable placeholder="请输入Cron定时触发执行"
                        v-model="scope.row.cron"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="代码下载后存放目录"
            min-width="200px"
            prop="targetDir"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.targetDir'" required>
              <el-input clearable placeholder="请输入代码下载后存放目录"
                        v-model="scope.row.targetDir"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="代码版本号"
            min-width="200px"
            prop="codeVersion"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.codeVersion'" required>
              <el-input clearable placeholder="请输入代码版本号"
                        v-model="scope.row.codeVersion"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="是否自动触发构建 1是 2否 默认2"
            min-width="200px"
            prop="autoBuild"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.autoBuild'" required>
              <el-input clearable placeholder="请输入是否自动触发构建 1是 2否 默认2"
                        v-model="scope.row.autoBuild"></el-input>
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
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
              <el-tooltip content="添加一行">
                <star-horse-icon icon-class="plus" style="vertical-align: middle;color:#409EFF;"/>
              </el-tooltip>
            </el-button>
          </template>
          <template #default="scope">
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini" style="background: var(--star-horse-style);color: var(--star-horse-white)">
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
      <el-form-item label="主键" prop="idContinusInst" v-if="false">
        <el-input clearable placeholder="请输入主键"
                  v-model="ruleForm.idContinusInst"></el-input>
      </el-form-item>

      <el-form-item label="名称" prop="instanceName"
                    required v-if="!false">
        <el-input clearable placeholder="请输入名称"
                  v-model="ruleForm.instanceName"></el-input>
      </el-form-item>

      <el-form-item label="模板" prop="template"
                    required v-if="!false">
        <el-input clearable placeholder="请输入模板"
                  v-model="ruleForm.template"></el-input>
      </el-form-item>

      <el-form-item label="是否独占 1是 2否 默认2" prop="isAlone"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入是否独占 1是 2否 默认2"
                         v-model="ruleForm.isAlone"/>
      </el-form-item>

      <el-form-item label="关联计划" prop="linkDataPlan"
                    required v-if="!false">
        <el-input clearable placeholder="请输入关联计划"
                  v-model="ruleForm.linkDataPlan"></el-input>
      </el-form-item>

      <el-form-item label="Cron定时触发执行" prop="cron"
                    required v-if="!false">
        <el-input clearable placeholder="请输入Cron定时触发执行"
                  v-model="ruleForm.cron"></el-input>
      </el-form-item>

      <el-form-item label="代码下载后存放目录" prop="targetDir"
                    required v-if="!false">
        <el-input clearable placeholder="请输入代码下载后存放目录"
                  v-model="ruleForm.targetDir"></el-input>
      </el-form-item>

      <el-form-item label="代码版本号" prop="codeVersion"
                    required v-if="!false">
        <el-input clearable placeholder="请输入代码版本号"
                  v-model="ruleForm.codeVersion"></el-input>
      </el-form-item>

      <el-form-item label="是否自动触发构建 1是 2否 默认2" prop="autoBuild"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入是否自动触发构建 1是 2否 默认2"
                         v-model="ruleForm.autoBuild"/>
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
                    required v-if="!false">
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
      <el-form-item label="主键" prop="idContinusInst">
        <span>{{ ruleForm.idContinusInst }}</span>
      </el-form-item>
      <el-form-item label="名称" prop="instanceName">
        <span>{{ ruleForm.instanceName }}</span>
      </el-form-item>
      <el-form-item label="模板" prop="template">
        <span>{{ ruleForm.template }}</span>
      </el-form-item>
      <el-form-item label="是否独占 1是 2否 默认2" prop="isAlone">
        <span>{{ ruleForm.isAlone }}</span>
      </el-form-item>
      <el-form-item label="关联计划" prop="linkDataPlan">
        <span>{{ ruleForm.linkDataPlan }}</span>
      </el-form-item>
      <el-form-item label="Cron定时触发执行" prop="cron">
        <span>{{ ruleForm.cron }}</span>
      </el-form-item>
      <el-form-item label="代码下载后存放目录" prop="targetDir">
        <span>{{ ruleForm.targetDir }}</span>
      </el-form-item>
      <el-form-item label="代码版本号" prop="codeVersion">
        <span>{{ ruleForm.codeVersion }}</span>
      </el-form-item>
      <el-form-item label="是否自动触发构建 1是 2否 默认2" prop="autoBuild">
        <span>{{ ruleForm.autoBuild }}</span>
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
    <el-form class="search_area" size="default">
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
        <el-button @click="btnOperation(1)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="add"/>
          <el-tooltip content="新增">新增</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.batchAdd">
        <el-button @click="btnOperation(11)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
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
        <el-button @click="btnOperation(5)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="refresh"/>
          <el-tooltip content="刷新">刷新</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.download">
        <el-button @click="btnOperation(6)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
          <star-horse-icon icon-class="document_download"/>
          <el-tooltip content="下载模板">下载模板</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.execution">
        <el-button @click="btnOperation(7)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
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
        <el-button @click="btnOperation(8)" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
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
        id="continusInstance"
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
          prop="idContinusInst"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="名称"
          min-width="200px"
          prop="instanceName"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="模板"
          min-width="200px"
          prop="template"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="是否独占 1是 2否 默认2"
          min-width="200px"
          prop="isAlone"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="关联计划"
          min-width="200px"
          prop="linkDataPlan"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="Cron定时触发执行"
          min-width="200px"
          prop="cron"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="代码下载后存放目录"
          min-width="200px"
          prop="targetDir"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="代码版本号"
          min-width="200px"
          prop="codeVersion"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="是否自动触发构建 1是 2否 默认2"
          min-width="200px"
          prop="autoBuild"
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
          <el-button @click="editById(scope.row[primaryKey])" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)"
                     v-if="permission.edit">
            <el-tooltip content="编辑">编辑</el-tooltip>
          </el-button>
          <el-button @click="viewById(scope.row[primaryKey])" link title="" style="background: var(--star-horse-style);color: var(--star-horse-white)"
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
<script setup lang="ts" name="ContinusInstanceUi">
import {rowClassName} from "@/api/sh_api.js";
import {ApiUrls} from "@/components/types/ApiUrls";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/devops-continus/continus/continusInstance/pageList",
  mergeUrl: "/devops-continus/continus/continusInstance/merge",
  mergeDraftUrl: "/devops-continus/continus/continusInstance/mergeDraft",
  batchMergeUrl: "/devops-continus/continus/continusInstance/mergeBatch",
  batchMergeDraftUrl: "/devops-continus/continus/continusInstance/mergeBatchDraft",
  loadByIdUrl: "/devops-continus/continus/continusInstance/getById",
  deleteUrl: "/devops-continus/continus/continusInstance/batchDeleteById",
  exportAllUrl: "/devops-continus/continus/continusInstance/exportData",
  downloadTemplateUrl: "/devops-continus/continus/continusInstance/downloadTemplate",
  userConditionUrl: "/devops-continus/continus/continusInstance/getAllByCondition",
  importUrl: "/devops-continus/continus/continusInstance/importData",
  uploadUrl: ""
};

const dataFormat = (row, column, cellValue, index) => {
  cellValue = this.commonDataFormat(row, column, cellValue, index);
  return cellValue;
};
/**
 * 初始化数据
 */
const init = () => {

  // this.commonSelectData("cts_continus_instance");
}
onMounted(() => {
  init();
});

</script>
