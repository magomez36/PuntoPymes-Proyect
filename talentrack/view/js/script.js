/* ============================================
   CONFIGURACIÓN Y VARIABLES GLOBALES
   ============================================ */

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const resetForm = document.getElementById('resetForm');

// Variables de estado para asistencia
let checkInTime = null;
let checkOutTime = null;
let timerInterval = null;

/* ============================================
   ANIMACIONES DINÁMICAS
   ============================================ */

function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/* ============================================
   MENSAJES Y NOTIFICACIONES
   ============================================ */

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d51e37 0%, #a81729 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(213, 30, 55, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 2000);
}

/* ============================================
   GESTIÓN DE SESIONES
   ============================================ */

function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser && userAvatar) {
        userAvatar.title = currentUser;
    }
    
    dashboardPage.style.opacity = '0';
    setTimeout(() => {
        dashboardPage.style.transition = 'opacity 0.5s ease';
        dashboardPage.style.opacity = '1';
    }, 100);
}

function showLogin() {
    dashboardPage.style.display = 'none';
    loginPage.style.display = 'flex';
    
    if (loginForm) {
        loginForm.reset();
    }
    
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const usernameField = document.getElementById('username');
        const rememberField = document.getElementById('remember');
        if (usernameField) usernameField.value = rememberedUser;
        if (rememberField) rememberField.checked = true;
    }
}

function checkSessionOnLoad() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
}

/* ============================================
   AUTENTICACIÓN - LOGIN
   ============================================ */

function handleLoginSubmit() {
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        if (!username || !password) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        console.log('Login attempt:', { username, password, remember });
        
        if (remember) {
            localStorage.setItem('rememberedUser', username);
        }
        
        sessionStorage.setItem('currentUser', username);
        showSuccessMessage('¡Inicio de sesión exitoso!');
        
        setTimeout(() => {
            showDashboard();
        }, 1000);
    });
}

function handlePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    
    if (!togglePassword) return;
    
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        
        if (!passwordInput) return;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('bx-eye');
            this.classList.add('bx-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('bx-eye-slash');
            this.classList.add('bx-eye');
        }
    });
}

function handleInputAnimation() {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1.02)';
                this.parentElement.style.transition = 'transform 0.2s ease';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1)';
            }
        });
    });
}

/* ============================================
   AUTENTICACIÓN - LOGOUT
   ============================================ */

function handleLogout() {
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            sessionStorage.removeItem('currentUser');
            showSuccessMessage('Sesión cerrada correctamente');
            
            setTimeout(() => {
                showLogin();
            }, 1000);
        }
    });
}

/* ============================================
   RECUPERACIÓN DE CONTRASEÑA
   ============================================ */

function handlePasswordReset() {
    if (!resetForm) return;
    
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailOrUsername = document.getElementById('emailOrUsername').value;
        
        if (!emailOrUsername) {
            alert('Por favor, ingresa tu correo o nombre de usuario');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(emailOrUsername);
        
        if (!isEmail && emailOrUsername.length < 3) {
            alert('Por favor, ingresa un correo válido o un nombre de usuario válido');
            return;
        }
        
        console.log('Reset password request for:', emailOrUsername);
        
        const submitBtn = resetForm.querySelector('.reset-button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.style.opacity = '0.6';
        
        setTimeout(() => {
            showSuccessMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
            
            localStorage.setItem('lastPasswordReset', emailOrUsername);
            localStorage.setItem('resetTimestamp', new Date().toISOString());
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }, 1500);
    });
}

/* ============================================
   SIDEBAR - INTERACTIVIDAD
   ============================================ */

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
}

function handleSidebarItemsClick() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function handleSidebarLogout() {
    const logoutSidebarItem = document.querySelector('.sidebar-item.logout');
    if (logoutSidebarItem) {
        logoutSidebarItem.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                sessionStorage.removeItem('currentUser');
                showSuccessMessage('Sesión cerrada correctamente');
                setTimeout(() => {
                    window.location.href = '../view/index.html';
                }, 1000);
            }
        });
    }
}

/* ============================================
   NOTIFICACIONES
   ============================================ */

function markAsRead(id) {
    const notification = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (!notification) return;
    
    notification.classList.remove('unread');
    notification.classList.add('read');
    
    const button = notification.querySelector('.btn-mark-read');
    if (button) {
        button.outerHTML = '<span class="notification-status">Leída</span>';
    }
}

function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    unreadNotifications.forEach(notification => {
        notification.classList.remove('unread');
        notification.classList.add('read');
        
        const button = notification.querySelector('.btn-mark-read');
        if (button) {
            button.outerHTML = '<span class="notification-status">Leída</span>';
        }
    });
    
    if (unreadNotifications.length > 0) {
        alert(`${unreadNotifications.length} notificaciones marcadas como leídas`);
    }
}

function filterNotifications(filter) {
    const notifications = document.querySelectorAll('.notification-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    notifications.forEach(notification => {
        switch(filter) {
            case 'all':
                notification.style.display = 'flex';
                break;
            case 'unread':
                notification.style.display = notification.classList.contains('unread') ? 'flex' : 'none';
                break;
            case 'archived':
                notification.style.display = 'none';
                break;
        }
    });
}

