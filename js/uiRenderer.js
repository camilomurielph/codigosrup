// js/uiRenderer.js

export function groupByCategory(docs) {
    const map = new Map();
    docs.forEach(doc => {
        if (!map.has(doc.categoria)) map.set(doc.categoria, []);
        map.get(doc.categoria).push(doc);
    });
    return new Map([...map.entries()].sort());
}

export function renderCategoriaBotones(categorias, clickHandler) {
    const container = document.getElementById('categoria-botones');
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'button-column';
    categorias.forEach(nombre => {
        const btn = document.createElement('button');
        btn.textContent = nombre;
        btn.dataset.categoria = nombre;
        btn.addEventListener('click', () => clickHandler(nombre));
        wrapper.appendChild(btn);
    });
    container.appendChild(wrapper);
}

export function renderCheckboxes(categoriasMap, onToggleCategoria, onToggleCodigo) {
    const container = document.getElementById('contenedor-checkboxes');
    container.innerHTML = '';

    categoriasMap.forEach((codigos, categoria) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'categoria-acordeon';

        // HEADER
        const header = document.createElement('div');
        header.className = 'categoria-header';
        const chkCategoria = document.createElement('input');
        chkCategoria.type = 'checkbox';
        chkCategoria.dataset.categoria = categoria;
        chkCategoria.addEventListener('change', (e) => {
            onToggleCategoria(categoria, e.target.checked);
        });
        header.appendChild(chkCategoria);
        const label = document.createElement('span');
        label.textContent = categoria;
        header.appendChild(label);
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '▼';
        header.appendChild(arrow);

        header.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return;
            const content = wrapper.querySelector('.categoria-contenido');
            const isOpen = content.classList.toggle('open');
            arrow.classList.toggle('open', isOpen);
        });

        wrapper.appendChild(header);

        // CONTENIDO
        const content = document.createElement('div');
        content.className = 'categoria-contenido';

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
            content.appendChild(item);
        });

        const btnCopiar = document.createElement('button');
        btnCopiar.className = 'btn-copiar-seleccionados';
        btnCopiar.textContent = '📋 Copiar seleccionados';
        btnCopiar.dataset.categoria = categoria;
        content.appendChild(btnCopiar);

        wrapper.appendChild(content);
        container.appendChild(wrapper);
    });
}

export function renderEdicion(categoriasMap, onEdit, onDelete, onNew) {
    const container = document.getElementById('contenedor-edicion');
    container.innerHTML = '';

    categoriasMap.forEach((codigos, categoria) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'edicion-acordeon';

        // HEADER
        const header = document.createElement('div');
        header.className = 'edicion-header';
        const title = document.createElement('span');
        title.textContent = categoria;
        header.appendChild(title);

        const accionesCat = document.createElement('div');
        accionesCat.className = 'acciones-categoria';
        const btnNew = document.createElement('button');
        btnNew.className = 'btn-nuevo';
        btnNew.textContent = '+ Nuevo';
        btnNew.dataset.categoria = categoria;
        btnNew.addEventListener('click', (e) => {
            e.stopPropagation();
            onNew(categoria);
        });
        accionesCat.appendChild(btnNew);

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '▼';
        header.appendChild(arrow);
        header.appendChild(accionesCat);

        header.addEventListener('click', (e) => {
            if (e.target.closest('.btn-nuevo')) return;
            const content = wrapper.querySelector('.edicion-contenido');
            const isOpen = content.classList.toggle('open');
            arrow.classList.toggle('open', isOpen);
        });

        wrapper.appendChild(header);

        // CONTENIDO
        const content = document.createElement('div');
        content.className = 'edicion-contenido';

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
            btnEdit.addEventListener('click', (e) => {
                e.stopPropagation();
                onEdit(doc);
            });
            acciones.appendChild(btnEdit);

            const btnDel = document.createElement('button');
            btnDel.className = 'btn-eliminar';
            btnDel.textContent = 'Eliminar';
            btnDel.dataset.docId = doc.$id;
            btnDel.addEventListener('click', (e) => {
                e.stopPropagation();
                onDelete(doc.$id);
            });
            acciones.appendChild(btnDel);

            item.appendChild(acciones);
            content.appendChild(item);
        });

        wrapper.appendChild(content);
        container.appendChild(wrapper);
    });
}
