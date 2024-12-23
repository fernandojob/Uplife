import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MudarEmailPage } from './mudar-email.page';

describe('MudarEmailPage', () => {
  let component: MudarEmailPage;
  let fixture: ComponentFixture<MudarEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MudarEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
