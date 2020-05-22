// This script is loaded when the complete page has finished loading.
// Navigation to title-card-container seems to only work when the transform3d and slider have finished moving and animation
// Currently only working for first 3 rows before big banner

console.log("NAV JS LOADING")

// Initalize Spatial Navigation
SpatialNavigation.init();
SpatialNavigation.add('generic', {selector: 'a, .focusable, btn, .btn, .nfTextField, .faq-list-item, .avatar-wrapper, .slider-item, .handlePrev, .handleNext'}, {tabIndexIgnoreList: '.handle'});
SpatialNavigation.makeFocusable('generic');
SpatialNavigation.focus('generic', true);

console.log("NAV JS LOADED");

// Added a section called Title Cards as per API, which can then be made focusable using SpatialNavigation.makeFocusable()
SpatialNavigation.add('titleCards', {selector: '.slider-item'});

console.log("ADDED SELECTOR TITLE CARD");

querySliderItems();

var sliderListItems = [".handleNext, .handlePrev"];

function querySliderItems() {
    document.querySelectorAll('.slider-item, .slider-item-1, .slider-item-0, .slider-item-2, .slider-item-3, .slider-item-4, .slider-item-5, .slider-item-6, .slider-item-7, .slider-item-8').forEach(element => {
        element.addEventListener('sn:willfocus', function(obj){
           var childElementsList = element.parentElement.childNodes;
           var childElementLength = element.parentElement.childElementCount;
           console.log(childElementLength);
           var childElementVisibleLength = 0;
           var childElementNotVisibleLength = 0;
           for(var q=0; q < childElementLength; q++) {
              if(childElementsList[q].classList.contains("slider-item-")){
                  childElementNotVisibleLength = childElementNotVisibleLength + 1;
                  console.log("Not Visible: " + childElementNotVisibleLength);
              } else {
                  childElementVisibleLength = childElementVisibleLength + 1;
                  console.log("Visible: " + childElementVisibleLength);
              }
           }
           setNavigationForSliderItems(childElementVisibleLength, sliderListItems.length);
        });

        element.addEventListener('sn:enter-down', function(obj){
            console.log("inVideoDown")
            var tileVidUrl = element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].href;
            webView.url = tileVidUrl;
        });
    })
}

function setNavigationSliderItems(visibleCount, prevSliderLength) {
    var itemToPush = " .slider-item-z".replace("z", (visibleCount - 1))
    console.log("itemToPush:: " + itemToPush)

    if(sliderListItems.indexOf(itemToPush) === -1) {
        sliderListItems.push(itemToPush);
    }

    if(prevSliderLength !== sliderListItems.length) {
        console.log("IN ITEMS TO ADD VISIBLE COUNT", visibleCount)
        console.log("IN ITEMS TO ADD VISIBLE COUNT", sliderListItems.length)
        var itemsToString = sliderListItems.toString();
        console.log(itemsToString);
        SpatialNavigation.disable("generic");
        SpatialNavigation.set('titleCards', {selector: itemsToString});
        SpatialNavigation.makeFocusable('titleCards');
        SpatialNavigation.focus('titleCards', true);
    }
}

function setNavigationForSliderItems(visibleCount, prevSliderLength){
    for(var z=0; z < visibleCount; z++){
        var itemToPush = " .slider-item-z".replace("z", (z))
        console.log("itemToPush:: " + itemToPush)
        if(sliderListItems.indexOf(itemToPush) === -1) {
            sliderListItems.push(itemToPush);
        }
    }
    sliderListItems.pop()
    if(prevSliderLength !== sliderListItems.length) {
        console.log("IN ITEMS TO ADD VISIBLE COUNT", visibleCount)
        console.log("IN ITEMS TO ADD VISIBLE COUNT", sliderListItems.length)
        var itemsToString = sliderListItems.toString();
        console.log(itemsToString);
        SpatialNavigation.disable("generic");
        SpatialNavigation.set('titleCards', {selector: itemsToString});
        SpatialNavigation.makeFocusable('titleCards');
        SpatialNavigation.focus('titleCards', true);
    }
}

