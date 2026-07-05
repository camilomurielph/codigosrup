// js/app.js
import { REPO_CONFIG } from './config.js';
import * as gitService from './gitService.js';
import { initHandlers, setupModalHandlers } from './eventHandlers.js';

// 1. Navegación entre menús (igual que antes)
document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const menuId = `menu-${btn.dataset.menu}`;
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
        document.getElementById(menuId).classList.add('active');
    });
});

// 2. Configurar modal
setupModalHandlers();

// 3. Función principal
async function init() {
    // Verificar si tenemos token guardado
    if (!gitService.hasToken()) {
        const ok = gitService.promptForToken();
        if (!ok) {
            alert('Necesitas un token para continuar. Recarga la página e inténtalo de nuevo.');
            return;
        }
    }

    try {
        // Leer el archivo desde GitHub
        const { content, sha } = await gitService.fetchDataJson();

        // Convertir la estructura de "categorias" a un array plano de documentos
        // con un $id único para manejar en la UI.
        const flatDocs = [];
        content.categorias.forEach(cat => {
            cat.codigos.forEach(cod => {
                flatDocs.push({
                    $id: `${cat.nombre}_${cod.codigo}_${Date.now()}_${Math.random()}`, // ID único temporal
                    categoria: cat.nombre,
                    codigo: cod.codigo,
                    descripcion: cod.descripcion
                });
            });
        });

        // Si no hay datos, inicializar con un ejemplo o pedir que suban data.json
        if (flatDocs.length === 0) {
            alert('⚠️ No se encontraron datos en data.json. Asegúrate de que el archivo exista en tu repositorio.');
        }

        // Inicializar la UI con los datos planos y el SHA
        initHandlers(flatDocs, sha);

    } catch (error) {
        console.error(error);
        alert(`Error al cargar los datos: ${error.message}\n\nVerifica que:\n1. El token tenga permisos "repo".\n2. El repositorio ${REPO_CONFIG.owner}/${REPO_CONFIG.repo} existe.\n3. El archivo data.json esté en la raíz.`);
    }
}

init();
