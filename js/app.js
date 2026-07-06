// js/app.js
import { REPO_CONFIG } from './config.js';
import * as gitService from './gitService.js';
import { initHandlers, setupModalHandlers } from './eventHandlers.js';

// Navegación entre menús
document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Desactivar todos los botones
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Ocultar todos los menús
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));

        // Mostrar el menú correspondiente
        const menuId = `menu-${btn.dataset.menu}`;
        const targetMenu = document.getElementById(menuId);
        if (targetMenu) targetMenu.classList.add('active');
    });
});

setupModalHandlers();

async function init() {
    if (!gitService.hasToken()) {
        const ok = gitService.promptForToken();
        if (!ok) {
            alert('Necesitas un token para continuar. Recarga la página e inténtalo de nuevo.');
            return;
        }
    }

    try {
        const { content, sha } = await gitService.fetchDataJson();

        const flatDocs = [];
        content.categorias.forEach(cat => {
            cat.codigos.forEach(cod => {
                flatDocs.push({
                    $id: `${cat.nombre}_${cod.codigo}_${Date.now()}_${Math.random()}`,
                    categoria: cat.nombre,
                    codigo: cod.codigo,
                    descripcion: cod.descripcion
                });
            });
        });

        if (flatDocs.length === 0) {
            alert('⚠️ No se encontraron datos en data.json. Asegúrate de que el archivo exista en tu repositorio.');
        }

        initHandlers(flatDocs, sha);

    } catch (error) {
        console.error(error);
        alert(`Error al cargar los datos: ${error.message}\n\nVerifica que:\n1. El token tenga permisos "repo".\n2. El repositorio ${REPO_CONFIG.owner}/${REPO_CONFIG.repo} existe.\n3. El archivo data.json esté en la raíz.`);
    }
}

init();
