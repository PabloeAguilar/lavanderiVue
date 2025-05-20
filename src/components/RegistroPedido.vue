<script lang="ts" setup>
import {Delete} from '@element-plus/icons-vue'
import {reactive, ref} from "vue";
import {Pedido} from "../classes/Pedido.js";
import {PiezasIndividuales} from "../classes/PiezasIndividuales.ts";

let nombreCliente = ref('');
let precioRopa = ref(18);
let precioPlanchado = ref(7);
let ropa = ref(0.0);
let planchados = ref({
  descripcion: '',
  piezas: 0,
});
let piezaIndividual = reactive(new PiezasIndividuales('', (0), (0)));
let listaPedido: Pedido[] = reactive([]);
let totalPedidos = ref(0);
let mensaje = ref('');

function agregarRopa() {
  let pedido = new Pedido('lavado', ropa.value, precioRopa.value)
  listaPedido.push(pedido)
  totalPedidos.value += Math.floor(precioRopa.value * ropa.value)
  ropa.value = 1
}

function removerSubpedido(index: number) {
  totalPedidos.value -= listaPedido[index].subtotal
  listaPedido.splice(index, 1)
}

function agregarPlanchados() {
  let pedido = new Pedido('planchado', planchados.value.piezas, precioPlanchado.value);
  pedido.descripcion = planchados.value.descripcion;
  totalPedidos.value += pedido.subtotal
  listaPedido.push(pedido)
  planchados.value.piezas = 0;
  planchados.value.descripcion = '';
}

function agregarPiezaIndividual() {
  let individual = new Pedido('pieza', piezaIndividual.piezas, piezaIndividual.precio)
  individual.descripcion = piezaIndividual.descripcion;
  totalPedidos.value += individual.subtotal;
  listaPedido.push(individual);
  piezaIndividual.descripcion = ''
  piezaIndividual.piezas = 1;
  piezaIndividual.precio = 70
}

function registrarPedido() {
  mensaje.value = "registro guardado";
  setTimeout(function () {
    mensaje.value = '';
  }, 5000)
}

function onCloseMensaje()
{
  mensaje.value = '';
}
</script>

<template>
  <el-row style="margin-bottom: 20px" gutter="20" v-if="mensaje.length > 0">
    <el-col :span="24">
      <el-alert @close="onCloseMensaje" type="success"> {{ mensaje }}</el-alert>
    </el-col>
  </el-row>

  <el-container class="containerModulo">
    <el-row gutter="20">
      <el-col :span="12">
        <el-header>
          Pedido
        </el-header>
        <el-row>
          <el-col>
            <p>Cliente</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-input placeholder="Nombre del cliente" v-model="nombreCliente"/>
          </el-col>
        </el-row>
        <el-collapse accordion>
          <el-collapse-item title="Ropa">
            <el-main class="registroInfoPedido">
              <el-row>
                <el-col>
                  <p>Precio</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number min=1 max=9999 placeholder="precio" v-model="precioRopa" step="1"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Kilos</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number min=1 max=9999 v-model="ropa" step=.1 precision="1"/>
                </el-col>
              </el-row>
            </el-main>
            <el-footer class="alineadoIzquierda">
              <el-button @click="agregarRopa()" type="primary">Agregar</el-button>
              <el-button disabled type="info">Agregar aparte</el-button>
            </el-footer>
          </el-collapse-item>
          <el-collapse-item title="Planchados">
            <el-main class="registroInfoPedido">
              <el-row>
                <el-col>
                  <p>Precio</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number min=1 max=9999 placeholder="precio" v-model="precioPlanchado" step="1"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Notas</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input placeholder="Que piezas" v-model="planchados.descripcion"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Piezas</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number min=0 max=9999 placeholder="Cantidad" v-model="planchados.piezas" step="1"/>
                </el-col>
              </el-row>
            </el-main>
            <el-footer class="alineadoIzquierda">
              <el-button @click="agregarPlanchados()" type="primary">Agregar</el-button>
            </el-footer>
          </el-collapse-item>
          <el-collapse-item title="Individuales">
            <el-main class="registroInfoPedido">
              <el-row>
                <el-col>
                  <p>Pieza</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input minlength="3" placeholder="Almohada, edredon, etc" v-model="piezaIndividual.descripcion"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Cantidad</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number min="1" placeholder="10, 9" v-model="piezaIndividual.piezas"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Precio</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number placeholder="70" min="20" step="5" v-model="piezaIndividual.precio">
                    <template #prefix>
                      <span>$</span>
                    </template>
                  </el-input-number>
                </el-col>
              </el-row>
            </el-main>
            <el-footer class="alineadoIzquierda">
              <el-button @click="agregarPiezaIndividual()" type="primary">Agregar</el-button>
            </el-footer>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="12">
        <el-header>
          Resumen
        </el-header>
        <el-row gutter="20">
          <el-col :span="2">

          </el-col>
          <el-col :span="8">
            <p>Descripción</p>
          </el-col>
          <el-col :span="8">
            <p>Cantidad</p>
          </el-col>
          <el-col :span="6" class="alineadoIzquierda">
            <p>Subtotal</p>
          </el-col>
        </el-row>
        <el-row v-for="(item, index) in listaPedido" :key="index" gutter="20">
          <el-col :span="2">
            <el-button circle @click="removerSubpedido(index)" type="danger" :icon="Delete"/>
          </el-col>
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
        <el-row :gutter="20">
          <el-col :span="8" :offset="2">
            <p>Total:</p>
          </el-col>
          <el-col class="alineadoIzquierda" :span="6" :offset="8">
            <p>${{ totalPedidos }}</p>
          </el-col>
        </el-row>
        <el-footer>
          <el-button @click="registrarPedido">Registrar</el-button>
        </el-footer>

      </el-col>

    </el-row>
  </el-container>
</template>

<style scoped>
.containerModulo {
  width: 100%;
}

.el-row {
  width: 100%;
}

.registroInfoPedido .el-col-24 {
  display: flex;
  justify-content: start;
}

.alineadoIzquierda {
  display: flex;
  justify-content: flex-start;
}
</style>