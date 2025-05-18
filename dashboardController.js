// dashboardController.js
// Data e Hora Atual: 14 de maio de 2025

// Chart.js é carregado globalmente via CDN no index.html, então não precisamos importá-lo aqui como módulo.

let graficoVendasInstance = null;
let graficoTopPecasInstance = null;

// SIMULAÇÃO DE DADOS (substitua por chamadas de API ou dados reais quando disponíveis)
const vendasHojeSimulado = 5370.50;
const itensEstoqueSimulado = 1150;
const baixoEstoqueSimulado = 8;
const garantiasVencendoSimulado = 3;
const ticketMedioMesSimulado = 385.20;
const numPedidosMesSimulado = 78;
const novosClientesMesSimulado = 12;
const pecasCriticasSimulado = baixoEstoqueSimulado + garantiasVencendoSimulado; // Exemplo simples

const ultimasVendasSimuladas = [
    { id: 'PED10031', cliente: 'Expresso Logística', valor: 2870.00, data: '2025-05-13', status: 'Faturado' },
    { id: 'PED10030', cliente: 'Mecânica Ágil', valor: 950.75, data: '2025-05-13', status: 'Pendente' },
    { id: 'PED10029', cliente: 'Transportadora Imperial', valor: 4200.00, data: '2025-05-12', status: 'Faturado' },
    { id: 'PED10028', cliente: 'Oficina Irmãos Silva', valor: 330.20, data: '2025-05-12', status: 'Cancelado' },
];

const pecasBaixoEstoqueSimuladas = [
    { id: 'P00342', descricao: 'Jogo Pastilhas Freio Volvo FH', estoque: 3, min: 5 },
    { id: 'P00555', descricao: 'Lona de Freio Knorr', estoque: 4, min: 10 },
    { id: 'P01010', descricao: 'Farol Dianteiro Iveco Stralis', estoque: 2, min: 3 },
];

/**
 * Inicializa os gráficos, KPIs e outras informações dinâmicas do dashboard.
 */
export function initializeDashboard() {
    console.log("Inicializando Dashboard com gráficos e KPIs...");
    
    carregarKPIsPrincipais();
    carregarDadosGraficoVendas('mesAtual'); // Período padrão ao carregar
    carregarDadosGraficoTopPecas();
    carregarKPIsAdicionais();
    carregarListasResumo();

    const selectPeriodoVendas = document.getElementById('periodo-grafico-vendas');
    if (selectPeriodoVendas) {
        selectPeriodoVendas.addEventListener('change', (event) => {
            console.log("Período do gráfico de vendas alterado para:", event.target.value);
            carregarDadosGraficoVendas(event.target.value); 
        });
    } else {
        console.warn("Elemento select #periodo-grafico-vendas não encontrado.");
    }
}

function carregarKPIsPrincipais() {
    document.getElementById('db-vendas-hoje').textContent = vendasHojeSimulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('db-itens-estoque').textContent = itensEstoqueSimulado.toLocaleString('pt-BR');
    document.getElementById('db-baixo-estoque').textContent = `${baixoEstoqueSimulado} itens`;
    document.getElementById('db-garantias-vencendo').textContent = `${garantiasVencendoSimulado} peças`;
}

function carregarKPIsAdicionais() {
    document.getElementById('kpi-ticket-medio').textContent = ticketMedioMesSimulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('kpi-num-pedidos').textContent = numPedidosMesSimulado.toLocaleString('pt-BR');
    document.getElementById('kpi-novos-clientes').textContent = novosClientesMesSimulado.toLocaleString('pt-BR');
    document.getElementById('kpi-pecas-criticas').textContent = pecasCriticasSimulado.toLocaleString('pt-BR');
}


function getLabelsForPeriod(periodo) {
    const hoje = new Date();
    const labels = [];
    if (periodo === '7d') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoje);
            d.setDate(hoje.getDate() - i);
            labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
    } else if (periodo === '30d') {
         for (let i = 29; i >= 0; i-=7) { // Agrupando por semanas approx.
            const dIni = new Date(hoje);
            dIni.setDate(hoje.getDate() - i -6);
             const dFim = new Date(hoje);
            dFim.setDate(hoje.getDate() - i);
            labels.push(`${dIni.toLocaleDateString('pt-BR', {day:'2-digit'})}-${dFim.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`);
        }
        if (labels.length === 0 && hoje.getDate() < 7) labels.push(`Semana Atual`); // Ajuste para início do mês
    } else if (periodo === 'mesAtual') {
        const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= diasNoMes; i++) {
            labels.push(i.toString());
        }
    } else if (periodo === 'anoAtual') {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 0; i <= hoje.getMonth(); i++) {
            labels.push(meses[i]);
        }
    }
    return labels;
}

function getDadosSimuladosParaPeriodo(numPontos) {
    return Array.from({length: numPontos}, () => Math.floor(Math.random() * 2500) + 300);
}


