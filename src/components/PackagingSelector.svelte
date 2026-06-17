<script>
  import { orderConfig, materialAvailability, colorCombinationTip, selectedLeatherType } from '../store/orderStore.js';
  import { giftBoxes, pickupMethods, leatherColors, hardwares, threadColors } from '../data/options.js';

  $: materialCheck = $materialAvailability;
  $: hasMaterialIssues = !materialCheck.allAvailable;

  function getLeatherName(id) {
    return leatherColors.find(l => l.id === id)?.name || id;
  }

  function getHardwareName(id) {
    return hardwares.find(h => h.id === id)?.name || id;
  }

  function getThreadName(id) {
    return threadColors.find(t => t.id === id)?.name || id;
  }
</script>

<div class="packaging-selector">
  <div class="material-summary">
    <h3 class="section-title">材料组合确认</h3>
    <div class="material-summary-card">
      <div class="summary-row">
        <span class="summary-label">皮革材质</span>
        <span class="summary-value">
          {#if $selectedLeatherType}
            {$selectedLeatherType.name} ·
          {/if}
          {getLeatherName($orderConfig.leatherColorId)}
          {#if materialCheck.leather.soldOut}
            <span class="status-badge danger">已售罄</span>
          {/if}
        </span>
      </div>
      <div class="summary-row">
        <span class="summary-label">五金配件</span>
        <span class="summary-value">
          {getHardwareName($orderConfig.hardwareId)}
          {#if materialCheck.hardware.soldOut}
            <span class="status-badge danger">已售罄</span>
          {/if}
        </span>
      </div>
      <div class="summary-row">
        <span class="summary-label">缝线颜色</span>
        <span class="summary-value">
          {getThreadName($orderConfig.threadColorId)}
          {#if materialCheck.thread.soldOut}
            <span class="status-badge danger">已售罄</span>
          {/if}
        </span>
      </div>
    </div>
    {#if $colorCombinationTip}
      <div class="combination-tip">
        <span class="tip-icon">⭐</span>
        <span class="tip-text">{$colorCombinationTip.tip}</span>
        <div class="tip-rating">
          {#each { length: $colorCombinationTip.rating } as _, i}
            <span class="star">★</span>
          {/each}
        </div>
      </div>
    {/if}
    {#if hasMaterialIssues}
      <div class="material-warning">
        <div class="warning-header">
          <span class="warning-icon">⚠️</span>
          <span class="warning-title">部分材料已售罄</span>
        </div>
        <ul class="warning-list">
          {#if materialCheck.leather.soldOut}
            <li class="warning-item">
              <span class="warning-label">皮革：</span>
              <span class="warning-text">{getLeatherName($orderConfig.leatherColorId)} 已售罄</span>
              {#if materialCheck.leather.alternatives}
                <span class="warning-suggest">
                  推荐替代：
                  {#each materialCheck.leather.alternatives.alternatives as altId, i}
                    {getLeatherName(altId)}{i < materialCheck.leather.alternatives.alternatives.length - 1 ? '、' : ''}
                  {/each}
                </span>
              {/if}
            </li>
          {/if}
          {#if materialCheck.hardware.soldOut}
            <li class="warning-item">
              <span class="warning-label">五金：</span>
              <span class="warning-text">{getHardwareName($orderConfig.hardwareId)} 已售罄</span>
              {#if materialCheck.hardware.alternatives}
                <span class="warning-suggest">
                  推荐替代：
                  {#each materialCheck.hardware.alternatives.alternatives as altId, i}
                    {getHardwareName(altId)}{i < materialCheck.hardware.alternatives.alternatives.length - 1 ? '、' : ''}
                  {/each}
                </span>
              {/if}
            </li>
          {/if}
          {#if materialCheck.thread.soldOut}
            <li class="warning-item">
              <span class="warning-label">缝线：</span>
              <span class="warning-text">{getThreadName($orderConfig.threadColorId)} 已售罄</span>
              {#if materialCheck.thread.alternatives}
                <span class="warning-suggest">
                  推荐替代：
                  {#each materialCheck.thread.alternatives.alternatives as altId, i}
                    {getThreadName(altId)}{i < materialCheck.thread.alternatives.alternatives.length - 1 ? '、' : ''}
                  {/each}
                </span>
              {/if}
            </li>
          {/if}
        </ul>
        <p class="warning-note">
          💡 请返回皮革或五金页面选择替代材料，或联系店员确认是否可预订。
        </p>
      </div>
    {/if}
  </div>

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
        bind:value={$orderConfig.customerName}
      />
    </div>
    <div class="form-group">
      <label class="form-label">手机号</label>
      <input
        type="tel"
        class="form-input"
        placeholder="请输入您的手机号"
        bind:value={$orderConfig.customerPhone}
      />
    </div>
    <div class="form-group">
      <label class="form-label">特殊备注（可选）</label>
      <textarea
        class="form-input"
        rows="3"
        placeholder="例如：希望字更粗一些、送礼包装、特定日期取货等..."
        bind:value={$orderConfig.specialNote}
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

  .material-summary {
    margin-bottom: 28px;
  }

  .material-summary-card {
    background: var(--color-bg);
    border-radius: var(--radius-md);
    padding: 16px;
    margin-bottom: 12px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 14px;
  }

  .summary-row + .summary-row {
    border-top: 1px dashed var(--color-border);
  }

  .summary-label {
    color: var(--color-text-light);
    font-weight: 500;
  }

  .summary-value {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
  }

  .status-badge.danger {
    background: #FFEBEE;
    color: var(--color-danger);
  }

  .combination-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #FFF8EC, #FFFBF5);
    border: 1px solid var(--color-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 12px;
  }

  .tip-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .tip-text {
    flex: 1;
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
  }

  .tip-rating {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #FFD700;
    font-size: 14px;
  }

  .material-warning {
    background: #FFF4E6;
    border: 1px solid rgba(160, 82, 45, 0.3);
    border-radius: var(--radius-md);
    padding: 14px;
    margin-bottom: 12px;
  }

  .warning-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .warning-icon {
    font-size: 18px;
  }

  .warning-title {
    font-size: 14px;
    font-weight: 600;
    color: #A0522D;
  }

  .warning-list {
    list-style: none;
    padding: 0;
    margin: 0 0 10px 0;
  }

  .warning-item {
    padding: 6px 0;
    font-size: 13px;
    line-height: 1.5;
  }

  .warning-label {
    color: var(--color-text-light);
    font-weight: 500;
  }

  .warning-text {
    color: var(--color-danger);
    font-weight: 500;
  }

  .warning-suggest {
    display: block;
    color: var(--color-text);
    font-size: 12px;
    margin-top: 2px;
  }

  .warning-note {
    font-size: 12px;
    color: var(--color-text-light);
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-sm);
    margin: 0;
  }
</style>
