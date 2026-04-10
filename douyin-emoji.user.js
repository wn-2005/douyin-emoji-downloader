// ==UserScript==
// @name         抖音聊天/评论区表情包下载助手
// @namespace    https://github.com/wn-2005/douyin-emoji-downloader  // 建议改为自己的 GitHub 地址
// @version      1.3
// @description  在抖音网页版聊天/视频评论区的图片上添加下载按钮，支持动图格式自动识别保存
// @author       wn-2005
// @match        https://www.douyin.com/*
// @match        https://web.douyin.com/*
// @exclude      https://www.douyin.com/live/*
// @exclude      https://web.douyin.com/live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyin.com
// @license      MIT  // 声明许可证
// @homepageURL  https://github.com/wn-2005/douyin-emoji-downloader  // 项目主页
// @supportURL   https://github.com/wn-2005/douyin-emoji-downloader/issues  // 反馈地址
// @downloadURL  https://raw.githubusercontent.com/wn-2005/douyin-emoji/main/douyin-emoji.user.js
// @updateURL    https://raw.githubusercontent.com/wn-2005/douyin-emoji/main/douyin-emoji.user.js
// @grant        GM_download
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 过滤规则：排除头像、图标等非表情包图片
    const EXCLUDE_KEYWORDS = ['avatar', 'logo', 'icon', 'default', 'loading'];
    const MIN_EMOJI_SIZE = 30;   // 最小尺寸阈值（像素）
    const MAX_EMOJI_SIZE = 300;  // 最大尺寸阈值

    // 添加样式：美化下载按钮
    const style = document.createElement('style');
    style.textContent = `
        .emoji-download-btn {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9999;
            font-family: sans-serif;
            display: none;
            backdrop-filter: blur(4px);
            transition: opacity 0.2s;
        }
        .emoji-download-btn:hover {
            background: #00aaff;
        }
        .image-wrapper {
            position: relative;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

    // 判断是否为表情包
    function isEmojiImage(img) {
        const src = img.src || '';
        for (let kw of EXCLUDE_KEYWORDS) {
            if (src.toLowerCase().includes(kw)) {
                return false;
            }
        }

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (width > 0 && height > 0) {
            if (width < MIN_EMOJI_SIZE || height < MIN_EMOJI_SIZE) return false;
            if (width > MAX_EMOJI_SIZE && height > MAX_EMOJI_SIZE) return false;
        }

        let parent = img.parentElement;
        let depth = 0;
        while (parent && depth < 5) {
            const classNames = parent.className || '';
            if (classNames.toLowerCase().includes('avatar')) return false;
            parent = parent.parentElement;
            depth++;
        }
        return true;
    }

    // 通过 MIME 类型获取扩展名
    function getExtensionFromMime(mime) {
        const map = {
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg'
        };
        return map[mime] || 'png';
    }

    // 下载图片：先获取真实格式，再下载
    function downloadImage(url) {
        // 使用 GM_xmlhttpRequest 获取图片数据，以确定 Content-Type
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onload: function(response) {
                if (response.status === 200) {
                    const blob = response.response;
                    const mime = blob.type;
                    const ext = getExtensionFromMime(mime);
                    const filename = `douyin_emoji_${Date.now()}.${ext}`;

                    // 创建临时 URL 并触发下载
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                } else {
                    console.error('下载失败:', response.status);
                    if (typeof GM_notification === 'function') {
                        GM_notification({ text: '下载失败，请重试', timeout: 2000 });
                    }
                }
            },
            onerror: function(err) {
                console.error('请求错误:', err);
                if (typeof GM_notification === 'function') {
                    GM_notification({ text: '网络错误，无法下载', timeout: 2000 });
                }
            }
        });
    }

    // 为单个图片添加下载按钮
    function addDownloadButton(img) {
        if (img.hasAttribute('data-emoji-btn')) return;
        if (!img.parentElement) return;

        let container = img.parentElement;
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.classList.add('image-wrapper');

        const btn = document.createElement('div');
        btn.className = 'emoji-download-btn';
        btn.textContent = '💾 下载';
        btn.onclick = (e) => {
            e.stopPropagation();
            downloadImage(img.src);
        };

        container.addEventListener('mouseenter', () => {
            btn.style.display = 'block';
        });
        container.addEventListener('mouseleave', () => {
            btn.style.display = 'none';
        });

        container.appendChild(btn);
        img.setAttribute('data-emoji-btn', 'true');
    }

    // 扫描并处理页面中所有符合条件的图片
    function scanAndAddButtons() {
        const images = document.querySelectorAll('img:not([data-emoji-btn])');
        images.forEach(img => {
            if (isEmojiImage(img)) {
                addDownloadButton(img);
            }
        });
    }

    // 监听 DOM 变化（动态加载内容）
    const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (let mut of mutations) {
            if (mut.addedNodes.length) {
                shouldScan = true;
                break;
            }
        }
        if (shouldScan) scanAndAddButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 页面加载完成后执行扫描
    window.addEventListener('load', () => {
        setTimeout(scanAndAddButtons, 2000);
    });
    scanAndAddButtons();

    // 显示加载提示
    setTimeout(() => {
        console.log('抖音表情包助手已启动，鼠标悬浮在图片上即可看到下载按钮');
        if (typeof GM_notification === 'function') {
            GM_notification({
                text: '抖音表情包助手已启动，鼠标悬浮在表情包上即可下载',
                timeout: 3000
            });
        }
    }, 3000);
})();
