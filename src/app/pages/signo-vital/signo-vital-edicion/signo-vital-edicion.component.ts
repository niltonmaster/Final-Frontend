import { MatSnackBar } from '@angular/material/snack-bar';
import { map, switchMap } from 'rxjs/operators';
import { Paciente } from './../../../_model/paciente';
import { Observable, Subject } from 'rxjs';
import { PacienteService } from './../../../_service/paciente.service';
import { Signo } from './../../../_model/signo';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SignoVitalService } from './../../../_service/signo-vital.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Component, OnInit, ɵConsole } from '@angular/core';
import * as moment from 'moment'
import { isNgContainer } from '@angular/compiler';
import { MedicoService } from 'src/app/_service/medico.service';
import { Medico } from 'src/app/_model/medico';
import { MatDialog } from '@angular/material/dialog';
import { SignoVitalDialogoComponent } from '../signo-vital-dialogo/signo-vital-dialogo.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-signo-vital-edicion',
  templateUrl: './signo-vital-edicion.component.html',
  styleUrls: ['./signo-vital-edicion.component.css']
})
export class SignoVitalEdicionComponent implements OnInit {
  //campos two way binding
  pulso: string;
  ritmoRespiratorio: string;
  temperatura: string;

  form: FormGroup;
  id: number;
  signoVital: Signo;
  edicion: boolean = false;

  pacientes: Paciente[] = [];

  pacienteSeleccionado: Paciente;//objeto Paciente seleccionado en el Autocomplete
  valPacienteFromDialog: Paciente;//objeto Paciente obtenido desde el dialogo
  valIngresado: string;//valor ingresado en el autocomplete

  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();
  dateS: Date = new Date();//Fecha seleccionada al editar o nuevo del Signo vital

  myControlPaciente: FormControl = new FormControl();
  pacientesFiltrados: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signoVitalService: SignoVitalService,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private medicoService: MedicoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.pulso = '';
    this.ritmoRespiratorio = '';
    this.temperatura = '';
    this.valIngresado = null;
    this.valPacienteFromDialog = null;
    this.pacienteSeleccionado = null;
    this.signoVital = new Signo();

    this.form = new FormGroup({
      'id': new FormControl(0),
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(),
      'temperatura': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'pulso': new FormControl('', [Validators.required, Validators.minLength(5)]),
      'ritmoRespiratorio': new FormControl('', [Validators.required, Validators.minLength(5)])
    })

