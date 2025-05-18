// main.js (Ponto de Entrada Principal - Completo e Atualizado)
// Data da Última Atualização: 17 de maio de 2025

// --- Utilitários e Carregadores Principais ---
import { initializeTheme, loadHTML, closeModal, initializeTabs } from './uiUtils.js';
import { loadContent, sectionTitles, getCurrentSection } from './contentLoader.js';
import { initializeSidebarInteractions } from './sidebarController.js';
import { initializeTopNavInteractions } from './topnavController.js';

// --- Controllers Específicos de Seção (Importando funções de inicialização e globais) ---
// ... (todas as suas importações de controller como antes) ...
import { initializeDashboard } from './dashboardController.js';
import { openModalNovoCliente, visualizarCliente, editarCliente, excluirCliente, buscarCep } from './clientesController.js';
import { initializePecas, openModalNovaPeca, visualizarPeca, editarPeca, excluirPeca } from './pecasController.js';
import { initializeFornecedores, openModalNovoFornecedor, visualizarFornecedor, editarFornecedor, excluirFornecedor, buscarCepFornecedor } from './fornecedoresController.js';
import { initializeEntradaPecas, removerItemEntrada, cancelarNovaEntrada, visualizarDetalhesEntrada } from './entradaPecasController.js';
import { initializeSaidaPecas, removerItemSaida as removerItemTabelaSaida, cancelarNovaSaida as cancelarFormSaida, visualizarDetalhesSaida as verDetalhesSaida } from './saidaPecasController.js';
import { initializeInventario, visualizarMovimentacoesPeca, realizarAjusteEstoque, iniciarProcessoContagem, exportarInventario } from './inventarioController.js';
import { initializeGarantiaValidade, ajustarEstoquePorValidade, registrarAcionamentoGarantia, visualizarDetalhesGarantia } from './garantiaValidadeController.js';
import { initializePedidoVenda, removerItemDoPedido, cancelarNovoPedidoVenda, salvarPedidoComoOrcamento, listarPedidosVenda } from './pedidoVendaController.js';
import { initializeEmissaoNf, carregarDadosDoPedidoParaNFe, limparFormularioNFe, validarESimularEnvioNFe, listarNotasFiscais, adicionarItemManualmenteNFe, imprimirDANFESimulado } from './emissaoNfController.js';
import { initializeComissoes, processarPagamentoComissoesSelecionadas, exportarRelatorioComissoes } from './comissoesController.js';
import { initializeUsuariosPerfis, openModalNovoUsuario, editarUsuario, resetarSenhaUsuario, alternarStatusUsuario, openModalNovoPerfil, editarPerfil, excluirPerfil } from './usuariosController.js';
import { initializePreferencias, buscarCepPreferencias } from './preferenciasController.js';
import { initializeCurvaABC, exportarAnaliseABC } from './curvaAbcController.js';


// --- Ponto de Partida da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    // **NOVO: Verificação de Autenticação**
    const usuarioLogadoString = localStorage.getItem('usuarioLogadoImppeto');
    if (!usuarioLogadoString) {
        // Se não houver usuário logado, redireciona para a página de login
        // Assumindo que login.html está na mesma pasta ou um nível acima. Ajuste o caminho se necessário.
        window.location.href = 'login.html';
        return; // Impede a execução do restante do script do painel
    }

    // Se chegou aqui, o usuário está "logado" (simulação)
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    console.log("Usuário logado (simulação):", usuarioLogado);

    // Expondo funções globais para onclicks e utilidades gerais
    // ... (todas as suas atribuições window.funcao = funcao como antes) ...
    window.loadContent = loadContent;
    window.closeModal = closeModal;
    window.initializeTabs = initializeTabs;
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
    window.validarESimularEnvioNFe = validarESimularEnvioNFe;
    window.listarNotasFiscais = listarNotasFiscais;
    window.adicionarItemManualmenteNFe = adicionarItemManualmenteNFe;
    window.imprimirDANFESimulado = imprimirDANFESimulado;
    window.processarPagamentoComissoesSelecionadas = processarPagamentoComissoesSelecionadas;
    window.exportarRelatorioComissoes = exportarRelatorioComissoes;
    window.openModalNovoUsuario = openModalNovoUsuario;
    window.editarUsuario = editarUsuario;
    window.resetarSenhaUsuario = resetarSenhaUsuario;
    window.alternarStatusUsuario = alternarStatusUsuario;
    window.openModalNovoPerfil = openModalNovoPerfil;
    window.editarPerfil = editarPerfil;
    window.excluirPerfil = excluirPerfil;
    window.buscarCepPreferencias = buscarCepPreferencias;
    window.exportarAnaliseABC = exportarAnaliseABC;
    window.logout = logout; // **NOVO: Expor função de logout**


    // Inicialização da Aplicação
    initializeTheme();
    loadLayoutComponents(usuarioLogado); // Passa o usuário logado para o layout
    loadContent('dashboard');
});

/**
 * Carrega os componentes de layout principais (sidebar e topnav) e inicializa suas interações.
 * @param {object} usuario - O objeto do usuário logado.
 */
async function loadLayoutComponents(usuario) {
    await Promise.all([
        loadHTML('_sidebar.html', 'sidebar-container', () => initializeSidebarInteractions(usuario)),
        loadHTML('_top_navigation.html', 'topnav-container', () => initializeTopNavInteractions(usuario))
    ]);
    // O título da página é atualizado por `loadContent` após o carregamento da seção inicial.
    // Mas podemos atualizar a topnav/sidebar com info do usuário aqui, se as funções de init aceitarem.
    if (typeof updateUserInfoInLayout === 'function') { // Função hipotética
        updateUserInfoInLayout(usuario);
    }
}

// **NOVA FUNÇÃO DE LOGOUT**
function logout() {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
        localStorage.removeItem('usuarioLogadoImppeto');
        window.location.href = 'login.html';
    }
}