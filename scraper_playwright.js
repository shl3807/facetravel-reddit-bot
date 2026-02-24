const { chromium } = require('playwright');

async function scrapeProduct(productId) {
    console.log(`正在抓取产品 ID: ${productId}...`);
    
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
        
        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const url = `https://www.facetravelchina.com/index/detail?id=${productId}`;
        console.log(`访问: ${url}`);
        
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        // 等待页面加载
        await page.waitForTimeout(5000);
        
        // 提取产品信息
        const productInfo = await page.evaluate(() => {
            const info = {
                title: '',
                guide_name: '',
                city: '',
                price: '',
                rating: '',
                categories: [],
                vehicle: '',
                description: '',
                duration: '',
                images: []
            };
            
            // 提取标题
            const titleEl = document.querySelector('h1');
            if (titleEl) info.title = titleEl.textContent.trim();
            
            // 提取向导名字 - 尝试多种选择器
            const guideSelectors = ['.guide-name', '[class*="guide"]', '.expert-name', '.provider-name'];
            for (let sel of guideSelectors) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim()) {
                    info.guide_name = el.textContent.trim();
                    break;
                }
            }
            
            // 提取价格
            const priceSelectors = ['.price', '[class*="price"]', '.cost'];
            for (let sel of priceSelectors) {
                const el = document.querySelector(sel);
                if (el && el.textContent.includes('$')) {
                    info.price = el.textContent.trim();
                    break;
                }
            }
            
            // 提取描述
            const descSelectors = ['.description', '[class*="description"]', '.content', '.detail-content'];
            for (let sel of descSelectors) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim().length > 50) {
                    info.description = el.textContent.trim().substring(0, 1000);
                    break;
                }
            }
            
            // 提取所有文本用于分析
            info.fullText = document.body.innerText;
            
            // 提取图片
            document.querySelectorAll('img').forEach(img => {
                if (img.src && (img.src.includes('facetravel') || img.src.includes('cdn')) && !img.src.includes('logo')) {
                    info.images.push(img.src);
                }
            });
            
            return info;
        });
        
        console.log('\n✅ 抓取成功!\n');
        console.log('==================================================');
        console.log('产品信息:');
        console.log('==================================================');
        console.log(JSON.stringify(productInfo, null, 2));
        
        // 保存到文件
        const fs = require('fs');
        fs.writeFileSync('product_info.json', JSON.stringify(productInfo, null, 2));
        console.log('\n💾 信息已保存到 product_info.json');
        
        return productInfo;
        
    } catch (error) {
        console.error('❌ 抓取失败:', error.message);
        console.error(error.stack);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

const productId = process.argv[2] || 55;
scrapeProduct(productId);
