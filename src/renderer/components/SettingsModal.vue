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
          <input
            v-model="localSettings.apiKey"
            type="password"
            placeholder="sk-..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="mt-1 text-xs text-gray-500">您的 API 密钥，将安全存储在本地</p>
        </div>

        <!-- Model -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            模型
          </label>
          <input
            v-model="localSettings.model"
            type="text"
            placeholder="gpt-4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
import { ref, reactive } from 'vue';
import { X, Save, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next';

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

function close() {
  emit('close');
}

function save() {
  emit('save', localSettings);
}

async function testConnection() {
  testing.value = true;
  testResult.value = null;

  try {
    const result = await window.electronAPI.testConnection(localSettings);
    testResult.value = result;
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
