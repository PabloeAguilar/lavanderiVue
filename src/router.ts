import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue'; // Ejemplo de importación de un componente
import RegistroPedido from "./components/RegistroPedido.vue";
import BusquedaPedido from "./components/BusquedaPedido.vue";
import ModuloClientes from "./components/ModuloClientes.vue";

const rutas = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld,
        props: {
            msg: "Bienvenido"
        }

    },
    {
        path: '/registroPedido',
        name: 'RegistrarPedido',
        component: RegistroPedido
    },
    {
        path: '/busqueda',
        name: 'Busqueda',
        component: BusquedaPedido
    },
    {
        path: '/clientes',
        name: 'Clientes',
        component: ModuloClientes
    }

    // Otras rutas...
];

const router = createRouter({
    history: createWebHistory(),
    routes: rutas
});

export default router;