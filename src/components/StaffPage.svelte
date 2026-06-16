<script>
  import { orders } from '../store/orderStore.js';
  import { estimateCompletionDate, calcOrderPrice } from '../store/orderStore.js';
  import { leatherColors, hardwares, products, materialStock } from '../data/options.js';
  import ProductPreview from './ProductPreview.svelte';

  let activeTab = 'orders';
  let selectedOrderId = null;
  let filterStatus = 'all';

  const tabs = [
    { id: 'orders', name: '订单管理', icon: '📋' },
    { id: 'materials', name: '材料库存', icon: '📦' },
    { id: 'production', name: '生产进度', icon: '⚙️' }
  ];

  const statusMap = {
    queued: { label: '待开始', class: 'badge-info' },
    crafting: { label: '制作中', class: 'badge-warm' },
    completed: { label: '已完成', class: 'badge-success' },
    delivered: { label: '已交付', class: 'badge-success' }
  };

  $: filteredOrders = $orders.filter(o => filterStatus === 'all' || o.status === filterStatus);
  $: stats = {
    total: $orders.length,
    queued: $orders.filter(o => o.status === 'queued').length,
    crafting: $orders.filter(o => o.status === 'crafting').length,
    completed: $orders.filter(o => o.status === 'completed').length,
    revenue: $orders.reduce((sum, o) => sum + calcOrderPrice(o), 0)
  };
  $: selectedOrder = $orders.find(o => o.id === selectedOrderId);

  const productNameMap = { keychain: '钥匙扣', cardholder: '卡包', wallet: '短夹', passport: '护照夹' };
  const colorNameMap = Object.fromEntries(leatherColors.map(c => [c.id, c.name]));
  const hwNameMap = Object.fromEntries(hardwares.map(h => [h.id, h.name]));
  const textureNameMap = { smooth: '平纹', grained: '荔枝纹', pebbled: '卵石纹', suede: '麂皮绒', croc: '鳄鱼纹' };
  const boxNameMap = { none: '简易', standard: '标准', premium: '豪华' };
  const pickupNameMap = { store: '自提', express: '快递', samecity: '闪送' };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d - now) / 86400000);
    return `${d.getMonth() + 1}/${d.getDate()} ${diff >= 0 ? `(还${diff}天)` : `(逾期${-diff}天)`}`;
  }

  function formatCompletion(order) {
    const d = estimateCompletionDate(order);
    const now = new Date();
    const diff = Math.ceil((d - now) / 86400000);
    return {
      text: `${d.getMonth() + 1}月${d.getDate()}日`,
      diff,
      urgent: diff <= 1
    };
  }

  function setStatus(orderId, status) {
    orders.update(list => list.map(o => {
      if (o.id === orderId) {
        const progress = status === 'queued' ? 0 : status === 'crafting' ? 50 : status === 'completed' ? 100 : 100;
        return { ...o, status, progress };
      }
      return o;
    }));
  }

  function updateProgress(orderId, progress) {
    orders.update(list => list.map(o => o.id === orderId ? { ...o, progress } : o));
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function calcMaterials(order) {
    const leatherUse = (materialStock.leather[order.leatherColorId]?.perProduct?.[order.productId] || 0.1);
    return {
      leather: { color: colorNameMap[order.leatherColorId], use: leatherUse.toFixed(2) },
      hardware: hwNameMap[order.hardwareId]
    };
  }
</script>

<div class="staff-page">
  <header class="staff-header">
    <div class="header-left">
      <div class="brand-mini">🛠 工坊管理系统</div>
      <div class="header-stats">
        <span class="stat-item">📋 今日订单 <b>{stats.queued + stats.crafting}</b></span>
        <span class="stat-item">💰 累计收入 <b>¥{stats.revenue.toLocaleString()}</b></span>
      </div>
    </div>
    <div class="header-right">
      <div class="staff-info">
        <span class="avatar">👨‍🔧</span>
        <div>
          <div class="staff-name">张师傅</div>
          <div class="staff-role">工艺师 · 班组长</div>
        </div>
      </div>
    </div>
  </header>

  <nav class="staff-nav">
    {#each tabs as tab}
      <button class="nav-tab {activeTab === tab.id ? 'active' : ''}"
              on:click={() => activeTab = tab.id}>
        <span class="tab-icon">{tab.icon}</span>
        <span>{tab.name}</span>
        {#if tab.id === 'orders' && stats.queued > 0}
          <span class="tab-badge">{stats.queued}</span>
        {/if}
      </button>
    {/each}
  </nav>

  <main class="staff-main">
    {#if activeTab === 'orders'}
      <section class="orders-section">
        <div class="orders-toolbar">
          <div class="status-filters">
            <button class="filter-btn {filterStatus === 'all' ? 'active' : ''}" on:click={() => filterStatus = 'all'}>
              全部 <span class="count">({stats.total})</span>
            </button>
            <button class="filter-btn {filterStatus === 'queued' ? 'active' : ''}" on:click={() => filterStatus = 'queued'}>
              待开始 <span class="count">({stats.queued})</span>
            </button>
            <button class="filter-btn {filterStatus === 'crafting' ? 'active' : ''}" on:click={() => filterStatus = 'crafting'}>
              制作中 <span class="count">({stats.crafting})</span>
            </button>
            <button class="filter-btn {filterStatus === 'completed' ? 'active' : ''}" on:click={() => filterStatus = 'completed'}>
              已完成 <span class="count">({stats.completed})</span>
            </button>
          </div>
        </div>

        <div class="orders-layout">
          <div class="orders-list">
            {#each filteredOrders as order}
              {@const comp = formatCompletion(order)}
              {@const mats = calcMaterials(order)}
              <div class="order-card {selectedOrderId === order.id ? 'selected' : ''} {comp.urgent && order.status !== 'completed' ? 'urgent' : ''}"
                   on:click={() => selectedOrderId = order.id}>
                <div class="order-header">
                  <div class="order-no">#{order.orderNumber}</div>
                  <span class="badge {statusMap[order.status]?.class || 'badge-info'}">
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
                <div class="order-body">
                  <div class="order-preview-mini">
                    <ProductPreview compact={true} order={order} />
                  </div>
                  <div class="order-info">
                    <div class="order-product">
                      <span class="product-icon">
                        {order.productId === 'keychain' ? '🔑' : order.productId === 'cardholder' ? '💳' : order.productId === 'wallet' ? '👛' : '🛂'}
                      </span>
                      <b>{productNameMap[order.productId]}</b>
                    </div>
                    <div class="order-specs">
                      <span>{mats.leather.color} {textureNameMap[order.textureId]}</span>
                      <span>· 五金{mats.hardware}</span>
                    </div>
                    {#if order.engravingText}
                      <div class="order-engraving">
                        ✍️ "{order.engravingText}"
                      </div>
                    {/if}
                    <div class="order-meta">
                      <span>👤 {order.customerName || '匿名'}</span>
                      <span>📱 {order.customerPhone}</span>
                    </div>
                    {#if order.specialNote}
                      <div class="order-note">
                        📝 {order.specialNote}
                      </div>
                    {/if}
                  </div>
                </div>
                <div class="order-footer">
                  <div class="completion {comp.urgent && order.status !== 'completed' ? 'urgent' : ''}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    完工 {comp.text} {comp.urgent && order.status !== 'completed' ? '🔥' : ''}
                  </div>
                  <div class="order-price">¥{calcOrderPrice(order)}</div>
                </div>
                {#if order.status !== 'completed' && order.status !== 'delivered'}
                  <div class="order-progress">
                    <div class="progress-track">
                      <div class="progress-fill" style="width: {order.progress}%"></div>
                    </div>
                    <span class="progress-text">{order.progress}%</span>
                  </div>
                {/if}
              </div>
            {/each}
            {#if filteredOrders.length === 0}
              <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div>暂无订单</div>
              </div>
            {/if}
          </div>

          <div class="order-detail-panel">
            {#if selectedOrder}
              {@const comp = formatCompletion(selectedOrder)}
              <div class="detail-header">
                <h3>订单详情</h3>
                <div class="detail-actions">
                  {#if selectedOrder.status === 'queued'}
                    <button class="btn-action start" on:click={() => setStatus(selectedOrder.id, 'crafting')}>
                      ▶ 开始制作
                    </button>
                  {/if}
                  {#if selectedOrder.status === 'crafting'}
                    <button class="btn-action complete" on:click={() => setStatus(selectedOrder.id, 'completed')}>
                      ✓ 标记完成
                    </button>
                  {/if}
                  {#if selectedOrder.status === 'completed'}
                    <button class="btn-action deliver" on:click={() => setStatus(selectedOrder.id, 'delivered')}>
                      🚚 已交付
                    </button>
                  {/if}
                </div>
              </div>

              <div class="detail-preview">
                <ProductPreview order={selectedOrder} />
              </div>

              {#if selectedOrder.status === 'crafting'}
                <div class="progress-control">
                  <label>制作进度调整：</label>
                  <input type="range" min="0" max="100" value={selectedOrder.progress}
                         on:input={(e) => updateProgress(selectedOrder.id, parseInt(e.target.value))}/>
                  <span>{selectedOrder.progress}%</span>
                </div>
              {/if}

              <div class="detail-sections">
                <div class="detail-section">
                  <h4>📋 订单信息</h4>
                  <div class="info-grid">
                    <div class="info-pair">
                      <span class="k">订单号</span>
                      <span class="v">#{selectedOrder.orderNumber}</span>
                    </div>
                    <div class="info-pair">
                      <span class="k">下单时间</span>
                      <span class="v">{formatTime(selectedOrder.createdAt)}</span>
                    </div>
                    <div class="info-pair">
                      <span class="k">订单状态</span>
                      <span class="v"><span class="badge {statusMap[selectedOrder.status]?.class}">{statusMap[selectedOrder.status]?.label}</span></span>
                    </div>
                    <div class="info-pair">
                      <span class="k">预计完工</span>
                      <span class="v {comp.urgent ? 'text-danger' : 'text-success'}">{comp.text}</span>
                    </div>
                    <div class="info-pair">
                      <span class="k">订单金额</span>
                      <span class="v price">¥{calcOrderPrice(selectedOrder)}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>👤 客户信息</h4>
                  <div class="info-grid">
                    <div class="info-pair">
                      <span class="k">姓名</span>
                      <span class="v">{selectedOrder.customerName || '-'}</span>
                    </div>
                    <div class="info-pair">
                      <span class="k">电话</span>
                      <span class="v">{selectedOrder.customerPhone || '-'}</span>
                    </div>
                    <div class="info-pair">
                      <span class="k">取货方式</span>
                      <span class="v">{pickupNameMap[selectedOrder.pickupMethodId] || '自提'}</span>
                    </div>
                  </div>
                  {#if selectedOrder.specialNote}
                    <div class="note-box">
                      <b>📝 特殊备注：</b>
                      <p>{selectedOrder.specialNote}</p>
                    </div>
                  {/if}
                </div>

                <div class="detail-section">
                  <h4>📦 材料清单</h4>
                  <div class="materials-list">
                    <div class="mat-row">
                      <span class="mat-name">🍂 皮革 ({colorNameMap[selectedOrder.leatherColorId]})</span>
                      <span class="mat-qty">{(materialStock.leather[selectedOrder.leatherColorId]?.perProduct?.[selectedOrder.productId] || 0.1).toFixed(2)} 张</span>
                    </div>
                    <div class="mat-row">
                      <span class="mat-name">🔩 五金 ({hwNameMap[selectedOrder.hardwareId]})</span>
                      <span class="mat-qty">1 套</span>
                    </div>
                    <div class="mat-row">
                      <span class="mat-name">🧵 缝线</span>
                      <span class="mat-qty">约 3 米</span>
                    </div>
                    <div class="mat-row">
                      <span class="mat-name">🎁 包装</span>
                      <span class="mat-qty">{boxNameMap[selectedOrder.giftBoxId] || '简易'}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>✍️ 刻字信息</h4>
                  {#if selectedOrder.engravingText}
                    <div class="engraving-preview-box">
                      <div class="engraving-text">{selectedOrder.engravingText}</div>
                    </div>
                    <div class="info-grid">
                      <div class="info-pair">
                        <span class="k">字体</span>
                        <span class="v">{{serif:'衬线体',sans:'无衬线',script:'手写体',mono:'等宽体',stamp:'印章体'}[selectedOrder.engravingFontId] || '衬线体'}</span>
                      </div>
                      <div class="info-pair">
                        <span class="k">压印深度</span>
                        <span class="v">{{light:'浅',medium:'中',deep:'深'}[selectedOrder.engravingDepthId] || '中'}</span>
                      </div>
                      <div class="info-pair">
                        <span class="k">边距</span>
                        <span class="v">{selectedOrder.engravingMargin || 10}mm</span>
                      </div>
                    </div>
                  {:else}
                    <div class="empty-mini">无刻字</div>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="empty-state large">
                <div class="empty-icon">👈</div>
                <div>选择左侧订单查看详情</div>
              </div>
            {/if}
          </div>
        </div>
      </section>
    {/if}

    {#if activeTab === 'materials'}
      <section class="materials-section">
        <div class="materials-header">
          <h3>材料库存管理</h3>
          <div class="update-time">最后更新：刚刚</div>
        </div>

        <div class="materials-category">
          <h4>🍂 皮革原料</h4>
          <div class="stock-grid">
            {#each Object.entries(materialStock.leather) as [id, data]}
              {@const color = leatherColors.find(c => c.id === id)}
              {@const pct = Math.min(100, (data.sheet / 25) * 100)}
              {@const low = data.sheet < 8}
              <div class="stock-card {low ? 'low' : ''}">
                <div class="stock-color" style="background: {color?.hex || '#ccc'}"></div>
                <div class="stock-info">
                  <div class="stock-name">{color?.name || id}</div>
                  <div class="stock-amount">
                    <b>{data.sheet}</b> {data.unit}
                    {#if low}
                      <span class="low-tag">库存紧张</span>
                    {/if}
                  </div>
                  <div class="stock-bar">
                    <div class="stock-fill {low ? 'danger' : ''}" style="width: {pct}%"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="materials-category">
          <h4>🔩 五金配件</h4>
          <div class="stock-grid">
            {#each Object.entries(materialStock.hardware) as [id, data]}
              {@const hw = hardwares.find(h => h.id === id)}
              {@const pct = Math.min(100, (data.count / 150) * 100)}
              {@const low = data.count < 30}
              <div class="stock-card {low ? 'low' : ''}">
                <div class="stock-color hardware" style="background: linear-gradient(145deg, {hw?.hex}, #666)"></div>
                <div class="stock-info">
                  <div class="stock-name">{hw?.name || id}</div>
                  <div class="stock-amount">
                    <b>{data.count}</b> {data.unit}
                    {#if low}
                      <span class="low-tag">库存紧张</span>
                    {/if}
                  </div>
                  <div class="stock-bar">
                    <div class="stock-fill {low ? 'danger' : ''}" style="width: {pct}%"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="materials-category">
          <h4>🧵 缝线</h4>
          <div class="stock-grid">
            {#each Object.entries(materialStock.thread) as [id, data]}
              {@const pct = Math.min(100, (data.spool / 20) * 100)}
              {@const low = data.spool < 4}
              <div class="stock-card {low ? 'low' : ''}">
                <div class="stock-color thread" style="background: {{beige:'#D4B896',black:'#2C2C2C',brown:'#8B4513',navy:'#1E3A5F'}[id] || '#999'}"></div>
                <div class="stock-info">
                  <div class="stock-name">{{beige:'米色',black:'黑色',brown:'棕色',navy:'藏青'}[id] || id}</div>
                  <div class="stock-amount">
                    <b>{data.spool}</b> {data.unit}
                    {#if low}
                      <span class="low-tag">库存紧张</span>
                    {/if}
                  </div>
                  <div class="stock-bar">
                    <div class="stock-fill {low ? 'danger' : ''}" style="width: {pct}%"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="materials-category">
          <h4>📊 物料消耗预测（未来7天）</h4>
          <div class="forecast-card card">
            <div class="forecast-row">
              <span>根据当前待制作订单预估消耗：</span>
            </div>
            <div class="forecast-items">
              {#each ['tan','black','burgundy'] as colorId}
                {@const p = $orders.filter(o => o.status !== 'completed' && o.leatherColorId === colorId).length}
                {@const c = leatherColors.find(x => x.id === colorId)}
                {#if p > 0}
                  <div class="forecast-item">
                    <div class="dot" style="background:{c.hex}"></div>
                    <span>{c.name}：{p}件，约 {(p * 0.12).toFixed(1)} 张</span>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </section>
    {/if}

    {#if activeTab === 'production'}
      <section class="production-section">
        <div class="prod-header">
          <h3>生产进度总览</h3>
          <div class="today-badge">今日日期：{new Date().getMonth()+1}月{new Date().getDate()}日</div>
        </div>

        <div class="prod-stats">
          <div class="stat-card">
            <div class="stat-icon queued">⏳</div>
            <div class="stat-num">{stats.queued}</div>
            <div class="stat-label">待开始</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon crafting">🔨</div>
            <div class="stat-num">{stats.crafting}</div>
            <div class="stat-label">制作中</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon completed">✅</div>
            <div class="stat-num">{stats.completed}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon revenue">💰</div>
            <div class="stat-num">¥{stats.revenue}</div>
            <div class="stat-label">营业额</div>
          </div>
        </div>

        <div class="prod-timeline">
          <h4>📅 近期完工安排</h4>
          <div class="timeline-list">
            {#each $orders.filter(o => o.status !== 'completed' && o.status !== 'delivered').sort((a,b) =>
              estimateCompletionDate(a).getTime() - estimateCompletionDate(b).getTime()
            ) as order}
              {@const comp = formatCompletion(order)}
              <div class="timeline-item">
                <div class="timeline-date {comp.urgent ? 'urgent' : ''}">
                  <div class="day">{comp.text.split('月')[1].replace('日','')}</div>
                  <div class="month">{comp.text.split('月')[0]}月</div>
                </div>
                <div class="timeline-content">
                  <div class="t-title">
                    <b>#{order.orderNumber}</b>
                    · {productNameMap[order.productId]}
                    · {order.customerName || '匿名'}
                    {#if comp.urgent}<span class="badge badge-danger">加急</span>{/if}
                  </div>
                  <div class="t-sub">
                    {colorNameMap[order.leatherColorId]} · {textureNameMap[order.textureId]}
                    {#if order.engravingText} · 刻字"{order.engravingText}"{/if}
                  </div>
                  {#if order.specialNote}
                    <div class="t-note">📝 {order.specialNote}</div>
                  {/if}
                  <div class="t-progress">
                    <div class="pt-bar"><div class="pt-fill" style="width:{order.progress}%"></div></div>
                    <span>{order.progress}%</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  .staff-page {
    min-height: 100vh;
    background: #F5F6FA;
  }

  .staff-header {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
    padding: 16px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand-mini {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .header-stats {
    display: flex;
    gap: 20px;
    font-size: 13px;
    opacity: 0.9;
  }

  .header-stats b {
    color: #FFD700;
    font-size: 15px;
  }

  .staff-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .staff-name {
    font-weight: 600;
    font-size: 14px;
  }

  .staff-role {
    font-size: 11px;
    opacity: 0.7;
  }

  .staff-nav {
    background: white;
    padding: 0 28px;
    display: flex;
    gap: 4px;
    border-bottom: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .nav-tab {
    padding: 14px 22px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    position: relative;
  }

  .nav-tab:hover {
    color: #1a1a2e;
    background: #fafafa;
  }

  .nav-tab.active {
    color: #8B4513;
    border-bottom-color: #8B4513;
    background: rgba(139, 69, 19, 0.04);
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-badge {
    background: #e74c3c;
    color: white;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: 700;
  }

  .staff-main {
    padding: 24px 28px;
    max-width: 1600px;
    margin: 0 auto;
  }

  .orders-toolbar {
    margin-bottom: 16px;
  }

  .status-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 8px 16px;
    background: white;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    border-color: #8B4513;
    color: #8B4513;
  }

  .filter-btn.active {
    background: #8B4513;
    color: white;
    border-color: #8B4513;
  }

  .filter-btn .count {
    opacity: 0.75;
    font-weight: 400;
  }

  .orders-layout {
    display: grid;
    grid-template-columns: 1fr 480px;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 1100px) {
    .orders-layout {
      grid-template-columns: 1fr;
    }
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 240px);
    overflow-y: auto;
    padding-right: 8px;
  }

  .order-card {
    background: white;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .order-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  .order-card.selected {
    border-color: #8B4513;
    background: linear-gradient(135deg, #FFFBF5, #FFF8EC);
  }

  .order-card.urgent {
    border-left: 4px solid #e74c3c;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .order-no {
    font-weight: 700;
    font-size: 13px;
    color: #1a1a2e;
  }

  .order-body {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
  }

  .order-preview-mini {
    width: 90px;
    flex-shrink: 0;
  }

  .order-preview-mini :global(.product-preview) {
    padding: 4px;
  }

  .order-preview-mini :global(.preview-stage) {
    min-height: 60px;
    padding: 4px;
  }

  .order-info {
    flex: 1;
    min-width: 0;
  }

  .order-product {
    font-size: 14px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .product-icon {
    font-size: 16px;
  }

  .order-specs {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .order-engraving {
    font-size: 12px;
    color: #8B4513;
    background: rgba(139,69,19,0.06);
    padding: 3px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 4px;
  }

  .order-meta {
    font-size: 11px;
    color: #888;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .order-note {
    font-size: 11px;
    color: #A0522D;
    background: #FFF9E6;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 4px;
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px dashed #eee;
  }

  .completion {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .completion.urgent {
    color: #e74c3c;
    font-weight: 600;
  }

  .order-price {
    font-weight: 700;
    color: #8B4513;
    font-size: 16px;
  }

  .order-progress {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .order-progress .progress-track {
    flex: 1;
    height: 5px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
  }

  .order-progress .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #D4AF37, #8B4513);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 11px;
    color: #666;
    font-weight: 600;
    min-width: 35px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  .empty-state.large {
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .order-detail-panel {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }

  .detail-header {
    padding: 16px 18px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background: white;
    z-index: 5;
  }

  .detail-header h3 {
    font-size: 16px;
    font-weight: 600;
  }

  .detail-actions {
    display: flex;
    gap: 8px;
  }

  .btn-action {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    transition: all 0.2s;
  }

  .btn-action.start { background: #3498db; }
  .btn-action.start:hover { background: #2980b9; }
  .btn-action.complete { background: #27ae60; }
  .btn-action.complete:hover { background: #219a52; }
  .btn-action.deliver { background: #8B4513; }
  .btn-action.deliver:hover { background: #6B3410; }

  .detail-preview {
    padding: 16px 18px;
    border-bottom: 1px solid #f0f0f0;
  }

  .progress-control {
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
  }

  .progress-control input[type="range"] {
    flex: 1;
  }

  .detail-sections {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .detail-section h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #1a1a2e;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }

  .info-pair {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-pair .k {
    font-size: 11px;
    color: #999;
  }

  .info-pair .v {
    font-size: 13px;
    font-weight: 500;
  }

  .info-pair .v.price {
    color: #8B4513;
    font-size: 16px;
  }

  .text-danger { color: #e74c3c !important; }
  .text-success { color: #27ae60; }

  .note-box {
    margin-top: 10px;
    padding: 10px 12px;
    background: #FFF9E6;
    border-radius: 8px;
    border-left: 3px solid #D4AF37;
    font-size: 13px;
    color: #A0522D;
  }

  .note-box p {
    margin-top: 4px;
    line-height: 1.5;
  }

  .materials-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 6px;
    font-size: 13px;
  }

  .mat-name {
    color: #555;
  }

  .mat-qty {
    font-weight: 600;
    color: #1a1a2e;
  }

  .engraving-preview-box {
    background: linear-gradient(135deg, #F5E6D3, #E8D5BE);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 10px;
  }

  .engraving-text {
    font-size: 22px;
    color: #5a3d1a;
    font-family: 'Georgia', serif;
    letter-spacing: 2px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .empty-mini {
    padding: 20px;
    text-align: center;
    color: #aaa;
    font-size: 13px;
    background: #fafafa;
    border-radius: 8px;
  }

  .materials-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .materials-header h3 {
    font-size: 18px;
    font-weight: 600;
  }

  .update-time {
    font-size: 12px;
    color: #999;
  }

  .materials-category {
    margin-bottom: 28px;
  }

  .materials-category h4 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 14px;
    padding-left: 10px;
    border-left: 3px solid #8B4513;
  }

  .stock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }

  .stock-card {
    background: white;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.2s;
  }

  .stock-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }

  .stock-card.low {
    border: 1px solid #fdecea;
    background: #fffbfa;
  }

  .stock-color {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    flex-shrink: 0;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .stock-color.hardware {
    border-radius: 50%;
    box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.15);
  }

  .stock-color.thread {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    margin: 5px;
  }

  .stock-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .stock-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .stock-amount {
    font-size: 12px;
    color: #555;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stock-amount b {
    font-size: 18px;
    color: #1a1a2e;
  }

  .low-tag {
    font-size: 10px;
    padding: 2px 6px;
    background: #e74c3c;
    color: white;
    border-radius: 4px;
    font-weight: 600;
  }

  .stock-bar {
    height: 5px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    margin-top: 6px;
  }

  .stock-fill {
    height: 100%;
    background: linear-gradient(90deg, #27ae60, #2ecc71);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .stock-fill.danger {
    background: linear-gradient(90deg, #e74c3c, #f39c12);
  }

  .forecast-card {
    padding: 16px;
  }

  .forecast-row {
    font-size: 13px;
    margin-bottom: 12px;
    color: #555;
  }

  .forecast-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .forecast-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    padding: 6px 0;
  }

  .forecast-item .dot {
    width: 14px;
    height: 14px;
    border-radius: 4px;
  }

  .prod-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .prod-header h3 {
    font-size: 18px;
    font-weight: 600;
  }

  .today-badge {
    padding: 6px 14px;
    background: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  .prod-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: white;
    border-radius: 14px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 4px;
  }

  .stat-icon.queued { background: #ecf0f1; }
  .stat-icon.crafting { background: #fff4e6; }
  .stat-icon.completed { background: #e8f8f0; }
  .stat-icon.revenue { background: #fff9e6; }

  .stat-num {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 12px;
    color: #888;
  }

  .prod-timeline h4 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 14px;
    padding-left: 10px;
    border-left: 3px solid #8B4513;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .timeline-item {
    background: white;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .timeline-date {
    width: 54px;
    flex-shrink: 0;
    text-align: center;
    padding: 8px 4px;
    background: #f5f6fa;
    border-radius: 8px;
  }

  .timeline-date.urgent {
    background: #ffecec;
    color: #e74c3c;
  }

  .timeline-date .day {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }

  .timeline-date .month {
    font-size: 10px;
    margin-top: 2px;
  }

  .timeline-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .t-title {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .t-sub {
    font-size: 12px;
    color: #666;
  }

  .t-note {
    font-size: 12px;
    color: #A0522D;
    background: #FFF9E6;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 2px;
  }

  .t-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .pt-bar {
    flex: 1;
    height: 5px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
  }

  .pt-fill {
    height: 100%;
    background: linear-gradient(90deg, #D4AF37, #8B4513);
    border-radius: 3px;
  }

  .t-progress span {
    font-size: 11px;
    color: #666;
    font-weight: 600;
    min-width: 35px;
  }
</style>
