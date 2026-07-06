// js/eventHandlers.js
import * as gitService from './gitService.js';
import { groupByCategory, renderCheckboxes, renderEdicion, renderCategoriaBotones } from './uiRenderer.js';

let currentData = [];
let currentSha = null;
let currentCategoriasMap = new Map();

// Guarda los cambios en GitHub y refresca la UI
async function saveAndRefresh(dataArray) {
    try {
        const map = groupByCategory(dataArray);
        const output = {
            categorias: Array.from(map.entries()).map(([nombre, docs]) => ({
                nombre,
                codigos: docs.map(d => ({ codigo: d.codigo, descripcion: d.descripcion }))
            }))
        };

        currentSha = await gitService.saveDataJson(output, currentSha);
        currentData = dataArray;
        currentCategoriasMap = groupByCategory(dataArray);
        renderAll(currentCategoriasMap);
        alert('✅ Cambios guardados en GitHub.');
    } catch (error) {
        alert('❌ Error al guardar: ' + error.message);
        console.error(error);
    }
}

// Renderiza los tres menús y restaura el menú activo
function renderAll(categoriasMap) {
    const categorias = Array.from(categoriasMap.keys());

    // Menú 1: Botones de categorías
    renderCategoriaBotones(categorias, (categoria) => {
        const codes = currentData.filter(d => d.categoria === categoria).map(d => d.codigo).join(' ');
        navigator.clipboard.writeText(codes).then(() => {
            alert(`✅ Códigos de "${categoria}" copiados.`);
        });
    });

    // Menú 2: Checkboxes
    renderCheckboxes(categoriasMap, onToggleCategoria, onToggleCodigo);

    // Menú 3: Edición
    renderEdicion(categoriasMap, onEditClick, onDeleteClick, onNewClick, onNewCategory, onNewBatch);

    // === RESTAURAR EL MENÚ ACTIVO ===
    const activeNavBtn = document.querySelector('nav button.active');
    if (activeNavBtn) {
        const menuId = `menu-${activeNavBtn.dataset.menu}`;
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
        document.getElementById(menuId).classList.add('active');
    } else {
        // Por defecto, mostrar el primer menú
        document.querySelectorAll('.menu').forEach((m, i) => m.classList.toggle('active', i === 0));
    }
}

// Inicializa los handlers con los datos cargados
export function initHandlers(dataArray, sha) {
    currentData = dataArray;
    currentSha = sha;
    currentCategoriasMap = groupByCategory(dataArray);
    renderAll(currentCategoriasMap);

    // Delegación de evento para el botón "Copiar seleccionados" (Menú 2)
    document.getElementById('contenedor-checkboxes').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-copiar-seleccionados')) {
            const categoria = e.target.dataset.categoria;
            const checkboxes = document.querySelectorAll(`#contenedor-checkboxes .categoria-item[data-categoria="${categoria}"] input[type="checkbox"]`);
            const seleccionados = [];
            checkboxes.forEach(chk => {
                if (chk.checked) {
                    const docId = chk.dataset.docId;
                    const doc = currentData.find(d => d.$id === docId);
                    if (doc) seleccionados.push(doc.codigo);
                }
            });
            if (seleccionados.length === 0) return alert('No has seleccionado ningún código.');
            navigator.clipboard.writeText(seleccionados.join(' ')).then(() => {
                alert(`✅ ${seleccionados.length} códigos copiados.`);
            });
        }
    });
}

// --- Toggle de categoría (marcar/desmarcar todos) ---
function onToggleCategoria(categoria, checked) {
    const items = document.querySelectorAll(`#contenedor-checkboxes .categoria-item[data-categoria="${categoria}"] input[type="checkbox"]`);
    items.forEach(chk => chk.checked = checked);
}

function onToggleCodigo(categoria) {
    // Opcional: se puede usar para actualizar el estado del checkbox de categoría
}

// --- Funciones para el menú de edición ---

function onEditClick(doc) {
    document.getElementById('edit-id').value = doc.$id;
    document.getElementById('edit-categoria').value = doc.categoria;
    document.getElementById('edit-codigo').value = doc.codigo;
    document.getElementById('edit-descripcion').value = doc.descripcion;
    document.getElementById('modal-titulo').textContent = 'Editar Código';
    document.getElementById('modal-form').style.display = 'flex';
    document.getElementById('edit-codigo').focus();
}

function onNewClick(categoria) {
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-categoria').value = categoria || '';
    document.getElementById('edit-codigo').value = '';
    document.getElementById('edit-descripcion').value = '';
    document.getElementById('modal-titulo').textContent = 'Nuevo Código';
    document.getElementById('modal-form').style.display = 'flex';
    if (!categoria) {
        document.getElementById('edit-categoria').focus();
    } else {
        document.getElementById('edit-codigo').focus();
    }
}

function onNewCategory() {
    onNewClick('');
}

function onNewBatch(categoria) {
    document.getElementById('lote-categoria').value = categoria;
    document.getElementById('lote-codigos').value = '';
    document.getElementById('modal-lote-titulo').textContent = `Nuevos Códigos en Lote - ${categoria}`;
    document.getElementById('modal-lote').style.display = 'flex';
    document.getElementById('lote-codigos').focus();
}

async function onDeleteClick(docId) {
    if (!confirm('¿Eliminar este código?')) return;
    const newData = currentData.filter(d => d.$id !== docId);
    await saveAndRefresh(newData);
}

// --- Configuración de modales ---
export function setupModalHandlers() {
    // Modal de edición/creación
    const modal = document.getElementById('modal-form');
    document.getElementById('cerrar-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('codigo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const categoria = document.getElementById('edit-categoria').value.trim();
        const codigo = document.getElementById('edit-codigo').value.trim();
        const descripcion = document.getElementById('edit-descripcion').value.trim();

        if (!categoria || !codigo || !descripcion) return alert('Todos los campos son obligatorios.');

        let newData;
        if (id) {
            newData = currentData.map(d =>
                d.$id === id ? { ...d, categoria, codigo, descripcion } : d
            );
        } else {
            const newDoc = {
                $id: `temp_${Date.now()}`,
                categoria,
                codigo,
                descripcion
            };
            newData = [...currentData, newDoc];
        }

        modal.style.display = 'none';
        await saveAndRefresh(newData);
    });

    // Modal de lote
    const modalLote = document.getElementById('modal-lote');
    document.getElementById('cerrar-modal-lote').addEventListener('click', () => modalLote.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modalLote) modalLote.style.display = 'none'; });

    document.getElementById('lote-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoria = document.getElementById('lote-categoria').value.trim();
        const raw = document.getElementById('lote-codigos').value.trim();

        if (!categoria) return alert('Categoría no definida.');
        if (!raw) return alert('Pega al menos un código.');

        // Separar por espacios, comas, saltos de línea
        const codigos = raw.split(/[\s,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);

        if (codigos.length === 0) return alert('No se encontraron códigos válidos.');

        const newDocs = codigos.map((codigo, index) => {
            const num = String(index + 1).padStart(2, '0');
            return {
                $id: `temp_${Date.now()}_${index}`,
                categoria: categoria,
                codigo: codigo,
                descripcion: `pendiente ${num}`
            };
        });

        const newData = [...currentData, ...newDocs];
        modalLote.style.display = 'none';
        await saveAndRefresh(newData);
    });
}
