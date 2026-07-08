import { BusinessRuleViolationError } from '../../errors/DomainError'
import { Dni } from '../../value-objects/Dni.vo'

// RN-01: distritos válidos de Lima Metropolitana
const DISTRITOS_LIMA_METROPOLITANA = [
  'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo',
  'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino', 'Independencia',
  'Jesús María', 'La Molina', 'La Victoria', 'Lima', 'Lince',
  'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Miraflores',
  'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
  'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro',
  'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis',
  'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar',
  'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador',
  'Villa María del Triunfo',
]

export interface CandidatoProps {
  id: number
  idUsuario: number
  nombres: string
  apellidos: string
  dni: Dni
  fechaNacimiento: Date
  telefono?: string
  distrito: string
}

export class Candidato {
  readonly id: number
  readonly idUsuario: number
  private nombres: string
  private apellidos: string
  private dni: Dni
  readonly fechaNacimiento: Date
  private telefono?: string
  private distrito: string

  constructor(props: CandidatoProps) {
    this.validarDistrito(props.distrito)
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.nombres = props.nombres
    this.apellidos = props.apellidos
    this.dni = props.dni
    this.fechaNacimiento = props.fechaNacimiento
    this.telefono = props.telefono
    this.distrito = props.distrito
  }

  private validarDistrito(distrito: string): void {
    // RN-01: solo residentes de Lima Metropolitana
    const encontrado = DISTRITOS_LIMA_METROPOLITANA
      .some(d => d.toLowerCase() === distrito.toLowerCase())
    if (!encontrado) {
      throw new BusinessRuleViolationError(
        'RN-01',
        `El distrito "${distrito}" no pertenece a Lima Metropolitana`,
      )
    }
  }

  getNombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`
  }

  getNombres(): string { return this.nombres }
  getApellidos(): string { return this.apellidos }
  getDni(): string { return this.dni.getValue() }
  getTelefono(): string | undefined { return this.telefono }
  getDistrito(): string { return this.distrito }

  actualizarDatos(datos: Partial<Pick<CandidatoProps, 'telefono' | 'distrito'>>): void {
    if (datos.distrito) this.validarDistrito(datos.distrito)
    if (datos.distrito) this.distrito = datos.distrito
    if (datos.telefono !== undefined) this.telefono = datos.telefono
  }
}
