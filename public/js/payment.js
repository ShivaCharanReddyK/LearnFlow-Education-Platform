/* ═══════════════════════════════════════
   LearnFlow - Payment Page
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn() || !auth.isStudent()) {
        window.location.href = '/login';
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('application');
    if (!appId) {
        window.location.href = '/dashboard';
        return;
    }
    loadPaymentPage(appId);
});

async function loadPaymentPage(appId) {
    const container = document.getElementById('payment-content');
    try {
        const data = await api.get(`/applications/${appId}`);
        const app = data.application;
        if (app.status !== 'approved') {
            container.innerHTML = `<div class="empty-state"><h3>Payment not available</h3><p>This application is not approved.</p><a href="/dashboard" class="btn btn-primary mt-3">Back to Dashboard</a></div>`;
            return;
        }
        if (app.paymentStatus === 'completed') {
            container.innerHTML = `<div class="success-container"><div class="success-icon">✅</div><h1>Already Paid</h1><p>Payment for this application is complete.</p><a href="/dashboard" class="btn btn-primary mt-3">Back to Dashboard</a></div>`;
            return;
        }
        renderPaymentForm(app);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
    }
}

function renderPaymentForm(app) {
    const container = document.getElementById('payment-content');
    const program = app.program;
    const installmentAmt = Math.ceil(program.tuitionFee / 4);

    container.innerHTML = `
    <div class="payment-container" style="padding-top: 6rem;">
      <div class="text-center mb-4">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Complete Payment</h1>
        <p style="color: var(--text-secondary);">${program.title}</p>
      </div>
      <div class="payment-summary">
        <h3>Payment Summary</h3>
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-secondary)">Program</span><span>${program.title}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;">
          <span style="color:var(--text-secondary)">Total Tuition</span><span style="font-weight:700">${formatCurrency(program.tuitionFee)}</span>
        </div>
      </div>
      <h3 style="margin-bottom:1rem;">Choose Payment Plan</h3>
      <div class="payment-options">
        <div class="payment-option selected" data-type="full" onclick="selectPayment('full')">
          <h4>💳 Full Payment</h4>
          <div class="payment-amount" style="font-size:1.5rem;margin:0.5rem 0">${formatCurrency(program.tuitionFee)}</div>
          <p>One-time payment</p>
        </div>
        <div class="payment-option" data-type="installment" onclick="selectPayment('installment')">
          <h4>📅 Payment Plan</h4>
          <div class="payment-amount" style="font-size:1.5rem;margin:0.5rem 0">${formatCurrency(installmentAmt)}/mo</div>
          <p>4 monthly installments</p>
        </div>
      </div>
      <form id="payment-form">
        <input type="hidden" id="pay-app-id" value="${app._id}">
        <input type="hidden" id="pay-type" value="full">
        <div class="form-section">
          <h3><span class="section-number">💳</span> Card Details</h3>
          <div class="form-group">
            <label class="form-label">Cardholder Name</label>
            <input type="text" class="form-input" id="card-name" placeholder="John Doe" required>
          </div>
          <div class="form-group">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-input" id="card-number" placeholder="4242 4242 4242 4242" maxlength="19" required>
          </div>
          <div class="card-inputs">
            <div class="form-group">
              <label class="form-label">Expiry Date</label>
              <input type="text" class="form-input" id="card-expiry" placeholder="MM/YY" maxlength="5" required>
            </div>
            <div class="form-group">
              <label class="form-label">CVC</label>
              <input type="text" class="form-input" id="card-cvc" placeholder="123" maxlength="4" required>
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-success btn-lg btn-block" id="pay-btn">Pay ${formatCurrency(program.tuitionFee)}</button>
        <p class="text-center mt-2" style="font-size:0.8rem;color:var(--text-muted)">🔒 Secure payment processing. Your data is encrypted.</p>
      </form>
    </div>
  `;
    document.getElementById('card-number').addEventListener('input', function (e) {
        let v = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = v;
    });
    document.getElementById('card-expiry').addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
        e.target.value = v;
    });
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
    window._programFee = program.tuitionFee;
    window._installmentAmt = installmentAmt;
}

function selectPayment(type) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    document.querySelector(`.payment-option[data-type="${type}"]`).classList.add('selected');
    document.getElementById('pay-type').value = type;
    const btn = document.getElementById('pay-btn');
    btn.textContent = type === 'full' ? `Pay ${formatCurrency(window._programFee)}` : `Pay ${formatCurrency(window._installmentAmt)} (1st installment)`;
}

async function handlePayment(e) {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    try {
        const result = await api.post('/payments', {
            applicationId: document.getElementById('pay-app-id').value,
            paymentType: document.getElementById('pay-type').value,
            cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
            cardExpiry: document.getElementById('card-expiry').value,
            cardCvc: document.getElementById('card-cvc').value,
            cardName: document.getElementById('card-name').value
        });
        const container = document.getElementById('payment-content');
        container.innerHTML = `
      <div class="success-container" style="padding-top:8rem;">
        <div class="success-icon">💰</div>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
        <div class="success-ref">${result.payment.transactionId}</div>
        <p style="color:var(--text-muted);font-size:0.85rem;">Amount: ${formatCurrency(result.payment.amount)}</p>
        <p style="color:var(--text-muted);font-size:0.85rem;">A confirmation email has been sent.</p>
        <a href="/dashboard" class="btn btn-primary mt-3">Back to Dashboard</a>
      </div>
    `;
        toast.success('Payment successful!');
    } catch (error) {
        toast.error(error.message);
        btn.disabled = false;
        btn.textContent = 'Retry Payment';
    }
}
