import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoAlimentacaoPage } from './historico-alimentacao.page';

describe('HistoricoAlimentacaoPage', () => {
  let component: HistoricoAlimentacaoPage;
  let fixture: ComponentFixture<HistoricoAlimentacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoAlimentacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
