/*
 Copyright 2015 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// This polyfill provides Cache.add(), Cache.addAll(), and CacheStorage.match()
importScripts('./static/scripts/third_party/serviceworker-cache-polyfill.js');

// While overkill for this specific sample in which there is only one cache,
// this is one best practice that can be followed in general to keep track of
// multiple caches used by a given service worker, and keep them all versioned.
// It maps a shorthand identifier for a cache to a specific, versioned cache name.

// Note that since global state is discarded in between service worker restarts, these
// variables will be reinitialized each time the service worker handles an event, and you
// should not attempt to change their values inside an event handler. (Treat them as constants.)

// If at any point you want to force pages that use this service worker to start using a fresh
// cache, then increment the CACHE_VERSION value. It will kick off the service worker update
// flow and the old cache(s) will be purged as part of the activate event handler when the
// updated service worker is activated.
var CACHE_VERSION = 2;
var CURRENT_CACHES = {
  prefetch: 'window-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var urlsToPrefetch = [
      './',
      './static/styles/print.min.css',
      './static/styles/style.min.css',
      './static/scripts/perfmatters.min.js',
      './static/img/pizza.png',
      './static/img/profilepic.jpg',
      './static/img/mobilewebdev-small.jpg',
      './static/img/cam_be_like-small.jpg',
      './static/img/2048-small.png',
      './static/img/pizza/pizzeria-large.jpg',
      './static/img/pizza/pizzeria-large-2x.jpg',
      './static/img/pizza/pizzeria-medium.jpg',
      './static/img/pizza/pizzeria-small.jpg',
      // This is an image that will be used in pre_fetched.html
      "https://www.google-analytics.com/analytics.js",
      "https://lh4.ggpht.com/kJEnfqhPvtm4m3EneSZ4fWYGS8lW4YNhEjk6zPkyrQaBUHc-2Y_ElDic99NHI0h-UBLXVbRCjFybFvrWxdk=s100",
      "https://lh6.ggpht.com/f_0W8h__3G99CWTjnMjD8BUKm7yp2-wJyApLtTwFoFtlal2ULf_JgHIsOQq2NiYfKOdMlXlMHDKNo5XVZLs=s100",
      "https://lh5.ggpht.com/IKdCmTWn8a2nMhlwMYzryvzRN5CUZAOBr4tDrEAbszV7TIFe9pRAInA4kkYcgTXwrifJsBEsq1agTueuu-g=s100"
  ];

  // All of these logging statements should be visible via the "Inspect" interface
  // for the relevant SW accessed via chrome://serviceworker-internals
  console.log('Handling install event. Resources to pre-fetch:', urlsToPrefetch);

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
      return cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
        // It's very important to use {mode: 'no-cors'} if there is any chance that
        // the resources being fetched are served off of a server that doesn't support
        // CORS (http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
        // In this example, www.chromium.org doesn't support CORS, and the fetch()
        // would fail if the default mode of 'cors' was used for the fetch() request.
        // The drawback of hardcoding {mode: 'no-cors'} is that the response from all
        // cross-origin hosts will always be opaque
        // (https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#cross-origin-resources)
        // and it is not possible to determine whether an opaque response represents a success or failure
        // (https://github.com/whatwg/fetch/issues/14).
        return new Request(urlToPrefetch, {mode: 'no-cors'});
      })).then(function() {
        console.log('All resources have been fetched and cached.');
      });
    }).catch(function(error) {
      // This catch() will handle any exceptions from the caches.open()/cache.addAll() steps.
      console.error('Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
//self.onfetch = function(event) {
    var request = event.request;

    
    if(request.url !== "https://www.google-analytics.com/analytics.js") {
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

                caches.open(CURRENT_CACHES.prefetch).then(
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
    }
});
