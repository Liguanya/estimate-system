// ========== 登录相关 ==========
const users = [
    { username: 'admin', password: '123456', displayName: '管理员' },
    { username: 'user01', password: '123456', displayName: '张三' },
    { username: 'user02', password: '123456', displayName: '李四' }
];

const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const currentUserSpan = document.getElementById('currentUser');
const navList = document.getElementById('navList');

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    initNavigation();
    initDragDrop();
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('estimateSystemLoggedIn');
    const userData = localStorage.getItem('estimateSystemUser');
    if (isLoggedIn === 'true' && userData) {
        showMainPage(JSON.parse(userData));
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    mainPage.style.display = 'none';
}

function showMainPage(user) {
    loginPage.style.display = 'none';
    mainPage.style.display = 'flex';
    currentUserSpan.textContent = user.displayName;
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('estimateSystemLoggedIn', 'true');
        localStorage.setItem('estimateSystemUser', JSON.stringify(user));
        showMainPage(user);
    } else {
        errorMessage.textContent = '用户名或密码错误';
        usernameInput.parentElement.style.borderColor = '#e74c3c';
        passwordInput.parentElement.style.borderColor = '#e74c3c';
        setTimeout(() => {
            usernameInput.parentElement.style.borderColor = 'transparent';
            passwordInput.parentElement.style.borderColor = 'transparent';
        }, 2000);
    }
});

function logout() {
    localStorage.removeItem('estimateSystemLoggedIn');
    localStorage.removeItem('estimateSystemUser');
    showLoginPage();
}

// ========== 导航相关 ==========
function initNavigation() {
    const navItems = navList.querySelectorAll('li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');
}

// ========== 文件上传相关 ==========
function initDragDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) handleFileUpload(file);
}

function handleFileUpload(file) {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(docx?|pdf)$/i)) {
        showModal('格式错误', '仅支持 .docx .doc .pdf 格式文件', [
            { text: '确定', class: 'btn-primary', onClick: closeModal }
        ]);
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        showModal('文件过大', '文件大小不能超过 50MB', [
            { text: '确定', class: 'btn-primary', onClick: closeModal }
        ]);
        return;
    }

    const uploadStatus = document.getElementById('uploadStatus');
    const processSteps = document.getElementById('processSteps');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusMessage = document.getElementById('statusMessage');

    uploadStatus.style.display = 'block';
    processSteps.style.display = 'flex';
    fileName.textContent = file.name;
    fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    statusMessage.textContent = '正在上传...';

    // 模拟上传进度
    let progress = 0;
    const uploadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(uploadInterval);
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            statusMessage.textContent = '上传完成！';
            document.getElementById('step1').classList.add('completed');
            document.getElementById('step1').classList.remove('active');
            simulateFileProcessing(file);
        } else {
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
        }
    }, 200);
}

function simulateFileProcessing(file) {
    document.getElementById('step2').classList.add('active');
    document.getElementById('statusMessage').textContent = '正在解析项目说明书...';

    setTimeout(() => {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step2').classList.add('completed');
        document.getElementById('step3').classList.add('active');
        document.getElementById('statusMessage').textContent = '正在提取关键信息并生成模拟清单...';
        
        // 模拟提取项目信息
        extractProjectInfo(file);
        
        setTimeout(() => {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step3').classList.add('completed');
            document.getElementById('step4').classList.add('active');
            document.getElementById('statusMessage').textContent = '正在计算各项指标...';
            
            setTimeout(() => {
                document.getElementById('step4').classList.remove('active');
                document.getElementById('step4').classList.add('completed');
                document.getElementById('statusMessage').textContent = '处理完成！请前往「项目信息」查看提取结果，或直接点击「生成估算概算」';
                document.getElementById('statusMessage').style.color = 'var(--primary-color)';
            }, 800);
        }, 1000);
    }, 1500);
}

function extractProjectInfo(file) {
    // 从文件名推测项目信息（实际场景中会解析文件内容）
    const fileName = file.name.replace(/\.(docx?|pdf)$/i, '');
    
    // 智能提取项目名称
    let projectName = fileName
        .replace(/估算|概算|说明书|项目/g, '')
        .replace(/[_-]+/g, '')
        .trim();
    
    if (!projectName) projectName = '某新建项目';
    document.getElementById('projectName').value = projectName;
    
    // 自动识别业态
    const businessKeywords = {
        '住宅': ['住宅', '小区', '保障房', '安居'],
        '办公': ['办公楼', '写字楼', '商务'],
        '商业': ['商业', '商场', '综合体', '购物中心'],
        '酒店': ['酒店', '宾馆', '公寓'],
        '学校': ['学校', '学院', '幼儿园', '中小学', '教学楼'],
        '医院': ['医院', '医疗', '卫生'],
        '厂房': ['厂房', '车间', '工业'],
        '体育': ['体育馆', '游泳馆', '体育场'],
        '交通': ['车站', '航站', '枢纽', '高铁'],
        '文化': ['图书馆', '博物馆', '剧院']
    };
    
    for (const [biz, keywords] of Object.entries(businessKeywords)) {
        if (keywords.some(k => fileName.includes(k))) {
            document.getElementById('businessType').value = getFirstMatchingOption(biz);
            break;
        }
    }
    
    // 自动填充栋号面积（默认示例数据）
    const buildingInputs = document.querySelectorAll('.building-item');
    if (buildingInputs.length > 0) {
        const firstItem = buildingInputs[0];
        firstItem.querySelector('.building-name-input').value = 'A座';
        firstItem.querySelector('.building-area-input').value = '15000';
        firstItem.querySelector('.building-height-input').value = '54';
    }
    
    onBusinessTypeChange();
}

