/**
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

importScripts('/serviceworker-cache-polyfill.js');

var CACHE_NAME = 'mobile-portfolio';
var CACHE_VERSION = 1;

//self.oninstall = function(event) {
self.addEventListener('install', function(e) {
  event.waitUntil(
    caches.open(CACHE_NAME + '-v' + CACHE_VERSION).then(function(cache) {

      return cache.addAll([
        '/',
        '/nano/',
        '/nano/static/pizza/',
        '/nano/static/styles/print.min.css',
        '/nano/static/styles/style.min.css',
        '/nano/static/scripts/perfmatters.min.js',
        '/nano/static/img/pizza.png',
        '/nano/static/img/profilepic.jpg',
        '/nano/static/img/mobilewebdev-small.jpg',
        '/nano/static/img/cam_be_like-small.jpg',
        '/nano/static/img/2048-small.png',
        '/nano/static/img/pizza/pizzeria-large.jpg',
        '/nano/static/img/pizza/pizzeria-large-2x.jpg',
        '/nano/static/img/pizza/pizzeria-medium.jpg',
        '/nano/static/img/pizza/pizzeria-small.jpg',
        // This is an image that will be used in pre_fetched.html
        "https://www.google-analytics.com/analytics.js",
        "https://lh4.ggpht.com/kJEnfqhPvtm4m3EneSZ4fWYGS8lW4YNhEjk6zPkyrQaBUHc-2Y_ElDic99NHI0h-UBLXVbRCjFybFvrWxdk=s100",
        "https://lh6.ggpht.com/f_0W8h__3G99CWTjnMjD8BUKm7yp2-wJyApLtTwFoFtlal2ULf_JgHIsOQq2NiYfKOdMlXlMHDKNo5XVZLs=s100",
        "https://lh5.ggpht.com/IKdCmTWn8a2nMhlwMYzryvzRN5CUZAOBr4tDrEAbszV7TIFe9pRAInA4kkYcgTXwrifJsBEsq1agTueuu-g=s100"
      ]);
    })
  );
});

self.onactivate = function(event) {

  var currentCacheName = CACHE_NAME + '-v' + CACHE_VERSION;
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        if (cacheName.indexOf(CACHE_NAME) === -1) {
          return;
        }

        if (cacheName !== currentCacheName) {
          return caches.delete(cacheName);
        }
      })
    );
  });
};

self.addEventListener('fetch', function(event) {
//self.onfetch = function(event) {
  var request = event.request;

  event.respondWith(

    // Check the cache for a hit.
    caches.match(request).then(function(response) {

      // If we have a response return it.
      if (response) {
        return response;
      }
      // Otherwise fetch it, store and respond.
      return fetch(request).then(function(response) {

        var responseToCache = response.clone();

        caches.open(CACHE_NAME + '-v' + CACHE_VERSION).then(
          function(cache) {
            cache.put(request, responseToCache).catch(function(err) {
              // Likely we got an opaque response which the polyfill
              // can't deal with, so log out a warning.
              console.warn(requestURL + ': ' + err.message);
            });
          });

        return response;
      });

    })
  );
});