    this.listarPacientes();

 
    this.pacientesFiltrados = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));

    //variable que reacciona al agregarse un nuevo paciente desde el modal
    this.medicoService.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000
      });
    });
    //variable que reacciona al agregarse un nuevo paciente desde el modal
    this.pacienteService.pacienteregistradoCambio.subscribe(data => {
      this.listarPacientes();
      this.pacienteSeleccionado = null;
      this.valPacienteFromDialog = data;
      this.form.get('paciente').setValue(this.valPacienteFromDialog)
      this.valIngresado = this.valPacienteFromDialog.nombres + " " + this.valPacienteFromDialog.apellidos;
    });

    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.initForm();
    })

  }

  get f() { return this.form.controls; }

  initForm() {
    this.pulso = '';
    this.ritmoRespiratorio = '';
    this.temperatura = '';
    
    if (this.edicion) {
      this.signoVitalService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSigno),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(data.fecha),
          'temperatura': new FormControl(data.temperatura, [Validators.required, Validators.minLength(3)]),
          'pulso': new FormControl(data.pulso, [Validators.required, Validators.minLength(5)]),
          'ritmoRespiratorio': new FormControl(data.ritmoRespiratorio, [Validators.required, Validators.minLength(5)])
        });
        //inicializo mis variables temporales con los valores de los campos del signo a editar:
        this.temperatura = this.form.value['temperatura'];
        this.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];
        this.pulso = this.form.value['pulso']
        this.dateS = this.form.value['fecha']
        this.form.get('paciente').setValue(data.paciente)
        this.pacienteSeleccionado = data.paciente;
        this.valPacienteFromDialog = null;
        this.valIngresado = data.paciente.nombres + " " + data.paciente.apellidos;
      });
    }
  }

  onDate(event: any) {
    console.log(event.option.value);
    console.log(event);
    this.dateS = event;
  }

  filtrarPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(x =>
        x.nombres.toLowerCase().includes(val.nombres.toLowerCase()) ||
        x.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) ||
        x.dni.includes(val.dni)
      )
    } else {
      //reseteo mis variables temporales
      this.valIngresado = val;
      this.pacienteSeleccionado = null;
      this.valPacienteFromDialog = null;

      return this.pacientes.filter(x =>
        x.nombres.toLowerCase().includes(val.toLowerCase()) ||
        x.apellidos.toLowerCase().includes(val.toLowerCase()) ||
        x.dni.includes(val)
      )
    }
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }


  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
    this.valPacienteFromDialog = null;
    this.valIngresado = this.pacienteSeleccionado.nombres + " " + this.pacienteSeleccionado.apellidos;
  }

  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  operar() {
    let signo = new Signo();
    signo.fecha = moment(this.dateS).format('YYYY-MM-DDTHH:mm:ss');
    signo.pulso = this.pulso;
    signo.temperatura = this.temperatura;
    signo.ritmoRespiratorio = this.ritmoRespiratorio

    if (this.edicion) {
      signo.paciente = this.form.value['paciente'];
      signo.idSigno = this.id;
      this.signoVitalService.modificar(signo).subscribe(() => {
        this.signoVitalService.listar().subscribe(data => {
          this.signoVitalService.signoVitalCambio.next(data);
          this.signoVitalService.mensajesignoVital.next('SE MODIFICÓ SIGNO VITAL');
        });
      });
    } else {
      if (this.valPacienteFromDialog != null) { signo.paciente = this.valPacienteFromDialog; }
      else { signo.paciente = this.pacienteSeleccionado; }

      this.signoVitalService.registrar(signo).pipe(switchMap(() => {
        return this.signoVitalService.listar();
      })).subscribe(x => {
        this.signoVitalService.signoVitalCambio.next(x);
        this.signoVitalService.mensajesignoVital.next('SE REGISTRO SIGNO VITAL');
        setTimeout(() => {
          this.limpiarControles();
        }, 2000)
      });
    }
    this.router.navigate(['signo-vital']);
  }

  abrirDialogo() {
    //envio paciente nuevo 
    let med = new Paciente();
    this.dialog.open(SignoVitalDialogoComponent, {
      width: '250px',
      data: med
    });
  }

  estadoBotonAceptar() {
    //1°caso Verifico si escribiendo nombre+apellido en el Input,este se iguala a algun paciente(nombre +apellidos)
    //de la lista general de pacientes; si es así entonces se seleccione internamente.
    let cont = 0;
    if (this.valIngresado != null && this.pacienteSeleccionado === null) {
      for (let i = 0; i < this.pacientes.length; i++) {
        let paciente = this.pacientes[i];
        if (paciente.nombres.toLowerCase() + " " + paciente.apellidos.toLowerCase() == this.valIngresado.toLowerCase()) {
          this.pacienteSeleccionado = paciente;
          cont++;
          break;
        }
      }
    } else {//Se seleccionó directamente el paciente desde el Autocomplete
      cont = 1;
    }

    //2°caso Verifico si
    //Verifico los demas campos que no son el campo paciente
    let contador2 = 0;
    if (this.temperatura.length >= 3 && this.ritmoRespiratorio.length >= 5 && this.pulso.length >= 5) {
      contador2++;
    }

    //Evaluar estado final del boton [disabled] de acuerdo a 1°y 2° caso
    if (this.pacienteSeleccionado != null) {
      if (cont > 0 && contador2 > 0)
        return true;
      else {
        return false;
      }
    } else {
      if (this.valPacienteFromDialog != null && contador2 > 0) {
        return true
      } else {
        return false;
      }
    }
  }

  limpiarControles() {
    this.pulso = '';
    this.ritmoRespiratorio = '';
    this.temperatura = '';
    this.dateS = null;
    this.valPacienteFromDialog = null;
    this.pacienteSeleccionado = null;
    this.fechaSeleccionada = new Date();
    this.fechaSeleccionada.setHours(0);
    this.fechaSeleccionada.setMinutes(0);
    this.fechaSeleccionada.setSeconds(0);
    this.fechaSeleccionada.setMilliseconds(0);
  }

}