// ========== 栋号管理 ==========
function addBuilding() {
    const buildingList = document.getElementById('buildingList');
    const index = buildingList.querySelectorAll('.building-item').length;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[index] || (index + 1);
    
    const newBuilding = document.createElement('div');
    newBuilding.className = 'building-item';
    newBuilding.dataset.index = index;
    newBuilding.innerHTML = `
        <div class="building-header">
            <span class="building-name">栋号 ${letter}</span>
            <button class="btn-danger btn-sm" onclick="removeBuilding(this)"><i class="fas fa-trash"></i></button>
        </div>
        <div class="info-item">
            <label>栋号名称</label>
            <input type="text" class="building-name-input" value="${letter}座" placeholder="栋号名称">
        </div>
        <div class="info-item">
            <label>建筑面积（㎡）</label>
            <input type="number" class="building-area-input" placeholder="建筑面积">
        </div>
        <div class="info-item">
            <label>建筑高度（m）</label>
            <input type="number" class="building-height-input" placeholder="建筑高度">
        </div>
    `;
    buildingList.appendChild(newBuilding);
    updateBuildingButtons();
}

function removeBuilding(btn) {
    const items = document.querySelectorAll('.building-item');
    if (items.length <= 1) {
        showModal('提示', '至少保留一个栋号', [{ text: '确定', class: 'btn-primary', onClick: closeModal }]);
        return;
    }
    btn.closest('.building-item').remove();
    updateBuildingButtons();
}

function updateBuildingButtons() {
    const items = document.querySelectorAll('.building-item');
    items.forEach(item => {
        const delBtn = item.querySelector('.btn-danger');
        if (delBtn) delBtn.style.display = items.length > 1 ? 'block' : 'none';
    });
}

