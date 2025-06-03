var trigger_error = (function() {
    var errors = [];

    function throttle(error) {
        error = error.toLowerCase();
        for (var i = 0, l = errors.length; i < l; i++) {
            if (errors[i] === error) {
                return true;
            }
        }
        errors.push(error);

        return false;
    }

    return function(error, file, line) {
        if (throttle(error)) {
            return true;
        }

        var e = encodeURIComponent,
            host = '//' + window.location.hostname;

        (new Image()).src = host + '/debug.png?type=js&message=' + e(error) +
            '&context[file]=' + e(file) +
            '&context[line]=' + e(line) +
            '&context[browser]=' + e(navigator.userAgent) +
            '&context[app]=' + e(navigator.appVersion) +
            '&context[url]=' + e(document.location.href) +
            '&_=' + (Math.floor(Math.random() * 1e6) + 1) + '.' + (new Date()).getTime();

        return true;
    };
})();

var LANG, TRANSLATION;
if (!LANG) LANG = 'ru';
if (!TRANSLATION) TRANSLATION = {};

TRANSLATION.FORM = {};
TRANSLATION.FORM.AJAX_IERROR = "По техническим причинам сервис временно недоступен.\nПриносим свои извинения за доставленные неудобства.";
TRANSLATION.FORM.AJAX_REPEAT = "Внутренняя ошибка сервера. Пожалуйста повторите операцию через 5 минут.";
TRANSLATION.FORM.FIELD_EMPTY = "Не задано значение для обязательного поля \"#FIELD#\"";
TRANSLATION.FORM.FIELD_WRONG = "Поле \"#FIELD#\" заполнено некорректно";
if (LANG == 'en') {
    TRANSLATION.FORM.AJAX_IERROR = "Service is temporarily unavailable";
    TRANSLATION.FORM.AJAX_REPEAT = "Internal server error. Please repeat operation in 5 minutes.";
    TRANSLATION.FORM.FIELD_EMPTY = "Value for an obligatory field \"#FIELD#\" is not specified";
    TRANSLATION.FORM.FIELD_WRONG = "Value for an obligatory field \"#FIELD#\" is incorrect";
}

var ajax_in_progress = false;

