# FaceTravelChina Reddit 自动化工具

这个工具用于自动抓取 FaceTravelChina 产品信息并生成 Reddit 推广帖子。

## 🚀 功能

- ✅ 自动抓取产品详情（使用 Playwright + Chrome）
- ✅ 生成 Reddit 格式的推广帖子
- ✅ 支持 GitHub Actions 自动化
- ✅ 支持多个产品批量抓取

## 📦 安装

```bash
# 1. 克隆仓库
git clone https://github.com/shl3807/facetravel-reddit-bot.git
cd facetravel-reddit-bot

# 2. 安装依赖
npm install

# 3. 配置 GitHub（可选）
bash setup_github.sh
```

## 🎯 使用方法

### 方式 1：命令行直接运行

```bash
# 抓取单个产品
node scraper_playwright.js 55

# 抓取多个产品
for id in 55 56 57 58; do
  node scraper_playwright.js $id
done
```

### 方式 2：GitHub Actions 自动化

1. 在 GitHub 仓库页面点击 **Actions**
2. 选择 **Post to Reddit** 工作流
3. 点击 **Run workflow**
4. 输入产品 ID 和目标 Subreddit
5. 点击运行

### 方式 3：浏览器控制台（备用）

如果自动化工具无法运行，可以使用浏览器控制台脚本：

1. 打开产品页面（如 https://www.facetravelchina.com/index/detail?id=55）
2. 按 **F12** 打开开发者工具
3. 切换到 **Console** 标签
4. 复制 `获取产品信息.js` 的内容粘贴进去
5. 回车运行，信息会自动复制到剪贴板

## 📝 Reddit 帖子模板

工具会自动生成以下格式的 Reddit 帖子：

```
标题：I spent [X] hours with a [City] local guide — here's how [he/she] showed me the real city

正文：
- 个人体验故事
- 向导介绍
- 具体行程亮点
- 价格和 logistics
- 推荐理由
- 软性推广 facetravelchina
```

## 🔧 配置 GitHub Actions

### 必需的 Secrets

如果要在 GitHub Actions 中自动发布到 Reddit，需要配置以下 Secrets：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：
   - `REDDIT_CLIENT_ID`: Reddit App 的 Client ID
   - `REDDIT_CLIENT_SECRET`: Reddit App 的 Client Secret
   - `REDDIT_USERNAME`: Reddit 用户名
   - `REDDIT_PASSWORD`: Reddit 密码

### 创建 Reddit App

1. 访问 https://www.reddit.com/prefs/apps
2. 点击 **create another app...**
3. 选择 **script**
4. 填写名称和描述
5. 获取 Client ID 和 Client Secret

## 📂 文件说明

| 文件 | 说明 |
|------|------|
| `scraper_playwright.js` | 产品抓取脚本 |
| `获取产品信息.js` | 浏览器控制台脚本（备用）|
| `.github/workflows/post-to-reddit.yml` | GitHub Actions 配置 |
| `setup_github.sh` | GitHub CLI 配置脚本 |
| `product_info.json` | 抓取的产品信息（自动生成的）|

## 🎯 推荐的 Subreddit

| 社区 | 订阅数 | 适合内容 |
|------|--------|----------|
| r/solotravel | 600k+ | 独自旅行经验 |
| r/China | 200k+ | 中国旅游 |
| r/TravelChina | 较小 | 精准目标用户 |
| r/backpacking | 300k+ | 背包客 |
| r/Shanghai | 城市社区 | 上海相关 |

## ⚠️ 注意事项

1. **Reddit 规则**：不要直接硬广，要包装成个人经验分享
2. **Karma 要求**：大社区需要 50-100+ karma 才能发帖
3. **频率控制**：不要频繁发帖，建议每周 1-2 篇
4. **回复及时**：Reddit 用户对回复速度很敏感

## 📝 待办事项

- [ ] 集成 Reddit API 自动发帖
- [ ] 添加图片自动下载功能
- [ ] 支持批量抓取多个产品
- [ ] 添加帖子效果追踪
- [ ] 支持定时自动发布

## 📧 联系

有问题请联系：contact@facetravelchina.com

---

*Made with ❤️ for FaceTravelChina*
