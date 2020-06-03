import { Subject } from 'rxjs';
import { Signo } from './../_model/signo';
import { GenericService } from './generic.service';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignoVitalService extends GenericService<Signo>{

  signoVitalCambio = new Subject<Signo[]>();
  mensajesignoVital = new Subject<string>();

  constructor(protected http: HttpClient) {
    super(
      http,
      `${environment.HOST}/signos_vitales`
    );
  }

  listarPageable(p: number, s: number) {
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`)
  }

}
