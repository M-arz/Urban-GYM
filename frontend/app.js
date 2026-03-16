// =========================================
// Urban-GYM Frontend – app.js
// =========================================

const API = 'http://localhost:3000';

// ── Tab switching ──
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ── Toast notifications ──
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── Status Check ──
async function checkServiceStatus(url, dotId, labelId) {
    const dot = document.getElementById(dotId);
    const label = document.getElementById(labelId);
    try {
        const res = await fetch(`${url}`);
        if (res.ok || res.status < 500) {
            dot.classList.add('online');
            dot.classList.remove('offline');
            label.textContent = 'online';
        }
    } catch {
        dot.classList.add('offline');
        dot.classList.remove('online');
        label.textContent = 'offline';
    }
}

async function checkAllStatuses() {
    await Promise.all([
        checkServiceStatus(`${API}/members`, 'dot-members', 'label-members'),
        checkServiceStatus(`${API}/bookings`, 'dot-bookings', 'label-bookings'),
    ]);
}

// ═══════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════

async function loadMembers() {
    const list = document.getElementById('members-list');
    const countEl = document.getElementById('members-count');
    list.innerHTML = '<div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div>';
    try {
        const res = await fetch(`${API}/members`);
        const members = await res.json();
        countEl.textContent = `${members.length} registros`;
        if (members.length === 0) {
            list.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><p>No hay miembros registrados aún.</p></div>`;
            return;
        }
        list.innerHTML = members.map(m => `
      <div class="data-item" id="member-${m.id}">
        <div class="item-avatar">${m.nombre.charAt(0).toUpperCase()}</div>
        <div class="item-info">
          <div class="item-name">${m.nombre}</div>
          <div class="item-meta">${m.email} · ID #${m.id}</div>
        </div>
      </div>
    `).join('');
    } catch (e) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al conectar con el servicio de miembros.</p></div>`;
    }
}

document.getElementById('form-member').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
    const body = {
        nombre: document.getElementById('member-nombre').value,
        email: document.getElementById('member-email').value,
        password: document.getElementById('member-password').value,
    };
    try {
        const res = await fetch(`${API}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al crear miembro');
        showToast(`Miembro "${body.nombre}" registrado con éxito 🎉`);
        e.target.reset();
        await loadMembers();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '+ Registrar Miembro';
    }
});

// ═══════════════════════════════════════
//  BOOKINGS
// ═══════════════════════════════════════

const BADGE_CLASSES = {
    yoga: 'badge-yoga',
    crossfit: 'badge-crossfit',
    spinning: 'badge-spinning',
    pilates: 'badge-pilates',
    boxeo: 'badge-boxeo',
};

async function loadBookings() {
    const list = document.getElementById('bookings-list');
    const countEl = document.getElementById('bookings-count');
    list.innerHTML = '<div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div>';
    try {
        const res = await fetch(`${API}/bookings`);
        const bookings = await res.json();
        countEl.textContent = `${bookings.length} reservas`;
        if (bookings.length === 0) {
            list.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>No hay reservas registradas aún.</p></div>`;
            return;
        }
        list.innerHTML = bookings.map(b => {
            const tipoKey = b.tipo.toLowerCase();
            const badgeClass = BADGE_CLASSES[tipoKey] || 'badge-yoga';
            return `
        <div class="data-item" id="booking-${b.id}">
          <div class="item-avatar" style="background:linear-gradient(135deg,#06b6d4,#3b82f6)">📅</div>
          <div class="item-info">
            <div class="item-name">${b.tipo} — Miembro #${b.memberId}</div>
            <div class="item-meta">${b.fecha} a las ${b.hora}</div>
          </div>
          <span class="item-badge ${badgeClass}">${b.tipo}</span>
          <button class="btn btn-danger" onclick="cancelBooking(${b.id})">Cancelar</button>
        </div>
      `;
        }).join('');
    } catch (e) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al conectar con el servicio de reservas.</p></div>`;
    }
}

async function cancelBooking(id) {
    try {
        const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('No se pudo cancelar');
        showToast(`Reserva #${id} cancelada`);
        await loadBookings();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.getElementById('form-booking').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
    const body = {
        memberId: parseInt(document.getElementById('booking-member-id').value),
        fecha: document.getElementById('booking-fecha').value,
        hora: document.getElementById('booking-hora').value,
        tipo: document.getElementById('booking-tipo').value,
    };
    try {
        const res = await fetch(`${API}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al crear reserva');
        showToast(`Reserva de ${body.tipo} creada para el ${body.fecha} 🏋️`);
        e.target.reset();
        await loadBookings();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '+ Crear Reserva';
    }
});

// ── Init ──
(async () => {
    await checkAllStatuses();
    await Promise.all([loadMembers(), loadBookings()]);
    setInterval(checkAllStatuses, 15000);
})();
