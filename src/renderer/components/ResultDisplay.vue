<template>
  <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
    <!-- Top Action Bar -->
    <div class="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
      <!-- Version Selector -->
      <div class="flex gap-3">
        <!-- Dots Pagination -->
        <div class="flex items-center gap-2">
          <div
            v-for="(result, index) in reversedResults"
            :key="result.id"
            @click="selectVersion(result.id)"
            :title="`版本 ${sortedResults.length - index}`"
            :class="[
              'cursor-pointer transition-all',
              selectedResultId === result.id
                ? 'w-8 h-2 rounded-full bg-blue-600'
                : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
            ]"
          ></div>
        </div>

        <!-- Dropdown Button -->
        <div class="relative">
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

        <!-- Copy Button -->
        <button
          @click="copyToClipboard"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ml-auto',
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

    <!-- Result Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="prose max-w-none">
        <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">{{ displayContent }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronUp, ChevronDown, Copy, Check } from 'lucide-vue-next';

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
const copied = ref(false);

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
</script>
