// main.js (Ponto de Entrada Principal - Completo e Atualizado)
// Data da Última Atualização: 18 de maio de 2025 (BRT)

// --- Utilitários e Carregadores Principais ---
import { initializeTheme, loadHTML, closeModal, initializeTabs } from './uiUtils.js';
import { loadContent, sectionTitles, getCurrentSection } from './contentLoader.js';
import { initializeSidebarInteractions } from './sidebarController.js';
import { initializeTopNavInteractions } from './topnavController.js';

// --- Controllers Específicos de Seção (Outros Módulos) ---
import { initializeDashboard } from './dashboardController.js';
import { openModalNovoCliente, visualizarCliente, editarCliente, excluirCliente, buscarCep } from './clientesController.js';
import { initializePecas, openModalNovaPeca, visualizarPeca, editarPeca, excluirPeca } from './pecasController.js';
import { initializeFornecedores, openModalNovoFornecedor, visualizarFornecedor, editarFornecedor, excluirFornecedor, buscarCepFornecedor } from './fornecedoresController.js';
import { initializeEntradaPecas, removerItemEntrada, cancelarNovaEntrada, visualizarDetalhesEntrada } from './entradaPecasController.js';
import { initializeSaidaPecas, removerItemSaida as removerItemTabelaSaida, cancelarNovaSaida as cancelarFormSaida, visualizarDetalhesSaida as verDetalhesSaida } from './saidaPecasController.js';
import { initializeInventario, visualizarMovimentacoesPeca, realizarAjusteEstoque, iniciarProcessoContagem, exportarInventario } from './inventarioController.js';
import { initializeGarantiaValidade, ajustarEstoquePorValidade, registrarAcionamentoGarantia, visualizarDetalhesGarantia } from './garantiaValidadeController.js';
import { initializePedidoVenda, removerItemDoPedido, cancelarNovoPedidoVenda, salvarPedidoComoOrcamento, listarPedidosVenda, imprimirOrcamentoVenda } from './pedidoVendaController.js';
import { initializeEmissaoNf, carregarDadosDoPedidoParaNFe, limparFormularioNFe, validarESimularEnvioNFe, listarNotasFiscais, adicionarItemManualmenteNFe, imprimirDANFESimulado } from './emissaoNfController.js';
import { initializeComissoes, processarPagamentoComissoesSelecionadas, exportarRelatorioComissoes } from './comissoesController.js';
import { initializeUsuariosPerfis, openModalNovoUsuario, editarUsuario, resetarSenhaUsuario, alternarStatusUsuario, openModalNovoPerfil, editarPerfil, excluirPerfil } from './usuariosController.js';
import { initializePreferencias, buscarCepPreferencias } from './preferenciasController.js';
import { initializeCurvaABC, exportarAnaliseABC, acaoVerDetalhesPecaABC, acaoVerEstoquePecaABC, acaoSugerirCompraPecaABC } from './curvaAbcController.js';

// --- CONTROLLERS DO MÓDULO RH ---
// Controller Principal do RH (para inicialização do módulo e navegação entre abas)
// A função initializeRh é chamada pelo contentLoader.js
import { initializeRh } from './rhController.js'; // Este é o rhController.js principal

// Funções da Aba Funcionários (e seus modais) que são chamadas por onclick
import {
    openModalNovoFuncionario,
    editarFuncionario,
    visualizarFuncionario,
    inativarFuncionario,
    buscarCepFuncionario,
    openModalNovoDependente,
    openModalEditarDependente,
    removerDependenteTemporario,
    openModalHolerite as openHoleriteFromFuncList,
    openModalFerias as openFeriasFromFuncList
} from './rhFuncionariosController.js'; // Controller da aba Funcionários

// Funções da Aba Folha de Pagamento que são chamadas por onclick
import {
    calcularVisualizarFolha,
    registrarPagamentoFolha,
    imprimirHolerite,
    visualizarHoleriteDetalhado
} from './rhFolhaPagamentoController.js'; // Controller da aba Folha de Pagamento

// Funções da Aba Férias e Licenças que são chamadas por onclick
import {
    openModalNovaSolicitacaoFeriasLicenca,
    openModalEditarSolicitacaoFeriasLicenca,
    visualizarSolicitacaoFeriasLicenca,
    alterarStatusSolicitacao,
    aplicarFiltrosFeriasLicencas
} from './rhFeriasLicencasController.js'; // Controller da aba Férias e Licenças

// Funções da Aba Controle de Ponto que são chamadas por onclick (serão adicionadas quando implementadas)
import {
    carregarEspelhoDePonto,
    openModalNovaOcorrenciaPonto,
    exportarEspelhoPonto
    // salvarOcorrenciaPonto // Não precisa ser global se for chamada só internamente pelo modal
} from './rhPontoController.js'; // Controller da aba Controle de Ponto


// --- FUNÇÃO DE LOGOUT ---
function logout() {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
        localStorage.removeItem('usuarioLogadoImppeto');
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        window.location.href = basePath + 'login.html';
    }
}
// -------------------------


