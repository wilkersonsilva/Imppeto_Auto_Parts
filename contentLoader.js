// contentLoader.js
// Data da Última Atualização: 16 de maio de 2025

import { loadHTML, updatePageTitle, highlightActiveSidebarLink, initializeTabs } from './uiUtils.js';

// Importa as funções de inicialização dos controllers
import { initializeDashboard } from './dashboardController.js';
// clientesController.js usa initializeTabs() de uiUtils.js, chamado abaixo.
// Se precisar de init específico, crie e importe initializeClientes().
import { initializePecas } from './pecasController.js';
import { initializeFornecedores } from './fornecedoresController.js';
import { initializeEntradaPecas } from './entradaPecasController.js';
import { initializeSaidaPecas } from './saidaPecasController.js';
import { initializeInventario } from './inventarioController.js';
import { initializeGarantiaValidade } from './garantiaValidadeController.js';
import { initializePedidoVenda } from './pedidoVendaController.js';
import { initializeEmissaoNf } from './emissaoNfController.js';
import { initializeComissoes } from './comissoesController.js';
import { initializeUsuariosPerfis } from './usuariosController.js';
import { initializePreferencias } from './preferenciasController.js';
import { initializeCurvaABC } from './curvaAbcController.js';


// --- Estado do Conteúdo ---
let currentSection = 'dashboard'; // Seção inicial padrão

export const sectionTitles = {
    'dashboard': 'Dashboard',
    'clientes': 'Gerenciamento de Clientes',
    'pecas': 'Gerenciamento de Peças',
    'fornecedores': 'Gerenciamento de Fornecedores',
    'entrada-pecas': 'Registrar Entrada de Peças',
    'saida-pecas': 'Registrar Saída de Peças',
    'inventario': 'Inventário de Peças',
    'garantia-validade': 'Controle de Garantia e Validade',
    'curva-abc': 'Análise da Curva ABC de Peças',
    'pedido-venda': 'Novo Pedido de Venda',
    'emissao-nf': 'Emissão de Nota Fiscal Eletrônica (NF-e)',
    'comissoes': 'Gerenciamento de Comissões',
    'usuarios': 'Gerenciamento de Usuários e Perfis',
    'preferencias': 'Preferências da Loja / Empresa'
};

export function getCurrentSection() { return currentSection; }
export function setCurrentSection(sectionId) { currentSection = sectionId; }

/**
 * Carrega o conteúdo de uma seção específica da aplicação.
 * @param {string} sectionId - O identificador da seção a ser carregada.
 */
export async function loadContent(sectionId) {
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('mobile-menu-backdrop');

    // Fecha a sidebar mobile se estiver aberta
    if (sidebar && backdrop && sidebar.classList.contains('translate-x-0') && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        backdrop.classList.add('hidden');
    }

    setCurrentSection(sectionId);
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error("Elemento #content-area não encontrado no DOM.");
        return;
    }

    // Exibe spinner de carregamento
    const titleForLoading = sectionTitles[sectionId] || sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    contentArea.innerHTML = `<div class="flex flex-col justify-center items-center h-full pt-10"><div class="spinner text-primary-DEFAULT dark:text-primary-light"></div><p class="mt-3 text-gray-500 dark:text-gray-400">Carregando ${titleForLoading}...</p></div>`;
    updatePageTitle(sectionTitles[sectionId] || 'Carregando...');

    const filePath = `_${sectionId}_content.html`;
    const success = await loadHTML(filePath, 'content-area', () => {
        // Chama a função de inicialização específica para a seção carregada
        switch (sectionId) {
            case 'dashboard':
                if (typeof initializeDashboard === 'function') initializeDashboard();
                break;
            case 'clientes':
                // Clientes usa initializeTabs para suas abas PF/PJ.
                // Se houver mais inicializações, criar initializeClientes() em clientesController.js e chamar aqui.
                if (typeof initializeTabs === 'function') initializeTabs();
                break;
            case 'pecas':
                if (typeof initializePecas === 'function') initializePecas();
                break;
            case 'fornecedores':
                if (typeof initializeFornecedores === 'function') initializeFornecedores();
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
                // usuariosController.js chama initializeTabs internamente em initializeUsuariosPerfis.
                if (typeof initializeUsuariosPerfis === 'function') initializeUsuariosPerfis();
                break;
            case 'preferencias':
                if (typeof initializePreferencias === 'function') initializePreferencias();
                break;
            case 'curva-abc':
                if (typeof initializeCurvaABC === 'function') initializeCurvaABC();
                break;
            default:
                console.warn(`Nenhuma função de inicialização definida para a seção: ${sectionId}`);
                // Ainda assim, tenta inicializar abas genéricas se o conteúdo tiver data-tab-container
                if (document.querySelector(`#content-area [data-tab-container]`)) {
                    if (typeof initializeTabs === 'function') initializeTabs();
                }
                break;
        }
    });

    if (success) {
        highlightActiveSidebarLink(sectionId, sectionTitles);
        contentArea.scrollTop = 0; // Garante que o conteúdo comece do topo
    } else {
        // A mensagem de erro já foi definida por loadHTML
        // updatePageTitle('Erro ao Carregar'); // Opcional, loadHTML já lida com o título do erro na área de conteúdo.
    }
}