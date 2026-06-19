<script>
  import {
    orderConfig, selectedProduct, selectedLeather, selectedTexture,
    selectedHardware, selectedThread, selectedFont, selectedDepth,
    selectedGiftBox, selectedPickup, selectedLeatherType,
    customerHistory, relatedHistoryOrders, matchedWorkshopNotes,
    totalPrice, estimatedCompletion, getDiffFromHistory, calcOrderPrice
  } from '../store/orderStore.js';
  import {
    products, leatherColors, textures, hardwares, threadColors,
    fonts, engravingDepths, engravingPositions, giftBoxes, pickupMethods
  } from '../data/options.js';
  import ProductPreview from './ProductPreview.svelte';

  export let onJumpToStep;

  let expandedNoteId = null;
  let expandedHistoryId = null;

  function getFieldLabel(key, value) {
    switch (key) {
      case 'productId':
        return products.find(p => p.id === value)?.name || value;
      case 'leatherColorId':
        return leatherColors.find(l => l.id === value)?.name || value;
      case 'textureId':
        return textures.find(t => t.id === value)?.name || value;
      case 'hardwareId':
        return hardwares.find(h => h.id === value)?.name || value;
      case 'threadColorId':
        return threadColors.find(t => t.id === value)?.name || value;
      case 'engravingFontId':
        return fonts.find(f => f.id === value)?.name || value;
      case 'engravingPositionId': {
        const positions = engravingPositions[$orderConfig.productId] || [];
        return positions.find(p => p.id === value)?.name || value;
      }
      case 'engravingDepthId':
        return engravingDepths.find(d => d.id === value)?.name || value;
      case 'giftBoxId':
        return giftBoxes.find(g => g.id === value)?.name || value;
      case 'pickupMethodId':
        return pickupMethods.find(p => p.id === value)?.name || value;
      default:
        return value;
    }
  }

  function getFieldHex(key, value) {
    switch (key) {
      case 'leatherColorId':
        return leatherColors.find(l => l.id === value)?.hex;
      case 'threadColorId':
        return threadColors.find(t => t.id === value)?.hex;
      case 'hardwareId':
        return hardwares.find(h => h.id === value)?.hex;
      default:
        return null;
    }
  }

  const checklistItems = [
    { key: 'productId', label: '版型', icon: '👜', step: 0 },
    { key: 'leatherColorId', label: '皮革颜色', icon: '🎨', step: 1, hasType: true },
    { key: 'textureId', label: '皮革纹理', icon: '🪡', step: 1 },
    { key: 'hardwareId', label: '五金配件', icon: '🔩', step: 1 },
    { key: 'threadColorId', label: '缝线颜色', icon: '🧵', step: 1 },
    { key: 'engravingText', label: '刻字内容', icon: '✍️', step: 2, isText: true },
    { key: 'engravingFontId', label: '刻字字体', icon: '🔤', step: 2 },
    { key: 'engravingDepthId', label: '压印深浅', icon: '📏', step: 2 },
    { key: 'engravingPositionId', label: '刻字位置', icon: '📍', step: 2 },
    { key: 'giftBoxId', label: '礼盒包装', icon: '🎁', step: 3 },
    { key: 'pickupMethodId', label: '取货方式', icon: '🚚', step: 3 }
  ];

  function getItemDisplayValue(item) {
    if (item.isText) {
      return $orderConfig[item.key] || '(未刻字)';
    }
    return getFieldLabel(item.key, $orderConfig[item.key]);
  }

  function getItemExtra(item) {
    if (item.key === 'leatherColorId' && $selectedLeatherType) {
      return $selectedLeatherType.name;
    }
    if (item.key === 'engravingText' && $orderConfig.engravingText) {
      const positions = engravingPositions[$orderConfig.productId] || [];
      const pos = positions.find(p => p.id === $orderConfig.engravingPositionId);
      return pos ? `@ ${pos.name}` : '';
    }
    return null;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  function getStatusText(status) {
    switch (status) {
      case 'completed': return '已完成';
      case 'crafting': return '制作中';
      case 'queued': return '排队中';
      default: return status;
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'crafting': return 'status-crafting';
      case 'queued': return 'status-queued';
      default: return '';
    }
  }

  $: hasHistory = $customerHistory.length > 0;
  $: hasRelatedHistory = $relatedHistoryOrders.sameProduct.length > 0 || $relatedHistoryOrders.sameLeather.length > 0;
  $: hasWorkshopNotes = $matchedWorkshopNotes.length > 0;
  $: hasCustomerIdentity = $orderConfig.customerName || $orderConfig.customerPhone;
  $: completionShort = (() => {
    const d = new Date($estimatedCompletion);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  })();
</script>

<div class="order-checklist">

  {#if hasWorkshopNotes}
    <div class="workshop-notes-section">
      <div class="section-header">
        <span class="section-icon">⚠</span>
        <h3 class="section-title">工坊备注提醒</h3>
        <span class="badge badge-danger">{$matchedWorkshopNotes.length} 条</span>
      </div>
      <div class="workshop-notes-list">
        {#each $matchedWorkshopNotes as note}
          <div class="workshop-note-card {note.severity}" class:expanded={expandedNoteId === note.id}>
            <div class="note-header" on:click={() => expandedNoteId = expandedNoteId === note.id ? null : note.id}>
              <span class="note-icon">
                {note.severity === 'warning' ? '⚠️' : '💡'}
              </span>
              <div class="note-title-wrap">
                <div class="note-title">{note.title}</div>
                <div class="note-suggestion">{note.suggestion}</div>
              </div>
              <svg class="chevron {expandedNoteId === note.id ? 'down' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {#if expandedNoteId === note.id}
              <div class="note-body">
                <p class="note-content">{note.content}</p>
                <div class="note-actions">
                  {#if note.matchRules.engravingFontId}
                    <button class="note-action-btn" on:click={() => onJumpToStep && onJumpToStep(2)}>
                      调整刻字设置 →
                    </button>
                  {/if}
                  {#if note.matchRules.leatherColorId || note.matchRules.textureId || note.matchRules.hardwareId}
                    <button class="note-action-btn" on:click={() => onJumpToStep && onJumpToStep(1)}>
                      调整材料 →
                    </button>
                  {/if}
                  {#if note.matchRules.engravingPositionId}
                    <button class="note-action-btn" on:click={() => onJumpToStep && onJumpToStep(2)}>
                      调整刻字位置 →
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="checklist-card">
    <div class="checklist-header">
      <div>
        <span class="checklist-icon">📋</span>
        <h3 class="checklist-title">定制清单</h3>
      </div>
      <span class="checklist-subtitle">点击任意项可返回修改</span>
    </div>

    <div class="checklist-preview">
      <ProductPreview compact={true} />
    </div>

    <div class="checklist-grid">
      {#each checklistItems as item}
        {@const displayValue = getItemDisplayValue(item)}
        {@const extra = getItemExtra(item)}
        {@const hex = getFieldHex(item.key, $orderConfig[item.key])}
        <button
          class="checklist-item"
          on:click={() => onJumpToStep && onJumpToStep(item.step)}
          title="点击返回修改"
        >
          <span class="item-icon">{item.icon}</span>
          <div class="item-content">
            <div class="item-label">{item.label}</div>
            <div class="item-value">
              {#if hex}
                <span class="color-dot" style="background: {hex}"></span>
              {/if}
              <span>{displayValue}</span>
              {#if extra}
                <span class="item-extra"> · {extra}</span>
              {/if}
            </div>
          </div>
          <svg class="item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      {/each}
    </div>

    <div class="checklist-summary">
      <div class="summary-row">
        <span class="summary-label">定制总价</span>
        <span class="summary-value price">¥{$totalPrice}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">预计完工</span>
        <span class="summary-value highlight">{completionShort}</span>
      </div>
    </div>
  </div>

  {#if hasCustomerIdentity}
    <div class="history-section">
      <div class="section-header">
        <span class="section-icon">🕐</span>
        <h3 class="section-title">您的历史定制</h3>
        {#if hasRelatedHistory}
          <span class="badge badge-warm">相关定制</span>
        {/if}
      </div>

      {#if !hasHistory}
        <div class="empty-history">
          <span class="empty-icon">📦</span>
          <p>暂未找到您的历史定制记录</p>
          <p class="empty-hint">填写正确的姓名和手机号后可查看过往订单</p>
        </div>
      {:else}
        {#if $relatedHistoryOrders.sameProduct.length > 0}
          <div class="history-group">
            <div class="group-label">
              <span class="group-dot dot-product"></span>
              同版型（{$selectedProduct?.name}）历史定制
            </div>
            <div class="history-list">
              {#each $relatedHistoryOrders.sameProduct as order}
                {@const diffs = getDiffFromHistory($orderConfig, order)}
                <div class="history-card" class:expanded={expandedHistoryId === order.id}>
                  <div class="history-card-header" on:click={() => expandedHistoryId = expandedHistoryId === order.id ? null : order.id}>
                    {#if order.referenceImage}
                      <div class="history-thumb">
                        <img src={order.referenceImage} alt="成品图" loading="lazy" />
                      </div>
                    {:else}
                      <div class="history-thumb placeholder">
                        <ProductPreview order={order} compact={true} />
                      </div>
                    {/if}
                    <div class="history-info">
                      <div class="history-title">
                        <span class={`status-dot ${getStatusClass(order.status)}`}></span>
                        {formatDate(order.createdAt)} · {getStatusText(order.status)}
                      </div>
                      <div class="history-config">
                        <span class="color-dot" style="background: {leatherColors.find(l => l.id === order.leatherColorId)?.hex}"></span>
                        {leatherColors.find(l => l.id === order.leatherColorId)?.name} ·
                        {hardwares.find(h => h.id === order.hardwareId)?.name}
                        {#if order.engravingText}
                          · 「{order.engravingText}」
                        {/if}
                      </div>
                      {#if diffs.length > 0}
                        <div class="history-diff">
                          <span class="diff-badge">与本次有 {diffs.length} 处差异</span>
                        </div>
                      {:else}
                        <div class="history-same">
                          <span class="same-badge">✓ 与本次选择一致</span>
                        </div>
                      {/if}
                    </div>
                    <svg class="chevron {expandedHistoryId === order.id ? 'down' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {#if expandedHistoryId === order.id}
                    <div class="history-card-body">
                      {#if order.referenceImage}
                        <div class="reference-image">
                          <img src={order.referenceImage} alt="成品效果参考图" />
                          <div class="image-caption">成品效果参考图</div>
                        </div>
                      {/if}
                      {#if diffs.length > 0}
                        <div class="diff-section">
                          <div class="diff-title">与本次定制的差异对比</div>
                          <div class="diff-list">
                            {#each diffs as diff}
                              <div class="diff-item">
                                <span class="diff-label">{diff.label}</span>
                                <div class="diff-values">
                                  <span class="diff-prev">
                                    {#if getFieldHex(diff.field, diff.previous)}
                                      <span class="color-dot small" style="background: {getFieldHex(diff.field, diff.previous)}"></span>
                                    {/if}
                                    {getFieldLabel(diff.field, diff.previous)}
                                  </span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                  <span class="diff-current">
                                    {#if getFieldHex(diff.field, diff.current)}
                                      <span class="color-dot small" style="background: {getFieldHex(diff.field, diff.current)}"></span>
                                    {/if}
                                    {getFieldLabel(diff.field, diff.current)}
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/if}
                      {#if order.workshopNote}
                        <div class="history-workshop-note">
                          <span class="note-icon">⚠</span>
                          <div>
                            <div class="note-title-small">当时工坊备注</div>
                            <div class="note-content-small">{order.workshopNote}</div>
                          </div>
                        </div>
                      {/if}
                      <div class="history-actions">
                        <button
                          class="apply-btn"
                          on:click={() => {
                            orderConfig.set({
                              ...$orderConfig,
                              leatherColorId: order.leatherColorId,
                              textureId: order.textureId,
                              hardwareId: order.hardwareId,
                              threadColorId: order.threadColorId,
                              engravingFontId: order.engravingFontId,
                              engravingDepthId: order.engravingDepthId,
                              engravingPositionId: order.engravingPositionId,
                              giftBoxId: order.giftBoxId
                            });
                          }}
                        >
                          📋 套用此订单配置
                        </button>
                        <span class="history-price">当时总价 ¥{calcOrderPrice(order)}</span>
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if $relatedHistoryOrders.sameLeather.length > 0}
          <div class="history-group">
            <div class="group-label">
              <span class="group-dot dot-leather"></span>
              同皮革（{$selectedLeather?.name}）其他版型定制
            </div>
            <div class="history-list">
              {#each $relatedHistoryOrders.sameLeather as order}
                {@const diffs = getDiffFromHistory($orderConfig, order)}
                <div class="history-card" class:expanded={expandedHistoryId === order.id}>
                  <div class="history-card-header" on:click={() => expandedHistoryId = expandedHistoryId === order.id ? null : order.id}>
                    {#if order.referenceImage}
                      <div class="history-thumb">
                        <img src={order.referenceImage} alt="成品图" loading="lazy" />
                      </div>
                    {:else}
                      <div class="history-thumb placeholder">
                        <ProductPreview order={order} compact={true} />
                      </div>
                    {/if}
                    <div class="history-info">
                      <div class="history-title">
                        <span class={`status-dot ${getStatusClass(order.status)}`}></span>
                        {products.find(p => p.id === order.productId)?.name} · {formatDate(order.createdAt)}
                      </div>
                      <div class="history-config">
                        <span class="color-dot" style="background: {leatherColors.find(l => l.id === order.leatherColorId)?.hex}"></span>
                        {textures.find(t => t.id === order.textureId)?.name} ·
                        {hardwares.find(h => h.id === order.hardwareId)?.name}
                        {#if order.engravingText}
                          · 「{order.engravingText}」
                        {/if}
                      </div>
                    </div>
                    <svg class="chevron {expandedHistoryId === order.id ? 'down' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {#if expandedHistoryId === order.id}
                    <div class="history-card-body">
                      {#if order.referenceImage}
                        <div class="reference-image">
                          <img src={order.referenceImage} alt="成品效果参考图" />
                          <div class="image-caption">成品效果参考图</div>
                        </div>
                      {/if}
                      {#if order.workshopNote}
                        <div class="history-workshop-note">
                          <span class="note-icon">⚠</span>
                          <div>
                            <div class="note-title-small">当时工坊备注</div>
                            <div class="note-content-small">{order.workshopNote}</div>
                          </div>
                        </div>
                      {/if}
                      <div class="history-price-single">当时总价 ¥{calcOrderPrice(order)}</div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if !hasRelatedHistory && $customerHistory.length > 0}
          <div class="history-group">
            <div class="group-label">
              <span class="group-dot dot-all"></span>
              全部历史订单
            </div>
            <div class="history-list">
              {#each $customerHistory.slice(0, 3) as order}
                <div class="history-card simple">
                  <div class="history-card-header">
                    <div class="history-thumb placeholder small">
                      <ProductPreview order={order} compact={true} />
                    </div>
                    <div class="history-info">
                      <div class="history-title">
                        <span class={`status-dot ${getStatusClass(order.status)}`}></span>
                        {products.find(p => p.id === order.productId)?.name} · {formatDate(order.createdAt)}
                      </div>
                      <div class="history-config">
                        <span class="color-dot" style="background: {leatherColors.find(l => l.id === order.leatherColorId)?.hex}"></span>
                        {leatherColors.find(l => l.id === order.leatherColorId)?.name} ·
                        {hardwares.find(h => h.id === order.hardwareId)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="identity-hint">
      <span class="hint-icon">👤</span>
      <div>
        <p class="hint-title">填写姓名和手机号</p>
        <p class="hint-text">可查看您的历史定制记录与成品参考图</p>
      </div>
    </div>
  {/if}

</div>

<style>
  .order-checklist {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .workshop-notes-section {
    background: #FFF4E6;
    border: 1px solid rgba(160, 82, 45, 0.3);
    border-radius: var(--radius-lg);
    padding: 16px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .section-icon {
    font-size: 18px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    flex: 1;
    margin: 0;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-danger {
    background: #FFEBEE;
    color: var(--color-danger);
  }

  .badge-warm {
    background: #FFF4E6;
    color: #A0522D;
  }

  .workshop-notes-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .workshop-note-card {
    background: white;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .workshop-note-card.warning {
    border-color: rgba(229, 57, 53, 0.2);
  }

  .workshop-note-card.info {
    border-color: rgba(160, 82, 45, 0.15);
  }

  .workshop-note-card.expanded {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .note-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
  }

  .note-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .note-title-wrap {
    flex: 1;
    min-width: 0;
  }

  .note-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
  }

  .note-suggestion {
    font-size: 11px;
    color: #A0522D;
    margin-top: 2px;
  }

  .chevron {
    flex-shrink: 0;
    color: var(--color-text-light);
    transition: transform 0.2s;
  }

  .chevron.down {
    transform: rotate(180deg);
  }

  .note-body {
    padding: 0 14px 14px;
    border-top: 1px dashed var(--color-border);
    padding-top: 12px;
    margin-top: 0;
  }

  .note-content {
    font-size: 12px;
    color: var(--color-text-light);
    line-height: 1.7;
    margin: 0 0 12px 0;
  }

  .note-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .note-action-btn {
    padding: 6px 12px;
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
    border: 1px solid var(--color-secondary);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--color-primary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .note-action-btn:hover {
    background: var(--color-secondary);
    transform: translateY(-1px);
  }

  .checklist-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
  }

  .checklist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .checklist-header > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checklist-icon {
    font-size: 20px;
  }

  .checklist-title {
    font-size: 17px;
    font-weight: 700;
    margin: 0;
    color: var(--color-text);
  }

  .checklist-subtitle {
    font-size: 11px;
    color: var(--color-text-light);
  }

  .checklist-preview {
    margin-bottom: 16px;
  }

  .checklist-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2px;
    background: var(--color-border);
    border-radius: var(--radius-md);
    padding: 1px;
    overflow: hidden;
  }

  @media (min-width: 640px) {
    .checklist-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--color-surface);
    border: none;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }

  .checklist-item:hover {
    background: #FFFBF5;
  }

  .item-icon {
    font-size: 16px;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-label {
    font-size: 10px;
    color: var(--color-text-light);
    margin-bottom: 2px;
  }

  .item-value {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .item-extra {
    font-size: 11px;
    color: var(--color-text-light);
    font-weight: 400;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .color-dot.small {
    width: 10px;
    height: 10px;
  }

  .item-arrow {
    color: var(--color-text-light);
    flex-shrink: 0;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .checklist-item:hover .item-arrow {
    opacity: 1;
    color: var(--color-primary);
  }

  .checklist-summary {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed var(--color-border);
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .summary-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-label {
    font-size: 11px;
    color: var(--color-text-light);
  }

  .summary-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .summary-value.price {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-primary);
  }

  .summary-value.highlight {
    color: var(--color-success);
  }

  .history-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
  }

  .empty-history {
    text-align: center;
    padding: 30px 20px;
  }

  .empty-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 10px;
    opacity: 0.5;
  }

  .empty-history p {
    font-size: 13px;
    color: var(--color-text);
    margin: 0 0 4px 0;
  }

  .empty-hint {
    font-size: 11px !important;
    color: var(--color-text-light) !important;
  }

  .history-group {
    margin-bottom: 18px;
  }

  .history-group:last-child {
    margin-bottom: 0;
  }

  .group-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-light);
    margin-bottom: 10px;
  }

  .group-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot-product {
    background: var(--color-primary);
  }

  .dot-leather {
    background: var(--color-success);
  }

  .dot-all {
    background: var(--color-text-light);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .history-card {
    background: var(--color-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .history-card:hover {
    border-color: var(--color-border);
  }

  .history-card.expanded {
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .history-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
  }

  .history-card.simple .history-card-header {
    cursor: default;
  }

  .history-thumb {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #F8F4EF, #EEE5D8);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .history-thumb.small {
    width: 48px;
    height: 48px;
  }

  .history-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .history-thumb.placeholder :global(.product-preview) {
    padding: 2px;
    box-shadow: none;
    background: transparent;
  }

  .history-thumb.placeholder :global(.preview-info),
  .history-thumb.placeholder :global(.preview-header) {
    display: none;
  }

  .history-thumb.placeholder :global(.preview-stage) {
    min-height: 0;
    padding: 2px;
    margin: 0;
  }

  .history-info {
    flex: 1;
    min-width: 0;
  }

  .history-title {
    font-size: 12px;
    color: var(--color-text-light);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-completed {
    background: var(--color-success);
  }

  .status-crafting {
    background: #FF9800;
    animation: pulse 1.5s infinite;
  }

  .status-queued {
    background: var(--color-text-light);
  }

  .history-config {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .history-diff,
  .history-same {
    margin-top: 4px;
  }

  .diff-badge {
    display: inline-block;
    padding: 2px 8px;
    background: #FFF4E6;
    color: #A0522D;
    font-size: 10px;
    font-weight: 600;
    border-radius: 100px;
  }

  .same-badge {
    display: inline-block;
    padding: 2px 8px;
    background: #E8F5E9;
    color: var(--color-success);
    font-size: 10px;
    font-weight: 600;
    border-radius: 100px;
  }

  .history-card-body {
    padding: 0 12px 12px;
    border-top: 1px dashed var(--color-border);
    padding-top: 12px;
    margin-top: 0;
  }

  .reference-image {
    margin-bottom: 12px;
  }

  .reference-image img {
    width: 100%;
    border-radius: var(--radius-sm);
    display: block;
  }

  .image-caption {
    font-size: 11px;
    color: var(--color-text-light);
    text-align: center;
    margin-top: 6px;
  }

  .diff-section {
    margin-bottom: 12px;
  }

  .diff-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .diff-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .diff-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 6px 10px;
    background: var(--color-bg);
    border-radius: var(--radius-sm);
  }

  .diff-label {
    color: var(--color-text-light);
    min-width: 70px;
    flex-shrink: 0;
  }

  .diff-values {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    flex-wrap: wrap;
  }

  .diff-prev {
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: line-through;
    opacity: 0.7;
  }

  .diff-current {
    color: var(--color-primary);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .diff-values svg {
    color: var(--color-text-light);
    flex-shrink: 0;
  }

  .history-workshop-note {
    display: flex;
    gap: 10px;
    padding: 10px 12px;
    background: #FFF4E6;
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
  }

  .history-workshop-note .note-icon {
    font-size: 16px;
  }

  .note-title-small {
    font-size: 11px;
    color: var(--color-text-light);
    margin-bottom: 2px;
  }

  .note-content-small {
    font-size: 12px;
    color: #A0522D;
    line-height: 1.5;
  }

  .history-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .apply-btn {
    padding: 8px 14px;
    background: linear-gradient(135deg, #8B4513, #A0522D);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .apply-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }

  .history-price,
  .history-price-single {
    font-size: 12px;
    color: var(--color-text-light);
    font-weight: 500;
  }

  .history-price-single {
    text-align: right;
    padding-top: 4px;
  }

  .identity-hint {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
    border: 1px dashed var(--color-secondary);
    border-radius: var(--radius-md);
  }

  .hint-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .hint-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 2px 0;
  }

  .hint-text {
    font-size: 11px;
    color: var(--color-text-light);
    margin: 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