// ========== 业态指标预览 ==========
const INDICATORS = {
    '普通住宅': {
        total: { low: 280, mid: 350, high: 420 },
        water: { low: 60, mid: 80, high: 105 },
        hvac: { low: 50, mid: 70, high: 95 },
        electric: { low: 80, mid: 110, high: 145 },
        ratio: [28, 25, 47]
    },
    '高端住宅': {
        total: { low: 500, mid: 680, high: 900 },
        water: { low: 110, mid: 150, high: 200 },
        hvac: { low: 120, mid: 170, high: 230 },
        electric: { low: 150, mid: 200, high: 280 },
        ratio: [26, 29, 45]
    },
    '别墅': {
        total: { low: 600, mid: 850, high: 1200 },
        water: { low: 140, mid: 200, high: 280 },
        hvac: { low: 150, mid: 220, high: 320 },
        electric: { low: 180, mid: 250, high: 360 },
        ratio: [25, 28, 47]
    },
    '普通办公楼': {
        total: { low: 320, mid: 420, high: 550 },
        water: { low: 55, mid: 75, high: 100 },
        hvac: { low: 80, mid: 120, high: 170 },
        electric: { low: 100, mid: 140, high: 190 },
        ratio: [22, 32, 46]
    },
    '甲级写字楼': {
        total: { low: 550, mid: 750, high: 1000 },
        water: { low: 90, mid: 120, high: 160 },
        hvac: { low: 150, mid: 220, high: 310 },
        electric: { low: 170, mid: 240, high: 330 },
        ratio: [19, 34, 47]
    },
    '商业综合体': {
        total: { low: 500, mid: 680, high: 900 },
        water: { low: 90, mid: 120, high: 160 },
        hvac: { low: 130, mid: 200, high: 280 },
        electric: { low: 150, mid: 210, high: 290 },
        ratio: [20, 34, 46]
    },
    '购物中心': {
        total: { low: 420, mid: 580, high: 780 },
        water: { low: 80, mid: 110, high: 150 },
        hvac: { low: 110, mid: 170, high: 240 },
        electric: { low: 130, mid: 180, high: 260 },
        ratio: [20, 33, 47]
    },
    '快捷酒店': {
        total: { low: 380, mid: 500, high: 650 },
        water: { low: 70, mid: 95, high: 130 },
        hvac: { low: 90, mid: 135, high: 190 },
        electric: { low: 100, mid: 140, high: 195 },
        ratio: [21, 30, 49]
    },
    '三星级酒店': {
        total: { low: 500, mid: 680, high: 900 },
        water: { low: 100, mid: 140, high: 190 },
        hvac: { low: 130, mid: 190, high: 270 },
        electric: { low: 140, mid: 200, high: 280 },
        ratio: [20, 31, 49]
    },
    '四星级酒店': {
        total: { low: 680, mid: 900, high: 1200 },
        water: { low: 130, mid: 180, high: 240 },
        hvac: { low: 180, mid: 260, high: 360 },
        electric: { low: 190, mid: 270, high: 380 },
        ratio: [19, 32, 49]
    },
    '五星级酒店': {
        total: { low: 900, mid: 1300, high: 1800 },
        water: { low: 180, mid: 260, high: 360 },
        hvac: { low: 280, mid: 420, high: 600 },
        electric: { low: 280, mid: 400, high: 570 },
        ratio: [18, 33, 49]
    },
    '幼儿园': {
        total: { low: 300, mid: 400, high: 530 },
        water: { low: 65, mid: 90, high: 120 },
        hvac: { low: 70, mid: 105, high: 155 },
        electric: { low: 85, mid: 120, high: 170 },
        ratio: [22, 29, 49]
    },
    '中小学': {
        total: { low: 280, mid: 370, high: 490 },
        water: { low: 55, mid: 75, high: 100 },
        hvac: { low: 60, mid: 90, high: 135 },
        electric: { low: 80, mid: 115, high: 165 },
        ratio: [21, 27, 52]
    },
    '高校教学楼': {
        total: { low: 320, mid: 430, high: 570 },
        water: { low: 55, mid: 75, high: 100 },
        hvac: { low: 80, mid: 120, high: 175 },
        electric: { low: 100, mid: 145, high: 205 },
        ratio: [20, 30, 50]
    },
    '社区医院': {
        total: { low: 380, mid: 500, high: 660 },
        water: { low: 80, mid: 110, high: 150 },
        hvac: { low: 90, mid: 135, high: 195 },
        electric: { low: 110, mid: 155, high: 220 },
        ratio: [21, 29, 50]
    },
    '二甲医院': {
        total: { low: 550, mid: 750, high: 1000 },
        water: { low: 120, mid: 165, high: 225 },
        hvac: { low: 140, mid: 210, high: 300 },
        electric: { low: 160, mid: 225, high: 320 },
        ratio: [20, 31, 49]
    },
    '三甲医院': {
        total: { low: 750, mid: 1050, high: 1450 },
        water: { low: 170, mid: 240, high: 340 },
        hvac: { low: 210, mid: 320, high: 460 },
        electric: { low: 220, mid: 320, high: 460 },
        ratio: [19, 31, 50]
    },
    '体育馆': {
        total: { low: 450, mid: 620, high: 850 },
        water: { low: 80, mid: 110, high: 160 },
        hvac: { low: 130, mid: 200, high: 290 },
        electric: { low: 140, mid: 200, high: 295 },
        ratio: [18, 33, 49]
    },
    '游泳馆': {
        total: { low: 600, mid: 850, high: 1200 },
        water: { low: 200, mid: 300, high: 450 },
        hvac: { low: 160, mid: 250, high: 370 },
        electric: { low: 140, mid: 200, high: 295 },
        ratio: [28, 31, 41]
    },
    '图书馆': {
        total: { low: 400, mid: 550, high: 750 },
        water: { low: 65, mid: 90, high: 130 },
        hvac: { low: 100, mid: 155, high: 225 },
        electric: { low: 120, mid: 175, high: 255 },
        ratio: [18, 31, 51]
    },
    '博物馆': {
        total: { low: 550, mid: 780, high: 1100 },
        water: { low: 90, mid: 130, high: 190 },
        hvac: { low: 160, mid: 250, high: 370 },
        electric: { low: 170, mid: 260, high: 385 },
        ratio: [16, 33, 51]
    },
    '钢结构厂房': {
        total: { low: 200, mid: 280, high: 400 },
        water: { low: 40, mid: 55, high: 80 },
        hvac: { low: 35, mid: 55, high: 90 },
        electric: { low: 70, mid: 100, high: 150 },
        ratio: [20, 22, 58]
    },
    '框架厂房': {
        total: { low: 220, mid: 310, high: 440 },
        water: { low: 45, mid: 60, high: 90 },
        hvac: { low: 40, mid: 65, high: 105 },
        electric: { low: 75, mid: 110, high: 165 },
        ratio: [20, 23, 57]
    },
    '洁净厂房': {
        total: { low: 650, mid: 950, high: 1500 },
        water: { low: 100, mid: 145, high: 220 },
        hvac: { low: 250, mid: 400, high: 650 },
        electric: { low: 180, mid: 270, high: 420 },
        ratio: [13, 43, 44]
    },
    '冷链仓库': {
        total: { low: 450, mid: 650, high: 950 },
        water: { low: 60, mid: 85, high: 130 },
        hvac: { low: 200, mid: 320, high: 500 },
        electric: { low: 110, mid: 160, high: 245 },
        ratio: [13, 49, 38]
    },
    '火车站': {
        total: { low: 500, mid: 700, high: 1000 },
        water: { low: 90, mid: 130, high: 190 },
        hvac: { low: 130, mid: 200, high: 300 },
        electric: { low: 160, mid: 235, high: 350 },
        ratio: [18, 30, 52]
    },
    '高铁站': {
        total: { low: 600, mid: 850, high: 1250 },
        water: { low: 110, mid: 160, high: 235 },
        hvac: { low: 160, mid: 250, high: 385 },
        electric: { low: 190, mid: 285, high: 425 },
        ratio: [17, 30, 53]
    },
    '航站楼': {
        total: { low: 650, mid: 950, high: 1400 },
        water: { low: 120, mid: 175, high: 260 },
        hvac: { low: 200, mid: 320, high: 490 },
        electric: { low: 200, mid: 300, high: 460 },
        ratio: [16, 33, 51]
    },
    '研发楼': {
        total: { low: 450, mid: 620, high: 850 },
        water: { low: 80, mid: 115, high: 160 },
        hvac: { low: 120, mid: 185, high: 275 },
        electric: { low: 140, mid: 210, high: 310 },
        ratio: [18, 31, 51]
    },
    '保障性住房': {
        total: { low: 230, mid: 300, high: 380 },
        water: { low: 50, mid: 65, high: 85 },
        hvac: { low: 40, mid: 55, high: 75 },
        electric: { low: 65, mid: 90, high: 120 },
        ratio: [24, 22, 54]
    },
    '地下车库': {
        total: { low: 280, mid: 400, high: 580 },
        water: { low: 60, mid: 85, high: 125 },
        hvac: { low: 60, mid: 95, high: 150 },
        electric: { low: 100, mid: 145, high: 215 },
        ratio: [20, 28, 52]
    }
};

function getFirstMatchingOption(bizType) {
    const options = {
        '住宅': ['普通住宅', '高端住宅'],
        '办公': ['普通办公楼', '甲级写字楼'],
        '商业': ['商业综合体', '购物中心'],
        '酒店': ['快捷酒店', '四星级酒店'],
        '学校': ['中小学', '高校教学楼'],
        '医院': ['二甲医院', '三甲医院'],
        '厂房': ['框架厂房', '钢结构厂房'],
        '体育': ['体育馆'],
        '交通': ['高铁站'],
        '文化': ['图书馆']
    };
    return options[bizType] ? options[bizType][0] : '';
}

function onBusinessTypeChange() {
    const bizType = document.getElementById('businessType').value;
    const previewValue = document.getElementById('previewValue');
    
    if (bizType && INDICATORS[bizType]) {
        const data = INDICATORS[bizType];
        previewValue.textContent = `${data.total.low}~${data.total.high} 元/㎡`;
    } else {
        previewValue.textContent = '选择业态后显示';
    }
}

