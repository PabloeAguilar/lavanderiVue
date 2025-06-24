    import {BrowserWindow, ipcMain, Menu} from 'electron';
    import {Pedido} from "../../src/classes/Pedido.ts";
    import {Orden} from "../shared/Types.ts";

    export function setupPrintUtilities() {
        ipcMain.on("imprimirRecibo", (event, data) => {
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
                            { win.webContents.print({}, success => {
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



    function generateReciboHtml(contenido, configs) {
        const infoPedido = generarInfoPedidos(contenido.pedidos, contenido.ordenFinal);
        console.log(configs)
        const mapConfigs = configs.reduce((map, obj) => {
            map.set(obj.nombre, obj.valor);
            return map;
        }, new Map<string, any>());
        return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; width: 58mm; }
            .recibo { width: 100%; }
            .titulo { text-align: center; font-weight: bold; }
            .detalle { font-size: x-small; }
          </style>
        </head>
        <body>
          <div class="recibo">
            <div class="titulo">LAVANDERIA EL JARDIN</div>
            <div class="titulo">NOTA N. ${contenido.ordenFinal.id}</div>
            <div class="detalle">FECHA: ${contenido.ordenFinal.fechaRegistro}</div>
            <div class="detalle">CLIENTE: ${contenido.ordenFinal.nombre}</div>
            <div class="detalle">${mapConfigs.get('regimen')}</div>
            <div class="detalle">${mapConfigs.get('rfc')}</div>
            <div class="detalle">${mapConfigs.get('direccion')}</div>
            <div class="detalle">${mapConfigs.get('horario')}</div>
            <div class="detalle">${mapConfigs.get('telefono')}</div>
            <div class="detalle">${mapConfigs.get('notas')}</div>
            
            
            ${infoPedido}
          </div>
        </body>
        </html>
      `
        console.log(infoPedido);
    }

    function generarInfoPedidos(pedidos: Pedido[], orden:Orden): string {
        let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: x-small">
            <thead>
                <tr>
                    <th style="text-align: left; border-bottom: 1px dashed #000;">DESCRIPCION</th>
                    <th style="text-align: right; border-bottom: 1px dashed #000;">PRECIO <br> UNITARIO</th>
                    <th style="text-align: right; border-bottom: 1px dashed #000;">SUBTOTAL</th>
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
                    ? (pedido.descripcion ? pedido.descripcion : "SERVICIO PLANCHADO")
                    : `${pedido.cantidad} piezas`;
            }

            html += `
            <tr>
                <td style="text-align: left; padding: 2px 0;">${pedido.tipo}: ${descripcion}</td>
                <td style="text-align: right; padding: 2px 0;">$${pedido.precio} </td>
                <td style="text-align: right; padding: 2px 0;">$${pedido.subtotal.toFixed(2)}</td>
            </tr>
        `;
        });

        // Total general
        const total = pedidos.reduce((sum, pedido) => sum + pedido.subtotal, 0);
        const adelanto = orden.adelanto || 0; // Asume que existe en el objeto
        const restante = total - adelanto;

        html += `
            </tbody>
            <tfoot>
                <tr>
                    <td />
                    <td style="text-align: right; border-top: 1px dashed #000; padding-top: 5px; font-weight: bold;">TOTAL:</td>
                    <td style="text-align: right; border-top: 1px dashed #000; padding-top: 5px; font-weight: bold;">$${total.toFixed(2)}</td>
                </tr>
                <tr>
                <td />
                    <td style="text-align: right; padding: 2px 0;">ADELANTO:</td>
                    <td style="text-align: right; padding: 2px 0;">$${adelanto.toFixed(2)}</td>
                </tr>
                <tr>
                <td />
                    <td style="text-align: right; border-bottom: 1px dashed #000; padding-bottom: 5px; font-weight: bold;">RESTANTE:</td>
                    <td style="text-align: right; border-bottom: 1px dashed #000; padding-bottom: 5px; font-weight: bold;">$${restante.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    `;

        return html;
    }
