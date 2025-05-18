// sidebarController.js
// Data da Última Atualização: 17 de maio de 2025

import { highlightActiveSidebarLink } from './uiUtils.js';
import { getCurrentSection, sectionTitles } from './contentLoader.js';

/**
 * Inicializa todas as interações da barra lateral, como menus dropdown,
 * e atualiza as informações do usuário logado.
 * É chamada após o HTML da sidebar ser carregado.
 * @param {object} [usuarioLogado] - O objeto do usuário logado (opcional).
 */
export function initializeSidebarInteractions(usuarioLogado) {
    const mainSidebar = document.getElementById('main-sidebar');
    if (!mainSidebar) {
        console.warn('Elemento #main-sidebar não encontrado. Interações da sidebar não serão inicializadas.');
        return;
    }

    // Lógica dos Dropdowns da Sidebar (comportamento de acordeão)
    const dropdownButtons = mainSidebar.querySelectorAll('.dropdown > button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', () => {
            const dropdownContent = button.nextElementSibling; // O .dropdown-content
            const chevron = button.querySelector('.fa-chevron-down');

            if (dropdownContent) {
                // Fecha outros dropdowns abertos na mesma sidebar
                const isOpening = dropdownContent.classList.contains('hidden');
                mainSidebar.querySelectorAll('.dropdown-content:not(.hidden)').forEach(openDropdown => {
                    if (openDropdown !== dropdownContent) {
                        openDropdown.classList.add('hidden');
                        const otherChevron = openDropdown.previousElementSibling.querySelector('.fa-chevron-down');
                        if (otherChevron) otherChevron.classList.remove('rotate-180');
                    }
                });

                // Alterna o dropdown atual
                if (isOpening) {
                    dropdownContent.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                } else {
                    dropdownContent.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-180');
                }
            }
        });
    });

    // Atualiza informações do usuário na sidebar se o usuário estiver logado
    if (usuarioLogado) {
        const userNameEl = document.getElementById('sidebar-user-name');
        const userProfileEl = document.getElementById('sidebar-user-profile');
        const userAvatarEl = document.getElementById('sidebar-user-avatar'); // Para o avatar, se houver URL

        if (userNameEl) {
            userNameEl.textContent = usuarioLogado.nome || 'Usuário Desconhecido';
            userNameEl.title = usuarioLogado.nome || 'Usuário Desconhecido'; // Adiciona title para nomes longos
        }
        if (userProfileEl) {
            userProfileEl.textContent = usuarioLogado.perfil || 'Perfil não definido';
            userProfileEl.title = usuarioLogado.perfil || 'Perfil não definido';
        }

        // Exemplo de como você poderia definir o avatar se tivesse uma URL no objeto usuarioLogado
        // if (userAvatarEl && usuarioLogado.avatarUrl) {
        //     userAvatarEl.src = usuarioLogado.avatarUrl;
        // } else if (userAvatarEl && usuarioLogado.nome) {
        //     // Fallback para placeholder com iniciais se não houver avatarUrl
        //     const iniciais = usuarioLogado.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        //     userAvatarEl.src = `https://via.placeholder.com/40x40.png?text=${iniciais}`;
        // }
    } else {
        // Se não houver usuário logado (embora main.js deva redirecionar), limpa os campos
        const userNameEl = document.getElementById('sidebar-user-name');
        const userProfileEl = document.getElementById('sidebar-user-profile');
        if (userNameEl) userNameEl.textContent = 'Não Logado';
        if (userProfileEl) userProfileEl.textContent = '';
    }

    // Garante que o link ativo e o dropdown pai sejam destacados/abertos ao carregar a sidebar
    // ou quando uma nova seção é carregada (esta função é chamada novamente pelo loadLayoutComponents)
    highlightActiveSidebarLink(getCurrentSection(), sectionTitles);
}