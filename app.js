(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const modules = [
    {
      id: 'projects',
      name: 'Project Core',
      summary: 'Project, client, location, status, budget. The system entrypoint for every workflow.',
      tags: ['projects', 'status', 'budget', 'audit'],
      tables: ['projects'],
    },
    {
      id: 'engineering',
      name: 'Engineering Engine',
      summary: 'Rule-driven structural validation stored in the database. Backend is authoritative.',
      tags: ['rules', 'validation', 'limits'],
      tables: ['structural_limits'],
    },
    {
      id: 'estimation',
      name: 'Material Estimation Engine',
      summary: 'Backend calculation services (testable). Never calculate only in the UI.',
      tags: ['calculator', 'services', 'unit tests'],
      tables: ['estimations', 'estimation_items'],
    },
    {
      id: 'costing',
      name: 'Cost Engine',
      summary: 'Material + Labour + Equipment + Safety + Overhead + Profit + VAT → Quotation.',
      tags: ['quotation', 'VAT', 'margin'],
      tables: ['cost_sheets', 'rates'],
    },
    {
      id: 'procurement',
      name: 'Procurement System',
      summary: 'Workflow: Estimator → PM → Procurement → Approval. Status-driven lifecycle.',
      tags: ['workflow', 'approvals', 'suppliers'],
      tables: ['purchase_requests', 'purchase_orders', 'suppliers'],
    },
    {
      id: 'inventory',
      name: 'Inventory',
      summary: 'Transaction-based inventory model. Every movement is a transaction.',
      tags: ['transactions', 'stock levels', 'audit'],
      tables: ['materials', 'inventory_transactions', 'stock_levels'],
    },
    {
      id: 'labour',
      name: 'Labour Norm Engine',
      summary: 'Productivity norms drive duration planning: Duration = Area / Productivity.',
      tags: ['productivity', 'planning'],
      tables: ['labour_norms'],
    },
    {
      id: 'safety',
      name: 'Safety & Equipment',
      summary: 'Separate PPE & equipment. Depreciation/rental models for daily costing.',
      tags: ['PPE', 'equipment', 'depreciation'],
      tables: ['ppe_items', 'equipment_items', 'equipment_rental_rates'],
    },
    {
      id: 'tendering',
      name: 'Tender & Documentation',
      summary: 'Server-side PDF generation: BOQ, cost breakdown, specs, method statements.',
      tags: ['PDF', 'templates', 'exports'],
      tables: ['documents', 'templates'],
    },
    {
      id: 'drawings',
      name: 'Sketch & Drawings',
      summary: 'Start 2D canvas: walls/openings → geometry → later DXF export + overlays.',
      tags: ['canvas', 'Konva/Fabric', 'DXF'],
      tables: ['drawings', 'drawing_elements'],
    },
  ];

  const roadmap = [
    {
      phase: 'Phase 1 (Core)',
      badge: 'Core',
      items: ['Project', 'Engineering', 'Estimation', 'Cost', 'BOQ export'],
    },
    {
      phase: 'Phase 2',
      badge: 'Operations',
      items: ['Procurement', 'Inventory', 'Labour'],
    },
    {
      phase: 'Phase 3',
      badge: 'Controls',
      items: ['Safety', 'Equipment', 'Drawing tool'],
    },
    {
      phase: 'Phase 4',
      badge: 'SaaS',
      items: ['Multi-user SaaS', 'Subscription model', 'Org billing & tenancy'],
    },
  ];

  function renderModules() {
    const grid = $('#moduleGrid');
    if (!grid) return;

    grid.innerHTML = modules
      .map((m) => {
        const tags = m.tags.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join('');
        const tables = m.tables.map((t) => `<code>${escapeHtml(t)}</code>`).join(', ');

        return `
          <article class="module" id="module-${escapeHtml(m.id)}">
            <div class="module__top">
              <h3 class="module__name">${escapeHtml(m.name)}</h3>
              <span class="pill pill--info">${escapeHtml(m.id)}</span>
            </div>
            <p class="module__desc">${escapeHtml(m.summary)}</p>
            <div class="muted">Tables: ${tables}</div>
            <div class="module__tags" aria-label="tags">${tags}</div>
          </article>
        `;
      })
      .join('');
  }

  function renderRoadmap() {
    const t = $('#timeline');
    if (!t) return;

    t.innerHTML = roadmap
      .map((p) => {
        const items = p.items.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
        return `
          <div class="phase">
            <div class="phase__top">
              <h3 class="phase__title">${escapeHtml(p.phase)}</h3>
              <span class="pill">${escapeHtml(p.badge)}</span>
            </div>
            <ul class="phase__items">${items}</ul>
          </div>
        `;
      })
      .join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setYear() {
    const y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function setupMobileSidebar() {
    const btn = $('#menuBtn');
    const sidebar = $('#sidebar');
    const backdrop = $('#backdrop');
    if (!btn || !sidebar || !backdrop) return;

    function open() {
      sidebar.classList.add('is-open');
      backdrop.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      backdrop.setAttribute('aria-hidden', 'false');
    }

    function close() {
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      backdrop.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('is-open');
      if (isOpen) close();
      else open();
    });

    backdrop.addEventListener('click', close);

    // Close on navigation click (mobile)
    $$('[data-nav]').forEach((a) => {
      a.addEventListener('click', () => {
        // Let hash change happen; then close.
        close();
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function setupActiveSectionTracking() {
    const links = $$('a.nav__link[data-nav]');
    if (!links.length) return;

    const map = new Map(
      links
        .map((a) => {
          const href = a.getAttribute('href') || '';
          const id = href.startsWith('#') ? href.slice(1) : '';
          return [id, a];
        })
        .filter(([id]) => id),
    );

    const sections = Array.from(map.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function setActive(id) {
      links.forEach((l) => l.classList.remove('is-active'));
      const el = map.get(id);
      if (el) el.classList.add('is-active');
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (!visible.length) return;
        setActive(visible[0].target.id);
      },
      { root: null, threshold: [0.25, 0.35, 0.5] },
    );

    sections.forEach((s) => obs.observe(s));

    // initial
    const hash = (location.hash || '#overview').slice(1);
    setActive(hash);
  }

  function init() {
    renderModules();
    renderRoadmap();
    setYear();
    setupMobileSidebar();
    setupActiveSectionTracking();

    // If loaded with a hash, ensure content focus is sensible
    const main = $('#main');
    if (main) {
      // keep focus on main for accessibility
      main.addEventListener('hashchange', () => main.focus());
    }
  }

  init();
})();
