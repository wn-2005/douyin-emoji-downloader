# douyin-emoji-downloader
可下载评论区表情包和聊天界面表情包
# 抖音表情包下载助手

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用户脚本（UserScript），为抖音网页版的聊天界面和视频评论区中的表情包图片添加一键下载按钮，**自动识别动图格式（GIF/WEBP）并以正确后缀保存**。

## ✨ 功能特点

- 🔍 智能识别表情包：通过尺寸和关键词过滤，精准识别聊天和评论区中的表情图，避免误加按钮到头像、图标上。
- 💾 自动识别格式：通过后台请求图片的真实 `Content-Type`，确保 GIF 保存为 `.gif`，WEBP 保存为 `.webp`，拒绝“假动图”。
- 🖱️ 悬浮下载按钮：鼠标悬停在图片上时，右下角出现“💾 下载”按钮，点击即可保存。
- 🔄 动态监听页面：支持抖音的单页应用特性，新加载的消息或评论中的图片会自动处理。

## 📦 安装方法

1. **安装用户脚本管理器**  
   推荐使用 [Tampermonkey](https://www.tampermonkey.net/)（Chrome / Edge / Firefox）或 [Violentmonkey](https://violentmonkey.github.io/)。

2. **安装本脚本**  
   - **方式一（推荐）**：从 [GreasyFork](https://greasyfork.org/zh-CN) 安装（发布后更新链接）  
   - **方式二（直接安装）**：点击下方链接自动弹出安装界面  
     [![安装脚本](https://img.shields.io/badge/点击安装-脚本-green)](https://raw.githubusercontent.com/wn-2005/douyin-emoji-downloader
/main/douyin-emoji.user.js)

3. **刷新抖音页面**  
   安装成功后，打开抖音网页版（`www.douyin.com` 或 `web.douyin.com`），进入聊天页或任意视频评论区，即可生效。

## 🚀 使用说明

- 将鼠标移动到聊天消息或评论区中的表情包图片上，图片右下角会出现一个半透明的 **💾 下载** 按钮。
- 点击按钮，脚本会自动获取图片真实格式并下载到本地，文件名格式为 `douyin_emoji_时间戳.gif`（或 `.png` / `.webp`）。

## 🛠️ 技术细节

- **过滤机制**：
  - 排除 URL 中包含 `avatar`、`logo`、`icon` 等关键词的图片。
  - 图片自然尺寸需在 30px ~ 300px 之间（可调整）。
  - 向上检查父元素类名，避免误判头像区域。
- **下载原理**：使用 `GM_xmlhttpRequest` 以 `blob` 格式获取图片，读取 `Content-Type` 确定扩展名，再通过 Blob URL 触发下载。

## 🔧 开发与贡献

欢迎提交 Issue 或 Pull Request 来改进此脚本。

```bash
# 克隆仓库
git clone https://github.com/wn-2005/douyin-emoji-downloader.git
