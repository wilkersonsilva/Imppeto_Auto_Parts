// entradaPecasController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

// Array para armazenar os itens da entrada atual (simulação de estado)
let itensEntradaAtual = [];
let proximoItemId = 1; // Para gerar IDs únicos para os itens na tabela

/**
 * Inicializa os event listeners e o estado da página de entrada de peças.
 */
export function initializeEntradaPecas() {
    console.log("Inicializando Entrada de Peças...");
    const formEntrada = document.getElementById('form-nova-entrada-pecas');
    const btnAdicionarItem = document.getElementById('btn-adicionar-item-entrada');
    
    if (formEntrada) {
        formEntrada.addEventListener('submit', submeterFormularioEntrada);
    } else {
        console.error("Formulário #form-nova-entrada-pecas não encontrado.");
    }

    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', adicionarItemNaTabelaEntrada);
    } else {
        console.error("Botão #btn-adicionar-item-entrada não encontrado.");
    }

    // Inicializa a data da entrada para hoje
    const campoDataEntrada = document.getElementById('entrada-data');
    if (campoDataEntrada && !campoDataEntrada.value) {
        campoDataEntrada.valueAsDate = new Date();
    }
    
    // Limpa a tabela e reseta o estado ao carregar a página
    resetarFormularioEntrada(); 
    renderizarTabelaItensEntrada(); 
}

/**
 * Adiciona um item à tabela de entrada de peças.
 */
function adicionarItemNaTabelaEntrada() {
    const selectPecaEl = document.getElementById('item-peca');
    const inputQuantidadeEl = document.getElementById('item-quantidade');
    const inputCustoUnitarioEl = document.getElementById('item-custo-unitario');
    const inputLocalizacaoEl = document.getElementById('item-localizacao');

    if (!selectPecaEl || !inputQuantidadeEl || !inputCustoUnitarioEl || !inputLocalizacaoEl) {
        console.error("Um ou mais campos de item não foram encontrados.");
        alert("Erro ao encontrar campos do item. Verifique o console.");
        return;
    }

    const pecaId = selectPecaEl.value;
    const pecaTexto = selectPecaEl.options[selectPecaEl.selectedIndex]?.text || 'Peça Desconhecida';
    const quantidade = parseFloat(inputQuantidadeEl.value);
    const custoUnitario = parseFloat(inputCustoUnitarioEl.value);
    const localizacao = inputLocalizacaoEl.value.trim();

    if (!pecaId) {
        alert('Por favor, selecione uma peça.');
        selectPecaEl.focus();
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida.');
        inputQuantidadeEl.focus();
        return;
    }
    if (isNaN(custoUnitario) || custoUnitario < 0) {
        alert('Por favor, insira um custo unitário válido.');
        inputCustoUnitarioEl.focus();
        return;
    }

    const subtotal = quantidade * custoUnitario;

    const novoItem = {
        id: `temp-${proximoItemId++}`, // ID temporário para manipulação na tabela
        pecaId: pecaId,
        pecaNome: pecaTexto.split(' - ')[1] || pecaTexto, // Tenta pegar só o nome
        pecaCodigo: pecaTexto.split(' - ')[0] || '',    // Tenta pegar só o código
        quantidade: quantidade,
        custoUnitario: custoUnitario,
        subtotal: subtotal,
        localizacao: localizacao || '-'
    };

    itensEntradaAtual.push(novoItem);
    renderizarTabelaItensEntrada();

    // Limpar campos de adicionar item para a próxima adição
    selectPecaEl.value = '';
    inputQuantidadeEl.value = '1';
    inputCustoUnitarioEl.value = '';
    inputLocalizacaoEl.value = '';
    selectPecaEl.focus();
}

/**
 * Renderiza a tabela de itens da entrada atual.
 */
