import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingBlockComponent } from './floating-block.component';

describe('FloatingBlockComponent', () => {
  let component: FloatingBlockComponent;
  let fixture: ComponentFixture<FloatingBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
