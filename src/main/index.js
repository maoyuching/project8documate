const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  let preloadPath;
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    preloadPath = path.join(__dirname, '../../.vite/build/preload.js');
  } else {
    preloadPath = path.join(__dirname, '../preload/preload.js');
  }
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools in development mode
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for AI API calls
ipcMain.handle('generate-material', async (event, data) => {
  const { settings, objective, references, styleReferences, useMockData } = data;
  
  if (useMockData) {
    // Return mock data for testing
    return {
      success: true,
      content: `这是一份根据您的要求生成的材料：

任务目标：${objective}

一、引言

根据提供的任务目标和参考资料，本材料旨在为您提供一份系统性、专业性的文档。我们充分考虑了您提供的${references.length}份参考资料和${styleReferences.length}份风格参考。

二、主要内容

1. 核心观点
   - 深入分析任务目标的核心要素
   - 结合参考资料中的重要论据
   - 提炼出具有实践价值的结论

2. 详细论述
   本部分将针对任务目标进行深入阐述，确保内容的完整性和连贯性。我们将：
   - 系统梳理相关要点
   - 结合实际案例进行说明
   - 提供可操作的建议和方案

3. 总结与展望
   通过对上述内容的综合分析，我们可以得出以下结论：
   - 任务目标明确且具有可行性
   - 参考资料为实施提供了有力支撑
   - 风格参考确保了文档的专业性

三、结语

本材料充分整合了各方面的信息和要求，力求为您提供一份高质量、实用性强的文档。如有需要进一步完善之处，请随时提出宝贵意见。

生成时间：${new Date().toLocaleString('zh-CN')}
`
    };
  }
  
  try {
    // Construct the prompt
    let prompt = `请根据以下信息生成一份专业的材料：\n\n任务目标：\n${objective}\n`;
    
    if (references && references.length > 0) {
      prompt += `\n参考资料：\n`;
      references.forEach((ref, index) => {
        prompt += `${index + 1}. ${ref.purpose}\n内容：${ref.content}\n\n`;
      });
    }
    
    if (styleReferences && styleReferences.length > 0) {
      prompt += `\n风格参考：\n`;
      styleReferences.forEach((ref, index) => {
        prompt += `${index + 1}. ${ref.purpose}\n内容：${ref.content}\n\n`;
      });
    }
    
    // Make API call
    const response = await fetch(settings.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    
    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

// IPC handler for testing API connection
ipcMain.handle('test-connection', async (event, settings) => {
  try {
    const response = await fetch(settings.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
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
      throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
    }
    
    return {
      success: true,
      message: '连接成功！',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
});
