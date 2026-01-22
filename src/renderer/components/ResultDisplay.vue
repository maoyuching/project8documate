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
    <div class="flex-1 overflow-y-auto p-6" ref="contentWrapper" @contextmenu="handleContextMenu">
      <div v-if="showRawText" class="prose max-w-none h-full">
        <textarea
          v-model="editableContent"
          class="w-full h-full min-h-[200px] whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 border-0 resize-none focus:outline-none focus:ring-0 p-0"
          @input="handleContentEdit"
        ></textarea>
      </div>
      <div v-else class="prose prose-sm max-w-none">
        <div 
          ref="markdownContainer"
          class="markdown-body text-gray-800 leading-relaxed" 
          v-html="renderedContent" 
          @contextmenu.prevent="handleMarkdownContextMenu"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @click="handleSentenceClick"
        ></div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="contextMenu.show"
        :style="{
          position: 'fixed',
          left: contextMenu.x + 'px',
          top: contextMenu.y + 'px',
          zIndex: 100,
        }"
        class="bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[120px]"
        @click.stop
      >
        <button
          @click="handleMenuAction('copy')"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        >
          <Copy :size="16" />
          <span>复制</span>
        </button>
        <button
          @click="handleMenuAction('regenerate')"
          :disabled="isRegenerating"
          :class="[
            'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2',
            isRegenerating ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
          ]"
        >
          <component :is="isRegenerating ? Loader : RefreshCw" :size="16" :class="isRegenerating ? 'animate-spin' : ''" />
          <span>{{ isRegenerating ? '生成中...' : '换一个' }}</span>
        </button>
        <button
          @click="handleMenuAction('delete')"
          class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 :size="16" />
          <span>删除</span>
        </button>
      </div>
    </div>

    <!-- Regenerate Floating Dialog (Draggable) -->
    <div
      v-if="showRegenerateModal"
      ref="regenerateDialog"
      :style="{
        position: 'fixed',
        left: dialogPosition.x + 'px',
        top: dialogPosition.y + 'px',
        zIndex: 200,
      }"
      class="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 flex flex-col"
    >
      <!-- Dialog Header (Draggable Handle) -->
      <div 
        class="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-move select-none bg-gray-50 rounded-t-xl"
        @mousedown="startDrag"
      >
        <div class="flex items-center gap-2">
          <RefreshCw :size="16" class="text-blue-600" />
          <h3 class="text-sm font-semibold text-gray-900">换一个</h3>
        </div>
        <button
          @click="closeRegenerateModal"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-200"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="p-4">
        <!-- Original Text -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-500 mb-1">原文</label>
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 max-h-24 overflow-y-auto">
            {{ initialOriginalText }}
          </div>
        </div>

        <!-- AI Generated Text -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">AI 修改版</label>
          <div v-if="isRegenerating" class="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-center justify-center min-h-[60px]">
            <Loader :size="20" class="text-blue-600 animate-spin mr-2" />
            <span class="text-sm text-blue-700">生成中...</span>
          </div>
          <div v-else class="bg-green-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-green-200 max-h-24 overflow-y-auto">
            {{ regeneratedText || '等待生成...' }}
          </div>
        </div>

        <!-- Toggle Button -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs text-gray-500">在原文中预览</span>
          <button
            @click="toggleShowReplaced"
            :disabled="isRegenerating || !regeneratedText"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              showReplacedVersion && regeneratedText
                ? 'bg-blue-600'
                : 'bg-gray-200',
              (isRegenerating || !regeneratedText) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                showReplacedVersion && regeneratedText ? 'translate-x-6' : 'translate-x-1'
              ]"
            ></span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            @click="regenerateAgain"
            :disabled="isRegenerating"
            :class="[
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1',
              isRegenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            <RefreshCw :size="14" :class="isRegenerating ? 'animate-spin' : ''" />
            <span>重新生成</span>
          </button>
          <button
            @click="applyRegeneratedText"
            :disabled="isRegenerating || !regeneratedText"
            :class="[
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1',
              (isRegenerating || !regeneratedText)
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
          >
            <Check :size="14" />
            <span>确认应用</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { ChevronUp, ChevronDown, Copy, Check, Eye, EyeOff, Info, X, RefreshCw, Trash2, Loader } from 'lucide-vue-next';
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
  session: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['select-version', 'update-content']);

