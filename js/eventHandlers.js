// js/eventHandlers.js
import * as dataService from './dataService.js';
import { groupByCategory, renderCheckboxes, renderEdicion, renderCategoriaBotones } from './uiRenderer.js';

let currentData = []; // Copia local en memoria

// Inicializar handlers con los datos
export function initHandlers(data) {
    currentData = data;
    const categoriasMap = groupByCategory(data);
    const categorias = Array.from(categoriasMap.keys());

    // Menú 1: Copiar categoría completa
    renderCategoriaBotones(categorias, (categoria) => {
        const codes = data.filter(d => d.categoria === categoria).map(d => d.codigo).join(', ');
        navigator.clipboard.writeText(codes).then(() => {
            alert(`✅ Códigos de "${categoria}" copiados al portapapeles.`);
        }).catch(() => alert('Error al copiar.'));
    });

    // Menú 2: Renderizar checkboxes
    renderCheckboxes(categoriasMap, onToggleCategoria, onToggleCodigo);
    // Asignar eventos de copiar a los botones del menú 2 (delegación)
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
            navigator.clipboard.writeText(seleccionados.join(', ')).then(() => {
                alert(`✅ ${seleccionados.length} códigos copiados.`);
            });
        }
    });

    // Menú 3: Renderizar edición
    renderEdicion(categoriasMap, onEditClick, onDeleteClick, onNewClick);
}

// Lógica de toggle de categoría (marcar/desmarcar todos)
function onToggleCategoria(categoria, checked) {
    const items = document.querySelectorAll(`#contenedor-checkboxes .categoria-item[data-categoria="${categoria}"] input[type="checkbox"]`);
    items.forEach(chk => chk.checked = checked);
}

function onToggleCodigo(categoria) {
    // Opcional: puedes verificar si todos están marcados para actualizar el header, pero no es obligatorio.
}

// Menú 3: Editar
function onEditClick(doc) {
    document.getElementById('edit-id').value = doc.$id;
    document.getElementById('edit-categoria').value = doc.categoria;
    document.getElementById('edit-codigo').value = doc.codigo;
    document.getElementById('edit-descripcion').value = doc.descripcion;
    document.getElementById('modal-titulo').textContent = 'Editar Código';
    document.getElementById('modal-form').style.display = 'flex';
}

// Menú 3: Nuevo
function onNewClick(categoria) {
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-categoria').value = categoria;
    document.getElementById('edit-codigo').value = '';
    document.getElementById('edit-descripcion').value = '';
    document.getElementById('modal-titulo').textContent = 'Nuevo Código';
    document.getElementById('modal-form').style.display = 'flex';
}

// Menú 3: Eliminar
async function onDeleteClick(docId) {
    if (!confirm('¿Estás seguro de eliminar este código?')) return;
    await dataService.deleteCode(docId);
    alert('✅ Eliminado.');
    // Recargar toda la app desde cero (refrescar datos)
    location.reload(); // Lo más simple para recargar todo, o puedes implementar una actualización parcial.
}

// Exportar funciones del modal para que app.js las conecte
export function setupModalHandlers() {
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

        if (id) {
            await dataService.updateCode(id, categoria, codigo, descripcion);
            alert('✅ Código actualizado.');
        } else {
            await dataService.createCode(categoria, codigo, descripcion);
            alert('✅ Código creado.');
        }
        modal.style.display = 'none';
        location.reload(); // Recargar para ver cambios (simple y efectivo)
    });
}
