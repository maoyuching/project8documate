<template>
  <div id="app">
    <h1>材料写作辅助器</h1>
    
    <!-- 任务目标 -->
    <section class="section">
      <div class="section-header" @click="toggleSection('taskGoal')">
        <h2>任务目标 {{ sections.taskGoal ? '▼' : '▶' }}</h2>
      </div>
      <div v-show="sections.taskGoal" class="section-content">
        <textarea 
          v-model="taskGoal" 
          placeholder="请输入任务目标..."
          rows="4"
        ></textarea>
      </div>
    </section>

    <!-- 参考资料 -->
    <section class="section">
      <div class="section-header" @click="toggleSection('referenceMaterials')">
        <h2>参考资料 {{ sections.referenceMaterials ? '▼' : '▶' }}</h2>
      </div>
      <div v-show="sections.referenceMaterials" class="section-content">
        <div 
          v-for="(material, index) in referenceMaterials" 
          :key="'material-' + index"
          class="list-item"
        >
          <div class="item-number">{{ index + 1 }}.</div>
          <div class="item-content">
            <textarea 
              v-model="material.content" 
              placeholder="文字材料内容..."
              rows="3"
            ></textarea>
            <input 
              v-model="material.usage" 
              type="text" 
              placeholder="该材料作为何种参考提示..."
              class="usage-input"
            />
            <button @click="removeItem(referenceMaterials, index)" class="remove-btn">删除</button>
          </div>
        </div>
        <button @click="addReferenceMaterial" class="add-btn">+ 添加参考资料</button>
      </div>
    </section>

    <!-- 风格参考 -->
    <section class="section">
      <div class="section-header" @click="toggleSection('styleReferences')">
        <h2>风格参考 {{ sections.styleReferences ? '▼' : '▶' }}</h2>
      </div>
      <div v-show="sections.styleReferences" class="section-content">
        <div 
          v-for="(style, index) in styleReferences" 
          :key="'style-' + index"
          class="list-item"
        >
          <div class="item-number">{{ index + 1 }}.</div>
          <div class="item-content">
            <textarea 
              v-model="style.content" 
              placeholder="风格参考内容..."
              rows="3"
            ></textarea>
            <input 
              v-model="style.usage" 
              type="text" 
              placeholder="该风格参考作为何种参考提示..."
              class="usage-input"
            />
            <button @click="removeItem(styleReferences, index)" class="remove-btn">删除</button>
          </div>
        </div>
        <button @click="addStyleReference" class="add-btn">+ 添加风格参考</button>
      </div>
    </section>

    <!-- AI 服务配置 -->
    <section class="section">
      <div class="section-header" @click="toggleSection('aiConfig')">
        <h2>AI 服务配置 {{ sections.aiConfig ? '▼' : '▶' }}</h2>
      </div>
      <div v-show="sections.aiConfig" class="section-content">
        <div class="form-group">
          <label>API URL:</label>
          <input 
            v-model="aiConfig.url" 
            type="text" 
            placeholder="例如：https://api.openai.com/v1/chat/completions"
          />
        </div>
        <div class="form-group">
          <label>API Key:</label>
          <input 
            v-model="aiConfig.apiKey" 
            type="password" 
            placeholder="请输入 API Key"
          />
        </div>
        <div class="form-group">
          <label>Model:</label>
          <input 
            v-model="aiConfig.model" 
            type="text" 
            placeholder="例如：gpt-3.5-turbo"
          />
        </div>
      </div>
    </section>

    <!-- 生成按钮 -->
    <div class="action-section">
      <button 
        @click="generateContent" 
        class="generate-btn"
        :disabled="isGenerating"
      >
        {{ isGenerating ? '生成中...' : '生成内容' }}
      </button>
    </div>

    <!-- 结果展示 -->
    <section v-if="result || error" class="section result-section">
      <h2>{{ error ? '错误信息' : '生成结果' }}</h2>
      <div class="result-content" :class="{ 'error': error }">
        <pre>{{ error || result }}</pre>
      </div>
      <button @click="copyResult" class="copy-btn" v-if="result && !error">复制结果</button>
    </section>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'