// ========== 清单生成 ==========
let generatedData = null;

function generateEstimate() {
    const businessType = document.getElementById('businessType').value;
    const regionFactor = parseFloat(document.getElementById('regionFactor').value);
    
    if (!businessType) {
        showModal('提示', '请先选择项目业态类型', [
            { text: '确定', class: 'btn-primary', onClick: closeModal }
        ]);
        return;
    }
    
    const buildings = [];
    document.querySelectorAll('.building-item').forEach(item => {
        const name = item.querySelector('.building-name-input').value;
        const area = parseFloat(item.querySelector('.building-area-input').value);
        const height = parseFloat(item.querySelector('.building-height-input').value);
        if (name && area) {
            buildings.push({ name, area, height: height || 0 });
        }
    });
    
    if (buildings.length === 0) {
        buildings.push({ name: 'A座', area: 10000, height: 50 });
    }
    
    const totalArea = buildings.reduce((sum, b) => sum + b.area, 0);
    const indicator = INDICATORS[businessType] || INDICATORS['普通住宅'];
    
    // 生成各专业清单
    const waterList = generateWaterList(buildings, indicator, regionFactor);
    const hvacList = generateHvacList(buildings, indicator, regionFactor);
    const electricList = generateElectricList(buildings, indicator, regionFactor);
    
    // 计算各专业总价
    const waterTotal = waterList.reduce((s, i) => s + i.amount, 0);
    const hvacTotal = hvacList.reduce((s, i) => s + i.amount, 0);
    const electricTotal = electricList.reduce((s, i) => s + i.amount, 0);
    const grandTotal = waterTotal + hvacTotal + electricTotal;
    
    generatedData = {
        businessType,
        regionFactor,
        buildings,
        totalArea,
        indicator,
        water: { list: waterList, total: waterTotal },
        hvac: { list: hvacList, total: hvacTotal },
        electric: { list: electricList, total: electricTotal },
        grandTotal
    };
    
    renderTables();
    renderSummary();
    updateSummaryHeader();
    
    switchSection('water');
    document.querySelectorAll('.main-nav li').forEach(li => li.classList.remove('active'));
    document.querySelector('.main-nav li[data-section="water"]').classList.add('active');
    
    showModal('生成完成', `估算概算已生成！<br>总建筑面积：${totalArea.toLocaleString()} ㎡<br>安装总估算价：${(grandTotal/10000).toFixed(2)} 万元<br>综合单方造价：${(grandTotal/totalArea).toFixed(2)} 元/㎡`, [
        { text: '查看给排水清单', class: 'btn-primary', onClick: () => { closeModal(); switchSection('water'); } },
        { text: '查看指标汇总', class: 'btn-secondary', onClick: () => { closeModal(); switchSection('summary'); } }
    ]);
}

// ========== 清单生成函数 ==========
const WATER_CODES = ['安装-给排水-管道-01', '安表-给排水-管道-02', '安装-给排水-阀门-03', '安表-给排水-附件-04', '安表-给排水-设备-05', '安装-给排水-卫生-06', '安表-给排水-保温-07', '安装-给排水-防腐-08'];
const WATER_ITEMS = [
    { name: '室内生活给水管道（PP-R/PE）', unit: 'm', basePrice: 18, density: 0.8 },
    { name: '室内排水管道（UPVC/PVC）', unit: 'm', basePrice: 14, density: 0.7 },
    { name: '室内雨水管道', unit: 'm', basePrice: 16, density: 0.5 },
    { name: '阀门安装（DN≤50）', unit: '个', basePrice: 45, density: 0.15 },
    { name: '阀门安装（DN>50）', unit: '个', basePrice: 120, density: 0.08 },
    { name: '法兰安装', unit: '副', basePrice: 85, density: 0.1 },
    { name: '水表安装', unit: '组', basePrice: 180, density: 0.03 },
    { name: '卫生器具安装（洗脸盆）', unit: '组', basePrice: 220, density: 0.06 },
    { name: '卫生器具安装（坐便器）', unit: '组', basePrice: 280, density: 0.06 },
    { name: '卫生器具安装（蹲便器）', unit: '组', basePrice: 200, density: 0.05 },
    { name: '淋浴器安装', unit: '套', basePrice: 150, density: 0.04 },
    { name: '地漏/清扫口安装', unit: '个', basePrice: 35, density: 0.12 },
    { name: '水箱制作安装', unit: '套', basePrice: 3500, density: 0.02 },
    { name: '变频供水设备', unit: '套', basePrice: 28000, density: 0.01 },
    { name: '无负压供水设备', unit: '套', basePrice: 35000, density: 0.01 },
    { name: '管道保温（橡塑）', unit: 'm³', basePrice: 480, density: 0.1 },
    { name: '管道防腐（刷油）', unit: 'm²', basePrice: 12, density: 0.3 },
    { name: '消火栓箱安装（薄型）', unit: '套', basePrice: 380, density: 0.04 },
    { name: '室内消火栓管道', unit: 'm', basePrice: 22, density: 0.6 },
    { name: '自动喷淋管道', unit: 'm', basePrice: 28, density: 0.7 },
    { name: '湿式报警阀组', unit: '套', basePrice: 2800, density: 0.01 },
    { name: '水流指示器', unit: '个', basePrice: 180, density: 0.03 },
    { name: '喷头安装（闭式）', unit: '个', basePrice: 28, density: 0.4 }
];

