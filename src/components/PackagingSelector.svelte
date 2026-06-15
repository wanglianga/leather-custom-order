<script>
  import { orderConfig } from '../store/orderStore.js';
  import { giftBoxes, pickupMethods } from '../data/options.js';
</script>

<div class="packaging-selector">
  <h3 class="section-title">包装方式</h3>
  <div class="giftbox-grid">
    {#each giftBoxes as gb}
      <div
        class="option-card giftbox-card {$orderConfig.giftBoxId === gb.id ? 'selected' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, giftBoxId: gb.id }))}
      >
        <div class="giftbox-icon">{gb.icon}</div>
        <div class="giftbox-info">
          <div class="giftbox-name">
            {gb.name}
            {#if gb.price > 0}
              <span class="price-tag"> +¥{gb.price}</span>
            {/if}
          </div>
          <div class="giftbox-desc">{gb.desc}</div>
        </div>
      </div>
    {/each}
  </div>

  <h3 class="section-title" style="margin-top: 24px;">取货方式</h3>
  <div class="pickup-grid">
    {#each pickupMethods as pm}
      <div
        class="option-card pickup-card {$orderConfig.pickupMethodId === pm.id ? 'selected' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, pickupMethodId: pm.id }))}
      >
        <div class="pickup-top">
          <div class="pickup-icon">{pm.icon}</div>
          <div class="pickup-main">
            <div class="pickup-name">
              {pm.name}
              {#if pm.price > 0}
                <span class="price-tag"> +¥{pm.price}</span>
              {/if}
            </div>
            <div class="pickup-desc">{pm.desc}</div>
          </div>
        </div>
        {#if pm.address}
          <div class="pickup-detail">📍 {pm.address}</div>
        {/if}
        {#if pm.estimated}
          <div class="pickup-detail">⏱ {pm.estimated}</div>
        {/if}
        {#if pm.cities}
          <div class="pickup-detail">🌆 {pm.cities}</div>
        {/if}
      </div>
    {/each}
  </div>

  <h3 class="section-title" style="margin-top: 24px;">联系信息</h3>
  <div class="contact-form">
    <div class="form-group">
      <label class="form-label">姓名</label>
      <input
        type="text"
        class="form-input"
        placeholder="请输入您的姓名"
        value={$orderConfig.customerName}
        on:input={(e) => orderConfig.update(c => ({ ...c, customerName: e.target.value }))}
      />
    </div>
    <div class="form-group">
      <label class="form-label">手机号</label>
      <input
        type="tel"
        class="form-input"
        placeholder="请输入您的手机号"
        value={$orderConfig.customerPhone}
        on:input={(e) => orderConfig.update(c => ({ ...c, customerPhone: e.target.value }))}
      />
    </div>
    <div class="form-group">
      <label class="form-label">特殊备注（可选）</label>
      <textarea
        class="form-input"
        rows="3"
        placeholder="例如：希望字更粗一些、送礼包装、特定日期取货等..."
        value={$orderConfig.specialNote}
        on:input={(e) => orderConfig.update(c => ({ ...c, specialNote: e.target.value }))}
      ></textarea>
    </div>
  </div>
</div>

<style>
  .packaging-selector {
    margin-bottom: 32px;
  }

  .giftbox-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 768px) {
    .giftbox-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .giftbox-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
  }

  .giftbox-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .giftbox-info {
    flex: 1;
    min-width: 0;
  }

  .giftbox-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .giftbox-desc {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .pickup-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 768px) {
    .pickup-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .pickup-card {
    padding: 14px;
  }

  .pickup-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pickup-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .pickup-main {
    flex: 1;
    min-width: 0;
  }

  .pickup-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .pickup-desc {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .pickup-detail {
    font-size: 11px;
    color: var(--color-text-light);
    padding: 6px 10px;
    background: rgba(0,0,0,0.03);
    border-radius: var(--radius-sm);
    margin-top: 6px;
    line-height: 1.5;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  textarea.form-input {
    resize: vertical;
    min-height: 80px;
  }
</style>
