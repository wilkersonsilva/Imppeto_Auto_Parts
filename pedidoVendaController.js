// pedidoVendaController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js'; // Para recarregar a seção, se necessário

let itensPedidoAtual = [];
let proximoItemIdPedido = 1;

/**
 * Inicializa a página de Pedido de Venda.
 */
export function initializePedidoVenda() {
    console.log("Inicializando Pedido de Venda...");
    const formPedido = document.getElementById('form-novo-pedido-venda');
    const btnAdicionarItem = document.getElementById('btn-adicionar-item-pedido');
    const selectPecaEl = document.getElementById('item-pedido-peca');
    const campoValorFreteEl = document.getElementById('pedido-valor-frete');

    if (formPedido) {
        formPedido.addEventListener('submit', (event) => submeterPedidoVenda(event, 'pedido'));
    } else {
        console.error("Formulário #form-novo-pedido-venda não encontrado.");
    }

    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', adicionarItemAoPedido);
    } else {
        console.error("Botão #btn-adicionar-item-pedido não encontrado.");
    }

    if (selectPecaEl) {
        selectPecaEl.addEventListener('change', atualizarInfoPecaSelecionadaPedido);
    } else {
        console.error("Select de peças #item-pedido-peca não encontrado.");
    }
    
    if(campoValorFreteEl) {
        campoValorFreteEl.addEventListener('input', calcularTotaisPedido);
    }

    // Inicializa a data do pedido para hoje
    const campoDataPedido = document.getElementById('pedido-data');
    if (campoDataPedido && !campoDataPedido.value) {
        campoDataPedido.valueAsDate = new Date();
    }
    
    resetarFormularioPedidoVenda();
    renderizarTabelaItensPedido();
    atualizarInfoPecaSelecionadaPedido(); // Para o estado inicial do select de peças
}

/**
 * Atualiza as informações (estoque, preço) da peça selecionada no formulário de item.
 */
function atualizarInfoPecaSelecionadaPedido() {
    const selectPecaEl = document.getElementById('item-pedido-peca');
    const spanEstoqueEl = document.getElementById('item-pedido-estoque-disponivel');
    const inputPrecoUnitarioEl = document.getElementById('item-pedido-preco-unitario');

    if (selectPecaEl && spanEstoqueEl && inputPrecoUnitarioEl) {
        const selectedOption = selectPecaEl.options[selectPecaEl.selectedIndex];
        const estoqueDisponivel = selectedOption ? selectedOption.getAttribute('data-estoque') : '-';
        const precoVenda = selectedOption ? selectedOption.getAttribute('data-preco') : '0.00';
        
        spanEstoqueEl.textContent = estoqueDisponivel || '-';
        if (selectPecaEl.value) { // Apenas atualiza o preço se uma peça real for selecionada
            inputPrecoUnitarioEl.value = parseFloat(precoVenda || 0).toFixed(2);
        } else {
            inputPrecoUnitarioEl.value = ''; // Limpa se "Selecione..." estiver escolhido
        }
    }
}

/**
 * Adiciona um item à tabela do pedido de venda.
 */
