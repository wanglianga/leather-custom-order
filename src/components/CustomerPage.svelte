<script>
  import {
    orderConfig, totalPrice, estimatedCompletion,
    createOrder, resetOrderConfig, estimateCompletionDate,
    engravingBoundaryCheck, engravingCharValidation, materialAvailability,
    matchedWorkshopNotes, selectedProduct, selectedLeather, selectedTexture,
    selectedHardware, selectedThread, selectedFont, selectedDepth,
    selectedGiftBox, selectedPickup, selectedLeatherType
  } from '../store/orderStore.js';
  import ProductPreview from './ProductPreview.svelte';
  import ProductSelector from './ProductSelector.svelte';
  import LeatherSelector from './LeatherSelector.svelte';
  import HardwareSelector from './HardwareSelector.svelte';
  import EngravingConfig from './EngravingConfig.svelte';
  import PackagingSelector from './PackagingSelector.svelte';
  import OrderChecklist from './OrderChecklist.svelte';

  let showConfirmModal = false;
  let showSuccessModal = false;
  let currentStep = 0;
  let orderResult = null;

  $: isValid = $orderConfig.customerName && $orderConfig.customerPhone;

  const steps = [
    { id: 0, title: '版型' },
    { id: 1, title: '皮革' },
    { id: 2, title: '刻字' },
    { id: 3, title: '包装' }
  ];

  let engravingWarnings = [];
  let materialWarnings = [];

  function handleSubmit() {
    if (!isValid) {
      alert('请填写您的姓名和手机号');
      return;
    }

    engravingWarnings = [];
    materialWarnings = [];

    if ($orderConfig.engravingText) {
      if ($engravingBoundaryCheck.isOverflowing) {
        engravingWarnings.push({
          type: 'error',
          message: '刻字内容超出安全边距，请调整字体大小、位置或拆行'
        });
      }
      if (!$engravingCharValidation.isValid) {
        engravingWarnings.push({
          type: 'error',
          message: '刻字包含不适合压印的字符，请修改后再提交'
        });
      }
      if ($engravingCharValidation.warnings.length > 0) {
        engravingWarnings.push({
          type: 'warning',
          message: '部分特殊字符压印效果可能不清晰，建议替换为常规字符'
        });
      }
    }

    if (!$materialAvailability.allAvailable) {
      const unavailable = [];
      if ($materialAvailability.leather.soldOut) unavailable.push('皮革');
      if ($materialAvailability.hardware.soldOut) unavailable.push('五金');
      if ($materialAvailability.thread.soldOut) unavailable.push('缝线');
      materialWarnings.push({
        type: 'error',
        message: `${unavailable.join('、')} 材料已售罄，请返回选择替代材料`
      });
    }

    showConfirmModal = true;
  }

  $: hasEngravingErrors = engravingWarnings.some(w => w.type === 'error');
  $: hasMaterialErrors = materialWarnings.some(w => w.type === 'error');
  $: canSubmit = !hasEngravingErrors && !hasMaterialErrors;

  function confirmOrder() {
    if (!canSubmit) {
      alert('请先修正刻字或材料问题后再提交订单');
      return;
    }
    orderResult = createOrder($orderConfig);
    showConfirmModal = false;
    showSuccessModal = true;
  }

  function closeSuccess() {
    showSuccessModal = false;
    resetOrderConfig();
    currentStep = 0;
  }

  $: formatCompletion = (d) => {
    const date = new Date(d);
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weeks[date.getDay()]}`;
  };

  $: progressPercent = Math.min(100, (currentStep + 1) / steps.length * 100);
</script>

<div class="customer-page">
  <header class="page-header">
    <div class="header-content">
      <div class="brand">
        <span class="brand-icon">🧵</span>
        <div>
          <h1 class="brand-name">匠心皮具工坊</h1>
          <p class="brand-slogan">每一针，皆有温度</p>
        </div>
      </div>
    </div>
    <div class="progress-bar hide-on-desktop">
      <div class="progress-track">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
      <div class="step-indicators">
        {#each steps as step, i}
          <div class="step {currentStep >= i ? 'active' : ''} {currentStep === i ? 'current' : ''}"
               on:click={() => currentStep = i}>
            <span class="step-dot">{i + 1}</span>
            <span class="step-label">{step.title}</span>
          </div>
        {/each}
      </div>
    </div>
  </header>

  <main class="main-layout">
    <section class="preview-section hide-on-mobile">
      <ProductPreview />
    </section>

    <section class="config-section">
      <div class="preview-mobile hide-on-desktop">
        <ProductPreview />
      </div>

      <div class="step-section {currentStep === 0 ? 'active' : ''}">
        <ProductSelector />
      </div>

      <div class="step-section {currentStep === 1 ? 'active' : ''}">
        <LeatherSelector />
        <HardwareSelector />
      </div>

      <div class="step-section {currentStep === 2 ? 'active' : ''}">
        <EngravingConfig />
      </div>

      <div class="step-section {currentStep === 3 ? 'active' : ''}">
        <PackagingSelector />
        <div class="checklist-wrapper">
          <OrderChecklist onJumpToStep={(step) => { currentStep = step; window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      </div>

      <div class="sticky-footer">
        <div class="price-summary hide-on-desktop">
          <div class="summary-completion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>预计 {formatCompletion($estimatedCompletion)} 可完成</span>
          </div>
          <div class="summary-price">
            <span class="price-label">合计</span>
            <span class="price-value">¥{$totalPrice}</span>
          </div>
        </div>
        <div class="footer-actions">
          {#if currentStep > 0}
            <button class="btn-secondary" on:click={() => currentStep--}>
              ← 上一步
            </button>
          {/if}
          {#if currentStep < steps.length - 1}
            <button class="btn-primary" style="flex: 1;" on:click={() => currentStep++}>
              下一步 →
            </button>
          {:else}
            <button class="btn-primary" style="flex: 1;" on:click={handleSubmit}>
              确认下单 ¥{$totalPrice}
            </button>
          {/if}
        </div>
      </div>
    </section>
  </main>

  {#if showConfirmModal}
    <div class="modal-overlay" on:click={() => showConfirmModal = false}>
      <div class="modal-content confirm-modal large" on:click|stopPropagation>
        <div class="modal-header">
          <h3>📋 订单确认</h3>
          <button class="modal-close" on:click={() => showConfirmModal = false}>✕</button>
        </div>
        <div class="modal-body">
          {#if engravingWarnings.length > 0 || materialWarnings.length > 0 || $matchedWorkshopNotes.length > 0}
            <div class="order-warnings">
              {#each engravingWarnings as warning}
                <div class="alert {warning.type === 'error' ? 'alert-danger' : 'alert-warning'}">
                  <span class="alert-icon">{warning.type === 'error' ? '⚠️' : '💡'}</span>
                  <span class="alert-text">{warning.message}</span>
                </div>
              {/each}
              {#each materialWarnings as warning}
                <div class="alert {warning.type === 'error' ? 'alert-danger' : 'alert-warning'}">
                  <span class="alert-icon">{warning.type === 'error' ? '⚠️' : '💡'}</span>
                  <span class="alert-text">{warning.message}</span>
                </div>
              {/each}
              {#each $matchedWorkshopNotes as note}
                <div class="alert alert-warning">
                  <span class="alert-icon">{note.severity === 'warning' ? '⚠️' : '💡'}</span>
                  <span class="alert-text">
                    <strong>{note.title}</strong><br>
                    {note.suggestion}
                  </span>
                </div>
              {/each}
            </div>
          {/if}

          <div class="confirm-layout">
            <div class="confirm-preview">
              <ProductPreview compact={true} />
            </div>

            <div class="confirm-details">
              <div class="detail-group-title">定制参数</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">版型</span>
                  <span class="detail-value">{$selectedProduct?.name}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">皮革</span>
                  <span class="detail-value">
                    {#if $selectedLeather}
                      <span class="color-dot" style="background: {$selectedLeather.hex}"></span>
                      {$selectedLeatherType?.name} · {$selectedLeather.name}
                    {/if}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">纹理</span>
                  <span class="detail-value">{$selectedTexture?.name}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">五金</span>
                  <span class="detail-value">
                    {#if $selectedHardware}
                      <span class="color-dot" style="background: {$selectedHardware.hex}"></span>
                      {$selectedHardware.name}
                    {/if}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">缝线</span>
                  <span class="detail-value">
                    {#if $selectedThread}
                      <span class="color-dot" style="background: {$selectedThread.hex}"></span>
                      {$selectedThread.name}
                    {/if}
                  </span>
                </div>
                {#if $orderConfig.engravingText}
                  <div class="detail-item full">
                    <span class="detail-label">刻字内容</span>
                    <span class="detail-value highlight-engraving">「{$orderConfig.engravingText}」</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">字体</span>
                    <span class="detail-value">{$selectedFont?.name}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">压印</span>
                    <span class="detail-value">{$selectedDepth?.name}</span>
                  </div>
                {/if}
                <div class="detail-item">
                  <span class="detail-label">礼盒</span>
                  <span class="detail-value">{$selectedGiftBox?.name}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">取货</span>
                  <span class="detail-value">{$selectedPickup?.name}</span>
                </div>
              </div>

              <div class="detail-group-title" style="margin-top: 14px;">订单信息</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">顾客姓名</span>
                  <span class="detail-value">{$orderConfig.customerName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">联系电话</span>
                  <span class="detail-value">{$orderConfig.customerPhone}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">预计完工</span>
                  <span class="detail-value highlight-green">{formatCompletion($estimatedCompletion)}</span>
                </div>
                {#if $orderConfig.specialNote}
                  <div class="detail-item full note">
                    <span class="detail-label">特殊备注</span>
                    <span class="detail-value">{$orderConfig.specialNote}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div class="confirm-total">
            <span>定制总价</span>
            <span class="total-price">¥{$totalPrice}</span>
          </div>
          <p class="confirm-tip">
            🔔 工坊确认您的订单后将开始制作。手工制品可能存在±1mm误差，属于正常工艺范围。
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" on:click={() => { showConfirmModal = false; currentStep = 3; }}>
            返回修改
          </button>
          <button class="btn-primary" on:click={confirmOrder} disabled={!canSubmit}>
            {canSubmit ? '✓ 确认提交' : '⚠️ 请先修正问题'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showSuccessModal && orderResult}
    <div class="modal-overlay">
      <div class="modal-content success-modal fade-in">
        <div class="success-icon">🎉</div>
        <h3 class="success-title">下单成功！</h3>
        <p class="success-subtitle">您的定制订单已提交至工坊</p>
        <div class="success-order-card">
          <div class="order-number">
            <span class="label">订单编号</span>
            <span class="value">{orderResult.orderNumber}</span>
          </div>
          <div class="order-info">
            <div class="info-row">
              <span>客户：{orderResult.customerName}</span>
              <span>电话：{orderResult.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="highlight">预计 {formatCompletion(estimateCompletionDate(orderResult))} 可完成</span>
            </div>
          </div>
        </div>
        <div class="success-tips">
          <p>📞 我们的工艺师将在30分钟内致电确认细节</p>
          <p>✉️ 订单详情已发送至您的手机短信</p>
        </div>
        <button class="btn-primary" on:click={closeSuccess}>
          继续定制
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .customer-page {
    min-height: 100vh;
    background: var(--color-bg);
  }

  .page-header {
    background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D4AF37 100%);
    color: white;
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 20px rgba(139, 69, 19, 0.2);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 20px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    font-size: 36px;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .brand-slogan {
    font-size: 12px;
    opacity: 0.85;
    margin-top: 2px;
  }

  .progress-bar {
    background: rgba(255,255,255,0.1);
    padding: 12px 20px 16px;
  }

  .progress-track {
    height: 3px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .step-indicators {
    display: flex;
    justify-content: space-between;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2s;
  }

  .step.active {
    opacity: 0.7;
  }

  .step.current {
    opacity: 1;
  }

  .step-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  .step.current .step-dot {
    background: #FFD700;
    color: #8B4513;
  }

  .step-label {
    font-size: 11px;
  }

  .main-layout {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 120px;
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 28px;
    align-items: start;
  }

  @media (max-width: 767px) {
    .main-layout {
      grid-template-columns: 1fr;
      padding: 16px 14px 140px;
      gap: 0;
    }
  }

  .preview-section {
    position: sticky;
    top: 24px;
  }

  .config-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 767px) {
    .config-section {
      padding: 16px 14px;
    }
  }

  .preview-mobile {
    margin-bottom: 20px;
  }

  .step-section {
    display: none;
  }

  .step-section.active {
    display: block;
    animation: fadeIn 0.3s ease;
  }

  @media (min-width: 768px) {
    .step-section {
      display: block;
    }
  }

  .sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--color-border);
    padding: 12px 16px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
    z-index: 90;
  }

  @media (min-width: 768px) {
    .sticky-footer {
      position: sticky;
      bottom: 0;
      margin: 20px -24px -24px;
      padding: 16px 24px;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
  }

  .price-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--color-border);
  }

  .summary-completion {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--color-success);
    font-weight: 500;
  }

  .summary-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .price-label {
    font-size: 13px;
    color: var(--color-text-light);
  }

  .price-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-primary);
  }

  .footer-actions {
    display: flex;
    gap: 10px;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .confirm-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h3 {
    font-size: 18px;
    font-weight: 600;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--color-text-light);
  }

  .modal-body {
    padding: 20px;
  }

  .confirm-preview {
    margin-bottom: 20px;
  }

  .confirm-details {
    background: var(--color-bg);
    border-radius: var(--radius-md);
    padding: 14px;
    margin-bottom: 16px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
  }

  .detail-item + .detail-item {
    border-top: 1px dashed var(--color-border);
  }

  .detail-label {
    color: var(--color-text-light);
  }

  .detail-value {
    font-weight: 500;
    text-align: right;
    max-width: 60%;
  }

  .highlight-green {
    color: var(--color-success);
  }

  .detail-item.note .detail-value {
    background: #FFF9E6;
    padding: 6px 10px;
    border-radius: 6px;
    color: #A0522D;
    font-size: 13px;
  }

  .confirm-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
    border-radius: var(--radius-md);
    margin-bottom: 12px;
  }

  .confirm-total span:first-child {
    font-size: 14px;
    color: var(--color-text-light);
  }

  .total-price {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-primary);
  }

  .confirm-tip {
    font-size: 12px;
    color: var(--color-text-light);
    padding: 10px 12px;
    background: #FFF4E6;
    border-radius: 8px;
    line-height: 1.6;
  }

  .order-warnings {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.5;
  }

  .alert-danger {
    background: #FFEBEE;
    color: var(--color-danger);
    border: 1px solid rgba(123, 45, 38, 0.2);
  }

  .alert-warning {
    background: #FFF4E6;
    color: #A0522D;
    border: 1px solid rgba(160, 82, 45, 0.2);
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: 14px;
  }

  .alert-text {
    flex: 1;
    font-weight: 500;
  }

  .modal-footer {
    display: flex;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--color-border);
  }

  .success-modal {
    text-align: center;
    padding: 40px 28px 28px;
  }

  .success-icon {
    font-size: 64px;
    margin-bottom: 16px;
    animation: pulse 1s ease;
  }

  .success-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-success);
    margin-bottom: 6px;
  }

  .success-subtitle {
    font-size: 14px;
    color: var(--color-text-light);
    margin-bottom: 24px;
  }

  .success-order-card {
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
    border: 2px solid var(--color-secondary);
    border-radius: var(--radius-md);
    padding: 18px;
    margin-bottom: 20px;
    text-align: left;
  }

  .order-number {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px dashed var(--color-border);
  }

  .order-number .label {
    font-size: 12px;
    color: var(--color-text-light);
  }

  .order-number .value {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 1px;
  }

  .order-info .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 4px 0;
  }

  .order-info .highlight {
    color: var(--color-success);
    font-weight: 500;
    margin-top: 8px;
  }

  .success-tips {
    margin-bottom: 24px;
    text-align: left;
  }

  .success-tips p {
    font-size: 13px;
    color: var(--color-text-light);
    padding: 6px 0;
  }

  .checklist-wrapper {
    margin-top: 28px;
  }

  .confirm-modal.large {
    max-width: 680px;
  }

  .confirm-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 20px;
    margin-bottom: 16px;
  }

  @media (max-width: 600px) {
    .confirm-layout {
      grid-template-columns: 1fr;
    }
  }

  .confirm-layout .confirm-preview {
    margin-bottom: 0;
  }

  .detail-group-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-light);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
    background: var(--color-border);
    border-radius: var(--radius-sm);
    padding: 1px;
    overflow: hidden;
  }

  .detail-grid .detail-item {
    padding: 8px 10px;
    background: var(--color-surface);
    border: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .detail-grid .detail-item.full {
    grid-column: 1 / -1;
  }

  .detail-grid .detail-label {
    font-size: 10px;
    color: var(--color-text-light);
  }

  .detail-grid .detail-value {
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .highlight-engraving {
    color: var(--color-primary);
    font-style: italic;
  }

  .alert-text strong {
    display: block;
    margin-bottom: 2px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
