// uiUtils.js

/**
 * Define o tema inicial (claro/escuro) com base no localStorage ou preferência do sistema.
 */
export function initializeTheme() {
    const html = document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

/**
 * Carrega conteúdo HTML de uma URL para um elemento específico.
 * @param {string} url - A URL do arquivo HTML a ser carregado.
 * @param {string} elementId - O ID do elemento onde o HTML será injetado.
 * @param {function} [callback] - Função opcional a ser executada após o carregamento bem-sucedido.
 * @returns {Promise<boolean>} True se o carregamento for bem-sucedido, false caso contrário.
 */
export async function loadHTML(url, elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Elemento com ID '${elementId}' não encontrado para carregar ${url}.`);
        return false;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = response.status === 404 ? `Arquivo não encontrado: ${url}` : `Erro HTTP: ${response.status} ao carregar ${url}`;
            throw new Error(errorText);
        }
        const htmlContent = await response.text();
        element.innerHTML = htmlContent;
        if (callback) callback();
        return true;
    } catch (error) {
        console.error(`Falha ao carregar HTML de ${url} para #${elementId}:`, error);
        element.innerHTML = `<div class="p-4 text-center text-error dark:text-red-400">Erro ao carregar: ${error.message || url.split('/').pop()}. Verifique o console.</div>`;
        return false;
    }
}

/**
 * Atualiza o título da página exibido no header.
 * @param {string} title - O novo título da página.
 */
export function updatePageTitle(title) {
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) {
        pageTitleEl.textContent = title;
    }
}

/**
 * Destaca o link ativo na sidebar e abre o dropdown pai, se aplicável.
 * @param {string} sectionId - O ID da seção atual.
 * @param {object} sectionTitlesRef - Referência ao objeto sectionTitles.
 */
export function highlightActiveSidebarLink(sectionId, sectionTitlesRef) { // Modificado para receber a referência
    const mainSidebar = document.getElementById('main-sidebar');
    if (!mainSidebar) return;

    const sidebarLinks = mainSidebar.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        const isActive = linkSection === sectionId;

        link.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-primary-DEFAULT', 'dark:text-primary-light', 'font-semibold');
        
        if (isActive && sectionTitlesRef[sectionId]) { 
            link.classList.add('font-semibold');
            if (document.documentElement.classList.contains('dark')) {
                link.classList.add('dark:bg-gray-700', 'dark:text-primary-light');
            } else {
                link.classList.add('bg-gray-100', 'text-primary-DEFAULT');
            }

            const parentDropdownContent = link.closest('.dropdown-content');
            if (parentDropdownContent && parentDropdownContent.classList.contains('hidden')) {
                const dropdownButton = parentDropdownContent.previousElementSibling;
                const chevron = dropdownButton.querySelector('.fa-chevron-down');
                parentDropdownContent.classList.remove('hidden');
                if (chevron) chevron.classList.add('rotate-180');
            }
        }
    });
}

/**
 * Abre o modal genérico com título, conteúdo e opções customizadas.
 */