function focusFirstCard(event) {
   setTimeout(()=>{
    const firstSliderItemToFocus = event.target.parentElement.querySelector('.slider-item-1 .title-card-container');
    SpatialNavigation.focus(firstSliderItemToFocus);
   }, 1000);
}

document.querySelectorAll('.handleNext').forEach(element => {
    element.addEventListener('sn:willmove', function(obj) {
    console.log('in will move handle Next directions:' + obj.detail.direction);
    const titleCard = element.parentNode.querySelector('.sliderMask').querySelectorAll('.slider-item');
        if(obj.detail.direction === 'left'){
            SpatialNavigation.makeFocusable('titleCards');
            SpatialNavigation.focus('titleCards', true);
            //titleCard[titleCard.length - 1].focus();
        } else if(obj.detail.direction === 'right') {
            event.target.click();
            querySliderItems();
            //focusFirstCard(event);
        } else {
            SpatialNavigation.makeFocusable('titleCards');
            //titleCard[0].focus();
        }
        console.log('will move', obj.detail.direction, obj.detail.sectionId, titleCard.length, document.activeElement.className);
    });                   
});

// .handlePrev class and element are not in DOM when page is loaded, need to look for it manually in slider element
// Load the event listener when the .handlePrev class is visible

var n = new MutationObserver(function (e) {
    e.forEach(function(mutationRecord) {
        var currentVal = mutationRecord.target.style.transform
        var oldValString = mutationRecord.oldValue
        var oldVal = oldValString.replace("transform", "").replace(":", "").replace(";", "").trim()
        console.log("NEWVALUE:" + currentVal);
        console.log("OLDVALUE:" + oldVal);
        if(oldVal === currentVal){
            console.log("ABCDEFG");
        } else {
            SpatialNavigation.resume();
        }
    });
});

var x = new MutationObserver(function (e) {
  if (e[0].addedNodes) {
      document.querySelectorAll('.handlePrev').forEach(element => {
          element.addEventListener('sn:willmove', function(obj) {
          console.log('in will move handle Prev direction:' + obj.detail.direction);
          const titleCard = element.parentNode.querySelector('.sliderMask').querySelectorAll('.slider-item');
              if(obj.detail.direction === 'right'){
                  SpatialNavigation.makeFocusable('titleCards');
                  //titleCard[titleCard.length - 1].focus();
              } else {
                  SpatialNavigation.makeFocusable('titleCards');
                  //titleCard[0].focus();
              }
              console.log('will move', obj.detail, titleCard.length, document.activeElement.className);
          });
      });
      document.querySelectorAll('.handlePrev').forEach(element => {
          var sliderContainment = element.parentNode.querySelector('.sliderMask').querySelector('.sliderContent');
          element.addEventListener('keyup', function(obj){
              console.log("Clicked Key Up", obj.code);
              if(obj.code === "Enter"){
                  SpatialNavigation.pause();
                  n.observe(sliderContainment, {attributes:true, attributeOldValue:true, attributeFilter:['style']});
              }
          });
          element.addEventListener('keydown', function(obj) {
              console.log("Clicked Key Down");
          });
      });
   };
});

var sliderTypeElements = document.getElementsByClassName('slider')

for (var d=0; d < sliderTypeElements.length; d++) {
    x.observe(sliderTypeElements[d], { childList: true });
}

document.querySelectorAll('.handleNext').forEach(element => {
    var sliderContainment = element.parentNode.querySelector('.sliderMask').querySelector('.sliderContent');
    element.addEventListener('keyup', function(obj){
        console.log("Clicked Key Up", obj.code);
        if(obj.code === "Enter") {
            SpatialNavigation.pause();
            n.observe(sliderContainment, {attributes:true, attributeOldValue:true, attributeFilter:['style']});
        }
    });
    element.addEventListener('keydown', function(obj) {
        console.log("Clicked Key Down");
    });
});

var delay = ( function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

function changeVideoPlayerNav() {
    console.log("inVideoPlayerNavFunction");
    delay(function(){
        var nfpcontainer = document.getElementsByClassName("nfp");
        console.log(nfpcontainer[1])
        nfpcontainer[0].addEventListener('keydown', function(obj) {
            obj.preventDefault();
            obj.stopPropagation();
            console.log(obj.code);
        });
    }, 5000);
}