function WebAjax(url, data, callback_fnc, callback_error) {
    var date = new Date();
    if (typeof callback_error != 'function') {
        callback_error = null;
    }

    if (!ajax_in_progress) // only one request per time
    {
        ajax_in_progress = true;
        jQuery.ajax({
            type: "POST",
            url: url,
            data: data,
            cache: false,
            success: function(msg) {
                ajax_in_progress = false;
                var res = jQuery.trim(msg).split('|', 2);
                if (res[0] == 'ER') {
                    switch (res[1]) {
                        case 'INTERNAL_ERROR':
                            if (callback_error) {
                                try {
                                    callback_error('INTERNAL_ERROR');
                                } catch (e) {
                                    alert(TRANSLATION.FORM.AJAX_IERROR);
                                }
                            } else {
                                alert(TRANSLATION.FORM.AJAX_IERROR);
                            }
                            break;

                        default:
                            callback_fnc('ER', res[1]);
                    }
                } else if (res[0] == 'WL') {
                    window.location = res[1];
                } else {
                    callback_fnc(res[0], res[1]);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                ajax_in_progress = false;
                var er = 'url: ' + url + '; status: ' + XMLHttpRequest.status + '; statusText: ' + XMLHttpRequest.statusText + '; responseLength: ' + (XMLHttpRequest.responseText ? XMLHttpRequest.responseText.length : 0) + '; errorStatus: ' + textStatus + '; errorThrown: ' + errorThrown + '; timer: ' + (new Date - date);
                trigger_error(er, '/images/js/form.js', 0);

                if (callback_error) {
                    try {
                        callback_error('INTERNAL_ERROR');
                    } catch (e) {
                        alert(TRANSLATION.FORM.AJAX_REPEAT);
                    }
                } else {
                    alert(TRANSLATION.FORM.AJAX_REPEAT);
                }
            }
        });
    }
}

function HideMsgBlock() {
    $('#error_block, #message_block').css('visibility', 'hidden');
}

function ShowErrorMsg(msg, scroll_top) {
    $('#message_block').css('visibility', 'hidden').text('');
    var jBlock = $('#error_block').css('visibility', 'visible').text(msg);
    if (scroll_top) scrollTo(jBlock);
}

function ShowOkMsg(msg, scroll_top) {
    $('#error_block').css('visibility', 'hidden').text('');
    var jBlock = $('#message_block').css('visibility', 'visible').text(msg);
    if (scroll_top) scrollTo(jBlock);
}

function scrollTo(jTarget) {
    if (typeof jTarget == 'string') {
        jTarget = $(jTarget);
    }

    var scrollable = [];

    jQuery.each(['html', 'body'], function(i, e) {
        var jEl = $(e),
            domEl = jEl.get(0),
            scrolled = false;

        if (jEl.scrollTop() > 0) {
            scrollable.push(domEl);
            return false;
        }

        jEl.scrollTop(1);
        scrolled = jEl.scrollTop() > 0;
        jEl.scrollTop(0);
        if (scrolled) {
            scrollable.push(domEl);
            return false;
        }
    });

    var scrollTop = 0;
    if (typeof jTarget.jquery != 'undefined') {
        scrollTop = ((jTarget.offset() && jTarget.offset()['top']) || 0) + (-30);
    }

    var behaviours = {
        'scrollTop': (scrollTop > 0 ? scrollTop : 0)
    };

    var params = {
        duration: 400,
        easing: 'swing',
        complete: function() {}
    };


    try {
        if (behaviours.scrollTop < $(document).scrollTop() || behaviours.scrollTop > ($(document).scrollTop() + $(window).height() / 2)) {
            $([]).pushStack(scrollable).animate(behaviours, params);
        }
    } catch (e) {
        if (document.documentElement && document.documentElement.scrollTop) document.documentElement.scrollTop = 0;
        else if (document.body.scrollTop) document.body.scrollTop = 0;
    }
}

/**
 * "Кавычкер"
 *
 * Функция преобразует двойные кавычки в "ёлочки"
 *
 * @param {String} text
 * @param {Boolean} [escape=true]
 * @returns {String}
 * @copyright http://habrahabr.ru/sandbox/67646/
 */
function Quote(text, escape) {
    var charmap = {
        '«': '&laquo;',
        '»': '&raquo;'
    };

    if (!escape) {
        escape = true;
    }

    text = text
        .replace(/\x27/g, '\x22')
        .replace(/(\w)\x22(\w)/g, '$1\x27$2')
        .replace(/(^)\x22(\s)/g, '$1»$2')
        .replace(/(^|\s|\()"/g, '$1«')
        .replace(/"(;|!|\?|:|\.|,|$|\)|\s)/g, '»$1');

    if (escape) {
        for (var char in charmap) {
            if (charmap.hasOwnProperty(char)) {
                text = text.split(char).join(charmap[char]); // or .replace(new RegExp(char, 'g'), charmap[char])
            }
        }
    }

    return text;
}

function CheckStrField(field_id, field_name) {
    var err_msg = '';
    if (jQuery.trim($('#' + field_id).val()) == '') {
        err_msg = TRANSLATION.FORM.FIELD_EMPTY.replace('#FIELD#', field_name);
        $('#' + field_id).focus();
    }

    return err_msg;
}


function CheckEmailField(field_id, field_name) {
    var err_msg = '';
    var re_email = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var email = jQuery.trim($('#' + field_id).val());
    if (!re_email.test(email)) {
        err_msg = TRANSLATION.FORM.FIELD_WRONG.replace('#FIELD#', field_name);
        $('#' + field_id).focus();
    }

    return err_msg;
}

function CheckReField(field_re, field_id, field_name) {
    var err_msg = '';
    var filed_val = jQuery.trim($('#' + field_id).val());
    if (!field_re.test(filed_val)) {
        err_msg = TRANSLATION.FORM.FIELD_WRONG.replace('#FIELD#', field_name);
        $('#' + field_id).focus();
    }

    return err_msg;
}

function CheckBooleanField(input_id, input_name) {
    var val = $('#' + input_id).is(':checked'),
        err_msg = 'Поле «' + input_name + '» обязательно для заполнения';

    return (val === false ? err_msg : '');
}