const HVAC_CODES = ['安表-暖通-风管-01', '安装-暖通-风管-02', '安装-暖通-风口-03', '安装-暖通-设备-04', '安装-暖通-空调-05', '安表-暖通-采暖-06', '安装-暖通-保温-07', '安装-暖通-防腐-08'];
const HVAC_ITEMS = [
    { name: '镀锌钢板风管（矩形）', unit: 'm²', basePrice: 65, density: 1.2 },
    { name: '镀锌钢板风管（圆形）', unit: 'm²', basePrice: 72, density: 0.8 },
    { name: '螺旋风管', unit: 'm', basePrice: 48, density: 0.6 },
    { name: '铝合金风口安装', unit: '个', basePrice: 85, density: 0.2 },
    { name: '散流器安装', unit: '个', basePrice: 65, density: 0.15 },
    { name: '百叶风口', unit: '个', basePrice: 55, density: 0.15 },
    { name: '电动风口', unit: '个', basePrice: 280, density: 0.05 },
    { name: '风机盘管（卧式暗装）', unit: '台', basePrice: 1800, density: 0.04 },
    { name: '新风机组', unit: '台', basePrice: 12000, density: 0.01 },
    { name: '空气处理机组（AHU）', unit: '台', basePrice: 35000, density: 0.008 },
    { name: '多联机室内机', unit: '台', basePrice: 2200, density: 0.05 },
    { name: '多联机室外机', unit: '台', basePrice: 8000, density: 0.02 },
    { name: '分体壁挂机', unit: '台', basePrice: 1200, density: 0.03 },
    { name: '分体柜机', unit: '台', basePrice: 2800, density: 0.02 },
    { name: '恒温恒湿机组', unit: '台', basePrice: 45000, density: 0.005 },
    { name: '洁净空调机组', unit: '台', basePrice: 65000, density: 0.005 },
    { name: '送风机安装', unit: '台', basePrice: 1500, density: 0.03 },
    { name: '排烟风机', unit: '台', basePrice: 2200, density: 0.03 },
    { name: '正压送风机', unit: '台', basePrice: 1800, density: 0.02 },
    { name: '补风机', unit: '台', basePrice: 1600, density: 0.02 },
    { name: '排风兼排烟阀', unit: '个', basePrice: 180, density: 0.1 },
    { name: '正压送风口', unit: '个', basePrice: 120, density: 0.08 },
    { name: '软接头', unit: '个', basePrice: 45, density: 0.12 },
    { name: '消声器安装', unit: '个', basePrice: 220, density: 0.05 },
    { name: '管道保温（玻璃棉）', unit: 'm³', basePrice: 380, density: 0.15 },
    { name: '管道保温（橡塑）', unit: 'm³', basePrice: 520, density: 0.12 },
    { name: '采暖散热器（钢制）', unit: '组', basePrice: 180, density: 0.08 },
    { name: '采暖散热器（铜铝）', unit: '组', basePrice: 220, density: 0.06 },
    { name: '采暖管道', unit: 'm', basePrice: 20, density: 0.7 },
    { name: '热量表安装', unit: '个', basePrice: 350, density: 0.02 },
    { name: '分集水器', unit: '套', basePrice: 680, density: 0.02 },
    { name: '地暖盘管', unit: 'm²', basePrice: 55, density: 0.5 }
];

const ELECTRIC_CODES = ['安表-电气-配管-01', '安装-电气-配线-02', '安装-电气-电缆-03', '安装-电气-配电-04', '安装-电气-照明-05', '安装-电气-防雷-06', '安表-电气-应急-07', '安表-电气-弱电-08'];
const ELECTRIC_ITEMS = [
    { name: '电气配管（PVC/KBG）', unit: 'm', basePrice: 8, density: 3.0 },
    { name: '电气配管（SC焊接钢管）', unit: 'm', basePrice: 18, density: 1.5 },
    { name: '电气配线（BV导线）', unit: 'm', basePrice: 3, density: 8.0 },
    { name: '照明开关安装', unit: '个', basePrice: 18, density: 0.3 },
    { name: '插座安装', unit: '个', basePrice: 22, density: 0.4 },
    { name: '普通灯具安装', unit: '套', basePrice: 35, density: 0.3 },
    { name: 'LED筒灯安装', unit: '套', basePrice: 65, density: 0.25 },
    { name: 'LED平板灯安装', unit: '套', basePrice: 85, density: 0.2 },
    { name: '应急照明灯', unit: '套', basePrice: 180, density: 0.1 },
    { name: '疏散指示灯', unit: '套', basePrice: 120, density: 0.1 },
    { name: '电缆桥架安装', unit: 'm', basePrice: 65, density: 0.6 },
    { name: '电力电缆（YJV）', unit: 'm', basePrice: 45, density: 1.2 },
    { name: '矿物绝缘电缆', unit: 'm', basePrice: 85, density: 0.5 },
    { name: '低压配电柜', unit: '台', basePrice: 12000, density: 0.015 },
    { name: '动力配电箱', unit: '台', basePrice: 3500, density: 0.03 },
    { name: '照明配电箱', unit: '台', basePrice: 1800, density: 0.04 },
    { name: 'EPS应急电源', unit: '套', basePrice: 8000, density: 0.008 },
    { name: 'UPS不间断电源', unit: '套', basePrice: 12000, density: 0.005 },
    { name: '柴油发电机', unit: '套', basePrice: 180000, density: 0.003 },
    { name: '变压器安装', unit: '台', basePrice: 25000, density: 0.01 },
    { name: '接地母线敷设', unit: 'm', basePrice: 12, density: 1.5 },
    { name: '避雷针安装', unit: '根', basePrice: 280, density: 0.05 },
    { name: '避雷网安装', unit: 'm', basePrice: 18, density: 0.8 },
    { name: '引下线敷设', unit: 'm', basePrice: 15, density: 0.6 },
    { name: '等电位联结', unit: '处', basePrice: 120, density: 0.15 },
    { name: '消防报警主机', unit: '台', basePrice: 15000, density: 0.005 },
    { name: '感烟探测器', unit: '个', basePrice: 85, density: 0.2 },
    { name: '感温探测器', unit: '个', basePrice: 80, density: 0.1 },
    { name: '手动报警按钮', unit: '个', basePrice: 120, density: 0.05 },
    { name: '消防模块', unit: '个', basePrice: 150, density: 0.08 },
    { name: '综合布线配线架', unit: '套', basePrice: 2200, density: 0.02 },
    { name: '网络交换机', unit: '台', basePrice: 3500, density: 0.015 },
    { name: '光纤熔接', unit: '点', basePrice: 35, density: 0.3 },
    { name: '监控摄像机', unit: '台', basePrice: 680, density: 0.06 },
    { name: '门禁系统', unit: '套', basePrice: 1200, density: 0.03 },
    { name: '停车场系统', unit: '套', basePrice: 8000, density: 0.005 }
];

