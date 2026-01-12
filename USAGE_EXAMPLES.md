# 使用示例 (Usage Example)

## 示例 1: 写一份工作总结

### 配置

**任务目标：**
```
写一份2023年第四季度的工作总结，重点突出项目成果和团队协作
```

**参考资料1：**
- 内容：完成了用户管理系统升级，新增了权限管理功能，用户数增长30%
- 参考用途：作为主要项目成果

**参考资料2：**
- 内容：组织了3次团队技术分享会，提升了团队技术水平
- 参考用途：体现团队协作能力

**风格参考1：**
- 内容：本季度，我们团队在技术创新方面取得了显著进展，通过持续优化和改进...
- 参考用途：保持专业、积极的语气

**AI 服务配置：**
- API URL: `https://api.openai.com/v1/chat/completions`
- API Key: `your-api-key`
- Model: `gpt-3.5-turbo`

## 示例 2: 写一份产品介绍

### 配置

**任务目标：**
```
为新产品撰写一份吸引人的产品介绍，突出创新性和用户价值
```

**参考资料1：**
- 内容：产品采用AI技术，可以自动分析用户需求，提供个性化推荐
- 参考用途：核心功能说明

**参考资料2：**
- 内容：已有1000+用户使用，满意度达95%
- 参考用途：市场验证数据

**风格参考1：**
- 内容：革命性的创新，让每一次体验都充满惊喜
- 参考用途：营销风格，富有感染力

**AI 服务配置：**
- API URL: `https://api.openai.com/v1/chat/completions`
- API Key: `your-api-key`
- Model: `gpt-4`

## 支持的 AI 服务

本应用支持任何兼容 OpenAI API 格式的服务，包括：

1. **OpenAI**
   - URL: `https://api.openai.com/v1/chat/completions`
   - Models: gpt-3.5-turbo, gpt-4, gpt-4-turbo

2. **Azure OpenAI**
   - URL: `https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2023-05-15`
   - API Key: Azure 提供的密钥

3. **其他兼容服务**
   - 任何支持 OpenAI Chat Completions API 格式的服务
   - 只需填写对应的 URL、API Key 和 Model 即可

## 常见问题

**Q: 如何获取 API Key？**
- OpenAI: 访问 https://platform.openai.com/api-keys 创建
- Azure: 在 Azure Portal 的 OpenAI 资源中查看

**Q: 生成失败怎么办？**
1. 检查网络连接
2. 验证 API Key 是否正确
3. 确认 API URL 格式正确
4. 查看浏览器控制台获取详细错误信息

**Q: 如何保存生成的内容？**
- 点击"复制结果"按钮，然后粘贴到您需要的地方
- 或者直接从结果区域选择并复制

**Q: 可以使用国内的 AI 服务吗？**
- 可以！只要该服务支持 OpenAI API 格式即可
- 例如：通义千问、文心一言等提供兼容接口的服务
