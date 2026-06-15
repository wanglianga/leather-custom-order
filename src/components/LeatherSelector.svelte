<script>
  import { orderConfig } from '../store/orderStore.js';
  import { leatherColors, textures } from '../data/options.js';
</script>

<div class="leather-selector">
  <h3 class="section-title">皮革颜色</h3>
  <div class="color-grid">
    {#each leatherColors as color}
      <div
        class="color-swatch {$orderConfig.leatherColorId === color.id ? 'selected' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, leatherColorId: color.id }))}
        title="{color.name} {color.price > 0 ? '+¥' + color.price : ''}"
      >
        <div class="color-circle" style="background: {color.hex}">
          {#if color.id === 'green'}
            <div class="texture-overlay" style="background: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px);"></div>
          {/if}
        </div>
        <div class="color-name">{color.name}</div>
        {#if color.price > 0}
          <div class="color-price">+¥{color.price}</div>
        {/if}
      </div>
    {/each}
  </div>

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
</style>
