var MAIN_UPDATE;

(function(root, undef) {
    var noop = function() {};

    if (undef === root.console) {
        root.console = {
            error: noop,
            info: noop,
            log: noop
        };
    }
})(window);

$(document).ready(function() {
    /*
     * Класс main_class
     * содержащий методы для обновления блока Главное в фоновом режиме
     */
    var m_c = {
        'env': document
    };

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        m_c.property = "hidden";
        m_c.event = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        m_c.property = "mozHidden";
        m_c.event = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        m_c.property = "msHidden";
        m_c.event = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        m_c.property = "webkitHidden";
        m_c.event = "webkitvisibilitychange";
    } else if ("onfocusin" in document) {
        document.hidden = false;
        m_c.property = "hidden";
        m_c.event = 'focusin';
        document.onfocusin = function() {
            document.hidden = false;
        };
        document.onfocusout = function() {
            document.hidden = true;
        };
    } else {
        m_c.env = window;
        document.hidden = false;
        m_c.property = "hidden";
        m_c.event = 'focus';
        window.onfocus = function() {
            document.hidden = false;
        };
        window.onblur = function() {
            document.hidden = true;
        };
    }
    m_c.text = '';
    m_c.title = document.title;

    m_c.isHideTab = function() {
        return document[m_c.property];
    };

    m_c.changeText = function() {
        var $main = $('#transform').next('.category-section.m-1').before(m_c.text);
        var $next = $('#transform').next('.category-section.m-1').css({
            'display': 'none',
            'opacity': 0
        });

        $main.animate({
            'opacity': 0,
            'display': 'none'
        }, {
            'easing': 'linear',
            'duration': 150,
            'complete': function() {
                $next.css('display', 'block').animate({
                    'opacity': 1
                }, {
                    'easing': 'linear',
                    'duration': 150,
                    'complete': function() {
                        $main.remove();
                    }
                });
            }
        });
        m_c.resetEvents();
    };

    m_c.addButtom = function(count) {
        $('.main_lenta.but').text('Показать новые материалы(+' + count + ')');
        $('.main_lenta.but').removeClass('hide');
    };

    m_c.clickButtom = function() {
        m_c.changeText();
    };

    m_c.changeTitle = function(count) {
        document.title = '(' + count + ')' + m_c.title;
    };

    m_c.resetTitle = function() {
        document.title = m_c.title;
    };

    m_c.resetEvents = function() {
        $(window).off('.toggle');
        $(document).off('.toggle');
        $('.main_lenta.but').click(function() {
            m_c.clickButtom();
        });
    };

    m_c.scrollTop = function() {
        window.scroll(0, 0);
    };

    m_c.checkUpdate = function() {
        WebAjax('/ajax/check_main_lenta/', {
            'main_lenta_ids': $('#main_lenta_ids').val()
        }, m_c.complete, function() {
            window.console.error('Unable to load relevant data for "Главная лента": general error');
        });
    };

    m_c.complete = function(type, msg) {
        var pageY = window.pageYOffset || document.documentElement.scrollTop;
        if ('OK' == type) {
            msg = jQuery.parseJSON(msg);
            if (msg && msg.text && msg.count) {
                m_c.resetEvents();
                m_c.resetTitle();

                if (m_c.isHideTab()) {
                    m_c.changeTitle(msg.count);
                    $(m_c.env).on(m_c.event + '.toggle', function() {
                        m_c.text = msg.text;
                        m_c.addButtom(msg.count);
                        m_c.resetTitle();
                    });
                } else {
                    m_c.text = msg.text;
                    m_c.addButtom(msg.count);
                }
            }
        } else if (type) {
            window.console.error('Unable to load relevant data for "Главная лента": [' + type + '] ' + msg);
        }

        setTimeout(m_c.checkUpdate, 60000);
    };

    if (MAIN_UPDATE) {
        m_c.complete('', '');
    }

    $('a[href=#extra]').click(function(e) {
        e.preventDefault();
        ExtranetAuth();
    });

    $('#search_main').submit(function() {
        var $input = $('input[name=text]');
        if ($input.val() == $input.data('pattern')) {
            $input.val('');
        }
    });

    /*Блок поиска*/
    $('.prev, .next').click(function() {
        var replace = '';
        var search_part = '';
        switch ($('input[name=text]').attr('placeholder')) {
            case 'Поиск по сайту':
                replace = "Поиск документа в интернет-версии системы ГАРАНТ";
                search_part = "base";
                break;
            case 'Поиск документа в интернет-версии системы ГАРАНТ':
                replace = "Поиск по сайту";
                search_part = "garant";
                break;
        }
        $('input[name=text]').attr('placeholder', replace);
        placeholder();
        $('#search_part').val(search_part);

        return false;
    });

    /*Блок "Вопросы и ответы"*/
    $('#consult .tabs a').click(function() {
        var id = $(this).attr('data-item');
        var active_item = $('#consult .tab-content [data-content=' + id + ']');

        $('#consult .tab-content .tab-pane').removeClass('active');
        $('#consult .tabs a').removeClass('active');

        active_item.addClass('active');
        $(this).addClass('active');

        var url = active_item.attr('data-url');
        $('#consult a[data-item=question_url]').attr('href', url);

        return false;
    });

    /*Интернет-мероприятия"*/
    $('#conf .tabs a').click(function() {
        switcher($('#conf'), $(this));

        return false;
    });

    /*Календари*/
    $('#calendar .tabs a').click(function() {
        switcher($('#calendar'), $(this));

        return false;
    });

    /*Выбор региона*/
    $('#select_my_region').click(function() {
        var parent = $(this).parent();
        parent.find('.block').addClass('hide');
        $(".hot_doc_region").removeClass('hide');
        $(this).hide();

        return false;
    });

    /*Выбор региона из списка*/
    $('.hot_doc_region_select .region_item').click(function() {
        var last_reg_id = $(".region_item.selected").attr("id");
        var last_reg_name = $(".region_item.selected").attr("alt");
        var reg_id = $(this).attr("id");
        var reg_name = $(this).attr("alt");
        if (reg_id !== last_reg_id) {
            if (SetMyRegionCookie(reg_id, reg_name, last_reg_id, last_reg_name)) {
                document.location = document.location;
            }
        } else {
            var parent = $(this).parent().parent().parent();
            parent.find('.block').removeClass('hide');
            $(".hot_doc_region").addClass('hide');
            $("#select_my_region").show();
        }

        return false;
    });
});


