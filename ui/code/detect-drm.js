var drmconfig = [{
  "initDataTypes": ["cenc"],
  "audioCapabilities": [{
    "contentType": "audio/mp4;codecs=\"mp4a.40.2\""
  }],
  "videoCapabilities": [{
    "contentType": "video/mp4;codecs=\"avc1.42E01E\""
  }]
}];

function checkForDRM(){
    navigator.requestMediaKeySystemAccess("com.widevine.alpha", drmconfig)
    .then(function(mediaKeySystemAccess) {
        console.log('widevine support ok');
    }).catch(function(e) {
        console.log('no widevine support');
        console.log(e);
    });
}
