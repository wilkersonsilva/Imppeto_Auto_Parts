// rhPontoController.js
// Responsável pela lógica da aba "Controle de Ponto"
// Data e Hora Atual: 18 de maio de 2025

import { openModal, closeModal } from '../uiUtils.js'; // Ajuste o caminho se necessário
import { getListaFuncionariosSimulados } from './rhFuncionariosController.js'; // Ajuste o caminho

// Estrutura simulada para registros de ponto.
// Em um sistema real, isso viria do banco de dados.
// Cada entrada representa um dia de trabalho ou uma ocorrência.
let registrosPontoSimulados = [
    { id: 'ponto001', funcionarioId: 'func-001', data: '2025-05-01', entrada1: '08:00', saida1: '12:00', entrada2: '13:00', saida2: '17:30', ocorrencia: '', hrsTrab: 8.5, hrsExtras: 0.5, atrasoFalta: 0 },
    { id: 'ponto002', funcionarioId: 'func-001', data: '2025-05-02', entrada1: '08:15', saida1: '12:05', entrada2: '13:00', saida2: '17:30', ocorrencia: 'Atraso 15min', hrsTrab: 8.33, hrsExtras: 0.33, atrasoFalta: 0.25 }, // 0.25h = 15min
    { id: 'ponto003', funcionarioId: 'func-001', data: '2025-05-03', tipoOcorrencia: 'falta_justificada', ocorrencia: 'Atestado Médico', hrsTrab: 0, hrsExtras: 0, atrasoFalta: 8 }, // Dia de falta
    { id: 'ponto004', funcionarioId: 'func-002', data: '2025-05-01', entrada1: '09:00', saida1: '12:00', entrada2: '13:00', saida2: '18:00', ocorrencia: '', hrsTrab: 8, hrsExtras: 0, atrasoFalta: 0 },
    { id: 'ponto005', funcionarioId: 'func-002', data: '2025-05-02', entrada1: '09:00', saida1: '12:00', entrada2: '13:00', saida2: '19:00', ocorrencia: 'Hora Extra Manual', hrsTrab: 9, hrsExtras: 1, atrasoFalta: 0 },
];
let editandoOcorrenciaId = null;

/**
 * Inicializa a aba de Controle de Ponto.
 */
