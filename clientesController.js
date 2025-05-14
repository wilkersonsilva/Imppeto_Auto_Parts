// clientesController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js'; // Funções do modal genérico
import { loadContent, getCurrentSection } from './contentLoader.js'; // Para recarregar a seção, se necessário

/**
 * Abre o modal para adicionar um novo cliente (PF ou PJ) baseado na aba ativa.
 */
export function openModalNovoCliente() {
    const activeTabButton = document.querySelector('[data-tab-container] .tab-button.active');
    let formIdToShow = 'form-novo-cliente-pf'; // ID do DIV que contém o formulário
    let modalTitle = 'Novo Cliente - Pessoa Física';

    if (activeTabButton && activeTabButton.getAttribute('data-tab') === 'pessoa-juridica') {
        formIdToShow = 'form-novo-cliente-pj';
        modalTitle = 'Novo Cliente - Pessoa Jurídica';
    }
    
    openModal(modalTitle, formIdToShow, {
        iconClass: 'fas fa-user-plus text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-3xl', // Ajustado para formulários com mais campos
        confirmText: 'Salvar Cliente',
        onConfirm: () => {
            const actualFormId = formIdToShow.replace('form-novo-', 'actual-form-'); // ID do <form>
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);

            if (formElement) {
                if (formElement.checkValidity()) { // Validação HTML5 básica
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log('Salvando novo cliente:', data);
                    
                    // SIMULAÇÃO DE SALVAMENTO
                    // Em um app real: await api.saveClient(data);
                    alert('Cliente salvo com sucesso! (simulação)');
                    closeModal();
                    // Recarrega a lista de clientes se estiver na seção de clientes
                    if (getCurrentSection() === 'clientes') {
                        loadContent('clientes'); 
                    }
                } else {
                    formElement.reportValidity(); // Mostra as mensagens de validação do navegador
                }
            } else {
                console.error(`Formulário ${actualFormId} não encontrado no modal.`);
                alert('Erro: Formulário não encontrado.');
            }
        }
    });
}

/**
 * Exibe os detalhes de um cliente em um modal.
 * @param {string} tipoCliente - 'pf' ou 'pj'.
 * @param {string} clienteId - O ID do cliente (simulado).
 */