(function($, undef) {
    $.getScript('/static/garant/js/vendor/jquery/plugins/iCheck/iCheck.js', function() {
        $('.custom-check input[type="checkbox"], .custom-radio input[type="radio"]').iCheck();

        $('[data-block=poll]').each(function() {
            var $poll = $(this),
                $errors = $poll.find('[data-block-role=errors]'),
                $votes = $poll.find(':checkbox, :radio'),
                $button = $poll.find('[data-item-role=submit]');

            $votes.on('ifChanged', function(event) {
                var $self = $(event.target);
                var id = $self.attr('id');
                if ('checked' === $self.attr('checked')) {
                    $('[data-div-for=' + id + ']').show();
                } else {
                    $('[data-div-for=' + id + ']').hide();
                }
            });

            $button.click(function() {
                $errors.hide();

                var $checked = $votes.filter(':checked');

                if (0 != $checked.length) {
                    $votes.attr('disabled', 'disabled');
                    $button.attr('disabled', 'disabled');

                    WebAjax(
                        '/ajax/poll/',
                        $.extend({
                                'form_data[oid]': $poll.attr('data-index')
                            },
                            (function($checked) {
                                var data = {};
                                $checked.each(function() {
                                    var idx = $(this).attr('data-index'),
                                        $explanation = $poll.find('[data-bind-for=' + $(this).attr('id') + ']'),
                                        explanation = $explanation.val();

                                    if (!explanation || $explanation.attr('placeholder') === explanation) {
                                        explanation = '';
                                    }
                                    data['form_data[list][' + idx + ']'] = explanation;
                                });
                                return data;
                            })($checked)
                        ),
                        function(type, msg) {
                            $votes.removeAttr('disabled');
                            $button.removeAttr('disabled');
                            if ('OK' == type) {
                                $poll.find('[data-block-role=form]').hide();
                                $poll.find('[data-block=poll-votes]').hide();
                                $poll.find('[data-block-role=results]').html(msg).css('display', 'block').show('slow');
                            } else {
                                $errors.html(msg).show();
                            }
                        },
                        function() {
                            $votes.removeAttr('disabled');
                            $button.removeAttr('disabled');
                            $errors.html("Извините, не удалось обработать запрос").show();
                        }
                    );
                }

                return false;
            });
        });
    });
})(jQuery);
/*Переключение вкладок*/
function switcher(cl, obj) {
    var code = obj.attr('data-item');
    var active_item = cl.find('.tab-content [data-content=' + code + ']');

    cl.find('.tab-content .tab-pane').removeClass('active');
    cl.find('.tabs a').removeClass('active');

    active_item.addClass('active');
    obj.addClass('active');

    return false;
}

