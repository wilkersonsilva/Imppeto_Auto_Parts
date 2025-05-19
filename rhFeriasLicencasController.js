// rhFeriasLicencasController.js
// Responsável pela lógica da aba "Férias e Licenças"
// Data e Hora Atual: 18 de maio de 2025

import { openModal, closeModal } from '../uiUtils.js'; // Ajuste o caminho se necessário
// Para carregar lista de funcionários
import { getListaFuncionariosSimulados } from './rhFuncionariosController.js'; // Ajuste o caminho

let listaFeriasLicencasSimuladas = [
    { id: 'fl001', funcionarioId: 'func-001', nomeFuncionario: 'Ana Silva Costa', tipo: 'ferias', dataInicio: '2025-06-01', dataFim: '2025-06-30', dias: 30, status: 'aprovada', observacoes: 'Férias programadas anuais.' },
    { id: 'fl002', funcionarioId: 'func-002', nomeFuncionario: 'Bruno Oliveira Lima', tipo: 'licenca_medica', dataInicio: '2025-05-10', dataFim: '2025-05-15', dias: 6, status: 'concluida', observacoes: 'Atestado médico CID Z00.0' },
    { id: 'fl003', funcionarioId: 'func-001', nomeFuncionario: 'Ana Silva Costa', tipo: 'licenca_maternidade', dataInicio: '2024-01-15', dataFim: '2024-07-14', dias: 180, status: 'concluida', observacoes: 'Licença maternidade referente a Lucas.' },
];
let editandoFLId = null; // Para saber se está editando ou criando uma nova solicitação

/**
 * Inicializa a aba de Férias e Licenças.
 */
export function initializeFeriasLicencasTab() {
    console.log("Aba Férias e Licenças inicializada.");
    popularFiltroFuncionariosFerias();
    setDefaultDateFilters(); // Define datas padrão para filtros
    
    const filtroFuncionarioEl = document.getElementById('ferias-filtro-funcionario');
    const filtroTipoEl = document.getElementById('ferias-filtro-tipo');
    const filtroStatusEl = document.getElementById('ferias-filtro-status');
    const filtroPeriodoEl = document.getElementById('ferias-filtro-periodo');

    if (filtroFuncionarioEl) filtroFuncionarioEl.addEventListener('change', aplicarFiltrosFeriasLicencas);
    if (filtroTipoEl) filtroTipoEl.addEventListener('change', aplicarFiltrosFeriasLicencas);
    if (filtroStatusEl) filtroStatusEl.addEventListener('change', aplicarFiltrosFeriasLicencas);
    if (filtroPeriodoEl) filtroPeriodoEl.addEventListener('change', aplicarFiltrosFeriasLicencas);
    
    aplicarFiltrosFeriasLicencas(); // Carga inicial
}

function setDefaultDateFilters() {
    const periodoInput = document.getElementById('ferias-filtro-periodo');
    if(periodoInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        periodoInput.value = `${ano}-${mes}`;
    }
}


