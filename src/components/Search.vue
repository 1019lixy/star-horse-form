<script lang="ts" setup name="Search">
import {nextTick, onMounted, onUnmounted, ref} from "vue";

const searchVisible = ref(false);
const searchValue = ref("");
const searchAreaRef = ref();
const searchResultList = ref<Array<any>>([
  {
    id: 1,
    resultTitle: "搜索结果1",
    resultPath: "搜索结果1的内容"
  }
]);
const searchAction = () => {
  searchVisible.value = true;
  nextTick(() => {
    searchValue.value = ""; // 清空搜索内容
    searchAreaRef.value?.focus();
  });

};
// 添加键盘事件监听
const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchAction();
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>
<template>
  <star-horse-dialog :dialogVisible="searchVisible"
                     title="全局搜索"
                     boxWidth="50%"
                     boxHeight="70%"
                     :source="3"
                     @closeAction="searchVisible = false" :selfFunc="true">
    <el-input v-model="searchValue" ref="searchAreaRef"
              placeholder="请输入内容"
              :autofocus="true"
              size="large">
      <template #prefix>
        <el-icon class="search-icon">
          <search/>
        </el-icon>
      </template>
    </el-input>
    <div class="search-content flex-1">
      <div class="search-content-container flex-1">
        <section class="search-results">
          <div class="search-result-source">搜索结果共{{ searchResultList.length }}条</div>
          <ul class="flex-1 overflow-y-auto">
            <li class="search-result" :aria-selected="item.ariaSelected" v-for="item in searchResultList"
                :key="item.id">
              <a href="#" class="">
                <div class="search-result-container">
                  <div class="search-result-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path d="M3.18 6.6a8.23 8.23 0 1112.93 9.94h0a8.23 8.23 0 01-11.63 0"></path>
                        <path d="M6.44 7.25H2.55V3.36M10.45 6v5.6M10.45 11.6L13 13"></path>
                      </g>
                    </svg>
                  </div>
                  <div class="search-result-content-wrapper">
                    <div class="search-result-title  text-ellipsis whitespace-nowrap">{{ item.resultTitle }}</div>
                    <div class="search-result-path text-ellipsis whitespace-nowrap">{{ item.resultPath }}</div>
                  </div>
                  <div class="search-result-action">
                    <button class="search-result-action-button" title="收藏此结果" type="button">
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M10 14.2L5 17l1-5.6-4-4 5.5-.7 2.5-5 2.5 5 5.6.8-4 4 .9 5.5z" stroke="currentColor"
                              fill="none" fill-rule="evenodd" stroke-linejoin="round"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="search-result-action">
                    <button class="search-result-action-button" type="button">
                      <star-horse-icon iconClass="close" title="从搜索结果中删除"/>
                    </button>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </star-horse-dialog>
  <button type="button" @click.stop="searchAction"
          class="btn-search inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 inset-ring inset-ring-white/2 border mr-3">
    <star-horse-icon iconClass="search" color="#fff" size="16px"/>
    <kbd class="hidden font-sans text-xs/4 text-white dark:text-white-400 [.os-macos_&]:block">⌘K</kbd>
    <kbd class="hidden font-sans text-xs/4 text-white not-[.os-macos_&]:block dark:text-white-400">Ctrl&nbsp;K</kbd>
  </button>
</template>

<style lang="scss" scoped>
.btn-search {
  border: 1px solid #fff;
  cursor: pointer;

  &:hover {
    border: 2px solid #fff;
  }
}


ol, ul, li, menu {
  list-style: none;
}

.search-content {
  flex: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-content-container {
  padding-bottom: calc(.25rem * 6);
  height: 100%;
}

.search-result {
  position: relative;
}

.search-results {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.search-results:first-child .search-result-source {
  padding-top: 1.5rem;
}

.search-result[aria-selected=true] > a {
  background-color: #fbf9fa;
}

.search-result:first-child > a {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
  border-color: #f6f3f4;
}

.search-result > a {
  padding-inline: calc(.25rem * 6);
  padding-block: calc(.25rem * 4);
  display: block;
}

.search-result > a {
  border-bottom: 1px solid #f6f3f4;
  font-size: .875rem;
  position: relative;
}

.search-result-container {
  align-items: center;
  display: flex;
}

.search-result[aria-selected=true] .search-result-icon {
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m12 5 2 5h5l-4 4 2 5-5-3-5 3 2-5-4-4h5l2-5Z' stroke='%230ea5e9' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-size: .85rem;
  border: 1px solid #fff3;
}

.search-result-content-wrapper {
  z-index: 1;
  flex-direction: column-reverse;
  flex: auto;
  min-width: 0;
  display: flex;

  .search-result-title {
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: #333;
    overflow: hidden;
  }

  .search-result-path {
    color: #666;
    align-self: flex-start;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5rem;
  }
}

.search-result-title + .search-result-path {
  margin-bottom: calc(.25rem * 1);
}

.search-result-action {
  margin-left: calc(.25rem * 3.5);
  flex: none;
}

.search-result-Tree, .search-result-icon {
  display: none;
}

.search-result-source {
  color: #101828;
  margin: 0 1.5rem 1rem;
  padding-top: 2.5rem;
  font-weight: 600;
  line-height: 1.5rem;
}

ul {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  font-size: 14px;
  unicode-bidi: isolate;

  li {
    display: list-item;
    text-align: -webkit-match-parent;
    unicode-bidi: isolate;
  }
}
</style>