export function initializePontoTab() {
    console.log("Aba Controle de Ponto inicializada.");
    popularFiltroFuncionariosPonto();
    setDefaultPeriodoPonto();

    const btnVisualizar = document.querySelector('#ponto-tab-content-container button[onclick="carregarEspelhoDePonto()"]');
    if(btnVisualizar) btnVisualizar.disabled = false; // Habilita se estava desabilitado
    
    // Limpa a tabela ao inicializar a aba
    const tbody = document.getElementById('table-body-espelho-ponto');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9" class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">Selecione o funcionário e o período para visualizar o espelho de ponto.</td></tr>`;
    }
    document.getElementById('espelho-ponto-display-area').classList.add('hidden');
}

function setDefaultPeriodoPonto() {
    const periodoInput = document.getElementById('ponto-filtro-periodo');
    if(periodoInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        periodoInput.value = `${ano}-${mes}`;
    }
}

function popularFiltroFuncionariosPonto() {
    const selectEl = document.getElementById('ponto-filtro-funcionario');
    const funcionarios = getListaFuncionariosSimulados();
    if (!selectEl || !funcionarios) {
        console.warn("Select de funcionários para filtro de ponto ou lista de funcionários não disponível.");
        return;
    }

    selectEl.innerHTML = '<option value="">Selecione...</option>';
    funcionarios
        .filter(f => f.statusAtivo)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(func => {
            const option = document.createElement('option');
            option.value = func.id;
            option.textContent = `${func.nome} (Mat: ${func.matricula})`;
            selectEl.appendChild(option);
        });
}

export function carregarEspelhoDePonto() {
    const funcionarioId = document.getElementById('ponto-filtro-funcionario')?.value;
    const periodo = document.getElementById('ponto-filtro-periodo')?.value; // YYYY-MM

    if (!funcionarioId) {
        alert("Por favor, selecione um funcionário.");
        return;
    }
    if (!periodo) {
        alert("Por favor, selecione o mês/ano de competência.");
        return;
    }

    const funcionario = getListaFuncionariosSimulados().find(f => f.id === funcionarioId);
    if (!funcionario) {
        alert("Funcionário não encontrado.");
        return;
    }

    document.getElementById('espelho-ponto-nome-funcionario').textContent = funcionario.nome;
    const [ano, mes] = periodo.split('-');
    document.getElementById('espelho-ponto-mes-referencia').textContent = `${mes}/${ano}`;

    // Simulação: Filtra os registros de ponto para o funcionário e período
    const registrosDoPeriodo = registrosPontoSimulados.filter(r =>
        r.funcionarioId === funcionarioId &&
        r.data.startsWith(periodo)
    );

    renderizarEspelhoDePonto(registrosDoPeriodo, periodo);
    document.getElementById('espelho-ponto-display-area').classList.remove('hidden');
}

function calcularHoras(entrada, saida) {
    if (!entrada || !saida) return 0;
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = saida.split(':').map(Number);
    const inicio = new Date(0, 0, 0, h1, m1, 0);
    const fim = new Date(0, 0, 0, h2, m2, 0);
    let diff = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60); // Diferença em horas
    if (diff < 0) diff += 24; // Caso de virada de dia (improvável para um turno, mas para garantir)
    return parseFloat(diff.toFixed(2));
}

function formatarHoras(totalHorasDecimal) {
    if (isNaN(totalHorasDecimal) || totalHorasDecimal === 0) return "00:00";
    const horas = Math.floor(totalHorasDecimal);
    const minutos = Math.round((totalHorasDecimal - horas) * 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}


function renderizarEspelhoDePonto(registros, periodoYYYYMM) {
    const tbody = document.getElementById('table-body-espelho-ponto');
    if (!tbody) return;
    tbody.innerHTML = '';

    const [ano, mes] = periodoYYYYMM.split('-').map(Number);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    let totalHorasTrabalhadasMes = 0;
    let totalHorasExtrasMes = 0;
    // Saldo banco de horas é mais complexo, precisaria de histórico e regras. Simulação simples:
    let saldoBancoHoras = parseFloat((Math.random() * 20 - 10).toFixed(2)); // Saldo aleatório entre -10 e +10

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtual = `${periodoYYYYMM}-${String(dia).padStart(2, '0')}`;
        const registroDoDia = registros.find(r => r.data === dataAtual);
        const dataObj = new Date(dataAtual + "T00:00:00"); // Para pegar o dia da semana
        const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        const tr = document.createElement('tr');
        let hrsTrabDia = 0;
        let hrsExtrasDia = 0;

        if (registroDoDia) {
            const trabTurno1 = calcularHoras(registroDoDia.entrada1, registroDoDia.saida1);
            const trabTurno2 = calcularHoras(registroDoDia.entrada2, registroDoDia.saida2);
            hrsTrabDia = trabTurno1 + trabTurno2;

            // Simulação simples de horas extras (acima de 8h dia)
            if(hrsTrabDia > 8 && !registroDoDia.tipoOcorrencia?.includes('falta')) { // Não calcula HE em dia de falta
                hrsExtrasDia = hrsTrabDia - 8;
                hrsTrabDia = 8; // Limita horas trabalhadas normais a 8
            }
             // Se já houver hrsExtras no registro (ex: lançamento manual), usa ele.
            if (registroDoDia.hrsExtras && registroDoDia.hrsExtras > hrsExtrasDia) {
                hrsExtrasDia = registroDoDia.hrsExtras;
            }


            totalHorasTrabalhadasMes += hrsTrabDia;
            totalHorasExtrasMes += hrsExtrasDia;
            saldoBancoHoras += hrsExtrasDia - (registroDoDia.atrasoFalta || 0);


            tr.innerHTML = `
                <td class="px-2 py-1.5 text-center">${String(dia).padStart(2, '0')} <span class="text-gray-400 text-xxs">${diaSemana}</span></td>
                <td class="px-2 py-1.5 text-center">${registroDoDia.entrada1 || '--:--'}</td>
                <td class="px-2 py-1.5 text-center">${registroDoDia.saida1 || '--:--'}</td>
                <td class="px-2 py-1.5 text-center">${registroDoDia.entrada2 || '--:--'}</td>
                <td class="px-2 py-1.5 text-center">${registroDoDia.saida2 || '--:--'}</td>
                <td class="px-2 py-1.5 text-center font-medium">${formatarHoras(hrsTrabDia)}</td>
                <td class="px-2 py-1.5 text-center text-green-600 dark:text-green-400">${formatarHoras(hrsExtrasDia)}</td>
                <td class="px-2 py-1.5 text-center text-red-600 dark:text-red-400">${formatarHoras(registroDoDia.atrasoFalta || 0)}</td>
                <td class="px-2 py-1.5 text-left text-gray-500 dark:text-gray-400">${registroDoDia.ocorrencia || ''}</td>
            `;
        } else {
            // Dia sem registro (pode ser fim de semana ou falta não registrada)
            tr.innerHTML = `
                <td class="px-2 py-1.5 text-center">${String(dia).padStart(2, '0')} <span class="text-gray-400 text-xxs">${diaSemana}</span></td>
                <td class="px-2 py-1.5 text-center text-gray-400">--:--</td>
                <td class="px-2 py-1.5 text-center text-gray-400">--:--</td>
                <td class="px-2 py-1.5 text-center text-gray-400">--:--</td>
                <td class="px-2 py-1.5 text-center text-gray-400">--:--</td>
                <td class="px-2 py-1.5 text-center text-gray-400">00:00</td>
                <td class="px-2 py-1.5 text-center text-gray-400">00:00</td>
                <td class="px-2 py-1.5 text-center text-gray-400">00:00</td>
                <td class="px-2 py-1.5 text-left text-gray-400">${(diaSemana.startsWith('sáb') || diaSemana.startsWith('dom')) ? 'DSR' : ''}</td>
            `;
            if (diaSemana.startsWith('sáb') || diaSemana.startsWith('dom')) {
                tr.classList.add('bg-gray-50', 'dark:bg-gray-700/30');
            }
        }
        tbody.appendChild(tr);
    }
    document.getElementById('ponto-total-horas-trabalhadas').textContent = formatarHoras(totalHorasTrabalhadasMes);
    document.getElementById('ponto-total-horas-extras').textContent = formatarHoras(totalHorasExtrasMes);
    document.getElementById('ponto-saldo-banco-horas').textContent = formatarHoras(saldoBancoHoras);
}


export async function openModalNovaOcorrenciaPonto() {
    editandoOcorrenciaId = null;
    const htmlModalOcorrencia = await carregarHtmlModal('_rh_modal_ponto_ocorrencia.html');
    if (!htmlModalOcorrencia) return;

    const actualFormId = 'actual-form-ponto-ocorrencia';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlModalOcorrencia;
    const formClone = tempDiv.querySelector(`#${actualFormId}`);
    
    formClone.reset();
    formClone.elements['ocorrencia-id'].value = '';
    if (formClone.elements['ocorrencia-data']) formClone.elements['ocorrencia-data'].valueAsDate = new Date();

    const selectFuncEl = formClone.elements['ocorrencia-funcionario'];
    popularSelectFuncionariosFolha(selectFuncEl); // Reutiliza para popular o select

    openModal('Registrar Ocorrência/Ajuste de Ponto', tempDiv.innerHTML, {
        iconClass: 'fas fa-user-clock text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-lg',
        confirmText: 'Salvar Ocorrência',
        onConfirm: () => salvarOcorrenciaPonto()
    });
}

