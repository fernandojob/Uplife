import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarEmailPage } from './confirmar-email.page';

describe('ConfirmarEmailPage', () => {
  let component: ConfirmarEmailPage;
  let fixture: ComponentFixture<ConfirmarEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
