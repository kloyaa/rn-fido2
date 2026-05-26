import { Controller, Get } from '@nestjs/common';
import { ConfigurationService } from '../config/configuration.service';

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly config: ConfigurationService) {}

  @Get('assetlinks.json')
  assetLinks() {
    return [
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: this.config.androidPackageName,
          sha256_cert_fingerprints: this.config.androidSha256Fingerprints,
        },
      },
    ];
  }
}
