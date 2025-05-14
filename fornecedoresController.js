// fornecedoresController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js'; // Funções do modal genérico
import { loadContent, getCurrentSection } from './contentLoader.js'; // Para recarregar a seção, se necessário

/**
 * Abre o modal para adicionar um novo fornecedor.
 */
export function openModalNovoFornecedor() {
    const formId = 'form-fornecedor-modal-content'; // ID do DIV que contém o formulário no _fornecedores_content.html
    const actualFormId = 'actual-form-fornecedor'; // ID do <form> em si

    // Garante que o campo fornecedor-id (usado para edição) esteja limpo
    const formHtmlContainer = document.getElementById(formId);
    if (formHtmlContainer) {
        const templateForm = formHtmlContainer.querySelector(`#${actualFormId}`);
        if (templateForm) {
            const hiddenIdField = templateForm.querySelector('#fornecedor-id');
            if (hiddenIdField) hiddenIdField.value = '';
        }
    }

    openModal('Novo Fornecedor', formId, {
        iconClass: 'fas fa-truck-loading text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-3xl', // Ajuste conforme a necessidade do formulário
        confirmText: 'Salvar Fornecedor',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log('Salvando novo fornecedor:', data);
                    
                    // SIMULAÇÃO DE SALVAMENTO
                    // Em um app real: await api.saveFornecedor(data);
                    alert('Fornecedor salvo com sucesso! (simulação)');
                    closeModal();
                    // Recarrega a lista de fornecedores se estiver na seção correta
                    if (getCurrentSection() === 'fornecedores') {
                        loadContent('fornecedores'); 
                    }
                } else {
                    formElement.reportValidity();
                }
            } else {
                console.error(`Formulário ${actualFormId} não encontrado no modal.`);
                alert('Erro: Formulário de fornecedor não encontrado.');
            }
        }
    });
}

/**
 * Exibe os detalhes de um fornecedor em um modal.
 * @param {string} fornecedorId - O ID do fornecedor a ser visualizado (simulado).
 */
