// topnavController.js
// (Não há importações diretas de outros módulos aqui, pois as funções chamadas
// como toggle de classes ou localStorage são globais ou manipulam o DOM diretamente)

/**
 * Inicializa todas as interações da barra de navegação superior.
 * É chamada após o HTML da topnav ser carregado.
 */
export function initializeTopNavInteractions() {
    // Botão de Tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement; // Referência ao elemento <html>
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
            // A atualização visual dos ícones de sol/lua é feita pelo Tailwind CSS
            // com base na classe 'dark' no elemento <html>
        });
    }

    // Botão de Menu Mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('main-sidebar'); // ID definido em _sidebar.html
    const backdrop = document.getElementById('mobile-menu-backdrop'); // ID definido em index.html

    if (mobileMenuButton && sidebar && backdrop) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne que o evento se propague para o document
            sidebar.classList.toggle('-translate-x-full'); // Classe para esconder (transform)
            sidebar.classList.toggle('translate-x-0');    // Classe para mostrar (transform)
            backdrop.classList.toggle('hidden');           // Mostra/esconde o backdrop
        });
        backdrop.addEventListener('click', () => { // Fecha ao clicar no backdrop
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            backdrop.classList.add('hidden');
        });
    }

    // Dropdown de Notificações
    const notificationsButton = document.getElementById('notifications-button');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationBadge = document.getElementById('notification-badge'); // Opcional

    if (notificationsButton && notificationsDropdown) {
        notificationsButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o evento de clique no documento feche o dropdown imediatamente
            notificationsDropdown.classList.toggle('hidden');
            
            // Se o dropdown for aberto, simula que as notificações foram vistas escondendo o badge
            if (!notificationsDropdown.classList.contains('hidden')) {
                if (notificationBadge) notificationBadge.classList.replace('scale-100', 'scale-0');
                // Aqui você poderia adicionar lógica para marcar notificações como lidas, se necessário
            }
        });

        // Fechar dropdown de notificações ao clicar fora dele
        document.addEventListener('click', (e) => {
            // Verifica se o dropdown existe, está visível, e o clique não foi no botão nem dentro do dropdown
            if (notificationsDropdown && 
                !notificationsDropdown.classList.contains('hidden') &&
                !notificationsButton.contains(e.target) && 
                !notificationsDropdown.contains(e.target)) {
                notificationsDropdown.classList.add('hidden');
            }
        });
    }
    // Simulação para mostrar o badge de notificação após um tempo (opcional, para teste)
    // if (notificationBadge) {
    //    setTimeout(() => {
    //        if (notificationBadge) notificationBadge.classList.replace('scale-0', 'scale-100');
    //    }, 7000); // Mostra após 7 segundos
    // }
}