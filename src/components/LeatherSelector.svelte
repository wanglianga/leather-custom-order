<script>
  import { orderConfig, materialAvailability, selectedLeatherType, colorCombinationTip } from '../store/orderStore.js';
  import { leatherColors, textures, leatherTypes, materialStock, soldOutAlternatives, leatherColors as allLeatherColors } from '../data/options.js';

  $: groupedLeathers = leatherTypes.map(type => ({
    ...type,
    colors: leatherColors.filter(c => c.type === type.id)
  }));

  function getLeatherStock(leatherId) {
    return materialStock.leather[leatherId];
  }

  function getLeatherAlternatives(leatherId) {
    return soldOutAlternatives.leather[leatherId];
  }

  function selectAlternative(altId) {
    orderConfig.update(c => ({ ...c, leatherColorId: altId }));
  }
</script>

<div class="leather-selector">
  {#each groupedLeathers as typeGroup}
    <div class="leather-type-section">
      <div class="leather-type-header">
        <h4 class="leather-type-title">{typeGroup.name}</h4>
        <span class="leather-type-desc">{typeGroup.desc}</span>
      </div>
      {#if typeGroup.colorVariation}
        <div class="leather-type-note">
          <span class="note-icon">🎨</span>
          <span class="note-text">{typeGroup.colorVariation}</span>
        </div>
      {/if}
      {#if typeGroup.extraDays > 0}
        <div class="leather-type-note warning">
          <span class="note-icon">⏱</span>
          <span class="note-text">需额外 {typeGroup.extraDays} 天制作时间</span>
        </div>
      {/if}
      <div class="color-grid">
        {#each typeGroup.colors as color}
          {@const stock = getLeatherStock(color.id)}
          {@const soldOut = stock?.soldOut}
          {@const alternatives = getLeatherAlternatives(color.id)}
          <div
            class="color-swatch {$orderConfig.leatherColorId === color.id ? 'selected' : ''} {soldOut ? 'sold-out' : ''}"
            on:click={() => orderConfig.update(c => ({ ...c, leatherColorId: color.id }))}
            title="{color.name} {color.price > 0 ? '+¥' + color.price : ''} {soldOut ? '(已售罄)' : ''}"
          >
            <div class="color-circle" style="background: {color.hex}">
              {#if color.id === 'green'}
                <div class="texture-overlay" style="background: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px);"></div>
              {/if}
              {#if soldOut}
                <div class="sold-out-overlay">
                  <span class="sold-out-text">售罄</span>
                </div>
              {/if}
            </div>
            <div class="color-name">{color.name}</div>
            {#if color.price > 0}
              <div class="color-price">+¥{color.price}</div>
            {/if}
            {#if stock && !soldOut}
              <div class="stock-indicator">
                <span class="stock-dot {stock.sheet < 5 ? 'low' : ''}"></span>
                <span class="stock-text">{stock.sheet} 张</span>
              </div>
            {/if}
          </div>
          {#if soldOut && alternatives}
            <div class="alternative-panel">
              <div class="alternative-header">
                <span class="alternative-icon">🔄</span>
                <span class="alternative-title">该颜色已售罄，推荐以下替代：</span>
              </div>
              {#if alternatives.colorDiff}
                <div class="alternative-note">
                  <span class="note-icon">🎨</span>
                  <span class="note-text">{alternatives.colorDiff}</span>
                </div>
              {/if}
              {#if alternatives.delayDays > 0}
                <div class="alternative-note warning">
                  <span class="note-icon">⏱</span>
                  <span class="note-text">选择替代材料将增加 {alternatives.delayDays} 天制作时间</span>
                </div>
              {/if}
              <div class="alternative-buttons">
                {#each alternatives.alternatives as altId}
                  {@const altColor = allLeatherColors.find(c => c.id === altId)}
                  {#if altColor}
                    <button class="alternative-btn" on:click={() => selectAlternative(altId)}>
                      <span class="alt-color-dot" style="background: {altColor.hex}"></span>
                      <span class="alt-color-name">{altColor.name}</span>
                      {#if altColor.price > 0}
                        <span class="alt-color-price">+¥{altColor.price}</span>
                      {/if}
                    </button>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/each}

  {#if $colorCombinationTip}
    <div class="combination-tip">
      <div class="tip-header">
        <span class="tip-icon">⭐</span>
        <span class="tip-title">搭配推荐</span>
        <div class="tip-rating">
          {#each { length: $colorCombinationTip.rating } as _, i}
            <span class="star">★</span>
          {/each}
        </div>
      </div>
      <p class="tip-text">{$colorCombinationTip.tip}</p>
    </div>
  {/if}

  <h3 class="section-title" style="margin-top: 24px;">皮革纹理</h3>
  <div class="texture-grid">
    {#each textures as texture}
      <div
        class="option-card texture-card {$orderConfig.textureId === texture.id ? 'selected' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, textureId: texture.id }))}
      >
        <div class="texture-preview" data-pattern="{texture.pattern}"></div>
        <div class="texture-info">
          <div class="texture-name">
            {texture.name}
            {#if texture.price > 0}
              <span class="price-tag"> +¥{texture.price}</span>
            {/if}
          </div>
          <div class="texture-desc">{texture.desc}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .leather-selector {
    margin-bottom: 32px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (min-width: 768px) {
    .color-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .color-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 12px 8px;
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    position: relative;
  }

  .color-swatch:hover {
    background: rgba(139, 69, 19, 0.05);
    transform: translateY(-2px);
  }

  .color-swatch.selected {
    background: rgba(139, 69, 19, 0.1);
  }

  .color-swatch.selected::after {
    content: '✓';
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .color-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,0.5);
  }

  .texture-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }

  .color-name {
    font-size: 12px;
    font-weight: 500;
  }

  .color-price {
    font-size: 10px;
    color: var(--color-primary);
    font-weight: 500;
  }

  .texture-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 768px) {
    .texture-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .texture-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
  }

  .texture-preview {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, #E8D5BE, #D4B896);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .texture-preview[data-pattern="grained"] {
    background:
      radial-gradient(circle at 20% 30%, rgba(0,0,0,0.08) 1px, transparent 2px),
      radial-gradient(circle at 60% 70%, rgba(0,0,0,0.08) 1px, transparent 2px),
      radial-gradient(circle at 40% 50%, rgba(0,0,0,0.06) 1px, transparent 2px),
      linear-gradient(135deg, #E8D5BE, #D4B896);
    background-size: 8px 8px, 10px 10px, 12px 12px, 100% 100%;
  }

  .texture-preview[data-pattern="pebbled"] {
    background:
      radial-gradient(ellipse at 25% 25%, rgba(0,0,0,0.1) 3px, transparent 5px),
      radial-gradient(ellipse at 75% 65%, rgba(0,0,0,0.1) 3px, transparent 5px),
      radial-gradient(ellipse at 50% 85%, rgba(0,0,0,0.08) 2px, transparent 4px),
      linear-gradient(135deg, #E8D5BE, #D4B896);
    background-size: 16px 16px, 20px 20px, 14px 14px, 100% 100%;
  }

  .texture-preview[data-pattern="suede"] {
    background:
      repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px),
      repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px),
      linear-gradient(135deg, #D4B896, #C4A882);
  }

  .texture-preview[data-pattern="croc"] {
    background:
      linear-gradient(135deg, rgba(0,0,0,0.15) 25%, transparent 25%),
      linear-gradient(225deg, rgba(0,0,0,0.15) 25%, transparent 25%),
      linear-gradient(45deg, rgba(0,0,0,0.15) 25%, transparent 25%),
      linear-gradient(315deg, rgba(0,0,0,0.15) 25%, transparent 25%);
    background-size: 20px 20px;
    background-color: #C4A882;
  }

  .texture-info {
    flex: 1;
    min-width: 0;
  }

  .texture-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .texture-desc {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .leather-type-section {
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px dashed var(--color-border);
  }

  .leather-type-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .leather-type-header {
    margin-bottom: 12px;
  }

  .leather-type-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 4px;
  }

  .leather-type-desc {
    font-size: 12px;
    color: var(--color-text-light);
    display: block;
  }

  .leather-type-note {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #F0F7F0;
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--color-success);
    margin-bottom: 12px;
  }

  .leather-type-note.warning {
    background: #FFF4E6;
    color: #A0522D;
  }

  .note-icon {
    flex-shrink: 0;
    font-size: 14px;
  }

  .note-text {
    flex: 1;
  }

  .color-swatch.sold-out {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .color-swatch.sold-out:hover {
    transform: none;
    background: transparent;
  }

  .sold-out-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .sold-out-text {
    color: white;
    font-size: 9px;
    font-weight: 700;
    transform: rotate(-15deg);
  }

  .stock-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .stock-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
  }

  .stock-dot.low {
    background: #FF9800;
    animation: pulse 1.5s infinite;
  }

  .stock-text {
    font-size: 10px;
    color: var(--color-text-light);
  }

  .alternative-panel {
    grid-column: 1 / -1;
    background: #FFF4E6;
    border: 1px solid rgba(160, 82, 45, 0.3);
    border-radius: var(--radius-md);
    padding: 14px;
    margin: 4px 0 12px;
  }

  .alternative-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .alternative-icon {
    font-size: 18px;
  }

  .alternative-title {
    font-size: 13px;
    font-weight: 600;
    color: #A0522D;
  }

  .alternative-note {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-sm);
    font-size: 11px;
    color: var(--color-text-light);
    margin-bottom: 8px;
  }

  .alternative-note.warning {
    background: #FFEBEE;
    color: var(--color-danger);
  }

  .alternative-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .alternative-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--color-text);
    transition: all 0.2s ease;
  }

  .alternative-btn:hover {
    border-color: var(--color-primary);
    background: #FFFBF5;
    transform: translateY(-1px);
  }

  .alt-color-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
  }

  .alt-color-name {
    font-weight: 500;
  }

  .alt-color-price {
    color: var(--color-primary);
    font-size: 11px;
  }

  .combination-tip {
    background: linear-gradient(135deg, #FFF8EC, #FFFBF5);
    border: 1px solid var(--color-secondary);
    border-radius: var(--radius-md);
    padding: 14px;
    margin-top: 16px;
  }

  .tip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .tip-icon {
    font-size: 18px;
  }

  .tip-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    flex: 1;
  }

  .tip-rating {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #FFD700;
    font-size: 14px;
  }

  .tip-text {
    font-size: 13px;
    color: var(--color-text-light);
    line-height: 1.5;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
