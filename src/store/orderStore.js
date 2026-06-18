import { writable, derived } from 'svelte/store';
import { products, leatherColors, textures, hardwares, fonts, engravingDepths, engravingPositions, giftBoxes, pickupMethods, threadColors, productEngravingAreas, engravingRestrictedChars, engravingSpecialChars, materialStock, soldOutAlternatives, colorCombinationTips, leatherTypes } from '../data/options.js';
import { v4 as uuidv4 } from 'uuid';

const PRODUCT_INFO = {
  keychain: { name: '钥匙扣', basePrice: 168, days: 3, dimensions: '6cm x 3.5cm', maxChars: 8 },
  cardholder: { name: '卡包', basePrice: 298, days: 5, dimensions: '10cm x 7.5cm', maxChars: 12 },
  wallet: { name: '短夹', basePrice: 458, days: 7, dimensions: '11cm x 9cm', maxChars: 12 },
  passport: { name: '护照夹', basePrice: 388, days: 6, dimensions: '14cm x 10cm', maxChars: 15 }
};
const LEATHER_PRICE = { tan: 0, black: 0, burgundy: 30, navy: 30, green: 50, cognac: 40 };
const TEXTURE_PRICE = { smooth: 0, grained: 0, pebbled: 0, suede: 0, croc: 80 };
const GIFTBOX_PRICE = { none: 0, standard: 20, premium: 58 };
const PICKUP_PRICE = { store: 0, express: 15, samecity: 30 };

export function getCharWidth(char, fontSize) {
  const code = char.charCodeAt(0);
  if (code < 128) {
    if (/[0-9]/.test(char)) return fontSize * 0.55;
    if (/[iIl1]/.test(char)) return fontSize * 0.25;
    if (/[wmWM]/.test(char)) return fontSize * 0.9;
    return fontSize * 0.55;
  } else if (code >= 0x4E00 && code <= 0x9FFF) {
    return fontSize * 1.0;
  } else {
    return fontSize * 0.7;
  }
}

export function calculateTextWidth(text, fontSize, letterSpacing = 1) {
  let width = 0;
  for (const char of text) {
    width += getCharWidth(char, fontSize);
  }
  width += Math.max(0, text.length - 1) * letterSpacing;
  return width;
}

export function checkEngravingBoundary(productId, positionId, text, fontSize, margin, positionX, positionY) {
  const area = productEngravingAreas[productId] || productEngravingAreas.cardholder;
  const textWidth = calculateTextWidth(text, fontSize);
  const textHeight = fontSize * 1.2;
  const safeAreaWidth = area.width - area.safeMargin * 2;
  const safeAreaHeight = area.height - area.safeMargin * 2;
  const totalWidth = textWidth + margin * 2;
  const totalHeight = textHeight + margin * 2;
  const overflowX = totalWidth - safeAreaWidth;
  const overflowY = totalHeight - safeAreaHeight;
  const isOverflowing = overflowX > 0 || overflowY > 0;
  const suggestions = [];
  if (isOverflowing) {
    if (overflowX > 0) {
      const suggestedFontSize = Math.floor(fontSize * (safeAreaWidth - margin * 2) / textWidth);
      if (suggestedFontSize >= 10) {
        suggestions.push({ type: 'fontSize', value: suggestedFontSize, label: `缩小字号至 ${suggestedFontSize}px` });
      }
    }
    if (positionId === 'center' && area.width > area.height) {
      suggestions.push({ type: 'position', value: 'bottom-right', label: '换至右下角位置' });
      suggestions.push({ type: 'position', value: 'top-left', label: '换至左上角位置' });
    }
    if (text.length > 5 && /\s/.test(text)) {
      suggestions.push({ type: 'wrap', value: true, label: '拆分为两行显示' });
    } else if (text.length > 6) {
      suggestions.push({ type: 'wrap', value: true, label: '建议拆行显示' });
    }
    if (margin > 8) {
      suggestions.push({ type: 'margin', value: Math.max(5, margin - 3), label: `减少边距至 ${Math.max(5, margin - 3)}mm` });
    }
  }
  return { isOverflowing, overflowX, overflowY, textWidth, textHeight, safeAreaWidth, safeAreaHeight, suggestions };
}

