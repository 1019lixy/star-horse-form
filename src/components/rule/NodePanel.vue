<template>
  <div class="node-panel">
    <div class="panel-header">
      <el-icon><Grid /></el-icon>
      <span>节点库</span>
    </div>
    <el-input v-model="searchKeyword" placeholder="搜索节点..."  class="search-input" clearable>
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <div class="panel-body">
      <el-collapse v-model="activeGroups" class="node-collapse">
        <el-collapse-item
          v-for="cat in filteredCategories"
          :key="cat.name"
          :name="cat.name"
        >
          <template #title>
            <div class="category-title">
              <span class="cat-icon" :style="{ background: cat.color + '20', color: cat.color }">{{ cat.icon }}</span>
              <span class="cat-name">{{ cat.name }}</span>
              <el-tag  type="info" round>{{ cat.nodes.length }}</el-tag>
            </div>
          </template>
          <div class="node-list">
            <div
              v-for="node in cat.nodes"
              :key="node.type"
              class="node-item"
              :draggable="true"
              @dragstart="onDragStart($event, node.type)"
              @click="addToCanvas(node.type)"
            >
              <div class="node-icon" :style="{ background: cat.color + '15', borderColor: cat.color + '40', color: cat.color }">
                {{ node.icon }}
              </div>
              <div class="node-info">
                <div class="node-label">{{ node.label }}</div>
                <div class="node-desc">{{ node.desc }}</div>
              </div>
              <el-icon class="drag-handle"><Plus /></el-icon>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Grid, Search, Plus } from '@element-plus/icons-vue'
import { NODE_CATEGORIES } from './nodeTypes'

const searchKeyword = ref('')
const activeGroups = ref(NODE_CATEGORIES.map(c => c.name))

const filteredCategories = computed(() => {
  if (!searchKeyword.value) return NODE_CATEGORIES
  const kw = searchKeyword.value.toLowerCase()
  return NODE_CATEGORIES.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(kw) || n.desc.toLowerCase().includes(kw) || n.type.includes(kw)
    )
  })).filter(cat => cat.nodes.length > 0)
})

const onDragStart = (e: DragEvent, nodeType: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/vueflow', nodeType)
    e.dataTransfer.effectAllowed = 'move'
  }
}

const emit = defineEmits<{ (e: 'add', nodeType: string): void }>()
const addToCanvas = (nodeType: string) => emit('add', nodeType)
</script>

<style scoped lang="scss">
.node-panel {
  height: 100%; display: flex; flex-direction: column; background: #fff;

  .panel-header {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 14px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600; font-size: 13px; color: #1e293b; flex-shrink: 0;
  }

  .search-input { margin: 8px 10px; width: calc(100% - 20px); flex-shrink: 0; }

  .panel-body { flex: 1; overflow-y: auto; padding: 0 8px 8px; }

  .node-collapse {
    :deep(.el-collapse-item__header) { padding: 0 4px; height: 38px; font-size: 13px; }
    :deep(.el-collapse-item__content) { padding: 4px 0 8px; }
  }

  .category-title {
    display: flex; align-items: center; gap: 6px; width: 100%;
    .cat-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 5px; font-size: 13px;
    }
    .cat-name { flex: 1; font-weight: 600; color: #334155; font-size: 12px; }
  }

  .node-list { display: flex; flex-direction: column; gap: 4px; }

  .node-item {
    display: flex; align-items: center; gap: 8px; padding: 7px 8px;
    border: 1px solid #f1f5f9; border-radius: 6px; cursor: grab;
    transition: all 0.15s; background: #fff;
    &:hover {
      border-color: #c7d2fe; background: #f5f3ff; box-shadow: 0 2px 6px rgba(99,102,241,0.1);
      .drag-handle { opacity: 1; }
    }
    &:active { cursor: grabbing; }

    .node-icon {
      display: flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border-radius: 6px; border: 1px solid; font-size: 15px; flex-shrink: 0;
    }

    .node-info { flex: 1; min-width: 0;
      .node-label { font-size: 12px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .node-desc { font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
    }

    .drag-handle { color: #6366f1; opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
  }
}
</style>
