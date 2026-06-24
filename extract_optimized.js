function extractProjectInfo(text) {
    const info = {
        name: '',
        totalArea: 0,
        aboveArea: 0,
        belowArea: 0,
        classes: 0,
        buildings: [],
        bizType: '学校类',
        mep: {
            给排水: { 系统: [], 管材: [], 设备: [] },
            暖通: { 系统: [], 管材: [], 设备: [] },
            电气: { 系统: [], 管材: [], 设备: [] },
            弱电: { 系统: [], 管材: [], 设备: [] },
            消防: { 系统: [], 管材: [], 设备: [] }
        },
        warnings: []
    };

    // 预处理：统一换行符
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // ========== 第一步：快速预扫描（只遍历一次文本）==========
    // 将文本按行分割，用于快速定位关键行
    const lines = text.split('\n');
    const keywordLines = {}; // 存储包含特定关键词的行

    // 定义关键词类别
    const keyCategories = {
        '建筑': ['建筑面积', '总建筑面积', '地上建筑面积', '地下建筑面积', 'm2', '㎡', '平方米'],
        '给排水': ['给水', '排水', '消火栓', '喷淋', '消防', '管材', '泵', '水箱', '阀门'],
        '暖通': ['暖通', '空调', '通风', '供暖', '冷热源', '风机', '风管', '风口', '盘管'],
        '电气': ['电气', '配电', '照明', '变压器', '开关柜', '电缆', '防雷', 'EPS', 'UPS', '发电机'],
        '弱电': ['弱电', '综合布线', '网络', '监控', '门禁', '广播', '安防', '智能化'],
        '消防': ['火灾', '报警', '探测器', '联动', '疏散', '广播']
    };

    // 预扫描：按类别收集相关行（只遍历一次）
    for (const cat of Object.keys(keyCategories)) {
        keywordLines[cat] = [];
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineUpper = line.toUpperCase();
        for (const cat of Object.keys(keyCategories)) {
            for (const kw of keyCategories[cat]) {
                if (lineUpper.includes(kw.toUpperCase())) {
                    keywordLines[cat].push(line);
                    break;
                }
            }
        }
    }

    // 合并所有建筑相关行
    const buildingLines = keywordLines['建筑'].join('\n');
    const waterLines = keywordLines['给排水'].join('\n');
    const hvacLines = keywordLines['暖通'].join('\n');
    const elecLines = keywordLines['电气'].join('\n');
    const weakLines = keywordLines['弱电'].join('\n');
    const fireLines = keywordLines['消防'].join('\n');
    const allMepLines = waterLines + '\n' + hvacLines + '\n' + elecLines + '\n' + weakLines + '\n' + fireLines;

    // ========== 第二步：提取建筑面积（优先从表格行）==========
    // 高效匹配表格格式的建筑面积
    const areaPatterns = [
        // 标准表格格式：|建筑面积|建筑面积|建筑面积|m2|数字|
        /\|建筑面积\|建筑面积\|建筑面积\|[^|]*m2[^|]*\|(\d{5,6})\||gi,
        // 含地上地下行的表格
        /\|(?:地上|地下)?建筑面积\|[^|]*\|[^|]*\|[^|]*m2[^|]*\|(\d{4,6})\||gi,
        // 行内数字格式
        /(?:总|建筑)面积[^\d]{0,10}(\d{5,6})/gi
    ];

    for (const pattern of areaPatterns) {
        pattern.lastIndex = 0; // 重置正则状态
        const match = buildingLines.match(pattern);
        if (match && match.length > 0) {
            // 取最后一个匹配（通常是总计行）
            const lastMatch = match[match.length - 1];
            const numMatch = lastMatch.match(/(\d{5,6})/);
            if (numMatch) {
                const area = parseInt(numMatch[1]);
                if (area >= 10000 && area <= 200000) {
                    info.totalArea = area;
                    break;
                }
            }
        }
    }

    // 提取地上/地下面积
    const aboveMatch = buildingLines.match(/地上建筑面积[^\d]{0,10}(\d{4,6})/i);
    if (aboveMatch) info.aboveArea = parseInt(aboveMatch[1]);

    const belowMatch = buildingLines.match(/地下建筑面积[^\d]{0,10}(\d{4,6})/i);
    if (belowMatch) info.belowArea = parseInt(belowMatch[1]);

    // ========== 第三步：提取栋号信息 ==========
    // 综合教学楼
    if (/教学楼|综合楼/i.test(buildingLines)) {
        const jzxMatch = buildingLines.match(/教学楼[^|\n]{0,30}\s*(\d{5})/i);
        if (jzxMatch) {
            const area = parseInt(jzxMatch[1]);
            if (area >= 5000 && area <= 50000) {
                info.buildings.push({ name: '综合教学楼', area, floors: '地上5层局部4层' });
            }
        }
    }

    // 地下车库
    if (/地下/i.test(buildingLines)) {
        const ugMatch = buildingLines.match(/地下[^|\n]{0,20}\s*(\d{4,6})/i);
        if (ugMatch) {
            const area = parseInt(ugMatch[1]);
            if (area >= 1000 && area <= 50000) {
                info.buildings.push({ name: '地下车库及设备用房', area, floors: '地下1层' });
            }
        }
    }

    // ========== 第四步：提取项目名称 ==========
    const nameMatch = text.match(/天津市[^\n，,。]{0,50}(?:完全中学|中学|小学|学校|幼儿园)[^\n，,。]{0,20}/);
    if (nameMatch) {
        info.name = nameMatch[0].replace(/\s+/g, '').substring(0, 60);
    } else {
        // 备选：提取第一个"天津市"开头的较长文本
        const altMatch = text.match(/天津市[^\n]{10,60}/);
        if (altMatch) {
            info.name = altMatch[0].replace(/\s+/g, '').substring(0, 60);
        }
    }

    // ========== 第五步：提取教学班数 ==========
    const classMatch = text.match(/(?:初中部|小学部|共|总)[^\d]{0,20}(\d{2})[^\d]{0,5}班/);
    if (classMatch) {
        info.classes = parseInt(classMatch[1]);
    }

    // ========== 第六步：给排水专业提取 ==========
    const jpsSys = [], jpsMat = [], jpsEq = [];

    // 给水系统（使用预扫描结果）
    if (/市政供水|市政直供|直供/i.test(waterLines)) jpsSys.push('市政直供');
    if (/变频供水|变频调速/i.test(waterLines)) jpsSys.push('变频供水');
    if (/无负压/i.test(waterLines)) jpsSys.push('无负压供水');
    if (/太阳能热水|太阳能供水/i.test(waterLines)) jpsSys.push('太阳能热水系统');
    if (/空气源.*热水|热水.*空气源/i.test(waterLines)) jpsSys.push('空气源热泵热水');
    if (/中水回用|中水系统/i.test(waterLines)) jpsSys.push('中水回用系统');
    if (/雨水回收|雨水利用/i.test(waterLines)) jpsSys.push('雨水收集系统');

    // 消防系统（同时记录到消防）
    if (/室内消火栓|消火栓系统/i.test(waterLines)) {
        jpsSys.push('室内消火栓系统');
        info.消防.系统.push('室内消火栓系统');
    }
    if (/自动喷水|自动喷淋|喷淋系统/i.test(waterLines)) {
        jpsSys.push('自动喷淋系统');
        info.消防.系统.push('自动喷淋系统');
    }
    if (/大空间智能|智能灭火/i.test(waterLines)) {
        jpsSys.push('大空间智能灭火系统');
        info.消防.系统.push('大空间智能灭火系统');
    }
    if (/气体灭火/i.test(waterLines)) {
        jpsSys.push('气体灭火系统');
        info.消防.系统.push('气体灭火系统');
    }
    if (/灭火器/i.test(waterLines)) info.消防.系统.push('建筑灭火器配置');

    // 管材
    if (/衬塑钢管/i.test(waterLines)) jpsMat.push('衬塑钢管');
    if (/球墨铸铁管/i.test(waterLines)) jpsMat.push('给水球墨铸铁管');
    if (/热镀锌|热浸锌/i.test(waterLines)) jpsMat.push('热浸锌镀锌钢管');
    if (/HDPE|双壁波纹管/i.test(waterLines)) jpsMat.push('HDPE双壁波纹管');
    if (/不锈钢/i.test(waterLines)) jpsMat.push('S31603不锈钢');

    // 设备
    if (/变频.*泵|加压泵/i.test(waterLines)) jpsEq.push('变频生活加压泵组');
    if (/消防水池|消防水箱/i.test(waterLines)) {
        const capMatch = waterLines.match(/(\d+)[^\d]*(?:立方|m³|m3)/);
        if (capMatch) {
            jpsEq.push(`消防水池${capMatch[1]}m³`);
            info.消防.设备.push(`消防水池${capMatch[1]}m³`);
        } else {
            jpsEq.push('消防水池');
            info.消防.设备.push('消防水池');
        }
    }
    if (/紫外线消毒/i.test(waterLines)) jpsEq.push('紫外线消毒器');

    info.给排水.系统 = [...new Set(jpsSys)].slice(0, 6);
    info.给排水.管材 = [...new Set(jpsMat)].slice(0, 4);
    info.给排水.设备 = [...new Set(jpsEq)].slice(0, 4);

    // ========== 第七步：暖通专业提取 ==========
    const ntSys = [], ntMat = [], ntEq = [];

    // 冷热源
    if (/地源热泵/i.test(hvacLines)) ntSys.push('地源热泵');
    if (/空气源热泵/i.test(hvacLines)) ntSys.push('空气源热泵');
    if (/冷水机组/i.test(hvacLines)) ntSys.push('冷水机组');
    if (/VRV|多联机/i.test(hvacLines)) ntSys.push('VRV多联机');
    if (/风机盘管/i.test(hvacLines)) ntSys.push('风机盘管+新风');
    if (/分体空调/i.test(hvacLines)) ntSys.push('分体空调');

    // 供暖
    if (/散热器|暖气片/i.test(hvacLines)) ntSys.push('散热器供暖');
    if (/地板辐射|地采暖|地热采暖/i.test(hvacLines)) ntSys.push('地板辐射供暖');
    if (/集中供暖|供暖系统/i.test(hvacLines) && !/散热器|地板/.test(hvacLines)) ntSys.push('集中供暖系统');

    // 通风防排烟
    if (/机械通风|机械排风/i.test(hvacLines)) ntSys.push('机械通风系统');
    if (/自然通风/i.test(hvacLines)) ntSys.push('自然通风');
    if (/正压送风|机械排烟|防排烟/i.test(hvacLines)) {
        ntSys.push('防排烟系统');
        info.消防.系统.push('防排烟系统');
    }
    if (/地下车库.*排风|车库.*排烟/i.test(hvacLines)) ntSys.push('车库排风排烟系统');
    if (/换气.*次/i.test(hvacLines)) ntSys.push('换气通风系统');

    // 管材保温
    if (/无缝钢管/i.test(hvacLines)) ntMat.push('无缝钢管');
    if (/橡塑保温|保温材料/i.test(hvacLines)) ntMat.push('橡塑保温');
    if (/保温.*3cm|3cm.*保温/i.test(hvacLines)) ntMat.push('3cm厚橡塑保温');

    // 设备
    if (/热力入户|换热站/i.test(hvacLines)) ntEq.push('换热机组');
    if (/空气幕/i.test(hvacLines)) ntEq.push('电热型空气幕');
    if (/CO.*监测|浓度监测/i.test(hvacLines)) ntEq.push('CO浓度监测装置');

    info.暖通.系统 = [...new Set(ntSys)].slice(0, 6);
    info.暖通.管材 = [...new Set(ntMat)].slice(0, 3);
    info.暖通.设备 = [...new Set(ntEq)].slice(0, 4);

    // ========== 第八步：电气专业提取 ==========
    const dqSys = [], dqMat = [], dqEq = [];

    // 供配电
    if (/10kV|10KV/i.test(elecLines)) dqSys.push('10kV高压供电');
    if (/双路电源|双重电源/i.test(elecLines)) dqSys.push('双路电源供电');
    if (/柴油发电机|柴发/i.test(elecLines)) {
        dqSys.push('柴油发电机备用电源');
        dqEq.push('柴油发电机');
    }
    if (/TN-S|TN-S系统/i.test(elecLines)) dqSys.push('TN-S配电系统');
    if (/树干式|放射式|混合式/i.test(elecLines)) dqSys.push('配电系统');

    // 照明
    if (/LED.*灯|节能灯具/i.test(elecLines)) dqSys.push('LED节能照明');
    if (/应急照明|疏散照明/i.test(elecLines)) dqSys.push('应急照明系统');
    if (/集中控制型.*应急|智能应急/i.test(elecLines)) dqSys.push('集中控制型应急照明');

    // 变压器
    const transMatch = elecLines.match(/(\d+)kVA[^\d]*变压器|变压器[^\d]*(\d+)kVA/i);
    if (transMatch) {
        const cap = transMatch[1] || transMatch[2];
        dqEq.push(`${cap}kVA变压器`);
        info.电气.系统.push(`变压器容量${cap}kVA`);
    }

    // 管材
    if (/矿物绝缘.*电缆|柔性矿物绝缘/i.test(elecLines)) dqMat.push('矿物绝缘电缆');
    if (/耐火电缆/i.test(elecLines)) dqMat.push('耐火电缆');
    if (/阻燃电缆|阻燃导线/i.test(elecLines)) dqMat.push('阻燃电缆/导线');
    if (/WDZ-YJY|WDZ-BYJ/i.test(elecLines)) dqMat.push('WDZ低烟无卤电缆');
    if (/铜芯/i.test(elecLines)) dqMat.push('铜芯电缆');

    // 防雷
    if (/二类防雷|防雷建筑/i.test(elecLines)) dqSys.push('二类防雷建筑');
    if (/接闪带|接闪杆|接闪网/i.test(elecLines)) dqSys.push('接闪带/杆/网防雷');
    if (/防雷接地/i.test(elecLines)) dqSys.push('防雷接地系统');

    // EPS/UPS
    if (/EPS.*供电|EPS电源/i.test(elecLines)) dqEq.push('EPS应急电源');
    if (/UPS|不间断电源/i.test(elecLines)) dqEq.push('UPS不间断电源');

    info.电气.系统 = [...new Set(dqSys)].slice(0, 6);
    info.电气.管材 = [...new Set(dqMat)].slice(0, 4);
    info.电气.设备 = [...new Set(dqEq)].slice(0, 4);

    // ========== 第九步：弱电专业提取 ==========
    const rdSys = [], rdMat = [], rdEq = [];

    // 综合布线
    if (/综合布线/i.test(weakLines)) rdSys.push('综合布线系统');
    if (/光纤入室|全光网络/i.test(weakLines)) rdSys.push('全光网络');
    if (/超六类|六类网线/i.test(weakLines)) rdMat.push('超六类网线');
    if (/光纤|光缆/i.test(weakLines)) rdMat.push('光纤/光缆');

    // 网络系统
    if (/校园内网|校园外网|设备网/i.test(weakLines)) rdSys.push('校园网络系统');
    if (/Wi-Fi|WiFi|无线网络/i.test(weakLines)) rdSys.push('Wi-Fi 6无线覆盖');
    if (/核心交换机|OLT/i.test(weakLines)) rdEq.push('核心交换机/OLT设备');

    // 安防系统
    if (/视频监控/i.test(weakLines)) rdSys.push('视频监控系统');
    if (/门禁/i.test(weakLines)) rdSys.push('门禁管理系统');
    if (/入侵报警|周界报警|电子围栏/i.test(weakLines)) rdSys.push('入侵报警系统');
    if (/停车场|车牌识别/i.test(weakLines)) rdSys.push('停车场管理系统');
    if (/电子巡查|巡更/i.test(weakLines)) rdSys.push('电子巡查系统');

    // 广播
    if (/公共广播|教学广播/i.test(weakLines)) {
        rdSys.push('公共广播系统');
        info.消防.系统.push('消防应急广播');
    }
    if (/信息发布|LED显示/i.test(weakLines)) rdSys.push('信息发布系统');
    if (/能耗监测/i.test(weakLines)) rdSys.push('能耗监测系统');
    if (/多媒体教学|智慧教学/i.test(weakLines)) rdSys.push('多媒体教学系统');
    if (/一卡通/i.test(weakLines)) rdSys.push('校园一卡通系统');

    info.弱电.系统 = [...new Set(rdSys)].slice(0, 8);
    info.弱电.管材 = [...new Set(rdMat)].slice(0, 3);
    info.弱电.设备 = [...new Set(rdEq)].slice(0, 3);

    // ========== 第十步：消防专业补充提取 ==========
    // 火灾自动报警
    if (/火灾自动报警|集中报警/i.test(fireLines)) {
        info.消防.系统.push('火灾自动报警系统');
        const fireEq = [];
        if (/感烟探测器/i.test(fireLines)) fireEq.push('感烟探测器');
        if (/感温探测器/i.test(fireLines)) fireEq.push('感温探测器');
        if (/手动报警|报警按钮/i.test(fireLines)) fireEq.push('手动报警按钮');
        if (/消防电话/i.test(fireLines)) fireEq.push('消防电话系统');
        if (/声光警报|声光报警/i.test(fireLines)) fireEq.push('声光警报器');
        if (fireEq.length > 0) info.消防.设备.push(...fireEq.slice(0, 3));
    }
    if (/消防联动|联动控制/i.test(fireLines)) info.消防.系统.push('消防联动控制系统');
    if (/电气火灾监控/i.test(fireLines)) info.消防.系统.push('电气火灾监控系统');
    if (/防火门监控/i.test(fireLines)) info.消防.系统.push('防火门监控系统');
    if (/消防电源监控/i.test(fireLines)) info.消防.系统.push('消防电源监控系统');

    // 去重
    info.消防.系统 = [...new Set(info.消防.系统)].slice(0, 8);
    info.消防.设备 = [...new Set(info.消防.设备)].slice(0, 5);

    // ========== 第十一步：从Markdown表格解析主要设备材料表 ==========
    const deviceTableEquipments = parseDeviceTables(text);
    if (deviceTableEquipments) {
        if (deviceTableEquipments.给排水 && deviceTableEquipments.给排水.length > 0) {
            const existing = info.给排水.设备 || [];
            info.给排水.设备 = [...new Set([...existing, ...deviceTableEquipments.给排水])].slice(0, 10);
        }
        if (deviceTableEquipments.暖通 && deviceTableEquipments.暖通.length > 0) {
            const existing = info.暖通.设备 || [];
            info.暖通.设备 = [...new Set([...existing, ...deviceTableEquipments.暖通])].slice(0, 8);
        }
        if (deviceTableEquipments.电气 && deviceTableEquipments.电气.length > 0) {
            const existing = info.电气.设备 || [];
            info.电气.设备 = [...new Set([...existing, ...deviceTableEquipments.电气])].slice(0, 12);
        }
        if (deviceTableEquipments.弱电 && deviceTableEquipments.弱电.length > 0) {
            const existing = info.弱电.设备 || [];
            info.弱电.设备 = [...new Set([...existing, ...deviceTableEquipments.弱电])].slice(0, 8);
        }
        if (deviceTableEquipments.消防 && deviceTableEquipments.消防.length > 0) {
            const existing = info.消防.设备 || [];
            info.消防.设备 = [...new Set([...existing, ...deviceTableEquipments.消防])].slice(0, 10);
        }
    }

    // ========== 第十二步：生成警告 ==========
    if (info.totalArea === 0) info.warnings.push('总建筑面积未识别');
    if (info.buildings.length === 0) info.warnings.push('栋号信息未识别');
    if (!info.name) info.warnings.push('项目名称未识别');

    return info;
}
