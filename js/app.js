// js/app.js
import { APPWRITE_CONFIG } from './config.js';
import * as dataService from './dataService.js';
import { initHandlers, setupModalHandlers } from './eventHandlers.js';

// 1. Configurar navegación entre menús
document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Quitar activo de todos
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Mostrar el menú correspondiente
        const menuId = `menu-${btn.dataset.menu}`;
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
        document.getElementById(menuId).classList.add('active');
    });
});

// 2. Configurar handlers del modal (crear/editar)
setupModalHandlers();

// 3. Cargar datos e inicializar la UI
async function init() {
    // Opcional: Si quieres que el seed inicial se haga desde data.json la primera vez,
    // puedes verificar si no hay datos y hacer un seed. Por ahora solo cargamos.
    const docs = await dataService.getAllCodes();
    if (docs.length === 0) {
        alert('⚠️ No hay datos en Appwrite. Asegúrate de seedear la base de datos con data.json desde la consola de Appwrite, o importa manualmente.');
    }
    initHandlers(docs);
}

init();
