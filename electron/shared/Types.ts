export interface Cliente {
    id: number,
    nombre: string,
    telefono: string,
}

export interface Orden {
    id: number,
    idCliente: number,
    fechaRegistro: string
    nombre: string,
    comentarios?: string,
    adelanto?: number
}