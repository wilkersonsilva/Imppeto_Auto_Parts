// curvaAbcController.js
// Data da Última Atualização: 17 de maio de 2025

// Chart.js é carregado globalmente via CDN no index.html

let graficoCurvaABCInstance = null;
let todosOsItensParaAnalise = [];
let inputClasseA, inputClasseB, btnGerarABC, selectItensGrafico;

const pecasSimuladas = [
    { id: 'P001', codigo: 'P001', descricao: 'Motor de Partida Bosch 24V Scania S5', categoria: 'Elétrica', marca: 'Bosch', estoqueAtual: 5, custoMedio: 850.00, qtdVendida90d: 10, valorVendaUnitaria: 1500.00, numPedidos90d: 8 },
    { id: 'P002', codigo: 'P002', descricao: 'Alternador Valeo 120A Volvo FH', categoria: 'Elétrica', marca: 'Valeo', estoqueAtual: 8, custoMedio: 650.00, qtdVendida90d: 15, valorVendaUnitaria: 900.00, numPedidos90d: 12 },
    { id: 'P003', codigo: 'P003', descricao: 'Kit Embreagem Sachs MB Actros', categoria: 'Transmissão', marca: 'Sachs', estoqueAtual: 3, custoMedio: 1200.00, qtdVendida90d: 5, valorVendaUnitaria: 1800.00, numPedidos90d: 4 },
    { id: 'P016', codigo: 'P016', descricao: 'Turbocompressor Garrett Novo Iveco Tector', categoria: 'Motor', marca: 'Garrett', estoqueAtual: 2, custoMedio: 2200.00, qtdVendida90d: 3, valorVendaUnitaria: 3500.00, numPedidos90d: 3 },
    { id: 'P017', codigo: 'P017', descricao: 'Unidade Injetora Common Rail DAF XF', categoria: 'Injeção', marca: 'Bosch', estoqueAtual: 4, custoMedio: 1800.00, qtdVendida90d: 2, valorVendaUnitaria: 2800.00, numPedidos90d: 2 },
    { id: 'P004', codigo: 'P004', descricao: 'Bomba Dágua Cummins ISX', categoria: 'Motor', marca: 'OEM', estoqueAtual: 12, custoMedio: 320.00, qtdVendida90d: 25, valorVendaUnitaria: 200.00, numPedidos90d: 20 },
    { id: 'P005', codigo: 'P005', descricao: 'Filtro Ar Primário Mann Scania S6', categoria: 'Filtros', marca: 'Mann Filter', estoqueAtual: 30, custoMedio: 180.00, qtdVendida90d: 50, valorVendaUnitaria: 120.00, numPedidos90d: 35 },
    { id: 'P006', codigo: 'P006', descricao: 'Sensor Rotação Volvo D13 Original', categoria: 'Elétrica', marca: 'Volvo', estoqueAtual: 10, custoMedio: 450.00, qtdVendida90d: 8, valorVendaUnitaria: 600.00, numPedidos90d: 7 },
    { id: 'P018', codigo: 'P018', descricao: 'Radiador Completo Ford Cargo Alumínio', categoria: 'Arrefecimento', marca: 'Visconde', estoqueAtual: 3, custoMedio: 700.00, qtdVendida90d: 4, valorVendaUnitaria: 1100.00, numPedidos90d: 4 },
    { id: 'P007', codigo: 'P007', descricao: 'Jogo Bronzinas Mancal STD Mahle', categoria: 'Motor', marca: 'Mahle', estoqueAtual: 20, custoMedio: 280.00, qtdVendida90d: 18, valorVendaUnitaria: 180.00, numPedidos90d: 15 },
    { id: 'P019', codigo: 'P019', descricao: 'Cubo de Roda Dianteiro com Rolamento', categoria: 'Suspensão', marca: 'Nakata', estoqueAtual: 6, custoMedio: 400.00, qtdVendida90d: 7, valorVendaUnitaria: 550.00, numPedidos90d: 6 },
    { id: 'P008', codigo: 'P008', descricao: 'Lâmpada Farol H7 24V Osram', categoria: 'Elétrica', marca: 'Osram', estoqueAtual: 150, custoMedio: 15.00, qtdVendida90d: 200, valorVendaUnitaria: 20.00, numPedidos90d: 80 },
    { id: 'P012', codigo: 'P012', descricao: 'Graxa Azul Especial Pote 500g', categoria: 'Lubrificantes', marca: 'Bardahl', estoqueAtual: 25, custoMedio: 22.00, qtdVendida90d: 60, valorVendaUnitaria: 15.00, numPedidos90d: 40 },
    { id: 'P013', codigo: 'P013', descricao: 'Óleo Motor 15W40 Mineral Balde 20L', categoria: 'Lubrificantes', marca: 'Mobil', estoqueAtual: 10, custoMedio: 250.00, qtdVendida90d: 12, valorVendaUnitaria: 150.00, numPedidos90d: 10 },
    { id: 'P014', codigo: 'P014', descricao: 'Terminal de Bateria Universal', categoria: 'Elétrica', marca: 'Vários', estoqueAtual: 70, custoMedio: 8.00, qtdVendida90d: 150, valorVendaUnitaria: 5.00, numPedidos90d: 90 },
    { id: 'P015', codigo: 'P015', descricao: 'Retentor Roda Traseira Sabó', categoria: 'Vedações', marca: 'Sabó', estoqueAtual: 40, custoMedio: 35.00, qtdVendida90d: 90, valorVendaUnitaria: 25.00, numPedidos90d: 50 },
    { id: 'P009', codigo: 'P009', descricao: 'Abraçadeira Mangueira 2pol Inox', categoria: 'Acessórios', marca: 'Suprens', estoqueAtual: 300, custoMedio: 2.50, qtdVendida90d: 500, valorVendaUnitaria: 2.00, numPedidos90d: 150 },
    { id: 'P010', codigo: 'P010', descricao: 'Parafuso Sextavado M10x1.25 Zincado', categoria: 'Fixação', marca: 'Vários', estoqueAtual: 500, custoMedio: 0.80, qtdVendida90d: 1000, valorVendaUnitaria: 0.40, numPedidos90d: 200 },
    { id: 'P011', codigo: 'P011', descricao: 'Fusível Lâmina 10A Vermelho', categoria: 'Elétrica', marca: 'Vários', estoqueAtual: 1000, custoMedio: 0.50, qtdVendida90d: 800, valorVendaUnitaria: 0.30, numPedidos90d: 180 },
    { id: 'P020', codigo: 'P020', descricao: 'Arruela Lisa M8 Zincada (100un)', categoria: 'Fixação', marca: 'Vários', estoqueAtual: 200, custoMedio: 0.05, qtdVendida90d: 300, valorVendaUnitaria: 0.10, numPedidos90d: 50 },
    { id: 'P021', codigo: 'P021', descricao: 'Limpa Para-brisa Concentrado Frasco', categoria: 'Acessórios', marca: 'Wurth', estoqueAtual: 50, custoMedio: 7.00, qtdVendida90d: 40, valorVendaUnitaria: 12.00, numPedidos90d: 30 },
    { id: 'P022', codigo: 'P022', descricao: 'Estopa Branca Pacote 1kg', categoria: 'Limpeza', marca: 'Diversas', estoqueAtual: 15, custoMedio: 10.00, qtdVendida90d: 20, valorVendaUnitaria: 18.00, numPedidos90d: 18 },
    { id: 'P023', codigo: 'P023', descricao: 'Fita Isolante Preta Rolo 20m', categoria: 'Elétrica', marca: '3M', estoqueAtual: 80, custoMedio: 3.00, qtdVendida90d: 100, valorVendaUnitaria: 5.00, numPedidos90d: 60 },
    { id: 'P024', codigo: 'P024', descricao: 'Silicone Acético Preto Bisnaga', categoria: 'Vedações', marca: 'Orbi', estoqueAtual: 30, custoMedio: 9.00, qtdVendida90d: 25, valorVendaUnitaria: 15.00, numPedidos90d: 20 },
    { id: 'P025', codigo: 'P025', descricao: 'Desengripante Spray Lata 300ml', categoria: 'Lubrificantes', marca: 'WD-40', estoqueAtual: 40, custoMedio: 18.00, qtdVendida90d: 50, valorVendaUnitaria: 28.00, numPedidos90d: 35 }
];

