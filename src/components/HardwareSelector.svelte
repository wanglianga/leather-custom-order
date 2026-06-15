<script>
  import { orderConfig } from '../store/orderStore.js';
  import { hardwares } from '../data/options.js';
</script>

<div class="hardware-selector">
  <h3 class="section-title">五金配件</h3>
  <div class="hardware-grid">
    {#each hardwares as hw}
      <div
        class="option-card hardware-card {$orderConfig.hardwareId === hw.id ? 'selected' : ''}"
        on:click={() => orderConfig.update(c => ({ ...c, hardwareId: hw.id }))}
      >
        <div class="hardware-samples">
          <div class="hw-ring" style="background: linear-gradient(145deg, {hw.hex}, {adjustColor(hw.hex, -20)}); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.2);"></div>
          <div class="hw-clasp" style="background: linear-gradient(145deg, {hw.hex}, {adjustColor(hw.hex, -25)});"></div>
        </div>
        <div class="hardware-info">
          <div class="hardware-name">{hw.name}</div>
          <div class="hardware-desc">{hw.desc}</div>
        </div>
      </div>
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
</style>
