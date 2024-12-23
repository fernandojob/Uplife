import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigCorridaPage } from './config-corrida.page';

describe('ConfigCorridaPage', () => {
  let component: ConfigCorridaPage;
  let fixture: ComponentFixture<ConfigCorridaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigCorridaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