export function initializeCurvaABC() {
    console.log("Inicializando Curva ABC (com interatividade no gráfico)...");
    btnGerarABC = document.getElementById('btn-gerar-abc');
    const criterioSelect = document.getElementById('abc-criterio');
    const periodoSelect = document.getElementById('abc-periodo');
    const searchTableInput = document.getElementById('abc-search-table');
    const exportButton = document.getElementById('btn-exportar-abc');
    selectItensGrafico = document.getElementById('abc-grafico-itens');

    inputClasseA = document.getElementById('abc-classe-a');
    inputClasseB = document.getElementById('abc-classe-b');

    if (btnGerarABC) {
        btnGerarABC.addEventListener('click', gerarAnaliseABC);
    }
    if (inputClasseA && inputClasseB) {
        inputClasseA.addEventListener('input', validarLimitesClasseEBotao);
        inputClasseB.addEventListener('input', validarLimitesClasseEBotao);
    }
    if (criterioSelect && periodoSelect) {
        criterioSelect.addEventListener('change', () => {
            const periodoEstoqueOption = periodoSelect.querySelector('option[value="estoque_atual"]');
            if (criterioSelect.value === 'valor_total_estoque') {
                periodoSelect.value = 'estoque_atual';
                periodoSelect.disabled = true;
                if (periodoEstoqueOption) periodoEstoqueOption.classList.remove('hidden');
            } else {
                periodoSelect.disabled = false;
                if (periodoSelect.value === 'estoque_atual') periodoSelect.value = '90d';
                if (periodoEstoqueOption) periodoEstoqueOption.classList.add('hidden');
            }
            validarLimitesClasseEBotao();
        });
        const periodoEstoqueOption = periodoSelect.querySelector('option[value="estoque_atual"]');
        if (criterioSelect.value === 'valor_total_estoque') {
            periodoSelect.value = 'estoque_atual';
            periodoSelect.disabled = true;
            if (periodoEstoqueOption) periodoEstoqueOption.classList.remove('hidden');
        } else {
            if (periodoEstoqueOption) periodoEstoqueOption.classList.add('hidden');
        }
    }
    if (searchTableInput) searchTableInput.addEventListener('keyup', filtrarTabelaABC);
    if (selectItensGrafico) {
        selectItensGrafico.addEventListener('change', () => {
            if (todosOsItensParaAnalise.length > 0) {
                const itensParaVisualizar = getItensParaGrafico();
                renderizarGrafico(itensParaVisualizar, todosOsItensParaAnalise);
            }
        });
    }
    document.getElementById('abc-results-container').classList.add('hidden');
    document.getElementById('abc-loading').classList.add('hidden');
    document.getElementById('abc-no-data').classList.add('hidden');
    if(exportButton) exportButton.disabled = true;
    validarLimitesClasseEBotao();
}

