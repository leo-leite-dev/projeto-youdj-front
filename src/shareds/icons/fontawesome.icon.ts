import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

export function registerIcons(library: FaIconLibrary): void {
  library.addIcons(faMusic);
}
