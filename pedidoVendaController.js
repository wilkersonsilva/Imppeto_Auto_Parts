// pedidoVendaController.js
// Data da Última Atualização: 18 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

let itensPedidoAtual = [];
let proximoItemIdPedido = 1;

// SIMULAÇÃO DE DADOS DA EMPRESA (para o cabeçalho do orçamento)
const dadosEmpresaParaImpressao = {
    logoUrl: 'logoImpetto.svg', // Mesmo logo da sidebar, ajuste o caminho se necessário
    razaoSocial: 'IMPPETO AUTO PARTS LTDA (Simulado)',
    cnpj: '00.111.222/0001-33', // Exemplo
    endereco: 'Avenida Principal, 789, Sala 505, Centro Cívico, Cidade Exemplo - PR',
    telefone: '(41) 3030-4040',
    email: 'contato@imppetoauto.com.br',
    website: 'www.imppetoauto.com.br'
};

// SIMULAÇÃO DE DADOS DE CLIENTES (para buscar nome/doc para o orçamento)
const clientesSimuladosParaImpressao = {
    'cliente-pf-123': { nome: 'João Pereira da Silva (PF)', doc: '123.456.789-00', endereco: 'Rua das Palmeiras, 123, Apto 101, Centro, São Paulo - SP' },
    'cliente-pj-789': { nome: 'Transportadora Veloz Ltda. (PJ)', doc: '12.345.678/0001-99', endereco: 'Av. Brasil, 1000, Galpão A, Penha, Rio de Janeiro - RJ' }
};

/**
 * Inicializa a página de Pedido de Venda.
 */
export function initializePedidoVenda() {
    console.log("Inicializando Pedido de Venda com Impressão de Orçamento...");
    const formPedido = document.getElementById('form-novo-pedido-venda');
    const btnAdicionarItem = document.getElementById('btn-adicionar-item-pedido');
    const selectPecaEl = document.getElementById('item-pedido-peca');
    const campoValorFreteEl = document.getElementById('pedido-valor-frete');
    // O botão de imprimir orçamento já tem onclick no HTML

    if (formPedido) {
        formPedido.addEventListener('submit', (event) => submeterPedidoVenda(event, 'pedido'));
    }
    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', adicionarItemAoPedido);
    }
    if (selectPecaEl) {
        selectPecaEl.addEventListener('change', atualizarInfoPecaSelecionadaPedido);
    }
    if (campoValorFreteEl) {
        campoValorFreteEl.addEventListener('input', calcularTotaisPedido);
    }

    const campoDataPedido = document.getElementById('pedido-data');
    if (campoDataPedido && !campoDataPedido.value) {
        const hoje = new Date();
        const offset = hoje.getTimezoneOffset();
        const hojeLocal = new Date(hoje.getTime() - (offset*60*1000));
        campoDataPedido.value = hojeLocal.toISOString().split('T')[0];
    }

    resetarFormularioPedidoVenda(); // Garante que o formulário e itens estejam limpos
    renderizarTabelaItensPedido(); // Renderiza a tabela (vazia inicialmente)
    atualizarInfoPecaSelecionadaPedido(); // Atualiza info da peça se houver algo selecionado por padrão
}

