#!/bin/bash
# GitHub 配置脚本
# 用于配置 GitHub CLI 和自动化

echo "=========================================="
echo "GitHub 自动化配置向导"
echo "=========================================="
echo ""

# 检查是否已安装 gh
if ! command -v gh &> /dev/null; then
    echo "正在安装 GitHub CLI..."
    
    # macOS 安装方式
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install gh
        else
            # 直接下载安装
            curl -L https://github.com/cli/cli/releases/download/v2.68.0/gh_2.68.0_macOS_arm64.zip -o gh.zip
            unzip -q gh.zip
            sudo mv gh_2.68.0_macOS_arm64/bin/gh /usr/local/bin/
            rm -rf gh.zip gh_2.68.0_macOS_arm64
        fi
    fi
    
    echo "✅ GitHub CLI 安装完成"
else
    echo "✅ GitHub CLI 已安装"
fi

echo ""
echo "=========================================="
echo "GitHub 认证"
echo "=========================================="
echo ""
echo "请选择认证方式："
echo "1. 浏览器登录（推荐）"
echo "2. 使用 Personal Access Token"
echo ""
read -p "选择 [1/2]: " auth_method

if [ "$auth_method" = "1" ]; then
    echo "将在浏览器中打开登录页面..."
    gh auth login --web
elif [ "$auth_method" = "2" ]; then
    echo ""
    echo "请在 https://github.com/settings/tokens 创建 Personal Access Token"
    echo "需要的权限：repo, workflow, read:org"
    echo ""
    read -p "请输入你的 Personal Access Token: " token
    echo "$token" | gh auth login --with-token
fi

echo ""
echo "=========================================="
echo "验证登录状态"
echo "=========================================="
gh auth status

echo ""
echo "=========================================="
echo "配置完成！"
echo "=========================================="
echo ""
echo "常用命令："
echo "  gh repo create <name>    # 创建新仓库"
echo "  gh repo list             # 列出你的仓库"
echo "  gh issue list            # 列出 Issues"
echo "  gh workflow list         # 列出 Actions"
echo ""
