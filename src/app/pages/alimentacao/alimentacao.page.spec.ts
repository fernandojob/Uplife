import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlimentacaoPage } from './alimentacao.page';

describe('AlimentacaoPage', () => {
  let component: AlimentacaoPage;
  let fixture: ComponentFixture<AlimentacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlimentacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