export default {
  name: 'App',
  setup() {
    const taskGoal = ref('')
    const referenceMaterials = ref([])
    const styleReferences = ref([])
    const aiConfig = reactive({
      url: '',
      apiKey: '',
      model: ''
    })
    const result = ref('')
    const error = ref('')
    const isGenerating = ref(false)
    
    const sections = reactive({
      taskGoal: true,
      referenceMaterials: true,
      styleReferences: true,
      aiConfig: true
    })

    const toggleSection = (section) => {
      sections[section] = !sections[section]
    }

    const addReferenceMaterial = () => {
      referenceMaterials.value.push({ content: '', usage: '' })
    }

    const addStyleReference = () => {
      styleReferences.value.push({ content: '', usage: '' })
    }

    const removeItem = (list, index) => {
      list.splice(index, 1)
    }

    const generateContent = async () => {
      if (!taskGoal.value.trim()) {
        alert('请输入任务目标')
        return
      }

      if (!aiConfig.url || !aiConfig.apiKey || !aiConfig.model) {
        alert('请完整填写 AI 服务配置信息')
        return
      }

      isGenerating.value = true
      error.value = ''
      result.value = ''

      try {
        const response = await axios.post('http://localhost:3000/api/generate', {
          taskGoal: taskGoal.value,
          referenceMaterials: referenceMaterials.value.filter(m => m.content.trim()),
          styleReferences: styleReferences.value.filter(s => s.content.trim()),
          aiConfig: aiConfig
        })

        if (response.data.success) {
          result.value = response.data.result
        } else {
          error.value = response.data.error || '生成失败'
        }
      } catch (err) {
        console.error('生成错误:', err)
        error.value = err.response?.data?.error || err.message || '生成失败，请检查服务是否正常运行'
      } finally {
        isGenerating.value = false
      }
    }

    const copyResult = () => {
      navigator.clipboard.writeText(result.value).then(() => {
        alert('结果已复制到剪贴板')
      }).catch(err => {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
      })
    }

    return {
      taskGoal,
      referenceMaterials,
      styleReferences,
      aiConfig,
      result,
      error,
      isGenerating,
      sections,
      toggleSection,
      addReferenceMaterial,
      addStyleReference,
      removeItem,
      generateContent,
      copyResult
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
}

.section {
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 15px 20px;
  background: #f8f9fa;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e9ecef;
}

.section-header:hover {
  background: #e9ecef;
}

.section-header h2 {
  font-size: 1.2em;
  color: #495057;
  margin: 0;
}

.section-content {
  padding: 20px;
}

textarea, input[type="text"], input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 10px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

textarea:focus, input:focus {
  outline: none;
  border-color: #4CAF50;
}

.list-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.list-item:last-child {
  border-bottom: none;
}

.item-number {
  font-weight: bold;
  color: #666;
  margin-right: 10px;
  padding-top: 10px;
  min-width: 30px;
}

.item-content {
  flex: 1;
}

.usage-input {
  margin-top: 5px;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 5px;
}

.remove-btn:hover {
  background: #c82333;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.add-btn:hover {
  background: #218838;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.action-section {
  text-align: center;
  margin: 30px 0;
}

.generate-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.generate-btn:hover:not(:disabled) {
  background: #0056b3;
}

.generate-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.result-section {
  margin-top: 30px;
}

.result-section h2 {
  padding: 15px 20px;
  background: #f8f9fa;
  margin: 0;
  font-size: 1.2em;
  color: #495057;
}

.result-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
  max-height: 500px;
  overflow-y: auto;
}

.result-content.error {
  background: #f8d7da;
  color: #721c24;
}

.result-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
}

.copy-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 15px 20px;
}

.copy-btn:hover {
  background: #138496;
}
</style>
