<template>
  <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
    <!-- Top Action Bar -->
    <div class="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 flex items-center gap-3">
      <!-- Version Selector -->
      <div class="flex-1 relative">
        <Clock :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          v-model="selectedVersion"
          @change="handleVersionChange"
          class="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option
            v-for="(result, index) in sortedResults"
            :key="result.id"
            :value="result.id"
          >
            {{ index === 0 ? '✨ 最新生成' : `📝 版本 ${sortedResults.length - index}` }} · 
            {{ formatDateTime(result.timestamp) }}
          </option>
        </select>
        <!-- Custom dropdown arrow -->
        <svg
          class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

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

    <!-- Result Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="prose max-w-none">
        <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">{{ displayContent }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Clock, Copy, Check } from 'lucide-vue-next';

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

const selectedVersion = ref('');
const copied = ref(false);

const sortedResults = computed(() => {
  return [...props.results].sort((a, b) => b.timestamp - a.timestamp);
});

const displayContent = computed(() => {
  if (selectedVersion.value) {
    const result = props.results.find(r => r.id === selectedVersion.value);
    return result?.content || props.currentResult;
  }
  return props.currentResult;
});

watch(() => props.results, (newResults) => {
  if (newResults.length > 0 && !selectedVersion.value) {
    selectedVersion.value = sortedResults.value[0].id;
  }
}, { immediate: true });

function handleVersionChange() {
  emit('select-version', selectedVersion.value);
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
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}
</script>
