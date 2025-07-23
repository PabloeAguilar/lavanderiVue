import {BrowserWindow, ipcMain, Menu} from 'electron';
import {createRequire} from 'node:module';
import {Pedido} from "../../src/classes/Pedido.ts";
import {Orden} from "../shared/Types.ts";

const require = createRequire(import.meta.url);
const escpos = require('escpos');
const escpos_usb = require('escpos-usb');


escpos.USB = escpos_usb;

export function setupPrintUtilities() {
    ipcMain.handle("imprimirRecibo", (event, data) => {
        imprimirReciboEscPos(data.contenido.pedidos, data.contenido.ordenFinal, data.configs);
    });

    ipcMain.handle("imprimirReciboMediaHoja", (event, data) => {
        let win = new BrowserWindow({
            show: true,
            webPreferences: {
                nodeIntegration: true,
            }
        })
        const template = [
            {
                label: 'Archivo',
                submenu: [
                    {
                        label: 'Imprimir',
                        accelerator: 'CmdOrCtrl+P',
                        click: () =>
                        {
                            win.webContents.print({
                                deviceName: "L3260 Series(Red)",
                                copies: 2,

                        }, success => {
                            if (win && !win.isDestroyed()) {
                                win.close();
                            }
                        }) }
                    }
                ]
            }
        ]

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)

        const html =  generateReciboHtml(data.contenido, data.configs);
        win.loadURL(`data:text/html,${encodeURIComponent(html)}`);
    })
}


export function imprimirReciboEscPos(pedidos, ordenInfo, configs) {
    // Buscar la impresora USB
    console.log("Antes de buscar la impresora")
    const device = new escpos.USB();
    const map = new Map();
    configs.forEach(obj => {
        map.set(obj.nombre, obj.valor);
    });

    // Configurar la impresora
    const printer = new escpos.Printer(device, {
        encoding: 'GB18030',
        width: 30 // Ancho de la impresora en caracteres (ajustar según modelo)
    });

    device.open(function (error) {
        if (error) {
            console.error('Error al conectar con la impresora:', error);
            return;
        }

        console.log("Alcanza config inicial")
        // Configuración inicial
        printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text('LAVANDERIA EL JARDIN')
            .align('lt')
            .text(`${map.get('direccion')}`)
            .text(`${map.get('rfc')}`)
            .size(0, 0)
            .text(`${map.get('regimen')}`)
            .size(1, 1)
            .text(`TELEFONO: ${map.get('telefono')}`)
            .text(`${map.get('horario')}`)
            .size(0, 0)
            .style('b')
            .text('----------------------------')
            .align('lt')
            .text(`FECHA: ${ordenInfo.fechaRegistro}`)
            .text(`CLIENTE: ${ordenInfo.nombre}`)


        if (ordenInfo.fechaEntrega !== undefined && ordenInfo.fechaEntrega !== null) {
            printer
                .align('lt')
                .text(`ENTREGADO: ${ordenInfo.fechaEntrega}`)
        }
        printer
            .text('----------------------------')
            .feed(1);

        // Encabezados de columnas
        printer
            .style('b')
            .text(
                leftAlign('DESCRIPCION', 22) +
                centerAlign('UNITARIO', 10) +
                rightAlign('SUBTOTAL', 10)
            )
            .text('----------------------------')
            .style('');
        // Items del pedido
        pedidos.forEach(pedido => {
            let descripcion = '';

            if (pedido.tipo === 'pieza') {
                descripcion = `${pedido.cantidad} ${pedido.descripcion}`;
            } else if (pedido.tipo === 'lavado') {
                descripcion = `${pedido.cantidad} kg`;
            } else if (pedido.tipo === 'planchado') {
                descripcion = isNaN(pedido.cantidad) || pedido.cantidad == 0
                    ? pedido.descripcion
                    : `${pedido.cantidad} piezas`;
            }

            printer.text(
                leftAlign(`${pedido.tipo}: ${descripcion}`, 22) +
                rightAlign(`$${pedido.precioUnitario?.toFixed(2) || '0.00'}`, 10) +
                rightAlign(`$${pedido.subtotal.toFixed(2)}`, 10)
            );
        });

        // Totales
        const total = pedidos.reduce((sum, pedido) => sum + pedido.subtotal, 0);
        const adelanto = ordenInfo.adelanto || 0;
        const restante = Math.max(0, total - adelanto);

        printer
            .text('----------------------------')
            .feed(1)
            .style('b')
            .text(
                leftAlign('TOTAL:', 32) +
                rightAlign(`$${total.toFixed(2)}`, 10)
            )
            .style('')
            .text(
                leftAlign('ADELANTO:', 32) +
                rightAlign(`$${adelanto.toFixed(2)}`, 10)
            )
            .style('b')
            .text(
                leftAlign('RESTANTE:', 32) +
                rightAlign(`$${restante.toFixed(2)}`, 10)
            )
            .text('============================')
            .feed(2)
            .text('Gracias por su preferencia!')
            .text(`${map.get('notas')}`)
            .feed(1)
            .cut()
            .close();
    });
}

