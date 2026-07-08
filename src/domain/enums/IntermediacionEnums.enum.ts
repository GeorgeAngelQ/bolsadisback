export enum EstadoAsignacion {
  ACTIVA = 'activa',
  FINALIZADA = 'finalizada',
  REASIGNADA = 'reasignada',
}

export enum TipoObservacion {
  HABILIDAD = 'habilidad',
  NECESIDAD = 'necesidad',
  SEGUIMIENTO = 'seguimiento',
  ALERTA = 'alerta',
}

export enum EstadoSeguimiento {
  ACTIVO = 'activo',
  CERRADO = 'cerrado',
}

export enum ResultadoSeguimiento {
  CONTRATADO = 'contratado',
  RECHAZADO = 'rechazado',
  RETIRADO = 'retirado',
  DERIVADO = 'derivado',
  EN_PROCESO = 'en_proceso',
}

export enum TipoServicioExterno {
  CAPACITACION = 'capacitacion',
  SALUD = 'salud',
  LEGAL = 'legal',
  PSICOLOGICO = 'psicologico',
  OTRO = 'otro',
}

export enum EstadoDerivacion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  CONCLUIDA = 'concluida',
}

export enum EstadoEntrevista {
  PROGRAMADA = 'programada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

export enum ModalidadEntrevista {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
}
