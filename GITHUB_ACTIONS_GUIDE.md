# GitHub Actions 自动化使用指南

本项目已配置 GitHub Actions 自动抓取 FaceTravelChina 产品信息并生成 Reddit 推广帖子。

## 🚀 自动触发方式

### 1. 定时自动运行

- **频率**: 每周一早上 9:00 UTC（北京时间 17:00）
- **默认行为**: 抓取产品 1-10
- **结果**: 自动提交到仓库的 `products_batch.json` 和 `reddit-doc/` 目录

### 2. 手动触发

#### 批量抓取
1. 进入仓库 **Actions** 标签
2. 选择 **Scrape Products & Generate Reddit Posts**
3. 点击 **Run workflow**
4. 配置参数：
   - **Mode**: `batch`
   - **Start ID**: 起始产品 ID（如 11）
   - **Count**: 抓取数量（如 10）
5. 点击 **Run workflow**

#### 单个产品抓取
1. 进入 **Actions** → **Scrape Products & Generate Reddit Posts**
2. 点击 **Run workflow**
3. 配置参数：
   - **Mode**: `single`
   - **Product ID**: 要抓取的产品 ID（如 55）
4. 点击 **Run workflow**

## 📊 查看结果

### 抓取完成后，会自动生成：

| 文件 | 说明 |
|------|------|
| `products_batch.json` | 抓取的产品原始数据 |
| `reddit-doc/product_XX_info.md` | 产品详细信息 |
| `reddit-doc/product_XX_reddit_post.md` | Reddit 推广帖子 |
| `reddit-doc/products_batch_summary.md` | 批量汇总表格 |

### 查看方式：

1. **GitHub 仓库页面** → 查看最新提交
2. **Actions 页面** → 点击运行记录 → **Artifacts** 下载数据
3. ** reddit-doc 目录** → 直接查看生成的 Markdown 文件

## ⚙️ 配置说明

### 修改定时任务

编辑 `.github/workflows/scrape-and-generate.yml`：

```yaml
schedule:
  - cron: '0 9 * * 1'  # 每周一早上9点 UTC
```

Cron 格式：
- `0 9 * * 1` = 每周一 9:00
- `0 9 * * *` = 每天 9:00
- `0 */6 * * *` = 每6小时

### 修改默认抓取范围

在 workflow 文件中修改：

```yaml
node scraper_batch.js ${{ github.event.inputs.start_id || '1' }} ${{ github.event.inputs.count || '10' }}
```

把 `'1'` 和 `'10'` 改成你想要的默认值。

## 🔧 故障排除

### Actions 运行失败

1. 检查 **Actions** → 失败的工作流 → 查看日志
2. 常见问题：
   - Playwright 安装失败 → 检查网络连接
   - 抓取超时 → 网站可能无法访问
   - 提交失败 → 检查 `GITHUB_TOKEN` 权限

### 本地测试

在推送前本地测试脚本：

```bash
# 单个产品
node scraper_playwright.js 55

# 批量抓取
node scraper_batch.js 1 10
```

## 📈 扩展功能

### 自动发布到 Reddit

如需自动发布（不推荐，容易被封号），需要：

1. 在 GitHub Settings → Secrets 添加：
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USERNAME`
   - `REDDIT_PASSWORD`

2. 取消 workflow 文件中的注释：
   ```yaml
   - name: Post to Reddit
     env:
       REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
       ...
   ```

### 部署到 GitHub Pages

如需在线展示结果，取消 workflow 末尾的 `deploy` job 注释。

## 📝 最佳实践

1. **不要频繁抓取** — 建议每周1-2次，避免给网站造成压力
2. **手动检查质量** — 自动生成的 Reddit 帖子建议人工审核后再发布
3. **分批抓取** — 每次抓取10-20个产品，不要一次抓太多
4. **保存历史数据** — 每次抓取会覆盖 `products_batch.json`，重要数据请备份

---

## 🔗 相关链接

- **Actions 页面**: https://github.com/shl3807/facetravel-reddit-bot/actions
- **reddit-doc 目录**: https://github.com/shl3807/facetravel-reddit-bot/tree/main/reddit-doc
- **产品数据**: https://github.com/shl3807/facetravel-reddit-bot/blob/main/products_batch.json

---

*Last updated: 2026-02-24*