function adicionarItemAoPedido() {
    const selectPecaEl = document.getElementById('item-pedido-peca');
    const inputQuantidadeEl = document.getElementById('item-pedido-quantidade');
    const inputPrecoUnitarioEl = document.getElementById('item-pedido-preco-unitario');
    const inputDescontoEl = document.getElementById('item-pedido-desconto');

    if (!selectPecaEl || !inputQuantidadeEl || !inputPrecoUnitarioEl || !inputDescontoEl) {
        alert("Erro: Campos de item do pedido não encontrados."); return;
    }

    const selectedOption = selectPecaEl.options[selectPecaEl.selectedIndex];
    const pecaId = selectedOption.value;
    const pecaTexto = selectedOption.text || 'Peça Desconhecida';
    const estoqueDisponivel = parseFloat(selectedOption.getAttribute('data-estoque') || 0);
    
    const quantidade = parseFloat(inputQuantidadeEl.value);
    const precoUnitario = parseFloat(inputPrecoUnitarioEl.value);
    const percentualDesconto = parseFloat(inputDescontoEl.value) || 0;

    if (!pecaId) {
        alert('Por favor, selecione uma peça.'); selectPecaEl.focus(); return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida.'); inputQuantidadeEl.focus(); return;
    }
    if (quantidade > estoqueDisponivel) {
        // Permitir venda sem estoque ou não? Por enquanto, vamos alertar mas permitir.
        // Em um sistema real, isso seria uma regra de negócio.
        if (!confirm(`Atenção: Quantidade solicitada (${quantidade}) excede o estoque disponível (${estoqueDisponivel}). Deseja continuar?`)) {
            inputQuantidadeEl.focus();
            return;
        }
    }
    if (isNaN(precoUnitario) || precoUnitario < 0) { // Preço pode ser zero para bonificação, mas não negativo
        alert('Por favor, insira um preço unitário válido.'); inputPrecoUnitarioEl.focus(); return;
    }
    if (isNaN(percentualDesconto) || percentualDesconto < 0 || percentualDesconto > 100) {
        alert('Por favor, insira um percentual de desconto válido (0-100).'); inputDescontoEl.focus(); return;
    }

    const valorDesconto = (precoUnitario * quantidade) * (percentualDesconto / 100);
    const subtotalComDesconto = (precoUnitario * quantidade) - valorDesconto;

    const novoItem = {
        id: `temp-pedido-${proximoItemIdPedido++}`,
        pecaId: pecaId,
        pecaNome: pecaTexto.split(' - ')[1] || pecaTexto,
        pecaCodigo: pecaTexto.split(' - ')[0] || '',
        quantidade: quantidade,
        precoUnitario: precoUnitario,
        percentualDesconto: percentualDesconto,
        valorDesconto: valorDesconto,
        subtotal: subtotalComDesconto
    };

    itensPedidoAtual.push(novoItem);
    renderizarTabelaItensPedido();

    // Limpar campos de item
    selectPecaEl.value = '';
    inputQuantidadeEl.value = '1';
    inputPrecoUnitarioEl.value = '';
    inputDescontoEl.value = '0';
    atualizarInfoPecaSelecionadaPedido();
    selectPecaEl.focus();
}

/**
 * Renderiza a tabela de itens do pedido atual.
 */
