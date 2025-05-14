// garantiaValidadeController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js'; // Para recarregar a seção, se necessário

// SIMULAÇÃO DE DADOS (substitua por uma fonte de dados real)
let pecasComValidade = [
    { id: 'itemVal-001', pecaId: 'P00887', codigoPeca: 'P00887', descricao: 'Aditivo Radiador Concentrado Rosa', lote: 'LT202501A', estoqueLote: 15, dataValidade: '2025-06-30', status: 'proximo_vencimento' },
    { id: 'itemVal-002', pecaId: 'P00886', codigoPeca: 'P00886', descricao: 'Graxa Especial Alta Temperatura', lote: 'GRX202412B', estoqueLote: 5, dataValidade: '2025-04-30', status: 'vencido' },
    { id: 'itemVal-003', pecaId: 'P00990', codigoPeca: 'P00990', descricao: 'Fluido de Freio DOT 4', lote: 'FL202603C', estoqueLote: 30, dataValidade: '2026-03-15', status: 'ok' },
];

let pecasVendidasEmGarantia = [
    { id: 'garVenda-001', nfPedidoVenda: 'NF 00567 / Ped #10025', cliente: 'Auto Peças ABC', pecaId: 'P00125', descricaoPeca: 'Filtro de Óleo Scania XT', dataVenda: '2025-05-09', fimGarantia: '2025-08-09', status: 'em_garantia' },
    { id: 'garVenda-002', nfPedidoVenda: 'NF 00580 / Ped #10030', cliente: 'Mecânica Central', pecaId: 'P01010', descricaoPeca: 'Farol Dianteiro Iveco Stralis', dataVenda: '2025-02-15', fimGarantia: '2025-05-15', status: 'expirada' },
];


/**
 * Inicializa a página de Garantia e Validade, carrega dados e anexa event listeners.
 */
export function initializeGarantiaValidade() {
    console.log("Inicializando Controle de Garantia e Validade...");
    initializeTabs(); // Certifique-se que initializeTabs está sendo importado e chamado corretamente (geralmente de uiUtils.js)
    
    carregarDadosValidadeEstoque();
    carregarDadosGarantiaVenda();

    // Adicionar listeners para os botões de filtro, se necessário
    const filtroValidadeBtn = document.querySelector('#controle-validade-content button'); // Exemplo
    if (filtroValidadeBtn) {
        filtroValidadeBtn.addEventListener('click', () => {
            alert('Filtragem de validade a ser implementada.');
            // Lógica de filtro e recarregamento de carregarDadosValidadeEstoque()
        });
    }

    const filtroGarantiaBtn = document.querySelector('#controle-garantia-venda-content button'); // Exemplo
    if (filtroGarantiaBtn) {
        filtroGarantiaBtn.addEventListener('click', () => {
            alert('Filtragem de garantia a ser implementada.');
            // Lógica de filtro e recarregamento de carregarDadosGarantiaVenda()
        });
    }
}

/**
 * Carrega e renderiza os dados na tabela de Validade de Peças em Estoque.
 */
