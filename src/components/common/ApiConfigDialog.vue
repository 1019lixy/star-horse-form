<script setup lang="ts">
import {ref, watch} from "vue";
import {type ApiConfig, protocolOptions,} from "@/utils/apiConfig";
import {loadDict} from "@/api/star_horse_apis";
import {error, SelectOption, success} from "star-horse-lowcode";

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "API配置",
  },
});

// 定义组件事件
const emit = defineEmits<{
  "update:visible": [value: boolean];
  save: [value: ApiConfig];
}>();

// 响应式数据
const apiConfigForm = defineModel<ApiConfig>("dataForm");
const envOptions = ref<SelectOption[]>([]);
const httpMethodOptions = ref<SelectOption[]>([
  {value: "GET", name: "GET"},
  {value: "POST", name: "POST"},
  {value: "PUT", name: "PUT"},
  {value: "DELETE", name: "DELETE"},
  {value: "PATCH", name: "PATCH"},
]);

// 加载系统环境字典
const loadEnvOptions = async () => {
  try {
    envOptions.value = await loadDict("system_environment");
  } catch (err) {
    error("加载系统环境失败");
    console.error("Failed to load environment options:", err);
  }
};


// 监听visible变化，加载环境选项
watch(
    () => props.visible,
    async (newValue) => {
      if (newValue && envOptions.value.length === 0) {
        await loadEnvOptions();
      }
    },
);

// 保存API配置
const handleSave = () => {
  // 验证API配置
  // 发送更新事件

  emit("update:visible", false);
  success("API配置已保存");
};

// 取消保存
const handleCancel = () => {
  // 恢复原始值
  emit("update:visible", false);
};

// 暴露方法给父组件
defineExpose({
  loadEnvOptions,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="props.visible"
      :title="props.title"
      boxWidth="600px"
      @closeAction="handleCancel"
      @merge="handleSave"
      :selfFunc="true"
  >
    <el-form
        ref="formRef"
        :model="apiConfigForm"
        label-width="120px"
        size="default"
    >
      <el-form-item
          label="系统环境"
          prop="env"
          :rules="[
          { required: true, message: '请选择系统环境', trigger: 'blur' },
        ]"
      >
        <el-select v-model="apiConfigForm.env" placeholder="请选择系统环境">
          <el-option
              v-for="option in envOptions"
              :key="option.value"
              :name="option.name"
              :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
          label="请求方式"
          prop="httpMethod"
          :rules="[
          { required: true, message: '请选择请求方式', trigger: 'blur' },
        ]"
      >
        <el-select
            v-model="apiConfigForm.httpMethod"
            placeholder="请选择请求方式"
        >
          <el-option
              v-for="option in httpMethodOptions"
              :key="option.value"
              :name="option.name"
              :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
          label="协议"
          prop="protocol"
          :rules="[{ required: true, message: '请选择协议', trigger: 'blur' }]"
      >
        <el-select v-model="apiConfigForm.protocol" placeholder="请选择协议">
          <el-option
              v-for="option in protocolOptions"
              :key="option.value"
              :name="option.name"
              :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
          label="IP/域名/服务名"
          prop="host"
          :rules="[
          { required: true, message: '请输入IP/域名/服务名', trigger: 'blur' },
        ]"
      >
        <el-input
            v-model="apiConfigForm.host"
            placeholder="请输入IP地址、域名或服务名"
        />
      </el-form-item>

      <el-form-item label="端口" prop="port">
        <el-input-number
            v-model="apiConfigForm.port"
            :min="1"
            :max="65535"
            placeholder="请输入端口号"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item
          label="接口地址"
          prop="interfaceUrl"
          :rules="[
          { required: true, message: '请输入接口地址', trigger: 'blur' },
        ]"
      >
        <el-input
            v-model="apiConfigForm.interfaceUrl"
            placeholder="请输入接口路径，如：/api/data/list"
        />
      </el-form-item>

      <!-- Add periodic refresh configuration fields -->
      <el-form-item label="启用定时刷新" prop="enableAutoRefresh">
        <el-switch
            v-model="apiConfigForm.enableAutoRefresh"
            active-text="开启"
            inactive-text="关闭"
        />
      </el-form-item>

      <el-form-item
          v-if="apiConfigForm.enableAutoRefresh"
          label="刷新间隔(秒)"
          prop="refreshInterval"
          :rules="[
          { required: true, message: '请输入刷新间隔', trigger: 'blur' },
          {
            type: 'number',
            min: 5,
            max: 3600,
            message: '刷新间隔必须在5-3600秒之间',
            trigger: 'blur',
          },
        ]"
      >
        <el-input-number
            v-model="apiConfigForm.refreshInterval"
            :min="5"
            :max="3600"
            placeholder="请输入刷新间隔(秒)"
            style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
