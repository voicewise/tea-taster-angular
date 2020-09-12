import { Component, OnInit } from '@angular/core';

import { author, name, description, version } from '../../../package.json';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  author: string;
  name: string;
  description: string;
  version: string;

  constructor(private auth: AuthenticationService) {}

  ngOnInit() {
    this.author = author;
    this.name = name;
    this.description = description;
    this.version = version;
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
