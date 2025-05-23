export class Pedido {
    readonly subtotal: number;

    constructor(
        public tipo: string,
        public cantidad: number,
        public precio: number,
        public descripcion: string | null = null,
        public id?: number
    ) {
        this.subtotal = this.calcularSubtotal();
    }

    private calcularSubtotal(): number {
        if (this.tipo === 'planchados') {
            return isNaN(this.cantidad) || this.cantidad === 0
                ? 0
                : this.cantidad * this.precio;
        }
        return Math.floor(this.precio * this.cantidad);
    }
}