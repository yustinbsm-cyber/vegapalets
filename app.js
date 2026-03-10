// ===== CONFIGURACIÓN SUPABASE =====
const SUPABASE_URL = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'; // CAMBIA ESTO
const SUPABASE_KEY = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'; // CAMBIA ESTO (ANON_KEY)

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ESTADO =====
let palets = [];
let editingPaletId = null;
let editingPaqId = null;
let targetPaletId = null;
let deletingPaletId = null;

// ===== HELPERS =====
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getVencInfo(vencimiento) {
  if (!vencimiento) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const venc = new Date(vencimiento + 'T00:00:00');
  const diff = Math.ceil((venc - today) / (1000*60*60*24));
  const label = venc.toLocaleDateString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric'});
  if (diff < 0) return { cls:'vencido', icon:'🔴', texto:`Vencido: ${label}` };
  if (diff <= 30) return { cls:'pronto', icon:'🟡', texto:`Vence en ${diff}d` };
  return { cls:'ok', icon:'🟢', texto:`Vence: ${label}` };
}

function updateHeader() {
  document.getElementById('total-palets-header').textContent = palets.length + ' palet' + (palets.length!=1?'s':'');
  const now = new Date();
  document.getElementById('header-date').textContent = now.toLocaleDateString('es-AR', {weekday:'short',day:'numeric',month:'short'});
}

// ===== SINCRONIZACIÓN EN TIEMPO REAL =====
function suscribirseApalets() {
  supabase
    .channel('palets')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'palets' },
      () => cargarPalets()
    )
    .subscribe();
}

function suscribirseAPaquetes() {
  supabase
    .channel('paquetes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'paquetes' },
      () => cargarPalets()
    )
    .subscribe();
}

// ===== CARGAR DATOS =====
async function cargarPalets() {
  try {
    let { data: pals, error: err1 } = await supabase
      .from('palets')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (err1) throw err1;

    let { data: pkgs, error: err2 } = await supabase
      .from('paquetes')
      .select('*');

    if (err2) throw err2;

    palets = pals.map(p => ({
      ...p,
      paquetes: pkgs.filter(pkg => pkg.palet_id === p.id)
    }));

    renderPalets();
  } catch (err) {
    console.error('Error cargando:', err);
  }
}

