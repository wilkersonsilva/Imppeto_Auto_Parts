// rhFuncionariosController.js
// Responsável pela lógica da aba "Funcionários" e seus modais.
// Data e Hora Atual: 18 de maio de 2025

import { openModal, closeModal } from '../uiUtils.js'; // Ajuste o caminho se uiUtils estiver em outro nível
// loadContent e getCurrentSection não são diretamente usados aqui, mas são importantes para o fluxo geral.

// --- DADOS SIMULADOS (específicos para funcionários) ---
let listaFuncionariosSimulados = [
    {
        id: 'func-001', matricula: 'EMP001', nome: 'Ana Silva Costa', cpf: '111.222.333-44', rg: '12.345.678-9',
        dataNascimento: '1990-05-15', genero: 'feminino', estadoCivil: 'casado',
        nacionalidade: 'Brasileira', naturalidadeCidade: 'Rio de Janeiro', naturalidadeUf: 'RJ',
        nomeMae: 'Maria Silva', nomePai: 'João Costa',
        telefoneResidencial: '(21) 2222-3333', telefoneCelular: '(21) 99999-0001', emailPessoal: 'ana.costa@email.com',
        cep: '20000-001', logradouro: 'Rua das Palmeiras', numero: '123', complemento: 'Apto 10', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ',
        pisPasep: '123.45678.90-1', tituloEleitorNumero: '098765432109', tituloEleitorZona: '001', tituloEleitorSecao: '002',
        reservista: '11223344556', ctpsNumero: '12345', ctpsSerie: '001-RJ', ctpsUf: 'RJ',
        cnhNumero: '01234567890', cnhCategoria: 'AB', cnhValidade: '2028-10-20',
        bancoNome: 'Banco do Brasil', bancoAgencia: '1234', bancoAgenciaDv: '5', bancoConta: '98765', bancoContaDv: '4', bancoTipoConta: 'corrente',
        fotoUrl: 'https://via.placeholder.com/100x100.png?text=ASC',
        dependentes: [
            { id: 'dep-ana-1', nome: 'Lucas Costa Oliveira', dataNascimento: '2015-08-20', parentesco: 'filho_a', cpf: '111.000.111-00' },
            { id: 'dep-ana-2', nome: 'Pedro Costa Silva (Cônjuge)', dataNascimento: '1988-03-10', parentesco: 'conjuge', cpf: '222.000.222-00' }
        ],
        dataAdmissao: '2022-03-10', cargo: 'Vendedor Líder', departamento: 'vendas', salario: 5500.00,
        usuarioSistemaId: 'user-vendedor-01',
        statusAtivo: true
    },
    {
        id: 'func-002', matricula: 'EMP002', nome: 'Bruno Oliveira Lima', cpf: '222.333.444-55', rg: '23.456.789-0',
        dataNascimento: '1985-11-20', genero: 'masculino', estadoCivil: 'solteiro',
        nacionalidade: 'Brasileira', naturalidadeCidade: 'São Paulo', naturalidadeUf: 'SP',
        nomeMae: 'Clara Oliveira', nomePai: 'Roberto Lima',
        telefoneResidencial: '(11) 3333-4444', telefoneCelular: '(11) 98888-0002', emailPessoal: 'bruno.lima@email.com',
        cep: '01000-002', logradouro: 'Avenida Paulista', numero: '1000', complemento: 'Cj 50', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
        pisPasep: '987.65432.10-9', tituloEleitorNumero: '012345678912', tituloEleitorZona: '002', tituloEleitorSecao: '003',
        reservista: '', ctpsNumero: '67890', ctpsSerie: '002-SP', ctpsUf: 'SP',
        cnhNumero: '', cnhCategoria: '', cnhValidade: '',
        bancoNome: 'Itaú Unibanco', bancoAgencia: '5678', bancoAgenciaDv: '', bancoConta: '12345', bancoContaDv: '6', bancoTipoConta: 'corrente',
        fotoUrl: null,
        dependentes: [],
        dataAdmissao: '2023-01-15', cargo: 'Gerente de Estoque', departamento: 'estoque', salario: 6200.00,
        usuarioSistemaId: 'user-estoquista-01',
        statusAtivo: true
    },
     {
        id: 'func-003', matricula: 'EMP003', nome: 'Carlos Admin Pereira', cpf: '333.444.555-66', rg: '34.567.890-1',
        dataNascimento: '1980-07-01', genero: 'masculino', estadoCivil: 'casado',
        nacionalidade: 'Brasileira', naturalidadeCidade: 'Curitiba', naturalidadeUf: 'PR',
        nomeMae: 'Sofia Pereira', nomePai: 'Antônio Pereira',
        telefoneResidencial: '(41) 4444-5555', telefoneCelular: '(41) 97777-0003', emailPessoal: 'carlos.admin@email.com',
        cep: '80000-003', logradouro: 'Rua XV de Novembro', numero: '789', complemento: 'Casa', bairro: 'Centro', cidade: 'Curitiba', uf: 'PR',
        pisPasep: '456.12378.00-5', tituloEleitorNumero: '098712345600', tituloEleitorZona: '003', tituloEleitorSecao: '004',
        reservista: '99887766554', ctpsNumero: '11223', ctpsSerie: '003-PR', ctpsUf: 'PR',
        cnhNumero: '98765432100', cnhCategoria: 'B', cnhValidade: '2027-05-10',
        bancoNome: 'Caixa Econômica Federal', bancoAgencia: '0101', bancoAgenciaDv: '', bancoConta: '112233', bancoContaDv: '8', bancoTipoConta: 'poupanca',
        fotoUrl: 'https://via.placeholder.com/100x100.png?text=CAP',
        dependentes: [],
        dataAdmissao: '2020-10-01', cargo: 'Administrador do Sistema', departamento: 'administrativo', salario: 7000.00,
        usuarioSistemaId: 'user-admin',
        statusAtivo: true
    },
];

