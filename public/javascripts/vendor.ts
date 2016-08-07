import 'core-js/es6';
import 'reflect-metadata';
require('zone.js/dist/zone');

  // Development
  Error['stackTraceLimit'] = Infinity;
  require('zone.js/dist/long-stack-trace-zone');

import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router-deprecated';
// RxJS
import 'rxjs';
