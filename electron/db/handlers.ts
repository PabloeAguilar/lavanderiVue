import { ipcMain } from 'electron';
import { DB } from './Database';
import {SqliteError} from "better-sqlite3";
import {CustomResponse} from "../shared/CustomResponse.ts";
import {Pedido} from "../../src/classes/Pedido.ts";

export function setupDbIpcHandlers() {
    ipcMain.handle('db:query', (event, sql: string, params: any[]) => {
        const db = DB.getInstance();
        return db.prepare(sql).all(params);
    });

    ipcMain.handle('db:run', (event, sql: string, params: any[]) => {
        const db = DB.getInstance();
        return db.prepare(sql).run(params);
    });

    ipcMain.handle('db:searchConfigs', (event) => {
        const db = DB.getInstance();
        const configs = db.prepare("SELECT * FROM configuraciones").all();
        if (configs.length == 0) {
            // necesarias para la generación de ticket
            const necesaryConfigs = `
                INSERT INTO configuraciones (nombre) VALUES ('rfc'), ('regimen'), ('direccion'), ('horario'), ('telefono'), ('notas') ;
            `
            db.prepare(necesaryConfigs).run();
        }
        return db.prepare("SELECT * FROM configuraciones").all();
    })

    ipcMain.handle('db:searchOrden', (event, idOrden: number) => {
        const db = DB.getInstance();
        console.log("Se va a buscar la orden con id: " + idOrden);
        let orden = db.prepare("SELECT o.*, c.nombre FROM ordenes o join clientes c on o.idCliente = c.id WHERE o.id = ?").get(idOrden);
        let respuesta:CustomResponse = {
            data: orden,
            estatus: 200,
            statusText: 'OK',
        }
        console.log(respuesta);
        return respuesta;
    })

    ipcMain.handle('db:getLastOrders', (event, limit: number, idCliente? : number) => {
        const db = DB.getInstance();
        try {
            if (idCliente) {
                let respuesta : CustomResponse = {
                    data: db.prepare("SELECT o.*, c.nombre FROM ordenes o join clientes c on o.idCliente = c.id WHERE idCliente = ?  order by id desc limit ?").all(idCliente, limit),
                    estatus: 200,
                    statusText: 'OK',
                }
                return respuesta;
            } else {
                let respuesta : CustomResponse = {
                    data: db.prepare("SELECT o.*, c.nombre FROM ordenes o join clientes c on o.idCliente = c.id order by id desc limit ?").all(limit),
                    estatus: 200,
                    statusText: 'OK',
                }
                return respuesta;
            }
        } catch (e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message,
            }
            return respuesta;
        }
    });

    ipcMain.handle('db:getPedidosByOrder', (event, idOrder: number) => {
        const db = DB.getInstance();
        try {
            const respuesta:CustomResponse = {
                estatus: 200,
                statusText: 'OK',
                data: db.prepare('SELECT * FROM pedidos o where o.idOrden = ? ').all(idOrder)
            }
            return respuesta
        }  catch(e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message
            }
        }
    })

    ipcMain.handle('db:getUserInsert', (event, params: any[]) => {
        const db = DB.getInstance();
        try {
            let respuesta:CustomResponse = {
                data: db.prepare("Insert into clientes (nombre, fechaRegistro) values (?, ?)").run(params).lastInsertRowid,
                estatus: 200,
                statusText: "Todo correcto",
            }
            return respuesta;

        } catch (e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message,
            }
            return respuesta;
        }
    });

    ipcMain.handle('db:getOrdenInsert', (event, params: any[]) => {
        const db = DB.getInstance();
        try {
            let respuesta:CustomResponse = {
                data: db.prepare("Insert into ordenes (idCliente, fechaRegistro, comentarios, adelanto) values (?, ?, ?, ?)").run(params).lastInsertRowid,
                estatus: 200,
                statusText: "Todo correcto",
            }
            return respuesta;

        } catch (e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message,
            }
            return respuesta;
        }
    })

    ipcMain.handle('db:insertPedido', (event, idOrden:number, params: Pedido, fecha:string) => {
        const db = DB.getInstance();
        try {
            let respuesta:CustomResponse = {
                data: db.prepare("Insert into pedidos (idOrden, cantidad, descripcion, precio,  subtotal, tipo, fechaRegistro) values (?, ?, ?, ?, ?, ?, ?)")
                    .run(idOrden, params.cantidad, params.descripcion, params.precio, params.subtotal, params.tipo, fecha).lastInsertRowid,
                estatus: 200,
                statusText: "Todo correcto",
            }
            return respuesta;

        } catch (e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message,
            }
            return respuesta;
        }
    })

    ipcMain.handle('db:searchUsers',  (event, query: string) => {
        const db = DB.getInstance();
        try {
            let respuesta:CustomResponse = {
                data: db.prepare("SELECT * From clientes WHERE nombre like ? limit 10").all(query),
                estatus: 200,
                statusText: "Todo correcto",
            }
            return respuesta;

        } catch (e:SqliteError) {
            let respuesta:CustomResponse = {
                estatus: 400,
                statusText: "Error interno",
                detailedMessage: e.message,
            }
            return respuesta;
        }
    })
}