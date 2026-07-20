// js/gitService.js
import { REPO_CONFIG } from './config.js';

function getToken() {
    return localStorage.getItem('github_token');
}

function setToken(token) {
    localStorage.setItem('github_token', token);
}

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
            return { content: { categorias: [] }, sha: null };
        }
        throw new Error(`Error al leer: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // === CORRECCIÓN DE TILDES: Decodificar Base64 a UTF-8 correctamente ===
    const binaryString = atob(data.content);
    const decoded = decodeURIComponent(escape(binaryString));
    const jsonContent = JSON.parse(decoded);
    
    return { content: jsonContent, sha: data.sha };
}

export async function saveDataJson(content, sha) {
    const token = getToken();
    if (!token) throw new Error('No hay token de GitHub');

    const { owner, repo } = REPO_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;

    // === CODIFICACIÓN UTF-8 CORRECTA PARA GUARDAR ===
    const jsonString = JSON.stringify(content, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));

    const payload = {
        message: `Actualización de códigos RUP - ${new Date().toLocaleString()}`,
        content: encoded,
        sha: sha
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
    return result.content.sha;
}

export function promptForToken() {
    const token = prompt('🔑 Introduce tu GitHub Personal Access Token (con permisos "repo"):');
    if (token && token.trim() !== '') {
        setToken(token.trim());
        return true;
    }
    return false;
}

export function hasToken() {
    return !!localStorage.getItem('github_token');
}
