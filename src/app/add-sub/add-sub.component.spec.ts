import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddSubComponent } from './add-sub.component';

describe('AddSubComponent', () => {
  let component: AddSubComponent;
  let fixture: ComponentFixture<AddSubComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubComponent ],
      imports: []
    }).compileComponents();

    fixture = TestBed.createComponent(AddSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
