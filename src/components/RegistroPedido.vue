<script lang="ts" setup>
import {Delete} from '@element-plus/icons-vue'
import {reactive, ref, toRaw, computed} from "vue";
import {Pedido} from "../classes/Pedido.js";
import {PiezasIndividuales} from "../classes/PiezasIndividuales.ts";
import {CustomResponse} from "../../electron/shared/CustomResponse.ts";
import {Cliente} from "../../electron/shared/Types.ts";
import {ElNotification} from "element-plus";

let nombreCliente = ref('');
let idCliente: number | null = null;
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
let tipoMensaje = ref('');
let comentariosGenerales = ref('');
let adelanto = ref(0);
let ordenId = ref(0);
const restante = computed(() => {
  return totalPedidos.value - adelanto.value;
})

function onInputAdelanto(){
  if (adelanto.value > totalPedidos.value) {
    adelanto.value = totalPedidos.value;
  }
}

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

function comprobacionPedido() :string | undefined {
  console.log(nombreCliente.value.trim())
  if (nombreCliente.value.trim().length < 1) {
    return 'Es necesario un nombre del cliente'
  }
  if (listaPedido.length < 1) {
    return 'Es necesario algún pedido de ropa, planchados, etc'
  }
  return undefined;
}

async function registrarPedido() {
  let observacionesPedido:string|undefined = comprobacionPedido();
  if (observacionesPedido !== undefined ) {
    mensaje.value = observacionesPedido;
    tipoMensaje.value = 'error';
    reiniciarMensaje();
    return;
  }
  const result = await window.electronApi.insertOrden(nombreCliente.value, toRaw(listaPedido), comentariosGenerales.value, adelanto.value, idCliente);
  if (result.estatus == 200) {
    ordenId.value = result.data.orden.data
    mostrarMensaje("Guardado correcto", "success", "registro guardado", 0)
  } else {
    mensaje.value = result.statusText;
    tipoMensaje.value = 'error'
  }
  reiniciarMensaje();

}

function mostrarMensaje(titulo:string, tipo:String, mensaje:string, duration:number) {
  ElNotification({
    title: titulo,
    message: mensaje,
    type:tipo,
    duration:duration
  })
}

function imprimirPedido() {
  if (ordenId.value == 0) {
    mostrarMensaje("No se puede imprimir", "info", "Registre el pedido para imprimirlo", 5);
    return;
  }
  window.electronApi.imprimirRecibo(ordenId.value, toRaw(listaPedido))
}

function reiniciarMensaje() {
  setTimeout(function () {
    mensaje.value = '';

  }, 5000)

}

function onCloseMensaje() {
  mensaje.value = '';
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

const handleSelect = (item: Record<string, any>) => {
  idCliente = item.id
}

function restartForm() {
  idCliente = null;
  nombreCliente.value = '';
  listaPedido.length = 0;
  adelanto.value = 0;
  totalPedidos.value = 0;
  comentariosGenerales.value = '';
}

function handleClearClient() {
  idCliente = null;
}
</script>

<template>
  <el-row style="margin-bottom: 20px" gutter=20 v-if="mensaje.length > 0">
    <el-col :span=24>
      <el-alert @close="onCloseMensaje" :type="tipoMensaje"> {{ mensaje }}</el-alert>
    </el-col>
  </el-row>

  <el-container class="containerModulo">
    <el-row gutter=20>
      <el-col :span=12>
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
            <el-autocomplete
                :fetch-suggestions="querySearch"
                @select="handleSelect"
                clearable
                @clear="handleClearClient"
                placeholder="Nombre del cliente" v-model="nombreCliente"/>
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
                  <el-input-number @focus="$event.target.select()" min=1 max=9999 v-model="ropa" step=.1 precision=1 />
                </el-col>
              </el-row>
            </el-main>
            <el-footer class="alineadoIzquierda">
              <el-button @click="agregarRopa()" type="primary">Agregar</el-button>
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
                  <el-input-number @focus="$event.target.select()" min=1 max=9999 placeholder="precio" v-model="precioPlanchado" step=1 />
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
                  <el-input-number @focus="$event.target.select()" min=0 max=9999 placeholder="Cantidad" v-model="planchados.piezas" step=1 />
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
                  <el-input minlength=3 placeholder="Almohada, edredon, etc" v-model="piezaIndividual.descripcion"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Cantidad</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number @focus="$event.target.select()" min=1 placeholder="10, 9" v-model="piezaIndividual.piezas"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <p>Precio</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-input-number @focus="$event.target.select()" placeholder="70" min=20 step=5 v-model="piezaIndividual.precio">
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
        <el-input placeholder="Comentarios adicionales" v-model="comentariosGenerales"/>
      </el-col>
      <el-col :span=12>
        <el-header>
          Resumen
        </el-header>
        <el-row gutter=20>
          <el-col :span=2>

          </el-col>
          <el-col :span=8>
            <p>Descripción</p>
          </el-col>
          <el-col :span=8>
            <p>Cantidad</p>
          </el-col>
          <el-col :span=6 class="alineadoIzquierda">
            <p>Subtotal</p>
          </el-col>
        </el-row>
        <el-row v-for="(item, index) in listaPedido" :key="index" gutter=20>
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
        <el-row :gutter=20>
          <el-col :span="8" :offset="2">
            <p>Total:</p>
          </el-col>
          <el-col class="alineadoIzquierda" :span="6" :offset="8">
            <p>${{ totalPedidos }}</p>
          </el-col>
        </el-row>
        <el-row :gutter=20>
          <el-col :span="8" :offset="2">
            <p>Adelanto:</p>
          </el-col>
          <el-col class="alineadoIzquierda" :span="12" :offset="2">
            <el-input-number v-model="adelanto" min="0" @change="onInputAdelanto"  />
          </el-col>
        </el-row>
        <el-row :gutter=20>
          <el-col :span="8" :offset="2">
            <p>Restante:</p>
          </el-col>
          <el-col class="alineadoIzquierda" :span="6" :offset="8">
            <p>${{ restante }}</p>
          </el-col>
        </el-row>
        <el-footer>
          <el-row v-if="ordenId == 0" style="margin-bottom: 10px">
            <el-button type="success" @click="registrarPedido">Registrar</el-button>
          </el-row>
          <el-row>
            <el-button plain type="danger" @click="restartForm">Limpiar</el-button>
          </el-row>
          <el-row v-if="ordenId != 0"  style="margin-top: 10px">
            <el-button type="primary" plain @click="imprimirPedido">Imprimir</el-button>
          </el-row>

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