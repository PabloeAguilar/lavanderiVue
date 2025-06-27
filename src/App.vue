<template>
  <div class="common-layout">
    <el-container>
      <el-aside style="height: 90vh">
        <MenuLateral @menuCambiado="menuSeleccionado" :lista-menus="listaModulos"/>
      </el-aside>

      <el-container>
        <el-header id="encabezadoModulo"> {{ menuActual }}</el-header>
        <el-main>
          <!-- Contenido principal -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

  </div>
</template>

<script lang="ts" setup>

import MenuLateral from './components/MenuLateral.vue';
import {Menu} from './classes/Menu.ts'

let menuActual = '';
const listaModulos = [
  new Menu("Bienvenida", "Bienvenido", "/"),
  new Menu("Registro de pedido", "Registro de pedido", "/registroPedido"),
  new Menu("Búsqueda pedidos", "Búsqueda de pedidos", "/busqueda"),
  new Menu("Clientes", "Lista de clientes", "/clientes"),
]
function  menuSeleccionado(nombreModulo:string) {
  menuActual = nombreModulo;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: large;
}

.el-collapse-item__title,
p,
.el-input-number .el-input__inner,
.el-input .el-input__inner,
.el-table__body,
.el-button > span,
thead,
span {
  font-size: large;
}

.el-autocomplete-suggestion li {
  font-size: large !important;
}

.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
}

.el-aside {
  background-color: #304156;
  color: white;
}

.el-menu {
  border-right: none;
}

#encabezadoModulo {
  background-color: #304156;
  color: white;
}
</style>
