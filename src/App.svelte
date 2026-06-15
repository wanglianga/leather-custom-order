<script>
  import './app.css';
  import CustomerPage from './components/CustomerPage.svelte';
  import StaffPage from './components/StaffPage.svelte';

  let view = 'customer';

  function switchView(v) {
    view = v;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

{#if typeof window !== 'undefined'}
  {#if !new URLSearchParams(window.location.search).get('staff') && !window.location.hash.includes('staff') && view !== 'staff'}
    <CustomerPage />
    <button class="view-switcher staff-entry" on:click={() => switchView('staff')}>
      🛠 切换到 店员工作台
    </button>
  {:else}
    <StaffPage />
    <button class="view-switcher customer-entry" on:click={() => switchView('customer')}>
      🛍 切换到 顾客下单页
    </button>
  {/if}
{:else}
  <CustomerPage />
{/if}

<style>
  .view-switcher {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 6px 24px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    color: white;
  }

  .staff-entry {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
  }

  .staff-entry:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 32px rgba(26,26,46,0.35);
  }

  .customer-entry {
    background: linear-gradient(135deg, #8B4513, #A0522D);
  }

  .customer-entry:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 32px rgba(139,69,19,0.35);
  }

  @media (max-width: 767px) {
    .view-switcher {
      bottom: 88px;
      right: 12px;
      font-size: 11px;
      padding: 10px 16px;
    }
  }
</style>
