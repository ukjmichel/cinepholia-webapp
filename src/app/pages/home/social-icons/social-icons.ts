import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-social-icons',
  imports: [CommonModule, MatIconModule],
  templateUrl: './social-icons.html',
  styleUrl: './social-icons.css',
})
export class SocialIcons {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook_logo.svg')
    );
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/instagram_logo.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'tiktok',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/tiktok_logo.svg')
    );
    iconRegistry.addSvgIcon(
      'x',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/x_logo.svg')
    );
  }
}
