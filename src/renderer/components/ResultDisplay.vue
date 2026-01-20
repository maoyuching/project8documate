<template>
  <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
    <!-- Top Action Bar -->
    <div class="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
      <!-- Version Selector -->
      <div class="flex gap-3 items-center flex-wrap">
        <!-- Dots Pagination -->
        <div class="flex items-center gap-3">
          <div
            v-for="(result, index) in reversedResults"
            :key="result.id"
            @click="selectVersion(result.id)"
            :title="`版本 ${sortedResults.length - index}`"
            :class="[
              'cursor-pointer transition-all px-1',
              selectedResultId === result.id
                ? 'w-8 h-2 rounded-full bg-blue-600'
                : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
            ]"
          ></div>
        </div>

        <!-- Dropdown Button -->
        <div class="relative" ref="dropdownWrapper">
          <button
            @click="historyDropdownOpen = !historyDropdownOpen"
            class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <component :is="historyDropdownOpen ? ChevronUp : ChevronDown" :size="16" class="text-gray-600" />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="historyDropdownOpen"
            class="absolute left-0 mt-2 w-72 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div
              v-for="(result, index) in sortedResults"
              :key="result.id"
              @click="selectVersion(result.id); historyDropdownOpen = false"
              :class="[
                'px-3 py-3 cursor-pointer flex items-center justify-between transition-colors',
                selectedResultId === result.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
                index === 0 ? 'rounded-t-lg' : '',
                index === sortedResults.length - 1 ? 'rounded-b-lg' : '',
                index > 0 ? 'border-t border-gray-200' : ''
              ]"
            >
              <div class="flex items-center gap-2">
                <span>{{ index === 0 ? '✨' : '📝' }}</span>
                <span class="text-sm font-medium">
                  {{ index === 0 ? '最新生成' : `版本 ${sortedResults.length - index}` }}
                </span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDateTime(result.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 ml-auto">
          <!-- Metadata Button -->
          <button
            v-if="hasMetadata"
            @click="showMetadata = !showMetadata"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border',
              showMetadata
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            ]"
            title="显示生成信息"
          >
            <Info :size="16" />
            <span class="text-sm">信息</span>
          </button>

          <!-- Toggle View Button -->
        <button
          @click="showRawText = !showRawText"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border',
            showRawText
              ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          ]"
          :title="showRawText ? '显示原始文本' : '显示 Markdown'"
        >
          <component :is="showRawText ? EyeOff : Eye" :size="16" />
          <span class="text-sm">{{ showRawText ? 'Markdown' : 'Markdown' }}</span>
        </button>

        <!-- Copy Button -->
        <button
          @click="copyToClipboard"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border',
            copied
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
          ]"
        >
          <component :is="copied ? Check : Copy" :size="16" />
          <span>{{ copied ? '已复制' : '复制' }}</span>
        </button>
        </div>
      </div>
    </div>

    <!-- Metadata Panel -->
    <div v-if="showMetadata && currentMetadata" class="bg-purple-50 border-t border-purple-200 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium text-purple-900">生成信息</h4>
        <button
          @click="showMetadata = false"
          class="text-purple-600 hover:text-purple-800"
        >
          <X :size="18" />
        </button>
      </div>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span class="text-purple-700">服务供应商：</span>
          <span class="text-gray-900 font-medium">{{ currentMetadata.provider }}</span>
        </div>
        <div>
          <span class="text-purple-700">模型：</span>
          <span class="text-gray-900 font-medium">{{ currentMetadata.model }}</span>
        </div>
        <div>
          <span class="text-purple-700">输入 Token：</span>
          <span class="text-gray-900 font-medium">{{ currentMetadata.inputTokens.toLocaleString() }}</span>
        </div>
        <div>
          <span class="text-purple-700">输出 Token：</span>
          <span class="text-gray-900 font-medium">{{ currentMetadata.outputTokens.toLocaleString() }}</span>
        </div>
        <div>
          <span class="text-purple-700">总 Token：</span>
          <span class="text-gray-900 font-medium">{{ currentMetadata.totalTokens.toLocaleString() }}</span>
        </div>
        <div>
          <span class="text-purple-700">消耗时间：</span>
          <span class="text-gray-900 font-medium">{{ formatDuration(currentMetadata.duration) }}</span>
        </div>
      </div>
    </div>

    <!-- Result Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="showRawText" class="prose max-w-none">
        <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">{{ displayContent }}</pre>
      </div>
      <div v-else class="prose prose-sm max-w-none">
        <div class="markdown-body text-gray-800 leading-relaxed" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { ChevronUp, ChevronDown, Copy, Check, Eye, EyeOff, Info, X } from 'lucide-vue-next';
import { marked } from 'marked';

const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
  currentResult: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select-version']);

const selectedResultId = ref('');
const historyDropdownOpen = ref(false);
const dropdownWrapper = ref(null);
const copied = ref(false);
const showRawText = ref(false);
const showMetadata = ref(false);

const sortedResults = computed(() => {
  return [...props.results].sort((a, b) => b.timestamp - a.timestamp);
});

const reversedResults = computed(() => {
  return [...sortedResults.value].reverse();
});

const displayContent = computed(() => {
  if (selectedResultId.value) {
    const result = props.results.find(r => r.id === selectedResultId.value);
    return result?.content || props.currentResult;
  }
  return props.currentResult;
});

const renderedContent = computed(() => {
  try {
    return marked(displayContent.value);
  } catch (err) {
    console.error('Markdown rendering error:', err);
    return displayContent.value;
  }
});

const currentMetadata = computed(() => {
  if (selectedResultId.value) {
    const result = props.results.find(r => r.id === selectedResultId.value);
    return result?.metadata || null;
  }
  return null;
});

const hasMetadata = computed(() => {
  return currentMetadata.value !== null;
});

watch(() => props.results, (newResults) => {
  if (newResults.length > 0) {
    selectedResultId.value = sortedResults.value[0].id;
  }
}, { immediate: true });

function selectVersion(resultId) {
  selectedResultId.value = resultId;
  emit('select-version', resultId);
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(displayContent.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(ms) {
  const seconds = ms / 1000;
  return `${seconds.toFixed(2)}s`;
}

// Outside click handling
function closeOnClickOutside(event) {
  if (!dropdownWrapper.value) return;
  if (dropdownWrapper.value.contains(event.target)) return;
  historyDropdownOpen.value = false;
}

watch(historyDropdownOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', closeOnClickOutside);
  } else {
    document.removeEventListener('mousedown', closeOnClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeOnClickOutside);
});
</script>

<style>
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e5e7eb;
}

.markdown-body h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e5e7eb;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body h4 {
  font-size: 1em;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  font-size: inherit;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body li {
  margin-top: 0.25em;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #6b7280;
  border-left: 0.25em solid #d1d5db;
  margin: 0 0 16px 0;
}

.markdown-body table {
  display: block;
  width: 100%;
  overflow: auto;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #d1d5db;
}

.markdown-body table th {
  font-weight: 600;
  background-color: #f6f8fa;
}

.markdown-body a {
  color: #2563eb;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d1d5db;
  border: 0;
}
</style>

