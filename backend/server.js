const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// AI 服务调用接口
app.post('/api/generate', async (req, res) => {
  try {
    const { taskGoal, referenceMaterials, styleReferences, aiConfig } = req.body;

    // 验证必填字段
    if (!taskGoal || !aiConfig || !aiConfig.url || !aiConfig.apiKey || !aiConfig.model) {
      return res.status(400).json({ 
        error: '缺少必填字段：任务目标、AI服务配置（URL、API Key、Model）' 
      });
    }

    // 构建提示词
    let prompt = `任务目标：${taskGoal}\n\n`;

    if (referenceMaterials && referenceMaterials.length > 0) {
      prompt += '参考资料：\n';
      referenceMaterials.forEach((material, index) => {
        prompt += `${index + 1}. ${material.content}\n`;
        if (material.usage) {
          prompt += `   参考用途：${material.usage}\n`;
        }
      });
      prompt += '\n';
    }

    if (styleReferences && styleReferences.length > 0) {
      prompt += '风格参考：\n';
      styleReferences.forEach((style, index) => {
        prompt += `${index + 1}. ${style.content}\n`;
        if (style.usage) {
          prompt += `   参考用途：${style.usage}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += '请根据以上信息，生成符合要求的材料内容。';

    // 调用 AI 服务
    const aiResponse = await axios.post(
      aiConfig.url,
      {
        model: aiConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    // 提取 AI 响应内容
    let result = '';
    if (aiResponse.data && aiResponse.data.choices && aiResponse.data.choices.length > 0) {
      result = aiResponse.data.choices[0].message.content;
    } else {
      result = JSON.stringify(aiResponse.data);
    }

    res.json({ 
      success: true, 
      result: result 
    });

  } catch (error) {
    console.error('AI 服务调用错误:', error.message);
    console.error('错误详情:', error.response?.data || error.message);
    
    let errorMessage = '调用 AI 服务失败';
    if (error.response) {
      errorMessage += `：HTTP ${error.response.status}`;
      // 不暴露详细的 API 错误信息
    } else if (error.request) {
      errorMessage += '：无法连接到 AI 服务';
    } else {
      errorMessage += '：请求配置错误';
    }

    res.status(500).json({ 
      error: errorMessage 
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`后端服务已启动，监听端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT}/api/health 检查服务状态`);
});