function carregarDadosValidadeEstoque() {
    const tbody = document.getElementById('table-body-validade');
    if (!tbody) {
        console.error("Tabela #table-body-validade não encontrada.");
        return;
    }
    tbody.innerHTML = ''; // Limpa a tabela

    if (pecasComValidade.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-calendar-times fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhum item com controle de validade encontrado.</td></tr>`;
        return;
    }

    const hoje = new Date();
    hoje.setHours(0,0,0,0); // Zera a hora para comparar apenas datas

    pecasComValidade.forEach(item => {
        const dataVal = new Date(item.dataValidade + "T00:00:00"); // Assegura que é interpretada como local
        let statusTexto = 'OK';
        let statusClasse = 'bg-green-100 dark:bg-green-500/30 text-green-800 dark:text-green-200';
        let dataClasse = 'text-gray-500 dark:text-gray-400';

        const diffTime = dataVal - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            statusTexto = 'Vencido';
            statusClasse = 'bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-200';
            dataClasse = 'text-error font-semibold';
        } else if (diffDays <= 30) { // Exemplo: 30 dias para "Próximo Venc."
            statusTexto = 'Próximo Venc.';
            statusClasse = 'bg-yellow-100 dark:bg-yellow-500/30 text-yellow-800 dark:text-yellow-200';
            dataClasse = 'text-yellow-600 dark:text-yellow-400 font-semibold';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.codigoPeca}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${item.descricao}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.lote}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.estoqueLote}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center ${dataClasse}">${new Date(item.dataValidade + "T00:00:00").toLocaleDateString('pt-BR')}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasse}">${statusTexto}</span>
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-center text-sm font-medium">
                <button onclick="ajustarEstoquePorValidade('${item.pecaId}', '${item.lote}', ${item.estoqueLote})" class="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-300 p-1" title="Dar Baixa por Vencimento/Ajuste"><i class="fas fa-minus-circle fa-fw"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


/**
 * Carrega e renderiza os dados na tabela de Garantia de Peças Vendidas.
 */
function carregarDadosGarantiaVenda() {
    const tbody = document.getElementById('table-body-garantia-venda');
    if (!tbody) {
        console.error("Tabela #table-body-garantia-venda não encontrada.");
        return;
    }
    tbody.innerHTML = '';

    if (pecasVendidasEmGarantia.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-shield-slash fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhuma peça vendida com garantia encontrada.</td></tr>`;
        return;
    }
    
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    pecasVendidasEmGarantia.forEach(item => {
        const dataFimGarantia = new Date(item.fimGarantia + "T00:00:00");
        let statusTexto = item.status === 'acionada' ? 'Acionada' : (dataFimGarantia < hoje ? 'Expirada' : 'Em Garantia');
        let statusClasse = 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'; // Default
        let dataClasse = 'text-gray-500 dark:text-gray-400';

        if (item.status === 'acionada') {
            statusClasse = 'bg-orange-100 dark:bg-orange-500/30 text-orange-800 dark:text-orange-200';
            dataClasse = 'text-orange-600 dark:text-orange-400 font-semibold';
        } else if (dataFimGarantia < hoje) {
            statusClasse = 'bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-200';
            dataClasse = 'text-error';
        } else { // Em Garantia
            statusClasse = 'bg-green-100 dark:bg-green-500/30 text-green-800 dark:text-green-200';
            dataClasse = 'text-green-600 dark:text-green-400 font-semibold';
        }


        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.nfPedidoVenda}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${item.cliente}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300" title="${item.pecaId} - ${item.descricaoPeca}">${item.pecaId} - ${item.descricaoPeca.substring(0,20)}...</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${new Date(item.dataVenda + "T00:00:00").toLocaleDateString('pt-BR')}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center ${dataClasse}">${new Date(item.fimGarantia + "T00:00:00").toLocaleDateString('pt-BR')}</td>
            <td class="px-3 py-3 whitespace-nowrap text-sm text-center">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasse}">${statusTexto}</span>
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-center text-sm font-medium">
                ${item.status !== 'acionada' && dataFimGarantia >= hoje ? 
                `<button onclick="registrarAcionamentoGarantia('${item.id}', '${item.pecaId}')" class="text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 p-1" title="Registrar Acionamento de Garantia"><i class="fas fa-shield-alt fa-fw"></i></button>` : 
                `<button class="text-gray-300 dark:text-gray-600 p-1 cursor-not-allowed" title="Garantia ${item.status === 'acionada' ? 'já acionada' : 'expirada'}" disabled><i class="fas fa-shield-alt fa-fw"></i></button>`
                }
                 <button onclick="visualizarDetalhesGarantia('${item.id}')" class="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 p-1" title="Ver Detalhes"><i class="fas fa-eye fa-fw"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Abre modal para registrar o acionamento de uma garantia.
 * @param {string} vendaGarantiaId - O ID do registro de venda em garantia.
 * @param {string} pecaId - O ID da peça.
 */
export function registrarAcionamentoGarantia(vendaGarantiaId, pecaId) {
    const formId = 'form-acionar-garantia-modal-content';
    const actualFormId = 'actual-form-acionar-garantia';

    // SIMULAÇÃO: Buscar dados da venda/peça para pré-preencher
    const itemGarantia = pecasVendidasEmGarantia.find(item => item.id === vendaGarantiaId && item.pecaId === pecaId);
    if (!itemGarantia) {
        alert('Registro de garantia não encontrado.');
        return;
    }

    // Clona o formulário e preenche as informações fixas
    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de acionar garantia não encontrado."); return; }
    
    const originalForm = formHtmlContainer.querySelector(`#${actualFormId}`);
    if (!originalForm) { console.error("Formulário original de acionar garantia não encontrado."); return; }
    const formClone = originalForm.cloneNode(true);
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formClone);

    const infoVendaEl = tempDiv.querySelector('#garantia-info-venda');
    const infoPecaEl = tempDiv.querySelector('#garantia-info-peca');
    const dataAcionamentoEl = tempDiv.querySelector('#garantia-data-acionamento');
    const garantiaVendaIdField = tempDiv.querySelector('#garantia-venda-id');
    const garantiaPecaIdField = tempDiv.querySelector('#garantia-peca-id');


    if (infoVendaEl) infoVendaEl.textContent = `Ref. Venda: ${itemGarantia.nfPedidoVenda} - Cliente: ${itemGarantia.cliente}`;
    if (infoPecaEl) infoPecaEl.textContent = `Peça: ${itemGarantia.descricaoPeca} (Cód: ${itemGarantia.pecaId})`;
    if (dataAcionamentoEl) dataAcionamentoEl.valueAsDate = new Date(); // Data atual
    if (garantiaVendaIdField) garantiaVendaIdField.value = vendaGarantiaId;
    if (garantiaPecaIdField) garantiaPecaIdField.value = pecaId;


    openModal(`Registrar Acionamento de Garantia`, tempDiv.innerHTML, {
        iconClass: 'fas fa-shield-alt text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        confirmText: 'Registrar Acionamento',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log('Registrando acionamento de garantia:', data);
                    
                    // SIMULAÇÃO DE REGISTRO
                    // Em um app real: await api.registrarAcionamentoGarantia(data);
                    // Atualizar o status do item na lista pecasVendidasEmGarantia
                    const itemIndex = pecasVendidasEmGarantia.findIndex(item => item.id === data['garantia-venda-id']);
                    if(itemIndex > -1) {
                        pecasVendidasEmGarantia[itemIndex].status = 'acionada'; // Atualiza status localmente
                    }

                    alert('Acionamento de garantia registrado com sucesso! (simulação)');
                    closeModal();
                    carregarDadosGarantiaVenda(); // Recarrega a tabela de garantias
                } else {
                    formElement.reportValidity();
                }
            }
        }
    });
}

