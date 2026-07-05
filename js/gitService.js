// js/gitService.js
import { REPO_CONFIG } from './config.js';

// Obtener el token desde localStorage (lo guardamos al iniciar)
function getToken() {
    return localStorage.getItem('github_token');
}

function setToken(token) {
    localStorage.setItem('github_token', token);
}

// Obtener el contenido actual de data.json
export async function fetchDataJson() {
    const token = getToken();
    if (!token) throw new Error('No hay token de GitHub');

    const { owner, repo } = REPO_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            // Si no existe, devolvemos estructura vacía para empezar
            return { content: { categorias: [] }, sha: null };
        }
        throw new Error(`Error al leer: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // El contenido viene en base64
    const decoded = atob(data.content);
    const jsonContent = JSON.parse(decoded);
    return { content: jsonContent, sha: data.sha };
}

// Guardar (reescribir) todo el data.json
export async function saveDataJson(content, sha) {
    const token = getToken();
    if (!token) throw new Error('No hay token de GitHub');

    const { owner, repo } = REPO_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;

    // Convertir a base64
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    const payload = {
        message: `Actualización de códigos RUP - ${new Date().toLocaleString()}`,
        content: encoded,
        sha: sha  // Obligatorio para actualizar
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error al guardar: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    // Devolver el nuevo sha para futuras operaciones
    return result.content.sha;
}

// Función para pedir el token al usuario y guardarlo
export function promptForToken() {
    const token = prompt('🔑 Introduce tu GitHub Personal Access Token (con permisos "repo"):');
    if (token && token.trim() !== '') {
        setToken(token.trim());
        return true;
    }
    return false;
}

// Verificar si ya hay token guardado
export function hasToken() {
    return !!localStorage.getItem('github_token');
}
