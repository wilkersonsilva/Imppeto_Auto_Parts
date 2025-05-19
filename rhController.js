// rhController.js (Principal do Módulo RH)
// Responsável pela inicialização geral do módulo RH e navegação entre suas abas.
// Data e Hora Atual: 18 de maio de 2025

import { loadHTML } from './uiUtils.js'; // Ajuste o caminho se uiUtils estiver em outro nível (ex: '../utils/uiUtils.js')

let activeRhTabControllerInitializer = null; // Para guardar o inicializador da aba ativa (uso futuro opcional)
let currentActiveRhTabHtmlFile = null; // Para evitar recarregar a mesma aba desnecessariamente

export function initializeRh() {
    console.log("Módulo RH Principal Inicializado.");
    const tabContainer = document.querySelector('[data-rh-tab-container]');
    if (!tabContainer) {
        console.error("Container de abas do RH (data-rh-tab-container) não encontrado.");
        const contentAreaEl = document.getElementById('rh-tab-content-area');
        if (contentAreaEl) contentAreaEl.innerHTML = "<p class='p-4 text-error'>Erro: Container de abas do RH não encontrado.</p>";
        return;
    }

    const tabButtons = tabContainer.querySelectorAll('.rh-tab-button');
    const defaultTabButton = tabButtons.length > 0 ? tabButtons[0] : null;

    tabButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const htmlFile = button.getAttribute('data-tab-html');
            const contentAreaId = 'rh-tab-content-area'; // ID da div que recebe o conteúdo da aba
            const contentAreaEl = document.getElementById(contentAreaId);

            if (!htmlFile) {
                console.warn("Botão de aba sem atributo data-tab-html:", button);
                if(contentAreaEl) contentAreaEl.innerHTML = `<p class="p-4 text-gray-500">Conteúdo não especificado para esta aba.</p>`;
                return;
            }

            // Lógica de destaque da aba (ativa/inativa)
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'text-primary-DEFAULT', 'dark:text-primary-light', 'border-primary-DEFAULT', 'dark:border-primary-light');
                btn.classList.add('border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300', 'hover:border-gray-300', 'dark:hover:border-gray-600');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active', 'text-primary-DEFAULT', 'dark:text-primary-light', 'border-primary-DEFAULT', 'dark:border-primary-light');
            button.classList.remove('border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300', 'hover:border-gray-300', 'dark:hover:border-gray-600');
            button.setAttribute('aria-selected', 'true');

            // Só recarrega e reinicializa se for uma aba diferente ou se a área estiver vazia (ex: erro anterior)
            if (currentActiveRhTabHtmlFile === htmlFile && contentAreaEl && contentAreaEl.innerHTML.trim() !== '' && !contentAreaEl.querySelector('.spinner')) {
                console.log(`Aba ${htmlFile} já está carregada e ativa.`);
                // Se precisar de uma reinicialização forçada da lógica da aba ao clicar nela novamente:
                // if (activeRhTabControllerInitializer) {
                //     console.log(`Forçando reinicialização da aba ${htmlFile}`);
                //     activeRhTabControllerInitializer();
                // }
                return;
            }

            currentActiveRhTabHtmlFile = htmlFile; // Atualiza qual aba está ativa

            if(contentAreaEl) contentAreaEl.innerHTML = `<div class="flex justify-center items-center h-64"><div class="spinner text-primary-DEFAULT dark:text-primary-light"></div><p class="ml-3 text-gray-500 dark:text-gray-400">Carregando ${button.textContent.trim()}...</p></div>`;

            const success = await loadHTML(htmlFile, contentAreaId, async () => {
                // Constrói o nome do controller e da função de inicialização baseado no nome do arquivo HTML da aba
                let controllerNamePart = htmlFile.replace('_rh_tab_', '').replace('.html', ''); // ex: 'funcionarios', 'folha_pagamento', 'ferias_licencas'

                const nameParts = controllerNamePart.split('_'); // ex: ['ferias', 'licencas']
                const capitalizedNameParts = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
                const correctedControllerNamePart = capitalizedNameParts.join(''); // ex: 'Funcionarios', 'FolhaPagamento', 'FeriasLicencas'

                const fullControllerName = `rh${correctedControllerNamePart}Controller`; // ex: rhFuncionariosController.js
                const initializerFunctionName = `initialize${correctedControllerNamePart}Tab`; // ex: initializeFuncionariosTab

                try {
                    // Importa dinamicamente o controller da aba.
                    // ASSUME QUE OS CONTROLLERS DAS ABAS ESTÃO NO MESMO DIRETÓRIO QUE ESTE rhController.js
                    // Se estiverem em uma subpasta (ex: ./rh_controllers/), o caminho seria: `./rh_controllers/${fullControllerName}.js`
                    const module = await import(`./${fullControllerName}.js`);

                    if (module && typeof module[initializerFunctionName] === 'function') {
                        activeRhTabControllerInitializer = module[initializerFunctionName]; // Guarda a referência
                        activeRhTabControllerInitializer(); // Chama a função de inicialização da aba
                        console.log(`${initializerFunctionName} de ${fullControllerName}.js chamada com sucesso.`);
                    } else {
                        console.warn(`Função de inicialização ${initializerFunctionName} não encontrada em ${fullControllerName}.js para ${htmlFile}`);
                        if(contentAreaEl) contentAreaEl.innerHTML = `<p class="text-warning p-4">Módulo da aba carregado, mas a função de inicialização do controller não foi encontrada.</p>`;
                    }
                } catch (err) {
                    console.error(`Erro ao carregar ou inicializar o controller para ${htmlFile} (tentativa: ./${fullControllerName}.js):`, err);
                    if(contentAreaEl) contentAreaEl.innerHTML = `<p class="text-error p-4">Erro ao carregar o script da aba: ${err.message}. Verifique o console, o nome do arquivo e o caminho do controller.</p>`;
                }
            });
            if (!success) {
                 if(contentAreaEl) contentAreaEl.innerHTML = `<p class="text-error p-4">Falha ao carregar conteúdo HTML da aba: ${htmlFile}</p>`;
            }
        });
    });

    // Ativa a primeira aba por padrão ao carregar o módulo RH
    if (defaultTabButton) {
        defaultTabButton.click();
    } else {
        const contentAreaEl = document.getElementById('rh-tab-content-area');
        if(contentAreaEl) contentAreaEl.innerHTML = "<p class='p-4 text-gray-500'>Nenhuma aba configurada para o módulo de RH.</p>";
    }
}

// Nenhuma outra função específica de módulo (funcionários, folha, etc.) deve estar aqui.
// Este controller é apenas o orquestrador das abas do RH.