<script setup lang="ts" name="TemplatePanel">
import {computed, PropType, ref} from "vue";
import {loadData, operationConfirm, StarHorseIcon, ApiUrls} from "star-horse-lowcode";
import {i18n} from "@/lang/index.js";
import {
  SYSTEM_TEMPLATE_CATEGORIES,
  SYSTEM_TEMPLATES,
} from "@/components/system/items/form/composables/systemTemplates";

const props = defineProps({
  /** 模板接口（loadTemplate 使用 api.basePrefix） */
  api: { type: Object as PropType<ApiUrls> },
});
const emits = defineEmits(["loadData", "applySystemTemplate"]);

const templateList = ref<any[]>([]);
const loadTemplateList = () => {
  if (props.api?.basePrefix) {
    loadData(props.api.basePrefix + "/loadTemplate", {}).then(
      async (res: any) => {
        templateList.value = res.data || [];
      },
    );
  }
};
loadTemplateList();

const loadFormData = (formId: any) => {
  emits("loadData", formId);
};

const templateCategory = ref<string>("");
const templateSearch = ref<string>("");
const filteredSystemTemplates = computed(() => {
  let list = SYSTEM_TEMPLATES;
  if (templateCategory.value) {
    list = list.filter((t) => t.category === templateCategory.value);
  }
  if (templateSearch.value) {
    const q = templateSearch.value.toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }
  return list;
});
const applyTemplate = (template: any) => {
  operationConfirm(i18n("dyform.template.apply.confirm"))
    .then(() => {
      emits("applySystemTemplate", template);
    })
    .catch(() => {});
};

const previewRefs = ref<any[]>([]);
const createRef = (el: any) => {
  previewRefs.value.push(el);
};
</script>
<template>
  <div class="template-content">
    <el-scrollbar height="100%">
      <!-- System Templates -->
      <div class="template-section">
        <div class="template-section-title">
          {{ i18n("dyform.template.system") }}
        </div>
        <div class="template-filter-bar">
          <el-select
            v-model="templateCategory"
            size="small"
            clearable
            :placeholder="i18n('dyform.template.allCategory')"
            class="template-category-select"
          >
            <el-option
              v-for="cat in SYSTEM_TEMPLATE_CATEGORIES"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
          <el-input
            v-model="templateSearch"
            size="small"
            clearable
            :placeholder="i18n('dyform.template.search')"
            :prefix-icon="'Search'"
            class="template-search-input"
          />
        </div>
        <div class="template-grid">
          <div
            v-for="tpl in filteredSystemTemplates"
            :key="tpl.id"
            class="template-card"
            @click="applyTemplate(tpl)"
          >
            <div class="template-card-header">
              <span class="template-card-name">{{ tpl.name }}</span>
              <el-tag size="small" type="info" effect="plain">{{
                tpl.category
              }}</el-tag>
            </div>
            <div class="template-card-desc">{{ tpl.description }}</div>
            <div class="template-card-tags">
              <el-tag
                v-for="tag in tpl.tags"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
                >{{ tag }}</el-tag
              >
            </div>
            <div class="template-card-footer">
              <el-button size="small" type="primary" link icon="plus">
                {{ i18n("dyform.template.apply") }}
              </el-button>
            </div>
          </div>
        </div>
        <el-empty
          v-if="filteredSystemTemplates.length === 0"
          :image-size="60"
          :description="i18n('dyform.template.empty')"
        />
      </div>

      <!-- Custom Templates -->
      <div
        class="template-section"
        v-if="templateList && templateList.length > 0"
      >
        <div class="template-section-title">
          {{ i18n("dyform.template.custom") }}
        </div>
        <el-card
          class="temp-card"
          style="margin-bottom: 10px !important"
          v-for="item in templateList"
          :key="item.idDynamicForm"
        >
          <div class="flex w-full flex-1 justify-center items-center">
            <el-popover placement="right" :width="500">
              <template #reference>
                <el-image :src="item.shortImages">
                  <template #error>
                    <star-horse-icon
                      iconClass="empty_image"
                      size="100px"
                    />
                  </template>
                </el-image>
              </template>
              <template #default>
                <form-preview
                  :compSize="'small'"
                  :formDisabled="true"
                  :list="JSON.parse(item['details'].content || '[]')"
                  :ref="createRef"
                  class="flex w-full flex-1 justify-center items-center"
                  v-if="item['details'].content"
                />
              </template>
            </el-popover>
          </div>
          <template #footer>
            <div class="flex items-center">
              <div
                class="w-[60%] overflow-hidden text-ellipsis whitespace-nowrap"
              >
                #{{ item.formName }}
              </div>
              <div class="flex-1 justify-end">
                <el-button
                  size="small"
                  link
                  @click="loadFormData(item.idDynamicForm)"
                  icon="plus"
                  >{{ i18n("dyform.template.load") }}
                </el-button>
              </div>
            </div>
          </template>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>
.template-content {
  height: 100%;
  padding: 8px;
}

.temp-card {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 250px !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.template-section {
  margin-bottom: 16px;
}

.template-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 3px solid #409eff;
}

.template-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.template-category-select {
  width: 120px;
  flex-shrink: 0;
}

.template-search-input {
  flex: 1;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.template-card {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}

.template-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.template-card-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.template-card-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.4;
}

.template-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.template-card-footer {
  display: flex;
  justify-content: flex-end;
}
</style>