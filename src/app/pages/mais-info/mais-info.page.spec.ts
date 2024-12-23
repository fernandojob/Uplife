import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaisInfoPage } from './mais-info.page';

describe('MaisInfoPage', () => {
  let component: MaisInfoPage;
  let fixture: ComponentFixture<MaisInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaisInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
