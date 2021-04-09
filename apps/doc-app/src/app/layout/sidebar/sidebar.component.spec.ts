import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatListModule
      ],
      declarations: [
        SidebarComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
