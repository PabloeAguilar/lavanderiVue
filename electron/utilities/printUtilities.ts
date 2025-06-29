import {ipcMain} from 'electron';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const escpos = require('escpos');
const escpos_usb = require('escpos-usb');


escpos.USB = escpos_usb;

export function setupPrintUtilities() {
    ipcMain.handle("imprimirRecibo", (event, data) => {
        imprimirReciboEscPos(data.contenido.pedidos, data.contenido.ordenFinal, data.configs);
    });
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

// Funciones auxiliares para alineación
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

