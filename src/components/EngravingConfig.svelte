<script>
  import { orderConfig, selectedProduct, selectedFont, selectedDepth, engravingBoundaryCheck, engravingCharValidation } from '../store/orderStore.js';
  import { fonts, engravingDepths, engravingPositions } from '../data/options.js';

  $: positions = engravingPositions[$orderConfig.productId] || [];
  $: charsCount = $orderConfig.engravingText.length;
  $: maxChars = $selectedProduct?.maxChars || 12;
  $: extraCost = Math.max(0, charsCount - 3) * 8;

  function updateMargin(e) {
    orderConfig.update(c => ({ ...c, engravingMargin: parseInt(e.target.value) }));
  }

  function getSuggestionIcon(type) {
    switch (type) {
      case 'fontSize': return '🔤';
      case 'position': return '📍';
      case 'wrap': return '↩️';
      case 'margin': return '📏';
      default: return '💡';
    }
  }

  function applySuggestion(suggestion) {
    switch (suggestion.type) {
      case 'position':
        orderConfig.update(c => ({ ...c, engravingPositionId: suggestion.value }));
        break;
      case 'margin':
        orderConfig.update(c => ({ ...c, engravingMargin: suggestion.value }));
        break;
      case 'wrap':
        const text = $orderConfig.engravingText;
        const mid = Math.ceil(text.length / 2);
        let breakpoint = mid;
        for (let i = mid; i < text.length; i++) {
          if (text[i] === ' ') { breakpoint = i + 1; break; }
        }
        for (let i = mid; i > 0; i--) {
          if (text[i] === ' ') { breakpoint = i + 1; break; }
        }
        const wrapped = text.slice(0, breakpoint) + '\n' + text.slice(breakpoint);
        orderConfig.update(c => ({ ...c, engravingText: wrapped }));
        break;
    }
  }
</script>