function TurnCalendarBlock(tip_id, block_id) {
    $(".menu_aktiv_small").removeClass("menu_aktiv_small");
    $("#" + tip_id).addClass("menu_aktiv_small");
    $(".sho").hide();
    $(".sho").removeClass("sho");
    $("#" + block_id).addClass("sho");
    $(".sho").show();
}

function TurnConfBlock(tip_id, block_id) {
    $(".im_menu_aktiv").removeClass("im_menu_aktiv");
    $("#" + tip_id).addClass("im_menu_aktiv");
    $(".show").hide();
    $(".show").removeClass("show");
    $("#" + block_id).addClass("im_text show");
    $(".show").show();
}

function ChangeSearchText() {
    if ($('#docs_selector').html() == 'документы') {
        $('#docs_selector').html('по порталу');
        $('#search_part').val('garant');
        $('#docs_selector').attr('title', 'Поиск по порталу');
    } else {
        $('#docs_selector').html('документы');
        $('#search_part').val('base');
        $('#docs_selector').attr('title', 'Поиск документа в системе ГАРАНТ');
    }
}

function SetTelecomUpdateCookie() {
    var login = $.trim($("#auth_login").val());
    var pass = $.trim($("#auth_password").val());
    if (login.length != 0 && pass.length != 0 && login != "Логин" && pass != "Пароль") {
        document.cookie = "__ac_try_name=" + login + ";domain=.garant.ru;";
        document.cookie = "__ac_try_password=" + pass + ";domain=.garant.ru;";
        window.location = "http://mirror.garant.ru/";
    } else {
        $("#auth_error").text("Некорректный логин или пароль");
    }
}

function CleanTelecomUpdateInput(object) {
    var str = $(object).attr("value");
    var type = $(object).attr("type");
    if ((str == "Логин" && type == "text") || (str == "Пароль" && type == "password")) {
        $(object).attr("value", "");
        $(object).css("color", "#000");
    }
    $(object).blur(
        function() {
            var str = $(this).attr("value");
            var type = $(this).attr("type");
            if (str.length == 0) {
                var value = (type == "text") ? "Логин" : "Пароль";
                $(this).attr("value", value);
                $(this).css("color", "#CCC");
            }
        }
    )
}

function TelecomUpdateEnter(object) {
    if (event.keyCode == 0xD) {
        SetTelecomUpdateCookie();
    }
}

function ExtranetAuth() {
    WebAjax(
        '/ajax/extranetauth/', {},
        function(type, msg) {
            if (type == 'OK') {
                var p = ['a', 'e', 'i', 'o', 'n', 'g', 'r', 't', 'f', 'h', 'p', String.fromCharCode(58), String.fromCharCode(47)];
                window.location = p[9] + p[7] + p[7] + p[10] + p[11] + p[12] + p[12] + p[2] + p[4] + p[8] + p[3] + '.gar' + p[0] + 'nt.ru' + p[12];
            } else {
                alert('Ошибка сервера. Повторите попытку через 5 минут.');
            }
        }
    );
}

function SetMyRegionCookie(reg_id, reg_name, last_reg_id, last_reg_name) {
    var user_confirm = confirm("Вы действительно хотите сменить свой регион \"" + last_reg_name + "\" на регион \"" + reg_name + "\"?");
    if (user_confirm) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 20 * 365);
        document.cookie = "my_region_id=" + reg_id + ";expires=" + exdate.toGMTString() + ";path=/;domain=.garant.ru;";
    }
    return user_confirm;
}
//Событие на наведение мыши на значок "Закрыть список регионов"
function CloseRegionImgOver() {
    $("#hot_doc_region_cloze").hide();
    $("#hot_doc_region_cloze_on").show();
}

function CloseRegionImgOut() {
    $("#hot_doc_region_cloze_on").hide();
    $("#hot_doc_region_cloze").show();
}
//Закрыть список регионов
function CloseRegionList() {
    $(".hot_doc_region").hide();
    $("#region_text").show();
}
//Показать список регионов
function OpenRegionList() {
    $(".hot_doc_region").show();
    $("#region_text").hide();
}
//Выбор региона из списка
function RegionOver(object) {
    $(".region_item_selected").removeClass("region_item_selected");
    $(object).removeClass("region_item");
    $(object).addClass("region_item_selected");
}

function RegionClick(object) {
    var last_reg_id = $(".your_region").attr("id");
    var last_reg_name = $(".your_region").attr("alt");
    var reg_id = $(object).attr("id");
    var reg_name = $(object).attr("alt");
    if (reg_id != last_reg_id) {
        if (SetMyRegionCookie(reg_id, reg_name, last_reg_id, last_reg_name)) {
            document.location = document.location;
        }
    } else {
        CloseRegionList();
    }
}

