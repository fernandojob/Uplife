import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsCorridaPage } from './tabs-corrida.page';

describe('TabsCorridaPage', () => {
  let component: TabsCorridaPage;
  let fixture: ComponentFixture<TabsCorridaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsCorridaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
