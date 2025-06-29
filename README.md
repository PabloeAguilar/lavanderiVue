# lavanderiVue

LavanderiVue es una aplicación de escritorio desarrollada con Vue 3, Electron y SQLite para gestionar pedidos y clientes de una lavandería. Permite registrar órdenes de ropa (lavado, planchado o piezas individuales) y mantener un control básico de clientes con sus datos de contacto.

## Características

✅ Gestión de Pedidos

Registro de órdenes con tipo de servicio (lavado, planchado, piezas).

Fechas de entrega y precios.

👥 Gestión de Clientes

Añadir, editar y buscar clientes.

Almacenar nombre y teléfono para contacto rápido.

📊 Historial y Búsqueda

Visualizar pedidos anteriores.

Filtrar por cliente o estado.

💾 Base de Datos Local

Usa SQLite para almacenar toda la información de forma persistente.

Sin necesidad de conexión a internet.

## Instalación

Clonar el repositorio:

git clone https://github.com/tu-usuario/lavanderiVue.git

cd lavanderiVue

npm install

### !IMPORTANTE!
Comentar la función usb.on en node-modules/escpos-usb/index.js línea 52

npm run dev

## Uso

Al iniciar la aplicación, podrás:

Crear pedidos en Órdenes, asignándolos a un cliente.

Marcar pedidos como completados una vez finalizados.

## Capturas de Pantalla

![image](https://github.com/user-attachments/assets/58200688-a915-48ae-af8b-bab9ce52834d)


Contribuciones
¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto, abre un Pull Request o reporta errores en Issues.

Licencia
MIT

✨ Desarrollado con Vue, Electron y SQLite ✨