let dependentesTemporarios = [];
let proximoIdDependenteTemp = 1;
let editandoDependenteTempId = null;

// Simulação da lista de usuários do sistema (para o select no form de funcionário)
const listaUsuariosSitema = [ // Idealmente, esta lista seria global ou vinda de um serviço
    { id: 'user-admin', nome: 'Administrador do Sistema (admin)' },
    { id: 'user-vendedor-01', nome: 'Carlos Vendedor (carlos.vendas)' },
    { id: 'user-estoquista-01', nome: 'Mariana Estoque (mari.estoque)' },
];

/**
 * Inicializa a aba de Funcionários.
 */
export function initializeFuncionariosTab() {
    console.log("Aba Funcionários inicializada.");
    const searchNomeFunc = document.getElementById('rh-search-nome-funcionario');
    const searchDeptoFunc = document.getElementById('rh-search-departamento');
    const searchStatusFunc = document.getElementById('rh-search-status-funcionario');

    const aplicarFiltrosFunc = () => carregarFuncionarios({
        nome: searchNomeFunc ? searchNomeFunc.value : '',
        departamento: searchDeptoFunc ? searchDeptoFunc.value : '',
        status: searchStatusFunc ? searchStatusFunc.value : 'ativo'
    });

    if (searchNomeFunc) searchNomeFunc.addEventListener('keyup', aplicarFiltrosFunc);
    if (searchDeptoFunc) searchDeptoFunc.addEventListener('change', aplicarFiltrosFunc);
    if (searchStatusFunc) searchStatusFunc.addEventListener('change', aplicarFiltrosFunc);

    aplicarFiltrosFunc(); // Carga inicial
}


