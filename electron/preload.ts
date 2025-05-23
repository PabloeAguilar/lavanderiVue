import { ipcRenderer, contextBridge } from 'electron'
import {CustomResponse} from "./shared/CustomResponse.ts";

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
  insertOrden: async (nameUser:string, pedidos:[], idUser?:number,) => {
    console.log("orden inserción recibida");
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
    let orden = await ipcRenderer.invoke('db:getOrdenInsert', [idUser, fechaString]);
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
      data: respuestas
    }
    return respuesta;
  }
  ,
  searchUsers: (query: string) => {
    return ipcRenderer.invoke('db:searchUsers', ('%' + query + '%'));
  }

  // You can expose other APTs you need here.
  // ...
})

