import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-infos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-infos.html',
  styleUrls: ['./contact-infos.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfos{
  title = input<string>('CINEPHOLIA');
  addressLine1 = input<string>('532 AVENUE CHARLES DE GAULLE');
  phone = input<string | null>('06 XX XX XX XX');
  scheduleLines = input<string[]>([
    'lundi–samedi | dimanche',
    '10h–00h30 | 10h–14h',
  ]);
}