// Funciones auxiliares para alineación en recibo
function leftAlign(text: string, width: number): string {
    return text.padEnd(width).substring(0, width);
}

function centerAlign(text: string, width: number): string {
    const pad = width - text.length;
    const padLeft = Math.floor(pad / 2);
    return ' '.repeat(padLeft) + text + ' '.repeat(pad - padLeft);
}

function rightAlign(text: string, width: number): string {
    return text.padStart(width).substring(0, width);
}

function generateReciboHtml(contenido, configs) {
    const map = new Map();
    configs.forEach(obj => {
        map.set(obj.nombre, obj.valor);
    });
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
            <style>
        @page {
          size: 5.5in 8.5in; /* Tama├▒o media carta */
          margin: 0.25in;
        }
        body {
          font-family: 'Arial Narrow', Arial, sans-serif;
          width: 100%;
          margin: 0;
          padding: 0;
          font-size: 14pt;
        }
        .recibo {
          width: 100%;
          max-width: 4.5in; /* Ancho ├║til considerando m├írgenes */
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
        }
        .titulo {
          font-weight: bold;
          font-size: 18pt;
          margin: 5px 0;
        }
        .subtitulo {
          font-size: 12pt;
          margin: 3px 0;
          text-align: left;
        }
        .info-cliente {
          margin: 10px 0;
          padding: 5px 0;
          border-bottom: 1px dashed #ccc;
        }
        .detalle {
          margin: 3px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          text-align: left;
          padding: 3px 5px;
          border-bottom: 1px solid #000;
          font-weight: bold;
        }
        td {
          padding: 3px 5px;
          vertical-align: top;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .total-section {
          margin-top: 15px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10pt;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="recibo">
        <div class="header">
          <div class="titulo">LAVANDERIA EL JARDIN</div>
          <div class="subtitulo">NOTA DE SERVICIO</div>
          <div class="subtitulo">${map.get('direccion')} </div>
          <div class="subtitulo">${map.get('rfc')} </div>
          <div class="subtitulo">${map.get('regimen')}</div>
          <div class="subtitulo">TELEFONO: ${map.get(`telefono`)}</div>
          <div class="subtitulo">${map.get(`direccion`)}</div>
          <div class="subtitulo">${map.get(`horario`)}</div>
        </div>
        
        <div class="info-cliente">
          <div class="detalle"><strong>Fecha:</strong> ${contenido.ordenFinal.fechaRegistro}</div>
          <div class="detalle"><strong>Cliente:</strong> ${contenido.ordenFinal.nombre}</div>
          ${getFechaEntregaHTML(contenido.ordenFinal)}
        </div>
        
        ${generarTablaPedidos(contenido.pedidos, contenido.ordenFinal)}
        
        <div class="footer">
          Gracias por su preferencia<br>
          ${map.get('notas')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generarTablaPedidos(pedidos: Pedido[], ordenFinal: Orden): string {
    let html = `
      <table>
        <thead>
          <tr>
            <th>DESCRIPCION</th>
            <th class="text-center">PRECIO<br>UNITARIO</th>
            <th class="text-right">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
    `;

    pedidos.forEach(pedido => {
        let descripcion = '';

        if (pedido.tipo === 'pieza') {
            descripcion = `${pedido.cantidad} ${pedido.descripcion}`;
        } else if (pedido.tipo === 'lavado') {
            descripcion = `${pedido.cantidad} kg`;
        } else if (pedido.tipo === 'planchado') {
            descripcion = isNaN(pedido.cantidad) || pedido.cantidad == 0
                ? pedido.descripcion
                : `${pedido.cantidad} piezas`;
        }

        html += `
          <tr>
            <td>${pedido.tipo}: ${descripcion}</td>
            <td class="text-center">$${pedido.precio?.toFixed(2) || '0.00'}</td>
            <td class="text-right">$${pedido.subtotal.toFixed(2)}</td>
          </tr>
        `;
    });

    // Cálculos de totales
    const total = pedidos.reduce((sum, pedido) => sum + pedido.subtotal, 0);
    const adelanto = ordenFinal.adelanto || 0;
    const restante = Math.max(0, total - adelanto);

    html += `
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="detalle text-right"><strong>TOTAL:</strong> $${total.toFixed(2)}</div>
        <div class="detalle text-right"><strong>ADELANTO:</strong> $${adelanto.toFixed(2)}</div>
        <div class="detalle text-right"><strong>RESTANTE:</strong> $${restante.toFixed(2)}</div>
      </div>
    `;

    return html;
}

function getFechaEntregaHTML(orden: Orden): string {
    if (orden.fechaEntrega) {
        return `<div class="subtitulo">FECHA DE ENTREGA ${orden.fechaEntrega}</div>`;
    }
    return '';
}