function carregarFuncionarios(filtros = { status: 'ativo' }) {
    const tbody = document.getElementById('table-body-funcionarios');
    if (!tbody) {
        console.error("Tabela #table-body-funcionarios não encontrada.");
        return;
    }
    tbody.innerHTML = '';

    let funcionariosFiltrados = listaFuncionariosSimulados.filter(func => {
        const matchNome = !filtros.nome || func.nome.toLowerCase().includes(filtros.nome.toLowerCase()) || (func.matricula && func.matricula.toLowerCase().includes(filtros.nome.toLowerCase()));
        const matchDepto = !filtros.departamento || func.departamento === filtros.departamento;
        const matchStatus = filtros.status === '' || (filtros.status === 'ativo' && func.statusAtivo) || (filtros.status === 'inativo' && !func.statusAtivo);
        return matchNome && matchDepto && matchStatus;
    });

    if (funcionariosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-users-slash fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhum funcionário encontrado com os filtros aplicados.</td></tr>`;
    } else {
        funcionariosFiltrados.forEach(func => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${func.matricula}</td>
                <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div class="flex items-center">
                        <img class="h-8 w-8 rounded-full object-cover mr-3" src="${func.fotoUrl || 'https://via.placeholder.com/40x40.png?text=SF'}" alt="Foto de ${func.nome}">
                        ${func.nome}
                    </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${func.cargo || '-'}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${func.departamento ? func.departamento.charAt(0).toUpperCase() + func.departamento.slice(1) : '-'}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${func.telefoneCelular || '-'}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${func.statusAtivo ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}">
                        ${func.statusAtivo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-1">
                    <button onclick="visualizarFuncionario('${func.id}')" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="Visualizar Detalhes"><i class="fas fa-eye fa-fw"></i></button>
                    <button onclick="editarFuncionario('${func.id}')" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Editar Funcionário"><i class="fas fa-edit fa-fw"></i></button>
                    <button onclick="inativarFuncionario('${func.id}', ${!func.statusAtivo})" class="p-1" title="${func.statusAtivo ? 'Inativar' : 'Ativar'} Funcionário">
                        <i class="fas ${func.statusAtivo ? 'fa-user-slash text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' : 'fa-user-check text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'} fa-fw"></i>
                    </button>
                    <button onclick="openModalHolerite('${func.id}')" class="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 p-1" title="Ver Holerites"><i class="fas fa-receipt fa-fw"></i></button>
                    <button onclick="openModalFerias('${func.id}')" class="text-teal-500 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-1" title="Gerenciar Férias"><i class="fas fa-umbrella-beach fa-fw"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    const deEl = document.getElementById('func-pag-de');
    const ateEl = document.getElementById('func-pag-ate');
    const totalEl = document.getElementById('func-pag-total');
    if(deEl) deEl.textContent = funcionariosFiltrados.length > 0 ? '1' : '0';
    if(ateEl) ateEl.textContent = funcionariosFiltrados.length.toString();
    if(totalEl) totalEl.textContent = funcionariosFiltrados.length.toString();
}

async function carregarHtmlModal(urlModal, callback) {
    try {
        const response = await fetch(urlModal);
        if (!response.ok) throw new Error(`Falha ao carregar template do modal: ${urlModal}`);
        const htmlModal = await response.text();
        if (callback) callback(htmlModal);
        return htmlModal;
    } catch (error) {
        console.error(error);
        alert(`Erro crítico: Não foi possível carregar o formulário do modal (${urlModal}). Verifique o console.`);
        return null;
    }
}

function setupFotoPreview(formElement) {
    const fotoUploadInput = formElement.querySelector('#func-foto-upload');
    const fotoPreviewImg = formElement.querySelector('#func-foto-preview');
    const placeholderFoto = 'https://via.placeholder.com/100x100.png?text=Foto';

    if (fotoUploadInput && fotoPreviewImg) {
        fotoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreviewImg.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                 const funcIdInput = formElement.elements['funcionario-id'];
                 if (funcIdInput && funcIdInput.value) {
                      const funcAtual = listaFuncionariosSimulados.find(f => f.id === funcIdInput.value);
                      fotoPreviewImg.src = (funcAtual && funcAtual.fotoUrl) ? funcAtual.fotoUrl : placeholderFoto;
                 } else {
                     fotoPreviewImg.src = placeholderFoto;
                 }
            }
        });
    }
}

export async function openModalNovoFuncionario() {
    const htmlModalFuncionario = await carregarHtmlModal('_rh_modal_funcionario.html');
    if (!htmlModalFuncionario) return;

    const actualFormId = 'actual-form-funcionario';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlModalFuncionario; // Carrega o template do arquivo
    const formClone = tempDiv.querySelector(`#${actualFormId}`);

    formClone.elements['funcionario-id'].value = '';
    formClone.reset();
    formClone.elements['func-status-ativo'].checked = true;
    formClone.elements['func-nacionalidade'].value = 'Brasileira';

    const fotoPreviewImg = formClone.querySelector('#func-foto-preview');
    if (fotoPreviewImg) fotoPreviewImg.src = 'https://via.placeholder.com/100x100.png?text=Foto';

    dependentesTemporarios = [];
    proximoIdDependenteTemp = 1;

    const usuarioSistemaSelect = formClone.elements['func-usuario-sistema'];
    if (usuarioSistemaSelect) {
        usuarioSistemaSelect.innerHTML = '<option value="">Nenhum usuário vinculado</option>';
        listaUsuariosSitema.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.nome;
            usuarioSistemaSelect.appendChild(option);
        });
    }

    const matriculaInput = formClone.elements['func-matricula'];
    if(matriculaInput) matriculaInput.placeholder = "(Gerado automaticamente ou manual)";

    openModal('Novo Funcionário', tempDiv.innerHTML, {
        iconClass: 'fas fa-user-plus text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-4xl',
        confirmText: 'Salvar Funcionário',
        onConfirm: () => salvarFuncionario(null),
        onOpen: () => {
            const modalForm = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (modalForm) {
                setupFotoPreview(modalForm);
                renderizarTabelaDependentesTemporarios(modalForm.querySelector('#table-dependentes-temp'));
            }
        }
    });
}

