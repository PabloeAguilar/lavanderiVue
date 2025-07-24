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
    fechaEntrega?: string
}

export interface SugerenciaPieza {
    id: number,
    clave: string,
    nombre: string,
    precio_individual: number
}