export function salvarOcorrenciaPonto() {
    const formElement = document.querySelector(`#modal-content-area #actual-form-ponto-ocorrencia`);
    if (!formElement) { console.error('Formulário de ocorrência de ponto não encontrado.'); return; }

    if (!formElement.checkValidity()) {
        formElement.reportValidity();
        return;
    }

    const funcionarioId = formElement.elements['ocorrencia-funcionario'].value;
    const dataOcorrencia = formElement.elements['ocorrencia-data'].value;
    const tipoOcorrencia = formElement.elements['ocorrencia-tipo'].value;
    const horario = formElement.elements['ocorrencia-horario'].value;
    const duracaoHoras = parseFloat(formElement.elements['ocorrencia-duracao_horas'].value) || 0;
    const justificativa = formElement.elements['ocorrencia-justificativa'].value;

    // Simulação de como isso afetaria o registro de ponto do dia
    // (Idealmente, você teria uma entrada para cada marcação: E1, S1, E2, S2)
    // Esta é uma simplificação para registrar uma "ocorrência" geral para o dia.
    
    let registroDia = registrosPontoSimulados.find(r => r.funcionarioId === funcionarioId && r.data === dataOcorrencia);

    if (!registroDia) { // Se não houver registro para o dia, cria um básico
        registroDia = { 
            id: `ponto${Date.now()}`, 
            funcionarioId: funcionarioId, 
            data: dataOcorrencia, 
            ocorrencia: '', 
            hrsTrab: 0, 
            hrsExtras: 0, 
            atrasoFalta: 0 
        };
        registrosPontoSimulados.push(registroDia);
    }
    
    // Atualiza o registro do dia com base na ocorrência
    registroDia.tipoOcorrencia = tipoOcorrencia; // Adiciona o tipo para referência
    registroDia.ocorrencia = `${tipoOcorrencia.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}: ${justificativa}`;
    
    if (tipoOcorrencia.startsWith('ajuste_')) {
        const campo = tipoOcorrencia.replace('ajuste_', ''); // entrada1, saida1, etc.
        registroDia[campo] = horario;
    } else if (tipoOcorrencia === 'hora_extra_manual' && duracaoHoras > 0) {
        registroDia.hrsExtras = (registroDia.hrsExtras || 0) + duracaoHoras;
        registroDia.ocorrencia += ` (${formatarHoras(duracaoHoras)})`;
    } else if (tipoOcorrencia.includes('falta') || tipoOcorrencia === 'declaracao_horas' || tipoOcorrencia === 'outro_abono') {
        // Para faltas ou abonos de dia inteiro/parcial
        if (tipoOcorrencia.includes('falta')) {
             registroDia.atrasoFalta = 8; // Simula 8h de falta
             registroDia.hrsTrab = 0;
             registroDia.entrada1 = registroDia.saida1 = registroDia.entrada2 = registroDia.saida2 = 'Ausente';
        } else if (duracaoHoras > 0) { // Abono de horas
            // Lógica para abater de atrasoFalta ou adicionar como trabalhada (complexo sem batidas reais)
            registroDia.ocorrencia += ` (${formatarHoras(duracaoHoras)} abonadas)`;
        }
    } else if (tipoOcorrencia === 'atraso' && horario) {
        // Simula que a entrada1 foi 'horario'
        registroDia.entrada1 = horario;
        // recalcular atrasoFalta...
    } else if (tipoOcorrencia === 'saida_antecipada' && horario) {
        // Simula que a saida2 foi 'horario'
        registroDia.saida2 = horario;
        // recalcular atrasoFalta...
    }


    console.log("Salvando ocorrência de ponto:", registroDia);
    alert("Ocorrência/ajuste de ponto registrado com sucesso! (simulação)");
    closeModal();
    
    // Recarrega o espelho de ponto se o funcionário e período da ocorrência correspondem aos filtros atuais
    const filtroFuncId = document.getElementById('ponto-filtro-funcionario')?.value;
    const filtroPeriodo = document.getElementById('ponto-filtro-periodo')?.value;
    if (funcionarioId === filtroFuncId && dataOcorrencia.startsWith(filtroPeriodo)) {
        carregarEspelhoDePonto();
    }
}

export function exportarEspelhoPonto(){
    if(!holeriteAtual || !holeriteAtual.funcionarioId) { // Reutilizando holeriteAtual para saber quem e qual periodo
        alert("Gere um espelho de ponto primeiro para poder exportar.");
        return;
    }
    alert(`Funcionalidade "Exportar Espelho de Ponto" para ${holeriteAtual.nomeFuncionario} (${holeriteAtual.mesCompetencia}) a ser implementada.`);
}