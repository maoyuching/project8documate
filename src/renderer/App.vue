<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <transition name="sidebar">
      <div v-if="showSidebar" class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- New Session Button -->
        <div class="p-4 border-b border-gray-200">
          <button
            @click="createNewSession"
            class="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus :size="20" />
            <span>新建会话</span>
          </button>
        </div>

        <!-- Session List -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="session in sessions"
            :key="session.id"
            @click="selectSession(session.id)"
            :class="[
              'p-4 cursor-pointer transition-colors relative group',
              currentSessionId === session.id
                ? 'bg-blue-50 border-l-4 border-blue-600'
                : 'hover:bg-gray-50'
            ]"
          >
            <div class="flex items-start gap-3">
              <MessageSquare :size="20" class="text-gray-600 flex-shrink-0 mt-1" />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {{ session.title }}
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ formatTime(session.timestamp) }}
                </div>
              </div>
              <button
                @click.stop="deleteSession(session.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          <div v-if="sessions.length === 0" class="p-4 text-center text-gray-500 text-sm">
            暂无会话
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Navigation -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="showSidebar = !showSidebar" class="text-gray-600 hover:text-gray-900">
            <Menu :size="24" />
          </button>
          <h1 class="text-xl font-semibold text-gray-900">写材料助手</h1>
        </div>
        <button @click="showSettings = true" class="text-gray-600 hover:text-gray-900">
          <Settings :size="24" />
        </button>
      </div>

      <!-- Material Form -->
      <div class="flex-1 overflow-hidden">
        <MaterialForm
          v-if="currentSession"
          :session="currentSession"
          @update="updateCurrentSession"
        />
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettings"
      :settings="aiSettings"
      @close="showSettings = false"
      @save="saveSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, MessageSquare, Trash2, Menu, Settings } from 'lucide-vue-next';
import MaterialForm from './components/MaterialForm.vue';
import SettingsModal from './components/SettingsModal.vue';

const showSidebar = ref(true);
const showSettings = ref(false);
const sessions = ref([]);
const currentSessionId = ref(null);
const aiSettings = ref({
  url: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: 'gpt-4',
});

const currentSession = computed(() => {
  return sessions.value.find(s => s.id === currentSessionId.value);
});

onMounted(() => {
  loadSessions();
  loadSettings();
  if (sessions.value.length === 0) {
    createNewSession();
  }
});

function loadSessions() {
  const saved = localStorage.getItem('sessions');
  if (saved) {
    sessions.value = JSON.parse(saved);
    if (sessions.value.length > 0) {
      currentSessionId.value = sessions.value[0].id;
    }
  }
}

function saveSessions() {
  localStorage.setItem('sessions', JSON.stringify(sessions.value));
}

function loadSettings() {
  const saved = localStorage.getItem('aiSettings');
  if (saved) {
    aiSettings.value = JSON.parse(saved);
  }
}

function saveSettings(settings) {
  aiSettings.value = settings;
  localStorage.setItem('aiSettings', JSON.stringify(settings));
  showSettings.value = false;
}

function createNewSession() {
  const newSession = {
    id: Date.now().toString(),
    title: '新会话',
    timestamp: Date.now(),
    objective: '',
    references: [],
    styleReferences: [],
    result: '',
    results: [],
  };
  sessions.value.unshift(newSession);
  currentSessionId.value = newSession.id;
  saveSessions();
}

function selectSession(id) {
  currentSessionId.value = id;
}

function deleteSession(id) {
  if (confirm('确定要删除这个会话吗？')) {
    sessions.value = sessions.value.filter(s => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || null;
      if (!currentSessionId.value) {
        createNewSession();
      }
    }
    saveSessions();
  }
}

function updateCurrentSession(updates) {
  const index = sessions.value.findIndex(s => s.id === currentSessionId.value);
  if (index !== -1) {
    sessions.value[index] = { ...sessions.value[index], ...updates };
    
    // Update title from objective
    if (updates.objective) {
      sessions.value[index].title = updates.objective.substring(0, 30) || '新会话';
    }
    
    saveSessions();
  }
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}
</script>

<style>
.sidebar-enter-active, .sidebar-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.sidebar-enter-from, .sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.sidebar-enter-to, .sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>

