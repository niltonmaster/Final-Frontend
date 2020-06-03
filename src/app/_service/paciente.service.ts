import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Paciente } from './../_model/paciente';
import { Subject } from 'rxjs';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PacienteService extends GenericService<Paciente>  {


  pacienteCambio = new Subject<Paciente[]>();
  mensajeCambio = new Subject<string>();

  pacienteregistradoCambio= new Subject<Paciente>();


  constructor(protected http : HttpClient) { 
    super(
      http, 
      `${environment.HOST}/pacientes`);
  }

  listarPageable(p: number, s:number){
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }


  registrar2Paciente(p: Paciente){
    return this.http.post<Paciente>(`${this.url}/registrar2`,p)
  }

}
