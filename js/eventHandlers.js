// js/eventHandlers.js
import * as gitService from './gitService.js';
import { groupByCategory, renderCheckboxes, renderEdicion, renderCategoriaBotones } from './uiRenderer.js';

let currentData = [];     // Array plano de documentos
let currentSha = null;    // SHA del archivo para la próxima escritura
let currentCategoriasMap = new Map();

// Función central para guardar y refrescar
async function saveAndRefresh(dataArray) {
    try {
        // Reconstruir el objeto para guardar (estructura de categorías)
        const map = groupByCategory(dataArray);
        const output = {
            categorias: Array.from(map.entries()).map(([nombre, docs]) => ({
                nombre,
                codigos: docs.map(d => ({ codigo: d.codigo, descripcion: d.descripcion }))
            }))
        };

        // Guardar en GitHub
        currentSha = await gitService.saveDataJson(output, currentSha);
        
        // Actualizar la UI con los nuevos datos
        currentData = dataArray;
        currentCategoriasMap = groupByCategory(dataArray);
        renderAll(currentCategoriasMap);
        alert('✅ Cambios guardados en GitHub.');
    } catch (error) {
        alert('❌ Error al guardar: ' + error.message);
        console.error(error);
    }
}

// Renderiza los 3 menús (se llama al cargar y tras cada guardado)
function renderAll(categoriasMap) {
    const categorias = Array.from(categoriasMap.keys());

    // Menú 1
    renderCategoriaBotones(categorias, (categoria) => {
        const codes = currentData.filter(d => d.categoria === categoria).map(d => d.codigo).join(', ');
        navigator.clipboard.writeText(codes).then(() => {
            alert(`✅ Códigos de "${categoria}" copiados.`);
        });
    });

    // Menú 2
    renderCheckboxes(categoriasMap, onToggleCategoria);
    // Menú 3
    renderEdicion(categoriasMap, onEditClick, onDeleteClick, onNewClick);
}

// Inicializar con los datos
export function initHandlers(dataArray, sha) {
    currentData = dataArray;
    currentSha = sha;
    currentCategoriasMap = groupByCategory(dataArray);
    renderAll(currentCategoriasMap);

    // Delegación de eventos para el botón "Copiar seleccionados" (Menú 2)
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
}

// --- Funciones internas de los handlers ---

function onToggleCategoria(categoria, checked) {
    const items = document.querySelectorAll(`#contenedor-checkboxes .categoria-item[data-categoria="${categoria}"] input[type="checkbox"]`);
    items.forEach(chk => chk.checked = checked);
}

function onEditClick(doc) {
    document.getElementById('edit-id').value = doc.$id;
    document.getElementById('edit-categoria').value = doc.categoria;
    document.getElementById('edit-codigo').value = doc.codigo;
    document.getElementById('edit-descripcion').value = doc.descripcion;
    document.getElementById('modal-titulo').textContent = 'Editar Código';
    document.getElementById('modal-form').style.display = 'flex';
}

function onNewClick(categoria) {
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-categoria').value = categoria;
    document.getElementById('edit-codigo').value = '';
    document.getElementById('edit-descripcion').value = '';
    document.getElementById('modal-titulo').textContent = 'Nuevo Código';
    document.getElementById('modal-form').style.display = 'flex';
}

async function onDeleteClick(docId) {
    if (!confirm('¿Eliminar este código?')) return;
    const newData = currentData.filter(d => d.$id !== docId);
    await saveAndRefresh(newData);
}

// Configurar el formulario del modal
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

        let newData;
        if (id) {
            // Editar: reemplazar el documento
            newData = currentData.map(d => 
                d.$id === id ? { ...d, categoria, codigo, descripcion } : d
            );
        } else {
            // Nuevo: crear ID temporal (usamos timestamp)
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
}
