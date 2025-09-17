// Poe API Configuration
const POE_API_KEY = 'YBdK_VlVMZTWJizpas1UTybzHvGLd4mouSNnw4A7MUE';
const POE_API_URL = 'https://api.poe.com/v1/chat/completions';

// Company Background Information
const COMPANY_BACKGROUND = `Company Background:
FreshUp specializes in delivering flexible and highly customized smart vending machine solutions tailored to the unique needs of businesses across various industries. Our core offerings include a Full Service model, where we provide an end-to-end managed solution—handling everything from procurement and stocking to after-sales maintenance—to ensure our clients enjoy a completely worry-free operation. For clients who prefer to manage their own business, our Rental & Purchase options come with comprehensive technical support and professional guidance, empowering them to run their operations with ease and efficiency.

Target Audience:
Primary: Business clients, including large corporations, government agencies (e.g., HKSAR Government), universities, and property managers. These clients are looking for a reliable, tech-driven, and full-service vending solution.

Secondary: The general public who uses our vending machines. While they are not our direct clients, their experience is crucial. They are people looking for convenient access to a wide variety of products in high-traffic areas.`;

// DOM Elements
const topicInput = document.getElementById('topic');
const additionalInfoInput = document.getElementById('additionalInfo');
const generateBtn = document.getElementById('generateBtn');
const copyButtons = document.querySelectorAll('.copy-btn');
const tabButtons = document.querySelectorAll('.tab-btn');

// News Dashboard Elements
const refreshNewsBtn = document.getElementById('refreshNews');
const newsLoading = document.getElementById('newsLoading');
const newsList = document.getElementById('newsList');

// Image Generator Elements
const generateImagesBtn = document.getElementById('generateImagesBtn');
const imageLoading = document.getElementById('imageLoading');
const imagePreview = document.getElementById('imagePreview');
const brandLogoInput = document.getElementById('brandLogo');
const productShotInput = document.getElementById('productShot');

// RSS Feed URLs
const RSS_FEEDS = [
    'https://news.google.com/rss/search?q=%E9%A6%99%E6%B8%AF%E8%87%AA%E5%8B%95%E5%94%AE%E8%B3%A3%E6%A9%9F&hl=zh-HK&gl=HK&ceid=HK:zh-Hant',
    'https://news.google.com/rss/search?q=vending+machine+hong+kong&hl=en&gl=HK&ceid=HK:en',
    'https://news.google.com/rss/search?q=%E6%99%BA%E8%83%BD%E5%94%AE%E8%B3%A3%E6%A9%9F&hl=zh-HK&gl=HK&ceid=HK:zh-Hant'
];

// Google AI Studio API Configuration
const GOOGLE_AI_API_KEY = 'AIzaSyDX8s-JgUaZoBkEtA4IleeMjbTMrcOkpJg';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupTabSwitching();
    loadNews();
});

function setupEventListeners() {
    generateBtn.addEventListener('click', generateContent);
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            copyToClipboard(target);
        });
    });
    
    // News dashboard event listeners
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', loadNews);
    }
    
    // Image generator event listeners
    if (generateImagesBtn) {
        generateImagesBtn.addEventListener('click', generateImages);
    }
    
    // File upload event listeners
    if (brandLogoInput) {
        brandLogoInput.addEventListener('change', handleFileUpload);
    }
    if (productShotInput) {
        productShotInput.addEventListener('change', handleFileUpload);
    }
}

function setupTabSwitching() {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Remove active class from all tabs in the same section
    const section = tabId.split('-')[0];
    const sectionTabs = document.querySelectorAll(`[data-tab^="${section}-"]`);
    sectionTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Hide all content outputs in the same section
    const sectionOutputs = document.querySelectorAll(`#${section}-en, #${section}-zh`);
    sectionOutputs.forEach(output => output.style.display = 'none');
    
    // Show the selected content output
    document.getElementById(tabId).style.display = 'block';
}