export function visualizarCliente(tipoCliente, clienteId) {
    console.log(`Visualizar Cliente ${tipoCliente.toUpperCase()} com ID: ${clienteId}`);
    
    let dadosCliente = {};
    let tituloModal = '';
    let htmlConteudoVisualizacao = '<p class="text-center text-gray-500 dark:text-gray-400">Dados do cliente não encontrados.</p>';

    // SIMULAÇÃO: Obter dados do cliente. Substitua pela sua lógica de busca de dados.
    if (tipoCliente === 'pf' && clienteId === 'cliente-pf-123') {
        dadosCliente = { nome: 'João Pereira da Silva', cpf: '123.456.789-00', rg: '12.345.678-9', telefone: '(11) 98765-4321', email: 'joao.silva@example.com', cep: '01000-000', logradouro: 'Rua das Palmeiras', numero: '123', complemento: 'Apto 101', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' };
        tituloModal = 'Detalhes do Cliente - Pessoa Física';
    } else if (tipoCliente === 'pj' && clienteId === 'cliente-pj-789') {
        dadosCliente = { razaoSocial: 'Transportadora Veloz Ltda.', nomeFantasia: 'Transportadora Veloz', cnpj: '12.345.678/0001-99', ie: '123.456.789.111', telefone: '(21) 3344-5566', email: 'contato@veloz.com.br', cep: '21000-000', logradouro: 'Av. Brasil', numero: '1000', complemento: 'Galpão A', bairro: 'Penha', cidade: 'Rio de Janeiro', uf: 'RJ' };
        tituloModal = 'Detalhes do Cliente - Pessoa Jurídica';
    }

    if (Object.keys(dadosCliente).length > 0) {
        htmlConteudoVisualizacao = `<div class="space-y-2 text-sm p-1">`;
        for(const [key, value] of Object.entries(dadosCliente)) {
            let label = key.replace(`cliente-${tipoCliente}-`, '').replace(/([A-Z0-9])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
             if (label.toLowerCase() === 'cpf' || label.toLowerCase() === 'cnpj' || label.toLowerCase() === 'rg' || label.toLowerCase() === 'ie' || label.toLowerCase() === 'uf' || label.toLowerCase() === 'cep') {
                label = label.toUpperCase();
            }
            htmlConteudoVisualizacao += `<div class="flex border-b border-gray-100 dark:border-gray-700 py-1.5"><strong class="w-1/3 text-gray-500 dark:text-gray-400">${label}:</strong> <span class="w-2/3 text-gray-800 dark:text-gray-200 break-all">${value || 'Não informado'}</span></div>`;
        }
        htmlConteudoVisualizacao += `</div>`;
    }

    openModal(tituloModal, htmlConteudoVisualizacao, {
        iconClass: 'fas fa-id-card text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-xl',
        hideConfirmButton: true, 
        cancelText: 'Fechar'
    });
}

/**
 * Abre o modal para editar um cliente existente, pré-preenchendo o formulário.
 * @param {string} tipoCliente - 'pf' ou 'pj'.
 * @param {string} clienteId - O ID do cliente a ser editado (simulado).
 */
export function editarCliente(tipoCliente, clienteId) {
    console.log(`Editar Cliente ${tipoCliente.toUpperCase()} com ID: ${clienteId}`);

    let dadosCliente = {};
    let formIdParaPreencherNoModal = tipoCliente === 'pf' ? 'form-novo-cliente-pf' : 'form-novo-cliente-pj';
    let modalTitle = tipoCliente === 'pf' ? 'Editar Cliente - Pessoa Física' : 'Editar Cliente - Pessoa Jurídica';
    let actualFormIdNoModal = formIdParaPreencherNoModal.replace('form-novo-', 'actual-form-');

    // SIMULAÇÃO: Buscar dados do cliente.
    if (tipoCliente === 'pf' && clienteId === 'cliente-pf-123') {
        dadosCliente = { 'cliente-pf-nome': 'João Pereira da Silva', 'cliente-pf-cpf': '123.456.789-00', 'cliente-pf-rg': '12.345.678-9', 'cliente-pf-telefone': '(11) 98765-4321', 'cliente-pf-email': 'joao.silva@example.com', 'cliente-pf-cep': '01000-000', 'cliente-pf-logradouro': 'Rua das Palmeiras', 'cliente-pf-numero': '123', 'cliente-pf-complemento': 'Apto 101', 'cliente-pf-bairro': 'Centro', 'cliente-pf-cidade': 'São Paulo', 'cliente-pf-uf': 'SP' };
    } else if (tipoCliente === 'pj' && clienteId === 'cliente-pj-789') {
        dadosCliente = { 'cliente-pj-razao': 'Transportadora Veloz Ltda.', 'cliente-pj-nomefantasia': 'Transportadora Veloz', 'cliente-pj-cnpj': '12.345.678/0001-99', 'cliente-pj-ie': '123.456.789.111', 'cliente-pj-telefone': '(21) 3344-5566', 'cliente-pj-email': 'contato@veloz.com.br', 'cliente-pj-cep': '21000-000', 'cliente-pj-logradouro': 'Av. Brasil', 'cliente-pj-numero': '1000', 'cliente-pj-complemento': 'Galpão A', 'cliente-pj-bairro': 'Penha', 'cliente-pj-cidade': 'Rio de Janeiro', 'cliente-pj-uf': 'RJ' };
    } else {
        alert('Dados do cliente não encontrados para edição.'); 
        return;
    }

    const formHtmlContainer = document.getElementById(formIdParaPreencherNoModal);
    if (!formHtmlContainer) {
        console.error(`Container do formulário '${formIdParaPreencherNoModal}' não encontrado.`); 
        alert('Erro ao carregar o formulário de edição.');
        return;
    }
    
    const originalForm = formHtmlContainer.querySelector(`#${actualFormIdNoModal}`);
    if(!originalForm) { 
        console.error(`Formulário original #${actualFormIdNoModal} não encontrado em #${formIdParaPreencherNoModal}`); 
        return; 
    }
    const formClone = originalForm.cloneNode(true);

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formClone);
    
    for (const key in dadosCliente) {
        const field = tempDiv.querySelector(`[name="${key}"]`);
        if (field) field.value = dadosCliente[key];
    }

    openModal(modalTitle, tempDiv.innerHTML, {
        iconClass: 'fas fa-edit text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-3xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormIdNoModal}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log(`Salvando alterações para Cliente ID: ${clienteId}`, data);
                    alert('Alterações salvas com sucesso! (simulação)');
                    closeModal();
                    if (getCurrentSection() === 'clientes') loadContent('clientes');
                } else {
                    formElement.reportValidity();
                }
            } else {
                 console.error(`Formulário ${actualFormIdNoModal} não encontrado no modal ao tentar salvar.`);
            }
        }
    });
}