const selectedResultId = ref('');
const historyDropdownOpen = ref(false);
const dropdownWrapper = ref(null);
const copied = ref(false);
const showRawText = ref(false);
const showMetadata = ref(false);
const editableContent = ref('');
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  selectedText: '',
  startIndex: 0,
  endIndex: 0,
});
const contentWrapper = ref(null);
const markdownContainer = ref(null);
const regenerateDialog = ref(null);
const isRegenerating = ref(false);
const showRegenerateModal = ref(false);
const regeneratedText = ref('');
const highlightSpan = ref(null);
const currentHighlightedText = ref('');
const currentHighlightRange = ref(null);
const isRegenerateMode = ref(false);
const showReplacedVersion = ref(false);
const originalSentenceInfo = ref(null);
const initialOriginalText = ref(''); // 对话框中显示的原始文本（始终不变）
const currentDisplayedText = ref(''); // 当前在原文中显示的文本
const dialogPosition = ref({ x: 100, y: 100 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

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

watch(showRawText, (newShowRawText) => {
  if (newShowRawText) {
    editableContent.value = displayContent.value;
    clearHighlight(true);
  }
});

function handleContentEdit() {
  emit('update-content', { content: editableContent.value, resultId: selectedResultId.value });
}

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
  document.removeEventListener('mousedown', closeContextMenuOutside);
  clearHighlight(true);
});

async function handleContextMenu(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    const content = displayContent.value;
    const textIndex = content.indexOf(selectedText);

    contextMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      selectedText,
      startIndex: textIndex,
      endIndex: textIndex + selectedText.length,
    };
  }
}

function handleMarkdownContextMenu(event) {
  handleContextMenu(event);
}

const sentenceDelimiters = /[。！？；：，、…—～「」『』【】《》（）「」『』（）【】（）\n\r.!?;:,—–-\u2026\u2014\u2013\uFF01\uFF1F\u3002\uFF1B\uFF1A\u3001\uFF0C\u30FB\u300C\u300D\u300E\u300F\u3010\u3011\u300A\u300B\uFF08\uFF09\u3008\u3009\uAB\uBB\u2039\u203A\u201C\u201D\u2018\u2019\u00AB\u00BB\u2039\u203A]/;

function getSentenceBoundary(text, position) {
  // 向前查找边界（到标点符号为止）
  let start = position;
  while (start > 0) {
    const char = text[start - 1];
    if (sentenceDelimiters.test(char)) {
      break;
    }
    start--;
  }
  
  // 向后查找边界（到标点符号为止）
  let end = position;
  while (end < text.length) {
    const char = text[end];
    if (sentenceDelimiters.test(char)) {
      break;
    }
    end++;
  }
  
  return { start, end };
}

function getTextNodeAtPoint(x, y) {
  // 使用 document.caretPositionFromPoint 或 document.caretRangeFromPoint 获取位置
  let range;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    }
  }
  return range;
}

function handleMouseMove(event) {
  if (!markdownContainer.value) return;
  
  // 在菜单显示或换一个模式时，不执行标点高亮逻辑
  if (contextMenu.value.show || isRegenerateMode.value) return;
  
  const range = getTextNodeAtPoint(event.clientX, event.clientY);
  if (!range || !range.startContainer || range.startContainer.nodeType !== Node.TEXT_NODE) {
    clearHighlight();
    return;
  }
  
  const textNode = range.startContainer;
  const offset = range.startOffset;
  const text = textNode.textContent || '';
  
  // 跳过空白文本节点
  if (!text.trim()) {
    clearHighlight();
    return;
  }
  
  // 获取句子边界
  const { start, end } = getSentenceBoundary(text, offset);
  const sentence = text.substring(start, end).trim();
  
  // 跳过空句子
  if (!sentence) {
    clearHighlight();
    return;
  }
  
  // 如果高亮的句子相同，不重复处理
  if (currentHighlightedText.value === sentence && highlightSpan.value) {
    return;
  }
  
  // 清除之前的高亮
  clearHighlight();
  
  // 创建新的高亮
  try {
    const highlightRange = document.createRange();
    highlightRange.setStart(textNode, start);
    highlightRange.setEnd(textNode, end);
    
    const span = document.createElement('span');
    span.className = 'sentence-highlight';
    span.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
    span.style.borderRadius = '2px';
    span.style.cursor = 'pointer';
    span.style.transition = 'background-color 0.15s ease';
    
    highlightRange.surroundContents(span);
    
    highlightSpan.value = span;
    currentHighlightedText.value = sentence;
    currentHighlightRange.value = { textNode, start, end };
  } catch (e) {
    // 跨节点的情况下可能会失败，忽略
    console.debug('Highlight failed:', e);
  }
}