export function openModal(title, contentSource, options = {}) {
    const { 
        iconClass = 'fas fa-info-circle text-primary-DEFAULT dark:text-primary-light', 
        modalSize = 'sm:max-w-lg', 
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        onConfirm = null,
        onCancel = null,
        hideConfirmButton = false,
        hideCancelButton = false,
        customFooterHTML = null
    } = options;

    const modalEl = document.getElementById('modal');
    if (!modalEl) { console.error('Elemento modal principal não encontrado.'); return; }

    const modalTitleEl = document.getElementById('modal-title');
    if (modalTitleEl) modalTitleEl.textContent = title;

    const modalContentAreaEl = document.getElementById('modal-content-area');
    if(modalContentAreaEl) {
        let contentHTML = '';
        const sourceElement = typeof contentSource === 'string' ? document.getElementById(contentSource) : null;
        if (sourceElement) {
            contentHTML = sourceElement.innerHTML;
        } else {
            contentHTML = contentSource; 
        }
        modalContentAreaEl.innerHTML = contentHTML;
    }
    
    const modalIconEl = document.getElementById('modal-icon');
    if (modalIconEl) modalIconEl.className = iconClass; 

    const modalDialog = document.getElementById('modal-dialog');
    if (modalDialog) {
        const sizeClasses = ['sm:max-w-xs', 'sm:max-w-sm', 'sm:max-w-md', 'sm:max-w-lg', 'sm:max-w-xl', 'sm:max-w-2xl', 'sm:max-w-3xl', 'sm:max-w-4xl', 'sm:max-w-5xl', 'sm:max-w-6xl', 'sm:max-w-7xl'];
        sizeClasses.forEach(cls => modalDialog.classList.remove(cls));
        modalDialog.classList.add(modalSize);
    }

    const modalActions = document.getElementById('modal-actions');
    if (modalActions) {
        if (customFooterHTML) {
            modalActions.innerHTML = customFooterHTML;
        } else {
            modalActions.innerHTML = `
                <button type="button" id="modal-confirm-button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-DEFAULT hover:bg-primary-dark text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-dark sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150">
                    ${confirmText}
                </button>
                <button type="button" id="modal-cancel-button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150">
                    ${cancelText}
                </button>
            `;
            
            const confirmButton = document.getElementById('modal-confirm-button');
            const cancelButton = document.getElementById('modal-cancel-button');

            if (confirmButton) confirmButton.style.display = hideConfirmButton ? 'none' : 'inline-flex';
            if (cancelButton) cancelButton.style.display = hideCancelButton ? 'none' : 'inline-flex';
            
            if (confirmButton) confirmButton.onclick = () => { if (onConfirm) onConfirm(); };
            if (cancelButton) cancelButton.onclick = () => { if (onCancel) onCancel(); closeModal(); };
        }
    }
    
    modalEl.classList.remove('hidden', 'opacity-0');
    if(modalDialog) modalDialog.classList.remove('sm:scale-95'); 
    
    void modalEl.offsetWidth; 
    modalEl.classList.add('opacity-100');
    if(modalDialog) modalDialog.classList.add('sm:scale-100');
}

/**
 * Fecha o modal genérico.
 */
export function closeModal() {
    const modalEl = document.getElementById('modal');
    const modalDialog = document.getElementById('modal-dialog');

    if (!modalEl || !modalDialog) return;

    modalEl.classList.replace('opacity-100', 'opacity-0');
    modalDialog.classList.replace('sm:scale-100', 'sm:scale-95');
    
    setTimeout(() => {
        modalEl.classList.add('hidden');
    }, 300);
}

/**
 * Inicializa a funcionalidade de abas para todos os containers de abas na página.
 */
export function initializeTabs() {
    const tabContainers = document.querySelectorAll('[data-tab-container]');
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabContents = container.querySelectorAll('.tab-content');
        if (!tabButtons.length) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('active', 'text-primary-DEFAULT', 'dark:text-primary-light', 'border-primary-DEFAULT', 'dark:border-primary-light');
                    btn.classList.add('border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300', 'hover:border-gray-300', 'dark:hover:border-gray-600');
                    btn.setAttribute('aria-selected', 'false');
                });
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });

                button.classList.add('active', 'text-primary-DEFAULT', 'dark:text-primary-light', 'border-primary-DEFAULT', 'dark:border-primary-light');
                button.classList.remove('border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300', 'hover:border-gray-300', 'dark:hover:border-gray-600');
                button.setAttribute('aria-selected', 'true');
                
                const tabId = button.getAttribute('data-tab');
                const activeTabContent = container.querySelector(`.tab-content[id="${tabId}-content"]`);
                if (activeTabContent) {
                    activeTabContent.classList.add('active');
                    activeTabContent.style.display = 'block';
                }
            });
        });

        let initiallyActiveButton = container.querySelector('.tab-button.active');
        if (!initiallyActiveButton && tabButtons.length > 0) {
            initiallyActiveButton = tabButtons[0];
        }
        if (initiallyActiveButton) {
            initiallyActiveButton.click(); 
        }
    });
}