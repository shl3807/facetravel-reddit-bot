const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeProduct(productId) {
    console.log(`\n========================================`);
    console.log(`正在抓取产品 ID: ${productId}...`);
    console.log(`========================================`);
    
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
        
        // 检查页面是否有效（是否存在产品信息）
        const pageTitle = await page.title();
        if (pageTitle.includes('404') || pageTitle.includes('Not Found')) {
            console.log(`❌ 产品 ${productId} 不存在`);
            return null;
        }
        
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
                images: [],
                url: window.location.href
            };
            
            // 提取标题
            const titleEl = document.querySelector('h1');
            if (titleEl) {
                info.title = titleEl.textContent.trim();
            }
            
            // 提取向导名字 - 从页面结构中提取
            const guideEl = document.querySelector('[class*="guide"]');
            if (guideEl) {
                // 尝试多种方式提取名字
                const nameMatch = document.body.innerText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s*\n\s*\d+\s*stars?)/i);
                if (nameMatch) {
                    info.guide_name = nameMatch[1];
                }
            }
            
            // 如果还没找到，尝试其他模式
            if (!info.guide_name) {
                const text = document.body.innerText;
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)?$/) && lines[i+1] && lines[i+1].includes('★')) {
                        info.guide_name = lines[i].trim();
                        break;
                    }
                }
            }
            
            // 提取价格
            const priceMatch = document.body.innerText.match(/\$(\d+)/);
            if (priceMatch) {
                info.price = `$${priceMatch[1]}`;
            }
            
            // 提取城市
            const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xi\'an', 'Nanjing', 'Wuhan', 'Chongqing', '上海', '北京', '广州', '深圳', '成都', '杭州', '西安', '南京', '武汉', '重庆'];
            const bodyText = document.body.innerText;
            for (let city of cities) {
                if (bodyText.includes(city)) {
                    info.city = city;
                    break;
                }
            }
            
            // 提取评分
            const ratingMatch = document.body.innerText.match(/([\d.]+)\s*★/);
            if (ratingMatch) {
                info.rating = ratingMatch[1];
            }
            
            // 提取描述（向导介绍）
            const paragraphs = document.querySelectorAll('p');
            for (let p of paragraphs) {
                const text = p.textContent.trim();
                if (text.length > 200 && text.includes('Hello')) {
                    info.description = text.substring(0, 800);
                    break;
                }
            }
            
            // 提取图片
            document.querySelectorAll('img').forEach(img => {
                if (img.src && (img.src.includes('facetravel') || img.src.includes('cdn')) && !img.src.includes('logo')) {
                    info.images.push(img.src);
                }
            });
            
            // 去重图片
            info.images = [...new Set(info.images)].slice(0, 5);
            
            return info;
        });
        
        // 清理数据
        if (productInfo.title) {
            // 提取纯净的向导名字
            const guideMatch = productInfo.title.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
            if (guideMatch && !productInfo.guide_name) {
                productInfo.guide_name = guideMatch[1];
            }
        }
        
        console.log('✅ 抓取成功!');
        console.log(`标题: ${productInfo.title || 'N/A'}`);
        console.log(`向导: ${productInfo.guide_name || 'N/A'}`);
        console.log(`城市: ${productInfo.city || 'N/A'}`);
        console.log(`价格: ${productInfo.price || 'N/A'}`);
        
        return productInfo;
        
    } catch (error) {
        console.error(`❌ 抓取失败:`, error.message);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

async function scrapeMultiple(startId = 1, count = 10) {
    const results = [];
    
    console.log(`\n🚀 开始批量抓取 ${count} 个产品...`);
    console.log(`起始 ID: ${startId}`);
    console.log('========================================\n');
    
    for (let i = 0; i < count; i++) {
        const productId = startId + i;
        const info = await scrapeProduct(productId);
        
        if (info && info.title) {
            results.push({
                id: productId,
                ...info
            });
        }
        
        // 等待一下，避免请求太快
        if (i < count - 1) {
            console.log('\n等待 3 秒...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log('\n========================================');
    console.log('批量抓取完成!');
    console.log(`成功: ${results.length}/${count}`);
    console.log('========================================\n');
    
    // 保存结果
    const output = {
        scraped_at: new Date().toISOString(),
        total: results.length,
        products: results
    };
    
    fs.writeFileSync('products_batch.json', JSON.stringify(output, null, 2));
    console.log('💾 结果已保存到 products_batch.json');
    
    // 生成汇总
    console.log('\n📊 抓取汇总:');
    console.log('-'.repeat(50));
    results.forEach(p => {
        console.log(`ID ${p.id}: ${p.city || 'Unknown'} - ${p.guide_name || 'Unknown'} - ${p.price || 'N/A'}`);
    });
    
    return results;
}

// 主函数
const startId = parseInt(process.argv[2]) || 1;
const count = parseInt(process.argv[3]) || 10;

scrapeMultiple(startId, count).catch(console.error);
