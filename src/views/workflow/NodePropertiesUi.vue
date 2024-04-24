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
            prop="nodePropertyId"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.nodePropertyId'"
                          :rules="rules.nodePropertyId" required>
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
        <el-table-column
            :formatter="dataFormat"
            label="主键"
            min-width="200px"
            prop="defineId"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.defineId'" :rules="rules.defineId"
                          required>
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
        <el-table-column
            :formatter="dataFormat"
            label="关联类型 1 接口 2 表单 3 脚本 4 无关联"
            min-width="200px"
            prop="relationType"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.relationType'" :rules="rules.relationType"
                          required>
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
        <el-table-column
            :formatter="dataFormat"
            label="失败策略 1 失败重试  2失败停止 3 失败继续执行"
            min-width="200px"
            prop="failPolicy"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.failPolicy'" :rules="rules.failPolicy"
                          required>
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
        <el-table-column
            :formatter="dataFormat"
            label="关联编号"
            min-width="200px"
            prop="relationNo"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.relationNo'" :rules="rules.relationNo"
                          required>
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
        <el-table-column
            :formatter="dataFormat"
            label="失败重试次数"
            min-width="200px"
            prop="repeatTimes"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.repeatTimes'" :rules="rules.repeatTimes"
                          required>
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
        <el-table-column
            :formatter="dataFormat"
            label="修改人"
            min-width="200px"
            prop="updatedBy"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.updatedBy'" :rules="rules.updatedBy">
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
        <el-table-column
            :formatter="dataFormat"
            label="修改时间"
            min-width="200px"
            prop="updatedDate"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.updatedDate'" :rules="rules.updatedDate">
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
            <el-form-item :prop="'batchDataList.'+scope.$index+'.createdBy'" :rules="rules.createdBy">
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
        <el-table-column
            :formatter="dataFormat"
            label="创建时间"
            min-width="200px"
            prop="createdDate"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.createdDate'" :rules="rules.createdDate">
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
            <el-form-item :prop="'batchDataList.'+scope.$index+'.dataNo'" :rules="rules.dataNo">
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
        <el-table-column
            :formatter="dataFormat"
            label="是否删除 1 是 0 否"
            min-width="200px"
            prop="isDel"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.isDel'" :rules="rules.isDel">
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
        <el-table-column
            :formatter="dataFormat"
            label="状态名称"
            min-width="200px"
            prop="statusName"
            v-if=" false "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.statusName'" :rules="rules.statusName">
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
        <el-table-column
            :formatter="dataFormat"
            label="状态编码"
            min-width="200px"
            prop="statusCode"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.statusCode'" :rules="rules.statusCode" required>
              <el-input clearable placeholder="请输入状态编码"
                        v-model="scope.row.statusCode"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
            :formatter="dataFormat"
            label="节点Id "
            min-width="200px"
            prop="nodeId"
            v-if="true "
        >
          <template #default="scope">
            <el-form-item :prop="'batchDataList.'+scope.$index+'.nodeId'" :rules="rules.nodeId" required>
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
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini" type="primary">
              <el-tooltip content="添加一行">
                <star-horse-icon icon-class="plus" style="vertical-align: middle;color:#409EFF;"/>
              </el-tooltip>
            </el-button>
          </template>
          <template #default="scope">
            <el-button @click="handleAddDetails(scope.row,1)" link size="mini" type="primary">
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
      <el-form-item label="主键" prop="nodePropertyId" v-if="false">
        <el-input clearable placeholder="请输入主键"
                  v-model="ruleForm.nodePropertyId"></el-input>
      </el-form-item>

      <el-form-item label="主键" prop="defineId"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入主键"
                         v-model="ruleForm.defineId"/>
      </el-form-item>

      <el-form-item label="关联类型 1 接口 2 表单 3 脚本 4 无关联" prop="relationType"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入关联类型 1 接口 2 表单 3 脚本 4 无关联"
                         v-model="ruleForm.relationType"/>
      </el-form-item>

      <el-form-item label="失败策略 1 失败重试  2失败停止 3 失败继续执行" prop="failPolicy"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入失败策略 1 失败重试  2失败停止 3 失败继续执行"
                         v-model="ruleForm.failPolicy"/>
      </el-form-item>

      <el-form-item label="关联编号" prop="relationNo"
                    required v-if="!false">
        <el-input clearable placeholder="请输入关联编号"
                  v-model="ruleForm.relationNo"></el-input>
      </el-form-item>

      <el-form-item label="失败重试次数" prop="repeatTimes"
                    required v-if="!false">
        <el-input-number clearable placeholder="请输入失败重试次数"
                         v-model="ruleForm.repeatTimes"/>
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

      <el-form-item label="是否删除 1 是 0 否" prop="isDel"
                    v-if="!true">
        <el-input-number clearable placeholder="请输入是否删除 1 是 0 否"
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

      <el-form-item label="节点Id " prop="nodeId"
                    required v-if="!false">
        <el-input clearable placeholder="请输入节点Id "
                  v-model="ruleForm.nodeId"></el-input>
      </el-form-item>

    </el-form>
  </star-horse-dialog>
  <star-horse-dialog :is-view="true" :title="'查看数据'" :visible="viewVisible">
    <el-form :model="ruleForm" class="view-ruleForm" label-width="15%" ref="ruleForm">
      <el-form-item label="主键" prop="nodePropertyId">
        <span>{{ ruleForm.nodePropertyId }}</span>
      </el-form-item>
      <el-form-item label="主键" prop="defineId">
        <span>{{ ruleForm.defineId }}</span>
      </el-form-item>
      <el-form-item label="关联类型 1 接口 2 表单 3 脚本 4 无关联" prop="relationType">
        <span>{{ ruleForm.relationType }}</span>
      </el-form-item>
      <el-form-item label="失败策略 1 失败重试  2失败停止 3 失败继续执行" prop="failPolicy">
        <span>{{ ruleForm.failPolicy }}</span>
      </el-form-item>
      <el-form-item label="关联编号" prop="relationNo">
        <span>{{ ruleForm.relationNo }}</span>
      </el-form-item>
      <el-form-item label="失败重试次数" prop="repeatTimes">
        <span>{{ ruleForm.repeatTimes }}</span>
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
      <el-form-item label="是否删除 1 是 0 否" prop="isDel">
        <span>{{ ruleForm.isDel }}</span>
      </el-form-item>
      <el-form-item label="状态名称" prop="statusName">
        <span>{{ ruleForm.statusName }}</span>
      </el-form-item>
      <el-form-item label="状态编码" prop="statusCode">
        <span>{{ ruleForm.statusCode }}</span>
      </el-form-item>
      <el-form-item label="节点Id " prop="nodeId">
        <span>{{ ruleForm.nodeId }}</span>
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
        <el-button @click="dataSearch" link type="primary">
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
        <el-button @click="btnOperation(1)" link title="" type="primary">
          <star-horse-icon icon-class="add"/>
          <el-tooltip content="新增">新增</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.batchAdd">
        <el-button @click="btnOperation(11)" link title="" type="primary">
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
        <el-button @click="btnOperation(5)" link title="" type="primary">
          <star-horse-icon icon-class="refresh"/>
          <el-tooltip content="刷新">刷新</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.download">
        <el-button @click="btnOperation(6)" link title="" type="primary">
          <star-horse-icon icon-class="document_download"/>
          <el-tooltip content="下载模板">下载模板</el-tooltip>
        </el-button>
      </li>
      <li v-if="permission.execution">
        <el-button @click="btnOperation(7)" link title="" type="primary">
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
          <el-button link title="" type="primary">
            <star-horse-icon icon-class="excel-upload"/>
            <el-tooltip content="上传">上传</el-tooltip>
          </el-button>

        </el-upload>
      </li>
      <li v-if="permission.export">
        <el-button @click="btnOperation(8)" link title="" type="primary">
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
        id="nodeProperties"
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
          prop="nodePropertyId"
          v-if=" false ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="主键"
          min-width="200px"
          prop="defineId"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="关联类型 1 接口 2 表单 3 脚本 4 无关联"
          min-width="200px"
          prop="relationType"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="失败策略 1 失败重试  2失败停止 3 失败继续执行"
          min-width="200px"
          prop="failPolicy"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="关联编号"
          min-width="200px"
          prop="relationNo"
          v-if="true ">
      </el-table-column>
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="失败重试次数"
          min-width="200px"
          prop="repeatTimes"
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
          label="是否删除 1 是 0 否"
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
      <el-table-column
          :formatter="dataFormat"
          :show-overflow-tooltip="true"
          label="节点Id "
          min-width="200px"
          prop="nodeId"
          v-if="true ">
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="180px">
        <template #default="scope">
          <el-button @click="editById(scope.row[primaryKey])" link title="" type="primary"
                     v-if="permission.edit">
            <el-tooltip content="编辑">编辑</el-tooltip>
          </el-button>
          <el-button @click="viewById(scope.row[primaryKey])" link title="" type="primary"
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
<script setup lang="ts" name="NodeProperties">

import {ApiUrls} from "@/components/types/ApiUrls";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/flow-engine/workflow/nodeProperties/pageList",
  mergeUrl: "/flow-engine/workflow/nodeProperties/merge",
  mergeDraftUrl: "/flow-engine/workflow/nodeProperties/mergeDraft",
  batchMergeUrl: "/flow-engine/workflow/nodeProperties/mergeBatch",
  batchMergeDraftUrl: "/flow-engine/workflow/nodeProperties/mergeBatchDraft",
  loadByIdUrl: "/flow-engine/workflow/nodeProperties/getById",
  deleteUrl: "/flow-engine/workflow/nodeProperties/batchDeleteById",
  exportAllUrl: "/flow-engine/workflow/nodeProperties/exportData",
  downloadTemplateUrl: "/flow-engine/workflow/nodeProperties/downloadTemplate",
  userConditionUrl: "/flow-engine/workflow/nodeProperties/getAllByCondition",
  importUrl: "/flow-engine/workflow/nodeProperties/importData",
  uploadUrl: ""
};

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