# 照片展示网站 — 基础版搭建方案

## Summary

从零搭建一个暗色系、高级感的照片展示网站。React + Vite，PC 端优先，版心 ~1700px。核心功能：导航栏、Hero 轮播、Masonry 照片墙、分类筛选 + 收藏夹。照片通过 Vite 插件直接映射 Resources/ 目录，零复制。字体 Inter，收藏用爱心图标，悬停显示元信息。

## Implementation Changes

### 1. 项目结构与配置

- **vite.config.js** — 添加自定义 configureServer 插件，将 Resources/ 目录映射到 /photos/ 路径（开发环境）；添加 build 配置处理生产环境照片引用
- **scripts/generate-manifest.mjs** — Node 脚本，扫描 Resources/ 生成 src/data/photos.json，包含每张照片的 id、文件名、所属相册（category）、路径、日期（从文件夹名提取）
- **index.html** — 修改 title 为品牌名，添加 Inter 字体 link（Google Fonts CDN）
- **package.json** — 添加 gen-manifest 脚本，dev 改为先生成 manifest 再启动 Vite

### 2. 全局样式 (src/index.css)

- CSS Reset + 暗色系变量：--bg-primary: #0a0a0a、--bg-card: #141414、--bg-hover: #1a1a1a、--text-primary: #e8e8e8、--text-secondary: #888、--accent: #c8a46e（暖金色点缀）
- 版心 .container { max-width: 1700px; margin: 0 auto; padding: 0 40px; }
- 全局过渡 transition 基础设置
- Inter 字体 font-family: 'Inter', -apple-system, sans-serif

### 3. 组件实现

#### Navbar
- 固定顶部，半透明毛玻璃 backdrop-filter: blur(12px) + background: rgba(10,10,10,0.8)
- 左侧品牌名（可自定义，默认 "GALLERY"），右侧导航链接：Home / Collections / Favorites
- 导航项 hover 下划线动效

#### Hero
- 全宽展示区，高度 ~70vh，内含轮播
- 照片从 manifest 中随机选取 5 张作为轮播素材
- 左右箭头切换 + 底部圆点指示器
- 照片上叠加渐变遮罩 + 中央标题文字
- 3s 自动轮播，hover 暂停

#### CategoryFilter
- 水平标签栏：All + 各相册名 + Favorites
- 当前选中标签底部高亮线 + 文字变亮
- 切换时过滤照片墙内容

#### PhotoCard
- 照片容器，border-radius: 6px，overflow: hidden
- 悬停时：照片微微放大 scale(1.03)，底部渐变遮罩淡入，显示标题 / 日期 / 相册名
- 右上角爱心图标，空心到实心切换，点击不冒泡
- 收藏状态通过 Context 管理，持久化到 localStorage

#### PhotoWall
- Masonry 布局：CSS columns 实现（3 列，column-gap: 20px），照片 break-inside: avoid
- 根据 CategoryFilter 选择展示照片
- 懒加载：使用 loading="lazy" + Intersection Observer 控制淡入动效

### 4. 状态管理

- **FavoritesContext** — React Context，提供 favorites (Set)、toggleFavorite(id) 方法
- 初始化从 localStorage 读取，每次变更写回
- 照片数据从 photos.json import，在 Context 外层注入

### 5. App 组装

- App.jsx 顺序渲染：Navbar -> Hero -> CategoryFilter -> PhotoWall
- FavoritesProvider 包裹整个 App
- 页面背景 --bg-primary，各区域之间留 60-80px 间距

## Test Plan

- npm run dev 启动后验证：导航栏固定、Hero 轮播自动播放、照片墙 Masonry 渲染 65 张照片
- 点击分类标签切换过滤结果
- 点击爱心切换收藏，刷新后收藏状态保留
- 鼠标悬停照片卡片显示元信息
- 浏览器窗口缩放至 1700px 以下时版心自适应

## Assumptions

- 品牌名默认 "GALLERY"，后续可改
- 照片元信息（标题/地点）暂从文件名 + 文件夹名推导，无 EXIF 解析
- v1 不做照片详情页 / Lightbox 弹窗，后续迭代加
- 生产构建需将照片复制到 dist/ 或配置 CDN，v1 先聚焦开发预览
- Masonry 用纯 CSS columns，不用 JS 库，列数固定 3 列（1700px 版心足够）