function validarLimitesClasseEBotao() {
    if (!inputClasseA || !inputClasseB || !btnGerarABC) return;
    const valA = parseFloat(inputClasseA.value);
    const valB = parseFloat(inputClasseB.value);
    let isValid = true;
    const defaultBorderClasses = ['border-gray-300', 'dark:border-gray-600'];
    const defaultFocusClasses = ['focus:border-primary-DEFAULT', 'focus:ring-primary-DEFAULT'];
    const errorBorderClasses = ['border-red-500', 'dark:border-red-400'];
    const errorFocusClasses = ['focus:border-red-500', 'dark:focus:border-red-400', 'focus:ring-red-500', 'dark:focus:ring-red-400'];

    inputClasseA.classList.remove(...errorBorderClasses, ...errorFocusClasses);
    inputClasseA.classList.add(...defaultBorderClasses, ...defaultFocusClasses);
    inputClasseB.classList.remove(...errorBorderClasses, ...errorFocusClasses);
    inputClasseB.classList.add(...defaultBorderClasses, ...defaultFocusClasses);

    if (isNaN(valA) || valA < 1 || valA > 98) {
        inputClasseA.classList.remove(...defaultBorderClasses, ...defaultFocusClasses);
        inputClasseA.classList.add(...errorBorderClasses, ...errorFocusClasses);
        isValid = false;
    }
    if (isNaN(valB) || valB < 2 || valB > 99) {
        inputClasseB.classList.remove(...defaultBorderClasses, ...defaultFocusClasses);
        inputClasseB.classList.add(...errorBorderClasses, ...errorFocusClasses);
        isValid = false;
    }
    if (!isNaN(valA) && !isNaN(valB) && valA >= valB) {
        inputClasseA.classList.remove(...defaultBorderClasses, ...defaultFocusClasses);
        inputClasseA.classList.add(...errorBorderClasses, ...errorFocusClasses);
        inputClasseB.classList.remove(...defaultBorderClasses, ...defaultFocusClasses);
        inputClasseB.classList.add(...errorBorderClasses, ...errorFocusClasses);
        isValid = false;
    }
    btnGerarABC.disabled = !isValid;
    if (isValid) {
        btnGerarABC.classList.remove('opacity-50', 'cursor-not-allowed');
        btnGerarABC.classList.add('hover:bg-primary-dark');
    } else {
        btnGerarABC.classList.add('opacity-50', 'cursor-not-allowed');
        btnGerarABC.classList.remove('hover:bg-primary-dark');
    }
}

