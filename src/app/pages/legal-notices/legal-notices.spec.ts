import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalNotices } from './legal-notices';

describe('LegalNotices', () => {
  let component: LegalNotices;
  let fixture: ComponentFixture<LegalNotices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalNotices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalNotices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
