// Measuring the Critical Rendering Path with Navigation Timing
// https://developers.google.com/web/fundamentals/performance/critical-rendering-path/measure-crp

function logCRP() {
  var t = window.performance.timing,
    dcl = t.domContentLoadedEventStart - t.domLoading,
    complete = t.domComplete - t.domLoading;
  var stats = document.getElementById("crp-stats");
  stats.textContent = 'DCL: ' + dcl + 'ms, onload: ' + complete + 'ms';
}

window.addEventListener("load", function(event) {
  logCRP();
  //var FontFaceObserver = require('')
  //var observer = new FontFaceObserver('Open Sans', {});
  //
  //observer.check(null, 5000).then(function () {
  //  console.log('Font is available');
  //}, function () {
  //  console.log('Font is not available after waiting 5 seconds');
  //});
});

