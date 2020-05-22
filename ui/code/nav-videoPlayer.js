document.querySelectorAll('.nfp , .nf-player-container, .notranslate, .active, .NFPlayer, .originalsBackgroundAutoplayTrailer').forEach(element => {
    element.addEventListener('keydown', function(obj) {
        console.log(obj.code);
        obj.preventDefault();
        obj.stopPropagation();
    })
});