function clearHighlight(force = false) {
  // 在菜单显示或换一个模式时，除非强制清除，否则不清除高亮
  if (!force && (contextMenu.value.show || isRegenerateMode.value)) return;
  
  if (highlightSpan.value && highlightSpan.value.parentNode) {
    const parent = highlightSpan.value.parentNode;
    const text = highlightSpan.value.textContent;
    const textNode = document.createTextNode(text);
    parent.replaceChild(textNode, highlightSpan.value);
    parent.normalize(); // 合并相邻的文本节点
  }
  highlightSpan.value = null;
  currentHighlightedText.value = '';
  currentHighlightRange.value = null;
}

// 鼠标离开时的处理（不传 force 参数）
function handleMouseLeave() {
  clearHighlight(false);
}

function handleSentenceClick(event) {
  // 检查是否点击的是高亮的句子
  if (!currentHighlightedText.value) return;
  
  const target = event.target;
  if (target.classList && target.classList.contains('sentence-highlight')) {
    event.preventDefault();
    event.stopPropagation();
    
    const sentence = currentHighlightedText.value;
    const content = displayContent.value;
    const textIndex = content.indexOf(sentence);
    
    contextMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      selectedText: sentence,
      startIndex: textIndex >= 0 ? textIndex : 0,
      endIndex: textIndex >= 0 ? textIndex + sentence.length : sentence.length,
    };
  }
}

function closeContextMenuOutside(event) {
  if (contextMenu.value.show && !event.target.closest('.min-w-\\[120px\\]')) {
    contextMenu.value.show = false;
  }
}

watch(() => contextMenu.value.show, (show) => {
  if (show) {
    document.addEventListener('mousedown', closeContextMenuOutside);
  } else {
    document.removeEventListener('mousedown', closeContextMenuOutside);
  }
});

