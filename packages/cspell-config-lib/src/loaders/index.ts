import type { FileLoaderMiddleware } from '../FileLoader.js';
import { loaderJavaScript } from './loaderJavaScript.js';

export { loaderJavaScript } from './loaderJavaScript.js';

export const defaultLoaders: FileLoaderMiddleware[] = [loaderJavaScript];
