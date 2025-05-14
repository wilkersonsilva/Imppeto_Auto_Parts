// saidaPecasController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js'; // Para modais de confirmação ou visualização de detalhes
import { loadContent, getCurrentSection } from './contentLoader.js'; // Para recarregar a seção, se necessário

let itensSaidaAtual = [];
let proximoItemIdSaida = 1;

/**
 * Inicializa os event listeners e o estado da página de saída de peças.
 */
export function initializeSaidaPecas() {
    console.log("Inicializando Saída de Peças...");
    const formSaida = document.getElementById('form-nova-saida-pecas');
    const btnAdicionarItem = document.getElementById('btn-adicionar-item-saida');
    const selectPecaEl = document.getElementById('item-saida-peca'); // Select de peças

    if (formSaida) {
        formSaida.addEventListener('submit', submeterFormularioSaida);
    } else {
        console.error("Formulário #form-nova-saida-pecas não encontrado.");
    }

    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', adicionarItemNaTabelaSaida);
    } else {
        console.error("Botão #btn-adicionar-item-saida não encontrado.");
    }

    if (selectPecaEl) {
        selectPecaEl.addEventListener('change', atualizarEstoqueDisponivelItemSelecionado);
    } else {
        console.error("Select de peças #item-saida-peca não encontrado.");
    }
    
    // Inicializa a data da saída para hoje
    const campoDataSaida = document.getElementById('saida-data');
    if (campoDataSaida && !campoDataSaida.value) {
        campoDataSaida.valueAsDate = new Date();
    }
    
    resetarFormularioSaida(); 
    renderizarTabelaItensSaida();
    atualizarEstoqueDisponivelItemSelecionado(); // Atualiza para o item inicial (se houver)
}

/**
 * Atualiza a exibição do estoque disponível para a peça selecionada.
 */
function atualizarEstoqueDisponivelItemSelecionado() {
    const selectPecaEl = document.getElementById('item-saida-peca');
    const spanEstoqueEl = document.getElementById('item-saida-estoque-disponivel');

    if (selectPecaEl && spanEstoqueEl) {
        const selectedOption = selectPecaEl.options[selectPecaEl.selectedIndex];
        const estoqueDisponivel = selectedOption ? selectedOption.getAttribute('data-estoque') : '-';
        spanEstoqueEl.textContent = estoqueDisponivel || '-';

        // (Opcional) Atualizar o preço de venda se o motivo for "Venda"
        // const motivoSaidaEl = document.getElementById('saida-motivo');
        // if (motivoSaidaEl && motivoSaidaEl.value === 'venda') {
        //     const precoVenda = selectedOption ? selectedOption.getAttribute('data-preco-venda') : '0.00';
        //     const inputPrecoUnitarioEl = document.getElementById('item-saida-preco-unitario');
        //     if (inputPrecoUnitarioEl) inputPrecoUnitarioEl.value = precoVenda || '0.00';
        // }
    }
}


/**
 * Adiciona um item à tabela de saída de peças.
 */
function adicionarItemNaTabelaSaida() {
    const selectPecaEl = document.getElementById('item-saida-peca');
    const inputQuantidadeEl = document.getElementById('item-saida-quantidade');
    const inputPrecoUnitarioEl = document.getElementById('item-saida-preco-unitario');

    if (!selectPecaEl || !inputQuantidadeEl || !inputPrecoUnitarioEl) {
        console.error("Um ou mais campos de item de saída não foram encontrados.");
        alert("Erro ao encontrar campos do item. Verifique o console.");
        return;
    }

    const selectedOption = selectPecaEl.options[selectPecaEl.selectedIndex];
    const pecaId = selectedOption.value;
    const pecaTexto = selectedOption.text || 'Peça Desconhecida';
    const estoqueDisponivel = parseFloat(selectedOption.getAttribute('data-estoque') || 0);
    
    const quantidade = parseFloat(inputQuantidadeEl.value);
    const precoUnitario = parseFloat(inputPrecoUnitarioEl.value) || 0; // Default para 0 se não for venda

    if (!pecaId) {
        alert('Por favor, selecione uma peça.');
        selectPecaEl.focus();
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida para saída.');
        inputQuantidadeEl.focus();
        return;
    }
    if (quantidade > estoqueDisponivel) {
        alert(`Quantidade solicitada (${quantidade}) excede o estoque disponível (${estoqueDisponivel}) para esta peça.`);
        inputQuantidadeEl.focus();
        return;
    }
    // Validação de preço unitário pode depender do motivo da saída (ex: obrigatório se for venda)
    const motivoSaidaEl = document.getElementById('saida-motivo');
    if (motivoSaidaEl && motivoSaidaEl.value === 'venda' && (isNaN(precoUnitario) || precoUnitario <= 0)) {
        alert('Para Venda, por favor, insira um preço unitário válido.');
        inputPrecoUnitarioEl.focus();
        return;
    }


    const subtotal = quantidade * precoUnitario;

    const novoItem = {
        id: `temp-saida-${proximoItemIdSaida++}`,
        pecaId: pecaId,
        pecaNome: pecaTexto.split(' - ')[1] || pecaTexto,
        pecaCodigo: pecaTexto.split(' - ')[0] || '',
        quantidade: quantidade,
        precoUnitario: precoUnitario,
        subtotal: subtotal,
        estoqueAnterior: estoqueDisponivel // Guarda para referência, se necessário
    };

    itensSaidaAtual.push(novoItem);
    renderizarTabelaItensSaida();

    selectPecaEl.value = '';
    inputQuantidadeEl.value = '1';
    inputPrecoUnitarioEl.value = '';
    atualizarEstoqueDisponivelItemSelecionado(); // Reseta o span de estoque
    selectPecaEl.focus();
}