function getItensParaGrafico() {
    if (!selectItensGrafico || !todosOsItensParaAnalise || todosOsItensParaAnalise.length === 0) {
        return todosOsItensParaAnalise ? todosOsItensParaAnalise.slice(0, 25) : [];
    }
    const selecao = selectItensGrafico.value;
    switch (selecao) {
        case 'top10': return todosOsItensParaAnalise.slice(0, 10);
        case 'top25': return todosOsItensParaAnalise.slice(0, 25);
        case 'top50': return todosOsItensParaAnalise.slice(0, 50);
        case 'classeA': return todosOsItensParaAnalise.filter(item => item.classe === 'A');
        case 'classeAB': return todosOsItensParaAnalise.filter(item => item.classe === 'A' || item.classe === 'B');
        case 'todos':
            if (todosOsItensParaAnalise.length > 75) {
                alert("Atenção: Exibir muitos itens pode tornar o gráfico lento e difícil de ler. Mostrando os primeiros 75 itens.");
                return todosOsItensParaAnalise.slice(0, 75);
            }
            return todosOsItensParaAnalise;
        default: return todosOsItensParaAnalise.slice(0, 25);
    }
}

async function gerarAnaliseABC() {
    if (btnGerarABC && btnGerarABC.disabled) {
        alert("Por favor, corrija os parâmetros da análise antes de gerar a curva ABC.");
        return;
    }
    const criterio = document.getElementById('abc-criterio').value;
    const limiteClasseA = parseFloat(inputClasseA.value) / 100;
    const limiteClasseB = parseFloat(inputClasseB.value) / 100;

    if (isNaN(limiteClasseA) || isNaN(limiteClasseB) || limiteClasseA <= 0 || limiteClasseA >= 1 || limiteClasseB <= limiteClasseA || limiteClasseB >= 1) {
        alert("Definições de classe inválidas. A deve ser < B (ex: A=80, B=95), e ambas entre 1 e 99.");
        validarLimitesClasseEBotao(); return;
    }

    document.getElementById('abc-results-container').classList.add('hidden');
    document.getElementById('abc-no-data').classList.add('hidden');
    document.getElementById('abc-loading').classList.remove('hidden');
    document.getElementById('btn-exportar-abc').disabled = true;
    await new Promise(resolve => setTimeout(resolve, 1200));

    let dadosProcessados = pecasSimuladas.map(peca => {
        let valorCriterio = 0;
        const qtdVendidaPeriodo = peca.qtdVendida90d;
        const numPedidosPeriodo = peca.numPedidos90d;
        switch (criterio) {
            case 'valor_total_vendas': valorCriterio = qtdVendidaPeriodo * peca.valorVendaUnitaria; break;
            case 'quantidade_vendida': valorCriterio = qtdVendidaPeriodo; break;
            case 'valor_total_estoque': valorCriterio = peca.estoqueAtual * peca.custoMedio; break;
            case 'margem_lucro_total': valorCriterio = (peca.valorVendaUnitaria - peca.custoMedio) * qtdVendidaPeriodo; break;
            case 'frequencia_saida': valorCriterio = numPedidosPeriodo; break;
        }
        return { ...peca, valorCriterio };
    }).filter(peca => peca.valorCriterio > 0);

    if (dadosProcessados.length === 0) {
        document.getElementById('abc-loading').classList.add('hidden');
        document.getElementById('abc-no-data').classList.remove('hidden');
        return;
    }

    dadosProcessados.sort((a, b) => b.valorCriterio - a.valorCriterio);
    const valorTotalGlobal = dadosProcessados.reduce((sum, item) => sum + item.valorCriterio, 0);
    let acumuladoPercentual = 0;
    todosOsItensParaAnalise = dadosProcessados.map(item => {
        const percentualIndividual = valorTotalGlobal > 0 ? (item.valorCriterio / valorTotalGlobal) : 0;
        acumuladoPercentual += percentualIndividual;
        let classe = 'C';
        const acumuladoAtualConsiderado = Math.min(acumuladoPercentual, 1.0000000001);
        if (acumuladoAtualConsiderado <= limiteClasseA) classe = 'A';
        else if (acumuladoAtualConsiderado <= limiteClasseB) classe = 'B';
        return { ...item, percentualIndividual, acumuladoPercentual: Math.min(acumuladoPercentual, 1), classe };
    });

    renderizarResumo(todosOsItensParaAnalise, valorTotalGlobal);
    const itensParaVisualizarNoGrafico = getItensParaGrafico();
    renderizarGrafico(itensParaVisualizarNoGrafico, todosOsItensParaAnalise);
    renderizarTabela(todosOsItensParaAnalise, criterio);

    document.getElementById('abc-loading').classList.add('hidden');
    document.getElementById('abc-results-container').classList.remove('hidden');
    document.getElementById('btn-exportar-abc').disabled = false;
}

