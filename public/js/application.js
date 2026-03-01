/* ═══════════════════════════════════════════════
   LearnFlow - Application Form
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn() || !auth.isStudent()) {
        window.location.href = '/login';
        return;
    }

    const slug = window.location.pathname.split('/').pop();
    loadProgramForApplication(slug);
});

async function loadProgramForApplication(slug) {
    const container = document.getElementById('application-container');

    try {
        const data = await api.get(`/programs/${slug}`, false);
        const program = data.program;
        const user = auth.getUser();

        renderApplicationForm(program, user);
    } catch (error) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😔</div>
        <h3>Program not found</h3>
        <p>Unable to load the application form.</p>
        <a href="/programs" class="btn btn-primary mt-3">Browse Programs</a>
      </div>
    `;
    }
}

function renderApplicationForm(program, user) {
    const container = document.getElementById('application-container');

    container.innerHTML = `
    <div class="application-form">
      <div class="text-center mb-4">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Apply Now</h1>
        <p style="color: var(--text-secondary);">Application for <strong style="color: var(--accent-primary);">${program.title}</strong></p>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Tuition: ${formatCurrency(program.tuitionFee)} • Duration: ${program.duration}</p>
      </div>

      <form id="application-form">
        <input type="hidden" id="program-id" value="${program._id}">

        <!-- Personal Details -->
        <div class="form-section">
          <h3><span class="section-number">1</span> Personal Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-input" id="full-name" value="${user.name}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" class="form-input" id="app-email" value="${user.email}" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" class="form-input" id="phone" placeholder="+1 (555) 000-0000" required>
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input type="date" class="form-input" id="dob">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-input" id="address" placeholder="Street address">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" class="form-input" id="city" placeholder="City">
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input type="text" class="form-input" id="country" placeholder="Country">
            </div>
          </div>
        </div>

        <!-- Educational Background -->
        <div class="form-section">
          <h3><span class="section-number">2</span> Educational Background</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Highest Degree *</label>
              <select class="form-select" id="highest-degree" required>
                <option value="">Select degree</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate Degree</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Institution *</label>
              <input type="text" class="form-input" id="institution" placeholder="University/School name" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Field of Study *</label>
              <input type="text" class="form-input" id="field-of-study" placeholder="e.g., Computer Science" required>
            </div>
            <div class="form-group">
              <label class="form-label">Graduation Year *</label>
              <input type="number" class="form-input" id="graduation-year" min="1970" max="2030" placeholder="2024" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">GPA (optional)</label>
            <input type="text" class="form-input" id="gpa" placeholder="e.g., 3.5/4.0">
          </div>
        </div>

        <!-- Statement of Purpose -->
        <div class="form-section">
          <h3><span class="section-number">3</span> Statement of Purpose</h3>
          <div class="form-group">
            <label class="form-label">Why do you want to join this program? (Optional but recommended)</label>
            <textarea class="form-textarea" id="statement-of-purpose" rows="6" maxlength="5000"
              placeholder="Tell us about your goals, motivations, and what you hope to achieve through this program..."></textarea>
            <div class="form-hint"><span id="sop-count">0</span>/5000 characters</div>
          </div>
        </div>

        <!-- Submit -->
        <div class="d-flex justify-between align-center" style="gap: 1rem;">
          <a href="/program/${window.location.pathname.split('/').pop()}" class="btn btn-secondary">← Back to Program</a>
          <button type="submit" class="btn btn-primary btn-lg" id="submit-application">
            Submit Application 🚀
          </button>
        </div>
      </form>
    </div>
  `;

    // Character counter for SOP
    const sopField = document.getElementById('statement-of-purpose');
    const sopCount = document.getElementById('sop-count');
    if (sopField && sopCount) {
        sopField.addEventListener('input', () => {
            sopCount.textContent = sopField.value.length;
        });
    }

    // Form submission
    document.getElementById('application-form').addEventListener('submit', handleSubmitApplication);
}

async function handleSubmitApplication(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-application');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
        const applicationData = {
            programId: document.getElementById('program-id').value,
            personalDetails: {
                fullName: document.getElementById('full-name').value,
                email: document.getElementById('app-email').value,
                phone: document.getElementById('phone').value,
                dateOfBirth: document.getElementById('dob').value || undefined,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                country: document.getElementById('country').value
            },
            educationalBackground: {
                highestDegree: document.getElementById('highest-degree').value,
                institution: document.getElementById('institution').value,
                fieldOfStudy: document.getElementById('field-of-study').value,
                graduationYear: parseInt(document.getElementById('graduation-year').value),
                gpa: document.getElementById('gpa').value
            },
            statementOfPurpose: document.getElementById('statement-of-purpose').value
        };

        const result = await api.post('/applications', applicationData);

        // Show success page
        const container = document.getElementById('application-container');
        container.innerHTML = `
      <div class="success-container">
        <div class="success-icon">✅</div>
        <h1>Application Submitted!</h1>
        <p>Your application has been successfully submitted.</p>
        <p style="color: var(--text-muted);">A confirmation email has been sent to your email address.</p>
        <div class="success-ref">${result.application.applicationRef}</div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Please save this reference number for your records.</p>
        <div class="d-flex justify-between" style="gap: 1rem; margin-top: 2rem; justify-content: center;">
          <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
          <a href="/programs" class="btn btn-secondary">Browse More Programs</a>
        </div>
      </div>
    `;

        toast.success('Application submitted successfully!');
    } catch (error) {
        toast.error(error.message);
        btn.disabled = false;
        btn.textContent = 'Submit Application 🚀';
    }
}
