/* ═══════════════════════════════════════════
   LearnFlow - Programs Page & Detail Page
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const programsGrid = document.getElementById('programs-grid');
    const programDetail = document.getElementById('program-detail');

    if (programsGrid) {
        initProgramsPage();
    }

    if (programDetail) {
        initProgramDetailPage();
    }
});

// ── Programs List Page ──
async function initProgramsPage() {
    const grid = document.getElementById('programs-grid');
    const filterCategory = document.getElementById('filter-category');
    const filterDuration = document.getElementById('filter-duration');
    const filterDate = document.getElementById('filter-date');
    const searchInput = document.getElementById('search-input');
    const resultsCount = document.getElementById('results-count');

    let currentFilters = {};

    async function loadPrograms() {
        grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

        try {
            const params = new URLSearchParams();
            if (currentFilters.category) params.append('category', currentFilters.category);
            if (currentFilters.duration) params.append('duration', currentFilters.duration);
            if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
            if (currentFilters.search) params.append('search', currentFilters.search);

            const data = await api.get(`/programs?${params.toString()}`, false);

            if (resultsCount) {
                resultsCount.textContent = `${data.pagination.total} program${data.pagination.total !== 1 ? 's' : ''} found`;
            }

            if (data.programs.length === 0) {
                grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🔍</div>
            <h3>No programs found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        `;
                return;
            }

            grid.innerHTML = data.programs.map(program => createProgramCard(program)).join('');

            // Add click handlers
            grid.querySelectorAll('.program-card').forEach(card => {
                card.addEventListener('click', () => {
                    window.location.href = `/program/${card.dataset.slug}`;
                });
            });

        } catch (error) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⚠️</div>
        <h3>Error loading programs</h3>
        <p>${error.message}</p>
      </div>`;
        }
    }

    function createProgramCard(program) {
        const catClass = getCategoryClass(program.category);
        const icon = getCategoryIcon(program.category);

        return `
      <div class="program-card" data-slug="${program.slug}" data-id="${program._id}">
        <div class="program-card-image ${catClass}">
          <span class="category-icon">${icon}</span>
        </div>
        <div class="program-card-body">
          <span class="program-category">${program.category}</span>
          <h3>${program.title}</h3>
          <p class="program-desc">${program.shortDescription}</p>
          <div class="program-card-meta">
            <span>⏱ ${program.duration}</span>
            <span>📅 ${formatDate(program.startDate)}</span>
            <span>👥 ${program.availableSpots || program.maxEnrollment} spots</span>
          </div>
        </div>
        <div class="program-card-footer">
          <div class="program-price">
            <span class="currency">$</span>${program.tuitionFee.toLocaleString()}
          </div>
          <span class="badge ${program.status === 'active' ? 'badge-success' : 'badge-warning'}">${program.status}</span>
        </div>
      </div>
    `;
    }

    // Event listeners
    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            currentFilters.category = e.target.value === 'all' ? '' : e.target.value;
            loadPrograms();
        });
    }

    if (filterDuration) {
        filterDuration.addEventListener('change', (e) => {
            currentFilters.duration = e.target.value === 'all' ? '' : e.target.value;
            loadPrograms();
        });
    }

    if (filterDate) {
        filterDate.addEventListener('change', (e) => {
            currentFilters.startDate = e.target.value;
            loadPrograms();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value;
            loadPrograms();
        }, 300));
    }

    // Initial load
    loadPrograms();
}

// ── Program Detail Page ──
async function initProgramDetailPage() {
    const container = document.getElementById('program-detail');
    const slug = window.location.pathname.split('/').pop();

    container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const data = await api.get(`/programs/${slug}`, false);
        const program = data.program;

        renderProgramDetail(program);
    } catch (error) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😔</div>
        <h3>Program not found</h3>
        <p>The requested program could not be found.</p>
        <a href="/programs" class="btn btn-primary mt-3">Browse Programs</a>
      </div>
    `;
    }
}

function renderProgramDetail(program) {
    const container = document.getElementById('program-detail');
    const catClass = getCategoryClass(program.category);
    const icon = getCategoryIcon(program.category);

    const syllabusHtml = (program.syllabus || []).map(item => `
    <div class="syllabus-item">
      <div class="syllabus-week">Week ${item.week}</div>
      <div>
        <div class="syllabus-topic">${item.topic}</div>
        <div class="syllabus-desc">${item.description}</div>
      </div>
    </div>
  `).join('');

    const requirementsHtml = (program.requirements || []).map(req => `
    <li>${req}</li>
  `).join('');

    const outcomesHtml = (program.learningOutcomes || []).map(outcome => `
    <li>${outcome}</li>
  `).join('');

    const tagsHtml = (program.tags || []).map(tag => `
    <span class="badge badge-primary">${tag}</span>
  `).join(' ');

    const applyBtn = auth.isLoggedIn() && auth.isStudent()
        ? `<a href="/apply/${program.slug}" class="btn btn-primary btn-lg btn-block" id="apply-now-btn">Apply Now 🚀</a>`
        : auth.isLoggedIn()
            ? `<p class="text-center" style="color: var(--text-muted); font-size: 0.9rem;">Counselors cannot apply to programs.</p>`
            : `<a href="/login" class="btn btn-primary btn-lg btn-block" id="apply-now-btn">Sign In to Apply</a>`;

    container.innerHTML = `
    <div class="container">
      <div class="program-detail" style="padding-top: 2rem;">
        <div class="program-detail-image ${catClass}">
          <span style="font-size: 6rem;">${icon}</span>
        </div>

        <div class="program-detail-header">
          <div>
            <span class="badge badge-primary mb-2" style="font-size: 0.8rem;">${program.category}</span>
            <h1>${program.title}</h1>
            <div class="program-meta-row">
              <div class="meta-item"><span class="meta-icon">👨‍🏫</span> ${program.instructor}</div>
              <div class="meta-item"><span class="meta-icon">⏱</span> ${program.duration}</div>
              <div class="meta-item"><span class="meta-icon">📅</span> Starts ${formatDate(program.startDate)}</div>
              <div class="meta-item"><span class="meta-icon">👥</span> ${program.availableSpots || program.maxEnrollment} spots available</div>
            </div>
            <p style="color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">${program.description}</p>
          </div>

          <div class="program-enroll-card">
            <div class="price">${formatCurrency(program.tuitionFee)}</div>
            <div class="price-label">Total tuition fee</div>
            <div class="enroll-info">
              <p>📅 Start: ${formatDate(program.startDate)}</p>
              ${program.endDate ? `<p>🏁 End: ${formatDate(program.endDate)}</p>` : ''}
              <p>⏱ Duration: ${program.duration}</p>
              <p>🎓 Certificate included</p>
            </div>
            ${applyBtn}
            <p style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.75rem;">30-day money-back guarantee</p>
          </div>
        </div>

        ${syllabusHtml ? `
          <div class="detail-section">
            <h2>📘 Curriculum</h2>
            ${syllabusHtml}
          </div>
        ` : ''}

        ${requirementsHtml ? `
          <div class="detail-section">
            <h2>📋 Requirements</h2>
            <ul class="requirement-list">${requirementsHtml}</ul>
          </div>
        ` : ''}

        ${outcomesHtml ? `
          <div class="detail-section">
            <h2>🎯 What You'll Learn</h2>
            <ul class="outcome-list">${outcomesHtml}</ul>
          </div>
        ` : ''}

        ${tagsHtml ? `
          <div class="detail-section">
            <h2>🏷 Tags</h2>
            <div class="d-flex flex-wrap gap-1">${tagsHtml}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
