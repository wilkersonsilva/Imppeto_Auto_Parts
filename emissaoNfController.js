// emissaoNfController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js';
import { loadContent, getCurrentSection } from './contentLoader.js';

// Simulação de um pedido de venda para carregar dados
const pedidoExemploNFe = {
    id: 'PED10025',
    cliente: {
        nome: 'Auto Peças ABC',
        doc: '11.222.333/0001-44',
        ie: '123456789',
        email: 'contato@autopecasabc.com.br',
        // Adicionar dados de endereço do cliente aqui
    },
    vendedor: 'vendedor1',
    condicaoPagamento: '30_60d',
    tipoFrete: 'cif',
    valorFrete: 50.00,
    itens: [
        { pecaId: 'peca-P00125', codigo: 'P00125', descricao: 'Filtro de Óleo Scania XT', ncm: '84212300', cfop: '5102', quantidade: 2, precoUnitario: 185.90, descontoPercentual: 5 },
        { pecaId: 'peca-P00789', codigo: 'P00789', descricao: 'Correia Dentada MB Actros', ncm: '40103500', cfop: '5102', quantidade: 1, precoUnitario: 120.00, descontoPercentual: 0 }
    ],
    observacoes: 'Entregar em horário comercial.'
};

// Simulação de dados do emitente (empresa)
const dadosEmitenteNFe = {
    razaoSocial: 'IMPPETO AUTO PARTS LTDA (Simulado)',
    cnpj: '00.000.000/0001-00 (Simulado)',
    enderecoCompleto: 'Rua Exemplo, 123, Centro, Cidade Exemplo - ES (Simulado)',
    // Adicionar outros dados do emitente como IE, Regime Tributário, etc.
};


/**
 * Inicializa a página de Emissão de NF-e.
 */
export function initializeEmissaoNf() {
    console.log("Inicializando Emissão de NF-e...");
    const formNFe = document.getElementById('form-emissao-nfe');
    const btnCarregarPedido = document.querySelector('button[onclick="carregarDadosDoPedidoParaNFe()"]');
    // const btnAdicionarItemManual = document.querySelector('button[onclick="adicionarItemManualmenteNFe()"]'); // Se implementado
    const btnLimparNFe = document.querySelector('button[onclick="limparFormularioNFe()"]');


    if (formNFe) {
        formNFe.addEventListener('submit', (event) => {
            event.preventDefault();
            validarESimularEnvioNFe();
        });
    } else {
        console.error("Formulário #form-emissao-nfe não encontrado.");
    }

    if (btnCarregarPedido) {
        // Event listener será adicionado via onclick no HTML por enquanto
    }

    if (btnLimparNFe) {
        // Event listener será adicionado via onclick no HTML
    }

    // Preenche data/hora de emissão padrão e dados do emitente
    const campoDataEmissao = document.getElementById('nfe-data-emissao');
    if (campoDataEmissao && !campoDataEmissao.value) {
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset()); // Ajusta para o fuso horário local
        campoDataEmissao.value = agora.toISOString().slice(0, 16);
    }

    const emitenteDiv = document.getElementById('nfe-dados-emitente');
    if (emitenteDiv) {
        emitenteDiv.innerHTML = `
            <p><strong>Razão Social:</strong> ${dadosEmitenteNFe.razaoSocial}</p>
            <p><strong>CNPJ:</strong> ${dadosEmitenteNFe.cnpj}</p>
            <p><strong>Endereço:</strong> ${dadosEmitenteNFe.enderecoCompleto}</p>
        `;
    }
    
    limparDadosNFe(); // Garante que comece limpo ou com dados padrão
    renderizarItensNFe([]); // Limpa a tabela de itens
    calcularTotaisNFe([]); // Calcula totais para zero
}

/**
 * Limpa todos os campos do formulário da NF-e e a tabela de itens.
 */
export function limparFormularioNFe() {
    const form = document.getElementById('form-emissao-nfe');
    if (form) form.reset();

    const campoDataEmissao = document.getElementById('nfe-data-emissao');
    if (campoDataEmissao) {
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
        campoDataEmissao.value = agora.toISOString().slice(0, 16);
    }
    // Restaurar dados do emitente
    const emitenteDiv = document.getElementById('nfe-dados-emitente');
    if (emitenteDiv) {
         emitenteDiv.innerHTML = `
            <p><strong>Razão Social:</strong> ${dadosEmitenteNFe.razaoSocial}</p>
            <p><strong>CNPJ:</strong> ${dadosEmitenteNFe.cnpj}</p>
            <p><strong>Endereço:</strong> ${dadosEmitenteNFe.enderecoCompleto}</p>
        `;
    }

    document.getElementById('nfe-pedido-origem').value = '';
    renderizarItensNFe([]);
    calcularTotaisNFe([]);
    const statusDiv = document.getElementById('nfe-status-simulacao');
    if (statusDiv) statusDiv.innerHTML = '';
    console.log("Formulário NF-e limpo.");
}

