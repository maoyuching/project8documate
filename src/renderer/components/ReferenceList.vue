<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div
      @click="toggleExpanded"
      class="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 px-4 py-3 border-b border-gray-200 cursor-pointer transition-colors"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <component :is="expanded ? ChevronDown : ChevronRight" :size="20" class="text-gray-600" />
          <span class="font-medium text-gray-800">{{ title }}</span>
          <span class="text-sm text-gray-500">({{ items.length }})</span>
        </div>
        <button
          @click.stop="addItem"
          class="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
        >
          <Plus :size="16" />
          <span>添加</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="expanded" class="p-4 space-y-3">
      <div v-if="items.length === 0" class="text-center text-gray-500 text-sm py-4">
        暂无{{ title }}
      </div>
      
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="bg-gray-50 rounded-lg overflow-hidden"
      >
        <!-- Item Header -->
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center gap-2 flex-1">
            <button
              @click="toggleItem(item.id)"
              class="text-gray-600"
            >
              <component :is="item.expanded ? ChevronDown : ChevronRight" :size="16" />
            </button>
            <div class="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {{ index + 1 }}
            </div>
            <span class="text-sm text-gray-700 truncate">
              {{ item.purpose || '点击展开编辑' }}
            </span>
          </div>
          <button
            @click="removeItem(item.id)"
            class="text-red-600 hover:text-red-700"
          >
            <Trash2 :size="16" />
          </button>
        </div>

        <!-- Item Content (when expanded) -->
        <div v-if="item.expanded" class="px-3 pb-3 space-y-2">
          <input
            v-model="item.purpose"
            @input="updateItems"
            placeholder="例如：作为论据支持、参考文风、引用数据等"
            class="w-full px-3 py-2 bg-white border-0 shadow-sm rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            v-model="item.content"
            @input="updateItems"
            placeholder="请输入内容..."
            class="w-full min-h-[80px] max-h-[200px] px-3 py-2 bg-white border-0 shadow-sm rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            style="field-sizing: content"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update']);

const expanded = ref(true);
const localItems = ref([...props.items]);

watch(() => props.items, (newItems) => {
  localItems.value = [...newItems];
}, { deep: true });

function toggleExpanded() {
  expanded.value = !expanded.value;
}

function toggleItem(id) {
  const item = localItems.value.find(i => i.id === id);
  if (item) {
    item.expanded = !item.expanded;
  }
}

function addItem() {
  const newItem = {
    id: Date.now().toString(),
    content: '',
    purpose: '',
    expanded: true,
  };
  localItems.value.push(newItem);
  expanded.value = true;
  updateItems();
}

function removeItem(id) {
  localItems.value = localItems.value.filter(i => i.id !== id);
  updateItems();
}

function updateItems() {
  emit('update', localItems.value);
}
</script>
