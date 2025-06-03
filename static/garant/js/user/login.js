/**
 * Event manager for «login» widget
 *
 * @type {{on: function, trigger: function, SUCCESS: string, FAILURE: string}}
 * @const
 */
var LoginEvent = (function($, undef) {
    /**
     * Collection of event-named callbacks
     *
     * @type {Object.<string, Array.<function>>}
     */
    var events = {};

    return {
        SUCCESS: 'success',
        FAILURE: 'failure',
        FACEBOOK_SUCCESS: 'fb_success',
        FACEBOOK_FAILURE: 'fb_failure',

        /**
         * Bindings 'callback' for some 'event'
         *
         * @param {string} event
         * @param {function} callback
         */
        on: function(event, callback) {
            if (undef === events[event]) {
                events[event] = [];
            }
            if ($.isFunction(callback)) {
                events[event].push(callback);
            }
        },

        /**
         * Triggers some 'event' with specific 'data'
         *
         * @param {string} event
         * @param {Object} data
         */
        trigger: function(event, data) {
            if (undef === events[event]) {
                return;
            }

            for (var i = 0, callback; i < events[event].length; i++) {
                callback = events[event][i];
                callback(data);
            }
        }
    };
})(window['jQuery']);

if (typeof parseUrl === 'undefined') {
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
}

