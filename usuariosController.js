// usuariosController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal, initializeTabs } from './uiUtils.js'; // Funções do modal genérico e abas
import { loadContent, getCurrentSection } from './contentLoader.js';   // Para recarregar a seção, se necessário

// --- DADOS SIMULADOS ---
let listaUsuarios = [
    { id: 'user-admin', nome: 'Administrador do Sistema', login: 'admin', email: 'admin@imppeto.com', perfilId: 'perfil-admin', statusAtivo: true, ultimoAcesso: '2025-05-13T10:00:00Z' },
    { id: 'user-vendedor-01', nome: 'Carlos Vendedor', login: 'carlos.vendas', email: 'carlos@imppeto.com', perfilId: 'perfil-vendedor', statusAtivo: false, ultimoAcesso: '2025-05-10T15:30:00Z' },
    { id: 'user-estoquista-01', nome: 'Mariana Estoque', login: 'mari.estoque', email: 'mariana@imppeto.com', perfilId: 'perfil-estoquista', statusAtivo: true, ultimoAcesso: '2025-05-12T09:15:00Z' },
];

let listaPerfis = [
    { id: 'perfil-admin', nome: 'Administrador', descricao: 'Acesso total ao sistema.', numUsuarios: 1, permissoes: { 'clientes': ['visualizar', 'criar', 'editar', 'excluir'], 'pecas': ['visualizar', 'criar', 'editar', 'excluir'], 'configuracoes': ['*'] } },
    { id: 'perfil-vendedor', nome: 'Vendedor', descricao: 'Acesso a vendas, clientes e consulta de peças.', numUsuarios: 1, permissoes: { 'clientes': ['visualizar', 'criar', 'editar'], 'pecas': ['visualizar'], 'pedido-venda': ['visualizar', 'criar', 'editar'] } },
    { id: 'perfil-estoquista', nome: 'Estoquista', descricao: 'Acesso a entrada, saída e inventário de peças.', numUsuarios: 1, permissoes: { 'pecas': ['visualizar'], 'entrada-pecas': ['*'], 'saida-pecas': ['*'], 'inventario': ['*'] } }
];

