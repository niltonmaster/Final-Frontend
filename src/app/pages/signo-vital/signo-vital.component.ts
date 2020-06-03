import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { SignoVitalService } from './../../_service/signo-vital.service';
import { Signo } from './../../_model/signo';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signo-vital',
  templateUrl: './signo-vital.component.html',
  styleUrls: ['./signo-vital.component.css']
})
export class SignoVitalComponent implements OnInit {
  
  cantidad:number=0;
  displayedColumns = ['idSigno','paciente','fecha','temperatura','pulso','ritmo respiratorio','acciones'];
  dataSource: MatTableDataSource<Signo>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private signoVitalService: SignoVitalService,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.signoVitalService.signoVitalCambio.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    this.signoVitalService.mensajesignoVital.subscribe(data =>{
      this.snackBar.open(data, 'AVISO', {
        duration: 2000
      });
    });

    this.signoVitalService.listarPageable(0,10).subscribe(data=>{
      this.cantidad=data.totalElements;
      this.dataSource=new MatTableDataSource(data.content);
      this.dataSource.sort=this.sort;
    })
  }

  filtrar(valor : string) {
    this.dataSource.filter= valor.trim().toLowerCase();
  }

  eliminar(idSigno: number) {
    this.signoVitalService.eliminar(idSigno).pipe(switchMap( ()=> {
      return this.signoVitalService.listar();
    })).subscribe(data =>{
      this.signoVitalService.signoVitalCambio.next(data);
      this.signoVitalService.mensajesignoVital.next('SE ELIMINÓ SIGNO VITAL');
    });
  }

  mostrarMas(e: any){
    this.signoVitalService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      console.log(data);
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }

}