async function generateContent() {
    const topic = topicInput.value.trim();
    const additionalInfo = additionalInfoInput.value.trim();
    
    if (!topic) {
        alert('Please enter a topic or keywords');
        return;
    }
    
    // Combine default background with additional info if provided
    const companyBackground = additionalInfo 
        ? `${COMPANY_BACKGROUND}\n\nAdditional Company Information:\n${additionalInfo}`
        : COMPANY_BACKGROUND;
    
    // Disable generate button and show loading states
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    // Show loading for all content sections
    showLoading('linkedin-en');
    showLoading('linkedin-zh');
    showLoading('igfb-zh');
    showLoading('igfb-en');
    showLoading('threads');
    
    try {
        // Generate content for all platforms in parallel
        const [linkedinEn, linkedinZh, igfbZh, igfbEn, threads] = await Promise.all([
            generateLinkedInContent(topic, 'english', companyBackground),
            generateLinkedInContent(topic, 'chinese', companyBackground),
            generateIGFBContent(topic, 'chinese', companyBackground),
            generateIGFBContent(topic, 'english', companyBackground),
            generateThreadsContent(topic, companyBackground)
        ]);
        
        // Display the generated content
        displayContent('linkedin-en', linkedinEn);
        displayContent('linkedin-zh', linkedinZh);
        displayContent('igfb-zh', igfbZh);
        displayContent('igfb-en', igfbEn);
        displayContent('threads', threads);
        
    } catch (error) {
        console.error('Error generating content:', error);
        alert('Error generating content. Please try again.');
    } finally {
        // Re-enable generate button
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Content';
    }
}

async function generateLinkedInContent(topic, language, companyBackground) {
    const prompt = language === 'english' 
        ? `${companyBackground}

Create a professional LinkedIn post for FreshUp marketing team. 
Topic: ${topic}
Requirements:
- Language: English
- Word count: 100-150 words
- Tone: Professional, B2B, formal, smart
- Content should educate and inform
- Focus on business value and insights
- Include relevant hashtags
- Ensure content aligns with FreshUp's smart vending machine solutions and target audience

Format the response as clean text without any prefixes or explanations.`
        : `${companyBackground}

Create a professional LinkedIn post for FreshUp marketing team.
Topic: ${topic}
Requirements:
- Language: Traditional Chinese (書面語) - Hong Kong style
- Word count: 100-150 words
- Tone: Professional, B2B, formal, smart
- Content should educate and inform
- Focus on business value and insights
- Include relevant hashtags
- Ensure content aligns with FreshUp's smart vending machine solutions and target audience

Format the response as clean text without any prefixes or explanations.`;
    
    return await callPoeAPI(prompt);
}

async function generateIGFBContent(topic, language, companyBackground) {
    const prompt = language === 'chinese'
        ? `${companyBackground}

Create an IGFB (Instagram/Facebook) post for FreshUp marketing team.
Topic: ${topic}
Requirements:
- Language: Traditional Chinese (書面語) - Hong Kong style
- Word count: 150 Chinese characters
- Tone: Approachable and friendly, B2B-focused
- Create an appealing tagline that awakens/evokes client needs
- Focus on the "Why" - why this matters to the audience
- Make it engaging and relatable
- Ensure content aligns with FreshUp's smart vending machine solutions and target audience

Format the response as clean text without any prefixes or explanations.`
        : `${companyBackground}

Create an IGFB (Instagram/Facebook) post for FreshUp marketing team.
Topic: ${topic}
Requirements:
- Language: English
- Word count: 150 words
- Tone: Approachable and friendly, B2B-focused
- Create an appealing tagline that awakens/evokes client needs
- Focus on the "Why" - why this matters to the audience
- Make it engaging and relatable
- Ensure content aligns with FreshUp's smart vending machine solutions and target audience

Format the response as clean text without any prefixes or explanations.`;
    
    return await callPoeAPI(prompt);
}

