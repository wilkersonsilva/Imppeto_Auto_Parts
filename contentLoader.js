// contentLoader.js
// Data e Hora Atual: 13 de maio de 2025

import { loadHTML, updatePageTitle, highlightActiveSidebarLink, initializeTabs } from './uiUtils.js';

// Importa as funções de inicialização dos controllers de cada seção
import { initializeEntradaPecas } from './entradaPecasController.js'; 
import { initializeSaidaPecas } from './saidaPecasController.js';
import { initializeInventario } from './inventarioController.js';
import { initializeGarantiaValidade } from './garantiaValidadeController.js'; 
import { initializePedidoVenda } from './pedidoVendaController.js';
import { initializeEmissaoNf } from './emissaoNfController.js';
import { initializeComissoes } from './comissoesController.js';
import { initializeUsuariosPerfis } from './usuariosController.js';
import { initializePreferencias } from './preferenciasController.js'; // NOVA IMPORTAÇÃO

// --- Estado do Conteúdo ---
let currentSection = 'dashboard'; // Seção inicial padrão

export const sectionTitles = {
    'dashboard': 'Dashboard',
    'clientes': 'Clientes',
    'pecas': 'Peças',
    'fornecedores': 'Fornecedores',
    'entrada-pecas': 'Entrada de Peças',
    'saida-pecas': 'Saída de Peças',
    'inventario': 'Inventário',
    'garantia-validade': 'Garantia e Validade',
    'pedido-venda': 'Pedido de Venda',
    'emissao-nf': 'Emissão de NF-e',
    'comissoes': 'Comissões',
    'usuarios': 'Usuários e Perfis',
    'preferencias': 'Preferências da Loja' // Título para a nova seção
};

export function getCurrentSection() {
    return currentSection;
}

export function setCurrentSection(sectionId) {
    currentSection = sectionId;
}

/**
 * Carrega o conteúdo principal de uma seção na área de conteúdo.
 * @param {string} sectionId - O ID da seção a ser carregada.
 */
export async function loadContent(sectionId) {
    // Fecha o menu mobile se estiver aberto ao carregar novo conteúdo
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (sidebar && backdrop && sidebar.classList.contains('translate-x-0') && window.innerWidth < 768) { // md breakpoint (768px)
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        backdrop.classList.add('hidden');
    }

    setCurrentSection(sectionId);
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error("Elemento #content-area não encontrado.");
        return;
    }

    contentArea.innerHTML = `<div class="flex justify-center items-center h-full pt-10"><div class="spinner text-primary-DEFAULT"></div></div>`;
    updatePageTitle(sectionTitles[sectionId] || 'Carregando...');
    
    const filePath = `_${sectionId}_content.html`;
    const success = await loadHTML(filePath, 'content-area', () => {
        // Callbacks específicos da seção após o carregamento do HTML
        switch (sectionId) {
            case 'clientes':
                if (typeof initializeTabs === 'function') initializeTabs();
                // Se clientesController.js tivesse initializeClientesPage():
                // if (typeof initializeClientesPage === 'function') initializeClientesPage();
                break;
            case 'pecas':
                // if (typeof initializePecasPage === 'function') initializePecasPage();
                break;
            case 'fornecedores':
                // if (typeof initializeFornecedoresPage === 'function') initializeFornecedoresPage();
                break;
            case 'entrada-pecas':
                if (typeof initializeEntradaPecas === 'function') initializeEntradaPecas(); 
                break;
            case 'saida-pecas':
                if (typeof initializeSaidaPecas === 'function') initializeSaidaPecas();   
                break;
            case 'inventario':
                if (typeof initializeInventario === 'function') initializeInventario();
                break;
            case 'garantia-validade':
                if (typeof initializeGarantiaValidade === 'function') initializeGarantiaValidade();
                break;
            case 'pedido-venda':
                if (typeof initializePedidoVenda === 'function') initializePedidoVenda();
                break;
            case 'emissao-nf': 
                if (typeof initializeEmissaoNf === 'function') initializeEmissaoNf();
                break;
            case 'comissoes': 
                if (typeof initializeComissoes === 'function') initializeComissoes();
                break;
            case 'usuarios':
                if (typeof initializeUsuariosPerfis === 'function') initializeUsuariosPerfis();
                break;
            case 'preferencias': // NOVA CONDIÇÃO ADICIONADA
                if (typeof initializePreferencias === 'function') initializePreferencias();
                break;
            default:
                // Nenhuma inicialização específica para dashboard ou outras seções simples
                break;
        }
    });

    if (success) {
        highlightActiveSidebarLink(sectionId, sectionTitles);
        contentArea.scrollTop = 0;
    } else {
        updatePageTitle('Erro ao Carregar');
    }
}