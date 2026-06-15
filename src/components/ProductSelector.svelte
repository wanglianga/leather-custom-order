<script>
  import { orderConfig, selectedProduct } from '../store/orderStore.js';
  import { products } from '../data/options.js';
  import ProductPreview from './ProductPreview.svelte';

  function selectProduct(id) {
    orderConfig.update(c => ({
      ...c,
      productId: id,
      engravingPositionId: 'center'
    }));
  }
</script>

<div class="product-selector">
  <h3 class="section-title">选择版型</h3>
  <div class="product-grid">
    {#each products as product}
      <div
        class="option-card product-card {$orderConfig.productId === product.id ? 'selected' : ''}"
        on:click={() => selectProduct(product.id)}
      >
        <div class="product-icon">
          {#if product.id === 'keychain'}🔑
          {:else if product.id === 'cardholder'}💳
          {:else if product.id === 'wallet'}👛
          {:else if product.id === 'passport'}🛂
          {/if}
        </div>
        <div class="product-info">
          <div class="product-name">{product.name}</div>
          <div class="product-desc">{product.desc}</div>
          <div class="product-meta">
            <span>¥{product.basePrice}</span>
            <span>·</span>
            <span>{product.days}个工作日</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="product-detail fade-in" style="--product: {$orderConfig.productId}">
    <div class="detail-row">
      <span class="label">成品尺寸</span>
      <span class="value">{$selectedProduct?.dimensions}</span>
    </div>
    <div class="detail-row">
      <span class="label">最大刻字</span>
      <span class="value">{$selectedProduct?.maxChars} 字符（前3个免费，超出¥8/字）</span>
    </div>
    <div class="detail-row">
      <span class="label">工艺</span>
      <span class="value badge badge-warm">手工缝制 · 封边打磨</span>
    </div>
  </div>
</div>

<style>
  .product-selector {
    margin-bottom: 32px;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (min-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .product-card {
    text-align: center;
    padding: 16px 12px;
  }

  .product-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }

  .product-name {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .product-desc {
    font-size: 11px;
    color: var(--color-text-light);
    margin-bottom: 8px;
  }

  .product-meta {
    font-size: 12px;
    color: var(--color-primary);
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }

  .product-detail {
    margin-top: 16px;
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
    border-radius: var(--radius-md);
    padding: 16px;
    border: 1px solid rgba(139, 69, 19, 0.1);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed rgba(139, 69, 19, 0.15);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 13px;
    color: var(--color-text-light);
  }

  .value {
    font-size: 13px;
    font-weight: 500;
  }
</style>