/**
 * Renderiza a tabela de itens da saída atual.
 */
function renderizarTabelaItensSaida() {
    const tbody = document.getElementById('tabela-itens-saida');
    const totalSaidaEl = document.getElementById('total-saida-pecas');

    if (!tbody || !totalSaidaEl) {
        console.error("Tabela de itens de saída ou campo de total não encontrado.");
        return;
    }
    tbody.innerHTML = ''; 

    if (itensSaidaAtual.length === 0) {
        tbody.innerHTML = `<tr id="nenhum-item-saida-placeholder"><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum item adicionado a esta saída ainda.</td></tr>`;
    } else {
        itensSaidaAtual.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div class="font-medium text-gray-800 dark:text-gray-100">${item.pecaNome}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.pecaCodigo}</div>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.quantidade}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.precoUnitario > 0 ? item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-700 dark:text-gray-200">${item.subtotal > 0 ? item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                <td class="px-3 py-2 whitespace-nowrap text-center text-sm">
                    <button onclick="removerItemSaida('${item.id}')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" title="Remover Item">
                        <i class="fas fa-trash-alt fa-fw"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    calcularTotalSaida();
}

/**
 * Remove um item da lista de saída atual.
 * @param {string} itemIdTemporario - O ID temporário do item.
 */
export function removerItemSaida(itemIdTemporario) {
    itensSaidaAtual = itensSaidaAtual.filter(item => item.id !== itemIdTemporario);
    renderizarTabelaItensSaida();
}

/**
 * Calcula e exibe o valor total da saída.
 */
function calcularTotalSaida() {
    const totalSaidaEl = document.getElementById('total-saida-pecas');
    if (!totalSaidaEl) return;

    const total = itensSaidaAtual.reduce((acc, item) => acc + item.subtotal, 0);
    totalSaidaEl.textContent = total > 0 ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
}

/**
 * Limpa o formulário de nova saída e a lista de itens.
 */
export function cancelarNovaSaida() {
    if (confirm('Tem certeza que deseja cancelar esta saída? Todos os itens adicionados serão perdidos.')) {
        resetarFormularioSaida();
        renderizarTabelaItensSaida();
    }
}

function resetarFormularioSaida() {
    const form = document.getElementById('form-nova-saida-pecas');
    if (form) form.reset();
    
    const campoDataSaida = document.getElementById('saida-data');
    if (campoDataSaida) {
        campoDataSaida.valueAsDate = new Date();
    }
    // Reseta campos de item de saída
    const selectPecaEl = document.getElementById('item-saida-peca');
    if(selectPecaEl) selectPecaEl.value = '';
    const inputQuantidadeEl = document.getElementById('item-saida-quantidade');
    if(inputQuantidadeEl) inputQuantidadeEl.value = '1';
    const inputPrecoUnitarioEl = document.getElementById('item-saida-preco-unitario');
    if(inputPrecoUnitarioEl) inputPrecoUnitarioEl.value = '';
    atualizarEstoqueDisponivelItemSelecionado();


    itensSaidaAtual = [];
    proximoItemIdSaida = 1;
}

/**
 * Lida com o submit do formulário principal de saída de peças.
 * @param {Event} event - O evento de submit.
 */
function submeterFormularioSaida(event) {
    event.preventDefault();
    const form = event.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        alert('Por favor, preencha todos os campos obrigatórios do cabeçalho da saída.');
        return;
    }
    if (itensSaidaAtual.length === 0) {
        alert('Por favor, adicione pelo menos um item à saída.');
        return;
    }

    const dadosCabecalho = {
        motivo: form.elements['saida-motivo'].value,
        referencia: form.elements['saida-referencia'].value,
        dataSaida: form.elements['saida-data'].value,
        destino: form.elements['saida-destino'].value,
        observacoes: form.elements['saida-obs'].value,
    };

    const saidaCompleta = {
        cabecalho: dadosCabecalho,
        itens: itensSaidaAtual,
        valorTotal: itensSaidaAtual.reduce((acc, item) => acc + item.subtotal, 0)
    };

    console.log('Salvando saída completa:', saidaCompleta);
    // SIMULAÇÃO DE SALVAMENTO NO BACKEND E BAIXA DE ESTOQUE
    // Em um app real: await api.salvarSaidaEstoque(saidaCompleta);
    // Para cada item em saidaCompleta.itens, você daria baixa no estoque:
    // await api.atualizarEstoquePeca(item.pecaId, -item.quantidade);
    
    alert('Saída de peças registrada com sucesso! (simulação)');
    resetarFormularioSaida();
    renderizarTabelaItensSaida();
    // Opcional: Recarregar o histórico de saídas
}

/**
 * Visualiza os detalhes de uma saída de estoque já realizada (placeholder).
 * @param {string} saidaId - O ID da saída a ser visualizada.
 */
export function visualizarDetalhesSaida(saidaId) {
    alert(`Visualizar detalhes da saída ${saidaId}. (Funcionalidade a ser implementada)`);
}