export function visualizarFornecedor(fornecedorId) {
    console.log(`Visualizar Fornecedor com ID: ${fornecedorId}`);
    
    // SIMULAÇÃO: Buscar dados do fornecedor.
    let dadosFornecedor = {};
    let tituloModal = 'Detalhes do Fornecedor';

    if (fornecedorId === 'fornecedor-001') {
        dadosFornecedor = {
            id: 'fornecedor-001',
            razaoSocial: 'Peças Express Distribuidora Ltda ME',
            nomeFantasia: 'Peças Express',
            cnpj: '01.234.567/0001-88',
            ie: '123.456.789-00',
            contatoPrincipal: 'Ana Costa',
            ramoAtividade: 'Distribuição de Peças Automotivas Linha Pesada',
            telefone: '(31) 3333-4444',
            email: 'ana.costa@pecasexpress.com.br',
            website: 'www.pecasexpress.com.br',
            cep: '30100-000',
            logradouro: 'Av. Principal',
            numero: '1500',
            complemento: 'Sala 10',
            bairro: 'Centro',
            cidade: 'Belo Horizonte',
            uf: 'MG',
            condicoesPagamento: '30/60 DDL',
            obs: 'Fornecedor parceiro para filtros e componentes de motor.'
        };
        tituloModal = `Detalhes - ${dadosFornecedor.nomeFantasia || dadosFornecedor.razaoSocial}`;
    } else if (fornecedorId === 'fornecedor-002') {
         dadosFornecedor = {
            id: 'fornecedor-002',
            razaoSocial: 'Importadora de Rolamentos Técnicos S.A.',
            nomeFantasia: 'IRT Rolamentos',
            cnpj: '98.765.432/0001-11',
            ie: 'ISENTO',
            contatoPrincipal: 'Sr. Ricardo Alves',
            ramoAtividade: 'Importação e Distribuição de Rolamentos Industriais e Automotivos',
            telefone: '(41) 2222-1111',
            email: 'ricardo.alves@irtrolamentos.com',
            website: 'www.irtrolamentos.com.br',
            cep: '80500-000',
            logradouro: 'Rua dos Importadores',
            numero: '77A',
            complemento: '',
            bairro: 'Distrito Industrial',
            cidade: 'Curitiba',
            uf: 'PR',
            condicoesPagamento: 'Boleto 45 DDL',
            obs: 'Especializado em rolamentos para eixos e transmissões.'
        };
        tituloModal = `Detalhes - ${dadosFornecedor.nomeFantasia || dadosFornecedor.razaoSocial}`;
    } else {
        openModal('Erro', '<p>Dados do fornecedor não encontrados.</p>', {iconClass: 'fas fa-exclamation-circle text-error'});
        return;
    }

    let htmlConteudoVisualizacao = `<div class="space-y-2 text-sm p-1">`;
    for (const [key, value] of Object.entries(dadosFornecedor)) {
        if (key === 'id') continue; // Não mostra o ID interno na visualização
        let label = key.replace('fornecedor-', '').replace(/([A-Z0-9])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
         if (['Cnpj', 'Ie', 'Uf', 'Cep'].includes(label)) {
            label = label.toUpperCase();
        }
        htmlConteudoVisualizacao += `<div class="flex border-b border-gray-100 dark:border-gray-700 py-1.5"><strong class="w-2/5 min-w-[150px] text-gray-500 dark:text-gray-400">${label}:</strong> <span class="w-3/5 text-gray-800 dark:text-gray-200 break-all">${value || 'Não informado'}</span></div>`;
    }
    htmlConteudoVisualizacao += `</div>`;

    openModal(tituloModal, htmlConteudoVisualizacao, {
        iconClass: 'fas fa-building text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-2xl',
        hideConfirmButton: true,
        cancelText: 'Fechar'
    });
}

/**
 * Abre o modal para editar um fornecedor existente, pré-preenchendo o formulário.
 * @param {string} fornecedorId - O ID do fornecedor a ser editado (simulado).
 */
export function editarFornecedor(fornecedorId) {
    console.log(`Editar Fornecedor com ID: ${fornecedorId}`);
    const formContainerId = 'form-fornecedor-modal-content';
    const actualFormId = 'actual-form-fornecedor';

    // SIMULAÇÃO: Buscar dados do fornecedor.
    let dadosParaEdicao = {};
    let tituloModal = 'Editar Fornecedor';

    if (fornecedorId === 'fornecedor-001') {
        dadosParaEdicao = {
            'fornecedor-id': fornecedorId,
            'fornecedor-razao-social': 'Peças Express Distribuidora Ltda ME',
            'fornecedor-nome-fantasia': 'Peças Express',
            'fornecedor-cnpj': '01.234.567/0001-88',
            'fornecedor-ie': '123.456.789-00',
            'fornecedor-contato-principal': 'Ana Costa',
            'fornecedor-ramo-atividade': 'Distribuição de Peças Automotivas Linha Pesada',
            'fornecedor-telefone': '(31) 3333-4444',
            'fornecedor-email': 'ana.costa@pecasexpress.com.br',
            'fornecedor-website': 'www.pecasexpress.com.br',
            'fornecedor-cep': '30100-000',
            'fornecedor-logradouro': 'Av. Principal',
            'fornecedor-numero': '1500',
            'fornecedor-complemento': 'Sala 10',
            'fornecedor-bairro': 'Centro',
            'fornecedor-cidade': 'Belo Horizonte',
            'fornecedor-uf': 'MG',
            'fornecedor-condicoes-pagamento': '30/60 DDL',
            'fornecedor-obs': 'Fornecedor parceiro para filtros e componentes de motor.'
        };
        tituloModal = `Editar - ${dadosParaEdicao['fornecedor-nome-fantasia'] || dadosParaEdicao['fornecedor-razao-social']}`;
    } else if (fornecedorId === 'fornecedor-002') {
        dadosParaEdicao = {
            'fornecedor-id': fornecedorId,
            'fornecedor-razao-social': 'Importadora de Rolamentos Técnicos S.A.',
            'fornecedor-nome-fantasia': 'IRT Rolamentos',
            'fornecedor-cnpj': '98.765.432/0001-11',
            'fornecedor-ie': 'ISENTO',
            'fornecedor-contato-principal': 'Sr. Ricardo Alves',
            'fornecedor-ramo-atividade': 'Importação e Distribuição de Rolamentos Industriais e Automotivos',
            'fornecedor-telefone': '(41) 2222-1111',
            'fornecedor-email': 'ricardo.alves@irtrolamentos.com',
            'fornecedor-website': 'www.irtrolamentos.com.br',
            'fornecedor-cep': '80500-000',
            'fornecedor-logradouro': 'Rua dos Importadores',
            'fornecedor-numero': '77A',
            'fornecedor-complemento': '',
            'fornecedor-bairro': 'Distrito Industrial',
            'fornecedor-cidade': 'Curitiba',
            'fornecedor-uf': 'PR',
            'fornecedor-condicoes-pagamento': 'Boleto 45 DDL',
            'fornecedor-obs': 'Especializado em rolamentos para eixos e transmissões.'
        };
        tituloModal = `Editar - ${dadosParaEdicao['fornecedor-nome-fantasia'] || dadosParaEdicao['fornecedor-razao-social']}`;
    } else {
        alert('Dados do fornecedor não encontrados para edição.');
        return;
    }
    
    const formHtmlContainer = document.getElementById(formContainerId);
    if (!formHtmlContainer) { 
        console.error(`Container do formulário '${formContainerId}' não encontrado.`); 
        return; 
    }
    
    const originalForm = formHtmlContainer.querySelector(`#${actualFormId}`);
    if(!originalForm) { 
        console.error(`Formulário original #${actualFormId} não encontrado em #${formContainerId}`); 
        return; 
    }
    const formClone = originalForm.cloneNode(true);

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(formClone);
    
    for (const key in dadosParaEdicao) {
        const field = tempDiv.querySelector(`[name="${key}"]`);
        if (field) field.value = dadosParaEdicao[key];
    }
    // Preenche o campo oculto 'fornecedor-id'
    const hiddenIdFieldInClone = tempDiv.querySelector('#fornecedor-id');
    if (hiddenIdFieldInClone) hiddenIdFieldInClone.value = fornecedorId;

    openModal(tituloModal, tempDiv.innerHTML, {
        iconClass: 'fas fa-edit text-primary-DEFAULT dark:text-primary-light',
        modalSize: 'sm:max-w-3xl',
        confirmText: 'Salvar Alterações',
        onConfirm: () => {
            const formElement = document.querySelector(`#modal-content-area #${actualFormId}`);
            if (formElement) {
                if (formElement.checkValidity()) {
                    const formData = new FormData(formElement);
                    const data = Object.fromEntries(formData.entries());
                    console.log(`Salvando alterações para Fornecedor ID: ${data['fornecedor-id'] || fornecedorId}`, data);
                    
                    // SIMULAÇÃO DE ATUALIZAÇÃO
                    alert('Alterações do fornecedor salvas com sucesso! (simulação)');
                    closeModal();
                    if (getCurrentSection() === 'fornecedores') loadContent('fornecedores');
                } else {
                    formElement.reportValidity();
                }
            } else {
                 console.error(`Formulário ${actualFormId} não encontrado no modal ao tentar salvar.`);
            }
        }
    });
}

/**
 * Exibe um modal de confirmação para excluir um fornecedor.
 * @param {string} fornecedorId - O ID do fornecedor a ser excluído (simulado).
 */
export function excluirFornecedor(fornecedorId) {
    // SIMULAÇÃO: Obter nome/razão social para a mensagem de confirmação
    let nomeFornecedorParaExibicao = `ID ${fornecedorId}`;
    if (fornecedorId === 'fornecedor-001') {
        nomeFornecedorParaExibicao = 'Peças Express Distribuidora';
    } else if (fornecedorId === 'fornecedor-002') {
        nomeFornecedorParaExibicao = 'IRT Rolamentos';
    }

    openModal( 
        'Confirmar Exclusão de Fornecedor', 
        `<p class="text-sm text-gray-600 dark:text-gray-300">Tem certeza que deseja excluir o fornecedor <strong class="font-medium">${nomeFornecedorParaExibicao}</strong>?<br>Esta ação não poderá ser desfeita.</p>`, 
        {
            iconClass: 'fas fa-exclamation-triangle text-error', 
            modalSize: 'sm:max-w-md', 
            confirmText: 'Excluir Fornecedor', 
            cancelText: 'Cancelar',
            onConfirm: () => {
                console.log(`Excluindo Fornecedor com ID: ${fornecedorId}`);
                // SIMULAÇÃO DE EXCLUSÃO
                alert(`Fornecedor ${nomeFornecedorParaExibicao} excluído com sucesso! (simulação)`);
                closeModal();
                if (getCurrentSection() === 'fornecedores') loadContent('fornecedores');
            }
        }
    );
}


/**
 * Busca um CEP usando a API ViaCEP e preenche os campos de endereço no formulário de fornecedor no modal.
 */
export async function buscarCepFornecedor() { // Não precisa de prefixo, pois os IDs são específicos para fornecedor
    const modalContentArea = document.getElementById('modal-content-area');
    if (!modalContentArea) { 
        console.error('Área de conteúdo do modal não encontrada para buscar CEP de fornecedor.'); 
        return; 
    }

    const cepInput = modalContentArea.querySelector('#fornecedor-cep'); // ID direto
    if (!cepInput) { 
        console.error('Campo de CEP #fornecedor-cep não encontrado no modal.'); 
        return; 
    }
    const cepValue = cepInput.value;
    
    if (!cepValue || cepValue.replace(/\D/g, '').length !== 8) {
        alert('Por favor, insira um CEP válido (8 dígitos).');
        cepInput.focus();
        return;
    }

    const fieldsToFill = {
        logradouro: modalContentArea.querySelector('#fornecedor-logradouro'),
        bairro: modalContentArea.querySelector('#fornecedor-bairro'),
        cidade: modalContentArea.querySelector('#fornecedor-cidade'),
        uf: modalContentArea.querySelector('#fornecedor-uf')
    };
    
    Object.values(fieldsToFill).forEach(field => { if(field) field.value = ''; });
    
    const buscarCepButton = modalContentArea.querySelector('button[onclick="buscarCepFornecedor()"]'); // Seleciona o botão
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
            
            const numeroField = modalContentArea.querySelector('#fornecedor-numero');
            if(numeroField) numeroField.focus();
        }
    } catch (error) {
        console.error('Erro ao buscar CEP para fornecedor:', error);
        alert(`Erro ao buscar CEP: ${error.message}`);
        if (buscarCepButton && originalButtonText) {
             buscarCepButton.innerHTML = originalButtonText;
             buscarCepButton.disabled = false;
        }
    }
}