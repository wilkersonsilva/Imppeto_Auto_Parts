// pecasController.js
// Data e Hora Atual: 16 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

/**
 * Inicializa a página de Peças.
 * Esta função é chamada pelo contentLoader quando a seção de peças é carregada.
 */
export function initializePecas() {
    console.log("Página de Gerenciamento de Peças inicializada.");
    // Futuramente, você pode adicionar aqui:
    // - Carregamento inicial da lista de peças na tabela (se não for feito sob demanda por filtros)
    // - Configuração de listeners para filtros avançados, paginação, etc.
    // - Verificação de permissões do usuário para habilitar/desabilitar botões de CRUD.
}

/**
 * Abre o modal para adicionar uma nova peça.
 */
export function openModalNovaPeca() {
    const formId = 'form-peca-modal-content';
    const actualFormId = 'actual-form-peca';

    const formHtmlContainer = document.getElementById(formId);
    if (formHtmlContainer) {
        const templateForm = formHtmlContainer.querySelector(`#${actualFormId}`);
        if (templateForm) {
            const hiddenIdField = templateForm.querySelector('#peca-id');
            if (hiddenIdField) hiddenIdField.value = '';
            // Limpar outros campos do formulário se necessário, ou garantir que o template esteja "limpo"
            // Ex: templateForm.reset(); // Se fosse o próprio form, não o container
        }
    }

    openModal('Nova Peça', formId, {
        iconClass: 'fas fa-cogs text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-4xl',
        confirmText: 'Salvar Peça',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log('Salvando nova peça:', data);
                    alert('Peça salva com sucesso! (simulação)');
                    closeModal();
                    if (getCurrentSection() === 'pecas') {
                        // Idealmente, aqui você atualizaria a tabela de peças dinamicamente
                        // ou recarregaria apenas os dados da tabela, em vez de toda a seção.
                        // Por simplicidade na simulação, recarregamos o conteúdo.
                        loadContent('pecas');
                    }
                } else {
                    formElement.reportValidity();
                }
            } else {
                console.error(`Formulário ${actualFormId} não encontrado no modal.`);
                alert('Erro: Formulário de peça não encontrado.');
            }
        }
    });
}

/**
 * Exibe os detalhes de uma peça em um modal.
 * @param {string} pecaId - O ID da peça a ser visualizada (simulado).
 */