/**
 * Exibe um modal de confirmação para excluir um cliente.
 * @param {string} tipoCliente - 'pf' ou 'pj'.
 * @param {string} clienteId - O ID do cliente a ser excluído (simulado).
 */
export function excluirCliente(tipoCliente, clienteId) {
    let nomeClienteParaExibicao = clienteId;
    if (tipoCliente === 'pf' && clienteId === 'cliente-pf-123') {
        nomeClienteParaExibicao = 'João Pereira da Silva';
    } else if (tipoCliente === 'pj' && clienteId === 'cliente-pj-789') {
        nomeClienteParaExibicao = 'Transportadora Veloz Ltda.';
    }

    openModal(
        'Confirmar Exclusão de Cliente', 
        `<p class="text-sm text-gray-600 dark:text-gray-300">Tem certeza que deseja excluir o cliente <strong class="font-medium">${nomeClienteParaExibicao}</strong>?<br>Esta ação não poderá ser desfeita.</p>`, 
        {
            iconClass: 'fas fa-exclamation-triangle text-error',
            modalSize: 'sm:max-w-md',
            confirmText: 'Excluir Cliente',
            cancelText: 'Cancelar',
            onConfirm: () => {
                console.log(`Excluindo Cliente ${tipoCliente.toUpperCase()} com ID: ${clienteId}`);
                alert(`Cliente ${nomeClienteParaExibicao} excluído com sucesso! (simulação)`);
                closeModal();
                if (getCurrentSection() === 'clientes') loadContent('clientes');
            }
        }
    );
}

/**
 * Busca um CEP usando a API ViaCEP e preenche os campos de endereço no formulário do modal.
 * @param {string} tipoClientePrefix - 'pf' ou 'pj', para identificar os campos corretos.
 */
export async function buscarCep(tipoClientePrefix) {
    const modalContentArea = document.getElementById('modal-content-area');
    if (!modalContentArea) { 
        console.error('Área de conteúdo do modal não encontrada para buscar CEP.'); 
        return; 
    }

    const cepInput = modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-cep`);
    if (!cepInput) { 
        console.error(`Campo de CEP #cliente-${tipoClientePrefix}-cep não encontrado no modal.`); 
        return; 
    }
    const cepValue = cepInput.value;
    
    if (!cepValue || cepValue.replace(/\D/g, '').length !== 8) {
        alert('Por favor, insira um CEP válido (8 dígitos).');
        cepInput.focus();
        return;
    }

    const fieldsToFill = {
        logradouro: modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-logradouro`),
        bairro: modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-bairro`),
        cidade: modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-cidade`),
        uf: modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-uf`)
    };
    
    Object.values(fieldsToFill).forEach(field => { if(field) field.value = ''; });
    
    const buscarCepButton = modalContentArea.querySelector(`button[onclick="buscarCep('${tipoClientePrefix}')"]`);
    let originalButtonText;
    if (buscarCepButton) {
        originalButtonText = buscarCepButton.innerHTML;
        buscarCepButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Buscando...';
        buscarCepButton.disabled = true;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue.replace(/\D/g, '')}/json/`);
        
        if (buscarCepButton) {
            buscarCepButton.innerHTML = originalButtonText;
            buscarCepButton.disabled = false;
        }

        if (!response.ok) throw new Error('Não foi possível conectar ao serviço de CEP.');
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado ou inválido.');
        } else {
            if (fieldsToFill.logradouro) fieldsToFill.logradouro.value = data.logradouro || '';
            if (fieldsToFill.bairro) fieldsToFill.bairro.value = data.bairro || '';
            if (fieldsToFill.cidade) fieldsToFill.cidade.value = data.localidade || '';
            if (fieldsToFill.uf) fieldsToFill.uf.value = data.uf || '';
            
            const numeroField = modalContentArea.querySelector(`#cliente-${tipoClientePrefix}-numero`);
            if(numeroField) numeroField.focus();
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert(`Erro ao buscar CEP: ${error.message}`);
        if (buscarCepButton && originalButtonText) { // Restaura botão em caso de erro na requisição
             buscarCepButton.innerHTML = originalButtonText;
             buscarCepButton.disabled = false;
        }
    }
}