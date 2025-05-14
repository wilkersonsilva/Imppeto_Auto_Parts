// comissoesController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

// SIMULAÇÃO DE DADOS
// Vendedores
const vendedores = [
    { id: 'vendedor1', nome: 'Admin (Vendedor Padrão)' },
    { id: 'vendedor2', nome: 'Vendedor Beta' },
    { id: 'vendedor3', nome: 'Vendedor Gama' }
];

// Vendas que geraram comissão (simulação)
// Em um sistema real, isso viria de pedidos/NFs faturadas e pagas.
let comissoesDB = [
    { id: 'com001', vendaId: 'PED10025', nf: '00567', dataVenda: '2025-05-09', vendedorId: 'vendedor1', cliente: 'Auto Peças ABC', valorVenda: 1250.00, percentualComissao: 5, valorComissao: 62.50, statusPagamento: 'pendente', dataPagamento: null, refPagamento: null },
    { id: 'com002', vendaId: 'PED10023', nf: '00565', dataVenda: '2025-05-07', vendedorId: 'vendedor2', cliente: 'Transportes Rápido', valorVenda: 2150.00, percentualComissao: 5, valorComissao: 107.50, statusPagamento: 'pendente', dataPagamento: null, refPagamento: null },
    { id: 'com003', vendaId: 'PED10020', nf: '00560', dataVenda: '2025-05-01', vendedorId: 'vendedor1', cliente: 'Mecânica Central', valorVenda: 890.50, percentualComissao: 5, valorComissao: 44.53, statusPagamento: 'paga', dataPagamento: '2025-05-10', refPagamento: 'Transf. #123' },
    { id: 'com004', vendaId: 'PED10015', nf: '00555', dataVenda: '2025-04-25', vendedorId: 'vendedor2', cliente: 'Oficina Veloz', valorVenda: 1500.00, percentualComissao: 6, valorComissao: 90.00, statusPagamento: 'pendente', dataPagamento: null, refPagamento: null },
    { id: 'com005', vendaId: 'PED10010', nf: '00550', dataVenda: '2025-04-15', vendedorId: 'vendedor1', cliente: 'Garagem do Zé', valorVenda: 750.00, percentualComissao: 5, valorComissao: 37.50, statusPagamento: 'paga', dataPagamento: '2025-05-02', refPagamento: 'Transf. #110' },
];

let comissoesFiltradas = []; // Para armazenar as comissões após aplicar filtros

/**
 * Inicializa a página de Comissões.
 */
export function initializeComissoes() {
    console.log("Inicializando Comissões...");
    const selectVendedor = document.getElementById('comissao-vendedor');
    const btnFiltrar = document.getElementById('btn-filtrar-comissoes');

    // Popula o select de vendedores (simulação)
    if (selectVendedor) {
        vendedores.forEach(vendedor => {
            const option = document.createElement('option');
            option.value = vendedor.id;
            option.textContent = vendedor.nome;
            selectVendedor.appendChild(option);
        });
    }

    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', carregarDadosComissoes);
    }
    
    // Define datas padrão para o período (Ex: mês atual)
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const dataInicioEl = document.getElementById('comissao-periodo-inicio');
    const dataFimEl = document.getElementById('comissao-periodo-fim');
    if(dataInicioEl && !dataInicioEl.value) dataInicioEl.value = primeiroDiaMes;
    if(dataFimEl && !dataFimEl.value) dataFimEl.value = ultimoDiaMes;

    carregarDadosComissoes(); // Carga inicial
}

/**
 * Carrega (simula) e renderiza os dados de comissões na tela.
 */