// --- Ponto de Partida da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) {
        console.log("Página de login carregada.");
        return;
    }

    const usuarioLogadoString = localStorage.getItem('usuarioLogadoImppeto');
    let usuarioLogado = null;

    if (usuarioLogadoString) {
        try {
            usuarioLogado = JSON.parse(usuarioLogadoString);
        } catch (e) {
            console.error("Erro ao parsear dados do usuário logado do localStorage:", e);
            localStorage.removeItem('usuarioLogadoImppeto');
        }
    }

    if (!usuarioLogado) {
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        window.location.href = basePath + 'login.html';
        return;
    }

    console.log("Usuário logado (simulação):", usuarioLogado);

    // Funções de UI e Navegação Globais
    window.loadContent = loadContent;
    window.closeModal = closeModal;
    window.initializeTabs = initializeTabs;

    // Clientes
    window.openModalNovoCliente = openModalNovoCliente;
    window.visualizarCliente = visualizarCliente;
    window.editarCliente = editarCliente;
    window.excluirCliente = excluirCliente;
    window.buscarCep = buscarCep;

    // Peças
    window.openModalNovaPeca = openModalNovaPeca;
    window.visualizarPeca = visualizarPeca;
    window.editarPeca = editarPeca;
    window.excluirPeca = excluirPeca;

    // Fornecedores
    window.openModalNovoFornecedor = openModalNovoFornecedor;
    window.visualizarFornecedor = visualizarFornecedor;
    window.editarFornecedor = editarFornecedor;
    window.excluirFornecedor = excluirFornecedor;
    window.buscarCepFornecedor = buscarCepFornecedor;

    // Entrada de Peças
    window.removerItemEntrada = removerItemEntrada;
    window.cancelarNovaEntrada = cancelarNovaEntrada;
    window.visualizarDetalhesEntrada = visualizarDetalhesEntrada;

    // Saída de Peças
    window.removerItemSaida = removerItemTabelaSaida;
    window.cancelarNovaSaida = cancelarFormSaida;
    window.visualizarDetalhesSaida = verDetalhesSaida;

    // Inventário
    window.visualizarMovimentacoesPeca = visualizarMovimentacoesPeca;
    window.realizarAjusteEstoque = realizarAjusteEstoque;
    window.iniciarProcessoContagem = iniciarProcessoContagem;
    window.exportarInventario = exportarInventario;

    // Garantia e Validade
    window.ajustarEstoquePorValidade = ajustarEstoquePorValidade;
    window.registrarAcionamentoGarantia = registrarAcionamentoGarantia;
    window.visualizarDetalhesGarantia = visualizarDetalhesGarantia;

    // Pedido de Venda
    window.removerItemDoPedido = removerItemDoPedido;
    window.cancelarNovoPedidoVenda = cancelarNovoPedidoVenda;
    window.salvarPedidoComoOrcamento = salvarPedidoComoOrcamento;
    window.listarPedidosVenda = listarPedidosVenda;
    window.imprimirOrcamentoVenda = imprimirOrcamentoVenda;

    // Emissão NF-e
    window.carregarDadosDoPedidoParaNFe = carregarDadosDoPedidoParaNFe;
    window.limparFormularioNFe = limparFormularioNFe;
    window.validarESimularEnvioNFe = validarESimularEnvioNFe;
    window.listarNotasFiscais = listarNotasFiscais;
    window.adicionarItemManualmenteNFe = adicionarItemManualmenteNFe;
    window.imprimirDANFESimulado = imprimirDANFESimulado;

    // Comissões
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
    window.buscarCepPreferencias = buscarCepPreferencias;

    // Curva ABC
    window.exportarAnaliseABC = exportarAnaliseABC;
    window.acaoVerDetalhesPecaABC = acaoVerDetalhesPecaABC;
    window.acaoVerEstoquePecaABC = acaoVerEstoquePecaABC;
    window.acaoSugerirCompraPecaABC = acaoSugerirCompraPecaABC;

    // --- FUNÇÕES GLOBAIS DO MÓDULO RH ---
    // Aba Funcionários e Modais relacionados
    window.openModalNovoFuncionario = openModalNovoFuncionario;
    window.editarFuncionario = editarFuncionario;
    window.visualizarFuncionario = visualizarFuncionario;
    window.inativarFuncionario = inativarFuncionario;
    window.buscarCepFuncionario = buscarCepFuncionario;
    window.openModalNovoDependente = openModalNovoDependente;
    window.openModalEditarDependente = openModalEditarDependente;
    window.removerDependenteTemporario = removerDependenteTemporario;
    window.openModalHolerite = openHoleriteFromFuncList; // Chamada da tabela de funcionários
    window.openModalFerias = openFeriasFromFuncList;     // Chamada da tabela de funcionários

    // Aba Folha de Pagamento
    window.calcularVisualizarFolha = calcularVisualizarFolha;
    window.registrarPagamentoFolha = registrarPagamentoFolha;
    window.imprimirHolerite = imprimirHolerite; // Função da aba Folha
    window.visualizarHoleriteDetalhado = visualizarHoleriteDetalhado;

    // Aba Férias e Licenças
    window.openModalNovaSolicitacaoFeriasLicenca = openModalNovaSolicitacaoFeriasLicenca;
    window.openModalEditarSolicitacaoFeriasLicenca = openModalEditarSolicitacaoFeriasLicenca;
    window.visualizarSolicitacaoFeriasLicenca = visualizarSolicitacaoFeriasLicenca;
    window.alterarStatusSolicitacao = alterarStatusSolicitacao;
    window.aplicarFiltrosFeriasLicencas = aplicarFiltrosFeriasLicencas;

    // Aba Controle de Ponto
    window.carregarEspelhoDePonto = carregarEspelhoDePonto;
    window.openModalNovaOcorrenciaPonto = openModalNovaOcorrenciaPonto;
    window.exportarEspelhoPonto = exportarEspelhoPonto;
    // --- FIM DAS FUNÇÕES GLOBAIS DO RH ---

    // Logout
    window.logout = logout;

    initializeTheme();
    loadLayoutComponents(usuarioLogado);
    loadContent('dashboard');
});

async function loadLayoutComponents(usuario) {
    await Promise.all([
        loadHTML('_sidebar.html', 'sidebar-container', () => initializeSidebarInteractions(usuario)),
        loadHTML('_top_navigation.html', 'topnav-container', () => initializeTopNavInteractions(usuario))
    ]);
}