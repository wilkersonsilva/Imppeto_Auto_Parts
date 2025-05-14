// inventarioController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

// SIMULAÇÃO DE DADOS DO INVENTÁRIO (substitua por uma fonte de dados real)
let inventarioAtual = [
    { id: 'peca-P00125', codigo: 'P00125', descricao: 'Filtro de Óleo Motor Scania XT Longa Duração', marca: 'Hengst', categoria: 'Motor', localizacao: 'A1-05', estoqueAtual: 25, custoMedio: 120.50, estoqueMin: 10 },
    { id: 'peca-P00342', codigo: 'P00342', descricao: 'Jogo de Pastilhas de Freio Dianteiro Volvo FH (4 und)', marca: 'TRW', categoria: 'Freio', localizacao: 'C2-10', estoqueAtual: 3, custoMedio: 320.00, estoqueMin: 5 },
    { id: 'peca-P00789', codigo: 'P00789', descricao: 'Correia Dentada MB Actros MP4', marca: 'Contitech', categoria: 'Motor', localizacao: 'B3-01', estoqueAtual: 8, custoMedio: 85.00, estoqueMin: 8 },
    { id: 'peca-P00555', codigo: 'P00555', descricao: 'Lona de Freio Knorr para Carreta Randon', marca: 'Knorr-Bremse', categoria: 'Freio', localizacao: 'C2-12', estoqueAtual: 15, custoMedio: 210.00, estoqueMin: 6 },
    { id: 'peca-P01010', codigo: 'P01010', descricao: 'Farol Dianteiro Direito Iveco Stralis LED', marca: 'Iveco (Original)', categoria: 'Elétrica', localizacao: 'D1-07', estoqueAtual: 7, custoMedio: 750.00, estoqueMin: 3 },
];

/**
 * Inicializa a página de inventário, carrega dados e anexa event listeners.
 */
export function initializeInventario() {
    console.log("Inicializando Inventário...");
    carregarDadosInventario(); // Carrega e renderiza a tabela inicial

    const btnFiltrar = document.getElementById('btn-filtrar-inventario');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            // Aqui você adicionaria a lógica de filtro e recarregaria a tabela
            alert('Funcionalidade de filtro a ser implementada. Recarregando dados de exemplo.');
            carregarDadosInventario(); 
        });
    }
    // Listeners para outros botões principais como Iniciar Contagem e Exportar
    const btnIniciarContagem = document.querySelector('button[onclick="iniciarProcessoContagem()"]');
    if(btnIniciarContagem) btnIniciarContagem.disabled = false; // Habilita se estava desabilitado

    const btnExportar = document.querySelector('button[onclick="exportarInventario()"]');
    if(btnExportar) btnExportar.disabled = false;
}

/**
 * Carrega (simula) e renderiza os dados na tabela de inventário.
 */