function renderizarTabelaItensEntrada() {
    const tbody = document.getElementById('tabela-itens-entrada');
    const placeholderRow = document.getElementById('nenhum-item-entrada-placeholder');
    const totalEntradaEl = document.getElementById('total-entrada-pecas');

    if (!tbody || !totalEntradaEl) {
        console.error("Tabela de itens ou campo de total não encontrado.");
        return;
    }

    tbody.innerHTML = ''; // Limpa a tabela, exceto se for o placeholder

    if (itensEntradaAtual.length === 0) {
        if (placeholderRow) { // Recria o placeholder se não houver itens
             tbody.innerHTML = `<tr id="nenhum-item-entrada-placeholder"><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum item adicionado a esta entrada ainda.</td></tr>`;
        }
    } else {
        itensEntradaAtual.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div class="font-medium text-gray-800 dark:text-gray-100">${item.pecaNome}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.pecaCodigo}</div>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.quantidade}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.custoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-700 dark:text-gray-200">${item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.localizacao}</td>
                <td class="px-3 py-2 whitespace-nowrap text-center text-sm">
                    <button onclick="removerItemEntrada('${item.id}')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" title="Remover Item">
                        <i class="fas fa-trash-alt fa-fw"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    calcularTotalEntrada();
}

/**
 * Remove um item da lista de entrada atual.
 * Esta função precisa ser exposta globalmente se chamada por onclick.
 * @param {string} itemIdTemporario - O ID temporário do item a ser removido.
 */
export function removerItemEntrada(itemIdTemporario) {
    itensEntradaAtual = itensEntradaAtual.filter(item => item.id !== itemIdTemporario);
    renderizarTabelaItensEntrada();
}

/**
 * Calcula e exibe o valor total da entrada.
 */
function calcularTotalEntrada() {
    const totalEntradaEl = document.getElementById('total-entrada-pecas');
    if (!totalEntradaEl) return;

    const total = itensEntradaAtual.reduce((acc, item) => acc + item.subtotal, 0);
    totalEntradaEl.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Limpa o formulário de nova entrada e a lista de itens.
 */
export function cancelarNovaEntrada() {
    if (confirm('Tem certeza que deseja cancelar esta entrada? Todos os itens adicionados serão perdidos.')) {
        resetarFormularioEntrada();
        renderizarTabelaItensEntrada(); // Para limpar a tabela visualmente
    }
}

function resetarFormularioEntrada() {
    const form = document.getElementById('form-nova-entrada-pecas');
    if (form) form.reset();
    
    const campoDataEntrada = document.getElementById('entrada-data');
    if (campoDataEntrada) {
        campoDataEntrada.valueAsDate = new Date(); // Define para data atual
    }

    itensEntradaAtual = [];
    proximoItemId = 1; 
    // A tabela será limpa por renderizarTabelaItensEntrada
}


/**
 * Lida com o submit do formulário principal de entrada de peças.
 * @param {Event} event - O evento de submit.
 */
function submeterFormularioEntrada(event) {
    event.preventDefault(); // Previne o submit padrão do formulário
    const form = event.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        alert('Por favor, preencha todos os campos obrigatórios do cabeçalho da entrada.');
        return;
    }

    if (itensEntradaAtual.length === 0) {
        alert('Por favor, adicione pelo menos um item à entrada.');
        return;
    }

    const dadosCabecalho = {
        fornecedor: form.elements['entrada-fornecedor'].value,
        notaFiscal: form.elements['entrada-nf'].value,
        dataEntrada: form.elements['entrada-data'].value,
        observacoes: form.elements['entrada-obs'].value,
    };

    const entradaCompleta = {
        cabecalho: dadosCabecalho,
        itens: itensEntradaAtual, // Contém os objetos completos dos itens
        valorTotal: itensEntradaAtual.reduce((acc, item) => acc + item.subtotal, 0)
    };

    console.log('Salvando entrada completa:', entradaCompleta);
    // SIMULAÇÃO DE SALVAMENTO NO BACKEND
    // Em um app real: await api.salvarEntradaEstoque(entradaCompleta);
    // Após salvar, você atualizaria o estoque de cada peça no sistema.
    
    alert('Entrada de peças registrada com sucesso! (simulação)');
    resetarFormularioEntrada();
    renderizarTabelaItensEntrada(); // Limpa a tabela de itens
    // Opcional: Recarregar o histórico de entradas ou adicionar a nova entrada à lista
    // carregarHistoricoEntradas(); 
}

/**
 * Visualiza os detalhes de uma entrada de estoque já realizada (placeholder).
 * @param {string} entradaId - O ID da entrada a ser visualizada.
 */
export function visualizarDetalhesEntrada(entradaId) {
    alert(`Visualizar detalhes da entrada ${entradaId}. (Funcionalidade a ser implementada)`);
    // Aqui você buscaria os dados da entrada e seus itens e os exibiria em um modal.
}

// (Outras funções como carregar selects de fornecedores/peças podem ser adicionadas aqui)