/**
 * Placeholder para dar baixa em estoque por validade (pode reutilizar/adaptar ajuste de estoque).
 * @param {string} pecaId O ID da peça.
 * @param {string} lote O lote da peça.
 * @param {number} estoqueLote O estoque atual do lote.
 */
export function ajustarEstoquePorValidade(pecaId, lote, estoqueLote) {
    // Esta função pode abrir um modal de ajuste de estoque específico
    // pré-preenchendo o tipo de ajuste como "Saída" e o motivo como "Vencimento de Lote"
    // ou "Descarte por Validade".
    // Para simplificar, podemos chamar a função realizarAjusteEstoque do inventarioController,
    // mas ela precisaria ser importada e o inventarioController precisaria ser modificado
    // para aceitar um motivo pré-definido ou um contexto.

    // Por enquanto, uma simulação simples:
    const peca = pecasComValidade.find(p => p.pecaId === pecaId && p.lote === lote);
    if (!peca) {
        alert('Peça/Lote não encontrado para ajuste.');
        return;
    }

    openModal(
        `Confirmar Baixa por Validade - Lote ${lote}`,
        `<p class="text-sm">Deseja dar baixa de <strong class="font-semibold">${estoqueLote}</strong> unidade(s) da peça <strong class="font-semibold">${peca.descricao}</strong> (Lote: ${lote}) devido ao vencimento?</p>
         <p class="text-xs text-gray-500 mt-2">Esta ação irá zerar o estoque deste lote e registrar uma saída por ajuste.</p>`,
        {
            iconClass: 'fas fa-calendar-times text-error',
            confirmText: 'Confirmar Baixa',
            onConfirm: () => {
                console.log(`Baixando ${estoqueLote} de ${pecaId} (Lote: ${lote}) por validade.`);
                // SIMULAÇÃO: Atualizar estoque e registrar ajuste
                // Em um app real:
                // 1. Chamar API para registrar ajuste de saída (motivo: VENCIMENTO)
                // 2. Atualizar estoque da peça (se o controle de lote for granular no estoque principal)
                
                // Simulação local: remove o item da lista de controle de validade ou zera o estoque do lote
                peca.estoqueLote = 0;
                peca.status = 'baixado_vencido'; // Novo status simulado

                alert(`Baixa do lote ${lote} da peça ${peca.codigoPeca} realizada com sucesso! (simulação)`);
                closeModal();
                carregarDadosValidadeEstoque(); // Recarrega a tabela
            }
        }
    );
}

/**
 * Placeholder para visualizar detalhes de uma garantia (pode ser um modal).
 * @param {string} vendaGarantiaId O ID do registro de venda em garantia.
 */
export function visualizarDetalhesGarantia(vendaGarantiaId) {
    const itemGarantia = pecasVendidasEmGarantia.find(item => item.id === vendaGarantiaId);
    if (!itemGarantia) {
        alert('Detalhes da garantia não encontrados.');
        return;
    }
    // Similar à visualizarCliente, construir HTML com os detalhes de itemGarantia e
    // informações sobre o acionamento se houver.
    alert(`Visualizar Detalhes da Garantia: ${itemGarantia.nfPedidoVenda} para peça ${itemGarantia.descricaoPeca} (implementar)`);
}