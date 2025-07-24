import { ipcMain } from 'electron';
import { DB } from './Database';
import {SqliteError} from "better-sqlite3";
import {CustomResponse} from "../shared/CustomResponse.ts";
import {Pedido} from "../../src/classes/Pedido.ts";
import {Cliente, SugerenciaPieza} from "../shared/Types.ts";

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
        let orden = db.prepare("SELECT o.*, c.nombre FROM ordenes o join clientes c on o.idCliente = c.id WHERE o.id = ?").get(idOrden);
        let respuesta:CustomResponse = {
            data: orden,
            estatus: 200,
            statusText: 'OK',
        }
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

    ipcMain.handle('db:loadClientes', (event) => {
        const db = DB.getInstance();
        try {
            var users = db.prepare("SELECT * FROM clientes").all();
        } catch (e:SqliteError) {
            var detailedMessage = e.message;
        }
        let respuesta:CustomResponse = {
            estatus: (users !== undefined ? 200 : 400),
            statusText: (users !== undefined ? 'Ok' : "Error interno"),
            detailedMessage: (users !== undefined ? undefined : detailedMessage),
            data: (users !== undefined ? users : undefined)
        }
        return respuesta;
    })

    ipcMain.handle('db:updateClient', (event, cliente: Cliente) => {
        const db = DB.getInstance();
        try {
            db.prepare("UPDATE Clientes SET nombre = ?, telefono = ? where id = ?").run(cliente.nombre, cliente.telefono, cliente.id);
            var ok = true;
        } catch (e: SqliteError) {
            var detailedMessage = e.message;
        }
        let respuesta: CustomResponse = {
            estatus: ok ? 200 : 400,
            detailedMessage: ok ? undefined : detailedMessage,
            statusText: ok ? 'ok' : 'Error interno',
        }
        return respuesta;
    })

    ipcMain.handle('db:updateFechaEntregaOrden', (event, idOrden:number, fecha:string) => {
        const db = DB.getInstance();
        try {
            db.prepare("UPDATE ordenes SET fechaEntrega = ? where id = ?").run(fecha, idOrden);
            return true;
        } catch (e:SqliteError) {
            console.log(e.message)
            return false;
        }

    })

    ipcMain.handle('db:loadSugerenciasPiezas', (event) => {
        const db = DB.getInstance();
        try {
            var piezas = db.prepare("SELECT * FROM piezas_sugerencias").all();
            if (piezas.length == 0) {
                // Insertar piezas sugeridas por defecto
                const defaultPieces = `
                    INSERT INTO piezas_sugerencias (clave, nombre, precio_individual) VALUES 
                    ('tenis', 'Par de tenis', 20),
                    ('cobertor', 'Cobertor', 60),
                    ('sobrecama', 'Sobrecama', 50),
                    ('edredon', 'Edredon', 70),
                    ('chamarra', 'Chamarra', 25),
                    ('almohada', 'Almohada', 25);
                `;
                db.prepare(defaultPieces).run();
                piezas = db.prepare("SELECT * FROM piezas_sugerencias").all();
            }
        } catch (e:SqliteError) {
            var detailedMessage = e.message;
        }
        let respuesta:CustomResponse = {
            estatus: (piezas !== undefined ? 200 : 400),
            statusText: (piezas !== undefined ? 'Ok' : "Error interno"),
            detailedMessage: (piezas !== undefined ? undefined : detailedMessage),
            data: (piezas !== undefined ? piezas : undefined)
        }
        return respuesta;
    })

    ipcMain.handle('db:insertSugerenciaPieza', (event, pieza: { clave: string, nombre: string, precio_individual: number }) => {
        const db = DB.getInstance();
        try {
            let respuesta:CustomResponse = {
                data: db.prepare("INSERT INTO piezas_sugerencias (clave, nombre, precio_individual) VALUES (?, ?, ?)")
                    .run(pieza.clave, pieza.nombre, pieza.precio_individual).lastInsertRowid,
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

    ipcMain.handle('db:deleteSugerenciaPieza', (event, idPieza: number) => {
        const db = DB.getInstance();
        try {
            db.prepare("DELETE FROM piezas_sugerencias WHERE id = ?").run(idPieza);
            return true;
        } catch (e:SqliteError) {
            console.log(e.message);
            return false;
        }
    });

    ipcMain.handle('db:updateSugerenciaPieza', (event, pieza:SugerenciaPieza) => {
        const db = DB.getInstance();
        try {
            db.prepare("UPDATE piezas_sugerencias SET clave = ?, nombre = ?, precio_individual = ? WHERE id = ?")
                .run(pieza.clave, pieza.nombre, pieza.precio_individual, pieza.id);
            return true;
        } catch (e:SqliteError) {
            console.log(e.message);
            return false;
        }
    })
}