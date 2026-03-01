/* ═══════════════════════════════════════════════
   LearnFlow - Counselor Dashboard
   Application review, approve/deny, AI recommendations
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Guard: must be counselor
    if (!auth.isLoggedIn()) {
        window.location.href = '/login';
        return;
    }
    if (!auth.isCounselor()) {
        window.location.href = '/dashboard';
        return;
    }
    loadCounselorDashboard();
});

let allApplications = [];

async function loadCounselorDashboard() {
    const container = document.getElementById('counselor-content');
    const user = auth.getUser();

    try {
        const [statsData, appsData] = await Promise.all([
            api.get('/applications/stats/overview'),
            api.get('/applications?limit=50')
        ]);

        const stats = statsData.stats;
        allApplications = appsData.applications;

        container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <div>
            <h1>Review Panel 👨‍💼</h1>
            <p style="color: var(--text-secondary);">Welcome, ${user.name} — manage student applications</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total</div>
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

        <!-- Filter Tabs -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm filter-tab" data-status="all" onclick="filterApplications('all')">All (${stats.total})</button>
          <button class="btn btn-secondary btn-sm filter-tab" data-status="pending" onclick="filterApplications('pending')">Pending (${stats.pending})</button>
          <button class="btn btn-secondary btn-sm filter-tab" data-status="under_review" onclick="filterApplications('under_review')">Under Review (${stats.under_review || 0})</button>
          <button class="btn btn-secondary btn-sm filter-tab" data-status="approved" onclick="filterApplications('approved')">Approved (${stats.approved})</button>
          <button class="btn btn-secondary btn-sm filter-tab" data-status="denied" onclick="filterApplications('denied')">Denied (${stats.denied})</button>
        </div>

        <!-- Applications Table -->
        <div class="table-container" id="applications-table-container">
          ${renderApplicationsTable(allApplications)}
        </div>
      </div>

      <!-- Application Review Modal -->
      <div class="modal-overlay" id="review-modal">
        <div class="modal" style="max-width:700px;">
          <div class="modal-header">
            <h2>Application Review</h2>
            <button class="modal-close" onclick="closeModal('review-modal')">✕</button>
          </div>
          <div class="modal-body" id="review-modal-content">
            <div class="loader"><div class="spinner"></div></div>
          </div>
        </div>
      </div>

      <!-- Deny Modal -->
      <div class="modal-overlay" id="deny-modal">
        <div class="modal" style="max-width:500px;">
          <div class="modal-header">
            <h2>Deny Application</h2>
            <button class="modal-close" onclick="closeModal('deny-modal')">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);margin-bottom:1rem;">Please provide a reason for denying this application. The applicant will be notified with AI-powered alternative suggestions.</p>
            <div class="form-group">
              <label class="form-label">Reason for Denial *</label>
              <textarea class="form-textarea" id="denial-reason" rows="4" placeholder="e.g., Academic background does not meet the minimum requirements for this program."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Additional Notes (optional)</label>
              <textarea class="form-textarea" id="denial-notes" rows="2" placeholder="Internal notes, not shared with applicant"></textarea>
            </div>
            <input type="hidden" id="deny-application-id">
            <div style="display:flex;gap:1rem;justify-content:flex-end;margin-top:1rem;">
              <button class="btn btn-secondary" onclick="closeModal('deny-modal')">Cancel</button>
              <button class="btn btn-danger" onclick="confirmDeny()" id="confirm-deny-btn">Deny Application</button>
            </div>
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
        <button class="btn btn-primary mt-3" onclick="loadCounselorDashboard()">Retry</button>
      </div>
    `;
    }
}

function renderApplicationsTable(applications) {
    if (applications.length === 0) {
        return `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No applications found</h3>
        <p>Applications will appear here when students submit them.</p>
      </div>
    `;
    }

    return `
    <div class="table-header">
      <h2>Applications</h2>
    </div>
    <table>
      <thead>
        <tr>
          <th>Applicant</th>
          <th>Program</th>
          <th>Submitted</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${applications.map(app => `
          <tr>
            <td>
              <strong>${app.personalDetails?.fullName || app.applicant?.name || 'Unknown'}</strong>
              <br><span style="font-size:0.75rem;color:var(--text-muted);">${app.personalDetails?.email || app.applicant?.email || ''}</span>
            </td>
            <td>
              <div>${app.program?.title || 'Unknown Program'}</div>
              <span class="badge badge-primary" style="font-size:0.65rem;">${app.program?.category || ''}</span>
            </td>
            <td style="font-size:0.85rem;">${formatDate(app.submittedAt)}</td>
            <td>${getStatusBadge(app.status)}</td>
            <td>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <button class="btn btn-ghost btn-sm" onclick="reviewApplication('${app._id}')">Review</button>
                ${app.status === 'pending' || app.status === 'under_review' ? `
                  <button class="btn btn-success btn-sm" onclick="approveApplication('${app._id}')">Approve</button>
                  <button class="btn btn-danger btn-sm" onclick="openDenyModal('${app._id}')">Deny</button>
                ` : ''}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterApplications(status) {
    // Update button styles
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.className = btn.dataset.status === status ? 'btn btn-primary btn-sm filter-tab' : 'btn btn-secondary btn-sm filter-tab';
    });

    const filtered = status === 'all' ? allApplications : allApplications.filter(a => a.status === status);
    document.getElementById('applications-table-container').innerHTML = renderApplicationsTable(filtered);
}

async function reviewApplication(appId) {
    openModal('review-modal');
    const content = document.getElementById('review-modal-content');
    content.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const data = await api.get(`/applications/${appId}`);
        const app = data.application;

        const edu = app.educationalBackground || {};
        const personal = app.personalDetails || {};

        content.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <div class="d-flex justify-between align-center mb-2">
          <h3>${app.program?.title || 'Unknown Program'}</h3>
          ${getStatusBadge(app.status)}
        </div>
        <p style="color:var(--text-muted);font-size:0.8rem;">Ref: ${app.applicationRef} • Submitted: ${formatDate(app.submittedAt)}</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
        <div>
          <h4 style="margin-bottom:0.75rem;color:var(--accent-primary);">Personal Details</h4>
          <p><strong>Name:</strong> ${personal.fullName || 'N/A'}</p>
          <p><strong>Email:</strong> ${personal.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${personal.phone || 'N/A'}</p>
          ${personal.city ? `<p><strong>Location:</strong> ${personal.city}, ${personal.country || ''}</p>` : ''}
        </div>
        <div>
          <h4 style="margin-bottom:0.75rem;color:var(--accent-primary);">Education</h4>
          <p><strong>Degree:</strong> ${edu.highestDegree || 'N/A'}</p>
          <p><strong>Institution:</strong> ${edu.institution || 'N/A'}</p>
          <p><strong>Field:</strong> ${edu.fieldOfStudy || 'N/A'}</p>
          <p><strong>Year:</strong> ${edu.graduationYear || 'N/A'}</p>
          ${edu.gpa ? `<p><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
        </div>
      </div>

      ${app.statementOfPurpose ? `
        <div style="margin-bottom:1.5rem;">
          <h4 style="margin-bottom:0.75rem;color:var(--accent-primary);">Statement of Purpose</h4>
          <div style="background:var(--bg-input);border-radius:var(--radius-md);padding:1rem;font-size:0.9rem;line-height:1.7;color:var(--text-secondary);">
            ${app.statementOfPurpose}
          </div>
        </div>
      ` : ''}

      ${(app.status === 'pending' || app.status === 'under_review') ? `
        <div style="display:flex;gap:1rem;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--border-color);">
          <button class="btn btn-danger" onclick="closeModal('review-modal');openDenyModal('${app._id}')">Deny Application</button>
          <button class="btn btn-success" onclick="closeModal('review-modal');approveApplication('${app._id}')">Approve Application</button>
        </div>
      ` : ''}

      ${app.status === 'denied' && app.denialReason ? `
        <div style="background:var(--error-bg);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-md);padding:1rem;">
          <p style="font-weight:600;color:var(--error);">Denial Reason: ${app.denialReason}</p>
        </div>
      ` : ''}
    `;
    } catch (error) {
        content.innerHTML = `<p style="color:var(--error);">Error: ${error.message}</p>`;
    }
}

async function approveApplication(appId) {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
        await api.patch(`/applications/${appId}/approve`, {});
        toast.success('Application approved! Confirmation email sent.');
        // Refresh the page data
        closeModal('review-modal');
        loadCounselorDashboard();
    } catch (error) {
        toast.error(error.message);
    }
}

function openDenyModal(appId) {
    document.getElementById('deny-application-id').value = appId;
    document.getElementById('denial-reason').value = '';
    document.getElementById('denial-notes').value = '';
    openModal('deny-modal');
}

async function confirmDeny() {
    const appId = document.getElementById('deny-application-id').value;
    const reason = document.getElementById('denial-reason').value.trim();
    const notes = document.getElementById('denial-notes').value.trim();

    if (!reason) {
        toast.warning('Please provide a reason for denial.');
        return;
    }

    const btn = document.getElementById('confirm-deny-btn');
    btn.disabled = true;
    btn.textContent = 'Denying... (getting AI recs)';

    try {
        const data = await api.patch(`/applications/${appId}/deny`, { reason, notes });
        toast.success('Application denied. AI recommendations sent to applicant.');
        closeModal('deny-modal');

        // Show AI recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
            toast.info(`🤖 ${data.recommendations.length} alternative programs recommended to the student.`);
        }

        loadCounselorDashboard();
    } catch (error) {
        toast.error(error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Deny Application';
    }
}