async function generateThreadsContent(topic, companyBackground) {
    const prompt = `${companyBackground}

Create a Threads post for FreshUp marketing team.
Topic: ${topic}
Requirements:
- Language: Hong Kong colloquial Chinese (香港口語化) but maintain B2B professionalism
- Word count: 50 Chinese characters
- Tone: B2C tone for secondary target audience
- Aim to raise brand awareness and enhance company image
- Can be a little "unhinged" or "meme-worthy" if it fits the brand
- Focus on community and personality
- Goal is top-of-funnel brand awareness, not direct B2B sales
- Make it shareable and engaging
- Ensure content aligns with FreshUp's smart vending machine solutions and target audience

Format the response as clean text without any prefixes or explanations.`;
    
    return await callPoeAPI(prompt);
}

async function callPoeAPI(prompt) {
    try {
        const response = await fetch(POE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${POE_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional copywriter for FreshUp marketing team. Create engaging, high-quality social media content that follows the specific requirements for each platform. Always consider FreshUp\'s business model and target audience when creating content.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('Invalid API response format');
        }
        
    } catch (error) {
        console.error('Poe API Error:', error);
        throw error;
    }
}

function showLoading(targetId) {
    const output = document.getElementById(targetId);
    const loading = output.querySelector('.loading');
    const content = output.querySelector('.content-text');
    
    loading.style.display = 'block';
    content.style.display = 'none';
}

function displayContent(targetId, content) {
    const output = document.getElementById(targetId);
    const loading = output.querySelector('.loading');
    const contentDiv = output.querySelector('.content-text');
    
    loading.style.display = 'none';
    contentDiv.textContent = content;
    contentDiv.style.display = 'block';
    
    // Add word count
    addWordCount(targetId, content);
}

function addWordCount(targetId, content) {
    const output = document.getElementById(targetId);
    let wordCountDiv = output.querySelector('.word-count');
    
    if (!wordCountDiv) {
        wordCountDiv = document.createElement('div');
        wordCountDiv.className = 'word-count';
        output.appendChild(wordCountDiv);
    }
    
    // Count words based on language
    let wordCount = 0;
    let targetCount = 0;
    let status = '';
    
    if (targetId.includes('linkedin')) {
        wordCount = content.split(/\s+/).length;
        targetCount = 125; // Target 100-150 words
        status = wordCount >= 100 && wordCount <= 150 ? '' : 'warning';
    } else if (targetId.includes('igfb')) {
        if (targetId.includes('zh')) {
            wordCount = content.length; // Chinese characters
            targetCount = 150;
        } else {
            wordCount = content.split(/\s+/).length; // English words
            targetCount = 150;
        }
        status = wordCount <= targetCount ? '' : 'warning';
    } else if (targetId.includes('threads')) {
        wordCount = content.length; // Chinese characters
        targetCount = 50;
        status = wordCount <= 50 ? '' : 'warning';
    }
    
    wordCountDiv.textContent = `Word count: ${wordCount}${targetCount ? ` / ${targetCount}` : ''}`;
    wordCountDiv.className = `word-count ${status}`;
}

async function copyToClipboard(targetId) {
    const output = document.getElementById(targetId);
    const content = output.querySelector('.content-text').textContent;
    
    try {
        await navigator.clipboard.writeText(content);
        
        // Visual feedback
        const btn = document.querySelector(`[data-target="${targetId}"]`);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#28a745';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy to clipboard');
    }
}

// Handle Enter key in textareas
topicInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        generateContent();
    }
});

additionalInfoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        generateContent();
    }
});