export async function editarFuncionario(funcionarioId) {
    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    if (!funcionario) { alert('Funcionário não encontrado.'); return; }

    const htmlModalFuncionario = await carregarHtmlModal('_rh_modal_funcionario.html');
    if (!htmlModalFuncionario) return;
        
    const actualFormId = 'actual-form-funcionario';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlModalFuncionario;
    const formClone = tempDiv.querySelector(`#${actualFormId}`);

    formClone.elements['funcionario-id'].value = funcionario.id;
    formClone.elements['func-nome'].value = funcionario.nome || '';
    formClone.elements['func-cpf'].value = funcionario.cpf || '';
    formClone.elements['func-rg'].value = funcionario.rg || '';
    formClone.elements['func-data-nascimento'].value = funcionario.dataNascimento || '';
    formClone.elements['func-genero'].value = funcionario.genero || '';
    formClone.elements['func-estado-civil'].value = funcionario.estadoCivil || '';
    formClone.elements['func-nacionalidade'].value = funcionario.nacionalidade || 'Brasileira';
    formClone.elements['func-naturalidade-cidade'].value = funcionario.naturalidadeCidade || '';
    formClone.elements['func-naturalidade-uf'].value = funcionario.naturalidadeUf || '';
    formClone.elements['func-nome-mae'].value = funcionario.nomeMae || '';
    formClone.elements['func-nome-pai'].value = funcionario.nomePai || '';
    formClone.elements['func-telefone-residencial'].value = funcionario.telefoneResidencial || '';
    formClone.elements['func-telefone-celular'].value = funcionario.telefoneCelular || '';
    formClone.elements['func-email-pessoal'].value = funcionario.emailPessoal || '';
    formClone.elements['func-cep'].value = funcionario.cep || '';
    formClone.elements['func-logradouro'].value = funcionario.logradouro || '';
    formClone.elements['func-numero'].value = funcionario.numero || '';
    formClone.elements['func-complemento'].value = funcionario.complemento || '';
    formClone.elements['func-bairro'].value = funcionario.bairro || '';
    formClone.elements['func-cidade'].value = funcionario.cidade || '';
    formClone.elements['func-uf'].value = funcionario.uf || '';
    formClone.elements['func-pis-pasep'].value = funcionario.pisPasep || '';
    formClone.elements['func-titulo-eleitor-numero'].value = funcionario.tituloEleitorNumero || '';
    formClone.elements['func-titulo-eleitor-zona'].value = funcionario.tituloEleitorZona || '';
    formClone.elements['func-titulo-eleitor-secao'].value = funcionario.tituloEleitorSecao || '';
    formClone.elements['func-reservista'].value = funcionario.reservista || '';
    formClone.elements['func-ctps-numero'].value = funcionario.ctpsNumero || '';
    formClone.elements['func-ctps-serie'].value = funcionario.ctpsSerie || '';
    formClone.elements['func-ctps-uf'].value = funcionario.ctpsUf || '';
    formClone.elements['func-cnh-numero'].value = funcionario.cnhNumero || '';
    formClone.elements['func-cnh-categoria'].value = funcionario.cnhCategoria || '';
    formClone.elements['func-cnh-validade'].value = funcionario.cnhValidade || '';
    formClone.elements['func-banco-nome'].value = funcionario.bancoNome || '';
    formClone.elements['func-banco-agencia'].value = funcionario.bancoAgencia || '';
    formClone.elements['func-banco-agencia-dv'].value = funcionario.bancoAgenciaDv || '';
    formClone.elements['func-banco-conta'].value = funcionario.bancoConta || '';
    formClone.elements['func-banco-conta-dv'].value = funcionario.bancoContaDv || '';
    formClone.elements['func-banco-tipo-conta'].value = funcionario.bancoTipoConta || '';
    formClone.elements['func-matricula'].value = funcionario.matricula || '';
    formClone.elements['func-data-admissao'].value = funcionario.dataAdmissao || '';
    formClone.elements['func-cargo'].value = funcionario.cargo || '';
    formClone.elements['func-departamento'].value = funcionario.departamento || '';
    formClone.elements['func-salario'].value = funcionario.salario ? funcionario.salario.toFixed(2) : '';
    formClone.elements['func-status-ativo'].checked = funcionario.statusAtivo;

    const fotoPreviewImg = formClone.querySelector('#func-foto-preview');
    if (fotoPreviewImg) {
        fotoPreviewImg.src = funcionario.fotoUrl || 'https://via.placeholder.com/100x100.png?text=Foto';
    }

    dependentesTemporarios = funcionario.dependentes ? JSON.parse(JSON.stringify(funcionario.dependentes)) : [];
    proximoIdDependenteTemp = dependentesTemporarios.length > 0 ? Math.max(...dependentesTemporarios.map(d => parseInt(d.id.split('-').pop()))) + 1 : 1;

    const usuarioSistemaSelect = formClone.elements['func-usuario-sistema'];
    if (usuarioSistemaSelect) {
        usuarioSistemaSelect.innerHTML = '<option value="">Nenhum usuário vinculado</option>';
        listaUsuariosSitema.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.nome;
            if (user.id === funcionario.usuarioSistemaId) {
                option.selected = true;
            }
            usuarioSistemaSelect.appendChild(option);
        });
    }

    openModal(`Editar Funcionário: ${funcionario.nome}`, tempDiv.innerHTML, {
        iconClass: 'fas fa-user-edit text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-4xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => salvarFuncionario(funcionarioId),
        onOpen: () => {
            const modalForm = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (modalForm) {
                setupFotoPreview(modalForm);
                renderizarTabelaDependentesTemporarios(modalForm.querySelector('#table-dependentes-temp'));
            }
        }
    });
}

