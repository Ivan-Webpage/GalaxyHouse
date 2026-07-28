import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuffetComponent } from './buffet.component';

describe('BuffetComponent', () => {
  let component: BuffetComponent;
  let fixture: ComponentFixture<BuffetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuffetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuffetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