// Estrutura de módulos e permissões disponíveis no sistema (para renderizar no modal de perfil)
const modulosPermissaoConfig = {
    dashboard: { label: 'Dashboard', acoes: { visualizar: 'Visualizar Dashboard' } },
    clientes: { label: 'Clientes', acoes: { visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', excluir: 'Excluir' } },
    pecas: { label: 'Peças', acoes: { visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', excluir: 'Excluir' } },
    fornecedores: { label: 'Fornecedores', acoes: { visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', excluir: 'Excluir' } },
    estoque: { 
        label: 'Estoque (Geral)', 
        submodulos: {
            'entrada-pecas': { label: 'Entrada de Peças', acoes: { registrar: 'Registrar Entrada', visualizar: 'Visualizar Histórico' } },
            'saida-pecas': { label: 'Saída de Peças', acoes: { registrar: 'Registrar Saída', visualizar: 'Visualizar Histórico' } },
            'inventario': { label: 'Inventário', acoes: { visualizar: 'Visualizar', ajustar: 'Ajustar Estoque', iniciar_contagem: 'Iniciar Contagem'} },
            'garantia-validade': { label: 'Garantia e Validade', acoes: { visualizar: 'Visualizar', gerenciar: 'Gerenciar' } }
        } 
    },
    vendas: {
        label: 'Vendas (Geral)',
        submodulos: {
            'pedido-venda': { label: 'Pedidos de Venda', acoes: { visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', cancelar: 'Cancelar' } },
            'emissao-nf': { label: 'Emissão de NF-e', acoes: { emitir: 'Emitir NF-e', visualizar: 'Visualizar Histórico', cancelar_nfe: 'Cancelar NF-e' } },
            'comissoes': { label: 'Comissões', acoes: { visualizar: 'Visualizar', processar_pagamento: 'Processar Pagamento' } }
        }
    },
    configuracoes: { 
        label: 'Configurações (Geral)', 
        acoes: {'*': 'Acesso Total às Configurações'}, // Permissão "coringa"
        submodulos: {
            'usuarios': { label: 'Usuários e Perfis', acoes: { visualizar: 'Visualizar', gerenciar: 'Gerenciar Usuários e Perfis' } },
            'preferencias': { label: 'Preferências da Loja', acoes: { visualizar: 'Visualizar', editar: 'Editar Preferências' } }
        }
    }
};


/**
 * Inicializa a página de Usuários e Perfis.
 */
export function initializeUsuariosPerfis() {
    console.log("Inicializando Usuários e Perfis...");
    initializeTabs(); // Para as abas Usuários/Perfis
    
    carregarUsuarios();
    carregarPerfis();
}

// --- LÓGICA DE USUÁRIOS ---

function carregarUsuarios() {
    const tbody = document.getElementById('table-body-usuarios');
    if (!tbody) { console.error("Tabela #table-body-usuarios não encontrada."); return; }
    tbody.innerHTML = '';

    if (listaUsuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-users-slash fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhum usuário cadastrado.</td></tr>`;
        return;
    }

    listaUsuarios.forEach(user => {
        const perfil = listaPerfis.find(p => p.id === user.perfilId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${user.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${user.login}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${user.email}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${perfil ? perfil.nome : 'N/A'}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.statusAtivo ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}">
                    ${user.statusAtivo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
                <button onclick="editarUsuario('${user.id}')" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Editar Usuário"><i class="fas fa-edit fa-fw"></i></button>
                <button onclick="resetarSenhaUsuario('${user.id}')" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="Resetar Senha"><i class="fas fa-key fa-fw"></i></button>
                ${user.statusAtivo ? 
                    `<button onclick="alternarStatusUsuario('${user.id}', false)" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" title="Desativar Usuário"><i class="fas fa-user-slash fa-fw"></i></button>` :
                    `<button onclick="alternarStatusUsuario('${user.id}', true)" class="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1" title="Ativar Usuário"><i class="fas fa-user-check fa-fw"></i></button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function openModalNovoUsuario() {
    const formId = 'form-usuario-modal-content';
    const actualFormId = 'actual-form-usuario';

    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de usuário não encontrado."); return; }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtmlContainer.innerHTML; // Pega o template

    // Garante que os campos de senha sejam obrigatórios para novo usuário
    tempDiv.querySelector('#senha-obrigatoria-ind').style.display = 'inline';
    tempDiv.querySelector('#confirma-senha-obrigatoria-ind').style.display = 'inline';
    tempDiv.querySelector('#usuario-senha').required = true;
    tempDiv.querySelector('#usuario-confirmar-senha').required = true;
    tempDiv.querySelector('#usuario-id').value = ''; // Limpa ID para novo usuário
    tempDiv.querySelector('#usuario-status-ativo').checked = true; // Padrão ativo

    // Popula select de perfis
    const perfilSelect = tempDiv.querySelector('#usuario-perfil');
    if (perfilSelect) {
        perfilSelect.innerHTML = '<option value="">Selecione um perfil...</option>'; // Limpa e adiciona placeholder
        listaPerfis.forEach(perfil => {
            const option = document.createElement('option');
            option.value = perfil.id;
            option.textContent = perfil.nome;
            perfilSelect.appendChild(option);
        });
    }

    openModal('Novo Usuário', tempDiv.innerHTML, {
        iconClass: 'fas fa-user-plus text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        confirmText: 'Salvar Usuário',
        onConfirm: () => salvarUsuario(null) // Passa null como ID para indicar novo usuário
    });
}

export function editarUsuario(usuarioId) {
    const usuario = listaUsuarios.find(u => u.id === usuarioId);
    if (!usuario) { alert('Usuário não encontrado.'); return; }

    const formId = 'form-usuario-modal-content';
    const actualFormId = 'actual-form-usuario';
    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de usuário não encontrado."); return; }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtmlContainer.innerHTML;

    // Senha não é obrigatória na edição (só se for alterar)
    tempDiv.querySelector('#senha-obrigatoria-ind').style.display = 'none';
    tempDiv.querySelector('#confirma-senha-obrigatoria-ind').style.display = 'none';
    tempDiv.querySelector('#usuario-senha').required = false;
    tempDiv.querySelector('#usuario-confirmar-senha').required = false;

    tempDiv.querySelector('#usuario-id').value = usuario.id;
    tempDiv.querySelector('#usuario-nome').value = usuario.nome;
    tempDiv.querySelector('#usuario-login').value = usuario.login;
    // tempDiv.querySelector('#usuario-login').readOnly = true; // Login não pode ser editado
    tempDiv.querySelector('#usuario-login').classList.add('bg-gray-100', 'dark:bg-gray-800', 'cursor-not-allowed');


    tempDiv.querySelector('#usuario-email').value = usuario.email;
    tempDiv.querySelector('#usuario-status-ativo').checked = usuario.statusAtivo;

    const perfilSelect = tempDiv.querySelector('#usuario-perfil');
    if (perfilSelect) {
        perfilSelect.innerHTML = '<option value="">Selecione um perfil...</option>';
        listaPerfis.forEach(perfil => {
            const option = document.createElement('option');
            option.value = perfil.id;
            option.textContent = perfil.nome;
            if (perfil.id === usuario.perfilId) option.selected = true;
            perfilSelect.appendChild(option);
        });
    }
    
    openModal(`Editar Usuário: ${usuario.nome}`, tempDiv.innerHTML, {
        iconClass: 'fas fa-user-edit text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => salvarUsuario(usuarioId)
    });
}

function salvarUsuario(usuarioId) { // null para novo, ID para editar
    const formElement = document.querySelector(`#modal-content-area #actual-form-usuario`);
    if (!formElement) { console.error('Formulário de usuário não encontrado no modal.'); return; }

    if (!formElement.checkValidity()) {
        formElement.reportValidity(); return;
    }

    const senha = formElement.elements['usuario-senha'].value;
    const confirmaSenha = formElement.elements['usuario-confirmar-senha'].value;

    if (senha && senha !== confirmaSenha) {
        alert('As senhas não coincidem.');
        formElement.elements['usuario-confirmar-senha'].focus();
        return;
    }
    if (!usuarioId && !senha) { // Novo usuário sem senha
        alert('A senha é obrigatória para novos usuários.');
        formElement.elements['usuario-senha'].focus();
        return;
    }

    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    data.statusAtivo = formElement.elements['usuario-status-ativo'].checked;

    if (!data['usuario-senha']) { // Não envia senha se estiver vazia (para edição)
        delete data['usuario-senha'];
        delete data['usuario-confirmar-senha'];
    }
    
    if (usuarioId) { // Editando
        console.log(`Atualizando usuário ID: ${usuarioId}`, data);
        // SIMULAÇÃO: Atualizar na lista
        const index = listaUsuarios.findIndex(u => u.id === usuarioId);
        if (index > -1) {
            listaUsuarios[index] = { ...listaUsuarios[index], ...data, perfilId: data['usuario-perfil'] };
             if(data['usuario-senha']) listaUsuarios[index].senha = 'criptografada'; // Simula
        }
        alert('Usuário atualizado com sucesso! (simulação)');
    } else { // Novo
        data.id = `user-${Date.now()}`; // Simula ID único
        data.ultimoAcesso = new Date().toISOString();
        if(data['usuario-senha']) data.senha = 'criptografada'; // Simula
        listaUsuarios.push(data);
        console.log('Salvando novo usuário:', data);
        alert('Usuário criado com sucesso! (simulação)');
    }
    closeModal();
    carregarUsuarios();
}

export function resetarSenhaUsuario(usuarioId) {
    const usuario = listaUsuarios.find(u => u.id === usuarioId);
    if (!usuario) { alert('Usuário não encontrado.'); return; }

    if (confirm(`Tem certeza que deseja resetar a senha do usuário ${usuario.nome}?\nUma nova senha aleatória será gerada (simulação).`)) {
        console.log(`Resetando senha para usuário ID: ${usuarioId}`);
        // SIMULAÇÃO
        alert(`Senha para ${usuario.nome} resetada para "novaSenha123" (simulação). O usuário deve alterá-la no próximo login.`);
        // Em um app real, você geraria uma senha segura, salvaria o hash e talvez enviasse por email ou mostrasse uma vez.
    }
}

export function alternarStatusUsuario(usuarioId, ativar) {
    const usuario = listaUsuarios.find(u => u.id === usuarioId);
    if (!usuario) { alert('Usuário não encontrado.'); return; }

    const acao = ativar ? "ativar" : "desativar";
    if (confirm(`Tem certeza que deseja ${acao} o usuário ${usuario.nome}?`)) {
        usuario.statusAtivo = ativar;
        console.log(`Usuário ${usuarioId} ${acao}do.`);
        alert(`Usuário ${acao} com sucesso! (simulação)`);
        carregarUsuarios(); // Recarrega a tabela para refletir a mudança
    }
}

// --- LÓGICA DE PERFIS DE ACESSO ---

function carregarPerfis() {
    const tbody = document.getElementById('table-body-perfis');
    if (!tbody) { console.error("Tabela #table-body-perfis não encontrada."); return; }
    tbody.innerHTML = '';

    if (listaPerfis.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-user-shield fa-2x mb-2 text-gray-400 dark:text-gray-500"></i><br>Nenhum perfil de acesso cadastrado.</td></tr>`;
        return;
    }

    listaPerfis.forEach(perfil => {
        // Simula contagem de usuários no perfil
        const numUsuariosNoPerfil = listaUsuarios.filter(u => u.perfilId === perfil.id).length;
        perfil.numUsuarios = numUsuariosNoPerfil; // Atualiza o objeto simulado

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${perfil.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-md truncate" title="${perfil.descricao}">${perfil.descricao}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${perfil.numUsuarios}</td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
                <button onclick="editarPerfil('${perfil.id}')" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Editar Perfil e Permissões"><i class="fas fa-tasks fa-fw"></i></button>
                ${perfil.numUsuarios === 0 ? // Só permite excluir se não houver usuários
                `<button onclick="excluirPerfil('${perfil.id}')" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1" title="Excluir Perfil"><i class="fas fa-trash fa-fw"></i></button>` :
                `<button class="text-gray-300 dark:text-gray-600 p-1 cursor-not-allowed" title="Não pode excluir: perfil em uso"><i class="fas fa-trash fa-fw"></i></button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarPermissoes(containerEl, permissoesSalvas = {}) {
    containerEl.innerHTML = ''; // Limpa
    for (const moduloKey in modulosPermissaoConfig) {
        const modulo = modulosPermissaoConfig[moduloKey];
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded';
        
        const legend = document.createElement('legend');
        legend.className = 'text-sm font-semibold text-gray-700 dark:text-gray-200 px-1';
        legend.textContent = modulo.label;
        fieldset.appendChild(legend);

        const permissoesModuloSalvas = permissoesSalvas[moduloKey] || [];

        if (modulo.acoes) {
            for (const acaoKey in modulo.acoes) {
                const acaoLabel = modulo.acoes[acaoKey];
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'flex items-center mt-1 ml-2';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `perm-${moduloKey}-${acaoKey}`;
                checkbox.name = `permissoes[${moduloKey}][]`;
                checkbox.value = acaoKey;
                checkbox.className = 'h-4 w-4 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT';
                if (permissoesModuloSalvas === '*' || permissoesModuloSalvas.includes(acaoKey)) {
                    checkbox.checked = true;
                }
                
                const labelEl = document.createElement('label');
                labelEl.htmlFor = checkbox.id;
                labelEl.textContent = acaoLabel;
                labelEl.className = 'ml-2 block text-xs text-gray-700 dark:text-gray-300';
                
                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(labelEl);
                fieldset.appendChild(checkboxDiv);
            }
        }

        if (modulo.submodulos) {
            for (const subModuloKey in modulo.submodulos) {
                const subModulo = modulo.submodulos[subModuloKey];
                const subFieldset = document.createElement('div'); // Usar div para não aninhar fieldsets diretamente
                subFieldset.className = 'ml-4 mt-2 pt-2 border-l border-gray-200 dark:border-gray-600 pl-3';
                
                const subLegend = document.createElement('h5');
                subLegend.className = 'text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1';
                subLegend.textContent = subModulo.label;
                subFieldset.appendChild(subLegend);

                const permissoesSubModuloSalvas = permissoesModuloSalvas[subModuloKey] || [];

                for (const acaoKey in subModulo.acoes) {
                    const acaoLabel = subModulo.acoes[acaoKey];
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'flex items-center mt-1 ml-2';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `perm-${moduloKey}-${subModuloKey}-${acaoKey}`;
                    checkbox.name = `permissoes[${moduloKey}][${subModuloKey}][]`;
                    checkbox.value = acaoKey;
                    checkbox.className = 'h-4 w-4 text-primary-DEFAULT border-gray-300 rounded focus:ring-primary-DEFAULT';
                     if (permissoesModuloSalvas === '*' || permissoesSubModuloSalvas === '*' || permissoesSubModuloSalvas.includes(acaoKey)) {
                        checkbox.checked = true;
                    }

                    const labelEl = document.createElement('label');
                    labelEl.htmlFor = checkbox.id;
                    labelEl.textContent = acaoLabel;
                    labelEl.className = 'ml-2 block text-xs text-gray-700 dark:text-gray-300';
                    
                    checkboxDiv.appendChild(checkbox);
                    checkboxDiv.appendChild(labelEl);
                    subFieldset.appendChild(checkboxDiv);
                }
                fieldset.appendChild(subFieldset);
            }
        }
        containerEl.appendChild(fieldset);
    }
}

export function openModalNovoPerfil() {
    const formId = 'form-perfil-modal-content';
    const actualFormId = 'actual-form-perfil';
    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de perfil não encontrado."); return; }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtmlContainer.innerHTML;
    tempDiv.querySelector('#perfil-id').value = ''; // Novo perfil

    const permissoesContainer = tempDiv.querySelector('#permissoes-container');
    if(permissoesContainer) renderizarPermissoes(permissoesContainer);


    openModal('Novo Perfil de Acesso', tempDiv.innerHTML, {
        iconClass: 'fas fa-user-shield text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        confirmText: 'Salvar Perfil',
        onConfirm: () => salvarPerfil(null)
    });
}

export function editarPerfil(perfilId) {
    const perfil = listaPerfis.find(p => p.id === perfilId);
    if (!perfil) { alert('Perfil não encontrado.'); return; }

    const formId = 'form-perfil-modal-content';
    const actualFormId = 'actual-form-perfil';
    const formHtmlContainer = document.getElementById(formId);
    if (!formHtmlContainer) { console.error("Container do formulário de perfil não encontrado."); return; }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtmlContainer.innerHTML;

    tempDiv.querySelector('#perfil-id').value = perfil.id;
    tempDiv.querySelector('#perfil-nome').value = perfil.nome;
    tempDiv.querySelector('#perfil-descricao').value = perfil.descricao;

    const permissoesContainer = tempDiv.querySelector('#permissoes-container');
    if(permissoesContainer) renderizarPermissoes(permissoesContainer, perfil.permissoes);

    openModal(`Editar Perfil: ${perfil.nome}`, tempDiv.innerHTML, {
        iconClass: 'fas fa-tasks text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => salvarPerfil(perfilId)
    });
}

function salvarPerfil(perfilId) { // null para novo, ID para editar
    const formElement = document.querySelector(`#modal-content-area #actual-form-perfil`);
    if (!formElement) { console.error('Formulário de perfil não encontrado no modal.'); return; }

    if (!formElement.elements['perfil-nome'].value.trim()) {
        alert('O nome do perfil é obrigatório.');
        formElement.elements['perfil-nome'].focus();
        return;
    }
    
    const formData = new FormData(formElement);
    const nome = formData.get('perfil-nome');
    const descricao = formData.get('perfil-descricao');
    
    // Coletar permissões marcadas
    const permissoesColetadas = {};
    const checkboxes = formElement.querySelectorAll('#permissoes-container input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const nameParts = cb.name.match(/permissoes\[(.*?)\](?:\[(.*?)\])?\[\]/);
        if (nameParts) {
            const modulo = nameParts[1];
            const subModulo = nameParts[2];
            const acao = cb.value;

            if (subModulo) { // Permissão de submódulo
                if (!permissoesColetadas[modulo]) permissoesColetadas[modulo] = {};
                if (!permissoesColetadas[modulo][subModulo]) permissoesColetadas[modulo][subModulo] = [];
                if (permissoesColetadas[modulo][subModulo] !== '*') { // Não adiciona se já tem coringa no módulo pai
                     if(acao === '*' && modulo !== 'configuracoes') { // Cuidado com coringa em submódulo
                         permissoesColetadas[modulo][subModulo] = '*';
                     } else if (permissoesColetadas[modulo][subModulo] !== '*') {
                        permissoesColetadas[modulo][subModulo].push(acao);
                     }
                }
            } else { // Permissão de módulo principal
                if (!permissoesColetadas[modulo]) permissoesColetadas[modulo] = [];
                 if(acao === '*' || modulo === 'configuracoes' && acao === '*') { // Cuidado com coringa
                     permissoesColetadas[modulo] = '*';
                 } else if (permissoesColetadas[modulo] !== '*') {
                    permissoesColetadas[modulo].push(acao);
                 }
            }
        }
    });

    const dadosPerfil = { nome, descricao, permissoes: permissoesColetadas };

    if (perfilId) { // Editando
        console.log(`Atualizando perfil ID: ${perfilId}`, dadosPerfil);
        const index = listaPerfis.findIndex(p => p.id === perfilId);
        if (index > -1) {
            listaPerfis[index] = { ...listaPerfis[index], ...dadosPerfil };
        }
        alert('Perfil atualizado com sucesso! (simulação)');
    } else { // Novo
        dadosPerfil.id = `perfil-${Date.now()}`;
        dadosPerfil.numUsuarios = 0;
        listaPerfis.push(dadosPerfil);
        console.log('Salvando novo perfil:', dadosPerfil);
        alert('Perfil criado com sucesso! (simulação)');
    }
    closeModal();
    carregarPerfis();
}

export function excluirPerfil(perfilId) {
    const perfil = listaPerfis.find(p => p.id === perfilId);
    if (!perfil) { alert('Perfil não encontrado.'); return; }
    if (perfil.numUsuarios > 0) {
        alert(`Não é possível excluir o perfil "${perfil.nome}" pois ele está associado a ${perfil.numUsuarios} usuário(s).`);
        return;
    }

    if (confirm(`Tem certeza que deseja excluir o perfil "${perfil.nome}"?`)) {
        listaPerfis = listaPerfis.filter(p => p.id !== perfilId);
        console.log(`Perfil ${perfilId} excluído.`);
        alert(`Perfil "${perfil.nome}" excluído com sucesso! (simulação)`);
        carregarPerfis();
        // Se algum usuário estava associado a este perfil (embora a verificação acima impeça),
        // seria bom reassociá-lo a um perfil padrão ou marcá-lo como "sem perfil".
    }
}