export function validateEngravingChars(text) {
  const issues = [];
  const warnings = [];
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (engravingRestrictedChars.test(char)) {
      issues.push({ char, index: i, type: 'restricted', message: `字符 "${char}" 不适合压印，请替换或删除` });
    }
    if (engravingSpecialChars.includes(char)) {
      warnings.push({ char, index: i, type: 'special', message: `特殊字符 "${char}" 压印效果可能不清晰，建议使用常规字符` });
    }
  }
  return { isValid: issues.length === 0, issues, warnings };
}

export function checkMaterialAvailability(leatherId, hardwareId, threadId) {
  const result = {
    leather: { available: true, soldOut: false, alternatives: null },
    hardware: { available: true, soldOut: false, alternatives: null },
    thread: { available: true, soldOut: false, alternatives: null },
    allAvailable: true
  };
  const leatherStock = materialStock.leather[leatherId];
  if (leatherStock?.soldOut) {
    result.leather.soldOut = true;
    result.leather.alternatives = soldOutAlternatives.leather[leatherId] || null;
    result.allAvailable = false;
  }
  const hardwareStock = materialStock.hardware[hardwareId];
  if (hardwareStock?.soldOut) {
    result.hardware.soldOut = true;
    result.hardware.alternatives = soldOutAlternatives.hardware[hardwareId] || null;
    result.allAvailable = false;
  }
  const threadStock = materialStock.thread[threadId];
  if (threadStock?.soldOut) {
    result.thread.soldOut = true;
    result.thread.alternatives = soldOutAlternatives.thread[threadId] || null;
    result.allAvailable = false;
  }
  return result;
}

export function getColorCombinationTip(leatherId, hardwareId, threadId) {
  return colorCombinationTips.find(t =>
    t.leather === leatherId && t.hardware === hardwareId && t.thread === threadId
  ) || null;
}

export function getLeatherTypeExtraDays(leatherId) {
  const leather = leatherColors.find(l => l.id === leatherId);
  if (!leather) return 0;
  const leatherType = leatherTypes.find(t => t.id === leather.type);
  return leatherType?.extraDays || 0;
}

export function calcOrderPrice(o) {
  const bp = PRODUCT_INFO[o.productId]?.basePrice || 298;
  const lp = LEATHER_PRICE[o.leatherColorId] ?? 0;
  const tp = TEXTURE_PRICE[o.textureId] ?? 0;
  const gp = GIFTBOX_PRICE[o.giftBoxId] ?? 0;
  const pp = PICKUP_PRICE[o.pickupMethodId] ?? 0;
  const ep = Math.max(0, (o.engravingText?.length || 0) - 3) * 8;
  return bp + lp + tp + gp + pp + ep;
}

export function estimateCompletionDate(configOrOrder) {
  const o = configOrOrder;
  const baseDays = PRODUCT_INFO[o.productId]?.days || 5;
  let extraDays = 0;
  if (o.engravingText && o.engravingText.length > 0) extraDays += 1;
  if (o.textureId === 'croc') extraDays += 1;
  if (o.giftBoxId === 'premium') extraDays += 0.5;
  extraDays += getLeatherTypeExtraDays(o.leatherColorId);
  const materialCheck = checkMaterialAvailability(o.leatherColorId, o.hardwareId, o.threadColorId || 'beige');
  if (!materialCheck.allAvailable) {
    if (materialCheck.leather.alternatives?.delayDays) extraDays += materialCheck.leather.alternatives.delayDays;
    if (materialCheck.hardware.alternatives?.delayDays) extraDays += materialCheck.hardware.alternatives.delayDays;
    if (materialCheck.thread.alternatives?.delayDays) extraDays += materialCheck.thread.alternatives.delayDays;
  }
  const baseDate = new Date(o.createdAt || o.orderDate || Date.now());
  const result = new Date(baseDate);
  result.setDate(result.getDate() + Math.ceil(baseDays + extraDays));
  return result;
}

