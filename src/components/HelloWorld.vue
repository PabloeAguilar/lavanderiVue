<template>
  <div class="welcome-container">
    <div class="welcome-card">
<!--      <div class="logo-container">-->
<!--        <img src="../assets/logo.png" alt="Logo del sistema" class="logo">-->
<!--      </div>-->

      <h1 class="welcome-title">Bienvenido al Sistema</h1>
      <p class="welcome-message">Gracias por utilizar nuestra plataforma. Por favor selecciona una opción en el menú lateral para continuar.</p>

      <div class="footer">
        <p>© 2025 Lavandería.  Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeScreen',

}
</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  padding: 20px;
}

.welcome-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logo-container {
  margin-bottom: 30px;
}

.logo {
  max-width: 150px;
  height: auto;
}

.welcome-title {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 28px;
}

.welcome-message {
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background-color: #bdc3c7;
  transform: translateY(-2px);
}

.footer {
  margin-top: 40px;
  color: #95a5a6;
  font-size: 14px;
}
</style>