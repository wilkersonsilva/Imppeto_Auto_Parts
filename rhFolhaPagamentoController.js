// rhFolhaPagamentoController.js
// Responsável pela lógica da aba "Folha de Pagamento"
// Data e Hora Atual: 18 de maio de 2025

import { openModal, closeModal } from '../uiUtils.js'; // Ajuste o caminho se necessário

// Dados simulados que seriam compartilhados ou viriam de um serviço/estado global
// Para esta simulação, vamos copiar a lista de funcionários aqui, mas o ideal seria importá-la
// ou ter uma forma de acessá-la globalmente de forma segura.
// Esta é uma simplificação para o exemplo.
let listaFuncionariosSimulados = []; // Será populada por uma função externa ou estado global

// Pega a lista de funcionários do rhFuncionariosController (simulação de acesso a dados compartilhados)
// Esta é uma forma de SIMULAR o acesso. Em um projeto real, você usaria um gerenciador de estado ou serviços.
async function carregarListaFuncionariosParaFolha() {
    try {
        const funcModule = await import('./rhFuncionariosController.js'); // Ajuste o caminho
        if (funcModule && funcModule.getListaFuncionariosSimulados) {
            listaFuncionariosSimulados = funcModule.getListaFuncionariosSimulados();
        } else {
            console.warn("Não foi possível carregar lista de funcionários para a folha de pagamento.");
            // Usar uma lista placeholder se falhar
            listaFuncionariosSimulados = [
                {id: 'temp-func-1', nome: 'Funcionário A (Fallback)', matricula: 'F001', salario: 3000, statusAtivo: true},
                {id: 'temp-func-2', nome: 'Funcionário B (Fallback)', matricula: 'F002', salario: 4000, statusAtivo: true}
            ];
        }
    } catch (e) {
        console.error("Erro ao carregar lista de funcionários dinamicamente:", e);
        listaFuncionariosSimulados = [
            {id: 'temp-func-1', nome: 'Funcionário A (Erro ao carregar)', matricula: 'F001', salario: 3000, statusAtivo: true}
        ];
    }
}


let historicoPagamentosFolha = [
    // Exemplo: { id: 'folha-001-2025-04', competencia: '2025-04', funcionarioId: 'func-001', nomeFuncionario: 'Ana Silva Costa', valorLiquido: 4850.75, dataPagamento: '2025-05-05', status: 'Pago' }
];
let holeriteAtual = null;

/**
 * Inicializa a aba de Folha de Pagamento.
 */
export async function initializeFolhaPagamentoTab() {
    console.log("Aba Folha de Pagamento inicializada.");
    await carregarListaFuncionariosParaFolha(); // Carrega a lista de funcionários

    const selectFuncionario = document.getElementById('folha-funcionario');
    const mesCompetenciaInput = document.getElementById('folha-mes-competencia');
    const holeriteDisplayArea = document.getElementById('holerite-display-area');


    if (selectFuncionario) {
        popularSelectFuncionariosFolha(selectFuncionario);
    }

    if (mesCompetenciaInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        mesCompetenciaInput.value = `${ano}-${mes}`;
    }
    if(holeriteDisplayArea) holeriteDisplayArea.classList.add('hidden'); // Garante que começa escondido

    carregarHistoricoPagamentosFolha();
}

function popularSelectFuncionariosFolha(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Selecione um funcionário...</option>';
    listaFuncionariosSimulados
        .filter(f => f.statusAtivo)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(func => {
            const option = document.createElement('option');
            option.value = func.id;
            option.textContent = `${func.nome} (Mat: ${func.matricula})`;
            selectEl.appendChild(option);
        });
}