// News Dashboard Functions
async function loadNews() {
    if (!newsLoading || !newsList) return;
    
    showNewsLoading();
    
    try {
        const allNews = [];
        
        // Fetch news from all RSS feeds
        for (const feedUrl of RSS_FEEDS) {
            try {
                const news = await fetchRSSFeed(feedUrl);
                allNews.push(...news);
            } catch (error) {
                console.error('Error fetching RSS feed:', feedUrl, error);
            }
        }
        
        // Sort by date (newest first)
        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        // Remove duplicates based on title
        const uniqueNews = removeDuplicateNews(allNews);
        
        // Display news
        displayNews(uniqueNews.slice(0, 10)); // Show top 10 news items
        
    } catch (error) {
        console.error('Error loading news:', error);
        showNewsError();
    }
}

async function fetchRSSFeed(feedUrl) {
    try {
        // Try multiple CORS proxies for better reliability
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
            `https://cors-anywhere.herokuapp.com/${feedUrl}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
        ];
        
        let response = null;
        let data = null;
        
        // Try each proxy until one works
        for (const proxyUrl of proxies) {
            try {
                console.log('Trying proxy:', proxyUrl);
                response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    if (data.contents) {
                        break;
                    }
                }
            } catch (proxyError) {
                console.log('Proxy failed:', proxyUrl, proxyError);
                continue;
            }
        }
        
        if (!data || !data.contents) {
            // Fallback: return mock data for demonstration
            console.log('All proxies failed, using mock data');
            return getMockNewsData();
        }
        
        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            console.error('XML parsing error:', parseError.textContent);
            return getMockNewsData();
        }
        
        const items = xmlDoc.querySelectorAll('item');
        const news = [];
        
        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const source = item.querySelector('source')?.textContent || 'Google News';
            
            if (title && link) {
                news.push({
                    title: cleanText(title),
                    link: link,
                    description: cleanText(description),
                    pubDate: pubDate,
                    source: cleanText(source),
                    date: new Date(pubDate)
                });
            }
        });
        
        return news.length > 0 ? news : getMockNewsData();
        
    } catch (error) {
        console.error('Error parsing RSS feed:', error);
        return getMockNewsData();
    }
}

function getMockNewsData() {
    // Mock data for demonstration when RSS feeds are not accessible
    return [
        {
            title: "香港智能售賣機市場快速增長，企業紛紛投資自動化零售解決方案",
            link: "https://example.com/news1",
            description: "隨著科技發展，香港智能售賣機市場呈現快速增長趨勢，各大企業紛紛投資自動化零售解決方案，提升客戶體驗。",
            pubDate: new Date().toISOString(),
            source: "香港01",
            date: new Date()
        },
        {
            title: "Hong Kong Vending Machine Industry Sees 30% Growth in Smart Solutions",
            link: "https://example.com/news2",
            description: "The vending machine industry in Hong Kong has experienced significant growth, with smart vending solutions leading the market transformation.",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            source: "South China Morning Post",
            date: new Date(Date.now() - 86400000)
        },
        {
            title: "政府機構採用智能售賣機，提升公共服務效率",
            link: "https://example.com/news3",
            description: "香港政府多個部門開始採用智能售賣機技術，為市民提供更便捷的公共服務，提升整體服務效率。",
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            source: "明報",
            date: new Date(Date.now() - 172800000)
        },
        {
            title: "University Campus Implements Smart Vending Solutions for Student Convenience",
            link: "https://example.com/news4",
            description: "Major universities in Hong Kong are implementing smart vending machine solutions to provide 24/7 access to snacks and beverages for students.",
            pubDate: new Date(Date.now() - 259200000).toISOString(),
            source: "The Standard",
            date: new Date(Date.now() - 259200000)
        },
        {
            title: "物業管理公司投資智能售賣機，提升住戶生活品質",
            link: "https://example.com/news5",
            description: "香港多個大型物業管理公司開始在住宅和商業大廈安裝智能售賣機，為住戶和租戶提供更便利的生活服務。",
            pubDate: new Date(Date.now() - 345600000).toISOString(),
            source: "經濟日報",
            date: new Date(Date.now() - 345600000)
        }
    ];
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function removeDuplicateNews(news) {
    const seen = new Set();
    return news.filter(item => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function showNewsLoading() {
    if (newsLoading) newsLoading.style.display = 'block';
    if (newsList) newsList.style.display = 'none';
}

function showNewsError() {
    if (newsLoading) {
        newsLoading.textContent = 'Error loading news. Please try again.';
        newsLoading.style.color = '#dc3545';
    }
}

function displayNews(news) {
    if (!newsList) return;
    
    newsLoading.style.display = 'none';
    newsList.style.display = 'block';
    
    if (news.length === 0) {
        newsList.innerHTML = '<div class="news-item"><div class="news-title">No news articles found</div></div>';
        return;
    }
    
    newsList.innerHTML = news.map(item => `
        <div class="news-item">
            <div class="news-title">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
            </div>
            ${item.description ? `<div class="news-snippet">${item.description}</div>` : ''}
            <div class="news-meta">
                <span class="news-source">${item.source}</span>
                <span class="news-date">${formatDate(item.date)}</span>
            </div>
        </div>
    `).join('');
}

function formatDate(date) {
    if (!date || isNaN(date.getTime())) return 'Unknown date';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-HK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// File Upload Functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showFilePreview(event.target, e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }
}

function showFilePreview(input, dataUrl, fileName) {
    // Remove existing preview
    const existingPreview = input.parentNode.querySelector('.file-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create new preview
    const preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.innerHTML = `
        <div class="file-preview-info">
            <img src="${dataUrl}" alt="Preview" />
            <div class="file-preview-text">
                <strong>${fileName}</strong><br>
                <small>Ready to include in generated images</small>
            </div>
        </div>
    `;
    
    input.parentNode.appendChild(preview);
}

// Image Generator Functions
async function generateImages() {
    const topic = topicInput.value.trim();
    const additionalInfo = additionalInfoInput.value.trim();
    
    if (!topic) {
        alert('Please enter a topic or keywords to generate images');
        return;
    }
    
    // Get uploaded images
    const brandLogo = await getFileAsBase64(brandLogoInput);
    const productShot = await getFileAsBase64(productShotInput);
    
    // Disable button and show loading
    generateImagesBtn.disabled = true;
    generateImagesBtn.textContent = '🎨 Generating Images...';
    showImageLoading();
    
    try {
        // Combine background info
        const companyBackground = additionalInfo 
            ? `${COMPANY_BACKGROUND}\n\nAdditional Company Information:\n${additionalInfo}`
            : COMPANY_BACKGROUND;
        
        // Generate images for all three platforms
        const [linkedinImage, igfbImage, threadsImage] = await Promise.all([
            generatePlatformImage(topic, 'linkedin', companyBackground, brandLogo, productShot),
            generatePlatformImage(topic, 'igfb', companyBackground, brandLogo, productShot),
            generatePlatformImage(topic, 'threads', companyBackground, brandLogo, productShot)
        ]);
        
        // Display the generated images
        displayImages([
            { platform: 'LinkedIn', image: linkedinImage, description: 'Professional B2B focused image' },
            { platform: 'IGFB', image: igfbImage, description: 'Engaging lifestyle image for B2C' },
            { platform: 'Threads', image: threadsImage, description: 'Community-focused brand awareness image' }
        ]);
        
    } catch (error) {
        console.error('Error generating images:', error);
        alert('Error generating images. Please try again.');
        showImageError();
    } finally {
        // Re-enable button
        generateImagesBtn.disabled = false;
        generateImagesBtn.textContent = '🎨 Generate Images';
    }
}

async function getFileAsBase64(input) {
    if (input.files && input.files[0]) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        });
    }
    return null;
}

async function generatePlatformImage(topic, platform, companyBackground, brandLogo, productShot) {
    try {
        // Step 1: Use Gemini-2.5-flash to analyze keywords and generate creative ideas
        const creativeIdeas = await generateCreativeIdeas(topic, platform, companyBackground);
        
        // Step 2: Use Gemini-2.5-flash-image-preview to create realistic images
        const imagePrompt = createRealisticImagePrompt(topic, platform, creativeIdeas, brandLogo, productShot);
        
        const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: imagePrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const content = data.candidates[0].content;
            if (content.parts && content.parts[0] && content.parts[0].inlineData) {
                return `data:image/png;base64,${content.parts[0].inlineData.data}`;
            }
        }
        
        // Fallback to composite image
        return await createCompositeImage(topic, platform, brandLogo, productShot);
        
    } catch (error) {
        console.error('Google AI API Error:', error);
        // Return composite image on error
        return await createCompositeImage(topic, platform, brandLogo, productShot);
    }
}

async function generateCreativeIdeas(topic, platform, companyBackground) {
    const analysisPrompt = `${companyBackground}

Analyze the topic "${topic}" for ${platform} social media content and provide creative visual ideas.

Platform: ${platform}
Topic: ${topic}

Please provide 3-5 specific, creative visual concepts that would work well for this platform and topic. Focus on:
- Realistic scenarios and settings
- People and their interactions
- Environmental context
- Visual storytelling elements
- Platform-appropriate style

Format your response as a clear list of visual concepts.`;

    try {
        const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: analysisPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Analysis request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return `Create a realistic image related to ${topic} for ${platform}`;
        
    } catch (error) {
        console.error('Creative analysis error:', error);
        return `Create a realistic image related to ${topic} for ${platform}`;
    }
}

async function createCompositeImage(topic, platform, brandLogo, productShot) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        
        // Create background with brand color #36c1ef
        const gradient = ctx.createLinearGradient(0, 0, 0, 1350);
        gradient.addColorStop(0, '#36c1ef');
        gradient.addColorStop(1, '#1e90ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1350);
        
        // Add topic text (white for contrast)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(topic, 540, 150);
        
        // Load and draw brand logo if provided
        if (brandLogo) {
            const logoImg = new Image();
            logoImg.onload = function() {
                // Draw logo maintaining aspect ratio
                const logoMaxSize = 120;
                const logoAspectRatio = logoImg.width / logoImg.height;
                let logoWidth, logoHeight;
                
                if (logoAspectRatio > 1) {
                    logoWidth = logoMaxSize;
                    logoHeight = logoMaxSize / logoAspectRatio;
                } else {
                    logoHeight = logoMaxSize;
                    logoWidth = logoMaxSize * logoAspectRatio;
                }
                
                // Position logo based on platform design
                let logoX, logoY;
                switch (platform) {
                    case 'linkedin':
                        // Top-right corner for professional look
                        logoX = 1080 - logoWidth - 30;
                        logoY = 30;
                        break;
                    case 'igfb':
                        // Top-left corner for lifestyle look
                        logoX = 30;
                        logoY = 30;
                        break;
                    case 'threads':
                        // Bottom-right corner for community look
                        logoX = 1080 - logoWidth - 30;
                        logoY = 1350 - logoHeight - 30;
                        break;
                    default:
                        logoX = 1080 - logoWidth - 30;
                        logoY = 30;
                }
                
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                
                // Load and draw product shot if provided
                if (productShot) {
                    const productImg = new Image();
                    productImg.onload = function() {
                        // Draw product shot maintaining aspect ratio
                        const productMaxWidth = 500;
                        const productMaxHeight = 400;
                        const productAspectRatio = productImg.width / productImg.height;
                        let productWidth, productHeight;
                        
                        if (productAspectRatio > 1) {
                            productWidth = Math.min(productMaxWidth, productImg.width);
                            productHeight = productWidth / productAspectRatio;
                        } else {
                            productHeight = Math.min(productMaxHeight, productImg.height);
                            productWidth = productHeight * productAspectRatio;
                        }
                        
                        // Position product shot based on platform design
                        let productX, productY;
                        switch (platform) {
                            case 'linkedin':
                                // Center-right for professional layout
                                productX = 1080 - productWidth - 50;
                                productY = 300;
                                break;
                            case 'igfb':
                                // Center for lifestyle layout
                                productX = (1080 - productWidth) / 2;
                                productY = 300;
                                break;
                            case 'threads':
                                // Center-left for community layout
                                productX = 50;
                                productY = 300;
                                break;
                            default:
                                productX = (1080 - productWidth) / 2;
                                productY = 300;
                        }
                        
                        ctx.drawImage(productImg, productX, productY, productWidth, productHeight);
                        
                        // Add FreshUp branding at bottom
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 32px Arial';
                        ctx.fillText('FreshUp', 540, 1250);
                        
                        resolve(canvas.toDataURL('image/png'));
                    };
                    productImg.src = productShot;
                } else {
                    // Add FreshUp branding at bottom
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 32px Arial';
                    ctx.fillText('FreshUp', 540, 1250);
                    
                    resolve(canvas.toDataURL('image/png'));
                }
            };
            logoImg.src = brandLogo;
        } else if (productShot) {
            // Only product shot, no logo
            const productImg = new Image();
            productImg.onload = function() {
                // Draw product shot maintaining aspect ratio
                const productMaxWidth = 500;
                const productMaxHeight = 400;
                const productAspectRatio = productImg.width / productImg.height;
                let productWidth, productHeight;
                
                if (productAspectRatio > 1) {
                    productWidth = Math.min(productMaxWidth, productImg.width);
                    productHeight = productWidth / productAspectRatio;
                } else {
                    productHeight = Math.min(productMaxHeight, productImg.height);
                    productWidth = productHeight * productAspectRatio;
                }
                
                // Position product shot based on platform design
                let productX, productY;
                switch (platform) {
                    case 'linkedin':
                        // Center-right for professional layout
                        productX = 1080 - productWidth - 50;
                        productY = 300;
                        break;
                    case 'igfb':
                        // Center for lifestyle layout
                        productX = (1080 - productWidth) / 2;
                        productY = 300;
                        break;
                    case 'threads':
                        // Center-left for community layout
                        productX = 50;
                        productY = 300;
                        break;
                    default:
                        productX = (1080 - productWidth) / 2;
                        productY = 300;
                }
                
                ctx.drawImage(productImg, productX, productY, productWidth, productHeight);
                
                // Add FreshUp branding at bottom
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px Arial';
                ctx.fillText('FreshUp', 540, 1250);
                
                resolve(canvas.toDataURL('image/png'));
            };
            productImg.src = productShot;
        } else {
            // No uploaded images, just add FreshUp branding
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.fillText('FreshUp', 540, 1250);
            
            resolve(canvas.toDataURL('image/png'));
        }
    });
}

function createRealisticImagePrompt(topic, platform, creativeIdeas, brandLogo, productShot) {
    let imageInstructions = '';
    
    if (brandLogo && productShot) {
        imageInstructions = `
IMPORTANT: I have provided you with a brand logo image and a product shot image. You MUST include these exact images in your generated design. Integrate the brand logo and product shot naturally into the scene.`;
    } else if (brandLogo) {
        imageInstructions = `
IMPORTANT: I have provided you with a brand logo image. You MUST include this exact logo in your generated design. Place the logo naturally in the scene.`;
    } else if (productShot) {
        imageInstructions = `
IMPORTANT: I have provided you with a product shot image. You MUST include this exact product image in your generated design. Integrate the product shot naturally into the scene.`;
    }
    
    const basePrompt = `You are an AI image generator. Generate a realistic photograph or high-quality illustration.

IMPORTANT: Create an actual IMAGE, not text overlay, not graphic design with words, not typography. Generate a realistic photo or illustration.

${imageInstructions}

Topic: ${topic}
Platform: ${platform}
Image dimensions: 1080x1350px (portrait orientation)
Brand color: #36c1ef (bright blue)

Creative Visual Ideas: ${creativeIdeas}

Based on the creative ideas above, generate a realistic photograph or professional illustration that incorporates these concepts. Focus on realistic people, environments, and scenarios.`;

    switch (platform) {
        case 'linkedin':
            return `${basePrompt}
- Professional, corporate style
- Realistic photography or high-quality illustration
- Business professionals in corporate environments
- Modern office buildings, business districts, or corporate campuses
- Professional lighting and composition
- High-quality, polished appearance
- Focus on business value and professional interactions

Create a realistic photograph or illustration that incorporates the creative ideas above in a professional business context. NO TEXT, NO WORDS, NO TYPOGRAPHY - just pure visual imagery.`;
            
        case 'igfb':
            return `${basePrompt}
- Lifestyle and engaging style
- Realistic photography or vibrant illustration
- Real people in everyday settings
- Diverse people in natural environments (shopping malls, airports, universities, parks)
- Natural lighting and authentic moments
- Warm, approachable atmosphere
- Social media friendly appearance
- Focus on user experience and convenience

Create a realistic photograph or illustration that incorporates the creative ideas above in a lifestyle context. NO TEXT, NO WORDS, NO TYPOGRAPHY - just pure visual imagery of people and realistic scenarios.`;
            
        case 'threads':
            return `${basePrompt}
- Community-focused, personality-driven style
- Creative photography or artistic illustration
- Social, community settings and interactions
- Fun, engaging scenarios (events, festivals, community gatherings)
- Creative angles and interesting compositions
- Vibrant colors and dynamic elements
- Eye-catching, viral potential
- Focus on community and personality

Create a creative photograph or illustration that incorporates the creative ideas above in a community-focused context. NO TEXT, NO WORDS, NO TYPOGRAPHY - just pure visual imagery of community settings and interactions.`;
            
        default:
            return basePrompt;
    }
}

function generatePlaceholderImage(platform, topic) {
    // Create a placeholder image using Canvas API
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1350);
    gradient.addColorStop(0, '#36c1ef');
    gradient.addColorStop(1, '#1e90ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);
    
    // Add platform-specific styling
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(platform.toUpperCase(), 540, 200);
    
    ctx.font = '24px Arial';
    ctx.fillText('Smart Vending Solutions', 540, 250);
    
    ctx.font = '32px Arial';
    ctx.fillText(topic, 540, 400);
    
    // Add FreshUp branding
    ctx.font = 'bold 36px Arial';
    ctx.fillText('FreshUp', 540, 1200);
    
    return canvas.toDataURL('image/png');
}

function showImageLoading() {
    if (imageLoading) imageLoading.style.display = 'block';
    if (imagePreview) imagePreview.style.display = 'none';
}

function showImageError() {
    if (imageLoading) {
        imageLoading.innerHTML = '<p style="color: #dc3545;">Error generating images. Please try again.</p>';
    }
}

function displayImages(images) {
    if (!imagePreview) return;
    
    imageLoading.style.display = 'none';
    imagePreview.style.display = 'block';
    
    imagePreview.innerHTML = images.map((item, index) => `
        <div class="image-card">
            <img src="${item.image}" alt="${item.platform} Image" />
            <div class="image-card-content">
                <div class="image-card-title">${item.platform}</div>
                <div class="image-card-description">${item.description}</div>
                <div class="image-card-actions">
                    <button class="download-btn" onclick="downloadImage('${item.image}', '${item.platform.toLowerCase()}_${Date.now()}.png')">
                        📥 Download
                    </button>
                    <button class="view-btn" onclick="viewImage('${item.image}')">
                        👁️ View
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function downloadImage(imageData, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function viewImage(imageData) {
    const newWindow = window.open();
    newWindow.document.write(`
        <html>
            <head><title>Image Preview</title></head>
            <body style="margin:0; padding:20px; background:#f0f0f0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <img src="${imageData}" style="max-width:100%; max-height:100%; box-shadow:0 4px 20px rgba(0,0,0,0.3); border-radius:10px;" />
            </body>
        </html>
    `);
}
