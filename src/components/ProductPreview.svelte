<script>
  import {
    orderConfig, selectedProduct, selectedLeather,
    selectedTexture, selectedHardware, selectedFont, selectedDepth,
    estimatedCompletion, totalPrice,
    estimateCompletionDate, calcOrderPrice
  } from '../store/orderStore.js';
  import { engravingPositions, leatherColors, hardwares, fonts, engravingDepths, products } from '../data/options.js';

  export let compact = false;
  export let order;

  let config;
  $: if (order) {
    config = order;
  } else {
    config = $orderConfig;
  }

  $: product = order
    ? products.find(p => p.id === config.productId) || { name: '卡包' }
    : $selectedProduct;
  $: leather = order
    ? leatherColors.find(l => l.id === config.leatherColorId)
    : $selectedLeather;
  $: textureId = config.textureId;
  $: hardware = order
    ? hardwares.find(h => h.id === config.hardwareId)
    : $selectedHardware;
  $: font = order
    ? fonts.find(f => f.id === config.engravingFontId)
    : $selectedFont;
  $: depth = order
    ? (engravingDepths.find(d => d.id === config.engravingDepthId)?.depth || 0.6)
    : $selectedDepth?.depth || 0.6;

  $: positions = engravingPositions[config.productId] || [];
  $: position = positions.find(p => p.id === config.engravingPositionId) || { x: 50, y: 50 };

  $: marginPx = config.engravingMargin * 0.8;
  $: engravingOpacity = 0.3 + depth * 0.4;
  $: engravingShadow = depth * 2;

  $: texturePattern = getTexturePattern(textureId, leather?.hex || '#C4956A');

  function getTexturePattern(id, baseColor) {
    const darker = adjustHex(baseColor, -20);
    const lighter = adjustHex(baseColor, 10);
    if (id === 'grained') {
      return `radial-gradient(circle at 15% 25%, ${darker}33 1px, transparent 2px),
              radial-gradient(circle at 65% 55%, ${darker}33 1px, transparent 2px),
              radial-gradient(circle at 35% 80%, ${darker}22 1px, transparent 2px),
              linear-gradient(135deg, ${baseColor}, ${darker})`;
    }
    if (id === 'pebbled') {
      return `radial-gradient(ellipse at 20% 30%, ${darker}44 3px, transparent 6px),
              radial-gradient(ellipse at 70% 60%, ${darker}44 3px, transparent 6px),
              radial-gradient(ellipse at 45% 85%, ${darker}33 2px, transparent 5px),
              linear-gradient(135deg, ${baseColor}, ${darker})`;
    }
    if (id === 'suede') {
      return `repeating-linear-gradient(0deg, ${darker}11 0px, transparent 2px),
              repeating-linear-gradient(90deg, ${darker}08 0px, transparent 2px),
              linear-gradient(135deg, ${baseColor}, ${darker})`;
    }
    if (id === 'croc') {
      return `linear-gradient(135deg, ${darker}55 20%, transparent 20%),
              linear-gradient(225deg, ${darker}55 20%, transparent 20%),
              linear-gradient(45deg, ${darker}55 20%, transparent 20%),
              linear-gradient(315deg, ${darker}55 20%, transparent 20%),
              linear-gradient(135deg, ${baseColor}, ${darker})`;
    }
    return `linear-gradient(145deg, ${lighter}, ${baseColor} 50%, ${darker})`;
  }

  function adjustHex(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  $: isBack = position?.isBack;
  $: isInside = position?.isInside;
  $: isSpine = position?.isSpine;

  $: formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
</script>

<div class="product-preview {compact ? 'compact' : ''}" data-product={config.productId}>
  {#if !compact}
    <div class="preview-header">
      <span class="preview-title">实时预览</span>
      <span class="product-badge badge badge-warm">{product?.name}</span>
    </div>
  {/if}

  <div class="preview-stage" class:show-back={isBack} class:show-inside={isInside}>
    <svg viewBox="0 0 400 320" class="preview-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#00000033"/>
        </filter>
        <filter id="engravingShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="{engravingShadow}" stdDeviation="{engravingShadow * 0.5}" flood-color="#00000055"/>
        </filter>
        <linearGradient id="edgeGloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.1"/>
        </linearGradient>
      </defs>

      {#if config.productId === 'keychain'}
        <g filter="url(#shadow)">
          <rect x="110" y="100" width="180" height="120" rx="16" fill="url(#edgeGloss)"/>
          <rect x="115" y="105" width="170" height="110" rx="14"
                fill={leather?.hex || '#C4956A'}
                style="background: {texturePattern};"
                data-texture-fill/>
          <rect x="115" y="105" width="170" height="110" rx="14" fill="url(#edgeGloss)"/>
          <circle cx="200" cy="80" r="14" fill={hardware?.hex || '#D4AF37'} stroke="#00000011" stroke-width="1"/>
          <circle cx="200" cy="80" r="6" fill="none" stroke="#FFFFFF66" stroke-width="1.5"/>
          <rect x="188" y="90" width="24" height="20" rx="4" fill={hardware?.hex || '#D4AF37'}/>
          <circle cx="200" cy="160" r="46" fill="none" stroke={hardware?.hex || '#D4AF37'} stroke-width="5"/>
        </g>
        {#if config.engravingText && !isBack}
          <g transform="translate({115 + 85 * position.x / 100}, {105 + 55 * position.y / 100})">
            <rect x="-{config.engravingText.length * 7 + marginPx}" y="-{14 + marginPx}"
                  width="{config.engravingText.length * 14 + marginPx * 2}" height="{28 + marginPx * 2}"
                  fill="none" stroke="#00000015" stroke-width="1" stroke-dasharray="3 2" rx="3"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{16 + depth * 4}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
          </g>
        {/if}
      {/if}

      {#if config.productId === 'cardholder'}
        <g filter="url(#shadow)">
          <rect x="70" y="90" width="260" height="160" rx="12" fill="url(#edgeGloss)"/>
          <rect x="75" y="95" width="250" height="150" rx="10"
                fill={leather?.hex || '#C4956A'}
                style="background: {texturePattern};"
                data-texture-fill/>
          <rect x="75" y="95" width="250" height="150" rx="10" fill="url(#edgeGloss)"/>
          <rect x="90" y="110" width="220" height="10" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.5"/>
          <rect x="90" y="130" width="220" height="10" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.5"/>
          <rect x="90" y="150" width="220" height="10" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.5"/>
          <rect x="90" y="170" width="220" height="10" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.3"/>
        </g>
        {#if config.engravingText && !isBack}
          <g transform="translate({75 + 125 * position.x / 100}, {95 + 75 * position.y / 100})">
            <rect x="-{config.engravingText.length * 8 + marginPx}" y="-{16 + marginPx}"
                  width="{config.engravingText.length * 16 + marginPx * 2}" height="{32 + marginPx * 2}"
                  fill="none" stroke="#00000015" stroke-width="1" stroke-dasharray="3 2" rx="4"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{20 + depth * 5}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
          </g>
        {/if}
        {#if config.engravingText && isBack}
          <g transform="translate(200, 200)" opacity="0.85">
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{18 + depth * 4}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
            <text x="0" y="50" text-anchor="middle" font-size="11" fill="#666">— 背面刻字预览 —</text>
          </g>
        {/if}
      {/if}

      {#if config.productId === 'wallet'}
        <g filter="url(#shadow)">
          <rect x="60" y="70" width="280" height="200" rx="14" fill="url(#edgeGloss)"/>
          <rect x="65" y="75" width="270" height="190" rx="12"
                fill={leather?.hex || '#C4956A'}
                style="background: {texturePattern};"
                data-texture-fill/>
          <rect x="65" y="75" width="270" height="190" rx="12" fill="url(#edgeGloss)"/>
          <line x1="200" y1="75" x2="200" y2="265" stroke="#00000022" stroke-width="1"/>
          <rect x="85" y="95" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="85" y="115" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="85" y="135" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="215" y="95" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="215" y="115" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="215" y="135" width="100" height="8" rx="2" fill={adjustHex(leather?.hex || '#C4956A', -25)} opacity="0.45"/>
          <rect x="85" y="200" width="230" height="30" rx="6" fill={adjustHex(leather?.hex || '#C4956A', -15)} opacity="0.3"/>
          <circle cx="260" cy="245" r="6" fill={hardware?.hex || '#D4AF37'}/>
        </g>
        {#if config.engravingText && !isInside}
          <g transform="translate({65 + 135 * position.x / 100}, {75 + 95 * position.y / 100})">
            <rect x="-{config.engravingText.length * 7 + marginPx}" y="-{14 + marginPx}"
                  width="{config.engravingText.length * 14 + marginPx * 2}" height="{28 + marginPx * 2}"
                  fill="none" stroke="#00000015" stroke-width="1" stroke-dasharray="3 2" rx="4"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{18 + depth * 4}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
          </g>
        {/if}
        {#if config.engravingText && isInside}
          <g transform="translate(200, 170)" opacity="0.85">
            <rect x="95" y="160" width="210" height="50" rx="6" fill="#FFFBF5" opacity="0.6" stroke="#00000011"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{16 + depth * 4}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
            <text x="0" y="45" text-anchor="middle" font-size="10" fill="#666">— 内侧刻字预览 —</text>
          </g>
        {/if}
      {/if}

      {#if config.productId === 'passport'}
        <g filter="url(#shadow)">
          <rect x="55" y="50" width="290" height="240" rx="10" fill="url(#edgeGloss)"/>
          <rect x="60" y="55" width="280" height="230" rx="8"
                fill={leather?.hex || '#C4956A'}
                style="background: {texturePattern};"
                data-texture-fill/>
          <rect x="60" y="55" width="280" height="230" rx="8" fill="url(#edgeGloss)"/>
          <rect x="60" y="55" width="4" height="230" fill="#00000022"/>
          <text x="200" y="105" text-anchor="middle" font-size="14" fill="#00000033" font-weight="bold" letter-spacing="2">PASSPORT</text>
          <circle cx="200" cy="145" r="26" fill="none" stroke="#00000022" stroke-width="2"/>
          <text x="200" y="150" text-anchor="middle" font-size="20" fill="#00000022">📘</text>
          <rect x="80" y="230" width="100" height="40" rx="4" fill={adjustHex(leather?.hex || '#C4956A', -20)} opacity="0.3"/>
        </g>
        {#if config.engravingText && !isInside && !isSpine}
          <g transform="translate({60 + 140 * position.x / 100}, {55 + 115 * position.y / 100})">
            <rect x="-{config.engravingText.length * 8 + marginPx}" y="-{16 + marginPx}"
                  width="{config.engravingText.length * 16 + marginPx * 2}" height="{32 + marginPx * 2}"
                  fill="none" stroke="#00000015" stroke-width="1" stroke-dasharray="3 2" rx="4"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{20 + depth * 5}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
          </g>
        {/if}
        {#if config.engravingText && isSpine}
          <g transform="translate(62, 170)">
            <rect x="0" y="-20" width="6" height="40" rx="2" fill="#00000011"/>
            <text x="3" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{10 + depth * 2}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  writing-mode="tb"
                  transform="rotate(180)">{config.engravingText}</text>
          </g>
        {/if}
        {#if config.engravingText && isInside}
          <g transform="translate(200, 130)" opacity="0.85">
            <rect x="80" y="110" width="240" height="80" rx="6" fill="#FFFBF5" opacity="0.6" stroke="#00000011"/>
            <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                  font-family={font?.css}
                  font-size="{16 + depth * 4}"
                  fill="#000000"
                  opacity={engravingOpacity}
                  filter="url(#engravingShadow)">{config.engravingText}</text>
            <text x="0" y="50" text-anchor="middle" font-size="10" fill="#666">— 内侧刻字预览 —</text>
          </g>
        {/if}
      {/if}
    </svg>

    {#if !config.engravingText}
      <div class="no-engraving-hint">💡 在下方输入刻字内容查看实时效果</div>
    {/if}
  </div>

  {#if !compact}
    <div class="preview-info">
      <div class="info-row">
        <span class="info-label">预计完工</span>
        <span class="info-value highlight">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {order ? formatDate(estimateCompletionDate(order)) : formatDate($estimatedCompletion)}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">定制总价</span>
        <span class="info-value price">
          ¥{order ? calcOrderPrice(order) : $totalPrice}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .product-preview {
    background: linear-gradient(180deg, #FFFFFF 0%, #FFFBF5 100%);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 16px;
  }

  .product-preview.compact {
    padding: 12px;
    border-radius: var(--radius-md);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .preview-title {
    font-size: 15px;
    font-weight: 600;
  }

  .preview-stage {
    position: relative;
    background: linear-gradient(135deg, #F8F4EF 0%, #EEE5D8 100%);
    border-radius: var(--radius-md);
    padding: 16px;
    margin-bottom: 16px;
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .preview-stage.show-back::before {
    content: '背面视图';
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.6);
    color: white;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 100px;
    z-index: 5;
  }

  .preview-stage.show-inside::before {
    content: '内侧视图';
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.6);
    color: white;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 100px;
    z-index: 5;
  }

  .preview-svg {
    width: 100%;
    max-width: 360px;
    height: auto;
  }

  [data-texture-fill] {
    fill-opacity: 0.92;
  }

  .no-engraving-hint {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 10px;
    color: var(--color-text-light);
    background: rgba(255,255,255,0.8);
    padding: 4px 10px;
    border-radius: 100px;
  }

  .preview-info {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 14px 16px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .info-row + .info-row {
    border-top: 1px dashed var(--color-border);
  }

  .info-label {
    font-size: 13px;
    color: var(--color-text-light);
  }

  .info-value {
    font-size: 14px;
    font-weight: 500;
  }

  .info-value.highlight {
    color: var(--color-success);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .info-value.price {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-primary);
  }

  @media (max-width: 767px) {
    .product-preview {
      position: relative;
      top: 0;
      margin-bottom: 24px;
    }
  }
</style>
