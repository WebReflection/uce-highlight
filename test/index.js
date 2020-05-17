import 'uce';
import(
  /^(?:localhost|[0-9.]+)$/.test(location.hostname) ?
  '../esm/index.js' :
  'https://unpkg.com/uce-highlight?module'
);