function generateWaterList(buildings, indicator, regionFactor) {
    const totalArea = buildings.reduce((s, b) => s + b.area, 0);
    const totalBudget = indicator.water.mid * totalArea * regionFactor;
    const items = WATER_ITEMS.slice(0, 14 + Math.floor(Math.random() * 4));
    let remaining = totalBudget;
    
    return items.map((item, i) => {
        const ratio = item.density / items.reduce((s, it) => s + it.density, 0);
        let qty, unitPrice, amount;
        
        if (i < items.length - 1) {
            qty = Math.round(totalArea * ratio * (0.8 + Math.random() * 0.4));
            unitPrice = item.basePrice * regionFactor * (0.9 + Math.random() * 0.2);
            amount = qty * unitPrice;
        } else {
            amount = remaining;
            qty = Math.round(remaining / (item.basePrice * regionFactor));
            unitPrice = item.basePrice * regionFactor;
        }
        remaining -= amount;
        
        return {
            code: WATER_CODES[i % WATER_CODES.length],
            name: item.name,
            unit: item.unit,
            qty: qty.toLocaleString(),
            unitPrice: Math.round(unitPrice * 100) / 100,
            amount: Math.round(amount * 100) / 100
        };
    });
}

function generateHvacList(buildings, indicator, regionFactor) {
    const totalArea = buildings.reduce((s, b) => s + b.area, 0);
    const totalBudget = indicator.hvac.mid * totalArea * regionFactor;
    const items = HVAC_ITEMS.slice(0, 18 + Math.floor(Math.random() * 6));
    let remaining = totalBudget;
    
    return items.map((item, i) => {
        const ratio = item.density / items.reduce((s, it) => s + it.density, 0);
        let qty, unitPrice, amount;
        
        if (i < items.length - 1) {
            qty = Math.round(totalArea * ratio * (0.8 + Math.random() * 0.4));
            unitPrice = item.basePrice * regionFactor * (0.9 + Math.random() * 0.2);
            amount = qty * unitPrice;
        } else {
            amount = remaining;
            qty = Math.round(remaining / (item.basePrice * regionFactor));
            unitPrice = item.basePrice * regionFactor;
        }
        remaining -= amount;
        
        return {
            code: HVAC_CODES[i % HVAC_CODES.length],
            name: item.name,
            unit: item.unit,
            qty: qty.toLocaleString(),
            unitPrice: Math.round(unitPrice * 100) / 100,
            amount: Math.round(amount * 100) / 100
        };
    });
}

function generateElectricList(buildings, indicator, regionFactor) {
    const totalArea = buildings.reduce((s, b) => s + b.area, 0);
    const totalBudget = indicator.electric.mid * totalArea * regionFactor;
    const items = ELECTRIC_ITEMS.slice(0, 22 + Math.floor(Math.random() * 8));
    let remaining = totalBudget;
    
    return items.map((item, i) => {
        const ratio = item.density / items.reduce((s, it) => s + it.density, 0);
        let qty, unitPrice, amount;
        
        if (i < items.length - 1) {
            qty = Math.round(totalArea * ratio * (0.8 + Math.random() * 0.4));
            unitPrice = item.basePrice * regionFactor * (0.9 + Math.random() * 0.2);
            amount = qty * unitPrice;
        } else {
            amount = remaining;
            qty = Math.round(remaining / (item.basePrice * regionFactor));
            unitPrice = item.basePrice * regionFactor;
        }
        remaining -= amount;
        
        return {
            code: ELECTRIC_CODES[i % ELECTRIC_CODES.length],
            name: item.name,
            unit: item.unit,
            qty: qty.toLocaleString(),
            unitPrice: Math.round(unitPrice * 100) / 100,
            amount: Math.round(amount * 100) / 100
        };
    });
}

// ========== 表格渲染 ==========
function renderTables() {
    if (!generatedData) return;
    
    renderTable('waterTableBody', generatedData.water.list, generatedData.water.total, generatedData.totalArea, 'water');
    renderTable('hvacTableBody', generatedData.hvac.list, generatedData.hvac.total, generatedData.totalArea, 'hvac');
    renderTable('electricTableBody', generatedData.electric.list, generatedData.electric.total, generatedData.totalArea, 'electric');
}

function renderTable(tbodyId, items, total, totalArea, type) {
    const tbody = document.getElementById(tbodyId);
    let html = '';
    let runningTotal = 0;
    
    items.forEach((item, i) => {
        runningTotal += item.amount;
        html += `<tr>
            <td>${i + 1}</td>
            <td><code>${item.code}</code></td>
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td>${item.qty}</td>
            <td>${item.unitPrice.toLocaleString()}</td>
            <td>${item.amount.toLocaleString()}</td>
            <td>-</td>
        </tr>`;
    });
    
    html += `<tr class="total-row">
        <td colspan="5"><strong>合计</strong></td>
        <td>-</td>
        <td><strong>${total.toLocaleString()}</strong></td>
        <td>-</td>
    </tr>`;
    
    tbody.innerHTML = html;
    
    // 更新汇总卡片
    const costPerSqm = document.getElementById(type + 'CostPerSqm');
    const costRatio = document.getElementById(type + 'CostRatio');
    if (costPerSqm) costPerSqm.textContent = (total / totalArea).toFixed(2) + ' 元/㎡';
    if (costRatio) costRatio.textContent = ((total / generatedData.grandTotal) * 100).toFixed(1) + '%';
    
    document.getElementById(type + 'CostSummary').style.display = 'flex';
    document.getElementById(type + 'TotalArea').textContent = '总建筑面积：' + totalArea.toLocaleString() + '㎡';
    document.getElementById(type + 'TotalCost').textContent = '估算总价：' + (total/10000).toFixed(2) + '万元';
}