function renderizarResumo(itensClassificados, valorTotalGlobal) {
    const resumo = { A: { itens: 0, valor: 0 }, B: { itens: 0, valor: 0 }, C: { itens: 0, valor: 0 } };
    const totalItensCadastrados = itensClassificados.length;
    itensClassificados.forEach(item => {
        resumo[item.classe].itens++;
        resumo[item.classe].valor += item.valorCriterio;
    });
    for (const classe of ['A', 'B', 'C']) {
        const percValor = valorTotalGlobal > 0 ? (resumo[classe].valor / valorTotalGlobal) * 100 : 0;
        const percItens = totalItensCadastrados > 0 ? (resumo[classe].itens / totalItensCadastrados) * 100 : 0;
        document.getElementById(`resumo-${classe.toLowerCase()}-itens`).textContent = resumo[classe].itens;
        document.getElementById(`resumo-${classe.toLowerCase()}-percentual-valor`).textContent = percValor.toFixed(2);
        document.getElementById(`resumo-${classe.toLowerCase()}-percentual-itens`).textContent = percItens.toFixed(2);
    }
}

function renderizarGrafico(itensParaGraficoNoVisual, todosOsItensClassificados) {
    const canvas = document.getElementById('grafico-curva-abc');
    if (!canvas) { console.error("Elemento canvas #grafico-curva-abc não encontrado."); return; }
    const ctx = canvas.getContext('2d');

    if (graficoCurvaABCInstance) graficoCurvaABCInstance.destroy();

    const criterioSelecionadoValue = document.getElementById('abc-criterio').value;
    const isCurrency = ['valor_total_vendas', 'valor_total_estoque', 'margem_lucro_total'].includes(criterioSelecionadoValue);
    const labels = itensParaGraficoNoVisual.map(item => item.codigo);
    const valores = itensParaGraficoNoVisual.map(item => item.valorCriterio);
    const acumulados = itensParaGraficoNoVisual.map(item => item.acumuladoPercentual * 100);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(100, 116, 139, 0.15)' : 'rgba(203, 213, 225, 0.4)';
    const labelColor = isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(55, 65, 81, 0.8)';
    const barColor = isDarkMode ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.8)';
    const lineColor = isDarkMode ? '#f97316' : '#ea580c';

    graficoCurvaABCInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Valor do Critério', data: valores, backgroundColor: barColor, yAxisID: 'y-valor', order: 2 },
                { label: '% Acumulada', data: acumulados, type: 'line', borderColor: lineColor, backgroundColor: 'transparent', yAxisID: 'y-percentual', tension: 0.1, pointRadius: 2.5, pointBackgroundColor: lineColor, borderWidth: 2.5, order: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            // Adicionando o onClick para interatividade
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const clickedElementIndex = elements[0].index;
                    const itemClicado = itensParaGraficoNoVisual[clickedElementIndex]; // Pega da lista usada para plotar
                    if (itemClicado) {
                        console.log("Item clicado no gráfico:", itemClicado.codigo, itemClicado.descricao);
                        destacarLinhaNaTabelaABC(itemClicado.codigo);
                    }
                }
            },
            scales: {
                'y-valor': { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Valor do Critério', color: labelColor, font: {size: 11} }, ticks: { color: labelColor, font: {size: 10}, callback: value => isCurrency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits:0, maximumFractionDigits:0 }) : value.toLocaleString('pt-BR') }, grid: { color: gridColor } },
                'y-percentual': { type: 'linear', position: 'right', min: 0, max: 100, title: { display: true, text: '% Acumulada', color: labelColor, font: {size: 11} }, ticks: { color: labelColor, font: {size: 10}, callback: value => value.toFixed(0) + '%' }, grid: { drawOnChartArea: false } },
                x: { ticks: { color: labelColor, font: {size: 9}, autoSkipPadding: 15 }, grid: { display: false } }
            },
            plugins: {
                tooltip: {
                    mode: 'index', intersect: false, titleFont: {size: 13}, bodyFont: {size: 12},
                    callbacks: {
                        title: function(tooltipItems) {
                            if (tooltipItems.length > 0) {
                                const dataIndex = tooltipItems[0].dataIndex;
                                const item = itensParaGraficoNoVisual[dataIndex];
                                if (item) return `${item.codigo} - ${item.descricao}`;
                                return tooltipItems[0].label;
                            }
                            return '';
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.dataset.yAxisID === 'y-percentual') label += parseFloat(context.parsed.y).toFixed(2) + '%';
                            else label += isCurrency ? parseFloat(context.parsed.y).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : parseFloat(context.parsed.y).toLocaleString('pt-BR');
                            return label;
                        }
                    }
                },
                legend: { labels: { color: labelColor, font: {size: 11}, boxWidth:15, padding:15 }, position: 'bottom' }
            },
            interaction: { mode: 'index', axis: 'x', intersect: false }
        }
    });
}