function searchNotifications() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const searchTerm = input.value.toLowerCase();
    const notifications = document.querySelectorAll('.notification-item');
    
    notifications.forEach(notification => {
        const titleEl = notification.querySelector('.notification-title');
        const textEl = notification.querySelector('.notification-text');
        const title = titleEl ? titleEl.textContent.toLowerCase() : '';
        const text = textEl ? textEl.textContent.toLowerCase() : '';
        
        if (title.includes(searchTerm) || text.includes(searchTerm)) {
            notification.style.display = 'flex';
        } else {
            notification.style.display = 'none';
        }
    });
}

/* ============================================
   ASISTENCIA - UTILIDADES
   ============================================ */

function updateCurrentDate() {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    const el = document.getElementById('currentDate');
    if (el) {
        el.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
}

/* ============================================
   ASISTENCIA - REGISTRO DE ENTRADA/SALIDA
   ============================================ */

function handleAttendanceCheckIn() {
    const btnCheckIn = document.getElementById('btnCheckIn');
    const btnCheckOut = document.getElementById('btnCheckOut');
    
    if (!btnCheckIn) return;
    
    btnCheckIn.addEventListener('click', function() {
        const now = new Date();
        checkInTime = now;
        this.disabled = true;
        if (btnCheckOut) btnCheckOut.disabled = false;
        startTimer();
        alert(`Entrada registrada: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`);
    });
}

function handleAttendanceCheckOut() {
    const btnCheckOut = document.getElementById('btnCheckOut');
    const btnCheckIn = document.getElementById('btnCheckIn');
    
    if (!btnCheckOut) return;
    
    btnCheckOut.addEventListener('click', function() {
        const now = new Date();
        checkOutTime = now;
        this.disabled = true;
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const diff = checkOutTime - checkInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        alert(`Salida registrada: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}\nHoras trabajadas: ${hours}h ${minutes}m`);
        
        setTimeout(() => {
            if (btnCheckIn) btnCheckIn.disabled = false;
            checkInTime = null;
            checkOutTime = null;
            const td = document.getElementById('timeDisplay');
            if (td) {
                const tv = td.querySelector('.time-value');
                if (tv) tv.textContent = '00:00 / 08:00';
            }
        }, 2000);
    });
}

/* ============================================
   ASISTENCIA - TEMPORIZADOR
   ============================================ */

function startTimer() {
    timerInterval = setInterval(() => {
        if (!checkInTime) return;
        
        const now = new Date();
        const diff = now - checkInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        const td = document.getElementById('timeDisplay');
        if (td) {
            const tv = td.querySelector('.time-value');
            if (tv) tv.textContent = `${timeStr} / 08:00`;
        }
    }, 1000);
}

/* ============================================
   ASISTENCIA - FILTROS
   ============================================ */

function filterHistory() {
    const dateFromEl = document.getElementById('dateFrom');
    const dateToEl = document.getElementById('dateTo');
    const dateFrom = dateFromEl ? dateFromEl.value : '';
    const dateTo = dateToEl ? dateToEl.value : '';
    alert(`Filtrando registros desde ${dateFrom} hasta ${dateTo}`);
}

/* ============================================
   INICIALIZACIÓN - EVENT LISTENERS
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Inyectar estilos de animación
    injectAnimationStyles();
    
    // Autenticación
    handleLoginSubmit();
    handlePasswordToggle();
    handleInputAnimation();
    handleLogout();
    handlePasswordReset();
    
    // Sidebar
    handleSidebarItemsClick();
    handleSidebarLogout();
    
    // Asistencia
    updateCurrentDate();
    handleAttendanceCheckIn();
    handleAttendanceCheckOut();
});

window.addEventListener('DOMContentLoaded', function() {
    checkSessionOnLoad();
});

/* ============================================
    CREAR EMPRESA - FUNCIONALIDADES
    ============================================ */

// Upload area drag and drop functionality
        const uploadArea = document.getElementById('uploadArea');
        const logoInput = document.getElementById('logoInput');

        uploadArea.addEventListener('click', () => {
            logoInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });

        logoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });

        function handleFileUpload(file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Por favor, selecciona un archivo PNG, JPG o GIF.');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo debe ser menor a 5MB.');
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Logo preview" style="max-width: 100%; max-height: 150px; object-fit: contain;">
                    <p class="upload-hint" style="margin-top: 10px;">Haz clic para cambiar</p>
                `;
            };
            reader.readAsDataURL(file);
        }

        // Form submission
        document.getElementById('createCompanyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                companyName: document.getElementById('companyName').value,
                cif: document.getElementById('cif').value,
                plan: document.getElementById('plan').value,
                contact: document.getElementById('contact').value,
                branches: document.getElementById('branches').value,
                registrationDate: document.getElementById('registrationDate').value,
                licenseStatus: document.querySelector('input[name="licenseStatus"]:checked').value
            };

            console.log('Form submitted:', formData);
            
            // Show success message
            alert('Empresa creada exitosamente');
            
            // Redirect to companies list
            // window.location.href = 'gestionEmpresas.html';
        });