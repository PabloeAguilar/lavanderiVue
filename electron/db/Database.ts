import path from 'path';
import {app} from "electron";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');


export class DB {
    private static instance:typeof Database;

    static getInstance() {
        if (!DB.instance) {
            const userDataPath = app.getPath('userData');
            const dbPath = path.join(userDataPath, 'my-database.sqlite');
            DB.instance = new Database(dbPath);
            DB.initializeDatabase();
        }
        return DB.instance;
    }

    private static initializeDatabase() {
        try {
            // Create tables if they don't exist (example)
            const clientesQuery = `
                CREATE TABLE IF NOT EXISTS clientes
                (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre        text not null unique,
                    fechaRegistro text not null,
                    telefono      text
                );
            `;
            const ordenesQuery = `CREATE TABLE if not exists ordenes
                                  (
                                      id            INTEGER PRIMARY KEY AUTOINCREMENT,
                                      idCliente     INTEGER not null,
                                      fechaRegistro text    not null,
                                      fechaEntrega  text,
                                      comentarios   text,
                                      adelanto      integer,
                                      foreign key (idCliente) references clientes (id)
                                  )
                                  ;`
            const pedidosQuery =  `CREATE TABLE IF NOT EXISTS pedidos
                                   (
                                       id            INTEGER PRIMARY KEY AUTOINCREMENT,
                                       idOrden       INTEGER      not null,
                                       tipo          TEXT         NOT NULL,
                                       precio        INTEGER TEXT NOT NULL,
                                       descripcion   TEXT,
                                       cantidad      real         NOT NULL,
                                       subtotal      integer      NOT NULL,
                                       fechaRegistro text         NOT NULL,
                                       FOREIGN KEY (idOrden) references ordenes (id)
                                   );`
            const preciosQuery = ` CREATE TABLE IF NOT EXISTS precios
                                   (
                                       id      INTEGER PRIMARY KEY AUTOINCREMENT,
                                       nombre  varchar(255) NOT NULL,
                                       preccio INTEGER      NOT NULL
                                   );`

            const configsQuery = `CREATE TABLE IF NOT EXISTS configuraciones
                                  (
                                      id     integer not null
                                      constraint configuraciones_pk
                                      primary key autoincrement,
                                      nombre TEXT    not null
                                      constraint configuraciones_pk_2
                                      unique,
                                      valor  TEXT
                                  );`



            DB.instance.prepare(clientesQuery).run();
            DB.instance.prepare(ordenesQuery).run();
            DB.instance.prepare(pedidosQuery).run();
            DB.instance.prepare(preciosQuery).run();
            DB.instance.prepare(configsQuery).run();


        } catch (error) {
            console.error('Failed to initialize database:', error);
            // Handle error appropriately, maybe quit the app or show an error dialog
            app.quit();
        }
    }
}