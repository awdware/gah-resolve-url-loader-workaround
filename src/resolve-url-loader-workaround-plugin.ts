import { GahPlugin, GahPluginConfig } from '@awdware/gah-shared';

import { ResolveUrlLoaderWorkaroundConfig } from './resolve-url-loader-workaround-config';


export class ResolveUrlLoaderWorkaroundPlugin extends GahPlugin {
  constructor() {
    super('ResolveUrlLoaderWorkaroundPlugin');
  }

  public async onInstall(existingCfg: ResolveUrlLoaderWorkaroundConfig): Promise<GahPluginConfig> {
    const newCfg = new ResolveUrlLoaderWorkaroundConfig();
    return existingCfg ?? newCfg;
  }

  public onInit() {
    this.registerEventListener('PACKAGES_INSTALLED', (event) => {

      const node_modules = this.fileSystemService.join(event.module?.basePath!, 'node_modules');


      if (!this.fileSystemService.directoryExists(node_modules)) {
        return;
      } else {
        this.loggerService.debug(`Found node_modules folder for: '${event.module?.moduleName ?? 'HOST'}'`);
      }

      const resolveUrlLoaderIndexJsPath = this.fileSystemService.join(node_modules, 'resolve-url-loader', 'index.js');

      if (!this.fileSystemService.fileExists(resolveUrlLoaderIndexJsPath)) {
        return;
      } else {
        this.loggerService.debug('Found resolve-url-loader\'s index.js file');
      }

      const indexJs = this.fileSystemService.readFile(resolveUrlLoaderIndexJsPath);

      if (indexJs.match(/removeCR\s*:\s*(\w+),/)?.[1] !== 'true') {
        const newIndexJs = indexJs.replace(/removeCR\s*:\s*(\w+),/, 'removeCR : true,');
        this.fileSystemService.saveFile(resolveUrlLoaderIndexJsPath, newIndexJs);
        this.loggerService.success('Fixed CR issue with resolve-url-loader');
      }
    });

  }
}