$(document).ready(function() {
    var options = {
        wrapCSS: 'fancybox-custom register-model',
        openEffect: 'none',

        helpers: {
            overlay: {
                css: {
                    'background': 'rgba(238,238,238,0.85)'
                },
                locked: false
            }
        }
    };

    $('.auth').fancybox(options);
    var url = parseUrl(window.location.href);
    if (('login' in url.params || 'konkurs_login' in url.params || $('#auth').data('display') == true) && $('#auth').length) {
        $.fancybox('#auth', options);
    }

    $('#register').click(function() {
        $('.error').css('display', 'none');
        var error_text = '';
        var ret_val = true;
        var error = '';

        if ($('#pers_login').val() == '') {
            error = 'Введите логин';
            $('#error_login').html(error).css('display', 'block');

        }

        if (error == '' && $('#pers_password').val() == '') {
            error = 'Введите пароль';
            $('#error_password').html(error).css('display', 'block');

        }

        if (error == '') {
            $('#error_aut').html("Подождите, пожалуйста.").css('display', 'block');

            WebAjax(
                '/ajax/login/', {
                    'form_data[login]': $('#pers_login').val(),
                    'form_data[pass]': $('#pers_password').val(),
                    'form_data[rem_me]': $('#pers_rem_me').attr('checked') ? 1 : 0,
                    'form_data[from]': encodeURIComponent(url.params['from'] || ''),
                    'form_data[sign]': encodeURIComponent(url.params['sign'] || '')
                },
                function(type, msg) {
                    if (type === 'OK') {
                        LoginEvent.trigger(LoginEvent.SUCCESS, {
                            response: msg
                        });
                    } else {
                        error = "Ошибка авторизации. Проверьте данные";
                        $('#error_aut').html(error).css('display', 'block');
                        LoginEvent.trigger(LoginEvent.FAILURE, {
                            response: msg
                        });
                    }
                }
            );
        }

        return false;
    });

    $('.js-login').click(function(e) {
        $.fancybox('#auth', options);
        e.preventDefault();
    });

    $('#out').click(function() {
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
});

function ShowRegisterForm() {
    if ($('#block_login').css('display') == 'none') {
        $('#block_login').css('display', 'block');
        $('#block_short_login').css('display', 'none');
    } else {
        $('#block_login').css('display', 'none');
        $('#block_short_login').css('display', 'block');
    }
}

/**
 * Action for login button
 *
 * @constructor
 * @deprecated
 */
function CheckLoginFormData() {
    var error_text = '';
    var ret_val = true;

    if ($('#pers_login').val() == 'Логин' || $('#pers_login').val() == '') {
        error_text = 'Введите логин';
    }

    if (error_text == '' && ($('#pers_password').val() == 'Пароль' || $('#pers_password').val() == '')) {
        error_text = 'Введите пароль';
    }


    if (error_text == '') {

        $('#login_error').html("Подождите, пожалуйста.");

        WebAjax(
            '/ajax/login/', {
                'form_data[login]': $('#pers_login').val(),
                'form_data[pass]': $('#pers_password').val(),
                //'form_data[reg_type]'	: $('#pers_password').val(),
                'form_data[rem_me]': $('#pers_rem_me').attr('checked') ? 1 : 0
            },
            function(type, msg) {
                if (type == 'OK') {
                    var loc = '/personal/';

                    switch ($('#reg_type').val()) {
                        case 'konkurs':
                            loc = "/konkurs/selection_tour/";
                            break;
                        case 'forum':
                            loc = "/forum/";
                            break;
                    }

                    if (loc) {
                        window.location = loc;
                    }
                } else {
                    $('#login_error').html("Ошибка авторизации. Проверьте данные");
                }
            }
        );
    } else {
        $('#login_error').html(error_text);
    }
}

function logout() {
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
}

// Load the SDK Asynchronously
/*
(function(d) {
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) { return; }
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/ru_RU/all.js";
	ref.parentNode.insertBefore(js, ref);
} (document));
*/

function authFb(access_token) {
    var url = parseUrl(window.location.href);

    hide_error_login();
    FB.api('/me', {
        fields: 'first_name,last_name,email'
    }, function(me) {
        if (me.email) {
            WebAjax(
                '/ajax/facebook_auth/', {
                    'form_data[access_token]': access_token,
                    'form_data[email]': me.email,
                    'form_data[id]': me.id,
                    'form_data[first_name]': me.first_name,
                    'form_data[last_name]': me.last_name,
                    'form_data[from]': encodeURIComponent(url.params['from'] || ''),
                    'form_data[sign]': encodeURIComponent(url.params['sign'] || '')
                },
                function(response) {
                    if ('OK' === response) {
                        LoginEvent.trigger(LoginEvent.FACEBOOK_SUCCESS, {});
                    } else {
                        show_error_login("Ошибка авторизации. Проверьте данные");
                        LoginEvent.trigger(LoginEvent.FACEBOOK_FAILURE, {
                            error: response
                        });
                    }
                }
            );
        } else {
            show_error_login("Ошибка Facebook. Данные профиля не предоставлены");
            LoginEvent.trigger(LoginEvent.FACEBOOK_FAILURE, {
                error: 'Facebook did not provide user data'
            });
        }
    });
}

var FACEBOOK_APP_ID; // it is expected that the variable is declared in the global scope
window.fbAsyncInit = function() {
    window.FB.init({
        appId: FACEBOOK_APP_ID,
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.8'
    });
};

function setStatusFb() {
    hide_error_login();
    var is_connect = false;
    // Проверяем, зарегистрировался ли пользователь:
    FB.getLoginStatus(function(response) {
        hide_error_login();
        is_connect = true;
        if (response.authResponse) {
            authFb(response.authResponse.accessToken);
        } else {
            FB.login(function(response) {
                hide_error_login();
                if (response.authResponse) {
                    authFb(response.authResponse.accessToken);
                } else {
                    show_error_login("Ошибка авторизации. Проверьте данные");
                    LoginEvent.trigger(LoginEvent.FACEBOOK_FAILURE, {
                        error: 'Facebook did not authorize user account'
                    });
                }
            }, {
                scope: 'public_profile,email'
            });
        }
    }, true);
    setTimeout(function() {
        if (!is_connect) {
            show_error_login("Ошибка связи с сервером Facebook. Пожалуйста, повторите попытку позже");
        }
    }, 1000);
};

function show_error_login(error) {
    $('#error_aut').html(error).css('display', 'block');
}

function hide_error_login() {
    $('#error_aut').css('display', 'none');
}

function vk_error(error) {
    $('#error_aut').html(error).css('display', 'block');
}

function vk_auth(vk_client_id, redirect_uri) {
    var url = 'https://oauth.vk.com/authorize?scope=email&response_type=code&v=5.24&client_id=' + vk_client_id + '&redirect_uri=' + redirect_uri;
    var win = window.open(url, "Гарант. Вконтакте", "width=400, height=300");
    win.focus();
}

function vk_redirect() {
    var url = parseUrl(window.location.href);

    return '/services/vk_redirect/?from=' + encodeURIComponent(url.params['from']) + '&sign=' + encodeURIComponent(url.params['sign']);
}