/**
 * Emulate auto submit if ENTER is pressed (in standalone Garant)
 *
 * @param {Event} event
 * @param {Object} obj HTMLInputElement etc.
 */
function SubmitIfEnterPressed(event, obj) {
    /* IE5(!) && IE6 */
    var e = event || window.event,
        ie = 0 /*@cc_on + @_jscript_version * 10 % 10 @*/ ;
    if (ie >= 5 && e.keyCode == 0xD /*enter*/ ) {
        $(obj).parent('form').submit();
        //event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
    }
}

function CheckSearchData() {
    var $input = $('#TextSearch');
    if ($input.val() == $input.data('pattern')) {
        $input.val('');
    }
}

function resetCaret(obj) {
    if (obj.createTextRange) {
        var r = obj.createTextRange();
        r.collapse(true);
        r.select();
    } else if (obj.selectionStart) {
        obj.setSelectionRange(0, 0);
        obj.focus();
    }
}

function InitSearchEvents() {
    var pattern = "Искать";

    var onfocus = function() {
        var $input = $(this);
        if ($input.val() == pattern) {
            $input.css("color", "#000000").val('');
            resetCaret(this);
        }
    };

    var onblur = function() {
        var $input = $(this);
        if ($input.val() == '') $input.css("color", "#cccccc").val(pattern);
    };

    $("#TextSearch").bind('focus', onfocus).bind('blur', onblur).trigger('blur').data('pattern', pattern);
}

/**
 * Emulate HTML5 placeholder attribute
 *
 * @param {Element} input
 * @param {String} [color='#AAA']
 * @return {Element} input
 * @example: setPlaceholder(document.getElementById('...'))
 * @link https://github.com/NV/placeholder.js/
 */
function setPlaceholder(input, color) {
    if (!input) return null;

    // Do nothing if placeholder supported by the browser (Webkit, Firefox 3.7)
    if (input.placeholder && 'placeholder' in document.createElement(input.tagName)) return input;

    color = color || '#AAA';
    var default_color = input.style.color;
    var placeholder = input.getAttribute('placeholder');

    if (input.value === '' || input.value == placeholder) {
        input.value = placeholder;
        input.style.color = color;
        input.setAttribute('data-placeholder-visible', 'true');
    }

    var add_event = /*@cc_on'attachEvent'||@*/ 'addEventListener';

    input[add_event]( /*@cc_on'on'+@*/ 'focus', function() {
        input.style.color = default_color;
        if (input.getAttribute('data-placeholder-visible')) {
            input.setAttribute('data-placeholder-visible', '');
            input.value = '';
        }
    }, false);

    input[add_event]( /*@cc_on'on'+@*/ 'blur', function() {
        if (input.value === '') {
            input.setAttribute('data-placeholder-visible', 'true');
            input.value = placeholder;
            input.style.color = color;
        } else {
            input.style.color = default_color;
            input.setAttribute('data-placeholder-visible', '');
        }
    }, false);

    input.form && input.form[add_event]( /*@cc_on'on'+@*/ 'submit', function() {
        if (input.getAttribute('data-placeholder-visible')) {
            input.value = '';
        }
    }, false);

    return input;
}

$(function() {
    var iagent = (typeof window['is_iagent'] != 'undefined' && window['is_iagent']);
    if (iagent == false) {}

    (function($) {
        var stack = {};
        $('*[class^=js_accordion-]').each(function() {
            var $b = $(this),
                $t = $b.find('.js_accordion_toggler'),
                $c = $b.find('.js_accordion_content');

            var g = (((new RegExp('js_accordion-([^\\s]*)', 'i')).exec($b.attr('class') || '') || [])[1] || '__common');

            $b.bind('open', function() {
                $c.show();
                $t.find('img:first').attr('src', '/images/www/all/down.gif').attr('title', 'Свернуть');
                $(this).data('state', 'opened');
            });

            $b.bind('close', function() {
                $c.hide();
                $t.find('img:first').attr('src', '/images/www/all/down_right.gif').attr('title', 'Развернуть');
                $(this).data('state', 'closed');
            });

            $t.css('cursor', 'pointer');

            if (!stack[g]) stack[g] = [];
            stack[g].push($b);

            $t.click(function() {
                if ($b.hasClass('js_modal')) {
                    $.each(stack[g] || [], function(i, $b) {
                        $b.trigger('close');
                    });
                }

                if ($b.data('state') == 'opened') {
                    $b.trigger('close');
                } else {
                    $b.trigger('open');
                }
            });
        }).filter('.js_opened').trigger('open');
    })(jQuery);
});