function carregarDadosInventario() {
    const tbody = document.getElementById('table-body-inventario');
    const valorTotalInventarioEl = document.getElementById('valor-total-inventario');

    if (!tbody || !valorTotalInventarioEl) {
        console.error("Tabela de inventário ou campo de valor total não encontrado.");
        return;
    }

    tbody.innerHTML = ''; // Limpa a tabela
    let valorTotalGeral = 0;

    if (inventarioAtual.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-boxes fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhum item no inventário.</td></tr>`;
        valorTotalInventarioEl.textContent = (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        return;
    }

    inventarioAtual.forEach(peca => {
        const valorTotalItem = peca.estoqueAtual * peca.custoMedio;
        valorTotalGeral += valorTotalItem;

        let estoqueClasseCor = 'text-blue-600 dark:text-blue-400';
        let minEstoqueInfo = '';
        if (peca.estoqueAtual < peca.estoqueMin) {
            estoqueClasseCor = 'text-error'; // Vermelho para baixo do mínimo
            minEstoqueInfo = `<span class="text-xs text-gray-400 dark:text-gray-500 ml-1">(min. ${peca.estoqueMin})</span>`;
        } else if (peca.estoqueAtual === peca.estoqueMin) {
            estoqueClasseCor = 'text-yellow-500 dark:text-yellow-400'; // Amarelo para no mínimo
             minEstoqueInfo = `<span class="text-xs text-gray-400 dark:text-gray-500 ml-1">(min. ${peca.estoqueMin})</span>`;
        }


        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">${peca.codigo}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 max-w-sm truncate" title="${peca.descricao}">${peca.descricao}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${peca.marca}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${peca.localizacao || '-'}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center font-semibold ${estoqueClasseCor}">${peca.estoqueAtual}${minEstoqueInfo}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${peca.custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700 dark:text-gray-200">${valorTotalItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td class="px-3 py-3 whitespace-nowrap text-center text-sm font-medium space-x-1">
                <button onclick="visualizarMovimentacoesPeca('${peca.id}')" class="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 p-1" title="Histórico de Movimentações"><i class="fas fa-history fa-fw"></i></button>
                <button onclick="realizarAjusteEstoque('${peca.id}', '${peca.descricao.replace(/'/g, "\\'")}', ${peca.estoqueAtual})" class="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 p-1" title="Ajustar Estoque"><i class="fas fa-exchange-alt fa-fw"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    valorTotalInventarioEl.textContent = valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Atualiza a contagem na paginação (simulada)
    const paginacaoInfo = document.querySelector('nav[aria-label="Pagination"] p');
    if (paginacaoInfo) {
        paginacaoInfo.innerHTML = `Mostrando <span class="font-medium">1</span> a <span class="font-medium">${inventarioAtual.length}</span> de <span class="font-medium">${inventarioAtual.length}</span> resultados`;
    }
}


/**
 * Abre modal para visualizar o histórico de movimentações de uma peça (placeholder).
 * @param {string} pecaId - O ID da peça.
 */
export function visualizarMovimentacoesPeca(pecaId) {
    // SIMULAÇÃO: Buscar e exibir histórico
    const peca = inventarioAtual.find(p => p.id === pecaId);
    const nomePeca = peca ? peca.descricao : pecaId;

    let historicoHtml = `
        <p class="mb-4">Exibindo histórico para: <strong class="text-gray-800 dark:text-gray-100">${nomePeca}</strong></p>
        <ul class="max-h-80 overflow-y-auto custom-scrollbar space-y-2 text-sm">
            <li class="p-2 border rounded-md dark:border-gray-600"><strong>10/05/2025:</strong> Entrada NF 001200 (+20 unidades). Saldo: 25.</li>
            <li class="p-2 border rounded-md dark:border-gray-600"><strong>01/05/2025:</strong> Saída Pedido #10020 (-5 unidades). Saldo: 5.</li>
            <li class="p-2 border rounded-md dark:border-gray-600"><strong>15/04/2025:</strong> Ajuste Inventário (+2 unidades). Saldo: 10.</li>
        </ul>
    `; // Em um app real, este HTML seria gerado dinamicamente com dados reais.

    openModal(`Histórico de Movimentação - ${nomePeca}`, historicoHtml, {
        iconClass: 'fas fa-history text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        hideConfirmButton: true,
        cancelText: 'Fechar'
    });
}


/**
 * Abre o modal para realizar um ajuste de estoque para uma peça específica.
 * @param {string} pecaId - O ID da peça.
 * @param {string} pecaDescricao - A descrição da peça.
 * @param {number} estoqueAtualSistema - O estoque atual da peça no sistema.
 */
export function realizarAjusteEstoque(pecaId, pecaDescricao, estoqueAtualSistema) {
    const formId = 'form-ajuste-estoque-modal-content'; // ID do DIV que contém o formulário
    const actualFormId = 'actual-form-ajuste-estoque';

    // Preenche os dados da peça no formulário do modal antes de abri-lo
    // É preciso clonar o form para não alterar o template oculto diretamente.
    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de ajuste não encontrado."); return; }
    
    const originalForm = formHtmlContainer.querySelector(`#${actualFormId}`);
    if (!originalForm) { console.error("Formulário original de ajuste não encontrado."); return; }
    const formClone = originalForm.cloneNode(true);

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formClone);

    const ajustePecaIdEl = tempDiv.querySelector('#ajuste-peca-id');
    const ajustePecaDescricaoEl = tempDiv.querySelector('#ajuste-peca-descricao');
    const ajusteEstoqueAtualSistemaEl = tempDiv.querySelector('#ajuste-estoque-atual-sistema');
    const ajusteQuantidadeEl = tempDiv.querySelector('#ajuste-quantidade');
    const ajusteTipoEl = tempDiv.querySelector('#ajuste-tipo');
    const ajusteNovoEstoqueEl = tempDiv.querySelector('#ajuste-novo-estoque');
    
    if (ajustePecaIdEl) ajustePecaIdEl.value = pecaId;
    if (ajustePecaDescricaoEl) ajustePecaDescricaoEl.textContent = pecaDescricao;
    if (ajusteEstoqueAtualSistemaEl) ajusteEstoqueAtualSistemaEl.textContent = estoqueAtualSistema;
    if (ajusteNovoEstoqueEl) ajusteNovoEstoqueEl.value = estoqueAtualSistema; // Inicializa com o atual

    // Adiciona listeners para calcular novo estoque dinamicamente no modal
    function recalcularNovoEstoque() {
        if (!ajusteQuantidadeEl || !ajusteTipoEl || !ajusteNovoEstoqueEl) return;
        const quantidadeAjuste = parseInt(ajusteQuantidadeEl.value) || 0;
        const tipoAjuste = ajusteTipoEl.value;
        let novoEstoque = estoqueAtualSistema;
        if (tipoAjuste === 'entrada') {
            novoEstoque = estoqueAtualSistema + quantidadeAjuste;
        } else if (tipoAjuste === 'saida') {
            novoEstoque = estoqueAtualSistema - quantidadeAjuste;
        }
        ajusteNovoEstoqueEl.value = novoEstoque;
    }
    if (ajusteQuantidadeEl) ajusteQuantidadeEl.addEventListener('input', recalcularNovoEstoque);
    if (ajusteTipoEl) ajusteTipoEl.addEventListener('change', recalcularNovoEstoque);


    openModal('Realizar Ajuste de Estoque', tempDiv.innerHTML, {
        iconClass: 'fas fa-exchange-alt text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-lg',
        confirmText: 'Confirmar Ajuste',
        onConfirm: () => {
            // É crucial pegar o form DENTRO DO MODAL ATIVO, não o clone ou o original.
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    data.pecaId = pecaId; // Garante que o ID da peça está nos dados
                    data.estoqueAnterior = estoqueAtualSistema;
                    data.quantidadeAjuste = parseInt(data['ajuste-quantidade']);
                    data.novoEstoque = parseInt(data['ajuste-novo-estoque']);

                    console.log('Salvando ajuste de estoque:', data);
                    // SIMULAÇÃO DE SALVAMENTO E ATUALIZAÇÃO DO ESTOQUE
                    // Em um app real: await api.ajustarEstoque(data);
                    // Atualiza o estoque local (simulação)
                    const pecaIndex = inventarioAtual.findIndex(p => p.id === data.pecaId);
                    if (pecaIndex > -1) {
                        inventarioAtual[pecaIndex].estoqueAtual = data.novoEstoque;
                    }
                    
                    alert('Ajuste de estoque realizado com sucesso! (simulação)');
                    closeModal();
                    carregarDadosInventario(); // Recarrega a tabela de inventário
                } else {
                    formElement.reportValidity();
                }
            } else {
                 console.error(`Formulário ${actualFormId} não encontrado no modal ao tentar salvar ajuste.`);
            }
        }
    });
}


/**
 * Placeholder para funcionalidade de iniciar processo de contagem.
 */
export function iniciarProcessoContagem() {
    alert('Funcionalidade "Iniciar Processo de Contagem" a ser implementada.');
    // Aqui abriria um modal ou uma nova tela para configurar e executar a contagem.
}

/**
 * Placeholder para funcionalidade de exportar dados do inventário.
 */
export function exportarInventario() {
    alert('Funcionalidade "Exportar Inventário" a ser implementada (ex: para CSV/Excel).');
    // Lógica para converter `inventarioAtual` para CSV e disparar download.
}