export class PiezasIndividuales {
    descripcion: string;
    piezas: number;
    precio: number;

    constructor(descripcion: string, piezas: number, precio: number) {
        this.descripcion = descripcion;
        this.piezas = piezas;
        this.precio = precio;
    }
}