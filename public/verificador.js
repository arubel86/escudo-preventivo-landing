/**
 * ==============================================================================
 * AIZPRUA S.E. - VERIFICADOR DE SITIOS WEB & AGENTES IA (SCRIPT.JS)
 * Lógica de conexión con API /api/scan, animación de medidores, renderizado de
 * acordeones y sistema de copiado interactivo de Prompts para IA.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de íconos Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const scanForm = document.getElementById('scanForm');
  const urlInput = document.getElementById('urlInput');
  const btnScan = document.getElementById('btnScan');
  const scanningState = document.getElementById('scanningState');
  const topLoadingBar = document.getElementById('topLoadingBar');
  const loaderStatusStep = document.getElementById('loaderStatusStep');
  const resultsContainer = document.getElementById('resultsContainer');
  const demoChips = document.querySelectorAll('.demo-chip');

  // Elementos del panel de resultados
  const resTargetUrl = document.getElementById('resTargetUrl');
  const mainScoreNum = document.getElementById('mainScoreNum');
  const mainMeterFill = document.getElementById('mainMeterFill');
  const gradeBadge = document.getElementById('gradeBadge');
  const gradeSubtitle = document.getElementById('gradeSubtitle');
  const subMetricsGrid = document.getElementById('subMetricsGrid');
  const categoriesContainer = document.getElementById('categoriesContainer');
  const btnShareReport = document.getElementById('btnShareReport');
  const btnRescan = document.getElementById('btnRescan');

  // Mensajes secuenciales durante el escaneo
  const loadingSteps = [
    'Conectando con el servidor e inspeccionando código HTML y meta etiquetas...',
    'Verificando presencia de favicon, Apple Touch Icon y Open Graph...',
    'Analizando robots.txt, sitemap.xml y directivas de rastreo...',
    'Comprobando tiempo de respuesta, certificado SSL y directivas móviles...',
    'Evaluando preparación para agentes de IA (llms.txt, GPTBot, Schema.org)...',
    'Calculando puntuación global y generando prompts correctivos...',
  ];
  let loadingInterval = null;

  // Manejo de chips de prueba rápida
  demoChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      if (url) {
        urlInput.value = url;
        startScan(url);
      }
    });
  });

  // Envío del formulario
  scanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();
    if (targetUrl) {
      startScan(targetUrl);
    }
  });

  // Botón Re-escanear
  btnRescan?.addEventListener('click', () => {
    const targetUrl = urlInput.value.trim();
    if (targetUrl) {
      startScan(targetUrl);
    } else {
      urlInput.focus();
    }
  });

  // Botón Compartir
  btnShareReport?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = btnShareReport.innerHTML;
      btnShareReport.innerHTML = `<i data-lucide="check" style="width:15px;height:15px;"></i><span>¡Enlace copiado!</span>`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btnShareReport.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }, 2500);
    } catch (err) {
      alert('URL del reporte copiada');
    }
  });

  /**
   * Inicia el proceso de auditoría y llama al backend
   */
  async function startScan(targetUrl) {
    // Normalizar URL básica en el input
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
      urlInput.value = targetUrl;
    }

    // UI: Activar estado de carga
    btnScan.disabled = true;
    btnScan.innerHTML = `<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;"></div><span>Analizando...</span>`;
    resultsContainer.style.display = 'none';
    scanningState.style.display = 'block';
    if (topLoadingBar) topLoadingBar.classList.add('active');

    // Animación de textos del loader
    let stepIndex = 0;
    loaderStatusStep.textContent = loadingSteps[0];
    clearInterval(loadingInterval);
    loadingInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      loaderStatusStep.textContent = loadingSteps[stepIndex];
    }, 1500);

    // Scroll suave al loader
    scanningState.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      // Determinar endpoint base de la API de forma dinámica (local y producción /verificador)
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let apiBase = '';
      if (isLocalhost && window.location.port !== '3030' && window.location.port !== '') {
        apiBase = 'http://localhost:3030';
      }
      const apiEndpoint = window.location.pathname.startsWith('/verificador') ? '/verificador/api/scan' : '/api/scan';

      const response = await fetch(`${apiBase}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`El servidor devolvió una respuesta inesperada (HTTP ${response.status}). Asegúrate de que el backend de análisis esté operativo.`);
      }

      clearInterval(loadingInterval);
      scanningState.style.display = 'none';
      if (topLoadingBar) topLoadingBar.classList.remove('active');
      btnScan.disabled = false;
      btnScan.innerHTML = `<i data-lucide="zap" style="width: 18px; height: 18px;"></i><span>Analizar Sitio Web</span>`;
      if (window.lucide) window.lucide.createIcons();

      if (!response.ok) {
        alert(data.error || 'Ocurrió un error al analizar la URL. Por favor verifica que el sitio esté en línea.');
        return;
      }

      // Renderizar datos en el panel de resultados
      renderResults(data);

    } catch (error) {
      clearInterval(loadingInterval);
      scanningState.style.display = 'none';
      if (topLoadingBar) topLoadingBar.classList.remove('active');
      btnScan.disabled = false;
      btnScan.innerHTML = `<i data-lucide="zap" style="width: 18px; height: 18px;"></i><span>Analizar Sitio Web</span>`;
      if (window.lucide) window.lucide.createIcons();
      alert(`Error de conexión con el verificador: ${error.message}`);
    }
  }

  /**
   * Renderiza todos los resultados en la interfaz
   */
  function renderResults(data) {
    resTargetUrl.textContent = data.url;

    // 1. Animación del Medidor Circular Global
    animateScore(data.overallScore, data.gradeColor);

    // 2. Badge de estado
    gradeBadge.textContent = `${data.gradeBadge} (${data.grade})`;
    gradeBadge.style.backgroundColor = `${data.gradeColor}18`;
    gradeBadge.style.color = data.gradeColor;
    gradeBadge.style.border = `1px solid ${data.gradeColor}40`;

    gradeSubtitle.textContent = `Aprobadas ${data.stats.passed} de ${data.stats.totalChecks} pruebas (${data.stats.failed} fallos, ${data.stats.warnings} advertencias)`;

    // Actualizar contadores de la barra de filtros
    const countAllEl = document.getElementById('countAll');
    const countNeedsFixEl = document.getElementById('countNeedsFix');
    const countFailEl = document.getElementById('countFail');
    const countWarningEl = document.getElementById('countWarning');
    const countPassEl = document.getElementById('countPass');

    if (countAllEl) countAllEl.textContent = data.stats.totalChecks;
    if (countNeedsFixEl) countNeedsFixEl.textContent = data.stats.failed + data.stats.warnings;
    if (countFailEl) countFailEl.textContent = data.stats.failed;
    if (countWarningEl) countWarningEl.textContent = data.stats.warnings;
    if (countPassEl) countPassEl.textContent = data.stats.passed;

    // Resetear filtro a 'all' por defecto
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach((b) => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');

    // 3. Renderizar Sub-métricas (Anillos de Categoría)
    renderSubMetrics(data.categories);

    // 4. Renderizar Categorías y Acordeones de Chequeos
    renderCategoryChecks(data.categories, data.checks);

    // Mostrar contenedor y scroll fluido
    resultsContainer.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Animación numérica y de progreso del SVG circular
   */
  function animateScore(targetScore, color) {
    // Circunferencia del círculo: 2 * PI * 70 ≈ 440
    const circumference = 440;
    const offset = circumference - (circumference * targetScore) / 100;

    mainMeterFill.style.stroke = color;
    mainMeterFill.style.strokeDashoffset = offset;

    // Conteo animado de números
    let current = 0;
    const duration = 1000;
    const increment = Math.ceil(targetScore / (duration / 25));

    const counter = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(counter);
      }
      mainScoreNum.textContent = current;
    }, 25);
  }

  /**
   * Renderiza las sub-métricas circulares por categoría
   */
  function renderSubMetrics(categories) {
    subMetricsGrid.innerHTML = '';
    const circumference = 157; // 2 * PI * 25

    Object.keys(categories).forEach((catKey) => {
      const cat = categories[catKey];
      const pct = cat.total > 0 ? Math.round((cat.score / cat.total) * 100) : 0;
      const offset = circumference - (circumference * pct) / 100;

      let color = '#ef4444';
      if (pct >= 80) color = '#10b981';
      else if (pct >= 50) color = '#f59e0b';

      const card = document.createElement('div');
      card.className = 'sub-metric-card';
      card.innerHTML = `
        <div class="sub-meter-mini">
          <svg viewBox="0 0 60 60">
            <circle class="sub-meter-bg" cx="30" cy="30" r="25"></circle>
            <circle class="sub-meter-bar" cx="30" cy="30" r="25" style="stroke: ${color}; stroke-dashoffset: ${offset};"></circle>
          </svg>
          <span class="sub-meter-val">${pct}%</span>
        </div>
        <div class="sub-metric-name">${cat.name}</div>
      `;
      subMetricsGrid.appendChild(card);
    });
  }

  /**
   * Agrupa y renderiza los chequeos individuales en acordeones
   */
  function renderCategoryChecks(categories, checks) {
    categoriesContainer.innerHTML = '';

    Object.keys(categories).forEach((catKey) => {
      const cat = categories[catKey];
      const catChecks = checks.filter((c) => c.category === catKey);
      if (catChecks.length === 0) return;

      const catSection = document.createElement('div');
      catSection.className = 'audit-category-section';

      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'category-header';
      sectionHeader.innerHTML = `
        <div class="category-title-wrap">
          <h3 class="category-title">${cat.name}</h3>
        </div>
        <span class="category-badge-count">${cat.passed}/${cat.total} Aprobados</span>
      `;
      catSection.appendChild(sectionHeader);

      // Renderizar cada check dentro de la sección
      catChecks.forEach((chk) => {
        const itemCard = document.createElement('div');
        // Por defecto, abrimos los que tienen error o advertencia para que el usuario vea la solución y el prompt de inmediato
        const isFailedOrWarn = chk.status === 'fail' || chk.status === 'warning';
        itemCard.className = `check-item-card ${isFailedOrWarn ? 'open' : ''}`;
        itemCard.setAttribute('data-status', chk.status);

        // Icono de estado
        let iconName = 'check';
        if (chk.status === 'fail') iconName = 'x';
        else if (chk.status === 'warning') iconName = 'alert-triangle';

        // Prompt box si hay error o advertencia
        let promptHtml = '';
        if (chk.prompt) {
          promptHtml = `
            <div class="prompt-action-box">
              <div class="prompt-header">
                <div class="prompt-title-badge">
                  <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
                  <span>Prompt de Corrección para IA</span>
                </div>
                <button type="button" class="btn-copy-prompt" data-prompt="${encodeURIComponent(chk.prompt)}">
                  <i data-lucide="copy" style="width:14px;height:14px;"></i>
                  <span>Copiar Prompt</span>
                </button>
              </div>
              <div class="prompt-code-block">${escapeHtml(chk.prompt)}</div>
            </div>
          `;
        }

        itemCard.innerHTML = `
          <div class="check-item-header">
            <div class="check-status-col">
              <div class="status-icon-dot ${chk.status}">
                <i data-lucide="${iconName}" style="width:16px;height:16px;"></i>
              </div>
              <div class="check-info-text">
                <div class="check-title">${chk.title}</div>
                ${chk.value ? `<div class="check-value-snippet">${escapeHtml(chk.value)}</div>` : ''}
              </div>
            </div>
            <i data-lucide="chevron-down" class="accordion-chevron" style="width:18px;height:18px;"></i>
          </div>

          <div class="check-item-body">
            <div class="audit-meta-row">
              <div class="audit-meta-label">Objetivo (Goal)</div>
              <div class="audit-meta-text">${chk.goal}</div>
            </div>

            ${chk.issue ? `
              <div class="audit-meta-row">
                <div class="audit-meta-label">Problema Detectado (Issue)</div>
                <div class="audit-meta-text issue">${chk.issue}</div>
              </div>
            ` : ''}

            <div class="audit-meta-row">
              <div class="audit-meta-label">Acción Recomendada</div>
              <div class="audit-meta-text">${chk.recommendedAction}</div>
            </div>

            ${promptHtml}
          </div>
        `;

        // Toggle del acordeón
        const headerEl = itemCard.querySelector('.check-item-header');
        headerEl.addEventListener('click', () => {
          itemCard.classList.toggle('open');
        });

        // Botón de copiado de prompt
        const btnCopy = itemCard.querySelector('.btn-copy-prompt');
        if (btnCopy) {
          btnCopy.addEventListener('click', async (e) => {
            e.stopPropagation();
            const textToCopy = decodeURIComponent(btnCopy.getAttribute('data-prompt'));
            try {
              await navigator.clipboard.writeText(textToCopy);
              btnCopy.classList.add('copied');
              btnCopy.innerHTML = `<i data-lucide="check" style="width:14px;height:14px;"></i><span>¡Copiado!</span>`;
              if (window.lucide) window.lucide.createIcons();

              setTimeout(() => {
                btnCopy.classList.remove('copied');
                btnCopy.innerHTML = `<i data-lucide="copy" style="width:14px;height:14px;"></i><span>Copiar Prompt</span>`;
                if (window.lucide) window.lucide.createIcons();
              }, 2500);
            } catch (err) {
              alert('Prompt copiado al portapapeles');
            }
          });
        }

        catSection.appendChild(itemCard);
      });

      categoriesContainer.appendChild(catSection);
    });
  }

  // Eventos de la barra de filtros interactivos
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filterType = btn.getAttribute('data-filter');
      applyFilter(filterType);
    });
  });

  function applyFilter(filterType) {
    const cards = document.querySelectorAll('.check-item-card');
    cards.forEach((card) => {
      const status = card.getAttribute('data-status');
      let shouldShow = false;

      if (filterType === 'all') {
        shouldShow = true;
      } else if (filterType === 'needs_fix') {
        shouldShow = status === 'fail' || status === 'warning';
        if (shouldShow) card.classList.add('open');
      } else if (filterType === 'fail') {
        shouldShow = status === 'fail';
        if (shouldShow) card.classList.add('open');
      } else if (filterType === 'warning') {
        shouldShow = status === 'warning';
        if (shouldShow) card.classList.add('open');
      } else if (filterType === 'pass') {
        shouldShow = status === 'pass';
      }

      if (shouldShow) {
        card.classList.remove('filter-hidden');
      } else {
        card.classList.add('filter-hidden');
      }
    });

    // Ocultar categorías que se queden sin items visibles
    const sections = document.querySelectorAll('.audit-category-section');
    sections.forEach((sec) => {
      const visibleCards = sec.querySelectorAll('.check-item-card:not(.filter-hidden)');
      if (visibleCards.length === 0) {
        sec.classList.add('filter-hidden');
      } else {
        sec.classList.remove('filter-hidden');
      }
    });
  }

  // Acordeones de la sección FAQ
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach((card) => {
    const question = card.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });

  // Utilidad para escapar texto HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
