const puppeteer = require('puppeteer');

async function scrapeProduct(productId) {
    console.log(`正在抓取产品 ID: ${productId}...`);
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // 设置 User-Agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 访问页面
        const url = `https://www.facetravelchina.com/index/detail?id=${productId}`;
        console.log(`访问: ${url}`);
        
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 等待页面加载完成
        await page.waitForTimeout(3000);
        
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
                languages: [],
                images: []
            };
            
            // 提取标题
            const titleEl = document.querySelector('h1');
            if (titleEl) info.title = titleEl.textContent.trim();
            
            // 提取向导名字
            const guideEl = document.querySelector('[class*="guide"], [class*="expert"]');
            if (guideEl) info.guide_name = guideEl.textContent.trim();
            
            // 提取价格
            const priceEl = document.querySelector('[class*="price"], .price');
            if (priceEl) info.price = priceEl.textContent.trim();
            
            // 提取评分
            const ratingEl = document.querySelector('[class*="rating"], [class*="score"]');
            if (ratingEl) info.rating = ratingEl.textContent.trim();
            
            // 提取描述
            const descEl = document.querySelector('[class*="description"], [class*="detail"], .description');
            if (descEl) info.description = descEl.textContent.trim();
            
            // 提取所有图片
            const imgEls = document.querySelectorAll('img');
            imgEls.forEach(img => {
                if (img.src && !img.src.includes('logo')) {
                    info.images.push(img.src);
                }
            });
            
            // 提取页面所有文本内容
            info.fullText = document.body.innerText.substring(0, 3000);
            
            return info;
        });
        
        console.log('✅ 抓取成功!\n');
        console.log('==================================================');
        console.log('产品信息:');
        console.log('==================================================');
        console.log(JSON.stringify(productInfo, null, 2));
        
        return productInfo;
        
    } catch (error) {
        console.error('❌ 抓取失败:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

// 主函数
const productId = process.argv[2] || 55;
scrapeProduct(productId);
