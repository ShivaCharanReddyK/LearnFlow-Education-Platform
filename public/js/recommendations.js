/* ═══════════════════════════════════════════════════
   LearnFlow - AI Recommendations Page
   Gemini AI-powered program suggestions
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initRecommendationsPage();
});

function initRecommendationsPage() {
    const container = document.getElementById('recommendations-content');
    const user = auth.getUser();

    container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1>🤖 <span class="gradient-text">AI Program Recommendations</span></h1>
        <p>Tell us about yourself and our Gemini AI will find the perfect programs for you</p>
      </div>

      <div class="application-form">
        <div class="form-section">
          <h3><span class="section-number">1</span> Your Background</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Highest Degree</label>
              <select class="form-select" id="rec-degree">
                <option value="">Select degree</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate Degree</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other / Self-taught</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Field of Study</label>
              <input type="text" class="form-input" id="rec-field" placeholder="e.g., Computer Science, Business, Arts">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3><span class="section-number">2</span> Your Interests & Goals</h3>
          <div class="form-group">
            <label class="form-label">What are you looking to achieve? What topics interest you?</label>
            <textarea class="form-textarea" id="rec-interests" rows="5"
              placeholder="e.g., I want to transition from marketing to tech. I'm interested in data analysis and building web applications. I want to learn skills that will help me get a job at a tech startup."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Preferred Category (optional)</label>
              <select class="form-select" id="rec-category">
                <option value="">Any category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="Health Sciences">Health Sciences</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Preferred Duration (optional)</label>
              <select class="form-select" id="rec-duration">
                <option value="">Any duration</option>
                <option value="short">Short (4-8 weeks)</option>
                <option value="medium">Medium (12-16 weeks)</option>
                <option value="long">Extended (24 weeks+)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-primary btn-lg" onclick="getRecommendations()" id="get-rec-btn">
            🤖 Get AI Recommendations
          </button>
        </div>
      </div>

      <!-- Results Area -->
      <div id="rec-results" class="mt-4" style="display:none;">
        <div class="section-header">
          <h2>Your Personalized Recommendations</h2>
          <p>Based on your background and interests, here are our top picks</p>
        </div>
        <div class="grid grid-3" id="rec-programs-grid"></div>
      </div>

      <!-- Loading -->
      <div id="rec-loading" class="mt-4" style="display:none;">
        <div class="text-center" style="padding: 3rem;">
          <div class="spinner" style="margin:0 auto 1.5rem;"></div>
          <h3 style="margin-bottom:0.5rem;">🧠 AI is analyzing your profile...</h3>
          <p style="color:var(--text-secondary);">Gemini is finding the best programs matched to your goals</p>
        </div>
      </div>
    </div>
  `;
}

async function getRecommendations() {
    const degree = document.getElementById('rec-degree').value;
    const field = document.getElementById('rec-field').value;
    const interests = document.getElementById('rec-interests').value;
    const category = document.getElementById('rec-category').value;
    const duration = document.getElementById('rec-duration').value;

    if (!interests.trim()) {
        toast.warning('Please describe your interests and goals to get personalized recommendations.');
        return;
    }

    const btn = document.getElementById('get-rec-btn');
    const loading = document.getElementById('rec-loading');
    const results = document.getElementById('rec-results');

    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    loading.style.display = 'block';
    results.style.display = 'none';

    try {
        // First, get programs from our API
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        params.append('limit', '50');

        const programsData = await api.get(`/programs?${params.toString()}`, false);
        const allPrograms = programsData.programs;

        // Try to get AI recommendations from Python service
        let recommendedPrograms = [];
        let aiPowered = false;

        try {
            const aiResponse = await fetch('/api/ai/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    degree,
                    fieldOfStudy: field,
                    interests,
                    preferredCategory: category,
                    preferredDuration: duration
                })
            });

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                if (aiData.recommendations && aiData.recommendations.length > 0) {
                    aiPowered = aiData.ai_powered;
                    // Match recommended IDs to full program data
                    const recIds = aiData.recommendations.map(r => r.programId);
                    const reasons = {};
                    aiData.recommendations.forEach(r => { reasons[r.programId] = r.reason; });

                    recommendedPrograms = allPrograms
                        .filter(p => recIds.includes(p._id))
                        .map(p => ({ ...p, aiReason: reasons[p._id] || '' }));

                    // If some IDs didn't match, fill with remaining
                    if (recommendedPrograms.length < 3) {
                        const existingIds = recommendedPrograms.map(p => p._id);
                        const extra = allPrograms.filter(p => !existingIds.includes(p._id)).slice(0, 3 - recommendedPrograms.length);
                        recommendedPrograms = [...recommendedPrograms, ...extra];
                    }
                }
            }
        } catch (aiErr) {
            console.log('AI service unavailable, using fallback:', aiErr.message);
        }

        // Fallback: smart filtering based on user input
        if (recommendedPrograms.length === 0) {
            recommendedPrograms = smartFallbackRecommendations(allPrograms, {
                degree, field, interests, category, duration
            });
        }

        renderRecommendations(recommendedPrograms, aiPowered);

    } catch (error) {
        toast.error('Failed to get recommendations: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🤖 Get AI Recommendations';
        loading.style.display = 'none';
    }
}

function smartFallbackRecommendations(programs, prefs) {
    // Score each program based on user's preferences
    const scored = programs.map(p => {
        let score = 0;
        const interests = (prefs.interests || '').toLowerCase();
        const field = (prefs.field || '').toLowerCase();

        // Category match
        if (prefs.category && p.category === prefs.category) score += 10;

        // Tag matching with interests
        if (p.tags) {
            p.tags.forEach(tag => {
                if (interests.includes(tag.toLowerCase())) score += 3;
                if (field.includes(tag.toLowerCase())) score += 2;
            });
        }

        // Title/description keyword matching
        const titleLower = p.title.toLowerCase();
        const descLower = (p.shortDescription || '').toLowerCase();
        const words = interests.split(/\s+/).filter(w => w.length > 3);
        words.forEach(word => {
            if (titleLower.includes(word)) score += 2;
            if (descLower.includes(word)) score += 1;
        });

        // Duration preference
        if (prefs.duration) {
            const weeks = parseInt(p.duration);
            if (prefs.duration === 'short' && weeks <= 8) score += 3;
            if (prefs.duration === 'medium' && weeks >= 12 && weeks <= 16) score += 3;
            if (prefs.duration === 'long' && weeks >= 24) score += 3;
        }

        return { ...p, _score: score, aiReason: '' };
    });

    // Sort by score and take top results
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 6);
}

function renderRecommendations(programs, aiPowered) {
    const results = document.getElementById('rec-results');
    const grid = document.getElementById('rec-programs-grid');

    if (programs.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">🔍</div>
        <h3>No matching programs found</h3>
        <p>Try broadening your interests or removing category/duration filters.</p>
      </div>
    `;
        results.style.display = 'block';
        return;
    }

    grid.innerHTML = programs.map(program => {
        const catClass = getCategoryClass(program.category);
        const icon = getCategoryIcon(program.category);

        return `
      <div class="program-card" onclick="window.location.href='/program/${program.slug}'" style="cursor:pointer;">
        <div class="program-card-image ${catClass}">
          <span class="category-icon">${icon}</span>
        </div>
        <div class="program-card-body">
          <span class="program-category">${program.category}</span>
          <h3>${program.title}</h3>
          ${program.aiReason ? `
            <div style="background:rgba(102,126,234,0.1); border-radius:var(--radius-sm); padding:0.5rem 0.75rem; margin-bottom:0.75rem; font-size:0.8rem; color:var(--accent-primary); border-left:3px solid var(--accent-primary);">
              🤖 ${program.aiReason}
            </div>
          ` : ''}
          <p class="program-desc">${program.shortDescription}</p>
          <div class="program-card-meta">
            <span>⏱ ${program.duration}</span>
            <span>📅 ${formatDate(program.startDate)}</span>
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
    }).join('');

    // Add AI badge at top
    const aiLabel = aiPowered
        ? '<span class="badge badge-primary" style="font-size:0.85rem; padding:0.4rem 1rem;">✨ Powered by Gemini AI</span>'
        : '<span class="badge badge-info" style="font-size:0.85rem; padding:0.4rem 1rem;">📊 Smart Matching</span>';

    results.querySelector('.section-header').innerHTML = `
    <h2>Your Personalized Recommendations</h2>
    <p>Based on your background and interests ${aiLabel}</p>
  `;

    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
