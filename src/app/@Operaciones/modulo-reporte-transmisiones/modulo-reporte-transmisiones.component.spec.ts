import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloReporteTransmisionesComponent } from './modulo-reporte-transmisiones.component';

describe('ModuloReporteTransmisionesComponent', () => {
  let component: ModuloReporteTransmisionesComponent;
  let fixture: ComponentFixture<ModuloReporteTransmisionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloReporteTransmisionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloReporteTransmisionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
