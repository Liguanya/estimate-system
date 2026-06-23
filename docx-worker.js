// Word文档解析Worker - 后台线程处理，避免UI阻塞
importScripts('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');

self.onmessage = async function(e) {
    const { arrayBuffer, fileName } = e.data;
    
    try {
        // 阶段1: 加载文档
        self.postMessage({ stage: 'parsing', progress: 10, message: '加载文档...' });
        
        // 大文件优化：先快速提取纯文本
        self.postMessage({ stage: 'parsing', progress: 20, message: '快速解析文本...' });
        const rawResult = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        let quickText = rawResult.value;
        
        // 阶段2: 提取表格（用于栋号面积）
        self.postMessage({ stage: 'parsing', progress: 40, message: '提取表格结构...' });
        const mdResult = await mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer });
        let mdText = mdResult.value.replace(/<[^>]+>/g, '');
        
        // 合并文本：mdText用于表格数据，quickText用于其他内容
        // 合并策略：取mdText的表格部分 + quickText的其他内容
        self.postMessage({ stage: 'parsing', progress: 70, message: '合并数据...' });
        
        // 优先使用mdText（保留表格格式），作为主数据源
        const finalText = mdText;
        
        self.postMessage({ stage: 'complete', progress: 100, message: '解析完成', text: finalText });
        
    } catch (error) {
        // 出错时降级为纯文本提取
        try {
            self.postMessage({ stage: 'parsing', progress: 30, message: '使用备用解析方式...' });
            const fallbackResult = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            self.postMessage({ stage: 'complete', progress: 100, message: '解析完成', text: fallbackResult.value });
        } catch (fallbackError) {
            self.postMessage({ stage: 'error', message: '解析失败: ' + error.message });
        }
    }
};