function salvarFuncionario(funcionarioId) {
    const formElement = document.querySelector(`#modal-content-area #actual-form-funcionario`);
    if (!formElement) { console.error('Formulário de funcionário não encontrado no modal.'); return; }

    if (!formElement.checkValidity()) {
        formElement.reportValidity();
        return;
    }

    const formData = new FormData(formElement);
    const data = {
        id: formData.get('funcionario-id') || `func-${Date.now()}`,
        nome: formData.get('func-nome'),
        cpf: formData.get('func-cpf'),
        rg: formData.get('func-rg'),
        dataNascimento: formData.get('func-data-nascimento'),
        genero: formData.get('func-genero'),
        estadoCivil: formData.get('func-estado-civil'),
        nacionalidade: formData.get('func-nacionalidade'),
        naturalidadeCidade: formData.get('func-naturalidade-cidade'),
        naturalidadeUf: formData.get('func-naturalidade-uf'),
        nomeMae: formData.get('func-nome-mae'),
        nomePai: formData.get('func-nome-pai'),
        telefoneResidencial: formData.get('func-telefone-residencial'),
        telefoneCelular: formData.get('func-telefone-celular'),
        emailPessoal: formData.get('func-email-pessoal'),
        cep: formData.get('func-cep'),
        logradouro: formData.get('func-logradouro'),
        numero: formData.get('func-numero'),
        complemento: formData.get('func-complemento'),
        bairro: formData.get('func-bairro'),
        cidade: formData.get('func-cidade'),
        uf: formData.get('func-uf'),
        pisPasep: formData.get('func-pis-pasep'),
        tituloEleitorNumero: formData.get('func-titulo-eleitor-numero'),
        tituloEleitorZona: formData.get('func-titulo-eleitor-zona'),
        tituloEleitorSecao: formData.get('func-titulo-eleitor-secao'),
        reservista: formData.get('func-reservista'),
        ctpsNumero: formData.get('func-ctps-numero'),
        ctpsSerie: formData.get('func-ctps-serie'),
        ctpsUf: formData.get('func-ctps-uf'),
        cnhNumero: formData.get('func-cnh-numero'),
        cnhCategoria: formData.get('func-cnh-categoria'),
        cnhValidade: formData.get('func-cnh-validade'),
        bancoNome: formData.get('func-banco-nome'),
        bancoAgencia: formData.get('func-banco-agencia'),
        bancoAgenciaDv: formData.get('func-banco-agencia-dv'),
        bancoConta: formData.get('func-banco-conta'),
        bancoContaDv: formData.get('func-banco-conta-dv'),
        bancoTipoConta: formData.get('func-banco-tipo-conta'),
        matricula: formData.get('func-matricula'),
        dataAdmissao: formData.get('func-data-admissao'),
        cargo: formData.get('func-cargo'),
        departamento: formData.get('func-departamento'),
        salario: parseFloat(formData.get('func-salario')),
        usuarioSistemaId: formData.get('func-usuario-sistema'),
        statusAtivo: formElement.elements['func-status-ativo'].checked,
        fotoUrl: null,
        dependentes: JSON.parse(JSON.stringify(dependentesTemporarios))
    };

    const fotoPreviewImg = formElement.querySelector('#func-foto-preview');
    const fotoUploadInput = formElement.elements['func-foto-upload'];
    const placeholderFotoPadrao = 'https://via.placeholder.com/100x100.png?text=SF';

    if (fotoUploadInput && fotoUploadInput.files && fotoUploadInput.files[0]) {
        if (fotoPreviewImg) {
           data.fotoUrl = fotoPreviewImg.src;
        } else {
           data.fotoUrl = placeholderFotoPadrao;
        }
    } else if (funcionarioId) {
        const funcExistente = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
        if (funcExistente) {
            data.fotoUrl = funcExistente.fotoUrl;
        } else {
            data.fotoUrl = placeholderFotoPadrao;
        }
    } else {
        if (fotoPreviewImg && fotoPreviewImg.src !== 'https://via.placeholder.com/100x100.png?text=Foto') {
            data.fotoUrl = fotoPreviewImg.src;
        } else {
            data.fotoUrl = placeholderFotoPadrao;
        }
    }

    if (!data.matricula && !funcionarioId) {
        data.matricula = `RH${Date.now().toString().slice(-5)}`;
    }

    if (funcionarioId) {
        const index = listaFuncionariosSimulados.findIndex(f => f.id === funcionarioId);
        if (index > -1) {
            listaFuncionariosSimulados[index] = { ...listaFuncionariosSimulados[index], ...data };
            alert('Funcionário atualizado com sucesso! (simulação)');
        } else {
            alert('Erro ao atualizar: funcionário não encontrado.'); return;
        }
    } else {
        listaFuncionariosSimulados.push(data);
        alert('Funcionário cadastrado com sucesso! (simulação)');
    }
    console.log('Salvando funcionário:', data);
    closeModal();
    carregarFuncionarios();
}