export function visualizarPeca(pecaId) {
    console.log(`Visualizar Peça com ID: ${pecaId}`);
    let dadosPeca = {};
    // SIMULAÇÃO: Dados de exemplo
    if (pecaId === 'peca-P00125') {
        dadosPeca = {
            codigo: 'P00125', codigofab: 'MANN-W950/4', descricao: 'Filtro de Óleo Motor Scania XT Longa Duração para Modelos P, G, R (2012-2018)', marca: 'Hengst', ean: '7890001234567', categoria: 'Motor', unidade: 'UN', ncm: '8421.23.00', aplicacao: 'Scania S5, Modelos P, G, R (2012-2018)', precoCusto: '120.50', precoVenda: '185.90', estoqueAtual: '25', estoqueMin: '10', localizacao: 'Corredor B, Prateleira 2, Caixa 05', fornecedor: 'Fornecedor A (Simulado)', obs: 'Peça de alta performance, recomendada troca a cada 20.000km.'
        };
    } else if (pecaId === 'peca-P00342') {
         dadosPeca = {
            codigo: 'P00342', codigofab: 'TRW-GDB123X', descricao: 'Jogo de Pastilhas de Freio Dianteiro Volvo FH (4 und)', marca: 'TRW', ean: '7890007654321', categoria: 'Freio', unidade: 'JG', ncm: '8708.30.19', aplicacao: 'Volvo FH (todos os modelos 2015-2022)', precoCusto: '320.00', precoVenda: '450.00', estoqueAtual: '3', estoqueMin: '5', localizacao: 'Corredor C, Prateleira 1, Caixa 02', fornecedor: 'Fornecedor B (Simulado)', obs: 'Alta durabilidade.'
        };
    } else {
        openModal('Erro', '<p>Dados da peça não encontrados.</p>', {iconClass: 'fas fa-exclamation-circle text-error'});
        return;
    }

    let htmlConteudoVisualizacao = `<div class="space-y-1.5 text-sm p-1">`;
    for (const [key, value] of Object.entries(dadosPeca)) {
        let label = key.replace('peca-', '').replace(/([A-Z0-9])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        if (label.toLowerCase() === 'ncm' || label.toLowerCase() === 'ean' || label.toUpperCase() === 'ID') {
            label = label.toUpperCase();
        }
        htmlConteudoVisualizacao += `<div class="flex border-b border-gray-100 dark:border-gray-700 py-1.5"><strong class="w-2/5 text-gray-500 dark:text-gray-400 min-w-[120px]">${label}:</strong> <span class="w-3/5 text-gray-800 dark:text-gray-200 break-words">${value || 'Não informado'}</span></div>`;
    }
    htmlConteudoVisualizacao += `</div>`;

    openModal(`Detalhes da Peça - ${dadosPeca.codigo}`, htmlConteudoVisualizacao, {
        iconClass: 'fas fa-search-plus text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        hideConfirmButton: true,
        cancelText: 'Fechar'
    });
}

/**
 * Abre o modal para editar uma peça existente, pré-preenchendo o formulário.
 * @param {string} pecaId - O ID da peça a ser editada (simulado).
 */
export function editarPeca(pecaId) {
    console.log(`Editar Peça com ID: ${pecaId}`);
    const formContainerId = 'form-peca-modal-content';
    const actualFormId = 'actual-form-peca';

    let dadosPecaParaEdicao = {};
    // SIMULAÇÃO: Dados de exemplo
    if (pecaId === 'peca-P00125') {
        dadosPecaParaEdicao = {
            'peca-id': pecaId, 'peca-codigo': 'P00125', 'peca-codigofab': 'MANN-W950/4', 'peca-descricao': 'Filtro de Óleo Motor Scania XT Longa Duração para Modelos P, G, R (2012-2018)', 'peca-marca': 'Hengst', 'peca-ean': '7890001234567', 'peca-categoria': 'motor', 'peca-unidade': 'UN', 'peca-ncm': '8421.23.00', 'peca-aplicacao': 'Scania S5, Modelos P, G, R (2012-2018)', 'peca-preco-custo': '120.50', 'peca-preco-venda': '185.90', 'peca-estoque-atual': '25', 'peca-estoque-min': '10', 'peca-localizacao': 'Corredor B, Prateleira 2, Caixa 05', 'peca-fornecedor': 'fornecedor-a', 'peca-obs': 'Peça de alta performance, recomendada troca a cada 20.000km.'
        };
    } else if (pecaId === 'peca-P00342') {
        dadosPecaParaEdicao = {
            'peca-id': pecaId, 'peca-codigo': 'P00342', 'peca-codigofab': 'TRW-GDB123X', 'peca-descricao': 'Jogo de Pastilhas de Freio Dianteiro Volvo FH (4 und)', 'peca-marca': 'TRW', 'peca-ean': '7890007654321', 'peca-categoria': 'freio', 'peca-unidade': 'JG', 'peca-ncm': '8708.30.19', 'peca-aplicacao': 'Volvo FH (todos os modelos 2015-2022)', 'peca-preco-custo': '320.00', 'peca-preco-venda': '450.00', 'peca-estoque-atual': '3', 'peca-estoque-min': '5', 'peca-localizacao': 'Corredor C, Prateleira 1, Caixa 02', 'peca-fornecedor': 'fornecedor-b', 'peca-obs': 'Alta durabilidade.'
        };
    } else {
        alert('Dados da peça não encontrados para edição.');
        return;
    }

    const formHtmlContainer = document.getElementById(formContainerId);
    if (!formHtmlContainer) { console.error(`Container do formulário '${formContainerId}' não encontrado.`); return; }

    const originalForm = formHtmlContainer.querySelector(`#${actualFormId}`);
    if(!originalForm) { console.error(`Formulário original #${actualFormId} não encontrado.`); return; }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalForm.outerHTML; // Clona o formulário em si
    const formClone = tempDiv.firstElementChild;

    for (const key in dadosPecaParaEdicao) {
        const field = formClone.elements[key]; // Usa a coleção 'elements' do formulário
        if (field) {
            field.value = dadosPecaParaEdicao[key];
        }
    }
    if (formClone.elements['peca-id']) formClone.elements['peca-id'].value = pecaId;


    openModal(`Editar Peça - ${dadosPecaParaEdicao['peca-codigo'] || pecaId}`, formClone.outerHTML, {
        iconClass: 'fas fa-edit text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-4xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log(`Salvando alterações para Peça ID: ${data['peca-id'] || pecaId}`, data);
                    alert('Alterações da peça salvas com sucesso! (simulação)');
                    closeModal();
                    if (getCurrentSection() === 'pecas') {
                        loadContent('pecas');
                    }
                } else {
                    formElement.reportValidity();
                }
            } else {
                console.error(`Formulário ${actualFormId} não encontrado no modal ao tentar salvar.`);
            }
        }
    });
}

/**
 * Exibe um modal de confirmação para excluir uma peça.
 * @param {string} pecaId - O ID da peça a ser excluída (simulado).
 */
export function excluirPeca(pecaId) {
    let nomePecaParaExibicao = `ID ${pecaId}`;
    if (pecaId === 'peca-P00125') nomePecaParaExibicao = 'Filtro de Óleo P00125';
    else if (pecaId === 'peca-P00342') nomePecaParaExibicao = 'Pastilhas de Freio P00342';

    openModal(
        'Confirmar Exclusão de Peça',
        `<p class="text-sm text-gray-600 dark:text-gray-300">Tem certeza que deseja excluir a peça <strong class="font-medium">${nomePecaParaExibicao}</strong>?<br>Esta ação não poderá ser desfeita.</p>`,
        {
            iconClass: 'fas fa-exclamation-triangle text-error',
            modalSize: 'sm:max-w-md',
            confirmText: 'Excluir Peça',
            cancelText: 'Cancelar',
            onConfirm: () => {
                console.log(`Excluindo Peça com ID: ${pecaId}`);
                alert(`Peça ${nomePecaParaExibicao} excluída com sucesso! (simulação)`);
                closeModal();
                if (getCurrentSection() === 'pecas') {
                    loadContent('pecas');
                }
            }
        }
    );
}