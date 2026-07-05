// js/dataService.js
import { APPWRITE_CONFIG } from './config.js';

// Inicializar Appwrite SDK
const client = new appwrite.Client();
client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new appwrite.Databases(client);

// Obtener TODOS los documentos (sin paginación, asumimos < 1000)
export async function getAllCodes() {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            [
                // Ordenar por categoría y luego código
                appwrite.Query.orderAsc('categoria'),
                appwrite.Query.orderAsc('codigo'),
                appwrite.Query.limit(2000) // Ajusta si tienes más
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error al obtener códigos:', error);
        return [];
    }
}

// Crear un nuevo código
export async function createCode(categoria, codigo, descripcion) {
    const payload = {
        categoria,
        codigo,
        descripcion,
        // Permisos públicos (cualquiera puede leer/escribir)
        permissions: [
            appwrite.Permission.read('any'),
            appwrite.Permission.write('any')
        ]
    };
    return await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        'unique()',
        payload
    );
}

// Actualizar un código existente
export async function updateCode(docId, categoria, codigo, descripcion) {
    return await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        docId,
        { categoria, codigo, descripcion }
    );
}

// Eliminar un código
export async function deleteCode(docId) {
    return await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        docId
    );
}
