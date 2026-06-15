import { writable, derived } from 'svelte/store';
import { products, leatherColors, textures, hardwares, fonts, engravingDepths, giftBoxes, pickupMethods } from '../data/options.js';
import { v4 as uuidv4 } from 'uuid';
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
export const totalPrice = derived([orderConfig, selectedProduct, selectedLeather, selectedTexture, selectedGiftBox, selectedPickup], ([$c, $p, $l, $t, $g, $pk]) => {
 if (!$p)
 return 0;
 let total = $p.basePrice;
 total += ($l?.price || 0);
 total += ($t?.price || 0);
 total += ($g?.price || 0);
 total += ($pk?.price || 0);
 if ($c.engravingText && $c.engravingText.length > 0) {
 total += Math.max(0, $c.engravingText.length - 3) * 8;
 }
 return total;
});
export const estimatedCompletion = derived([orderConfig, selectedProduct], ([$c, $p]) => {
 if (!$p)
 return new Date();
 const baseDays = $p.days;
 let extraDays = 0;
 if ($c.engravingText && $c.engravingText.length > 0)
 extraDays += 1;
 if ($c.textureId === 'croc')
 extraDays += 1;
 if ($c.giftBoxId === 'premium')
 extraDays += 0.5;
 const result = new Date($c.orderDate);
 result.setDate(result.getDate() + Math.ceil(baseDays + extraDays));
 return result;
});
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