async function handleMenuAction(action) {
  switch (action) {
    case 'copy':
      contextMenu.value.show = false;
      try {
        await navigator.clipboard.writeText(contextMenu.value.selectedText);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      break;

    case 'delete':
      contextMenu.value.show = false;
      const content = displayContent.value;
      const before = content.substring(0, contextMenu.value.startIndex);
      const after = content.substring(contextMenu.value.endIndex);
      const newContent = before + after;
      emit('update-content', newContent);
      break;

    case 'regenerate':
      // 先设置换一个模式，保持高亮
      isRegenerateMode.value = true;
      contextMenu.value.show = false;
      await regenerateSelectedText();
      break;
  }
}

async function regenerateSelectedText() {
  if (!contextMenu.value.selectedText.trim()) return;

  // 保存原句信息
  originalSentenceInfo.value = {
    text: contextMenu.value.selectedText,
    startIndex: contextMenu.value.startIndex,
    endIndex: contextMenu.value.endIndex,
  };
  
  // 初始化对话框显示的原文（始终不变）
  initialOriginalText.value = contextMenu.value.selectedText;
  
  // 初始化当前显示的文本
  currentDisplayedText.value = contextMenu.value.selectedText;

  // 设置对话框初始位置（在菜单位置附近）
  dialogPosition.value = {
    x: Math.min(contextMenu.value.x, window.innerWidth - 400),
    y: Math.min(contextMenu.value.y, window.innerHeight - 350),
  };

  showRegenerateModal.value = true;
  regeneratedText.value = '';
  showReplacedVersion.value = false;

  await doRegenerate();
}

function applyRegeneratedText() {
  if (!regeneratedText.value.trim() || !originalSentenceInfo.value) return;

  const content = displayContent.value;
  const before = content.substring(0, originalSentenceInfo.value.startIndex);
  const after = content.substring(originalSentenceInfo.value.endIndex);
  const newContent = before + regeneratedText.value + after;

  // 更新原句信息以便后续操作
  const newEndIndex = originalSentenceInfo.value.startIndex + regeneratedText.value.length;
  originalSentenceInfo.value = {
    text: regeneratedText.value,
    startIndex: originalSentenceInfo.value.startIndex,
    endIndex: newEndIndex,
  };
  currentDisplayedText.value = regeneratedText.value;

  emit('update-content', { content: newContent, resultId: selectedResultId.value });
  
  // 不关闭对话框，由用户手动关闭
}

function closeRegenerateModal() {
  // 如果当前显示的是替换文本，需要还原回原文
  if (showReplacedVersion.value && originalSentenceInfo.value && currentDisplayedText.value !== originalSentenceInfo.value.text) {
    showReplacedVersion.value = false;
    updateOriginalHighlight();
  }
  
  // 清除高亮样式
  if (markdownContainer.value) {
    const existingHighlights = markdownContainer.value.querySelectorAll('.regenerate-highlight-original, .regenerate-highlight-replaced');
    existingHighlights.forEach(el => {
      const text = el.textContent;
      const textNode = document.createTextNode(text);
      el.parentNode.replaceChild(textNode, el);
    });
    markdownContainer.value.normalize();
  }
  
  showRegenerateModal.value = false;
  regeneratedText.value = '';
  isRegenerateMode.value = false;
  showReplacedVersion.value = false;
  originalSentenceInfo.value = null;
  initialOriginalText.value = '';
  currentDisplayedText.value = '';
  clearHighlight(true);
}

// 拖拽功能
function startDrag(event) {
  isDragging.value = true;
  dragOffset.value = {
    x: event.clientX - dialogPosition.value.x,
    y: event.clientY - dialogPosition.value.y,
  };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event) {
  if (!isDragging.value) return;
  dialogPosition.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y,
  };
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// 切换显示替换版本
function toggleShowReplaced() {
  if (!regeneratedText.value || isRegenerating.value) return;
  showReplacedVersion.value = !showReplacedVersion.value;
  updateOriginalHighlight();
}

// 更新原文高亮
function updateOriginalHighlight() {
  if (!markdownContainer.value || !originalSentenceInfo.value) return;
  
  // 确定要查找的文本（当前显示的）和要替换成的文本
  const searchText = currentDisplayedText.value || originalSentenceInfo.value.text;
  const replaceText = showReplacedVersion.value ? regeneratedText.value : originalSentenceInfo.value.text;
  const highlightClass = showReplacedVersion.value ? 'regenerate-highlight-replaced' : 'regenerate-highlight-original';
  
  // 清除现有高亮
  const existingHighlights = markdownContainer.value.querySelectorAll('.regenerate-highlight-original, .regenerate-highlight-replaced');
  existingHighlights.forEach(el => {
    const text = el.textContent;
    const textNode = document.createTextNode(text);
    el.parentNode.replaceChild(textNode, el);
  });
  markdownContainer.value.normalize();
  
  // 找到文本位置并高亮
  const walker = document.createTreeWalker(
    markdownContainer.value,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    const index = text.indexOf(searchText);
    
    if (index !== -1) {
      try {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + searchText.length);
        
        const span = document.createElement('span');
        span.className = highlightClass;
        span.textContent = replaceText;
        
        range.deleteContents();
        range.insertNode(span);
        
        // 更新当前显示的文本
        currentDisplayedText.value = replaceText;
        break;
      } catch (e) {
        console.debug('Highlight update failed:', e);
      }
    }
  }
}

// 重新生成
async function regenerateAgain() {
  if (isRegenerating.value) return;
  regeneratedText.value = '';
  showReplacedVersion.value = false;
  updateOriginalHighlight();
  await doRegenerate();
}