// ========== 汇总页渲染 ==========
function renderSummary() {
    if (!generatedData) return;
    const { businessType, buildings, totalArea, grandTotal, water, hvac, electric } = generatedData;
    
    document.getElementById('summaryProjectName').textContent = document.getElementById('projectName').value || '未命名项目';
    document.getElementById('summaryBusinessType').textContent = businessType;
    document.getElementById('summaryBuildingCount').textContent = buildings.length + ' 栋';
    document.getElementById('summaryTotalArea').textContent = totalArea.toLocaleString() + ' ㎡';
    document.getElementById('summaryTotalCost').textContent = (grandTotal / 10000).toFixed(2) + ' 万元';
    document.getElementById('summaryCostPerSqm').textContent = (grandTotal / totalArea).toFixed(2) + ' 元/㎡';
    
    // 栋号汇总表
    const btbody = document.getElementById('buildingSummaryBody');
    let bhtml = '';
    buildings.forEach(b => {
        const waterCost = (water.total * b.area / totalArea);
        const hvacCost = (hvac.total * b.area / totalArea);
        const elecCost = (electric.total * b.area / totalArea);
        const subTotal = waterCost + hvacCost + elecCost;
        bhtml += `<tr>
            <td>${b.name}</td>
            <td>${b.area.toLocaleString()}</td>
            <td>${(waterCost / b.area).toFixed(2)}</td>
            <td>${(hvacCost / b.area).toFixed(2)}</td>
            <td>${(elecCost / b.area).toFixed(2)}</td>
            <td><strong>${(subTotal / b.area).toFixed(2)}</strong></td>
            <td>${(subTotal / 10000).toFixed(2)}</td>
        </tr>`;
    });
    bhtml += `<tr class="total-row">
        <td><strong>合计</strong></td>
        <td><strong>${totalArea.toLocaleString()}</strong></td>
        <td><strong>${(water.total / totalArea).toFixed(2)}</strong></td>
        <td><strong>${(hvac.total / totalArea).toFixed(2)}</strong></td>
        <td><strong>${(electric.total / totalArea).toFixed(2)}</strong></td>
        <td><strong>${(grandTotal / totalArea).toFixed(2)}</strong></td>
        <td><strong>${(grandTotal / 10000).toFixed(2)}</strong></td>
    </tr>`;
    btbody.innerHTML = bhtml;
    
    // 专业汇总表
    const stbody = document.getElementById('specSummaryBody');
    const specs = [
        { name: '给排水工程', total: water.total, perSqm: water.total / totalArea, ratio: water.total / grandTotal },
        { name: '暖通工程', total: hvac.total, perSqm: hvac.total / totalArea, ratio: hvac.total / grandTotal },
        { name: '电气工程', total: electric.total, perSqm: electric.total / totalArea, ratio: electric.total / grandTotal }
    ];
    stbody.innerHTML = specs.map(s => `<tr>
        <td>${s.name}</td>
        <td>${(s.total / 10000).toFixed(2)} 万元</td>
        <td>${s.perSqm.toFixed(2)} 元/㎡</td>
        <td>${(s.ratio * 100).toFixed(1)}%</td>
    </tr>`).join('') + `<tr class="total-row">
        <td><strong>安装总计</strong></td>
        <td><strong>${(grandTotal / 10000).toFixed(2)} 万元</strong></td>
        <td><strong>${(grandTotal / totalArea).toFixed(2)} 元/㎡</strong></td>
        <td><strong>100%</strong></td>
    </tr>`;
    
    // 饼图
    renderPieChart(water.total, hvac.total, electric.total);
}

function updateSummaryHeader() {
    if (!generatedData) return;
    // 已在renderSummary中更新
}

