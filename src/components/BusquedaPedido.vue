<script setup lang="ts">

import {ref, onMounted, h, computed} from "vue";
import {CustomResponse} from "../../electron/shared/CustomResponse.js";
import {Cliente, Orden} from "../../electron/shared/Types.js";
import {ElNotification} from "element-plus";
import {Pedido} from "../classes/Pedido.ts";

let nombreCliente = ref('');
let idCliente: number | null = null;
let ordenes = ref<Orden[]>([])

let selectedOrden =  ref<Orden | null>(null)
let pedidosList = ref<Pedido[]>([])



onMounted(() => {
  loadLastOrders()
})

function loadLastOrders() {
  window.electronApi.dbLastOrders(5).then((resp: CustomResponse) => {
    if (resp.estatus === 200) {
      ordenes.value = resp.data
      console.log(ordenes)
      console.log("resp", resp.data)
    }
  });
}


function handleClearClient() {
  idCliente = null;
  loadLastOrders()
}

const notifySelectUser = (mensaje: string) => {
  ElNotification({
    title: 'Nota',
    message: h('i', { style: 'color: teal' }, mensaje),
  })
}

const calculateTotal = computed(() => {
  if (pedidosList.value.length == 0) {
    return 0;
  }
  let total = 0;
  pedidosList.value.forEach((pedid) => {
    total += pedid.subtotal
  })
  return total
})

async function buscarOrdenesCliente() {
  if (idCliente === null) {
    notifySelectUser("Debe seleccionar un cliente");
    return;
  }
  let busqueda: CustomResponse = await window.electronApi.dbLastOrders(5, idCliente)
  if (busqueda.estatus === 200) {
    ordenes.value =  busqueda.data;
    console.log(busqueda.data);
    console.log(ordenes)
  } else {
    notifySelectUser("Ocurrió un error al buscar las ordenes")
  }
}

const handleSelect = (item: Record<string, any>) => {
  idCliente = item.id
  buscarOrdenesCliente();
}

function handleSelectOrder (orden: Orden) {
  selectedOrden.value = orden
  if (selectedOrden.value) {
    window.electronApi.getPedidosByOrder(selectedOrden.value.id).then((resp: CustomResponse) => {
      if (resp.estatus === 200) {
        pedidosList.value = resp.data
      } else {
        notifySelectUser("Ocurrió un error al buscar los detalles del pedido")
      }
    })
  }
}

const querySearch = (querystring: string, cb: (arg: any) => void) => {
  const results = window.electronApi.searchUsers(querystring);
  results.then((resp: CustomResponse) => {
    const suggestions = resp.data.map((client:Cliente) => {
      return {
        value: client.nombre,
        id: client.id,
      };
    });
    cb(suggestions);
  })
}

</script>

<template>
<el-container>

  <el-row gutter="20" >
    <el-col :span="12">
      <el-header>
        Búsqueda de pedido
      </el-header>
      <el-row>
        <el-autocomplete
            :fetch-suggestions="querySearch"
            @select="handleSelect"
            clearable
            @clear="handleClearClient"
            placeholder="Nombre del cliente" v-model="nombreCliente"/>
      </el-row>

      <el-row style="margin-top: 15px" v-if="nombreCliente.trim().length === 0">
        Últimas ordenes
      </el-row>

      <el-row>
        <el-table @current-change="handleSelectOrder" highlight-current-row :data="ordenes" style="width: 100%">
          <el-table-column prop="id" label="No. pedido"/>
          <el-table-column prop="nombre" label="Cliente"/>
          <el-table-column prop="fechaRegistro" label="Fecha orden"/>
        </el-table>
      </el-row>
    </el-col>
    <el-col :span="12">
      <el-header>
        Información de pedido
      </el-header>

      <el-main style="padding: 0" v-if="selectedOrden !== null && pedidosList">
        <el-row>
          <el-row >
            Pedido número {{ selectedOrden.id }}
          </el-row>
          <el-row >
            Fecha de pedido: {{ selectedOrden.fechaRegistro }}
          </el-row>
          <el-row >
            Cliente: {{ selectedOrden.nombre }}
          </el-row>
        </el-row>
        <el-row style="margin-top: 10px; margin-bottom: 10px">
          <el-col :span="8">
            <el-text size="large" type="primary">Servicio</el-text>
          </el-col>
          <el-col :span="8">
            <el-text size="large" type="primary">Cantidad</el-text>
          </el-col>
          <el-col :span="8">
            <el-text size="large" type="primary">Subtotal</el-text>
          </el-col>
        </el-row>
        <el-row v-for="(item, index) in pedidosList" :key="index" gutter=20>
          <el-col :span="8">
            <p>{{ item.tipo }}</p>
          </el-col>
          <el-col v-if="'pieza' === item.tipo" :span="8">
            <p>{{ item.cantidad }} {{ item.descripcion }} </p>
          </el-col>
          <el-col v-if="'lavado' === item.tipo" :span="8">
            <p>{{ item.cantidad }} kg</p>
          </el-col>
          <el-col v-if="'planchado' === item.tipo" :span="8">
            <p v-if="isNaN(Number(item.cantidad)) || Number(item.cantidad) === 0">
              {{ item.descripcion }}
            </p>
            <p v-else>
              {{ item.cantidad }} piezas
            </p>
          </el-col>
          <el-col :span="6" class="alineadoIzquierda">
            <p v-if="item.subtotal === 0">Pendiente</p>
            <p v-else>{{ item.subtotal }}</p>
          </el-col>
        </el-row>
        <el-row :gutter=20>
          <el-col :span="8" :offset="2">
            <p>Total:</p>
          </el-col>
          <el-col class="alineadoIzquierda" :span="6" :offset="8">
            <p>${{ calculateTotal }}</p>
          </el-col>
        </el-row>
      </el-main>
    </el-col>


  </el-row>
</el-container>
</template>

<style scoped>
.el-row {
  width: 100%;
}

.el-header {
  margin-bottom: 20px;
}
</style>