export function calcularVisualizarFolha() {
    const funcionarioId = document.getElementById('folha-funcionario').value;
    const mesCompetencia = document.getElementById('folha-mes-competencia').value;

    if (!funcionarioId) {
        alert("Por favor, selecione um funcionário."); return;
    }
    if (!mesCompetencia) {
        alert("Por favor, selecione o mês de competência."); return;
    }

    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    if (!funcionario) {
        alert("Funcionário não encontrado. A lista de funcionários pode não ter sido carregada corretamente."); return;
    }

    console.log(`Gerando holerite para ${funcionario.nome}, competência: ${mesCompetencia}`);

    const salarioBase = funcionario.salario || 0;
    let proventos = [];
    let descontos = [];
    let totalProventos = 0;
    let totalDescontos = 0;

    proventos.push({ descricao: 'Salário Base', referencia: '30d', valor: salarioBase });
    totalProventos += salarioBase;

    const valorHora = salarioBase / 220;
    const horasExtras = Math.floor(Math.random() * 21); // 0 a 20 horas extras simuladas
    const valorHorasExtras = parseFloat((horasExtras * valorHora * 1.5).toFixed(2));
    if (valorHorasExtras > 0) {
        proventos.push({ descricao: 'Horas Extras (50%)', referencia: `${horasExtras}h`, valor: valorHorasExtras });
        totalProventos += valorHorasExtras;
    }

    const dsrSobreHE = parseFloat((valorHorasExtras / 6).toFixed(2));
     if (dsrSobreHE > 0) {
        proventos.push({ descricao: 'D.S.R. sobre H.E.', referencia: '-', valor: dsrSobreHE });
        totalProventos += dsrSobreHE;
    }
    
    // Simular comissões (exemplo, 5% do salário base)
    if (funcionario.departamento === 'vendas') {
        const comissaoExemplo = parseFloat((salarioBase * 0.05).toFixed(2));
        proventos.push({ descricao: 'Comissões Vendas', referencia: '5%', valor: comissaoExemplo });
        totalProventos += comissaoExemplo;
    }


    const adiantamento = parseFloat((salarioBase * 0.40).toFixed(2));
    if (adiantamento > 0) {
        descontos.push({ descricao: 'Adiantamento Salarial', referencia: '40%', valor: adiantamento });
        totalDescontos += adiantamento;
    }

    let inss = 0;
    const proventosParaINSS = totalProventos; // Considerar todos os proventos que incidem INSS
    if (proventosParaINSS <= 1412.00) inss = proventosParaINSS * 0.075;
    else if (proventosParaINSS <= 2666.68) inss = proventosParaINSS * 0.09;
    else if (proventosParaINSS <= 4000.03) inss = proventosParaINSS * 0.12;
    else if (proventosParaINSS <= 7786.02) inss = proventosParaINSS * 0.14; // Teto INSS 2024 (exemplo)
    else inss = 7786.02 * 0.14; // Valor sobre o teto
    inss = parseFloat(inss.toFixed(2));
    if (inss > 0) {
        descontos.push({ descricao: 'INSS', referencia: `${(inss/proventosParaINSS*100).toFixed(2)}%`, valor: inss });
        totalDescontos += inss;
    }

    const numDependentes = funcionario.dependentes ? funcionario.dependentes.length : 0;
    const deducaoPorDependenteIRRF = 189.59;
    const baseCalculoIRRF = proventosParaINSS - inss - (numDependentes * deducaoPorDependenteIRRF);
    let irrf = 0;
    if (baseCalculoIRRF > 4664.68) irrf = (baseCalculoIRRF * 0.275) - 896.00; // Parcela a deduzir 2024 (exemplo)
    else if (baseCalculoIRRF > 3751.05) irrf = (baseCalculoIRRF * 0.225) - 662.77;
    else if (baseCalculoIRRF > 2826.65) irrf = (baseCalculoIRRF * 0.15) - 381.44;
    else if (baseCalculoIRRF > 2259.20) irrf = (baseCalculoIRRF * 0.075) - 169.44; // Faixa isenta até 2259.20 para 2024 (exemplo)
    
    irrf = parseFloat(Math.max(0, irrf).toFixed(2));
    if (irrf > 0) {
        descontos.push({ descricao: 'IRRF', referencia: '-', valor: irrf });
        totalDescontos += irrf;
    }

    const valorLiquido = parseFloat((totalProventos - totalDescontos).toFixed(2));

    holeriteAtual = {
        id: `folha-${funcionario.id}-${mesCompetencia.replace('-', '')}`,
        funcionarioId: funcionario.id,
        nomeFuncionario: funcionario.nome,
        matricula: funcionario.matricula,
        cargo: funcionario.cargo,
        departamento: funcionario.departamento,
        cpf: funcionario.cpf,
        dataAdmissao: funcionario.dataAdmissao ? new Date(funcionario.dataAdmissao + "T00:00:00").toLocaleDateString('pt-BR') : '-',
        mesCompetencia: mesCompetencia,
        salarioBaseContratual: funcionario.salario,
        proventos: proventos,
        descontos: descontos,
        totalProventos: parseFloat(totalProventos.toFixed(2)),
        totalDescontos: parseFloat(totalDescontos.toFixed(2)),
        valorLiquido: valorLiquido,
        dataGeracao: new Date().toISOString()
    };

    renderizarHolerite(holeriteAtual);
    const displayArea = document.getElementById('holerite-display-area');
    if (displayArea) displayArea.classList.remove('hidden');
}

