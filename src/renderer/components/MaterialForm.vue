<template>
  <div class="h-full flex flex-col overflow-hidden p-4">
    <div :class="hasResult ? 'flex gap-4 h-full overflow-hidden' : 'max-w-5xl mx-auto h-full overflow-y-auto'">
      <!-- Left Column - Input Form -->
      <div :class="hasResult ? 'w-96 flex-shrink-0 overflow-y-auto space-y-4 pb-4' : 'w-full space-y-4 pb-4'">
      <!-- Task Objective -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
          <h3 class="font-medium text-gray-800">任务目标</h3>
        </div>
        <div class="p-4">
          <textarea
            v-model="localObjective"
            @input="handleObjectiveChange"
            placeholder="请描述您要生成的材料目标..."
            class="w-full min-h-[80px] max-h-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto"
            style="field-sizing: content"
          ></textarea>
        </div>
      </div>

      <!-- Reference List -->
      <ReferenceList
        title="参考资料"
        :items="localReferences"
        @update="updateReferences"
      />

      <!-- Style Reference List -->
      <ReferenceList
        title="风格参考"
        :items="localStyleReferences"
        @update="updateStyleReferences"
      />

      <!-- Generate Button -->
      <div class="space-y-3">
        <div class="flex items-center justify-center">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="useMockData"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">使用模拟数据（用于测试）</span>
          </label>
        </div>
        <div class="flex justify-center">
          <button
            @click="generateMaterial"
            :disabled="loading || !localObjective.trim()"
            :class="[
              'rounded-lg px-6 py-3 font-medium transition-colors flex items-center gap-2',
              loading || !localObjective.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            ]"
          >
            <component :is="loading ? Loader : Sparkles" :size="20" :class="loading ? 'animate-spin' : ''" />
            <span>{{ loading ? '生成中...' : '生成材料' }}</span>
          </button>
        </div>
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Right Column - Result Display -->
    <ResultDisplay
      v-if="hasResult"
      :results="session.results"
      :current-result="session.result"
      @select-version="selectVersion"
    ></ResultDisplay>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Sparkles, Loader } from 'lucide-vue-next';
import ReferenceList from './ReferenceList.vue';
import ResultDisplay from './ResultDisplay.vue';

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update']);

const localObjective = ref(props.session.objective);
const localReferences = ref([...props.session.references]);
const localStyleReferences = ref([...props.session.styleReferences]);
const useMockData = ref(false);
const loading = ref(false);
const error = ref('');

const hasResult = computed(() => {
  return props.session.result && props.session.result.trim().length > 0;
});

watch(() => props.session, (newSession) => {
  localObjective.value = newSession.objective;
  localReferences.value = [...newSession.references];
  localStyleReferences.value = [...newSession.styleReferences];
}, { deep: true });

function handleObjectiveChange() {
  emit('update', { objective: localObjective.value });
}

function updateReferences(references) {
  localReferences.value = references;
  emit('update', { references });
}

function updateStyleReferences(styleReferences) {
  localStyleReferences.value = styleReferences;
  emit('update', { styleReferences });
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

async function generateMaterial() {
  if (!localObjective.value.trim()) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const api = await waitForElectronAPI();
    
    // Get AI settings from localStorage
    const settingsStr = localStorage.getItem('aiSettings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-4',
    };

    const cleanReferences = localReferences.value.map(item => ({
      id: item.id,
      purpose: item.purpose,
      content: item.content,
    }));

    const cleanStyleReferences = localStyleReferences.value.map(item => ({
      id: item.id,
      purpose: item.purpose,
      content: item.content,
    }));

    const result = await api.generateMaterial({
      settings,
      objective: localObjective.value,
      references: cleanReferences,
      styleReferences: cleanStyleReferences,
      useMockData: useMockData.value,
    });

    if (result.success) {
      const newResult = {
        id: Date.now().toString(),
        content: result.content,
        timestamp: Date.now(),
      };
      
      const results = [...(props.session.results || []), newResult];
      
      emit('update', {
        result: result.content,
        results,
      });
    } else {
      error.value = result.error || '生成失败，请检查设置';
    }
  } catch (err) {
    error.value = '生成失败：' + err.message;
  } finally {
    loading.value = false;
  }
}

function selectVersion(resultId) {
  const result = props.session.results.find(r => r.id === resultId);
  if (result) {
    emit('update', { result: result.content });
  }
}
</script>
