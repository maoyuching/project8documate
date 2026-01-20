<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="close">
    <div class="bg-white rounded-lg max-w-lg w-full mx-4 shadow-xl">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">AI 服务设置</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <X :size="24" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- API URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API URL
          </label>
          <input
            v-model="localSettings.url"
            type="text"
            placeholder="https://api.openai.com/v1/chat/completions"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-1 text-xs text-gray-500">AI 服务提供商的 API 端点地址</p>
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div class="relative">
            <input
              v-model="localSettings.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="sk-..."
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click="showApiKey = !showApiKey"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              <Eye v-if="!showApiKey" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">您的 API 密钥，将安全存储在本地</p>
        </div>

        <!-- Model -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            模型
          </label>
          <div class="space-y-2">
            <div class="flex gap-2">
              <select
                v-model="localSettings.model"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option v-for="model in availableModels" :key="model" :value="model">
                  {{ model }}
                </option>
              </select>
              <button
                @click="showAddModel = !showAddModel"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                type="button"
              >
                <Plus :size="18" />
              </button>
            </div>
            <div v-if="showAddModel" class="flex gap-2">
              <input
                v-model="newModelName"
                type="text"
                placeholder="输入新模型名称"
                @keyup.enter="addModel"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                @click="addModel"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                type="button"
              >
                >
              </button>
            </div>
            <div v-if="availableModels.length > 1" class="space-y-1">
              <p class="text-xs text-gray-500 mb-1">已添加的模型：</p>
              <div class="space-y-1">
                <div
                  v-for="model in availableModels"
                  :key="model"
                  class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                >
                  <span :class="{ 'font-medium': model === localSettings.model }">{{ model }}</span>
                  <button
                    v-if="availableModels.length > 1 && model !== localSettings.model"
                    @click="removeModel(model)"
                    class="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-500">要使用的 AI 模型名称</p>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-2">提示</h4>
          <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>支持 OpenAI、Claude、国内大模型等兼容 API</li>
            <li>API Key 仅存储在本地浏览器中，不会上传到服务器</li>
            <li>确保 API URL 格式正确并支持 CORS 跨域请求</li>
          </ul>
        </div>

        <!-- Test Connection -->
        <div class="flex items-center justify-between pt-2">
          <button
            @click="testConnection"
            :disabled="testing"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            <component :is="testing ? Loader2 : CheckCircle" :size="16" :class="testing ? 'animate-spin' : ''" />
            <span>测试连接</span>
          </button>
          <div v-if="testResult" class="flex items-center gap-2">
            <component
              :is="testResult.success ? CheckCircle : XCircle"
              :size="16"
              :class="testResult.success ? 'text-green-600' : 'text-red-600'"
            />
            <span :class="testResult.success ? 'text-green-600' : 'text-red-600'" class="text-sm">
              {{ testResult.message }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          @click="close"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          @click="save"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save :size="16" />
          <span>保存</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { X, Save, CheckCircle, XCircle, Loader2, Eye, EyeOff, Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'save']);

const localSettings = reactive({ ...props.settings });
const testing = ref(false);
const testResult = ref(null);
const showApiKey = ref(false);
const showAddModel = ref(false);
const newModelName = ref('');
const availableModels = ref(props.settings.models || [props.settings.model || 'gpt-4']);

watch(() => props.settings, (newSettings) => {
  Object.assign(localSettings, newSettings);
  if (newSettings.models) {
    availableModels.value = newSettings.models;
  }
}, { deep: true });

function close() {
  emit('close');
}

function save() {
  const settingsToSave = { ...localSettings, models: availableModels.value };
  emit('save', settingsToSave);
}

function addModel() {
  const modelName = newModelName.value.trim();
  if (modelName && !availableModels.value.includes(modelName)) {
    availableModels.value.push(modelName);
    localSettings.model = modelName;
    newModelName.value = '';
    showAddModel.value = false;
  }
}

function removeModel(model) {
  const index = availableModels.value.indexOf(model);
  if (index > -1) {
    availableModels.value.splice(index, 1);
    if (localSettings.model === model && availableModels.value.length > 0) {
      localSettings.model = availableModels.value[0];
    }
  }
}

async function testConnection() {
  if (!localSettings.url || !localSettings.apiKey) {
    testResult.value = {
      success: false,
      message: '请填写完整的API设置（URL和API Key）',
    };
    return;
  }

  testing.value = true;
  testResult.value = null;

  try {
    const response = await fetch(localSettings.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: localSettings.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 10,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`连接失败: ${response.status} ${response.statusText}`);
    }
    
    testResult.value = {
      success: true,
      message: '连接成功！',
    };
  } catch (err) {
    testResult.value = {
      success: false,
      message: '测试失败：' + err.message,
    };
  } finally {
    testing.value = false;
  }
}
</script>