function renderizarHolerite(data) {
    if (!data) return;
    document.getElementById('holerite-nome-funcionario').textContent = data.nomeFuncionario;
    const [ano, mes] = data.mesCompetencia.split('-');
    document.getElementById('holerite-mes-referencia').textContent = `${mes}/${ano}`;
    document.getElementById('holerite-matricula').textContent = data.matricula || '-';
    document.getElementById('holerite-cargo').textContent = data.cargo || '-';
    document.getElementById('holerite-departamento').textContent = data.departamento ? data.departamento.charAt(0).toUpperCase() + data.departamento.slice(1) : '-';
    document.getElementById('holerite-cpf').textContent = data.cpf || '-';
    document.getElementById('holerite-data-admissao').textContent = data.dataAdmissao;
    document.getElementById('holerite-salario-base').textContent = data.salarioBaseContratual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const proventosTbody = document.getElementById('holerite-proventos-tbody');
    proventosTbody.innerHTML = '';
    data.proventos.forEach(p => {
        proventosTbody.innerHTML += `<tr>
            <td class="px-2 py-1">${p.descricao}</td>
            <td class="px-2 py-1 text-right">${p.referencia}</td>
            <td class="px-2 py-1 text-right text-green-600 dark:text-green-400">${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>`;
    });

    const descontosTbody = document.getElementById('holerite-descontos-tbody');
    descontosTbody.innerHTML = '';
    data.descontos.forEach(d => {
        descontosTbody.innerHTML += `<tr>
            <td class="px-2 py-1">${d.descricao}</td>
            <td class="px-2 py-1 text-right">${d.referencia}</td>
            <td class="px-2 py-1 text-right text-red-600 dark:text-red-400">${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>`;
    });

    document.getElementById('holerite-total-proventos').textContent = data.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('holerite-total-descontos').textContent = data.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('holerite-liquido-receber').textContent = data.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function registrarPagamentoFolha() {
    if (!holeriteAtual) {
        alert("Nenhum holerite gerado para registrar o pagamento.");
        return;
    }
    if (historicoPagamentosFolha.some(h => h.id === holeriteAtual.id)) {
        alert(`O pagamento para ${holeriteAtual.nomeFuncionario} referente a ${holeriteAtual.mesCompetencia.split('-')[1]}/${holeriteAtual.mesCompetencia.split('-')[0]} já foi registrado.`);
        return;
    }

    const dataPagamento = new Date().toISOString().split('T')[0];

    if (confirm(`Confirmar pagamento de ${holeriteAtual.valorLiquido.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})} para ${holeriteAtual.nomeFuncionario} (Competência: ${holeriteAtual.mesCompetencia.split('-')[1]}/${holeriteAtual.mesCompetencia.split('-')[0]}) na data de ${new Date(dataPagamento + "T00:00:00").toLocaleDateString('pt-BR')}?`)) {
        const pagamentoRegistrado = {
            ...holeriteAtual,
            dataPagamento: dataPagamento,
            status: 'Pago'
        };
        historicoPagamentosFolha.push(pagamentoRegistrado);
        alert("Pagamento registrado com sucesso! (simulação)");
        console.log("Pagamento registrado:", pagamentoRegistrado);
        holeriteAtual = null;
        document.getElementById('holerite-display-area').classList.add('hidden');
        carregarHistoricoPagamentosFolha();
    }
}

function carregarHistoricoPagamentosFolha() {
    const tbody = document.getElementById('table-body-historico-folha');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (historicoPagamentosFolha.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum histórico de pagamento encontrado.</td></tr>`;
        return;
    }

    const historicoOrdenado = [...historicoPagamentosFolha].sort((a,b) => {
        if (b.mesCompetencia < a.mesCompetencia) return -1;
        if (b.mesCompetencia > a.mesCompetencia) return 1;
        return a.nomeFuncionario.localeCompare(b.nomeFuncionario);
    });

    historicoOrdenado.forEach(h => {
        const [ano, mes] = h.mesCompetencia.split('-');
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
        tr.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${mes}/${ano}</td>
            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${h.nomeFuncionario}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-700 dark:text-gray-200">${h.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${new Date(h.dataPagamento + "T00:00:00").toLocaleDateString('pt-BR')}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    ${h.status}
                </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                <button onclick="visualizarHoleriteDetalhado('${h.id}')" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="Visualizar Holerite Detalhado"><i class="fas fa-search-dollar fa-fw"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function imprimirHolerite() {
    if (!holeriteAtual) {
        alert("Nenhum holerite gerado para impressão.");
        return;
    }
    alert(`Simulando impressão do holerite para ${holeriteAtual.nomeFuncionario} - ${holeriteAtual.mesCompetencia.split('-')[1]}/${holeriteAtual.mesCompetencia.split('-')[0]}. (Funcionalidade de geração de PDF a ser implementada)`);
}

export function visualizarHoleriteDetalhado(holeriteId) {
     const holerite = historicoPagamentosFolha.find(h => h.id === holeriteId);
    if (!holerite) {
        alert("Holerite não encontrado no histórico.");
        return;
    }
    alert(`Simulando visualização detalhada do holerite ID ${holeriteId} para ${holerite.nomeFuncionario}. (Funcionalidade de modal/PDF a ser implementada)`);
}

// Adicionando a função de exportação para o rhFuncionariosController poder acessá-la
export function getListaFuncionariosSimulados() {
    return listaFuncionariosSimulados;
}