export function visualizarFuncionario(funcionarioId) {
    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    if (!funcionario) { alert('Funcionário não encontrado.'); return; }

    const usuarioVinculado = listaUsuariosSitema.find(u => u.id === funcionario.usuarioSistemaId);

    let htmlConteudo = `<div class="space-y-1.5 text-sm p-1 max-h-[70vh] overflow-y-auto custom-scrollbar">`;
    htmlConteudo += `<div class="flex justify-center mb-3">
                        <img src="${funcionario.fotoUrl || 'https://via.placeholder.com/120x120.png?text=Sem+Foto'}" alt="Foto de ${funcionario.nome}" class="h-28 w-28 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shadow-md">
                     </div>`;

    const dadosParaExibir = {
        "--- Dados Pessoais ---": "---",
        "Matrícula": funcionario.matricula, "Nome Completo": funcionario.nome,
        "CPF": funcionario.cpf, "RG": funcionario.rg,
        "Data de Nascimento": funcionario.dataNascimento ? new Date(funcionario.dataNascimento + "T00:00:00").toLocaleDateString('pt-BR') : '-',
        "Gênero": funcionario.genero ? funcionario.genero.charAt(0).toUpperCase() + funcionario.genero.slice(1) : '-',
        "Estado Civil": funcionario.estadoCivil ? funcionario.estadoCivil.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : '-',
        "Nacionalidade": funcionario.nacionalidade,
        "Naturalidade": `${funcionario.naturalidadeCidade || ''}${funcionario.naturalidadeUf ? ' - ' + funcionario.naturalidadeUf : ''}`.replace(/^ - $|^$/, '-'),
        "Nome da Mãe": funcionario.nomeMae, "Nome do Pai": funcionario.nomePai,
        "--- Contato e Endereço ---": "---",
        "Telefone Residencial": funcionario.telefoneResidencial, "Telefone Celular": funcionario.telefoneCelular,
        "Email Pessoal": funcionario.emailPessoal, "CEP": funcionario.cep,
        "Endereço": `${funcionario.logradouro || ''}, ${funcionario.numero || ''} ${funcionario.complemento || ''} - ${funcionario.bairro || ''}, ${funcionario.cidade || ''} - ${funcionario.uf || ''}`.replace(/, , | , -/g, ',').replace(/^- |^,|, $/g, ''),
        "--- Documentação ---": "---",
        "PIS/PASEP": funcionario.pisPasep,
        "Título de Eleitor": `${funcionario.tituloEleitorNumero || ''} (Zona: ${funcionario.tituloEleitorZona || '-'}, Seção: ${funcionario.tituloEleitorSecao || '-'})`.replace(/\(Zona: -, Seção: -\)$|^$/, '-'),
        "Cert. Reservista": funcionario.reservista,
        "CTPS": `${funcionario.ctpsNumero || ''} Série: ${funcionario.ctpsSerie || '-'} UF: ${funcionario.ctpsUf || '-'}`.replace(/Série: - UF: -$/, '-'),
        "CNH": `${funcionario.cnhNumero || ''} Cat: ${funcionario.cnhCategoria || '-'} Val: ${funcionario.cnhValidade ? new Date(funcionario.cnhValidade + "T00:00:00").toLocaleDateString('pt-BR') : '-'}`.replace(/Cat: - Val: -$/, '-'),
        "--- Dados Bancários ---": "---",
        "Banco": funcionario.bancoNome,
        "Agência": `${funcionario.bancoAgencia || ''}${funcionario.bancoAgenciaDv ? '-' + funcionario.bancoAgenciaDv : ''}`.replace(/^-$/, '-'),
        "Conta": `${funcionario.bancoConta || ''}${funcionario.bancoContaDv ? '-' + funcionario.bancoContaDv : ''}`.replace(/^-$/, '-'),
        "Tipo de Conta": funcionario.bancoTipoConta ? funcionario.bancoTipoConta.charAt(0).toUpperCase() + funcionario.bancoTipoConta.slice(1) : '-',
        "--- Dados Contratuais ---": "---",
        "Data de Admissão": funcionario.dataAdmissao ? new Date(funcionario.dataAdmissao + "T00:00:00").toLocaleDateString('pt-BR') : '-',
        "Cargo": funcionario.cargo,
        "Departamento": funcionario.departamento ? funcionario.departamento.charAt(0).toUpperCase() + funcionario.departamento.slice(1) : '-',
        "Salário": funcionario.salario ? funcionario.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
        "Usuário do Sistema": usuarioVinculado ? usuarioVinculado.nome : "Nenhum",
        "Status": funcionario.statusAtivo ? "Ativo" : "Inativo"
    };

    for (const [label, value] of Object.entries(dadosParaExibir)) {
        if (value === "---") {
            htmlConteudo += `<div class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600"><strong class="text-gray-700 dark:text-gray-200 font-semibold">${label.replace(/---/g, '')}</strong></div>`;
        } else {
            htmlConteudo += `<div class="flex border-b border-gray-100 dark:border-gray-700 py-1"><strong class="w-2/5 text-gray-500 dark:text-gray-400 min-w-[150px]">${label}:</strong> <span class="w-3/5 text-gray-800 dark:text-gray-200 break-words">${value || '-'}</span></div>`;
        }
    }

    if (funcionario.dependentes && funcionario.dependentes.length > 0) {
        htmlConteudo += `<div class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600"><strong class="text-gray-700 dark:text-gray-200 font-semibold">Dependentes</strong></div>`;
        funcionario.dependentes.forEach(dep => {
            htmlConteudo += `<div class="ml-2 p-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <p><strong class="text-gray-500 dark:text-gray-400">Nome:</strong> ${dep.nome}</p>
                                <p><strong class="text-gray-500 dark:text-gray-400">Nasc.:</strong> ${dep.dataNascimento ? new Date(dep.dataNascimento + "T00:00:00").toLocaleDateString('pt-BR') : '-'} |
                                   <strong class="text-gray-500 dark:text-gray-400">Parent.:</strong> ${dep.parentesco ? dep.parentesco.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : '-'} |
                                   <strong class="text-gray-500 dark:text-gray-400">CPF:</strong> ${dep.cpf || '-'}</p>
                             </div>`;
        });
    }
    htmlConteudo += `</div>`;

    openModal(`Detalhes do Funcionário - ${funcionario.nome}`, htmlConteudo, {
        iconClass: 'fas fa-id-badge text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        hideConfirmButton: true,
        cancelText: 'Fechar'
    });
}


export function inativarFuncionario(funcionarioId, novoStatus) {
    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    if (!funcionario) { alert('Funcionário não encontrado.'); return; }

    const acao = novoStatus ? "ativar" : "inativar";
    if (confirm(`Tem certeza que deseja ${acao} o funcionário ${funcionario.nome}?`)) {
        funcionario.statusAtivo = novoStatus;
        console.log(`Funcionário ${funcionario.nome} (${funcionarioId}) ${acao} com sucesso.`);
        alert(`Funcionário ${acao} com sucesso! (simulação)`);
        carregarFuncionarios();
    }
}

