<template>
  <div>
    <!-- Título del menú -->
    <el-header>Lavanderia El Jardin</el-header>

    <!-- Menú lateral -->
    <el-menu
        :default-active="activeRoute"
        @select="handleMenuSelect"
    >

      <el-menu-item v-for="(item) in props.listaMenus"
                    @click="cambioMenu(item.nombreModulo)"
                    :index="item.rutaModulo" :key="item.rutaModulo">
        <span> {{ item.nombreModulo }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from "vue-router";
import {computed} from "vue";
import {Menu} from "../classes/Menu.ts"

function cambioMenu(nombreModulo:string) {
  emits("menuCambiado", nombreModulo);
}

const route = useRoute();
const router = useRouter();

// Ruta activa para resaltar el ítem del menú
const activeRoute = computed(() => route.path);



const handleMenuSelect = (index:string) => {
  router.push(index); // Navegar a la ruta seleccionada
};

const emits = defineEmits<{
  menuCambiado: [mensaje:string],
}>();

const props = defineProps({
  listaMenus: Array<Menu>,
})
</script>

<style scoped>
.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  text-align: center;
}

.el-menu {
  border-right: none;
}
</style>