export const leatherTypes = [
  {
    id: 'vegetable',
    name: '植鞣革',
    desc: '头层牛皮，天然环保，越用越有光泽',
    colorVariation: '颜色会随使用时间逐渐加深',
    extraDays: 0
  },
  {
    id: 'crazyhorse',
    name: '疯马皮',
    desc: '复古油蜡质感，划痕可用手抚平',
    colorVariation: '表面有自然划痕，属正常工艺特征',
    extraDays: 1
  },
  {
    id: 'fullgrain',
    name: '荔枝纹',
    desc: '颗粒饱满，耐磨防刮，易打理',
    colorVariation: '纹理清晰，颜色均匀稳定',
    extraDays: 0
  }
]

export const leatherColors = [
  { id: 'tan', name: '蜜蜡棕', hex: '#C4956A', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', price: 0, type: 'vegetable' },
  { id: 'black', name: '经典黑', hex: '#2C2C2C', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&h=200&fit=crop', price: 0, type: 'vegetable' },
  { id: 'burgundy', name: '酒红色', hex: '#7B2D26', image: 'https://images.unsplash.com/photo-1586953208270-767889fa9b6f?w=200&h=200&fit=crop', price: 30, type: 'crazyhorse' },
  { id: 'navy', name: '深海蓝', hex: '#1E3A5F', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop', price: 30, type: 'fullgrain' },
  { id: 'green', name: '森林绿', hex: '#2D5A3D', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=200&h=200&fit=crop', price: 50, type: 'fullgrain' },
  { id: 'cognac', name: '干邑色', hex: '#8B4513', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop', price: 40, type: 'crazyhorse' }
]

export const threadColors = [
  { id: 'beige', name: '米色', hex: '#D4B896', desc: '经典百搭' },
  { id: 'brown', name: '棕色', hex: '#8B4513', desc: '复古稳重' },
  { id: 'black', name: '黑色', hex: '#2C2C2C', desc: '低调沉稳' },
  { id: 'navy', name: '藏蓝', hex: '#1E3A5F', desc: '优雅精致' },
  { id: 'crimson', name: '酒红', hex: '#7B2D26', desc: '热情喜庆' },
  { id: 'gold', name: '金色', hex: '#D4AF37', desc: '华丽亮眼' }
]

export const textures = [
  { id: 'smooth', name: '平纹', desc: '细腻光滑，经典之选', pattern: 'none' },
  { id: 'grained', name: '荔枝纹', desc: '颗粒饱满，触感丰富', pattern: 'grained' },
  { id: 'pebbled', name: '卵石纹', desc: '圆润纹路，耐磨防刮', pattern: 'pebbled' },
  { id: 'suede', name: '麂皮绒', desc: '绒面质感，低调奢华', pattern: 'suede' },
  { id: 'croc', name: '鳄鱼纹', desc: '压纹立体，高级定制', pattern: 'croc', price: 80 }
]

export const hardwares = [
  { id: 'gold', name: '黄铜金', hex: '#D4AF37', desc: '温润复古，越用越亮' },
  { id: 'silver', name: '亮银色', hex: '#C0C0C0', desc: '现代简约，百搭之选' },
  { id: 'rose', name: '玫瑰金', hex: '#B76E79', desc: '柔美精致，女生最爱' },
  { id: 'gunmetal', name: '枪黑色', hex: '#4A4A4A', desc: '沉稳低调，商务首选' }
]

export const products = [
  { id: 'keychain', name: '钥匙扣', basePrice: 168, days: 3, dimensions: '6cm x 3.5cm', maxChars: 8, desc: '随身携带的小确幸' },
  { id: 'cardholder', name: '卡包', basePrice: 298, days: 5, dimensions: '10cm x 7.5cm', maxChars: 12, desc: '简约不简单的日常' },
  { id: 'wallet', name: '短夹', basePrice: 458, days: 7, dimensions: '11cm x 9cm', maxChars: 12, desc: '精工细作的经典' },
  { id: 'passport', name: '护照夹', basePrice: 388, days: 6, dimensions: '14cm x 10cm', maxChars: 15, desc: '旅行的优雅伴侣' }
]

export const fonts = [
  { id: 'serif', name: '衬线体', sample: 'Aa 123 中文', css: "'Georgia', 'SimSun', serif" },
  { id: 'sans', name: '无衬线', sample: 'Aa 123 中文', css: "'Helvetica Neue', 'PingFang SC', sans-serif" },
  { id: 'script', name: '手写体', sample: 'Hello 你好', css: "'Brush Script MT', 'Kaiti', cursive" },
  { id: 'mono', name: '等宽体', sample: 'Aa 123 @#', css: "'Courier New', 'FangSong', monospace" },
  { id: 'stamp', name: '印章体', sample: 'ABC 甲乙', css: "'Impact', 'STHeiti', sans-serif" }
]

export const engravingDepths = [
  { id: 'light', name: '浅压印', desc: '温柔低调', depth: 0.3 },
  { id: 'medium', name: '中压印', desc: '经典平衡', depth: 0.6 },
  { id: 'deep', name: '深压印', desc: '立体鲜明', depth: 1.0 }
]

export const engravingPositions = {
  keychain: [
    { id: 'center', name: '居中', x: 50, y: 50 },
    { id: 'top', name: '上方', x: 50, y: 25 },
    { id: 'bottom', name: '下方', x: 50, y: 75 }
  ],
  cardholder: [
    { id: 'center', name: '正面居中', x: 50, y: 50 },
    { id: 'bottom-right', name: '右下角', x: 78, y: 82 },
    { id: 'top-left', name: '左上角', x: 22, y: 18 },
    { id: 'back', name: '背面居中', x: 50, y: 50, isBack: true }
  ],
  wallet: [
    { id: 'center', name: '正面居中', x: 50, y: 50 },
    { id: 'inside', name: '内侧左上方', x: 25, y: 25, isInside: true },
    { id: 'bottom-right', name: '右下角', x: 80, y: 85 }
  ],
  passport: [
    { id: 'center', name: '封面居中', x: 50, y: 50 },
    { id: 'spine', name: '书脊', x: 50, y: 50, isSpine: true },
    { id: 'inside', name: '内侧上方', x: 50, y: 20, isInside: true }
  ]
}

export const giftBoxes = [
  { id: 'none', name: '简易包装', price: 0, desc: '环保防尘袋', icon: '📦' },
  { id: 'standard', name: '标准礼盒', price: 20, desc: '棕色牛皮纸盒+丝带', icon: '🎁' },
  { id: 'premium', name: '豪华礼盒', price: 58, desc: '磁吸礼盒+绒布内衬+手写卡', icon: '🎀' }
]

export const pickupMethods = [
  { id: 'store', name: '门店自提', price: 0, desc: '工坊自取，现场验货', icon: '🏪', address: '上海市静安区南京西路1788号B1层' },
  { id: 'express', name: '顺丰快递', price: 15, desc: '次日送达，保价运输', icon: '🚚', estimated: '下单后1-2天送达' },
  { id: 'samecity', name: '同城闪送', price: 30, desc: '3小时内送达', icon: '⚡', cities: '仅限上海外环内' }
]

export const materialStock = {
  leather: {
    tan: { sheet: 20, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: false },
    black: { sheet: 18, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: false },
    burgundy: { sheet: 8, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: false },
    navy: { sheet: 10, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: false },
    green: { sheet: 0, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: true },
    cognac: { sheet: 6, unit: '张', perProduct: { keychain: 0.05, cardholder: 0.1, wallet: 0.2, passport: 0.15 }, soldOut: false }
  },
  hardware: {
    gold: { count: 80, unit: '套', soldOut: false },
    silver: { count: 120, unit: '套', soldOut: false },
    rose: { count: 0, unit: '套', soldOut: true },
    gunmetal: { count: 60, unit: '套', soldOut: false }
  },
  thread: {
    beige: { spool: 15, unit: '卷', soldOut: false },
    black: { spool: 12, unit: '卷', soldOut: false },
    brown: { spool: 10, unit: '卷', soldOut: false },
    navy: { spool: 6, unit: '卷', soldOut: false },
    crimson: { spool: 8, unit: '卷', soldOut: false },
    gold: { spool: 0, unit: '卷', soldOut: true }
  }
}

export const soldOutAlternatives = {
  leather: {
    burgundy: { alternatives: ['cognac', 'tan'], colorDiff: '颜色相近，略浅一些', delayDays: 0 },
    green: { alternatives: ['navy', 'black'], colorDiff: '色系相近，都是深色系', delayDays: 0 },
    cognac: { alternatives: ['tan', 'burgundy'], colorDiff: '颜色略浅，质感相同', delayDays: 2 }
  },
  hardware: {
    rose: { alternatives: ['gold', 'silver'], colorDiff: '金色偏暖，银色偏冷', delayDays: 0 },
    gunmetal: { alternatives: ['silver', 'black'], colorDiff: '银色更亮，黑色更低调', delayDays: 1 }
  },
  thread: {
    gold: { alternatives: ['beige', 'brown'], colorDiff: '金色换成相近色系', delayDays: 0 },
    crimson: { alternatives: ['brown', 'navy'], colorDiff: '酒红缺货，推荐棕色或藏蓝', delayDays: 0 }
  }
}

export const colorCombinationTips = [
  { leather: 'tan', hardware: 'gold', thread: 'brown', rating: 5, tip: '经典复古组合，强烈推荐' },
  { leather: 'black', hardware: 'gunmetal', thread: 'black', rating: 5, tip: '沉稳商务，低调奢华' },
  { leather: 'black', hardware: 'gold', thread: 'beige', rating: 4, tip: '黑金对比，时尚大气' },
  { leather: 'burgundy', hardware: 'gold', thread: 'crimson', rating: 4, tip: '热情喜庆，适合送礼' },
  { leather: 'navy', hardware: 'silver', thread: 'navy', rating: 4, tip: '优雅绅士，商务首选' },
  { leather: 'green', hardware: 'gold', thread: 'brown', rating: 4, tip: '自然清新，别具一格' }
]

export const engravingRestrictedChars = /[\u{1F300}-\u{1F9FF}<>{}[\]\\|^`~!@#$%^&*_+=\u2000-\u200F]/u

export const engravingSpecialChars = ['®', '™', '©', '°', '±', '÷', '×', '§', '¶', '•', '◦', '✓', '✗', '★', '☆', '❤', '♡']

export const productEngravingAreas = {
  keychain: { width: 170, height: 110, safeMargin: 15 },
  cardholder: { width: 250, height: 150, safeMargin: 20 },
  wallet: { width: 270, height: 190, safeMargin: 25 },
  passport: { width: 280, height: 230, safeMargin: 25 }
}