function atualizarInfoPecaSelecionadaPedido() {
    const selectPecaEl = document.getElementById('item-pedido-peca');
    const spanEstoqueEl = document.getElementById('item-pedido-estoque-disponivel');
    const inputPrecoUnitarioEl = document.getElementById('item-pedido-preco-unitario');

    if (selectPecaEl && spanEstoqueEl && inputPrecoUnitarioEl) {
        const selectedOption = selectPecaEl.options[selectPecaEl.selectedIndex];
        const estoqueDisponivel = selectedOption ? selectedOption.getAttribute('data-estoque') : '-';
        const precoVenda = selectedOption ? selectedOption.getAttribute('data-preco') : '0.00';

        spanEstoqueEl.textContent = estoqueDisponivel || '-';
        if (selectPecaEl.value && selectedOption && selectedOption.value !== "") {
            inputPrecoUnitarioEl.value = parseFloat(precoVenda || 0).toFixed(2);
        } else {
            inputPrecoUnitarioEl.value = '';
        }
    }
}

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
    if (!pecaId) {
        alert('Por favor, selecione uma peça.'); selectPecaEl.focus(); return;
    }
    const pecaTexto = selectedOption.text || 'Peça Desconhecida';
    const estoqueDisponivel = parseFloat(selectedOption.getAttribute('data-estoque') || 0);

    const quantidade = parseFloat(inputQuantidadeEl.value);
    const precoUnitario = parseFloat(inputPrecoUnitarioEl.value);
    const percentualDesconto = parseFloat(inputDescontoEl.value) || 0;

    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, insira uma quantidade válida.'); inputQuantidadeEl.focus(); return;
    }
    // Validação de estoque (pode ser configurável via preferências no futuro)
    const permiteVendaSemEstoque = true; // Simulação, idealmente viria de preferenciasDaLoja
    if (quantidade > estoqueDisponivel && !permiteVendaSemEstoque) {
        alert(`Estoque indisponível. Solicitado: ${quantidade}, Disponível: ${estoqueDisponivel}.`);
        inputQuantidadeEl.focus();
        return;
    } else if (quantidade > estoqueDisponivel && permiteVendaSemEstoque) {
        if (!confirm(`Atenção: Quantidade solicitada (${quantidade}) excede o estoque disponível (${estoqueDisponivel}). Deseja continuar?`)) {
            inputQuantidadeEl.focus();
            return;
        }
    }

    if (isNaN(precoUnitario) || precoUnitario < 0) {
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
        pecaNome: pecaTexto.includes(' - ') ? pecaTexto.substring(pecaTexto.indexOf(' - ') + 3) : pecaTexto,
        pecaCodigo: pecaTexto.includes(' - ') ? pecaTexto.substring(0, pecaTexto.indexOf(' - ')) : '',
        quantidade: quantidade,
        precoUnitario: precoUnitario,
        percentualDesconto: percentualDesconto,
        valorDesconto: valorDesconto,
        subtotal: subtotalComDesconto
    };

    itensPedidoAtual.push(novoItem);
    renderizarTabelaItensPedido();

    selectPecaEl.value = '';
    inputQuantidadeEl.value = '1';
    // inputPrecoUnitarioEl.value = ''; // Manter o último preço pode ser útil, ou limpar.
    inputDescontoEl.value = '0';
    atualizarInfoPecaSelecionadaPedido();
    selectPecaEl.focus();
}

