// sidebarController.js
import { highlightActiveSidebarLink } from './uiUtils.js'; // Importa se for usar aqui diretamente
import { getCurrentSection, sectionTitles } from './contentLoader.js'; // Importa para highlight

/**
 * Inicializa todas as interações da barra lateral, como menus dropdown.
 * É chamada após o HTML da sidebar ser carregado.
 */
export function initializeSidebarInteractions() {
    const mainSidebar = document.getElementById('main-sidebar');
    if (!mainSidebar) {
        console.warn('Elemento #main-sidebar não encontrado. Interações da sidebar não serão inicializadas.');
        return;
    }

    // Lógica dos Dropdowns da Sidebar
    const dropdownButtons = mainSidebar.querySelectorAll('.dropdown > button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', () => {
            const dropdownContent = button.nextElementSibling; // O .dropdown-content
            const chevron = button.querySelector('.fa-chevron-down'); // O ícone de seta

            if (dropdownContent) {
                // Comportamento de acordeão: Fecha outros dropdowns abertos na mesma sidebar
                if (dropdownContent.classList.contains('hidden')) {
                    mainSidebar.querySelectorAll('.dropdown-content:not(.hidden)').forEach(openDropdown => {
                        if (openDropdown !== dropdownContent) { // Não fecha o que está sendo aberto
                            openDropdown.classList.add('hidden');
                            const otherChevron = openDropdown.previousElementSibling.querySelector('.fa-chevron-down');
                            if (otherChevron) otherChevron.classList.remove('rotate-180');
                        }
                    });
                }
                
                // Alterna o dropdown atual
                dropdownContent.classList.toggle('hidden');
                if (chevron) chevron.classList.toggle('rotate-180');
            }
        });
    });

    // Garante que o link ativo e o dropdown pai sejam destacados/abertos ao carregar a sidebar.
    // getCurrentSection() e sectionTitles são importados de contentLoader.js
    highlightActiveSidebarLink(getCurrentSection(), sectionTitles);
}