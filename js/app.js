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
// Importamos data.json (necesitarás copiar data.json a la carpeta raíz)
// En módulos ES, podemos hacer fetch al archivo.
async function seedIfEmpty() {
    const docs = await dataService.getAllCodes();
    if (docs.length > 0) return; // Ya hay datos

    try {
        const response = await fetch('data.json');
        const json = await response.json();
        for (const categoria of json.categorias) {
            for (const cod of categoria.codigos) {
                await dataService.createCode(categoria.nombre, cod.codigo, cod.descripcion);
            }
        }
        console.log('✅ Seed completado desde data.json');
        alert('¡Datos iniciales cargados exitosamente!');
    } catch (error) {
        console.error('Error en el seed:', error);
        alert('No se pudo cargar el seed. Sube manualmente data.json o revisa la consola.');
    }
}

// Modificar init:
async function init() {
    // Verificar/seedear primero
    await seedIfEmpty(); // Esperamos a que termine

    // Luego cargar los datos finales y pintar
    const docs = await dataService.getAllCodes();
    initHandlers(docs);
}
