$.support.placeholder = (function() { // Тест на поддержку атрибута placeholder
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

/**
 * Placeholder behaviour polyfill
 */
function placeholder() {
    if (!$.support.placeholder) { // Условие для вызова только, если placeholder не поддерживается
        $("form").find("input[type='text']")
            .each(function() {
                if ($(this).data('val-swapped')) { // повторный вызов
                    $(this).val($(this).attr('placeholder'));
                } else if (!$(this).val() && $(this).attr('placeholder')) { // первый вызов функции
                    $(this).val($(this).attr('placeholder'))
                        .css('color', '#ccc')
                        .data('val-swapped', true); // метка, что атрибут "value" подменён
                }
            })
            .unbind('focusin.ph')
            .bind('focusin.ph', function() { // namespace, чтобы при unbind'e не зацепить другие обработчики
                var ph = $(this).attr('placeholder');
                if ($(this).val() == ph) {
                    $(this).attr('value', '').css('color', '#303030');
                }
            })
            .unbind('focusout.ph')
            .bind('focusout.ph', function() { // namespace, чтобы при unbind'e не зацепить другие обработчики
                if (!$(this).val()) {
                    $(this).val($(this).attr('placeholder'))
                        .css('color', '#ccc')
                        .data('val-swapped', true);
                } else { // что-то ввели, прекращаем отслеживать этот input
                    $(this).data('val-swapped', false);
                }
            });

        /* Protected send form */
        $("form").submit(function() {
            $(this).find("input[type='text']").each(function() {
                var val = $(this).attr('placeholder');
                if ($(this).val() == val) {
                    $(this).attr('value', '');
                }
            })
        });
    }
}

/**
 * Parse Url
 *
 * @param {string} url
 * @return {{source: string, protocol: string, host: string, port: string, query: string, params: Object, file: *, hash: string, path: string, relative: *, segments: Array}}
 * @link https://habrahabr.ru/post/177559/#comment_6164291
 */
function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;

    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function() {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length,
                i = 0,
                s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split('=');
                ret[s[0]] = decodeURIComponent(s[1]);
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };
}

$(document).ready(function() {
    $('#logout').click(function() {
        WebAjax(
            '/ajax/logout/', {
                'form_data[logout]': true
            },
            function(type, msg) {
                if (type == 'OK') {
                    window.location = "/";
                }
            }
        );
    });
    /*Блок поиска*/
    placeholder();

    $('[data-action=search]').click(function() {
        $(this).parents('form.search').trigger('submit');

        return false;
    });

    $('#search_main').submit(function() {
        var $input = $('input[name=text]');
        if ($input.val() == $input.data('pattern')) {
            $input.val('');
        }
    });

    /*Аккордеон*/
    $('.js-accordion > a').click(function() {
        if ($(this).parent().hasClass('active')) {
            $(this).parent().removeClass('active');
            $(this).find('span').removeClass('m-open').addClass('m-close');
        } else {
            $(this).parent().addClass('active');
            $(this).find('span').removeClass('m-close').addClass('m-open');
        }

        return false;
    });

    /*-- Кнопка наверх --*/
    $("body").append('<div id="back-top"><a href="#top"><span><span></span></span>Наверх</a></div>');

    $("#back-top").hide();

    $(window).bind('scroll', function() {
        ScrollTop();
    }).triggerHandler('scroll', ScrollTop);

    $('#back-top a').click(function() {
        $('body,html').stop(true).animate({
            scrollTop: 0
        }, 800);
        return false;
    });

    function ScrollTop() {
        if ($(this).scrollTop() > 160) {
            $('#back-top').fadeIn();
        } else {
            $('#back-top').fadeOut();
        }
    }

    $.ErratumReporter({
        onSuccess: function(response) {
            var type = $.trim(response).split('|', 1)[0];
            if (type == 'OK') {
                this.showInfo(this.options.messages.thanks);
            } else {
                this.showError(this.options.messages.sendError);
            }
        },
        onError: function() {
            this.showError(this.options.messages.sendError);
        },
        transformReport: function(report) {
            return {
                form_data: report
            };
        }
    });

    $('#js-mobile-version_link').on('click', function() {
        Cookies.set('use_main_forced_from_mobile', '0', {
            domain: '.garant.ru'
        });
        window.location.reload();
    });
});