import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchShopComponent } from './branch-shop.component';

describe('BranchShopComponent', () => {
  let component: BranchShopComponent;
  let fixture: ComponentFixture<BranchShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
