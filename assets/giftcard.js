!function(){var e="#QrCode",t=".giftcard__code";const n=document.querySelector(e);if(n){const e=n.getAttribute("data-identifier");new QRCode(n,{text:e,width:120,height:120})}const o=document.querySelector(t);if(o){o.addEventListener("click",function(e){var t=document.querySelector("#GiftCardDigits"),n="";if(document.body.createTextRange)(n=document.body.createTextRange()).moveToElementText(t),n.select();else if(window.getSelection){var o=window.getSelection();(n=document.createRange()).selectNodeContents(t),o.removeAllRanges(),o.addRange(n)}}())}}();