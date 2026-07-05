// js/uiRenderer.js

// Agrupa los documentos planos por categoría
export function groupByCategory(docs) {
    const map = new Map();
    docs.forEach(doc => {
        if (!map.has(doc.categoria)) map.set(doc.categoria, []);
        map.get(doc.categoria).push(doc);
    });
    // Ordenar categorías alfabéticamente
    return new Map([...map.entries()].sort());
}

// Menú 1: Botones de categoría
export function renderCategoriaBotones(categorias, clickHandler) {
    const container = document.getElementById('categoria-botones');
    container.innerHTML = '';
    categorias.forEach(nombre => {
        const btn = document.createElement('button');
        btn.textContent = nombre;
        btn.dataset.categoria = nombre;
        btn.addEventListener('click', () => clickHandler(nombre));
        container.appendChild(btn);
    });
}

// Menú 2: Checkboxes por categoría
export function renderCheckboxes(categoriasMap, onToggleCategoria, onToggleCodigo) {
    const container = document.getElementById('contenedor-checkboxes');
    container.innerHTML = '';

    categoriasMap.forEach((codigos, categoria) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'categoria-item';
        wrapper.dataset.categoria = categoria;

        // Header
        const header = document.createElement('div');
        header.className = 'categoria-header';
        const chkCategoria = document.createElement('input');
        chkCategoria.type = 'checkbox';
        chkCategoria.dataset.categoria = categoria;
        chkCategoria.addEventListener('change', (e) => onToggleCategoria(categoria, e.target.checked));
        header.appendChild(chkCategoria);
        const label = document.createElement('span');
        label.textContent = categoria;
        header.appendChild(label);
        wrapper.appendChild(header);

        // Lista de códigos
        const list = document.createElement('div');
        codigos.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'codigo-item';
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.dataset.docId = doc.$id;
            chk.dataset.categoria = categoria;
            chk.addEventListener('change', () => onToggleCodigo(categoria));
            item.appendChild(chk);
            const spanCod = document.createElement('span');
            spanCod.className = 'codigo';
            spanCod.textContent = doc.codigo;
            item.appendChild(spanCod);
            const spanDesc = document.createElement('span');
            spanDesc.className = 'descripcion';
            spanDesc.textContent = doc.descripcion;
            item.appendChild(spanDesc);
            list.appendChild(item);
        });
        wrapper.appendChild(list);

        // Botón copiar seleccionados de esta categoría
        const btnCopiar = document.createElement('button');
        btnCopiar.className = 'btn-copiar-seleccionados';
        btnCopiar.textContent = '📋 Copiar seleccionados de esta categoría';
        btnCopiar.dataset.categoria = categoria;
        wrapper.appendChild(btnCopiar);

        container.appendChild(wrapper);
    });
}

// Menú 3: Edición
export function renderEdicion(categoriasMap, onEdit, onDelete, onNew) {
    const container = document.getElementById('contenedor-edicion');
    container.innerHTML = '';

    categoriasMap.forEach((codigos, categoria) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'edicion-categoria';

        const header = document.createElement('div');
        header.className = 'edicion-header';
        const title = document.createElement('span');
        title.textContent = categoria;
        header.appendChild(title);
        const btnNew = document.createElement('button');
        btnNew.className = 'btn-nuevo';
        btnNew.textContent = '+ Nuevo';
        btnNew.dataset.categoria = categoria;
        btnNew.addEventListener('click', () => onNew(categoria));
        header.appendChild(btnNew);
        wrapper.appendChild(header);

        const list = document.createElement('div');
        codigos.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'edicion-item';
            const spanCod = document.createElement('span');
            spanCod.className = 'codigo';
            spanCod.textContent = doc.codigo;
            item.appendChild(spanCod);
            const spanDesc = document.createElement('span');
            spanDesc.className = 'descripcion';
            spanDesc.textContent = doc.descripcion;
            item.appendChild(spanDesc);

            const acciones = document.createElement('div');
            acciones.className = 'acciones';
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-editar';
            btnEdit.textContent = 'Editar';
            btnEdit.dataset.docId = doc.$id;
            btnEdit.addEventListener('click', () => onEdit(doc));
            acciones.appendChild(btnEdit);

            const btnDel = document.createElement('button');
            btnDel.className = 'btn-eliminar';
            btnDel.textContent = 'Eliminar';
            btnDel.dataset.docId = doc.$id;
            btnDel.addEventListener('click', () => onDelete(doc.$id));
            acciones.appendChild(btnDel);

            item.appendChild(acciones);
            list.appendChild(item);
        });
        wrapper.appendChild(list);
        container.appendChild(wrapper);
    });
}
