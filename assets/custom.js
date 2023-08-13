jQuery(document).ready(function ($) {
    $(".accordion__title").each(function() {
        $(this).click(function() {
            $(this).parent().find(".accordion__body").toggle();
        })
    })

    $('.prdt-grid .product-grid-item .shopify-product-form').each(function() {
        $(this).on('submit', function(e) {
            e.preventDefault();
            $.ajax({
              type: 'POST',
              url: '/cart/add.js',
              data: $(this).serialize(),
              dataType: 'json',
              success: function(data) {
                console.log(data)
              }
            });

            setTimeout(() => {
                jQuery.getJSON('/cart.js', function(cart) {
                    document.dispatchEvent(new CustomEvent("theme:cart:change", {
                        bubbles: true,
                        detail: {
                            cart: cart
                        }
                    }));
                    
                    document.querySelector('[data-drawer="drawer-cart"]').dispatchEvent(new CustomEvent("theme:drawer:open", {
                        detail: {
                            reinit: !0
                        },
                        bubbles: !0
                    }))
                })              
            }, 1000);
        })
    })
});