/**
 * Simula o carregamento de dados de um pedido de venda para a NF-e.
 */
export function carregarDadosDoPedidoParaNFe() {
    const numPedidoOrigemEl = document.getElementById('nfe-pedido-origem');
    if (!numPedidoOrigemEl) return;
    const numPedido = numPedidoOrigemEl.value.trim();

    if (!numPedido) {
        alert("Por favor, informe o número do pedido de venda.");
        numPedidoOrigemEl.focus();
        return;
    }

    // SIMULAÇÃO: Busca o pedido. Em um app real, seria uma chamada API.
    if (numPedido === pedidoExemploNFe.id) {
        console.log("Carregando dados do pedido:", pedidoExemploNFe);
        preencherFormularioNFeComPedido(pedidoExemploNFe);
        alert(`Dados do pedido ${numPedido} carregados.`);
    } else {
        alert(`Pedido ${numPedido} não encontrado (simulação).`);
        // limparFormularioNFe(); // Ou apenas a parte de destinatário e itens
    }
}

function preencherFormularioNFeComPedido(pedido) {
    // Preenche dados do destinatário
    document.getElementById('nfe-dest-nome').value = pedido.cliente.nome || '';
    document.getElementById('nfe-dest-doc').value = pedido.cliente.doc || '';
    document.getElementById('nfe-dest-ie').value = pedido.cliente.ie || '';
    document.getElementById('nfe-dest-email').value = pedido.cliente.email || '';
    // Preencher endereço do destinatário se disponível no objeto pedido.cliente

    // Preenche outros campos se relevantes (natureza, frete, etc.)
    document.getElementById('nfe-valor-frete').textContent = (pedido.valorFrete || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    // document.getElementById('nfe-natureza-operacao').value = "VENDA DE MERCADORIA ADQUIRIDA OU RECEBIDA DE TERCEIROS"; // Exemplo

    // Converte itens do pedido para itens da NF-e
    const itensNFe = pedido.itens.map(item => {
        const valorTotalItem = item.quantidade * item.precoUnitario;
        const valorDescontoItem = valorTotalItem * ( (item.descontoPercentual || 0) / 100);
        return {
            codigo: item.codigo,
            descricao: item.descricao,
            ncm: item.ncm, // NCM e CFOP viriam do cadastro da peça ou do pedido
            cfop: item.cfop, 
            quantidade: item.quantidade,
            valorUnitario: item.precoUnitario,
            valorDesconto: valorDescontoItem, // Adiciona o valor do desconto
            valorTotal: valorTotalItem - valorDescontoItem, // Subtotal do item já com desconto
            // Outros campos fiscais (Base ICMS, Aliq ICMS, Valor ICMS, etc.) seriam calculados aqui
        };
    });
    renderizarItensNFe(itensNFe);
    calcularTotaisNFe(itensNFe, pedido.valorFrete);
}

/**
 * Renderiza a tabela de itens da NF-e.
 * @param {Array} itens - Array de objetos de item da NF-e.
 */
function renderizarItensNFe(itens) {
    const tbody = document.getElementById('tabela-itens-nfe');
    if (!tbody) { console.error("Tabela #tabela-itens-nfe não encontrada."); return; }
    tbody.innerHTML = '';

    if (!itens || itens.length === 0) {
        tbody.innerHTML = `<tr id="nenhum-item-nfe-placeholder"><td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum item carregado ou adicionado à NF-e.</td></tr>`;
    } else {
        itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm">${item.codigo}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm max-w-xs truncate" title="${item.descricao}">${item.descricao}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center">${item.ncm || '-'}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center">${item.cfop || '-'}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center">${item.quantidade}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-right">${(item.valorUnitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-right font-semibold">${(item.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

/**
 * Calcula e exibe os totais da NF-e.
 * @param {Array} itens - Array de objetos de item da NF-e.
 * @param {number} [valorFreteAdicional=0] - Valor do frete a ser somado.
 */
function calcularTotaisNFe(itens = [], valorFreteAdicional = 0) {
    const totalProdutosEl = document.getElementById('nfe-total-produtos');
    const totalDescontosEl = document.getElementById('nfe-total-descontos');
    const valorFreteEl = document.getElementById('nfe-valor-frete'); // O span que exibe, não o input
    const outrasDespesasEl = document.getElementById('nfe-outras-despesas'); // Placeholder
    const totalIpiEl = document.getElementById('nfe-total-ipi'); // Placeholder
    const totalIcmsEl = document.getElementById('nfe-total-icms'); // Placeholder
    const totalGeralEl = document.getElementById('nfe-total-geral');

    if (!totalProdutosEl || !totalDescontosEl || !valorFreteEl || !outrasDespesasEl || !totalIpiEl || !totalIcmsEl || !totalGeralEl) {
        console.error("Um ou mais elementos de totais da NF-e não foram encontrados.");
        return;
    }

    let subtotalProdutos = 0;
    let totalDescontos = 0;
    itens.forEach(item => {
        subtotalProdutos += (item.valorUnitario * item.quantidade);
        totalDescontos += (item.valorDesconto || 0); // Soma os descontos de cada item
    });

    const valorFrete = parseFloat(document.getElementById('pedido-valor-frete')?.value || valorFreteAdicional || 0); // Pega do input se existir ou do parâmetro
    const outrasDespesas = 0; // Simulação
    const totalIPI = 0; // Simulação, cálculo complexo
    const totalICMS = 0; // Simulação, cálculo complexo

    const totalNota = (subtotalProdutos - totalDescontos) + valorFrete + outrasDespesas + totalIPI; // ICMS geralmente está embutido ou é ST

    totalProdutosEl.textContent = subtotalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalDescontosEl.textContent = totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    valorFreteEl.textContent = valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    outrasDespesasEl.textContent = outrasDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalIpiEl.textContent = totalIPI.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalIcmsEl.textContent = totalICMS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalGeralEl.textContent = totalNota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Simula a validação e o "envio" da NF-e.
 */
export function validarESimularEnvioNFe() {
    const form = document.getElementById('form-emissao-nfe');
    const statusDiv = document.getElementById('nfe-status-simulacao');
    if (!form || !statusDiv) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        statusDiv.innerHTML = `<p class="text-sm text-error p-2 rounded-md bg-red-50 dark:bg-red-900/30">Por favor, preencha todos os campos obrigatórios da NF-e.</p>`;
        return;
    }
    
    const itensNFeTbody = document.getElementById('tabela-itens-nfe');
    if (!itensNFeTbody || itensNFeTbody.rows.length === 0 || (itensNFeTbody.rows.length === 1 && itensNFeTbody.rows[0].id === 'nenhum-item-nfe-placeholder')) {
        statusDiv.innerHTML = `<p class="text-sm text-error p-2 rounded-md bg-red-50 dark:bg-red-900/30">Adicione pelo menos um item à NF-e.</p>`;
        return;
    }

    statusDiv.innerHTML = `<p class="text-sm text-blue-600 dark:text-blue-400 p-2 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center"><i class="fas fa-spinner fa-spin mr-2"></i>Enviando NF-e para SEFAZ (simulação)...</p>`;

    // SIMULAÇÃO DE ENVIO
    setTimeout(() => {
        const sucesso = Math.random() > 0.2; // 80% de chance de sucesso
        if (sucesso) {
            const numNFeSimulado = Math.floor(100000 + Math.random() * 900000);
            document.getElementById('nfe-numero').value = numNFeSimulado;
            statusDiv.innerHTML = `<div class="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600">
                <p class="text-sm font-semibold text-success dark:text-green-300">NF-e Nº ${numNFeSimulado} autorizada com sucesso! (Simulação)</p>
                <button onclick="imprimirDANFESimulado(${numNFeSimulado})" class="mt-2 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Imprimir DANFE (Simulado)</button>
            </div>`;
            // Em um app real, aqui você habilitaria opções como "Cancelar NF-e", "Enviar por Email", etc.
        } else {
            statusDiv.innerHTML = `<div class="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600">
                <p class="text-sm font-semibold text-error dark:text-red-300">Rejeição: Erro de validação XPT001 - Dados do destinatário inconsistentes (Simulação)</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Verifique os dados e tente novamente.</p>
            </div>`;
        }
    }, 2000); // Simula delay da SEFAZ
}

/**
 * Placeholder para listar NF-e emitidas.
 */
export function listarNotasFiscais() {
    alert('Funcionalidade "Listar NF-e Emitidas" a ser implementada.');
    // Poderia abrir um modal ou carregar uma nova sub-view com a lista.
}

/**
 * Placeholder para adicionar item manualmente à NF-e.
 */
export function adicionarItemManualmenteNFe() {
    alert('Funcionalidade "Adicionar Item Manualmente à NF-e" a ser implementada.\nIsso abriria um modal para buscar ou inserir os dados da peça e seus impostos.');
}

/**
 * Placeholder para imprimir DANFE simulado.
 */
export function imprimirDANFESimulado(numeroNFe) {
    alert(`Simulando impressão do DANFE para NF-e Nº ${numeroNFe}.\nEm um sistema real, isso geraria um PDF.`);
}

// Limpa dados do formulário ao carregar (ou quando necessário)
function limparDadosNFe() {
    // Implementar limpeza mais granular se necessário,
    // mas o reset do form já faz bastante.
    // A tabela de itens é limpa por renderizarItensNFe([]).
    const numPedidoOrigemEl = document.getElementById('nfe-pedido-origem');
    if (numPedidoOrigemEl) numPedidoOrigemEl.value = '';
    
    // Limpar campos do destinatário
    const camposDestinatario = ['nfe-dest-nome', 'nfe-dest-doc', 'nfe-dest-ie', 'nfe-dest-email']; // Adicionar outros campos de endereço
    camposDestinatario.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // Limpar outros campos específicos se necessário
}