export class Pedido {

    tipo: string;
    cantidad: number;
    precio: number;
    descripcion: string | null;
    subtotal:number

    constructor(tipo:string, cantidad:number, precio:number) {
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.precio = precio;
        this.descripcion = null;
        if (tipo === 'planchados') {
            if (isNaN(Number(this.cantidad)) || Number(cantidad) === 0) {
                this.subtotal = 0
            } else {
                this.subtotal = this.cantidad * this.precio
            }
        } else {
            this.subtotal = Math.floor(precio * cantidad);
        }
    }

}