export async function buscarCepFuncionario(prefixoCampo) {
    const modalContentArea = document.getElementById('modal-content-area');
    if (!modalContentArea) { console.error('Área de conteúdo do modal não encontrada.'); return; }

    const cepInput = modalContentArea.querySelector(`#${prefixoCampo}-cep`);
    if (!cepInput) { console.error(`Campo de CEP #${prefixoCampo}-cep não encontrado.`); return; }
    const cepValue = cepInput.value.replace(/\D/g, '');

    if (cepValue.length !== 8) {
        alert('Por favor, insira um CEP válido (8 dígitos).'); cepInput.focus(); return;
    }

    const fieldsToFill = {
        logradouro: modalContentArea.querySelector(`#${prefixoCampo}-logradouro`),
        bairro: modalContentArea.querySelector(`#${prefixoCampo}-bairro`),
        cidade: modalContentArea.querySelector(`#${prefixoCampo}-cidade`),
        uf: modalContentArea.querySelector(`#${prefixoCampo}-uf`)
    };
    Object.values(fieldsToFill).forEach(field => { if (field) field.value = ''; });

    const buscarCepButton = modalContentArea.querySelector(`button[onclick="buscarCepFuncionario('${prefixoCampo}')"]`);
    let originalButtonText;
    if (buscarCepButton) {
        originalButtonText = buscarCepButton.innerHTML;
        buscarCepButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Buscando...';
        buscarCepButton.disabled = true;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        if (buscarCepButton) {
            buscarCepButton.innerHTML = originalButtonText;
            buscarCepButton.disabled = false;
        }
        if (!response.ok) throw new Error('Falha ao conectar ao serviço de CEP.');
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado.');
        } else {
            if (fieldsToFill.logradouro) fieldsToFill.logradouro.value = data.logradouro || '';
            if (fieldsToFill.bairro) fieldsToFill.bairro.value = data.bairro || '';
            if (fieldsToFill.cidade) fieldsToFill.cidade.value = data.localidade || '';
            if (fieldsToFill.uf) fieldsToFill.uf.value = data.uf || '';
            const numeroField = modalContentArea.querySelector(`#${prefixoCampo}-numero`);
            if(numeroField) numeroField.focus();
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert(`Erro ao buscar CEP: ${error.message}`);
        if (buscarCepButton && originalButtonText) {
             buscarCepButton.innerHTML = originalButtonText;
             buscarCepButton.disabled = false;
        }
    }
}

// --- Funções para Gerenciamento de Dependentes ---

export async function openModalNovoDependente() {
    editandoDependenteTempId = null;
    const htmlModalDependente = await carregarHtmlModal('_rh_modal_dependente.html');
    if (!htmlModalDependente) return;
    
    const actualFormId = 'actual-form-dependente';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlModalDependente; // Carrega o template do arquivo
    const formClone = tempDiv.querySelector(`#${actualFormId}`);

    if(formClone) formClone.reset(); 
    if(formClone.elements['dep-id']) formClone.elements['dep-id'].value = '';


    openModal('Adicionar Dependente', tempDiv.innerHTML, {
        iconClass: 'fas fa-child text-blue-500 dark:text-blue-400',
        modalSize: 'sm:max-w-md',
        confirmText: 'Salvar Dependente',
        onConfirm: () => salvarDependenteTemporario(null)
    });
}

export async function openModalEditarDependente(dependenteTempId) {
    editandoDependenteTempId = dependenteTempId;
    const dependente = dependentesTemporarios.find(d => d.id === dependenteTempId);
    if (!dependente) { alert('Dependente não encontrado na lista temporária.'); return; }

    const htmlModalDependente = await carregarHtmlModal('_rh_modal_dependente.html');
    if (!htmlModalDependente) return;
    
    const actualFormId = 'actual-form-dependente';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlModalDependente;
    const formClone = tempDiv.querySelector(`#${actualFormId}`);

    formClone.elements['dep-id'].value = dependente.id;
    formClone.elements['dep-nome'].value = dependente.nome || '';
    formClone.elements['dep-data-nascimento'].value = dependente.dataNascimento || '';
    formClone.elements['dep-parentesco'].value = dependente.parentesco || '';
    formClone.elements['dep-cpf'].value = dependente.cpf || '';

    openModal('Editar Dependente', tempDiv.innerHTML, {
        iconClass: 'fas fa-edit text-blue-500 dark:text-blue-400',
        modalSize: 'sm:max-w-md',
        confirmText: 'Salvar Alterações',
        onConfirm: () => salvarDependenteTemporario(dependenteTempId)
    });
}


function salvarDependenteTemporario(dependenteTempIdParaEditar) {
    const formElement = document.querySelector(`#modal-content-area #actual-form-dependente`);
    if (!formElement) { console.error('Formulário de dependente não encontrado no modal.'); return; }

    if (!formElement.checkValidity()) {
        formElement.reportValidity();
        return;
    }

    const dataDependente = {
        id: formElement.elements['dep-id'].value || `dep-temp-${proximoIdDependenteTemp++}`,
        nome: formElement.elements['dep-nome'].value,
        dataNascimento: formElement.elements['dep-data-nascimento'].value,
        parentesco: formElement.elements['dep-parentesco'].value,
        cpf: formElement.elements['dep-cpf'].value
    };

    if (editandoDependenteTempId) {
        const index = dependentesTemporarios.findIndex(d => d.id === editandoDependenteTempId);
        if (index > -1) {
            dependentesTemporarios[index] = dataDependente;
        }
    } else {
        dependentesTemporarios.push(dataDependente);
    }

    editandoDependenteTempId = null;
    closeModal();

    const tabelaDependentesNoModalPrincipal = document.querySelector('#modal-content-area #table-dependentes-temp');
    if (tabelaDependentesNoModalPrincipal) {
        renderizarTabelaDependentesTemporarios(tabelaDependentesNoModalPrincipal);
    } else {
        console.warn("Tabela de dependentes temporários não encontrada no DOM visível para atualização imediata.");
    }
}

