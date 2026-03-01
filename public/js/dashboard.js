/* ═══════════════════════════════════════════════
   LearnFlow - Student Dashboard
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn() || !auth.isStudent()) {
        window.location.href = '/login';
        return;
    }

    loadStudentDashboard();
});

async function loadStudentDashboard() {
    const container = document.getElementById('dashboard-content');
    const user = auth.getUser();

    try {
        const data = await api.get('/applications/my');
        const applications = data.applications;

        const stats = {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length,
            approved: applications.filter(a => a.status === 'approved').length,
            denied: applications.filter(a => a.status === 'denied').length
        };

        container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <div>
            <h1>Welcome back, ${user.name.split(' ')[0]}! 👋</h1>
            <p style="color: var(--text-secondary);">Track your applications and payments</p>
          </div>
          <a href="/programs" class="btn btn-primary">Browse Programs</a>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-value">${stats.pending}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${stats.approved}</div>
            <div class="stat-label">Approved</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div class="stat-value">${stats.denied}</div>
            <div class="stat-label">Denied</div>
          </div>
        </div>

        ${applications.length > 0 ? `
          <div class="table-container">
            <div class="table-header">
              <h2>My Applications</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${applications.map(app => `
                  <tr>
                    <td>
                      <strong>${app.program?.title || 'Unknown Program'}</strong>
                      <br><span style="font-size: 0.75rem; color: var(--text-muted);">${app.applicationRef || ''}</span>
                    </td>
                    <td><span class="badge badge-primary">${app.program?.category || 'N/A'}</span></td>
                    <td>${formatDate(app.submittedAt)}</td>
                    <td>${getStatusBadge(app.status)}</td>
                    <td>${getPaymentStatusBadge(app.paymentStatus)}</td>
                    <td>
                      ${app.status === 'approved' && app.paymentStatus === 'pending' ?
                `<a href="/payment?application=${app._id}" class="btn btn-success btn-sm">Pay Now</a>` :
                `<button class="btn btn-ghost btn-sm" onclick="viewApplicationDetail('${app._id}')">View</button>`
            }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Start by exploring our programs and submitting your first application.</p>
            <a href="/programs" class="btn btn-primary mt-3">Explore Programs</a>
          </div>
        `}
      </div>

      <!-- Application Detail Modal -->
      <div class="modal-overlay" id="app-detail-modal">
        <div class="modal">
          <div class="modal-header">
            <h2>Application Details</h2>
            <button class="modal-close" onclick="closeModal('app-detail-modal')">✕</button>
          </div>
          <div class="modal-body" id="app-detail-content">
            <div class="loader"><div class="spinner"></div></div>
          </div>
        </div>
      </div>
    `;
    } catch (error) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Error loading dashboard</h3>
        <p>${error.message}</p>
      </div>
    `;
    }
}

async function viewApplicationDetail(appId) {
    openModal('app-detail-modal');
    const content = document.getElementById('app-detail-content');
    content.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const data = await api.get(`/applications/${appId}`);
        const app = data.application;

        content.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div class="d-flex justify-between align-center mb-2">
          <h3>${app.program?.title || 'Program'}</h3>
          ${getStatusBadge(app.status)}
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Reference: ${app.applicationRef}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Submitted</label>
          <p>${formatDate(app.submittedAt)}</p>
        </div>
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Payment Status</label>
          <p>${getPaymentStatusBadge(app.paymentStatus)}</p>
        </div>
      </div>

      ${app.status === 'denied' && app.denialReason ? `
        <div style="background: var(--error-bg); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
          <p style="font-weight: 600; color: var(--error); margin-bottom: 0.5rem;">Denial Reason</p>
          <p style="color: var(--text-secondary);">${app.denialReason}</p>
        </div>
      ` : ''}

      ${app.recommendedPrograms && app.recommendedPrograms.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 0.75rem;">Recommended Programs</h4>
          ${app.recommendedPrograms.map(rp => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.5rem;">
              <a href="/program/${rp.slug}" style="font-weight: 600;">${rp.title}</a>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${rp.shortDescription || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${app.status === 'approved' && app.paymentStatus === 'pending' ? `
        <div style="text-align: center; margin-top: 1.5rem;">
          <a href="/payment?application=${app._id}" class="btn btn-success btn-lg">Complete Payment →</a>
        </div>
      ` : ''}
    `;
    } catch (error) {
        content.innerHTML = `<p style="color: var(--error);">Error: ${error.message}</p>`;
    }
}