// Nova função para destacar e rolar para a linha na tabela
function destacarLinhaNaTabelaABC(codigoPeca) {
    const tbody = document.getElementById('abc-table-body');
    if (!tbody) return;

    // Remove destaque anterior
    tbody.querySelectorAll('tr.ring-2').forEach(row => {
        row.classList.remove('ring-2', 'ring-primary-DEFAULT', 'dark:ring-primary-light', 'transition-all', 'duration-300', 'scale-105');
        row.style.transform = ''; // Reset transform for subsequent highlights
    });

    const linhas = tbody.getElementsByTagName('tr');
    for (let i = 0; i < linhas.length; i++) {
        const celulaCodigo = linhas[i].cells[1]; // A célula do código da peça é a segunda (índice 1)
        if (celulaCodigo && celulaCodigo.textContent === codigoPeca) {
            const linhaAlvo = linhas[i];
            linhaAlvo.classList.add('ring-2', 'ring-primary-DEFAULT', 'dark:ring-primary-light', 'transition-all', 'duration-300');
            
            // Adiciona um pequeno efeito de escala e depois remove para "piscar"
            linhaAlvo.style.transform = 'scale(1.02)';
            setTimeout(() => {
                 if (linhaAlvo.classList.contains('ring-2')) { // Só remove o scale se ainda estiver destacada
                    linhaAlvo.style.transform = 'scale(1)';
                 }
            }, 300);


            // Rolar para a linha
            linhaAlvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
    }
}

function renderizarTabela(itensClassificados, criterioValue) {
    const tbody = document.getElementById('abc-table-body');
    const thValorCriterio = document.getElementById('abc-coluna-valor-criterio');
    if (!tbody || !thValorCriterio) { console.error("Elementos da tabela ABC não encontrados."); return; }
    const criterioNomes = { valor_total_vendas: 'Vlr. Venda (R$)', quantidade_vendida: 'Qtd. Vendida', valor_total_estoque: 'Vlr. Estoque (R$)', margem_lucro_total: 'Margem Total (R$)', frequencia_saida: 'Nº Pedidos' };
    thValorCriterio.textContent = criterioNomes[criterioValue] || 'Valor Critério';
    const isCurrency = ['valor_total_vendas', 'valor_total_estoque', 'margem_lucro_total'].includes(criterioValue);
    tbody.innerHTML = '';
    if (itensClassificados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum item para exibir.</td></tr>`;
        return;
    }
    itensClassificados.forEach(item => {
        let classeBg = '', classeText = '';
        if (item.classe === 'A') { classeBg = 'bg-green-50 dark:bg-green-800/20'; classeText = 'text-green-600 dark:text-green-300 font-semibold'; }
        else if (item.classe === 'B') { classeBg = 'bg-yellow-50 dark:bg-yellow-800/20'; classeText = 'text-yellow-600 dark:text-yellow-300 font-medium'; }
        else { classeBg = 'bg-red-50 dark:bg-red-800/20'; classeText = 'text-red-600 dark:text-red-300'; }
        const tr = document.createElement('tr');
        // Adicionar um ID único à linha para facilitar a seleção, se necessário, embora vamos usar o conteúdo da célula do código
        tr.setAttribute('data-codigo-peca', item.codigo);
        tr.className = `${classeBg} hover:bg-gray-100 dark:hover:bg-gray-700/40`;
        tr.innerHTML = `
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-center ${classeText}">${item.classe}</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.codigo}</td>
            <td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md truncate" title="${item.descricao}">${item.descricao}</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-200">${isCurrency ? item.valorCriterio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : item.valorCriterio.toLocaleString('pt-BR')}</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${(item.percentualIndividual * 100).toFixed(2)}%</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">${(item.acumuladoPercentual * 100).toFixed(2)}%</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.estoqueAtual !== undefined ? item.estoqueAtual.toLocaleString('pt-BR') : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarTabelaABC() {
    const searchTerm = document.getElementById('abc-search-table').value.toLowerCase();
    const tableRows = document.querySelectorAll('#abc-table-body tr');
    let hasVisibleRows = false;
    let firstRowIsPlaceholder = tableRows.length > 0 && tableRows[0].cells.length === 1 && tableRows[0].cells[0].getAttribute('colspan');
    tableRows.forEach(row => {
        if (row.classList.contains('no-results-message') || (row.cells.length === 1 && row.cells[0].getAttribute('colspan'))) {
             // Não esconde a linha de "nenhum resultado" ou placeholder inicial durante a filtragem ativa
            if(!searchTerm) row.style.display = 'none'; // Esconde se a busca for limpa e for placeholder
            return;
        }
        const codigo = row.cells[1]?.textContent.toLowerCase() || '';
        const descricao = row.cells[2]?.textContent.toLowerCase() || '';
        if (codigo.includes(searchTerm) || descricao.includes(searchTerm)) {
            row.style.display = ''; hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });
    const tbody = document.getElementById('abc-table-body');
    let noResultsRow = tbody.querySelector('.no-results-message');
    if (!hasVisibleRows && searchTerm && !firstRowIsPlaceholder) {
        if (!noResultsRow) {
            noResultsRow = tbody.insertRow(); noResultsRow.className = 'no-results-message';
            const cell = noResultsRow.insertCell(); cell.colSpan = 7;
            cell.className = 'text-center p-8 text-gray-500 dark:text-gray-400';
            cell.textContent = 'Nenhum item corresponde à sua busca.';
        }
        noResultsRow.style.display = '';
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }
}

export function exportarAnaliseABC() {
    if (!todosOsItensParaAnalise || todosOsItensParaAnalise.length === 0) {
        alert("Não há dados para exportar. Por favor, gere a análise primeiro."); return;
    }
    const criterioSelect = document.getElementById('abc-criterio');
    const criterioText = criterioSelect.options[criterioSelect.selectedIndex].text;
    const criterioValue = criterioSelect.value;
    const isCurrency = ['valor_total_vendas', 'valor_total_estoque', 'margem_lucro_total'].includes(criterioValue);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Classe;Código Peça;Descrição;\"" + criterioText.replace(/"/g, '""') + "\";% Individual;% Acumulada;Estoque Atual\n";
    todosOsItensParaAnalise.forEach(item => {
        const valorCriterioFormatado = isCurrency ? item.valorCriterio.toLocaleString('pt-BR', {style:'decimal', minimumFractionDigits:2, maximumFractionDigits:2}).replace('.',',') : item.valorCriterio.toString().replace('.',',');
        const percIndFormatado = (item.percentualIndividual * 100).toFixed(2).replace('.',',');
        const percAcumFormatado = (item.acumuladoPercentual * 100).toFixed(2).replace('.',',');
        const estoqueAtualFormatado = item.estoqueAtual !== undefined ? item.estoqueAtual.toString() : '';
        const linha = [item.classe, `"${item.codigo}"`, `"${item.descricao.replace(/"/g, '""')}"`, `"${valorCriterioFormatado}"`, `"${percIndFormatado}%"`, `"${percAcumFormatado}%"`, `"${estoqueAtualFormatado}"`].join(";");
        csvContent += linha + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dataGeracao = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Analise_Curva_ABC_${criterioValue}_${dataGeracao}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    console.log("Análise ABC exportada para CSV.");
}