// main.js (Ponto de Entrada Principal Atualizado)

import { initializeTheme, loadHTML, updatePageTitle, openModal, closeModal, initializeTabs } from './uiUtils.js';
import { loadContent, sectionTitles, getCurrentSection } from './contentLoader.js';
import { initializeSidebarInteractions } from './sidebarController.js';
import { initializeTopNavInteractions } from './topnavController.js';
import { openModalNovoCliente, visualizarCliente, editarCliente, excluirCliente, buscarCep } from './clientesController.js';
import { openModalNovaPeca, visualizarPeca, editarPeca, excluirPeca } from './pecasController.js';
import { openModalNovoFornecedor, visualizarFornecedor, editarFornecedor, excluirFornecedor, buscarCepFornecedor } from './fornecedoresController.js';
import { initializeEntradaPecas, removerItemEntrada, cancelarNovaEntrada, visualizarDetalhesEntrada } from './entradaPecasController.js';
import { initializeSaidaPecas, removerItemSaida as removerItemTabelaSaida, cancelarNovaSaida as cancelarFormSaida, visualizarDetalhesSaida as verDetalhesSaida } from './saidaPecasController.js';
import { initializeInventario, visualizarMovimentacoesPeca, realizarAjusteEstoque, iniciarProcessoContagem, exportarInventario } from './inventarioController.js';
import { initializeGarantiaValidade, ajustarEstoquePorValidade, registrarAcionamentoGarantia, visualizarDetalhesGarantia } from './garantiaValidadeController.js';
import { initializePedidoVenda, removerItemDoPedido, cancelarNovoPedidoVenda, salvarPedidoComoOrcamento, listarPedidosVenda } from './pedidoVendaController.js';
import { initializeEmissaoNf, carregarDadosDoPedidoParaNFe, limparFormularioNFe, listarNotasFiscais, adicionarItemManualmenteNFe, imprimirDANFESimulado } from './emissaoNfController.js';
import { initializeComissoes, processarPagamentoComissoesSelecionadas, exportarRelatorioComissoes } from './comissoesController.js';
import { initializeUsuariosPerfis, openModalNovoUsuario, editarUsuario, resetarSenhaUsuario, alternarStatusUsuario, openModalNovoPerfil, editarPerfil, excluirPerfil } from './usuariosController.js';
import { initializePreferencias, buscarCepPreferencias } from './preferenciasController.js'; // IMPORTADO!


// --- Ponto de Partida da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (atribuições window para funções globais já existentes) ...
    window.loadContent = loadContent;
    window.closeModal = closeModal;
    window.initializeTabs = initializeTabs;

    // Clientes, Peças, Fornecedores, Entrada, Saída, Inventário, Garantia, Pedido Venda, Emissão NF, Comissões
    window.openModalNovoCliente = openModalNovoCliente;
    window.visualizarCliente = visualizarCliente;
    window.editarCliente = editarCliente;
    window.excluirCliente = excluirCliente;
    window.buscarCep = buscarCep;
    window.openModalNovaPeca = openModalNovaPeca;
    window.visualizarPeca = visualizarPeca;
    window.editarPeca = editarPeca;
    window.excluirPeca = excluirPeca;
    window.openModalNovoFornecedor = openModalNovoFornecedor;
    window.visualizarFornecedor = visualizarFornecedor;
    window.editarFornecedor = editarFornecedor;
    window.excluirFornecedor = excluirFornecedor;
    window.buscarCepFornecedor = buscarCepFornecedor;
    window.removerItemEntrada = removerItemEntrada;
    window.cancelarNovaEntrada = cancelarNovaEntrada;
    window.visualizarDetalhesEntrada = visualizarDetalhesEntrada;
    window.removerItemSaida = removerItemTabelaSaida; 
    window.cancelarNovaSaida = cancelarFormSaida;    
    window.visualizarDetalhesSaida = verDetalhesSaida;
    window.visualizarMovimentacoesPeca = visualizarMovimentacoesPeca;
    window.realizarAjusteEstoque = realizarAjusteEstoque;
    window.iniciarProcessoContagem = iniciarProcessoContagem;
    window.exportarInventario = exportarInventario;
    window.ajustarEstoquePorValidade = ajustarEstoquePorValidade;
    window.registrarAcionamentoGarantia = registrarAcionamentoGarantia;
    window.visualizarDetalhesGarantia = visualizarDetalhesGarantia;
    window.removerItemDoPedido = removerItemDoPedido;
    window.cancelarNovoPedidoVenda = cancelarNovoPedidoVenda;
    window.salvarPedidoComoOrcamento = salvarPedidoComoOrcamento;
    window.listarPedidosVenda = listarPedidosVenda;
    window.carregarDadosDoPedidoParaNFe = carregarDadosDoPedidoParaNFe;
    window.limparFormularioNFe = limparFormularioNFe;
    window.listarNotasFiscais = listarNotasFiscais;
    window.adicionarItemManualmenteNFe = adicionarItemManualmenteNFe;
    window.imprimirDANFESimulado = imprimirDANFESimulado;
    window.processarPagamentoComissoesSelecionadas = processarPagamentoComissoesSelecionadas;
    window.exportarRelatorioComissoes = exportarRelatorioComissoes;
    
    // Usuários e Perfis
    window.openModalNovoUsuario = openModalNovoUsuario;
    window.editarUsuario = editarUsuario;
    window.resetarSenhaUsuario = resetarSenhaUsuario;
    window.alternarStatusUsuario = alternarStatusUsuario;
    window.openModalNovoPerfil = openModalNovoPerfil;
    window.editarPerfil = editarPerfil;
    window.excluirPerfil = excluirPerfil;

    // Preferências da Loja
    window.buscarCepPreferencias = buscarCepPreferencias; // Para o onclick no HTML de preferências


    initializeTheme();
    loadLayoutComponents(); 
    loadContent('dashboard');
});


// --- Funções de Orquestração de Layout ---
async function loadLayoutComponents() {
    await Promise.all([
        loadHTML('_sidebar.html', 'sidebar-container', initializeSidebarInteractions),
        loadHTML('_top_navigation.html', 'topnav-container', initializeTopNavInteractions)
    ]);
    updatePageTitle(sectionTitles[getCurrentSection()] || 'Painel');
}