function carregarDadosGraficoVendas(periodo = 'mesAtual') {
    const labelsVendas = getLabelsForPeriod(periodo);
    const dadosValoresVendas = getDadosSimuladosParaPeriodo(labelsVendas.length);

    const ctxVendas = document.getElementById('graficoVendas')?.getContext('2d');
    if (!ctxVendas) {
        console.error("Elemento canvas #graficoVendas não encontrado.");
        return;
    }

    if (graficoVendasInstance) {
        graficoVendasInstance.destroy();
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)'; // gray-500/20 e gray-300/50
    const labelColor = isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(71, 85, 105, 0.8)'; // gray-300 e gray-600
    const pointColor = isDarkMode ? '#3b82f6' : '#2563eb'; // primary.light ou similar
    const lineColor = isDarkMode ? '#60a5fa' : '#1d4ed8'; // primary.DEFAULT ou similar

    graficoVendasInstance = new Chart(ctxVendas, {
        type: 'line',
        data: {
            labels: labelsVendas,
            datasets: [{
                label: 'Valor de Vendas (R$)',
                data: dadosValoresVendas,
                borderColor: lineColor,
                backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: pointColor,
                pointBorderColor: isDarkMode ? '#1f2937' : '#fff', // gray-800 ou branco
                pointHoverRadius: 7,
                pointHoverBackgroundColor: pointColor,
                pointHoverBorderColor: isDarkMode ? '#111827' : '#fff', // gray-900 ou branco
                pointRadius: 4,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: labelColor,
                        callback: function(value) { return 'R$ ' + value.toLocaleString('pt-BR'); }
                    },
                    grid: { color: gridColor, borderDash: [3, 3] }
                },
                x: {
                    ticks: { color: labelColor },
                    grid: { display: false } // Linhas de grade X podem ser removidas para um visual mais limpo
                }
            },
            plugins: {
                legend: { display: true, labels: { color: labelColor, usePointStyle: true, pointStyle: 'circle' }, align: 'end' },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
                    bodyColor: isDarkMode ? '#d1d5db' : '#374151',
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function carregarDadosGraficoTopPecas() {
    const dadosTopPecas = {
        labels: ['Filtro Óleo XT', 'Pastilha Freio FH', 'Correia MB Actros', 'Farol Stralis', 'Lona Knorr'],
        valores: [12500, 9800, 7500, 6800, 5200] 
    };

    const ctxTopPecas = document.getElementById('graficoTopPecas')?.getContext('2d');
    if (!ctxTopPecas) {
        console.error("Elemento canvas #graficoTopPecas não encontrado.");
        return;
    }

    if (graficoTopPecasInstance) {
        graficoTopPecasInstance.destroy();
    }
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const labelColor = isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(71, 85, 105, 0.8)';
    const chartColors = [
        '#3b82f6', // blue-500
        '#10b981', // green-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#8b5cf6', // violet-500
    ];
    const chartHoverColors = [
        '#2563eb', // blue-600
        '#059669', // green-600
        '#d97706', // amber-600
        '#dc2626', // red-600
        '#7c3aed', // violet-600
    ];


    graficoTopPecasInstance = new Chart(ctxTopPecas, {
        type: 'doughnut',
        data: {
            labels: dadosTopPecas.labels,
            datasets: [{
                label: 'Valor Vendido (R$)',
                data: dadosTopPecas.valores,
                backgroundColor: chartColors,
                hoverBackgroundColor: chartHoverColors,
                borderColor: isDarkMode ? '#1f2937' : '#fff', // gray-800 ou branco
                borderWidth: 2,
                hoverBorderColor: isDarkMode ? '#374151' : '#f3f4f6', // gray-700 ou gray-100
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%', // Para gráfico de rosca
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { color: labelColor, boxWidth: 12, padding: 15, font: {size: 10} }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
                    bodyColor: isDarkMode ? '#d1d5db' : '#374151',
                    borderColor: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            }
        }
    });
}

function carregarListasResumo() {
    const ultimasVendasContainer = document.getElementById('db-ultimas-vendas-lista');
    if (ultimasVendasContainer) {
        ultimasVendasContainer.innerHTML = ''; // Limpa placeholder
        if (ultimasVendasSimuladas.length > 0) {
            ultimasVendasSimuladas.slice(0, 5).forEach(venda => { // Pega as 5 mais recentes
                const vendaEl = document.createElement('div');
                vendaEl.className = 'text-xs border-b dark:border-gray-700 pb-2 mb-2 last:border-b-0 last:mb-0';
                let statusClass = 'text-yellow-600 dark:text-yellow-400';
                if (venda.status === 'Faturado' || venda.status === 'Pago') statusClass = 'text-green-600 dark:text-green-400';
                else if (venda.status === 'Cancelado') statusClass = 'text-red-600 dark:text-red-400 line-through';

                vendaEl.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="font-semibold text-gray-700 dark:text-gray-200">${venda.id} - ${venda.cliente}</span>
                        <span class="${statusClass} font-medium">${venda.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                    <div class="text-gray-500 dark:text-gray-400">${new Date(venda.data).toLocaleDateString('pt-BR')} - <span class="${statusClass}">${venda.status}</span></div>
                `;
                ultimasVendasContainer.appendChild(vendaEl);
            });
        } else {
            ultimasVendasContainer.innerHTML = '<p class="text-sm text-center text-gray-400 dark:text-gray-500 py-4">Nenhuma venda recente.</p>';
        }
    }

    const baixoEstoqueContainer = document.getElementById('db-pecas-baixo-estoque-lista');
    if (baixoEstoqueContainer) {
        baixoEstoqueContainer.innerHTML = ''; // Limpa placeholder
        if (pecasBaixoEstoqueSimuladas.length > 0) {
             pecasBaixoEstoqueSimuladas.slice(0, 5).forEach(peca => {
                const pecaEl = document.createElement('div');
                pecaEl.className = 'text-xs flex justify-between items-center border-b dark:border-gray-700 pb-1 mb-1 last:border-b-0 last:mb-0';
                pecaEl.innerHTML = `
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-200">${peca.id} - ${peca.descricao}</span>
                    </div>
                    <span class="font-semibold text-red-600 dark:text-red-400">${peca.estoque} <span class="text-gray-400 dark:text-gray-500 text-xxs">/min ${peca.min}</span></span>
                `;
                baixoEstoqueContainer.appendChild(pecaEl);
            });
        } else {
             baixoEstoqueContainer.innerHTML = '<p class="text-sm text-center text-gray-400 dark:text-gray-500 py-4">Nenhuma peça com baixo estoque.</p>';
        }
    }
}