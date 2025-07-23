import { ipcRenderer, contextBridge } from 'electron'
import {CustomResponse} from "./shared/CustomResponse.ts";
import {Cliente} from "./shared/Types.ts";

const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronApi', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  dbLastOrders: (limit: number, idCliente? : number) => ipcRenderer.invoke('db:getLastOrders', limit, idCliente)
  ,
  getPedidosByOrder: (idOrden: number) => ipcRenderer.invoke('db:getPedidosByOrder', idOrden)
  ,
  insertOrden: async (nameUser:string, pedidos:[], comentarios?:String, adelanto:number, idUser?:number,) => {
    let fecha = new Date();
    let fechaString = new Intl.DateTimeFormat(["es-MX", "en-Us"], options).format(fecha);
    if (idUser === undefined || idUser === null) {
      let args = [nameUser, fechaString];
      let user = await ipcRenderer.invoke('db:getUserInsert', args);
      if (user.estatus == 400) {
        return user;
      }
      idUser = user.data;
    }
    let orden = await ipcRenderer.invoke('db:getOrdenInsert', [idUser, fechaString, comentarios, adelanto]);
    if (orden.estatus == 400) {
      return orden;
    }
    let respuestas: CustomResponse[] = [];
    for (const pedido of pedidos) {
      respuestas.push(await ipcRenderer.invoke('db:insertPedido', orden.data, pedido, fechaString));
    }
    let respuesta:CustomResponse = {
      estatus: 200,
      statusText: 'OK',
      data: {
        pedidos: respuestas,
        orden: orden,
      }
    }
    return respuesta;
  }
  ,
  searchUsers: (query: string) => {
    return ipcRenderer.invoke('db:searchUsers', ('%' + query + '%'));
  },

  loadClientes: () => {
    return ipcRenderer.invoke('db:loadClientes');
  },

  updateClient: (cliente:Cliente) => {
    return ipcRenderer.invoke('db:updateClient', cliente);
  },

  marcarOrdenComoEntregado: async (idOrden: number) => {
    let fecha = new Date();
    let fechaString = new Intl.DateTimeFormat(["es-MX", "en-Us"], options).format(fecha);
    let actualizacionCorrecta:boolean = await ipcRenderer.invoke('db:updateFechaEntregaOrden', idOrden, fechaString);
    if (actualizacionCorrecta) {
      return ipcRenderer.invoke('db:searchOrden', idOrden);
    } else {
      let response:CustomResponse = {
        estatus: 400,
        statusText: 'error interno',
      }
      return response;
    }

  },



  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld("printApi", {
  imprimirRecibo: async (ordenId, pedidos) => {
    let orden = await ipcRenderer.invoke('db:searchOrden', ordenId);
    let configs = await ipcRenderer.invoke('db:searchConfigs');
    let ordenFinal = orden.data;
    console.log("Imprimir enviado")
    ipcRenderer.invoke('imprimirReciboMediaHoja', {
      contenido: {ordenFinal, pedidos},
      configs: configs,
      configuracion: {
        margins: { marginType: 'none' },
        silent: false,
        printBackground: false
      }
    })
  }
})

