import { ConsultaListaExamenDTO } from './../../../_dto/consultaListaExamenDTO';
import { Consulta } from './../../../_model/consulta';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConsultaService } from './../../../_service/consulta.service';
import { ExamenService } from './../../../_service/examen.service';
import { MedicoService } from './../../../_service/medico.service';
import { EspecialidadService } from './../../../_service/especialidad.service';
import { PacienteService } from './../../../_service/paciente.service';
import { DetalleConsulta } from './../../../_model/detalleConsulta';
import { Examen } from './../../../_model/examen';
import { Medico } from './../../../_model/medico';
import { Especialidad } from './../../../_model/especialidad';
import { Paciente } from './../../../_model/paciente';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-consulta-especial',
  templateUrl: './consulta-especial.component.html',
  styleUrls: ['./consulta-especial.component.css']
})
export class ConsultaEspecialComponent implements OnInit {

  form: FormGroup;

  pacientes: Paciente[] = [];
  especialidades: Especialidad[] = [];
  medicos: Medico[] = [];
  examenes: Examen[] = [];

  detalleConsulta: DetalleConsulta[] = [];
  examenesSeleccionados: Examen[] = [];  

  diagnostico: string;
  tratamiento: string;
  mensaje: string;

  pacienteSeleccionado: Paciente;
  medicoSeleccionado: Medico;
  especialidadSeleccionada: Especialidad;
  examenSeleccionado: Examen;

  fechaSeleccionada: Date = new Date();
  maxFecha: Date = new Date();

  //utiles para el autocomplete
  myControlPaciente: FormControl = new FormControl();
  myControlMedico: FormControl = new FormControl();

  pacientesFiltrados: Observable<any[]>;
  medicosFiltrados: Observable<any[]>;

  constructor(
    private pacienteService: PacienteService,
    private especialidadService: EspecialidadService,
    private medicoService: MedicoService,
    private examenService: ExamenService,
    private consultaService: ConsultaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'paciente': this.myControlPaciente,
      'especialidad': new FormControl(),
      'medico': this.myControlMedico,
      'fecha': new FormControl(new Date()),
      'diagnostico': new FormControl(''),
      'tratamiento': new FormControl('')
    });

    this.listarPacientes();
    this.listarEspecilidad();
    this.listarMedicos();
    this.listarExamenes();

    this.pacientesFiltrados = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)))
    this.medicosFiltrados = this.myControlMedico.valueChanges.pipe(map(val => this.filtrarMedicos(val)));

  }

  filtrarPacientes(val : any){
    if(val != null && val.idPaciente > 0){
      return this.pacientes.filter(x => 
        x.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || x.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || x.dni.includes(val.dni)
      );
    }else{
      //string
      return this.pacientes.filter(x => 
        x.nombres.toLowerCase().includes(val.toLowerCase()) || x.apellidos.toLowerCase().includes(val.toLowerCase()) || x.dni.includes(val)
      );
    }    
  }

  filtrarMedicos(val : any){
    if (val != null && val.idMedico > 0) {
      return this.medicos.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.cmp.includes(val.cmp));
    } else {
      return this.medicos.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.cmp.includes(val));
    }
  }

  mostrarPaciente(val : Paciente){
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  
  mostrarMedico(val : Medico){
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  listarEspecilidad() {
    this.especialidadService.listar().subscribe(data => {
      this.especialidades = data;
    })
  }

  listarMedicos() {
    this.medicoService.listar().subscribe(data => {
      this.medicos = data;
    })
  }
  listarExamenes() {
    this.examenService.listar().subscribe(data => {
      this.examenes = data;
    })
  }

  seleccionarPaciente(e : any){
    this.pacienteSeleccionado = e.option.value;
  }

  seleccionarMedico(e : any){
    this.medicoSeleccionado = e.option.value;
  }

  agregar() {

    if (this.diagnostico != null && this.tratamiento != null) {
      let det = new DetalleConsulta();
      det.diagnostico = this.diagnostico;
      det.tratamiento = this.tratamiento;
      this.detalleConsulta.push(det);
      this.diagnostico = null;
      this.tratamiento = null;
    } else {
      this.mensaje = `Debe agregar un diagnóstico y tramiento`;
      this.snackBar.open(this.mensaje, "Aviso", { duration: 2000 });
    }
  }


  agregarExamen() {
    if (this.examenSeleccionado) {
      let cont = 0;
      for (let i = 0; i < this.examenesSeleccionados.length; i++) {
        let examen = this.examenesSeleccionados[i];
        if (examen.idExamen === this.examenSeleccionado.idExamen) {
          cont++;
          break;
        }
      }
      if (cont > 0) {
        this.mensaje = `El examen se encuentra en la lista`;
        this.snackBar.open(this.mensaje, "Aviso", { duration: 2000 });
      } else {                
        this.examenesSeleccionados.push(this.examenSeleccionado);
      }
    } else {
      this.mensaje = `Debe agregar un examen`;
      this.snackBar.open(this.mensaje, "Aviso", { duration: 2000 });
    }
  }

  estadoBotonRegistrar() {
    return (this.detalleConsulta.length >= 3 || this.especialidadSeleccionada === null || this.medicoSeleccionado === null || this.pacienteSeleccionado === null);
  }

  removerDiagnostico(index: number) {
    this.detalleConsulta.splice(index, 1);
  }

  removerExamen(index: number) {
    this.examenesSeleccionados.splice(index, 1);
  }

  aceptar(){
    let consulta = new Consulta();
    consulta.especialidad = this.form.value['especialidad']; //this.especialidadSeleccionada;
    consulta.medico = this.form.value['medico'];
    consulta.paciente = this.form.value['paciente'];
    consulta.numConsultorio = "C1";
    consulta.fecha = moment().format('YYYY-MM-DDTHH:mm:ss')
    consulta.detalleConsulta = this.detalleConsulta;

    let consultaListaExamenDTO = new ConsultaListaExamenDTO();
    consultaListaExamenDTO.consulta = consulta;
    consultaListaExamenDTO.lstExamen = this.examenesSeleccionados;

    this.consultaService.registrarTransaccion(consultaListaExamenDTO).subscribe(() => {
      this.snackBar.open("Se registró", "Aviso", { duration: 2000 });

      setTimeout(() => {
        this.limpiarControles();
      }, 2000)

    });
  }

  limpiarControles() {
    this.detalleConsulta = [];
    this.examenesSeleccionados = [];
    this.diagnostico = '';
    this.tratamiento = '';
    this.pacienteSeleccionado = null;
    this.especialidadSeleccionada = null;
    this.medicoSeleccionado = null;
    this.examenSeleccionado = null;
    this.fechaSeleccionada = new Date();
    this.fechaSeleccionada.setHours(0);
    this.fechaSeleccionada.setMinutes(0);
    this.fechaSeleccionada.setSeconds(0);
    this.fechaSeleccionada.setMilliseconds(0);
    this.mensaje = '';    
  }


}
