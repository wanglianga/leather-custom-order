<script>
  import { orderConfig, materialAvailability } from '../store/orderStore.js';
  import { hardwares, threadColors, materialStock, soldOutAlternatives, hardwares as allHardwares } from '../data/options.js';

  function getHardwareStock(hwId) {
    return materialStock.hardware[hwId];
  }

  function getThreadStock(threadId) {
    return materialStock.thread[threadId];
  }

  function selectHardwareAlternative(altId) {
    orderConfig.update(c => ({ ...c, hardwareId: altId }));
  }

  function selectThreadAlternative(altId) {
    orderConfig.update(c => ({ ...c, threadColorId: altId }));
  }
</script>

<div class="hardware-selector">
  <h3 class="section-title">五金配件</h3>
  <div class="hardware-grid">
    {#each hardwares as hw}
      {@const stock = getHardwareStock(hw.id)}
      {@const soldOut = stock?.soldOut}
      {@const alternatives = soldOutAlternatives.hardware[hw.id]}
      <div
        class="option-card hardware-card {$orderConfig.hardwareId === hw.id ? 'selected' : ''} {soldOut ? 'sold-out' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, hardwareId: hw.id }))}
      >
        <div class="hardware-samples">
          <div class="hw-ring" style="background: linear-gradient(145deg, {hw.hex}, {adjustColor(hw.hex, -20)}); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.2);">
            {#if soldOut}
              <div class="sold-out-badge">售罄</div>
            {/if}
          </div>
          <div class="hw-clasp" style="background: linear-gradient(145deg, {hw.hex}, {adjustColor(hw.hex, -25)});"></div>
        </div>
        <div class="hardware-info">
          <div class="hardware-name">{hw.name}</div>
          <div class="hardware-desc">{hw.desc}</div>
          {#if stock && !soldOut}
            <div class="stock-info">
              <span class="stock-dot {stock.count < 20 ? 'low' : ''}"></span>
              <span class="stock-text">库存 {stock.count} {stock.unit}</span>
            </div>
          {/if}
        </div>
      </div>
      {#if soldOut && alternatives}
        <div class="alternative-panel">
          <div class="alternative-header">
            <span class="alternative-icon">🔄</span>
            <span class="alternative-title">该五金已售罄，推荐以下替代：</span>
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
              {@const altHw = allHardwares.find(h => h.id === altId)}
              {#if altHw}
                <button class="alternative-btn" on:click={() => selectHardwareAlternative(altId)}>
                  <span class="alt-color-dot" style="background: {altHw.hex}"></span>
                  <span class="alt-color-name">{altHw.name}</span>
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <h3 class="section-title" style="margin-top: 24px;">缝线颜色</h3>
  <div class="thread-grid">
    {#each threadColors as thread}
      {@const stock = getThreadStock(thread.id)}
      {@const soldOut = stock?.soldOut}
      {@const alternatives = soldOutAlternatives.thread[thread.id]}
      <div
        class="option-card thread-card {$orderConfig.threadColorId === thread.id ? 'selected' : ''} {soldOut ? 'sold-out' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, threadColorId: thread.id }))}
      >
        <div class="thread-preview" style="background: {thread.hex}">
          <div class="thread-stitch" style="background: {adjustColor(thread.hex, 20)};"></div>
          <div class="thread-stitch" style="background: {adjustColor(thread.hex, 20)}; left: 12px;"></div>
          <div class="thread-stitch" style="background: {adjustColor(thread.hex, 20)}; left: 24px;"></div>
          <div class="thread-stitch" style="background: {adjustColor(thread.hex, 20)}; left: 36px;"></div>
          {#if soldOut}
            <div class="sold-out-overlay">
              <span class="sold-out-text">售罄</span>
            </div>
          {/if}
        </div>
        <div class="thread-info">
          <div class="thread-name">{thread.name}</div>
          <div class="thread-desc">{thread.desc}</div>
          {#if stock && !soldOut}
            <div class="stock-info small">
              <span class="stock-dot {stock.spool < 5 ? 'low' : ''}"></span>
              <span class="stock-text">{stock.spool} {stock.unit}</span>
            </div>
          {/if}
        </div>
      </div>
      {#if soldOut && alternatives}
        <div class="alternative-panel">
          <div class="alternative-header">
            <span class="alternative-icon">🔄</span>
            <span class="alternative-title">该缝线颜色已售罄，推荐以下替代：</span>
          </div>
          {#if alternatives.colorDiff}
            <div class="alternative-note">
              <span class="note-icon">🎨</span>
              <span class="note-text">{alternatives.colorDiff}</span>
            </div>
          {/if}
          <div class="alternative-buttons">
            {#each alternatives.alternatives as altId}
              {@const altThread = threadColors.find(t => t.id === altId)}
              {#if altThread}
                <button class="alternative-btn" on:click={() => selectThreadAlternative(altId)}>
                  <span class="alt-color-dot" style="background: {altThread.hex}"></span>
                  <span class="alt-color-name">{altThread.name}</span>
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<script context="module">
  function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
</script>

<style>
  .hardware-selector {
    margin-bottom: 32px;
  }

  .hardware-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 768px) {
    .hardware-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .hardware-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px;
  }

  .hardware-samples {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .hw-ring {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    position: relative;
  }

  .hw-ring::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: var(--color-bg);
  }

  .hw-clasp {
    width: 20px;
    height: 14px;
    border-radius: 3px 3px 7px 7px;
    position: relative;
  }

  .hw-clasp::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: inherit;
  }

  .hardware-info {
    text-align: center;
  }

  .hardware-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .hardware-desc {
    font-size: 11px;
    color: var(--color-text-light);
  }

  .hardware-card.sold-out,
  .thread-card.sold-out {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .hardware-card.sold-out:hover,
  .thread-card.sold-out:hover {
    transform: none;
    border-color: var(--color-border);
  }

  .hw-ring {
    position: relative;
  }

  .sold-out-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 8px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 2px;
  }

  .stock-info {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    justify-content: center;
  }

  .stock-info.small {
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

  .note-icon {
    flex-shrink: 0;
    font-size: 12px;
  }

  .note-text {
    flex: 1;
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

  .thread-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 768px) {
    .thread-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .thread-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
  }

  .thread-preview {
    width: 60px;
    height: 36px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }

  .thread-stitch {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 20px;
    border-radius: 3px;
    left: 0;
  }

  .sold-out-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
  }

  .sold-out-text {
    color: white;
    font-size: 9px;
    font-weight: 700;
    transform: rotate(-15deg);
  }

  .thread-info {
    flex: 1;
    min-width: 0;
  }

  .thread-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .thread-desc {
    font-size: 11px;
    color: var(--color-text-light);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