export function removerDependenteTemporario(dependenteTempId) {
    if (confirm('Tem certeza que deseja remover este dependente da lista?')) {
        dependentesTemporarios = dependentesTemporarios.filter(d => d.id !== dependenteTempId);
        const tabelaDependentesNoModalPrincipal = document.querySelector('#modal-content-area #table-dependentes-temp');
        if (tabelaDependentesNoModalPrincipal) {
            renderizarTabelaDependentesTemporarios(tabelaDependentesNoModalPrincipal);
        }
    }
}

function renderizarTabelaDependentesTemporarios(tbodyEl) {
    if (!tbodyEl) {
        const modalPrincipalForm = document.querySelector('#modal-content-area #actual-form-funcionario');
        if(modalPrincipalForm) {
            tbodyEl = modalPrincipalForm.querySelector('#table-dependentes-temp');
        }
        if (!tbodyEl) {
            console.error("Elemento tbody da tabela de dependentes temporários não encontrado.");
            return;
        }
    }
    tbodyEl.innerHTML = '';

    if (dependentesTemporarios.length === 0) {
        tbodyEl.innerHTML = `<tr id="nenhum-dependente-temp-placeholder"><td colspan="5" class="px-3 py-4 text-center text-gray-500 dark:text-gray-400">Nenhum dependente adicionado.</td></tr>`;
    } else {
        dependentesTemporarios.forEach(dep => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/40";
            tr.innerHTML = `
                <td class="px-3 py-1.5 whitespace-nowrap">${dep.nome}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">${dep.dataNascimento ? new Date(dep.dataNascimento + "T00:00:00").toLocaleDateString('pt-BR') : '-'}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">${dep.parentesco ? dep.parentesco.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : '-'}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">${dep.cpf || '-'}</td>
                <td class="px-3 py-1.5 whitespace-nowrap text-center space-x-1">
                    <button type="button" onclick="openModalEditarDependente('${dep.id}')" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-0.5" title="Editar Dependente"><i class="fas fa-edit fa-fw text-xs"></i></button>
                    <button type="button" onclick="removerDependenteTemporario('${dep.id}')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0.5" title="Remover Dependente"><i class="fas fa-trash fa-fw text-xs"></i></button>
                </td>
            `;
            tbodyEl.appendChild(tr);
        });
    }
}

// --- ABA: FOLHA DE PAGAMENTO --- (Lógica movida para rhFolhaPagamentoController.js)

// As funções abaixo são placeholders ou pontos de entrada que podem permanecer aqui
// ou serem movidos se fizer sentido para a organização da aba de folha de pagamento
// quando ela for completamente implementada em seu próprio controller.

export function openModalHolerite(funcionarioId) {
    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    const nomeFunc = funcionario ? funcionario.nome : `ID ${funcionarioId}`;
    
    const tabButtonFolha = document.querySelector('button[data-tab-target="rh-folha-pagamento-tab-content"]');
    if (tabButtonFolha) tabButtonFolha.click(); // Tenta mudar para a aba

    setTimeout(async () => { // Delay para permitir carregamento da aba
        try {
            const module = await import('./rhFolhaPagamentoController.js');
            if (module && typeof module.selecionarFuncionarioECompetenciaParaHolerite === 'function') {
                 module.selecionarFuncionarioECompetenciaParaHolerite(funcionarioId);
            } else {
                 // Fallback se a função não existir ou o controller não carregar
                 const selectFuncFolha = document.getElementById('folha-funcionario');
                 if(selectFuncFolha) selectFuncFolha.value = funcionarioId;
                 alert(`Holerite para ${nomeFunc}: Selecione o mês e clique em "Gerar/Visualizar Holerite".`);
            }
        } catch(e) {
            console.error("Erro ao tentar chamar controller da folha:", e);
            const selectFuncFolha = document.getElementById('folha-funcionario');
            if(selectFuncFolha) selectFuncFolha.value = funcionarioId;
            alert(`Holerite para ${nomeFunc}: Selecione o mês e clique em "Gerar/Visualizar Holerite".`);
        }
    }, 200); // Ajuste o delay conforme necessário
}

export function openModalFerias(funcionarioId) {
    const funcionario = listaFuncionariosSimulados.find(f => f.id === funcionarioId);
    const nomeFunc = funcionario ? funcionario.nome : `ID ${funcionarioId}`;
    alert(`Funcionalidade "Gerenciar Férias" para ${nomeFunc} a ser implementada.`);
    // Futuramente, poderia mudar para a aba de Férias e selecionar o funcionário
    // const tabButtonFerias = document.querySelector('button[data-tab-target="rh-ferias-tab-content"]');
    // if (tabButtonFerias) tabButtonFerias.click();
}

// No final do rhFuncionariosController.js
export function getListaFuncionariosSimulados() {
    return listaFuncionariosSimulados; // Retorna a lista que ele gerencia
}