function createInitialConfig() {
 const today = new Date();
 return {
 productId: 'cardholder',
 leatherColorId: 'tan',
 textureId: 'smooth',
 hardwareId: 'gold',
 threadColorId: 'brown',
 engravingText: '',
 engravingFontId: 'serif',
 engravingDepthId: 'medium',
 engravingPositionId: 'center',
 engravingMargin: 10,
 giftBoxId: 'standard',
 pickupMethodId: 'store',
 customerName: '',
 customerPhone: '',
 specialNote: '',
 orderDate: today.toISOString()
 };
}
export const orderConfig = writable(createInitialConfig());
export const selectedProduct = derived(orderConfig, $c => products.find(p => p.id === $c.productId));
export const selectedLeather = derived(orderConfig, $c => leatherColors.find(l => l.id === $c.leatherColorId));
export const selectedTexture = derived(orderConfig, $c => textures.find(t => t.id === $c.textureId));
export const selectedHardware = derived(orderConfig, $c => hardwares.find(h => h.id === $c.hardwareId));
export const selectedThread = derived(orderConfig, $c => threadColors.find(t => t.id === $c.threadColorId));
export const selectedFont = derived(orderConfig, $c => fonts.find(f => f.id === $c.engravingFontId));
export const selectedDepth = derived(orderConfig, $c => engravingDepths.find(d => d.id === $c.engravingDepthId));
export const selectedGiftBox = derived(orderConfig, $c => giftBoxes.find(g => g.id === $c.giftBoxId));
export const selectedPickup = derived(orderConfig, $c => pickupMethods.find(p => p.id === $c.pickupMethodId));
export const totalPrice = derived(orderConfig, $c => calcOrderPrice($c));
export const estimatedCompletion = derived(orderConfig, $c => estimateCompletionDate($c));

export const selectedLeatherType = derived([orderConfig, selectedLeather], ([$c, $l]) => {
  if (!$l) return null;
  return leatherTypes.find(t => t.id === $l.type) || null;
});

export const engravingCharValidation = derived(orderConfig, $c => {
  if (!$c.engravingText) return { isValid: true, issues: [], warnings: [] };
  return validateEngravingChars($c.engravingText);
});

export const engravingBoundaryCheck = derived(
  [orderConfig, selectedProduct, selectedFont, selectedDepth],
  ([$c, $p, $f, $d]) => {
    if (!$c.engravingText || !$p) return { isOverflowing: false, suggestions: [] };
    const fontSize = 16 + ($d?.depth || 0.6) * 4;
    const positions = engravingPositions[$c.productId] || [];
    const position = positions.find(p => p.id === $c.engravingPositionId) || { x: 50, y: 50 };
    return checkEngravingBoundary(
      $c.productId,
      $c.engravingPositionId,
      $c.engravingText,
      fontSize,
      $c.engravingMargin,
      position.x,
      position.y
    );
  }
);

export const materialAvailability = derived(orderConfig, $c => {
  return checkMaterialAvailability($c.leatherColorId, $c.hardwareId, $c.threadColorId);
});

export const colorCombinationTip = derived(orderConfig, $c => {
  return getColorCombinationTip($c.leatherColorId, $c.hardwareId, $c.threadColorId);
});
export const orders = writable([
 {
 id: 'ORD-' + Date.now(),
 orderNumber: 'LV2025' + String(Date.now()).slice(-6),
 ...createInitialConfig(),
 engravingText: 'M.Love',
 engravingFontId: 'script',
 threadColorId: 'crimson',
 customerName: '李小姐',
 customerPhone: '138****6688',
 specialNote: '请在七夕前完成，送给女朋友的生日礼物~',
 status: 'crafting',
 createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
 progress: 40
 },
 {
 id: 'ORD-' + (Date.now() + 1),
 orderNumber: 'LV2025' + String(Date.now() + 1).slice(-6),
 ...createInitialConfig(),
 productId: 'wallet',
 leatherColorId: 'black',
 hardwareId: 'gunmetal',
 threadColorId: 'black',
 engravingText: '2025.08.15',
 engravingPositionId: 'inside',
 customerName: '王先生',
 customerPhone: '139****1234',
 giftBoxId: 'premium',
 pickupMethodId: 'express',
 specialNote: '字体要加粗一些，谢谢',
 status: 'queued',
 createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
 progress: 0
 },
 {
 id: 'ORD-' + (Date.now() + 2),
 orderNumber: 'LV2025' + String(Date.now() + 2).slice(-6),
 ...createInitialConfig(),
 productId: 'keychain',
 leatherColorId: 'burgundy',
 threadColorId: 'brown',
 engravingText: 'Dad',
 customerName: '陈先生',
 customerPhone: '137****8899',
 status: 'completed',
 createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
 progress: 100
 }
]);
export function createOrder(config) {
 const newOrder = {
 id: 'ORD-' + Date.now(),
 orderNumber: 'LV' + new Date().getFullYear() + String(Date.now()).slice(-6),
 ...JSON.parse(JSON.stringify(config)),
 status: 'queued',
 createdAt: new Date().toISOString(),
 progress: 0
 };
 orders.update(prev => [newOrder, ...prev]);
 return newOrder;
}
export function resetOrderConfig() {
 orderConfig.set(createInitialConfig());
}

