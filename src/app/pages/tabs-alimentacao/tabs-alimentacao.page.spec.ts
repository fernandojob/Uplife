import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsAlimentacaoPage } from './tabs-alimentacao.page';

describe('TabsAlimentacaoPage', () => {
  let component: TabsAlimentacaoPage;
  let fixture: ComponentFixture<TabsAlimentacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsAlimentacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