// ===== CRUD PALETS =====
async function crearPalet(nombre) {
  try {
    const { data, error } = await supabase
      .from('palets')
      .insert([{
        nombre,
        usuario_creador_id: '00000000-0000-0000-0000-000000000000' // Usuario anónimo
      }])
      .select();

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function actualizarPalet(id, nombre) {
  try {
    const { error } = await supabase
      .from('palets')
      .update({ nombre })
      .eq('id', id);

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function eliminarPalet(id) {
  try {
    const { error } = await supabase
      .from('palets')
      .delete()
      .eq('id', id);

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ===== CRUD PAQUETES =====
async function crearPaquete(paletId, nombre, codigo, cantidad, vencimiento) {
  try {
    const { data, error } = await supabase
      .from('paquetes')
      .insert([{
        palet_id: paletId,
        nombre,
        codigo,
        cantidad: parseInt(cantidad),
        vencimiento
      }])
      .select();

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function actualizarPaquete(paqId, nombre, codigo, cantidad, vencimiento) {
  try {
    const { error } = await supabase
      .from('paquetes')
      .update({ nombre, codigo, cantidad: parseInt(cantidad), vencimiento })
      .eq('id', paqId);

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function eliminarPaquete(paqId) {
  if (!confirm('¿Eliminar este paquete?')) return;

  try {
    const { error } = await supabase
      .from('paquetes')
      .delete()
      .eq('id', paqId);

    if (error) throw error;

  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ===== RENDER PALETS =====
function renderPalets() {
  const list = document.getElementById('palets-list');
  const empty = document.getElementById('empty-palets');
  updateHeader();

  if (palets.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = palets.map(p => {
    const totalPkg = (p.paquetes || []).reduce((a,b) => a + parseInt(b.cantidad), 0);
    const pkgsHtml = (p.paquetes || []).map((pkg) => {
      const vencInfo = getVencInfo(pkg.vencimiento);
      return `
      <div class="pkg-row">
        <div class="pkg-info">
          <div class="pkg-name">${esc(pkg.nombre)}</div>
          <div class="pkg-qty">📦 ${pkg.cantidad} paquete${pkg.cantidad!=1?'s':''}</div>
          ${pkg.codigo ? `<div class="pkg-code">🔖 ${esc(pkg.codigo)}</div>` : ''}
          ${vencInfo ? `<div class="pkg-venc ${vencInfo.cls}">${vencInfo.icon} ${vencInfo.texto}</div>` : ''}
        </div>
        <button class="btn-icon edit" onclick="editarPaquete(${p.id}, ${pkg.id})">✏️</button>
        <button class="btn-icon del" onclick="eliminarPaquete(${pkg.id})">🗑</button>
      </div>
    `}).join('');

    const hasVencido = (p.paquetes || []).some(pkg => { const v = getVencInfo(pkg.vencimiento); return v && v.cls === 'vencido'; });
    const hasPronto = !hasVencido && (p.paquetes || []).some(pkg => { const v = getVencInfo(pkg.vencimiento); return v && v.cls === 'pronto'; });

    return `
      <div class="palet-card ${hasVencido?'has-vencido':hasPronto?'has-pronto':''}" id="palet-${p.id}">
        <div class="palet-header" onclick="togglePalet(${p.id})">
          <div>
            <div class="palet-name">${esc(p.nombre)}</div>
            <div class="palet-meta">${(p.paquetes || []).length} tipo${(p.paquetes || []).length!=1?'s':''} · ${totalPkg} paquete${totalPkg!=1?'s':''}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge">${totalPkg}</span>
            <span class="chevron">▼</span>
          </div>
        </div>
        <div class="palet-body">
          ${pkgsHtml}
          <div class="action-row">
            <button class="btn btn-secondary" style="flex:1" onclick="abrirModalPaquete(${p.id})">+ Paquete</button>
            <button class="btn btn-outline" onclick="editarNombrePalet(${p.id})">✏️ Nombre</button>
            <button class="btn btn-danger" onclick="pedirEliminarPalet(${p.id})">🗑</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function togglePalet(id) {
  const card = document.getElementById('palet-' + id);
  if (card) card.classList.toggle('open');
}

function cambiarScreen(name, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  btn.classList.add('active');

  const fab = document.getElementById('fab-btn');
  if (name === 'palets') {
    fab.style.display = 'flex';
  } else if (name === 'resumen') {
    fab.style.display = 'none';
    renderResumen();
  } else if (name === 'buscar') {
    fab.style.display = 'none';
    setTimeout(() => document.getElementById('search-input').focus(), 200);
  }
}

// ===== MODALES =====
function abrirModalPalet(id) {
  editingPaletId = id || null;
  const t = document.getElementById('modal-palet-title');
  const inp = document.getElementById('input-palet-nombre');
  if (id) {
    const p = palets.find(x => x.id === id);
    t.textContent = 'Editar Nombre';
    inp.value = p.nombre;
  } else {
    t.textContent = 'Nuevo Palet';
    inp.value = '';
  }
  document.getElementById('modal-palet').classList.add('open');
  setTimeout(() => inp.focus(), 300);
}

function editarNombrePalet(id) {
  abrirModalPalet(id);
}

function cerrarModalPalet() {
  document.getElementById('modal-palet').classList.remove('open');
  editingPaletId = null;
}

async function guardarPalet() {
  const nombre = document.getElementById('input-palet-nombre').value.trim();
  if (!nombre) {
    alert('Ingresá un nombre para el palet');
    return;
  }

  if (editingPaletId) {
    await actualizarPalet(editingPaletId, nombre);
  } else {
    await crearPalet(nombre);
  }

  cerrarModalPalet();
}

function abrirModalPaquete(paletId, paqId) {
  targetPaletId = paletId;
  editingPaqId = paqId || null;
  const inp1 = document.getElementById('input-paq-nombre');
  const t = document.getElementById('modal-paq-title');

  if (paqId) {
    const palet = palets.find(p => p.id === paletId);
    const pkg = palet.paquetes.find(x => x.id === paqId);
    inp1.value = pkg.nombre;
    document.getElementById('input-paq-codigo').value = pkg.codigo || '';
    document.getElementById('input-paq-cantidad').value = pkg.cantidad;
    document.getElementById('input-paq-vencimiento').value = pkg.vencimiento || '';
    t.textContent = 'Editar Paquete';
  } else {
    inp1.value = '';
    document.getElementById('input-paq-codigo').value = '';
    document.getElementById('input-paq-cantidad').value = '';
    document.getElementById('input-paq-vencimiento').value = '';
    t.textContent = 'Agregar Paquete';
  }

  document.getElementById('modal-paquete').classList.add('open');
  setTimeout(() => inp1.focus(), 300);
}

function editarPaquete(paletId, paqId) {
  abrirModalPaquete(paletId, paqId);
}

function cerrarModalPaquete() {
  document.getElementById('modal-paquete').classList.remove('open');
  targetPaletId = null;
  editingPaqId = null;
}

async function guardarPaquete() {
  const nombre = document.getElementById('input-paq-nombre').value.trim();
  const codigo = document.getElementById('input-paq-codigo').value.trim();
  const cantidad = parseInt(document.getElementById('input-paq-cantidad').value);
  const vencimiento = document.getElementById('input-paq-vencimiento').value;

  if (!nombre) {
    alert('Ingresá el nombre del producto');
    return;
  }
  if (!cantidad || cantidad < 1) {
    alert('Ingresá una cantidad válida');
    return;
  }

  if (editingPaqId) {
    await actualizarPaquete(editingPaqId, nombre, codigo, cantidad, vencimiento);
  } else {
    await crearPaquete(targetPaletId, nombre, codigo, cantidad, vencimiento);
  }

  cerrarModalPaquete();
}

function pedirEliminarPalet(id) {
  deletingPaletId = id;
  document.getElementById('modal-del-palet').classList.add('open');
}

function cerrarModalDelPalet() {
  document.getElementById('modal-del-palet').classList.remove('open');
  deletingPaletId = null;
}

async function confirmarEliminarPalet() {
  await eliminarPalet(deletingPaletId);
  cerrarModalDelPalet();
}

// ===== RESUMEN =====
function renderResumen() {
  const totalPalets = palets.length;
  const totalPkgTypes = palets.reduce((a,p) => a + (p.paquetes || []).length, 0);
  const totalUnidades = palets.reduce((a,p) => a + (p.paquetes || []).reduce((b,pkg) => b + parseInt(pkg.cantidad), 0), 0);

  document.getElementById('stat-palets').textContent = totalPalets;
  document.getElementById('stat-paquetes').textContent = totalPkgTypes;
  document.getElementById('stat-tipos').textContent = [...new Set(palets.flatMap(p => (p.paquetes || []).map(pkg => pkg.nombre)))].length;
  document.getElementById('stat-unidades').textContent = totalUnidades;

  const lista = document.getElementById('resumen-lista');
  if (palets.length === 0) {
    lista.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>No hay datos aún.</p></div>';
    return;
  }

  lista.innerHTML = palets.map(p => {
    const total = (p.paquetes || []).reduce((a,b) => a + parseInt(b.cantidad), 0);
    const pkgsStr = (p.paquetes || []).map(pkg => `${pkg.nombre}: ${pkg.cantidad}`).join(' · ');
    return `
      <div class="resumen-palet">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="resumen-palet-name">${esc(p.nombre)}</div>
          <span class="badge">${total} pkg</span>
        </div>
        <div class="resumen-pkg">${pkgsStr || 'Sin paquetes'}</div>
        ${(p.paquetes || []).some(pkg => getVencInfo(pkg.vencimiento)?.cls === 'vencido') ? '<div style="color:var(--danger);font-size:12px;font-weight:600;margin-top:4px">🔴 VENCIDOS</div>' : ''}
      </div>
    `;
  }).join('');
}

// ===== BÚSQUEDA =====
function buscar(query) {
  const clearBtn = document.getElementById('search-clear-btn');
  clearBtn.classList.toggle('visible', query.length > 0);
  const resultsDiv = document.getElementById('search-results');
  const q = query.trim().toLowerCase();

  if (!q) {
    resultsDiv.innerHTML = `<div class="search-hint"><div class="icon">🔍</div><p>Escribí para buscar</p></div>`;
    return;
  }

  const grupos = {};
  palets.forEach(palet => {
    (palet.paquetes || []).forEach(pkg => {
      const nombreMatch = pkg.nombre.toLowerCase().includes(q);
      const codigoMatch = pkg.codigo && pkg.codigo.toLowerCase().includes(q);
      if (!nombreMatch && !codigoMatch) return;

      const clave = pkg.nombre.toLowerCase() + '||' + (pkg.codigo || '').toLowerCase();
      if (!grupos[clave]) {
        grupos[clave] = { nombre: pkg.nombre, codigo: pkg.codigo || '', palets: [] };
      }
      grupos[clave].palets.push({
        paletNombre: palet.nombre,
        cantidad: pkg.cantidad,
        vencimiento: pkg.vencimiento || ''
      });
    });
  });

  const claves = Object.keys(grupos);

  if (claves.length === 0) {
    resultsDiv.innerHTML = `<div class="no-results"><div class="icon">😕</div><p>No encontrado</p></div>`;
    return;
  }

  resultsDiv.innerHTML = claves.map(clave => {
    const g = grupos[clave];
    const paletRows = g.palets.map(pr => {
      const vi = getVencInfo(pr.vencimiento);
      return `
        <div class="result-palet-row">
          <div style="flex:1">
            <div class="result-palet-name">📦 ${esc(pr.paletNombre)}</div>
            <div class="result-palet-qty">${pr.cantidad} paquete${pr.cantidad!=1?'s':''}</div>
          </div>
          ${vi ? `<span class="result-palet-venc ${vi.cls}">${vi.icon}</span>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="result-card">
        <div class="result-product-header">
          <div>
            <div class="result-product-name">${esc(g.nombre)}</div>
            ${g.codigo ? `<div class="result-product-code">🔖 ${esc(g.codigo)}</div>` : ''}
          </div>
        </div>
        ${paletRows}
      </div>`;
  }).join('');
}

function limpiarBusqueda() {
  const inp = document.getElementById('search-input');
  inp.value = '';
  buscar('');
  inp.focus();
}

// ===== EXPORTAR EXCEL =====
function exportarExcel() {
  if (palets.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const bom = '\uFEFF';
  let csv = bom + 'Palet;Producto;Código;Cantidad;Vencimiento;Estado\n';

  palets.forEach(p => {
    if (!p.paquetes || p.paquetes.length === 0) {
      csv += `"${p.nombre}";"(sin paquetes)";"";"";"";""\n`;
    } else {
      p.paquetes.forEach(pkg => {
        const vi = getVencInfo(pkg.vencimiento);
        const estado = vi ? vi.texto : 'Sin fecha';
        csv += `"${p.nombre}";"${pkg.nombre}";"${pkg.codigo||''}";"${pkg.cantidad}";"${pkg.vencimiento||''}";"${estado}"\n`;
      });
    }
  });

  csv += '\nRESUMEN\n';
  csv += `Total Palets;${palets.length}\n`;
  const totalUnidades = palets.reduce((a,p) => a + (p.paquetes || []).reduce((b,pkg) => b + parseInt(pkg.cantidad), 0), 0);
  csv += `Total Unidades;${totalUnidades}\n`;
  csv += `Fecha;${new Date().toLocaleDateString('es-AR')}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `palets-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== CERRAR MODALES =====
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

document.getElementById('input-palet-nombre')?.addEventListener('keypress', e => { if(e.key==='Enter') guardarPalet(); });
document.getElementById('input-paq-cantidad')?.addEventListener('keypress', e => { if(e.key==='Enter') guardarPaquete(); });

// ===== INIT =====
window.addEventListener('load', () => {
  cargarPalets();
  suscribirseApalets();
  suscribirseAPaquetes();
});