function renderizarTabelaItensPedido() {
    const tbody = document.getElementById('tabela-itens-pedido');
    if (!tbody) { console.error("Tabela #tabela-itens-pedido não encontrada."); return; }
    tbody.innerHTML = '';

    if (itensPedidoAtual.length === 0) {
        tbody.innerHTML = `<tr id="nenhum-item-pedido-placeholder"><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum item adicionado ao pedido.</td></tr>`;
    } else {
        itensPedidoAtual.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div class="font-medium text-gray-800 dark:text-gray-100">${item.pecaNome}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.pecaCodigo}</div>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.quantidade}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.percentualDesconto > 0 ? item.percentualDesconto.toFixed(2) + '%' : '-'} (${item.valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-700 dark:text-gray-200">${item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2 whitespace-nowrap text-center text-sm">
                    <button onclick="removerItemDoPedido('${item.id}')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" title="Remover Item">
                        <i class="fas fa-trash-alt fa-fw"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    calcularTotaisPedido();
}

/**
 * Remove um item da lista do pedido atual.
 * @param {string} itemIdTemporario - O ID temporário do item.
 */
export function removerItemDoPedido(itemIdTemporario) {
    itensPedidoAtual = itensPedidoAtual.filter(item => item.id !== itemIdTemporario);
    renderizarTabelaItensPedido();
}

/**
 * Calcula e exibe os totais do pedido.
 */
function calcularTotaisPedido() {
    const subtotalProdutosEl = document.getElementById('pedido-subtotal-produtos');
    const descontoTotalEl = document.getElementById('pedido-desconto-total');
    const freteDisplayEl = document.getElementById('pedido-frete-display');
    const totalGeralEl = document.getElementById('pedido-total-geral');
    const inputValorFreteEl = document.getElementById('pedido-valor-frete');

    if (!subtotalProdutosEl || !descontoTotalEl || !freteDisplayEl || !totalGeralEl || !inputValorFreteEl) return;

    const subtotalProdutos = itensPedidoAtual.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
    const descontoTotal = itensPedidoAtual.reduce((acc, item) => acc + item.valorDesconto, 0);
    const valorFrete = parseFloat(inputValorFreteEl.value) || 0;
    const totalGeral = (subtotalProdutos - descontoTotal) + valorFrete;

    subtotalProdutosEl.textContent = subtotalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    descontoTotalEl.textContent = `- ${descontoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    freteDisplayEl.textContent = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalGeralEl.textContent = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


function resetarFormularioPedidoVenda() {
    const form = document.getElementById('form-novo-pedido-venda');
    if (form) form.reset();
    
    const campoDataPedido = document.getElementById('pedido-data');
    if (campoDataPedido) campoDataPedido.valueAsDate = new Date();

    const freteInput = document.getElementById('pedido-valor-frete');
    if (freteInput) freteInput.value = "0.00";
    
    itensPedidoAtual = [];
    proximoItemIdPedido = 1;
    atualizarInfoPecaSelecionadaPedido(); // Reseta o span de estoque e preço
}

/**
 * Limpa o formulário de novo pedido e a lista de itens.
 */
export function cancelarNovoPedidoVenda() {
    if (confirm('Tem certeza que deseja limpar este pedido? Todos os itens adicionados serão perdidos.')) {
        resetarFormularioPedidoVenda();
        renderizarTabelaItensPedido(); // Limpa a tabela visualmente
    }
}

/**
 * Submete o formulário de pedido de venda.
 * @param {Event} event - O evento de submit.
 * @param {string} tipoSalvar - 'pedido' ou 'orcamento'.
 */
function submeterPedidoVenda(event, tipoSalvar = 'pedido') {
    event.preventDefault();
    const form = event.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        alert('Por favor, preencha todos os campos obrigatórios do cabeçalho do pedido.');
        return;
    }
    if (itensPedidoAtual.length === 0) {
        alert('Por favor, adicione pelo menos um item ao pedido.');
        return;
    }

    const dadosCabecalho = {
        cliente: form.elements['pedido-cliente'].value,
        dataPedido: form.elements['pedido-data'].value,
        vendedor: form.elements['pedido-vendedor'].value,
        condicaoPagamento: form.elements['pedido-cond-pagamento'].value,
        tipoFrete: form.elements['pedido-tipo-frete'].value,
        valorFrete: parseFloat(form.elements['pedido-valor-frete'].value) || 0,
        observacoes: form.elements['pedido-obs'].value,
    };

    const subtotalProdutos = itensPedidoAtual.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
    const descontoTotal = itensPedidoAtual.reduce((acc, item) => acc + item.valorDesconto, 0);
    
    const pedidoCompleto = {
        tipo: tipoSalvar,
        cabecalho: dadosCabecalho,
        itens: itensPedidoAtual,
        subtotalProdutos: subtotalProdutos,
        descontoTotal: descontoTotal,
        valorFrete: dadosCabecalho.valorFrete,
        valorTotalPedido: (subtotalProdutos - descontoTotal) + dadosCabecalho.valorFrete
    };

    console.log(`Salvando ${tipoSalvar} completo:`, pedidoCompleto);
    // SIMULAÇÃO DE SALVAMENTO NO BACKEND
    // Em um app real: await api.salvarPedido(pedidoCompleto);
    // Se for pedido firme, pode disparar baixa de estoque (ou reserva).
    
    alert(`${tipoSalvar.charAt(0).toUpperCase() + tipoSalvar.slice(1)} salvo com sucesso! (simulação)`);
    resetarFormularioPedidoVenda();
    renderizarTabelaItensPedido();
}

/**
 * Simula o salvamento do pedido como orçamento.
 */
export function salvarPedidoComoOrcamento() {
    // Para chamar submeterPedidoVenda, precisamos do evento do formulário.
    // Podemos acionar o submit programaticamente ou pegar os dados diretamente.
    // Por simplicidade, vamos pegar os dados diretamente e chamar uma lógica parecida.
    const form = document.getElementById('form-novo-pedido-venda');
    if (!form) return;

    // Simula a criação de um evento de submit para passar para a função
    const fakeEvent = {
        preventDefault: () => {},
        target: form
    };
    submeterPedidoVenda(fakeEvent, 'orçamento');
}


/**
 * Placeholder para listar pedidos de venda.
 */
export function listarPedidosVenda() {
    alert('Funcionalidade "Listar Pedidos de Venda" a ser implementada.\nIsso poderia carregar uma nova view ou um modal com a lista de pedidos.');
    // loadContent('lista-pedidos-venda'); // Se fosse uma nova seção
}