import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriangleSlideshowComponent } from './triangle-slideshow.component';

describe('TriangleSlideshowComponent', () => {
  let component: TriangleSlideshowComponent;
  let fixture: ComponentFixture<TriangleSlideshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriangleSlideshowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriangleSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
