🧭 Personal Nav Page (个人导航主页)
这是一个基于 Next.js 16 构建的现代化个人导航主页。它集成了轻量级的后台管理系统，通过 JSON 文件直接管理数据，无需复杂的数据库配置。项目专为独立部署优化，提供了开箱即用的构建脚本，生成可直接运行的独立包。

✨ 核心功能
⚡️ 极速性能: 基于 Next.js 16 App Router 和 React 19 构建，响应迅速。

🎨 现代化 UI: 使用 Tailwind CSS 和 Framer Motion 实现流畅的交互动画与响应式布局。

🌗 深色模式: 内置明亮/暗黑模式切换支持 (基于 next-themes)。

🔐 安全后台:

内置 /config 管理页面，用于可视化管理导航链接。

基于 Middleware 的路由保护机制，未登录无法访问管理页。

数据存储在本地 JSON 文件中，简单易备份。

📦 独立部署: 自带构建脚本，自动生成包含所有依赖的 dist 运行包，支持 0 配置启动。

🛠 技术栈
框架: Next.js 16

语言: TypeScript

样式: Tailwind CSS

图标: Lucide React & React Icons

动画: Framer Motion

工具: PNPM (推荐) / Node.js

🚀 本地开发
克隆项目

Bash

git clone <your-repo-url>
cd nav-page
安装依赖

Bash

pnpm install
# 或者 npm install
配置环境 复制示例环境变量文件：

Bash

在 .env 中设置你的后台管理密码 (AUTH_SECRET)。

启动开发服务器

Bash

pnpm dev
访问 http://localhost:3300 即可预览。

🏗 构建与部署
本项目包含一个自定义的后处理脚本 scripts/make-dist.js，它会将 Next.js 的 Standalone 产物打包成一个独立的 dist 文件夹，非常适合部署到 VPS 或 Docker 环境。

1. 生成运行包
在项目根目录下运行：

Bash

通过 pnpm build 进行构建

2. 服务器部署
构建完成后，你只需要将生成的 dist 文件夹上传到服务器。

运行步骤：

上传: 将 dist 文件夹复制到服务器任意位置。

启动: 进入目录并运行 server (无需再次安装依赖)。

Bash

cd dist
node server.js
后台运行 (推荐): 使用 PM2 管理进程。

Bash

pm2 start server.js --name "nav-page"
服务启动后，默认运行在 http://<服务器IP>:3300。
如在后续上传图标，需要重启服务

📂 目录结构
Plaintext

├── scripts/
│   └── make-dist.js      # 核心构建脚本：生成独立运行包
├── src/
│   ├── app/
│   │   ├── config/       # 后台管理页面 (受保护)
│   │   ├── login/        # 登录页面
│   │   └── page.tsx      # 前台首页
│   ├── data/
│   │   └── data.json     # 核心数据文件 (网站链接数据)
│   ├── lib/              # 工具函数与常量
│   └── middleware.ts     # 路由拦截与权限校验
├── public/               # 静态资源 (图片/图标)
└── dist/                 # (构建后生成) 最终部署目录
⚙️ 配置说明
端口修改: 默认端口为 3300。如果需要修改，请更改 package.json 中的 dev 和 start 脚本，以及 scripts/make-dist.js 中的端口替换逻辑。