function carregarDadosComissoes() {
    const comissoesContainer = document.getElementById('comissoes-container');
    const placeholder = document.getElementById('comissoes-placeholder');
    if (!comissoesContainer || !placeholder) {
        console.error("Container de comissões ou placeholder não encontrado.");
        return;
    }

    placeholder.innerHTML = '<i class="fas fa-spinner fa-spin fa-2x text-primary-DEFAULT mb-3"></i><br>Carregando dados de comissões...';
    placeholder.classList.remove('hidden');
    comissoesContainer.innerHTML = ''; // Limpa o container principal antes de renderizar

    // SIMULAÇÃO: Aplicar filtros
    const vendedorIdFiltro = document.getElementById('comissao-vendedor').value;
    const dataInicioFiltro = document.getElementById('comissao-periodo-inicio').value;
    const dataFimFiltro = document.getElementById('comissao-periodo-fim').value;

    comissoesFiltradas = comissoesDB.filter(c => {
        let passaFiltro = true;
        if (vendedorIdFiltro !== 'todos' && c.vendedorId !== vendedorIdFiltro) {
            passaFiltro = false;
        }
        if (dataInicioFiltro && c.dataVenda < dataInicioFiltro) {
            passaFiltro = false;
        }
        if (dataFimFiltro) { // Adiciona 1 dia ao fim para incluir o dia inteiro
            const dataFimMaisUm = new Date(dataFimFiltro);
            dataFimMaisUm.setDate(dataFimMaisUm.getDate() + 1);
            if (c.dataVenda >= dataFimMaisUm.toISOString().split('T')[0]) {
                 passaFiltro = false;
            }
        }
        return passaFiltro;
    });

    // Agrupa comissões por vendedor
    const comissoesPorVendedor = comissoesFiltradas.reduce((acc, comissao) => {
        acc[comissao.vendedorId] = acc[comissao.vendedorId] || [];
        acc[comissao.vendedorId].push(comissao);
        return acc;
    }, {});

    setTimeout(() => { // Simula delay de carregamento
        placeholder.classList.add('hidden');
        if (Object.keys(comissoesPorVendedor).length === 0) {
            comissoesContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma comissão encontrada para os filtros aplicados.</p>`;
        } else {
            for (const vendedorId in comissoesPorVendedor) {
                const vendedor = vendedores.find(v => v.id === vendedorId);
                const comissoesDoVendedor = comissoesPorVendedor[vendedorId];
                renderizarComissoesPorVendedor(vendedor, comissoesDoVendedor, comissoesContainer);
            }
        }
        calcularTotalComissoesPendentesGeral();
    }, 500);
}

/**
 * Renderiza a seção de um vendedor com suas comissões.
 * @param {object} vendedor - O objeto do vendedor.
 * @param {Array} comissoes - Array de comissões do vendedor.
 * @param {HTMLElement} containerEl - O elemento container onde renderizar.
 */
function renderizarComissoesPorVendedor(vendedor, comissoes, containerEl) {
    const vendedorNome = vendedor ? vendedor.nome : 'Vendedor Desconhecido';
    let totalComissaoVendedorPendente = 0;
    let totalComissaoVendedorPaga = 0;

    let htmlItens = '';
    comissoes.forEach(c => {
        if (c.statusPagamento === 'pendente') {
            totalComissaoVendedorPendente += c.valorComissao;
        } else {
            totalComissaoVendedorPaga += c.valorComissao;
        }
        htmlItens += `
            <tr class="${c.statusPagamento === 'paga' ? 'bg-green-50 dark:bg-green-900/20' : (c.statusPagamento === 'cancelada' ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50')}">
                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">${new Date(c.dataVenda + "T00:00:00").toLocaleDateString('pt-BR')}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300" title="${c.vendaId} / NF ${c.nf}">${c.vendaId.substring(0,10)}...</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">${c.cliente}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-500 dark:text-gray-400">${c.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-500 dark:text-gray-400">${c.percentualComissao.toFixed(1)}%</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-right font-semibold ${c.statusPagamento === 'pendente' ? 'text-primary-DEFAULT dark:text-primary-light' : 'text-gray-700 dark:text-gray-200'}">${c.valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-center">
                    <span class="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full 
                        ${c.statusPagamento === 'paga' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' : 
                          c.statusPagamento === 'pendente' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' :
                          'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'}">
                        ${c.statusPagamento.charAt(0).toUpperCase() + c.statusPagamento.slice(1)}
                    </span>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-center">
                    ${c.statusPagamento === 'pendente' ? 
                    `<input type="checkbox" class="comissao-checkbox form-checkbox h-4 w-4 text-primary-DEFAULT rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-DEFAULT" data-comissao-id="${c.id}" data-valor="${c.valorComissao}">` : 
                    `<span class="text-gray-400 dark:text-gray-500 text-xs" title="Pago em ${c.dataPagamento ? new Date(c.dataPagamento + "T00:00:00").toLocaleDateString('pt-BR') : ''} - ${c.refPagamento || ''}"><i class="fas fa-check-circle text-success"></i></span>`}
                </td>
            </tr>
        `;
    });

    const vendedorSection = document.createElement('div');
    vendedorSection.className = 'mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0';
    vendedorSection.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-200">${vendedorNome}</h4>
            <div class="text-sm">
                <span class="font-medium text-gray-600 dark:text-gray-300">Pendente:</span> <span class="font-semibold text-primary-DEFAULT dark:text-primary-light">${totalComissaoVendedorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> |
                <span class="font-medium text-gray-600 dark:text-gray-300">Pago:</span> <span class="font-semibold text-success">${totalComissaoVendedorPaga.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        </div>
        <div class="overflow-x-auto custom-scrollbar shadow rounded-lg">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Venda</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ref. Venda</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vlr. Venda</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Com.</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vlr. Com.</th>
                        <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Pgto.</th>
                        <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pagar?</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    ${htmlItens}
                </tbody>
            </table>
        </div>
    `;
    containerEl.appendChild(vendedorSection);
}

/**
 * Calcula e exibe o total geral de comissões pendentes (filtradas).
 */
function calcularTotalComissoesPendentesGeral() {
    const totalGeralEl = document.getElementById('total-comissoes-pendentes-geral');
    if (!totalGeralEl) return;

    const totalPendente = comissoesFiltradas
        .filter(c => c.statusPagamento === 'pendente')
        .reduce((acc, c) => acc + c.valorComissao, 0);
    
    totalGeralEl.textContent = totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Abre o modal para processar o pagamento das comissões selecionadas.
 */
export function processarPagamentoComissoesSelecionadas() {
    const checkboxes = document.querySelectorAll('.comissao-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Nenhuma comissão selecionada para pagamento.');
        return;
    }

    let comissoesAPagar = [];
    let valorTotalAPagar = 0;
    checkboxes.forEach(cb => {
        const comissaoId = cb.getAttribute('data-comissao-id');
        const valor = parseFloat(cb.getAttribute('data-valor'));
        const comissao = comissoesFiltradas.find(c => c.id === comissaoId);
        if(comissao) {
            comissoesAPagar.push(comissao);
            valorTotalAPagar += valor;
        }
    });

    const resumoHtml = comissoesAPagar.map(c => 
        `<li class="text-xs">Vendedor: ${vendedores.find(v => v.id === c.vendedorId)?.nome || c.vendedorId} - Venda: ${c.vendaId} - Comissão: ${c.valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>`
    ).join('');

    const modalFormContainerId = 'modal-pagamento-comissao-content';
    const formHtmlContainer = document.getElementById(modalFormContainerId);
    if (!formHtmlContainer) { console.error("Container do formulário de pagamento não encontrado."); return; }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtmlContainer.innerHTML; // Pega o template do formulário

    const resumoEl = tempDiv.querySelector('#resumo-comissoes-pagamento');
    if (resumoEl) resumoEl.innerHTML = `<ul class="list-disc list-inside">${resumoHtml}</ul><p class="font-semibold mt-2">Total a Pagar: ${valorTotalAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>`;
    
    const dataPgtoEl = tempDiv.querySelector('#pgto-data');
    if (dataPgtoEl && !dataPgtoEl.value) dataPgtoEl.valueAsDate = new Date();


    openModal('Confirmar Pagamento de Comissões', tempDiv.innerHTML, {
        iconClass: 'fas fa-money-check-alt text-success',
        modalSize: 'sm:max-w-lg',
        confirmText: 'Confirmar Pagamento',
        onConfirm: () => {
            const formPagamento = document.querySelector('#modal-content-area #actual-form-pagamento-comissao');
            if (formPagamento) {
                if (formPagamento.checkValidity()) {
                    const dataPagamento = formPagamento.elements['pgto-data'].value;
                    const refPagamento = formPagamento.elements['pgto-referencia'].value;
                    const obsPagamento = formPagamento.elements['pgto-observacao'].value;

                    console.log('Confirmando pagamento para:', comissoesAPagar.map(c=>c.id), {dataPagamento, refPagamento, obsPagamento});
                    // SIMULAÇÃO: Marcar comissões como pagas
                    comissoesAPagar.forEach(comAPagar => {
                        const comissaoOriginal = comissoesDB.find(c => c.id === comAPagar.id);
                        if(comissaoOriginal) {
                            comissaoOriginal.statusPagamento = 'paga';
                            comissaoOriginal.dataPagamento = dataPagamento;
                            comissaoOriginal.refPagamento = refPagamento;
                        }
                    });
                    alert('Pagamento de comissões registrado com sucesso! (simulação)');
                    closeModal();
                    carregarDadosComissoes(); // Recarrega os dados para refletir o status atualizado
                } else {
                    formPagamento.reportValidity();
                }
            }
        }
    });
}

/**
 * Placeholder para exportar o relatório de comissões.
 */
export function exportarRelatorioComissoes() {
    if (comissoesFiltradas.length === 0) {
        alert("Não há dados de comissão para exportar com os filtros atuais.");
        return;
    }
    // Lógica para converter 'comissoesFiltradas' para CSV e disparar download
    console.log("Exportando comissões:", comissoesFiltradas);
    alert('Funcionalidade "Exportar Relatório de Comissões" a ser implementada.');
}