function renderPieChart(waterTotal, hvacTotal, electricTotal) {
    const total = waterTotal + hvacTotal + electricTotal;
    document.getElementById('legendWater').textContent = (waterTotal / 10000).toFixed(1) + '万 (' + (waterTotal/total*100).toFixed(0) + '%)';
    document.getElementById('legendHvac').textContent = (hvacTotal / 10000).toFixed(1) + '万 (' + (hvacTotal/total*100).toFixed(0) + '%)';
    document.getElementById('legendElectric').textContent = (electricTotal / 10000).toFixed(1) + '万 (' + (electricTotal/total*100).toFixed(0) + '%)';
    
    document.getElementById('chartPlaceholder').style.display = 'none';
    document.getElementById('pieChart').style.display = 'flex';
    
    const canvas = document.getElementById('pieCanvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 80;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const data = [waterTotal, hvacTotal, electricTotal];
    const colors = ['#1a5e63', '#4ecdc4', '#ff6b6b'];
    let startAngle = -Math.PI / 2;
    
    data.forEach((val, i) => {
        const slice = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        startAngle += slice;
    });
    
    // 中心白色
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((total/10000).toFixed(1) + '万', cx, cy - 6);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('安装总价', cx, cy + 10);
}

// ========== Excel导出 ==========
function exportToExcel(type) {
    if (!generatedData) {
        showModal('提示', '请先生成估算概算', [{ text: '确定', class: 'btn-primary', onClick: closeModal }]);
        return;
    }
    
    const specNames = { water: '给排水工程', hvac: '暖通工程', electric: '电气工程' };
    const specData = generatedData[type];
    
    const wsData = [
        [document.getElementById('projectName').value || '未命名项目'] + Array(7).fill(''),
        [`${specNames[type]}模拟清单`] + Array(7).fill(''),
        ['序号', '清单编码', '清单名称', '单位', '工程量', '综合单价(元)', '合价(元)', '备注'],
        ...specData.list.map((item, i) => [
            i + 1, item.code, item.name, item.unit, item.qty, item.unitPrice, item.amount, ''
        ]),
        ['合计', '', '', '', '', '', specData.total, '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, specNames[type]);
    
    const fileName = `${document.getElementById('projectName').value || '项目'}_${specNames[type]}_模拟清单.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function exportAllToExcel() {
    if (!generatedData) {
        showModal('提示', '请先生成估算概算', [{ text: '确定', class: 'btn-primary', onClick: closeModal }]);
        return;
    }
    
    const projectName = document.getElementById('projectName').value || '未命名项目';
    const businessType = generatedData.businessType;
    const totalArea = generatedData.totalArea;
    const regionFactor = generatedData.regionFactor;
    const grandTotal = generatedData.grandTotal;
    
    const wb = XLSX.utils.book_new();
    
    // Sheet1: 汇总
    const summaryData = [
        [projectName + ' 安装工程估算概算'],
        [],
        ['项目业态', businessType],
        ['地区系数', regionFactor],
        ['总建筑面积(㎡)', totalArea],
        ['安装总估算价(万元)', (grandTotal / 10000).toFixed(2)],
        ['综合单方造价(元/㎡)', (grandTotal / totalArea).toFixed(2)],
        [],
        ['专业', '估算价(万元)', '单方造价(元/㎡)', '占比'],
        ['给排水工程', (generatedData.water.total / 10000).toFixed(2), (generatedData.water.total / totalArea).toFixed(2), (generatedData.water.total / grandTotal * 100).toFixed(1) + '%'],
        ['暖通工程', (generatedData.hvac.total / 10000).toFixed(2), (generatedData.hvac.total / totalArea).toFixed(2), (generatedData.hvac.total / grandTotal * 100).toFixed(1) + '%'],
        ['电气工程', (generatedData.electric.total / 10000).toFixed(2), (generatedData.electric.total / totalArea).toFixed(2), (generatedData.electric.total / grandTotal * 100).toFixed(1) + '%'],
        ['合计', (grandTotal / 10000).toFixed(2), (grandTotal / totalArea).toFixed(2), '100%'],
        [],
        ['栋号', '建筑面积(㎡)', '给排水(元/㎡)', '暖通(元/㎡)', '电气(元/㎡)', '小计(元/㎡)', '估算价(万元)'],
        ...generatedData.buildings.map(b => {
            const wc = generatedData.water.total * b.area / totalArea;
            const hc = generatedData.hvac.total * b.area / totalArea;
            const ec = generatedData.electric.total * b.area / totalArea;
            return [b.name, b.area, (wc/b.area).toFixed(2), (hc/b.area).toFixed(2), (ec/b.area).toFixed(2), ((wc+hc+ec)/b.area).toFixed(2), ((wc+hc+ec)/10000).toFixed(2)];
        })
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, '指标汇总');
    
    // Sheet2-4: 各专业清单
    ['water', 'hvac', 'electric'].forEach(type => {
        const specNames = { water: '给排水', hvac: '暖通', electric: '电气' };
        const specData = generatedData[type];
        const listData = [
            ['清单编码', '清单名称', '单位', '工程量', '综合单价(元)', '合价(元)'],
            ...specData.list.map(item => [item.code, item.name, item.unit, item.qty, item.unitPrice, item.amount]),
            ['', '合计', '', '', '', specData.total]
        ];
        const ws = XLSX.utils.aoa_to_sheet(listData);
        XLSX.utils.book_append_sheet(wb, ws, specNames[type] + '清单');
    });
    
    XLSX.writeFile(wb, `${projectName}_安装估算概算.xlsx`);
}

// ========== 重置 ==========
function resetProject() {
    showModal('确认重置', '确定要清空所有输入数据吗？', [
        { text: '取消', class: 'btn-secondary', onClick: closeModal },
        { text: '确认重置', class: 'btn-danger', onClick: () => {
            document.querySelectorAll('#section-info input, #section-info select').forEach(el => {
                if (el.type === 'checkbox') el.checked = false;
                else el.value = '';
            });
            document.getElementById('indicatorPreview').querySelector('.preview-value').textContent = '选择业态后显示';
            generatedData = null;
            ['waterTableBody', 'hvacTableBody', 'electricTableBody', 'buildingSummaryBody', 'specSummaryBody'].forEach(id => {
                document.getElementById(id).innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-inbox"></i> 请先生成估算概算</td></tr>';
            });
            document.querySelectorAll('.cost-summary').forEach(el => el.style.display = 'none');
            document.getElementById('chartPlaceholder').style.display = 'flex';
            document.getElementById('pieChart').style.display = 'none';
            document.querySelectorAll('.indicator-tag').forEach(el => {
                if (el.id.includes('TotalArea')) el.textContent = '总建筑面积：-';
                else if (el.id.includes('TotalCost')) el.textContent = '估算总价：-';
            });
            document.getElementById('uploadStatus').style.display = 'none';
            document.getElementById('processSteps').style.display = 'none';
            document.getElementById('step1').className = 'step';
            document.getElementById('step2').className = 'step';
            document.getElementById('step3').className = 'step';
            document.getElementById('step4').className = 'step';
            closeModal();
        }}
    ]);
}

// ========== 模态框 ==========
function showModal(title, body, buttons) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '';
    (buttons || []).forEach(btn => {
        const b = document.createElement('button');
        b.className = btn.class;
        b.textContent = btn.text;
        if (btn.onClick) b.onclick = btn.onClick;
        footer.appendChild(b);
    });
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
