// preferenciasController.js
// Data e Hora Atual: 13 de maio de 2025

import { openModal, closeModal } from './uiUtils.js'; // Se precisar de modais para algo aqui

// SIMULAÇÃO DE DADOS DE PREFERÊNCIAS (substitua por uma fonte de dados real, ex: localStorage ou API)
let preferenciasDaLoja = {
    'pref-razao-social': 'IMPPETO AUTO PARTS LTDA (Exemplo)',
    'pref-nome-fantasia': 'Imppeto Auto Peças',
    'pref-cnpj': '00.111.222/0001-33',
    'pref-ie': '123.456.789.112',
    'pref-logo-url': 'https://via.placeholder.com/150x60.png?text=Sua+Logo+Salva', // URL do logo salvo
    'pref-cep': '01001-000',
    'pref-logradouro': 'Avenida Principal',
    'pref-numero': '789',
    'pref-complemento': 'Andar 5, Sala 505',
    'pref-bairro': 'Centro Cívico',
    'pref-cidade': 'Cidade Exemplo',
    'pref-uf': 'PR',
    'pref-telefone': '(41) 3030-4040',
    'pref-email': 'contato@imppetoauto.com.br',
    'pref-venda-cond-pagamento': '30d',
    'pref-venda-vendedor-padrao': 'vendedor1',
    'pref-venda-sem-estoque': true, // checkbox
    'pref-venda-obs-padrao': 'Obrigado pela preferência! Garantia de 90 dias.',
    'pref-estoque-custo': 'medio',
    'pref-estoque-alerta-minimo': true // checkbox
};

/**
 * Inicializa a página de Preferências da Loja.
 */
export function initializePreferencias() {
    console.log("Inicializando Preferências da Loja...");
    const formPreferencias = document.getElementById('form-preferencias-loja');
    const logoUploadInput = document.getElementById('pref-logo-upload');
    const logoPreviewImg = document.getElementById('pref-logo-preview');

    if (formPreferencias) {
        formPreferencias.addEventListener('submit', salvarPreferencias);
        carregarPreferenciasSalvas(formPreferencias); // Carrega dados no formulário
    } else {
        console.error("Formulário #form-preferencias-loja não encontrado.");
    }

    if (logoUploadInput && logoPreviewImg) {
        logoUploadInput.addEventListener('change', (event) => {
            previewLogo(event, logoPreviewImg);
        });
    }
}

/**
 * Carrega as preferências salvas (simuladas) e preenche o formulário.
 * @param {HTMLFormElement} formElement - O elemento do formulário.
 */
function carregarPreferenciasSalvas(formElement) {
    console.log("Carregando preferências salvas (simulação)...");
    for (const key in preferenciasDaLoja) {
        const field = formElement.elements[key];
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = preferenciasDaLoja[key];
            } else {
                field.value = preferenciasDaLoja[key];
            }
        }
    }
    // Carrega o preview do logo salvo
    const logoPreviewImg = document.getElementById('pref-logo-preview');
    if (logoPreviewImg && preferenciasDaLoja['pref-logo-url']) {
        logoPreviewImg.src = preferenciasDaLoja['pref-logo-url'];
    }
}

/**
 * Salva as preferências da loja (simulação).
 * @param {Event} event - O evento de submit do formulário.
 */
function salvarPreferencias(event) {
    event.preventDefault();
    const form = event.target;
    if (!form) {
        alert("Erro: Formulário não encontrado.");
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const formData = new FormData(form);
    const novasPreferencias = {};
    for (const [key, value] of formData.entries()) {
        if (form.elements[key].type === 'checkbox') {
            novasPreferencias[key] = form.elements[key].checked;
        } else {
            novasPreferencias[key] = value;
        }
    }
    
    // Simulação de upload de logo: se um novo arquivo foi selecionado,
    // apenas guardamos o nome ou um placeholder. A lógica real de upload é backend.
    const logoFile = form.elements['pref-logo-upload'].files[0];
    if (logoFile) {
        // Simula que o logo foi salvo e temos uma nova URL para ele
        novasPreferencias['pref-logo-url'] = URL.createObjectURL(logoFile); // Apenas para preview local
        console.log("Novo logo selecionado:", logoFile.name);
        // Em um app real, você enviaria o arquivo para o backend e obteria uma URL persistente.
    } else {
        // Mantém a URL do logo anterior se nenhum novo foi selecionado
        novasPreferencias['pref-logo-url'] = preferenciasDaLoja['pref-logo-url'];
    }
    delete novasPreferencias['pref-logo-upload']; // Remove o campo de arquivo dos dados a serem "salvos"

    preferenciasDaLoja = { ...preferenciasDaLoja, ...novasPreferencias }; // Atualiza as preferências locais (simulação)

    console.log("Salvando Preferências:", preferenciasDaLoja);
    // SIMULAÇÃO DE SALVAMENTO NO BACKEND OU LOCALSTORAGE
    // Em um app real: await api.savePreferencias(preferenciasDaLoja);
    // localStorage.setItem('preferenciasLoja', JSON.stringify(preferenciasDaLoja));

    alert("Preferências salvas com sucesso! (simulação)");
    // Recarrega para refletir o preview do logo se alterado
    if (logoFile) {
         const logoPreviewImg = document.getElementById('pref-logo-preview');
         if(logoPreviewImg) logoPreviewImg.src = preferenciasDaLoja['pref-logo-url'];
    }
}

/**
 * Exibe um preview da imagem do logo selecionada para upload.
 * @param {Event} event - O evento 'change' do input file.
 * @param {HTMLImageElement} previewElement - O elemento <img> para exibir o preview.
 */
function previewLogo(event, previewElement) {
    const file = event.target.files[0];
    if (file && previewElement) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

/**
 * Busca um CEP usando a API ViaCEP e preenche os campos de endereço no formulário de preferências.
 */
export async function buscarCepPreferencias() {
    const cepInput = document.getElementById('pref-cep');
    if (!cepInput) { console.error('Campo de CEP #pref-cep não encontrado.'); return; }
    const cepValue = cepInput.value;
    
    if (!cepValue || cepValue.replace(/\D/g, '').length !== 8) {
        alert('Por favor, insira um CEP válido (8 dígitos).');
        cepInput.focus();
        return;
    }

    const fieldsToFill = {
        logradouro: document.getElementById('pref-logradouro'),
        bairro: document.getElementById('pref-bairro'),
        cidade: document.getElementById('pref-cidade'),
        uf: document.getElementById('pref-uf')
    };
    
    // Limpa campos antes de nova busca
    Object.values(fieldsToFill).forEach(field => { if(field) field.value = ''; });
    
    const buscarCepButton = document.querySelector('button[onclick="buscarCepPreferencias()"]');
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
            if (fieldsToFill.cidade) fieldsToFill.cidade.value = data.localidade || ''; // ViaCEP usa 'localidade'
            if (fieldsToFill.uf) fieldsToFill.uf.value = data.uf || '';
            
            const numeroField = document.getElementById('pref-numero');
            if(numeroField) numeroField.focus(); // Foca no campo de número após preencher
        }
    } catch (error) {
        console.error('Erro ao buscar CEP para Preferências:', error);
        alert(`Erro ao buscar CEP: ${error.message}`);
        if (buscarCepButton && originalButtonText) {
             buscarCepButton.innerHTML = originalButtonText;
             buscarCepButton.disabled = false;
        }
    }
}