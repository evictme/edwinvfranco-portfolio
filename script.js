console.log("Portfolio running");

// Show the floating nav only when the hero link-stack has scrolled out of view
(function () {
  var floatNav  = document.querySelector('.float-nav');
  var linkStack = document.querySelector('.link-stack');
  if (!floatNav || !linkStack) return;

  var observer = new IntersectionObserver(function (entries) {
    // When the link-stack is NOT intersecting, show the floating nav
    floatNav.classList.toggle('float-nav--visible', !entries[0].isIntersecting);
  }, { threshold: 0 });

  observer.observe(linkStack);
}());