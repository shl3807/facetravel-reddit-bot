#!/usr/bin/env python3
"""
FaceTravelChina 产品详情爬虫
用于抓取 https://www.facetravelchina.com/index/detail?id=55 等页面内容
"""

import urllib.request
import urllib.error
import ssl
import json
import re
import sys
from typing import Optional, Dict, Any

# 禁用 SSL 验证（某些网站需要）
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

class FaceTravelScraper:
    def __init__(self):
        self.base_url = "https://www.facetravelchina.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Referer': 'https://www.facetravelchina.com/index'
        }
    
    def fetch_page(self, product_id: int) -> Optional[str]:
        """获取产品详情页 HTML"""
        url = f"{self.base_url}/index/detail?id={product_id}"
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, context=ssl_context, timeout=30) as response:
                return response.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error fetching page: {e}")
            return None
    
    def extract_product_info(self, html: str) -> Dict[str, Any]:
        """从 HTML 中提取产品信息"""
        info = {
            'title': '',
            'guide_name': '',
            'city': '',
            'price': '',
            'rating': '',
            'categories': [],
            'vehicle': '',
            'description': ''
        }
        
        # 提取标题
        title_match = re.search(r'<h1[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
        if not title_match:
            title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
        if title_match:
            info['title'] = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        
        # 提取向导名字
        guide_match = re.search(r'guide["\']?\s*[:=]\s*["\']([^"\']+)["\']', html, re.IGNORECASE)
        if guide_match:
            info['guide_name'] = guide_match.group(1)
        
        # 提取价格
        price_match = re.search(r'[\$¥￥](\d+)', html)
        if price_match:
            info['price'] = f"${price_match.group(1)}"
        
        # 提取评分
        rating_match = re.search(r'(\d+\.?\d*)\s*(?:stars?|rating|score)', html, re.IGNORECASE)
        if rating_match:
            info['rating'] = rating_match.group(1)
        
        # 提取城市
        city_patterns = [
            r'Shanghai|Beijing|Guangzhou|Shenzhen|Chengdu|Hangzhou|Xi\'an|Nanjing|Wuhan|Chongqing',
            r'上海|北京|广州|深圳|成都|杭州|西安|南京|武汉|重庆'
        ]
        for pattern in city_patterns:
            city_match = re.search(pattern, html, re.IGNORECASE)
            if city_match:
                info['city'] = city_match.group(0)
                break
        
        return info
    
    def try_api_endpoints(self, product_id: int) -> Optional[Dict]:
        """尝试各种可能的 API 端点"""
        endpoints = [
            f"/api/product/{product_id}",
            f"/api/guide/{product_id}",
            f"/api/products/{product_id}",
            f"/api/guides/{product_id}",
            f"/api/v1/product/{product_id}",
            f"/api/v1/guide/{product_id}",
            f"/api/item/{product_id}",
        ]
        
        for endpoint in endpoints:
            url = f"{self.base_url}{endpoint}"
            try:
                req = urllib.request.Request(url, headers=self.headers)
                with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    return data
            except:
                continue
        
        return None
    
    def scrape(self, product_id: int) -> Dict[str, Any]:
        """主爬虫函数"""
        print(f"正在抓取产品 ID: {product_id}...")
        
        # 首先尝试 API
        api_data = self.try_api_endpoints(product_id)
        if api_data:
            print("✅ 通过 API 获取数据成功")
            return api_data
        
        # 然后尝试解析 HTML
        html = self.fetch_page(product_id)
        if html:
            info = self.extract_product_info(html)
            print("✅ 通过 HTML 解析获取数据成功")
            return info
        
        print("❌ 无法获取数据")
        return {}

def main():
    scraper = FaceTravelScraper()
    
    # 可以命令行参数传入产品 ID
    if len(sys.argv) > 1:
        product_id = int(sys.argv[1])
    else:
        product_id = 55  # 默认值
    
    result = scraper.scrape(product_id)
    
    print("\n" + "="*50)
    print("抓取结果:")
    print("="*50)
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