// 获取上下文窗口（原文前后内容）
function getContextWindow(content, startIndex, endIndex, windowSize = 300) {
  const beforeStart = Math.max(0, startIndex - windowSize);
  const afterEnd = Math.min(content.length, endIndex + windowSize);
  
  const beforeText = content.substring(beforeStart, startIndex).trim();
  const afterText = content.substring(endIndex, afterEnd).trim();
  
  return { beforeText, afterText };
}

// 构建换一个功能的提示词
function buildRegeneratePrompt(originalText, context) {
  const { beforeText, afterText } = context;
  const references = props.session.references || [];
  const styleReferences = props.session.styleReferences || [];
  
  let prompt = `## 任务目标\n${props.session.objective}\n\n`;
  
  // 添加参考资料
  if (references.length > 0) {
    prompt += `## 参考资料\n`;
    references.forEach((ref, index) => {
      const usage = ref.usage ? `（${ref.usage}）` : '';
      prompt += `### 参考${index + 1}${usage}\n${ref.content}\n\n`;
    });
  }
  
  // 添加风格参考
  if (styleReferences.length > 0) {
    prompt += `## 风格参考\n`;
    styleReferences.forEach((ref, index) => {
      prompt += `### 风格示例${index + 1}\n${ref.content}\n\n`;
    });
  }
  
  // 添加上下文
  prompt += `## 上下文\n`;
  if (beforeText) {
    prompt += `前文：...${beforeText}\n\n`;
  }
  prompt += `【待重写内容】${originalText}\n\n`;
  if (afterText) {
    prompt += `后文：${afterText}...\n\n`;
  }
  
  // 添加指令
  prompt += `## 指令\n请重新生成【待重写内容】部分，要求：\n`;
  prompt += `1. 保持待重写内容的核心意思\n`;
  prompt += `2. 与前后文保持连贯,字数与待重写内相差不超过30%, 前后不要增加额外的标点符号\n`;
  if (styleReferences.length > 0) {
    prompt += `3. 参考风格示例的写作风格\n`;
  }
  prompt += `\n只输出重写后的内容，不要包含任何解释或标记。`;
  
  return prompt;
}

// 执行生成
async function doRegenerate() {
  isRegenerating.value = true;
  
  try {
    const api = await waitForElectronAPI();

    const settingsStr = localStorage.getItem('aiSettings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-4',
    };

    const originalText = originalSentenceInfo.value?.text || contextMenu.value.selectedText;
    const startIndex = originalSentenceInfo.value?.startIndex || contextMenu.value.startIndex;
    const endIndex = originalSentenceInfo.value?.endIndex || contextMenu.value.endIndex;
    
    // 获取上下文窗口
    const context = getContextWindow(displayContent.value, startIndex, endIndex);
    
    // 构建增强的提示词
    const prompt = buildRegeneratePrompt(originalText, context);

    let streamContent = '';

    const unsubscribeChunk = api.onStreamChunk((chunk) => {
      streamContent += chunk;
      regeneratedText.value = streamContent;
    });

    const unsubscribeComplete = api.onStreamComplete((data) => {
      regeneratedText.value = data.content;
      unsubscribeChunk();
      unsubscribeComplete();
      isRegenerating.value = false;
    });

    await api.generateMaterial({
      settings,
      objective: prompt,
      references: [],
      styleReferences: [],
      useMockData: false,
      customPrompt: true,
    });

  } catch (err) {
    console.error('Regeneration failed:', err);
    isRegenerating.value = false;
  }
}

async function waitForElectronAPI(maxWait = 5000) {
  const startTime = Date.now();
  while (!window.electronAPI || !window.electronAPI.generateMaterial) {
    if (Date.now() - startTime > maxWait) {
      throw new Error('等待 electronAPI 超时，请刷新页面重试');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return window.electronAPI;
}
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

.sentence-highlight {
  background-color: rgba(59, 130, 246, 0.15);
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sentence-highlight:hover {
  background-color: rgba(59, 130, 246, 0.25);
}

.regenerate-highlight-original {
  background-color: rgba(251, 191, 36, 0.3);
  border-radius: 2px;
  padding: 1px 2px;
}

.regenerate-highlight-replaced {
  background-color: rgba(34, 197, 94, 0.3);
  border-radius: 2px;
  padding: 1px 2px;
}
</style>