function popularFiltroFuncionariosFerias() {
    const selectEl = document.getElementById('ferias-filtro-funcionario');
    const funcionarios = getListaFuncionariosSimulados(); // Pega da função exportada
    if (!selectEl || !funcionarios) return;

    selectEl.innerHTML = '<option value="">Todos Funcionários</option>';
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

export function aplicarFiltrosFeriasLicencas() {
    const funcionarioId = document.getElementById('ferias-filtro-funcionario')?.value;
    const tipo = document.getElementById('ferias-filtro-tipo')?.value;
    const status = document.getElementById('ferias-filtro-status')?.value;
    const periodo = document.getElementById('ferias-filtro-periodo')?.value; // YYYY-MM

    carregarListaFeriasLicencas({ funcionarioId, tipo, status, periodo });
}


function carregarListaFeriasLicencas(filtros = {}) {
    const tbody = document.getElementById('table-body-ferias-licencas');
    if (!tbody) { console.error("Tabela #table-body-ferias-licencas não encontrada."); return; }
    tbody.innerHTML = '';

    let dadosFiltrados = listaFeriasLicencasSimuladas.filter(item => {
        let match = true;
        if (filtros.funcionarioId && item.funcionarioId !== filtros.funcionarioId) match = false;
        if (filtros.tipo && item.tipo !== filtros.tipo) match = false;
        if (filtros.status && item.status !== filtros.status) match = false;
        if (filtros.periodo) { // YYYY-MM
            const itemInicioMesAno = item.dataInicio.substring(0, 7);
            if (itemInicioMesAno !== filtros.periodo) match = false;
        }
        return match;
    });

    if (dadosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma solicitação encontrada.</td></tr>`;
    } else {
        dadosFiltrados
            .sort((a,b) => new Date(b.dataInicio) - new Date(a.dataInicio)) // Mais recentes primeiro
            .forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";

            const statusClasses = {
                programada: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200",
                aprovada: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200",
                em_andamento: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
                concluida: "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300",
                rejeitada: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200",
                cancelada: "bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-200 line-through"
            };
            const statusClasse = statusClasses[item.status] || "bg-gray-200 text-gray-700";

            tr.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.nomeFuncionario}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.tipo.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${new Date(item.dataInicio+"T00:00:00").toLocaleDateString('pt-BR')}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${new Date(item.dataFim+"T00:00:00").toLocaleDateString('pt-BR')}</td>
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${item.dias}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm">
                    <span class="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${statusClasse}">
                        ${item.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-center text-sm font-medium space-x-1">
                    <button onclick="visualizarSolicitacaoFeriasLicenca('${item.id}')" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-0.5" title="Visualizar"><i class="fas fa-eye fa-fw"></i></button>
                    ${item.status === 'programada' || item.status === 'aprovada' ? `
                        <button onclick="openModalEditarSolicitacaoFeriasLicenca('${item.id}')" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-0.5" title="Editar"><i class="fas fa-edit fa-fw"></i></button>
                        <button onclick="alterarStatusSolicitacao('${item.id}', 'cancelada')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0.5" title="Cancelar"><i class="fas fa-times-circle fa-fw"></i></button>
                        ${item.status === 'programada' ? `<button onclick="alterarStatusSolicitacao('${item.id}', 'aprovada')" class="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0.5" title="Aprovar"><i class="fas fa-check-circle fa-fw"></i></button>` : ''}
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    // Atualizar paginação (simulado)
     const pagDeEl = document.querySelector('[aria-label="Pagination-Funcionarios"] #func-pag-de'); // Reutilizando IDs, idealmente seriam IDs próprios
    const pagAteEl = document.querySelector('[aria-label="Pagination-Funcionarios"] #func-pag-ate');
    const pagTotalEl = document.querySelector('[aria-label="Pagination-Funcionarios"] #func-pag-total');
    if (pagDeEl) pagDeEl.textContent = dadosFiltrados.length > 0 ? '1' : '0';
    if (pagAteEl) pagAteEl.textContent = dadosFiltrados.length.toString();
    if (pagTotalEl) pagTotalEl.textContent = dadosFiltrados.length.toString();
}

async function carregarTemplateModalFL(callback) {
    const htmlModal = await carregarHtmlModal('_rh_modal_ferias_licenca.html');
    if (htmlModal && callback) {
        callback(htmlModal);
    }
}

export function openModalNovaSolicitacaoFeriasLicenca() {
    editandoFLId = null;
    carregarTemplateModalFL(htmlModal => {
        const actualFormId = 'actual-form-ferias-licenca';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlModal;
        const formClone = tempDiv.querySelector(`#${actualFormId}`);
        formClone.reset();
        formClone.elements['fl-id'].value = '';
        
        const selectFuncEl = formClone.elements['fl-funcionario'];
        popularSelectFuncionariosFolha(selectFuncEl); // Reutiliza a função de popular select

        setupCalculoDias(formClone);

        openModal('Nova Solicitação de Férias/Licença', tempDiv.innerHTML, {
            iconClass: 'fas fa-calendar-alt text-primary-DEFAULT dark:text-primary-light',
            modalSize: 'sm:max-w-xl',
            confirmText: 'Salvar Solicitação',
            onConfirm: () => salvarSolicitacaoFeriasLicenca(null),
            onOpen: () => { // Garante que os listeners sejam adicionados após o HTML estar no DOM do modal
                 const modalForm = document.querySelector(`#modal-content-area #${actualFormId}`);
                 if(modalForm) setupCalculoDias(modalForm);
            }
        });
    });
}

export function openModalEditarSolicitacaoFeriasLicenca(id) {
    editandoFLId = id;
    const item = listaFeriasLicencasSimuladas.find(fl => fl.id === id);
    if (!item) { alert("Solicitação não encontrada."); return; }

    carregarTemplateModalFL(htmlModal => {
        const actualFormId = 'actual-form-ferias-licenca';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlModal;
        const formClone = tempDiv.querySelector(`#${actualFormId}`);

        formClone.elements['fl-id'].value = item.id;
        const selectFuncEl = formClone.elements['fl-funcionario'];
        popularSelectFuncionariosFolha(selectFuncEl); // Popula antes de setar o valor
        selectFuncEl.value = item.funcionarioId;

        formClone.elements['fl-tipo'].value = item.tipo;
        formClone.elements['fl-status'].value = item.status; // Pode precisar de mais lógica aqui
        formClone.elements['fl-data-inicio'].value = item.dataInicio;
        formClone.elements['fl-data-fim'].value = item.dataFim;
        formClone.elements['fl-dias'].value = item.dias;
        formClone.elements['fl-observacoes'].value = item.observacoes || '';

        setupCalculoDias(formClone);

        openModal('Editar Solicitação de Férias/Licença', tempDiv.innerHTML, {
            iconClass: 'fas fa-calendar-edit text-primary-DEFAULT dark:text-primary-light',
            modalSize: 'sm:max-w-xl',
            confirmText: 'Salvar Alterações',
            onConfirm: () => salvarSolicitacaoFeriasLicenca(id),
            onOpen: () => {
                 const modalForm = document.querySelector(`#modal-content-area #${actualFormId}`);
                 if(modalForm) setupCalculoDias(modalForm);
            }
        });
    });
}

function setupCalculoDias(formEl) {
    const dataInicioEl = formEl.querySelector('#fl-data-inicio');
    const dataFimEl = formEl.querySelector('#fl-data-fim');
    const diasEl = formEl.querySelector('#fl-dias');

    function calcular() {
        if (dataInicioEl.value && dataFimEl.value) {
            const inicio = new Date(dataInicioEl.value + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso ao converter
            const fim = new Date(dataFimEl.value + "T00:00:00");
            if (fim >= inicio) {
                const diffTime = Math.abs(fim - inicio);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclui o dia de início
                diasEl.value = diffDays;
            } else {
                diasEl.value = '';
            }
        } else {
            diasEl.value = '';
        }
    }
    if(dataInicioEl) dataInicioEl.addEventListener('change', calcular);
    if(dataFimEl) dataFimEl.addEventListener('change', calcular);
}


export function salvarSolicitacaoFeriasLicenca(id) {
    const formElement = document.querySelector(`#modal-content-area #actual-form-ferias-licenca`);
    if (!formElement) { console.error('Formulário de Férias/Licença não encontrado.'); return; }

    if (!formElement.checkValidity()) {
        formElement.reportValidity();
        return;
    }
    const funcionarioId = formElement.elements['fl-funcionario'].value;
    const funcionario = getListaFuncionariosSimulados().find(f => f.id === funcionarioId);

    const data = {
        id: formElement.elements['fl-id'].value || `fl${Date.now()}`,
        funcionarioId: funcionarioId,
        nomeFuncionario: funcionario ? funcionario.nome : 'N/A',
        tipo: formElement.elements['fl-tipo'].value,
        status: formElement.elements['fl-status'].value,
        dataInicio: formElement.elements['fl-data-inicio'].value,
        dataFim: formElement.elements['fl-data-fim'].value,
        dias: parseInt(formElement.elements['fl-dias'].value) || 0,
        observacoes: formElement.elements['fl-observacoes'].value
    };

    if (id) { // Editando
        const index = listaFeriasLicencasSimuladas.findIndex(item => item.id === id);
        if (index > -1) listaFeriasLicencasSimuladas[index] = data;
        alert("Solicitação atualizada com sucesso! (simulação)");
    } else { // Nova
        listaFeriasLicencasSimuladas.push(data);
        alert("Solicitação registrada com sucesso! (simulação)");
    }
    console.log("Salvando Férias/Licença:", data);
    closeModal();
    aplicarFiltrosFeriasLicencas();
}

export function visualizarSolicitacaoFeriasLicenca(id) {
    const item = listaFeriasLicencasSimuladas.find(fl => fl.id === id);
    if (!item) { alert("Solicitação não encontrada."); return; }
    
    let htmlContent = `<div class="space-y-2 text-sm">`;
    htmlContent += `<p><strong>Funcionário:</strong> ${item.nomeFuncionario}</p>`;
    htmlContent += `<p><strong>Tipo:</strong> ${item.tipo.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</p>`;
    htmlContent += `<p><strong>Período:</strong> ${new Date(item.dataInicio+"T00:00:00").toLocaleDateString('pt-BR')} a ${new Date(item.dataFim+"T00:00:00").toLocaleDateString('pt-BR')} (${item.dias} dias)</p>`;
    htmlContent += `<p><strong>Status:</strong> <span class="font-medium">${item.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span></p>`;
    if(item.observacoes) htmlContent += `<p><strong>Observações:</strong> ${item.observacoes}</p>`;
    htmlContent += `</div>`;

    openModal("Detalhes da Solicitação", htmlContent, {
        iconClass: 'fas fa-info-circle text-primary-DEFAULT',
        hideConfirmButton: true,
        cancelText: 'Fechar'
    });
}

export function alterarStatusSolicitacao(id, novoStatus) {
    const item = listaFeriasLicencasSimuladas.find(fl => fl.id === id);
    if (!item) { alert("Solicitação não encontrada."); return; }
    const acao = novoStatus.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    if (confirm(`Tem certeza que deseja alterar o status para "${acao}" para a solicitação de ${item.nomeFuncionario}?`)) {
        item.status = novoStatus;
        alert(`Status da solicitação alterado para "${acao}" com sucesso! (simulação)`);
        aplicarFiltrosFeriasLicencas();
    }
}