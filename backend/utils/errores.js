// Error con código HTTP. El manejador central lo convierte en { error: "mensaje" }.
export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.status = status;
  }
}
