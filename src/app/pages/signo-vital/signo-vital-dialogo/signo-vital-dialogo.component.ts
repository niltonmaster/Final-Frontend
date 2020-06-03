import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PacienteService } from './../../../_service/paciente.service';
import { Paciente } from './../../../_model/paciente';
import { switchMap } from 'rxjs/operators';
import { Signo } from './../../../_model/signo';
import { SignoVitalService } from './../../../_service/signo-vital.service';
import { Component, OnInit, Inject, ɵConsole } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signo-vital-dialogo',
  templateUrl: './signo-vital-dialogo.component.html',
  styleUrls: ['./signo-vital-dialogo.component.css']
})
export class SignoVitalDialogoComponent implements OnInit {
  form: FormGroup;
  telefono: string;
  direccion: string;
  dni: string;
  paciente: Paciente;

  constructor(
    private signoVitalService: SignoVitalService,
    private dialogRef: MatDialogRef<SignoVitalDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Paciente,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.paciente = new Paciente();
    this.paciente.nombres = this.data.nombres;
    this.paciente.apellidos = this.data.apellidos;
    this.paciente.dni = this.data.dni;
    this.paciente.direccion = this.data.direccion;
    this.paciente.telefono = this.data.telefono;

    this.form = new FormGroup({
      'nombres': new FormControl(this.data.nombres, [Validators.required, Validators.minLength(3)]),
      'apellidos': new FormControl(this.data.apellidos, [Validators.required, Validators.minLength(3)]),
      'dni': new FormControl(this.data.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      'direccion': new FormControl(this.data.direccion),
      'telefono': new FormControl(this.data.telefono, [Validators.minLength(9), Validators.maxLength(9)])
    })
  }

  get f() { return this.form.controls; }

  operar() {
    let paciente = new Paciente();
    paciente = this.paciente;
    paciente.nombres = this.paciente.nombres;
    paciente.apellidos = this.paciente.apellidos;
    paciente.dni = this.paciente.dni;
    paciente.direccion = this.paciente.direccion;
    paciente.telefono = this.paciente.telefono;
    /*
    paciente.nombres=this.form.value["nombres"];
    paciente.apellidos=this.form.value["apellidos"];
    paciente.dni=this.form.value["dni"];
    paciente.direccion=this.form.value["direccion"];
    paciente.telefono=this.form.value["telefono"];
    */

    if (this.paciente != null && this.paciente.idPaciente > 0) {
      //MODIFICAR
      this.pacienteService.modificar(this.paciente).pipe(switchMap(() => {
        return this.pacienteService.listar();
      })).subscribe(data => {
        this.pacienteService.pacienteCambio.next(data);
        this.pacienteService.mensajeCambio.next('SE MODIFICO');
      });
    } else {
      // REGISTRAR
      //nuevo metodo que retorna el objeto registrado con su id generado: registrar2Paciente
      this.pacienteService.registrar2Paciente(paciente).subscribe((data) => {
        this.pacienteService.pacienteregistradoCambio.next(data);
        this.pacienteService.mensajeCambio.next('SE REGISTRÓ NUEVO PACIENTE');
      });
    }
    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }
}
