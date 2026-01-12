<template>
  <div id="app">
    <div class="header-container">
      <h1>材料写作辅助器</h1>
      <button @click="showSettings = true" class="settings-btn">⚙️ 设置</button>
    </div>

    <!-- AI 设置模态框 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>AI 服务配置</h2>
          <button @click="showSettings = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
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
          <div class="modal-actions">
            <button 
              @click="testConnection" 
              class="test-btn"
              :disabled="isTesting || !aiConfig.url || !aiConfig.apiKey || !aiConfig.model"
            >
              {{ isTesting ? '测试中...' : '测试连接' }}
            </button>
            <span v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
              {{ testResult.message }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-container" :class="{ 'two-column': result && !error }">
      <!-- 左栏：输入区域 -->
      <div class="left-column">
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

        <!-- 错误信息显示在左栏 -->
        <section v-if="error" class="section error-section">
          <h2>错误信息</h2>
          <div class="result-content error">
            <pre>{{ error }}</pre>
          </div>
        </section>
      </div>

      <!-- 右栏：生成结果 -->
      <div v-if="result && !error" class="right-column">
        <section class="section result-section">
          <div class="result-header">
            <h2>生成结果</h2>
            <button @click="copyResult" class="copy-btn">📋 复制结果</button>
          </div>
          <div class="result-content">
            <pre>{{ result }}</pre>
          </div>
        </section>
      </div>
    </div>
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
    const showSettings = ref(false)
    const isTesting = ref(false)
    const testResult = ref(null)
    
    const sections = reactive({
      taskGoal: true,
      referenceMaterials: true,
      styleReferences: true
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

    const testConnection = async () => {
      if (!aiConfig.url || !aiConfig.apiKey || !aiConfig.model) {
        testResult.value = { success: false, message: '请填写完整的配置信息' }
        return
      }

      isTesting.value = true
      testResult.value = null

      try {
        const response = await axios.post('http://localhost:3000/api/test', {
          aiConfig: aiConfig
        })

        if (response.data.success) {
          testResult.value = { success: true, message: '✓ 连接成功' }
        } else {
          testResult.value = { success: false, message: '✗ 连接失败' }
        }
      } catch (err) {
        console.error('测试连接错误:', err)
        testResult.value = { 
          success: false, 
          message: `✗ ${err.response?.data?.error || '连接失败'}` 
        }
      } finally {
        isTesting.value = false
        setTimeout(() => {
          testResult.value = null
        }, 5000)
      }
    }

    const generateContent = async () => {
      if (!taskGoal.value.trim()) {
        alert('请输入任务目标')
        return
      }

      if (!aiConfig.url || !aiConfig.apiKey || !aiConfig.model) {
        alert('请先在设置中配置 AI 服务信息')
        showSettings.value = true
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
      showSettings,
      isTesting,
      testResult,
      sections,
      toggleSection,
      addReferenceMaterial,
      addStyleReference,
      removeItem,
      testConnection,
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  font-size: 2em;
  margin: 0;
}

.settings-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.settings-btn:hover {
  background: #5a6268;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2em;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.test-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.test-btn:hover:not(:disabled) {
  background: #138496;
}

.test-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.test-result {
  font-size: 14px;
  font-weight: 500;
}

.test-result.success {
  color: #28a745;
}

.test-result.error {
  color: #dc3545;
}

/* Two-column layout */
.main-container {
  display: flex;
  gap: 20px;
}

.main-container.two-column .left-column {
  flex: 1;
  max-width: 50%;
}

.main-container.two-column .right-column {
  flex: 1;
  max-width: 50%;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.left-column {
  flex: 1;
}

.right-column {
  flex: 1;
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

.error-section h2 {
  padding: 15px 20px;
  background: #f8d7da;
  margin: 0;
  font-size: 1.2em;
  color: #721c24;
}

.result-section {
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.result-header h2 {
  margin: 0;
  font-size: 1.2em;
  color: #495057;
}

.result-content {
  flex: 1;
  padding: 20px;
  background: white;
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
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover {
  background: #138496;
}
</style>
