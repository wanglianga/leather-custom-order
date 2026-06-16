import { writable, derived } from 'svelte/store';
import { products, leatherColors, textures, hardwares, fonts, engravingDepths, giftBoxes, pickupMethods } from '../data/options.js';
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
export const selectedFont = derived(orderConfig, $c => fonts.find(f => f.id === $c.engravingFontId));
export const selectedDepth = derived(orderConfig, $c => engravingDepths.find(d => d.id === $c.engravingDepthId));
export const selectedGiftBox = derived(orderConfig, $c => giftBoxes.find(g => g.id === $c.giftBoxId));
export const selectedPickup = derived(orderConfig, $c => pickupMethods.find(p => p.id === $c.pickupMethodId));
export const totalPrice = derived(orderConfig, $c => calcOrderPrice($c));
export const estimatedCompletion = derived(orderConfig, $c => estimateCompletionDate($c));
export const orders = writable([
 {
 id: 'ORD-' + Date.now(),
 orderNumber: 'LV2025' + String(Date.now()).slice(-6),
 ...createInitialConfig(),
 engravingText: 'M.Love',
 engravingFontId: 'script',
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

