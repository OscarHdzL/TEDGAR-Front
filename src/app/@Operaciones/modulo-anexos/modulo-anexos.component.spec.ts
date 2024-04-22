import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloAnexosComponent } from './modulo-anexos.component';

describe('ModuloAnexosComponent', () => {
  let component: ModuloAnexosComponent;
  let fixture: ComponentFixture<ModuloAnexosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloAnexosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloAnexosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
