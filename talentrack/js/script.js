// ============================================
// ELEMENTOS DEL DOM
// ============================================
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');

// ============================================
// LOGIN - TOGGLE PASSWORD VISIBILITY
// ============================================
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// ============================================
// LOGIN - FORM SUBMISSION
// ============================================
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validación básica
        if (!username || !password) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        // Simulación de autenticación (en producción, aquí iría una llamada al backend)
        console.log('Login attempt:', { username, password, remember });
        
        // Guardar sesión en localStorage si se marcó "Recordar"
        if (remember) {
            localStorage.setItem('rememberedUser', username);
        }
        
        // Guardar usuario actual en sessionStorage
        sessionStorage.setItem('currentUser', username);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('¡Inicio de sesión exitoso!');
        
        // Cambiar a dashboard después de 1 segundo
        setTimeout(() => {
            showDashboard();
        }, 1000);
    });
}

// ============================================
// FUNCIÓN PARA MOSTRAR MENSAJE DE ÉXITO
// ============================================
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

// ============================================
// FUNCIÓN PARA MOSTRAR EL DASHBOARD
// ============================================
function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    
    // Cargar nombre de usuario en el avatar (opcional)
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser && userAvatar) {
        userAvatar.title = currentUser;
    }
    
    // Animación de entrada
    dashboardPage.style.opacity = '0';
    setTimeout(() => {
        dashboardPage.style.transition = 'opacity 0.5s ease';
        dashboardPage.style.opacity = '1';
    }, 100);
}

// ============================================
// LOGOUT - CERRAR SESIÓN
// ============================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        // Confirmar cierre de sesión
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Limpiar sesión
            sessionStorage.removeItem('currentUser');
            
            // Mostrar mensaje
            showSuccessMessage('Sesión cerrada correctamente');
            
            // Volver al login después de 1 segundo
            setTimeout(() => {
                showLogin();
            }, 1000);
        }
    });
}

// ============================================
// FUNCIÓN PARA MOSTRAR EL LOGIN
// ============================================
function showLogin() {
    dashboardPage.style.display = 'none';
    loginPage.style.display = 'flex';
    
    // Limpiar campos del formulario
    if (loginForm) {
        loginForm.reset();
    }
    
    // Cargar usuario recordado si existe
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
}

// ============================================
// LOGIN - ANIMACIÓN DE ENFOQUE EN INPUTS
// ============================================
const inputs = document.querySelectorAll('.form-input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// ============================================
// DASHBOARD - INTERACTIVIDAD DE TARJETAS
// ============================================
const accessCards = document.querySelectorAll('.access-card');
accessCards.forEach(card => {
    card.addEventListener('click', function() {
        const cardText = this.querySelector('.access-text').textContent.trim();
        console.log('Tarjeta clickeada:', cardText);
        
        // Aquí puedes agregar navegación o funcionalidad específica
        alert(`Navegando a: ${cardText}`);
    });
});

// ============================================
// DASHBOARD - ANIMACIÓN DE BARRAS DE GRÁFICO
// ============================================
const chartBars = document.querySelectorAll('.bar');
chartBars.forEach(bar => {
    const originalHeight = bar.style.height;
    
    bar.addEventListener('mouseenter', function() {
        const currentHeight = parseInt(originalHeight);
        this.style.height = (currentHeight + 20) + 'px';
        this.style.transition = 'all 0.3s ease';
    });
    
    bar.addEventListener('mouseleave', function() {
        this.style.height = originalHeight;
    });
});

// ============================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ============================================
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    // Si hay sesión activa, mostrar dashboard directamente
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
});

// ============================================
// RESET PASSWORD - FORM SUBMISSION
// ============================================
const resetForm = document.getElementById('resetForm');

if (resetForm) {
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailOrUsername = document.getElementById('emailOrUsername').value;
        
        // Validación básica
        if (!emailOrUsername) {
            alert('Por favor, ingresa tu correo o nombre de usuario');
            return;
        }
        
        // Validación de formato de email (opcional pero recomendado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(emailOrUsername);
        
        if (!isEmail && emailOrUsername.length < 3) {
            alert('Por favor, ingresa un correo válido o un nombre de usuario válido');
            return;
        }
        
        // Simulación de envío (aquí iría la llamada al backend)
        console.log('Reset password request for:', emailOrUsername);
        
        // Deshabilitar botón durante el proceso
        const submitBtn = resetForm.querySelector('.reset-button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.style.opacity = '0.6';
        
        // Simular delay de envío
        setTimeout(() => {
            // Mostrar mensaje de éxito
            showSuccessMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
            
            // Guardar en localStorage para tracking (opcional)
            localStorage.setItem('lastPasswordReset', emailOrUsername);
            localStorage.setItem('resetTimestamp', new Date().toISOString());
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }, 1500);
    });
}

// ============================================
// AGREGAR ESTILOS DE ANIMACIÓN AL DOCUMENTO
// ============================================
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