function renderizarTabelaItensPedido() {
    const tbody = document.getElementById('tabela-itens-pedido');
    if (!tbody) { console.error("Tabela #tabela-itens-pedido não encontrada."); return; }
    tbody.innerHTML = '';

    if (itensPedidoAtual.length === 0) {
        tbody.innerHTML = `<tr id="nenhum-item-pedido-placeholder"><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum item adicionado ao pedido.</td></tr>`;
    } else {
        itensPedidoAtual.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
            tr.innerHTML = `
                <td class="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div class="font-medium text-gray-800 dark:text-gray-100">${item.pecaNome}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.pecaCodigo}</div>
                </td>
                <td class="px-3 py-2.5 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.quantidade.toLocaleString('pt-BR')}</td>
                <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${item.valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${item.percentualDesconto.toFixed(1)}%)</td>
                <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right font-semibold text-gray-700 dark:text-gray-200">${item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-3 py-2.5 whitespace-nowrap text-center text-sm">
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

export function removerItemDoPedido(itemIdTemporario) {
    itensPedidoAtual = itensPedidoAtual.filter(item => item.id !== itemIdTemporario);
    renderizarTabelaItensPedido();
}

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
    if (campoDataPedido) {
        const hoje = new Date();
        const offset = hoje.getTimezoneOffset();
        const hojeLocal = new Date(hoje.getTime() - (offset*60*1000));
        campoDataPedido.value = hojeLocal.toISOString().split('T')[0];
    }

    const freteInput = document.getElementById('pedido-valor-frete');
    if (freteInput) freteInput.value = "0.00";

    itensPedidoAtual = [];
    proximoItemIdPedido = 1;
    // A tabela será limpa e totais recalculados por renderizarTabelaItensPedido() -> calcularTotaisPedido()
}

export function cancelarNovoPedidoVenda() {
    if (itensPedidoAtual.length > 0 && !confirm('Tem certeza que deseja limpar este pedido? Todos os itens adicionados serão perdidos.')) {
        return;
    }
    resetarFormularioPedidoVenda();
    renderizarTabelaItensPedido();
}

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
        clienteId: form.elements['pedido-cliente'].value,
        clienteNome: form.elements['pedido-cliente'].options[form.elements['pedido-cliente'].selectedIndex]?.text,
        dataPedido: form.elements['pedido-data'].value,
        vendedorId: form.elements['pedido-vendedor'].value,
        vendedorNome: form.elements['pedido-vendedor'].options[form.elements['pedido-vendedor'].selectedIndex]?.text,
        condicaoPagamento: form.elements['pedido-cond-pagamento'].value,
        condicaoPagamentoTexto: form.elements['pedido-cond-pagamento'].options[form.elements['pedido-cond-pagamento'].selectedIndex]?.text,
        tipoFrete: form.elements['pedido-tipo-frete'].value,
        tipoFreteTexto: form.elements['pedido-tipo-frete'].options[form.elements['pedido-tipo-frete'].selectedIndex]?.text,
        valorFrete: parseFloat(form.elements['pedido-valor-frete'].value) || 0,
        observacoes: form.elements['pedido-obs'].value,
    };

    const subtotalProdutos = itensPedidoAtual.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
    const descontoTotal = itensPedidoAtual.reduce((acc, item) => acc + item.valorDesconto, 0);

    const pedidoCompleto = {
        id: tipoSalvar === 'pedido' ? `PED-${Date.now().toString().slice(-6)}` : `ORC-${Date.now().toString().slice(-6)}`,
        tipo: tipoSalvar,
        cabecalho: dadosCabecalho,
        itens: itensPedidoAtual,
        subtotalProdutos: subtotalProdutos,
        descontoTotal: descontoTotal,
        valorFrete: dadosCabecalho.valorFrete,
        valorTotalPedido: (subtotalProdutos - descontoTotal) + dadosCabecalho.valorFrete,
        status: tipoSalvar === 'pedido' ? 'Pendente' : 'Orçamento'
    };

    console.log(`Salvando ${tipoSalvar} completo:`, pedidoCompleto);
    // SIMULAÇÃO: Em um app real, salvaria no backend e daria baixa/reservaria estoque se for 'pedido'.
    // Ex: localStorage.setItem(pedidoCompleto.id, JSON.stringify(pedidoCompleto));

    alert(`${tipoSalvar.charAt(0).toUpperCase() + tipoSalvar.slice(1)} salvo com sucesso! (ID: ${pedidoCompleto.id}) (simulação)`);
    resetarFormularioPedidoVenda();
    renderizarTabelaItensPedido();
}

export function salvarPedidoComoOrcamento() {
    const form = document.getElementById('form-novo-pedido-venda');
    if (!form) return;
    const fakeEvent = { preventDefault: () => {}, target: form };
    submeterPedidoVenda(fakeEvent, 'orçamento');
}

export function imprimirOrcamentoVenda() {
    const form = document.getElementById('form-novo-pedido-venda');
    if (!form) { alert("Erro: Formulário de pedido não encontrado."); return; }
    if (itensPedidoAtual.length === 0) {
        alert("Adicione pelo menos um item ao pedido para gerar um orçamento."); return;
    }

    const clienteId = form.elements['pedido-cliente'].value;
    const clienteSelecionado = clientesSimuladosParaImpressao[clienteId] || { nome: 'Cliente não selecionado', doc: '', endereco: ''};
    const nomeCliente = clienteSelecionado.nome;
    const docCliente = clienteSelecionado.doc;
    const enderecoCliente = clienteSelecionado.endereco;

    const dataPedidoISO = form.elements['pedido-data'].value;
    const dataPedidoFormatada = dataPedidoISO ? new Date(dataPedidoISO + "T00:00:00").toLocaleDateString('pt-BR') : 'Data não informada';

    const vendedorNome = form.elements['pedido-vendedor'].options[form.elements['pedido-vendedor'].selectedIndex]?.text || 'Não informado';
    const condicaoPagamento = form.elements['pedido-cond-pagamento'].options[form.elements['pedido-cond-pagamento'].selectedIndex]?.text || 'Não informada';
    const tipoFrete = form.elements['pedido-tipo-frete'].options[form.elements['pedido-tipo-frete'].selectedIndex]?.text || 'Não informado';
    const valorFrete = parseFloat(form.elements['pedido-valor-frete'].value) || 0;
    const observacoes = form.elements['pedido-obs'].value;

    const subtotalProdutos = parseFloat(document.getElementById('pedido-subtotal-produtos')?.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.') || 0);
    const descontoTotal = parseFloat(document.getElementById('pedido-desconto-total')?.textContent.replace('- R$', '').replace(/\./g, '').replace(',', '.') || 0);
    const totalGeral = parseFloat(document.getElementById('pedido-total-geral')?.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.') || 0);
    const numeroOrcamento = `ORC-${Date.now().toString().slice(-6)}`;

    let htmlImpressao = `
        <html>
        <head>
            <title>Orçamento ${numeroOrcamento} - ${dadosEmpresaParaImpressao.razaoSocial}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.4; }
                .header, .footer { text-align: center; margin-bottom: 20px; }
                .header img { max-height: 50px; margin-bottom: 8px; }
                .header h2 { margin: 0 0 5px 0; font-size: 14pt; }
                .company-info p, .client-info p, .order-info p { margin: 1px 0; font-size: 9pt; }
                .company-info strong, .client-info strong, .order-info strong { display: inline-block; min-width: 100px; font-weight: bold; }
                .info-section { border: 1px solid #ccc; padding: 8px; margin-bottom: 12px; border-radius: 4px; }
                .info-section h3 { margin-top: 0; font-size: 11pt; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; color: #1d4ed8; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5pt; }
                th, td { border: 1px solid #ddd; padding: 5px; text-align: left; vertical-align: top; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .text-right { text-align: right; }
                .totals { margin-top: 15px; width: 280px; margin-left: auto; font-size: 9pt; }
                .totals td { border: none; padding: 2px 5px; }
                .totals .grand-total td { font-weight: bold; font-size: 10pt; border-top: 1px solid #999; padding-top: 4px;}
                .obs-section { margin-top: 15px; font-size: 8.5pt; border-top: 1px dashed #ccc; padding-top: 8px; }
                .obs-section strong { display:block; margin-bottom: 3px; }
                .footer p { font-size: 7.5pt; color: #777; margin-top: 30px; }
                @media print {
                    body { margin: 0.5cm; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
                    .no-print { display: none; }
                    .info-section { border: 1px solid #ccc !important; }
                    th { background-color: #f0f0f0 !important; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                ${dadosEmpresaParaImpressao.logoUrl ? `<img src="${dadosEmpresaParaImpressao.logoUrl}" alt="Logo da Empresa">` : ''}
                <h2>${dadosEmpresaParaImpressao.razaoSocial}</h2>
                <div class="company-info">
                    <p>CNPJ: ${dadosEmpresaParaImpressao.cnpj}</p>
                    <p>${dadosEmpresaParaImpressao.endereco}</p>
                    <p>Telefone: ${dadosEmpresaParaImpressao.telefone} | Email: ${dadosEmpresaParaImpressao.email}
                    ${dadosEmpresaParaImpressao.website ? `| Website: ${dadosEmpresaParaImpressao.website}` : ''}</p>
                </div>
            </div>

            <h2 style="text-align:center; font-size: 13pt; margin-bottom: 15px; color: #1d4ed8;">ORÇAMENTO Nº ${numeroOrcamento}</h2>

            <div class="info-section client-info">
                <h3>Dados do Cliente</h3>
                <p><strong>Cliente:</strong> ${nomeCliente}</p>
                <p><strong>CNPJ/CPF:</strong> ${docCliente || 'Não informado'}</p>
                <p><strong>Endereço:</strong> ${enderecoCliente || 'Não informado'}</p>
            </div>

            <div class="info-section order-info">
                <h3>Informações do Orçamento</h3>
                <p><strong>Data:</strong> ${dataPedidoFormatada}</p>
                <p><strong>Vendedor:</strong> ${vendedorNome}</p>
                <p><strong>Cond. Pag.:</strong> ${condicaoPagamento}</p>
                <p><strong>Frete:</strong> ${tipoFrete}</p>
            </div>

            <h3>Itens do Orçamento</h3>
            <table>
                <thead>
                    <tr>
                        <th>Cód.</th>
                        <th>Descrição da Peça</th>
                        <th class="text-right">Qtd.</th>
                        <th class="text-right">Preço Unit.</th>
                        <th class="text-right">Desconto</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>`;

    itensPedidoAtual.forEach(item => {
        htmlImpressao += `
                    <tr>
                        <td>${item.pecaCodigo || '-'}</td>
                        <td>${item.pecaNome}</td>
                        <td class="text-right">${item.quantidade.toLocaleString('pt-BR')}</td>
                        <td class="text-right">${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td class="text-right">${item.valorDesconto > 0 ? item.valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ` (${item.percentualDesconto.toFixed(1)}%)` : '-'}</td>
                        <td class="text-right">${item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>`;
    });

    htmlImpressao += `
                </tbody>
            </table>

            <div class="totals">
                <table>
                    <tr><td>Subtotal Produtos:</td><td class="text-right">${subtotalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>
                    ${descontoTotal > 0 ? `<tr><td>Desconto Total:</td><td class="text-right" style="color: red;">-${descontoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>` : ''}
                    ${valorFrete > 0 ? `<tr><td>Valor do Frete:</td><td class="text-right">${valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>` : ''}
                    <tr class="grand-total"><td>TOTAL GERAL:</td><td class="text-right">${totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>
                </table>
            </div>`;

    if (observacoes) {
        htmlImpressao += `
            <div class="obs-section">
                <strong>Observações:</strong>
                <p>${observacoes.replace(/\n/g, '<br>')}</p>
            </div>`;
    }

    htmlImpressao += `
            <div class="footer">
                <p>Orçamento válido por 7 dias. Condições sujeitas a alterações sem aviso prévio. Sujeito à disponibilidade de estoque.</p>
                <p>Impresso em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </body>
        </html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlImpressao);
        printWindow.document.close();
        printWindow.onload = function() { // Espera o conteúdo carregar na nova janela
            printWindow.focus(); // Necessário para alguns navegadores
            printWindow.print();
            // printWindow.close(); // Descomente se quiser fechar automaticamente após a impressão
        };
    } else {
        alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando pop-ups.");
    }
}


export function listarPedidosVenda() {
    alert('Funcionalidade "Listar Pedidos de Venda/Orçamentos" a ser implementada.\nIsso poderia carregar uma nova view ou um modal com a lista.');
}