<div class="engraving-config">
  <h3 class="section-title">刻字定制</h3>

  <div class="engraving-input-section">
    <label class="form-label">
      刻字内容
      {#if charsCount > 0}
        <span class="chars-counter {charsCount > maxChars ? 'over' : ''}">
          {charsCount}/{maxChars}
        </span>
      {/if}
    </label>
    <input
      type="text"
      class="form-input engraving-input {$engravingBoundaryCheck.isOverflowing || !$engravingCharValidation.isValid ? 'input-warning' : ''}"
      placeholder="输入您想刻的文字（中英文、数字均可）"
      bind:value={$orderConfig.engravingText}
      maxlength={maxChars}
    />
    <div class="engraving-tip">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
      <span>建议刻写名字缩写、纪念日、短诗句。前3字免费，超出 ¥8/字</span>
    </div>
    {#if charsCount > 3}
      <div class="extra-cost-badge badge badge-warm">
        超出字符 ({charsCount - 3}字)：+¥{extraCost}
      </div>
    {/if}

    {#if $orderConfig.engravingText && (!$engravingCharValidation.isValid || $engravingCharValidation.warnings.length > 0)}
      <div class="validation-alerts">
        {#each $engravingCharValidation.issues as issue}
          <div class="alert alert-danger">
            <span class="alert-icon">⚠️</span>
            <span class="alert-text">{issue.message}</span>
          </div>
        {/each}
        {#each $engravingCharValidation.warnings as warning}
          <div class="alert alert-warning">
            <span class="alert-icon">💡</span>
            <span class="alert-text">{warning.message}</span>
          </div>
        {/each}
      </div>
    {/if}

    {#if $orderConfig.engravingText && $engravingBoundaryCheck.isOverflowing}
      <div class="boundary-alert">
        <div class="alert alert-danger">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">
            刻字内容超出安全边距！
            {#if $engravingBoundaryCheck.overflowX > 0}
              横向超出 {Math.round($engravingBoundaryCheck.overflowX / 2)}px
            {/if}
            {#if $engravingBoundaryCheck.overflowY > 0}
              纵向超出 {Math.round($engravingBoundaryCheck.overflowY / 2)}px
            {/if}
          </span>
        </div>
        {#if $engravingBoundaryCheck.suggestions.length > 0}
          <div class="suggestions-list">
            <div class="suggestions-title">🔧 调整建议：</div>
            {#each $engravingBoundaryCheck.suggestions as suggestion}
              <button class="suggestion-btn" on:click={() => applySuggestion(suggestion)}>
                <span class="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
                <span class="suggestion-text">{suggestion.label}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="sub-section">
    <h4 class="sub-title">字体样式</h4>
    <div class="font-grid">
      {#each fonts as font}
        <div
          class="option-card font-card {$orderConfig.engravingFontId === font.id ? 'selected' : ''}"
          on:click={() => orderConfig.update(c => ({ ...c, engravingFontId: font.id }))}
        >
          <div class="font-sample" style="font-family: {font.css};">
            {$orderConfig.engravingText || font.sample}
          </div>
          <div class="font-name">{font.name}</div>
        </div>
      {/each}
    </div>
  </div>

  <div class="sub-section">
    <h4 class="sub-title">压印深浅</h4>
    <div class="depth-grid">
      {#each engravingDepths as depth}
        <div
          class="option-card depth-card {$orderConfig.engravingDepthId === depth.id ? 'selected' : ''}"
          on:click={() => orderConfig.update(c => ({ ...c, engravingDepthId: depth.id }))}
        >
          <div class="depth-visual">
            <div class="depth-line" style="--depth: {depth.depth}"></div>
          </div>
          <div class="depth-info">
            <div class="depth-name">{depth.name}</div>
            <div class="depth-desc">{depth.desc}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="sub-section">
    <h4 class="sub-title">刻字位置</h4>
    <div class="position-grid">
      {#each positions as pos}
        <div
          class="option-card position-card {$orderConfig.engravingPositionId === pos.id ? 'selected' : ''}"
          on:click={() => orderConfig.update(c => ({ ...c, engravingPositionId: pos.id }))}
        >
          <span class="position-name">{pos.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="sub-section">
    <h4 class="sub-title">
      边距调节
      <span class="margin-value">{$orderConfig.engravingMargin}mm</span>
    </h4>
    <input
      type="range"
      class="margin-slider"
      min="3"
      max="25"
      value={$orderConfig.engravingMargin}
      on:input={updateMargin}
    />
    <div class="margin-labels">
      <span>紧凑 3mm</span>
      <span>适中</span>
      <span>宽松 25mm</span>
    </div>
  </div>
</div>

<style>
  .engraving-config {
    margin-bottom: 32px;
  }

  .engraving-input-section {
    margin-bottom: 24px;
  }

  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chars-counter {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-light);
    background: rgba(0,0,0,0.05);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .chars-counter.over {
    color: var(--color-danger);
    background: rgba(123, 45, 38, 0.1);
  }

  .engraving-input {
    font-size: 18px;
    letter-spacing: 1px;
    padding: 14px 18px;
  }

  .engraving-tip {
    margin-top: 8px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-light);
    line-height: 1.5;
  }

  .engraving-tip svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .extra-cost-badge {
    margin-top: 10px;
  }

  .sub-section {
    margin-bottom: 24px;
  }

  .sub-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .font-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 768px) {
    .font-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .font-card {
    text-align: center;
    padding: 14px 10px;
  }

  .font-sample {
    font-size: 18px;
    margin-bottom: 6px;
    min-height: 28px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .font-name {
    font-size: 11px;
    color: var(--color-text-light);
  }

  .depth-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .depth-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px 10px;
  }

  .depth-visual {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #E8D5BE, #D4B896);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .depth-line {
    width: 60%;
    height: calc(var(--depth) * 8px + 4px);
    background: rgba(0,0,0,0.3);
    border-radius: 2px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  }

  .depth-info {
    text-align: center;
  }

  .depth-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .depth-desc {
    font-size: 11px;
    color: var(--color-text-light);
  }

  .position-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 768px) {
    .position-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .position-card {
    text-align: center;
    padding: 12px;
  }

  .position-name {
    font-size: 13px;
    font-weight: 500;
  }

  .margin-value {
    font-size: 13px;
    color: var(--color-primary);
    font-weight: 500;
    background: rgba(139, 69, 19, 0.1);
    padding: 3px 10px;
    border-radius: 100px;
  }

  .margin-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border);
    outline: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .margin-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
    transition: transform 0.2s;
  }

  .margin-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .margin-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
  }

  .margin-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--color-text-light);
    margin-top: 6px;
  }

  .input-warning {
    border-color: var(--color-danger) !important;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  .validation-alerts {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .boundary-alert {
    margin-top: 12px;
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
  }

  .suggestions-list {
    margin-top: 12px;
    background: #F8F4EF;
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .suggestions-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 10px;
  }

  .suggestion-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--color-text);
    text-align: left;
    transition: all 0.2s ease;
    margin-bottom: 6px;
  }

  .suggestion-btn:hover {
    border-color: var(--color-primary);
    background: #FFFBF5;
    transform: translateX(4px);
  }

  .suggestion-btn:last-child {
    margin-bottom: 0;
  }

  .suggestion-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .suggestion-text {
    flex: 1;
    font-weight: 500;
  }
</style>
