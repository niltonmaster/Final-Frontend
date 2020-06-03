import { environment } from './../../../environments/environment';
import { LoginService } from './../../_service/login.service';
import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario:string;
  roles:string[]=[];
  constructor(
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.obtenerPerfil();
  }

  obtenerPerfil(){
    const helper = new JwtHelperService();
    let token = sessionStorage.getItem(environment.TOKEN_NAME);

    const decodedToken = helper.decodeToken(token);
    this.usuario=decodedToken.user_name;
    this.roles=decodedToken.authorities;

    console.log(decodedToken.user_name); 
    console.log(decodedToken.authorities);
     
  }
//   obtenerPerfil(){
//   this.loginService.login(this.usuario, this.clave).subscribe(data => {

//     sessionStorage.setItem(environment.TOKEN_NAME, data.access_token);

//     const helper = new JwtHelperService();

//     let decodedToken = helper.decodeToken(data.access_token);

//     // this.menuService.listarPorUsuario(decodedToken.user_name).subscribe(data => {
//     //   this.menuService.setMenuCambio(data);
//     //   this.router.navigate(['paciente']);
//     // });

    
//   })
// }

}
