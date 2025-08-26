<script setup lang="ts">
import { dynamicFormContextMenuData } from "@/plugins/AblesPlugin.ts";
import { dynamicFormHelpMessage, formActions } from "@/views/dyform/utils/DynamicForm.ts";

const emit = defineEmits<{
  (e: "action", action: string): void;
  (e: "styleChange", style: any): void;
  (e: "cacheRestore", event: MouseEvent): void;
  (e: "contextMenu", event: MouseEvent): void;
}>();

const props = defineProps<{
  list: any[];
  permissions: any;
  currentPageStyle: any;
  cacheData: any;
}>();

const actions = (action: string) => {
  emit("action", action);
};

const actionsStyle = (item: any) => {
  emit("styleChange", item);
};

const cacheDataRestore = (evt: MouseEvent) => {
  emit("cacheRestore", evt);
};

const contextMenu = (evt: MouseEvent) => {
  emit("contextMenu", evt);
};
</script>

<template>
  <div class="inner_button">
    <el-menu
      mode="horizontal"
      :ellipsis="false"
      style="height: inherit; width: 100%"
    >
      <template v-for="(item, index) in formActions">
        <el-menu-item
          v-if="
            (list.length > 0 || item.defaultEdit) &&
            (item.auth == 'none' || permissions[item.auth]) &&
            !item.children
          "
          :index="'1_' + index"
          @click="actions(item.key)"
        >
          <el-tooltip
            class="item"
            :content="item.label"
            effect="dark"
            placement="bottom"
          >
            <star-horse-icon
              :icon-class="item.icon"
              size="24px"
              style="color: var(--star-horse-style)"
            />
          </el-tooltip>
        </el-menu-item>
        <template v-if="item.children && item.children.length > 0">
          <el-sub-menu :index="'1_' + index">
            <template #title>
              <el-tooltip
                class="item"
                :content="currentPageStyle.label"
                effect="dark"
                placement="bottom"
              >
                <star-horse-icon
                  :icon-class="item.icon"
                  size="24px"
                  style="color: var(--star-horse-style)"
                />
              </el-tooltip>
            </template>
            <el-menu-item
              v-for="(sitem, sindex) in item.children"
              :index="'2_' + sindex"
              @click="actionsStyle(sitem)"
            >
              <star-horse-icon
                :icon-class="sitem.icon"
                size="24px"
                style="color: var(--star-horse-style)"
              />
              {{ sitem.label }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </template>
    </el-menu>
    <el-tooltip
      content="恢复缓存数据"
      v-if="cacheData?.length > 0"
    >
      <star-horse-icon
        icon-class="reset"
        @click="cacheDataRestore($event)"
      />
    </el-tooltip>
    <help :message="dynamicFormHelpMessage" />
  </div>
</template>

<style lang="scss" scoped>
.inner_button {
  ul {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  li {
    border: none !important;
  }
}
</style>