"use strict";
const electron = require("electron");
const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false
};
electron.contextBridge.exposeInMainWorld("electronApi", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  dbLastOrders: (limit, idCliente) => electron.ipcRenderer.invoke("db:getLastOrders", limit, idCliente),
  getPedidosByOrder: (idOrden) => electron.ipcRenderer.invoke("db:getPedidosByOrder", idOrden),
  insertOrden: async (nameUser, pedidos, comentarios, adelanto, idUser) => {
    let fecha = /* @__PURE__ */ new Date();
    let fechaString = new Intl.DateTimeFormat(["es-MX", "en-Us"], options).format(fecha);
    if (idUser === void 0 || idUser === null) {
      let args = [nameUser, fechaString];
      let user = await electron.ipcRenderer.invoke("db:getUserInsert", args);
      if (user.estatus == 400) {
        return user;
      }
      idUser = user.data;
    }
    let orden = await electron.ipcRenderer.invoke("db:getOrdenInsert", [idUser, fechaString, comentarios, adelanto]);
    if (orden.estatus == 400) {
      return orden;
    }
    let respuestas = [];
    for (const pedido of pedidos) {
      respuestas.push(await electron.ipcRenderer.invoke("db:insertPedido", orden.data, pedido, fechaString));
    }
    let respuesta = {
      estatus: 200,
      statusText: "OK",
      data: {
        pedidos: respuestas,
        orden
      }
    };
    return respuesta;
  },
  searchUsers: (query) => {
    return electron.ipcRenderer.invoke("db:searchUsers", "%" + query + "%");
  },
  loadClientes: () => {
    return electron.ipcRenderer.invoke("db:loadClientes");
  },
  updateClient: (cliente) => {
    return electron.ipcRenderer.invoke("db:updateClient", cliente);
  },
  marcarOrdenComoEntregado: async (idOrden) => {
    let fecha = /* @__PURE__ */ new Date();
    let fechaString = new Intl.DateTimeFormat(["es-MX", "en-Us"], options).format(fecha);
    let actualizacionCorrecta = await electron.ipcRenderer.invoke("db:updateFechaEntregaOrden", idOrden, fechaString);
    if (actualizacionCorrecta) {
      return electron.ipcRenderer.invoke("db:searchOrden", idOrden);
    } else {
      let response = {
        estatus: 400,
        statusText: "error interno"
      };
      return response;
    }
  },
  obtenerListaSugerenciasPiezas: () => {
    return electron.ipcRenderer.invoke("db:loadSugerenciasPiezas");
  },
  actualizarSugerenciaPieza: (sugerencia) => {
    return electron.ipcRenderer.invoke("db:updateSugerenciaPieza", sugerencia);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("printApi", {
  imprimirRecibo: async (ordenId, pedidos) => {
    let orden = await electron.ipcRenderer.invoke("db:searchOrden", ordenId);
    let configs = await electron.ipcRenderer.invoke("db:searchConfigs");
    let ordenFinal = orden.data;
    console.log("Imprimir enviado");
    electron.ipcRenderer.invoke("imprimirReciboMediaHoja", {
      contenido: { ordenFinal, pedidos },
      configs,
      configuracion: {
        margins: { marginType: "none" },
        silent: false,
        printBackground: false
      }
    });
  }
});
