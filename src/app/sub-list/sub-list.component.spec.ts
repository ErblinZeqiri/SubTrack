import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubListComponent } from './sub-list.component';

describe('SubListComponent', () => {
  let component: SubListComponent;
  let fixture: ComponentFixture<SubListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
