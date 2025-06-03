;
(function($, window, document, undefined) {
    var pluginName = "ErratumReporter";
    var defaults = {
        charsAround: 60,
        maxTextLen: 220,
        sendUrl: '/ajax/erratum_report/',
        dialogWidth: 500,
        dialogHeight: "auto",

        messages: {
            title: 'Отправка ошибки',
            description: 'Фрагмент текста с ошибкой:',
            commentInfo: 'Правильный вариант (не обязательное поле):',
            sendButton: 'Отправить',
            cancelButton: 'Отмена',
            warning: 'Предупреждение',
            info: 'Информация',
            error: 'Ошибка',
            tooBig: 'Вы выбрали слишком большой фрагмент текста',
            sendError: 'Не удалось отправить сообщение. Пожалуйста, повторите попытку позднее.',
            thanks: 'Спасибо! Ваше сообщение отправлено.'
        },

        // Callbacks
        onSuccess: $.noop,
        onError: $.noop,
        transformReport: function(report) {
            return report;
        },

        // Templates
        templates: {
            main: '<div title="{title}">' +
                '<p>{description}</p>' +
                '<p class="text"></p>' +
                '<div><p>{commentInfo}</p><input type="text" style="width:95%"/></div>' +
                '</div>',
            message: '<div title="{title}"><p>{message}</p></div>'
        }
    };

    function Plugin(options) {
        this.options = $.extend(true, {}, defaults, options);

        this._defaults = defaults;

        this.init();
    }

    Plugin.prototype = {

        init: function() {

            if (!$.fn.dialog) {
                throw Error("jQuery UI plugin \"Dialog\" isn't installed");
            }

            var Plugin = this;
            $(document).keypress(function(event) {
                var call = false;
                var winEvent = window.event;
                if (winEvent) {
                    call = winEvent.keyCode == 10 || (winEvent.keyCode == 13 && winEvent.ctrlKey);
                } else if (event) {
                    call = (event.which == 10 && event.modifiers == 2) ||
                        (event.keyCode == 0 && event.charCode == 106 && event.ctrlKey) ||
                        (event.keyCode == 13 && event.ctrlKey);
                }

                if (call) {
                    Plugin.process();
                }
            })
        },

        process: function() {
            var selection = this.getSelection();
            if (selection == null) {
                return;
            }

            this.selection = selection;
            this.showDialog();
        },

        getSelection: function() {
            try {
                if (window.getSelection) {
                    Selection = window.getSelection();
                } else { // IE
                    Selection = document.selection;
                }

                if (Selection == null) { // Bad browser
                    return null;
                }

                var textBefore = '';
                var text = '';
                var textAfter = '';
                var RangeBefore, Range, RangeAfter;

                if (Selection.getRangeAt) {
                    Range = Selection.getRangeAt(0);
                    text = Range.toString();

                    RangeBefore = document.createRange();
                    RangeBefore.setStartBefore(Range.startContainer.ownerDocument.body);
                    RangeBefore.setEnd(Range.startContainer, Range.startOffset);
                    textBefore = RangeBefore.toString();
                    textBefore = textBefore.substring(textBefore.length - this.options.charsAround, textBefore.length);

                    RangeAfter = document.createRange();
                    RangeAfter.setStart(Range.endContainer, Range.endOffset);
                    RangeAfter.setEndAfter(Range.endContainer.ownerDocument.body);
                    textAfter = RangeAfter.toString();
                    textAfter = textAfter.substring(0, this.options.charsAround);
                } else if (Selection.createRange) { // IE
                    Range = Selection.createRange();
                    text = Range.text;

                    RangeBefore = Selection.createRange();
                    RangeBefore.moveStart('character', -this.options.charsAround);
                    RangeBefore.moveEnd('character', -text.length);
                    textBefore = RangeBefore.text;

                    RangeAfter = Selection.createRange();
                    RangeAfter.moveStart('character', text.length);
                    RangeAfter.moveEnd('character', this.options.charsAround);
                    textAfter = RangeAfter.text;
                } else {
                    text += "";
                }

                if (text.replace(/\s/, '').length == 0) {
                    return;
                } else if (text.length > this.options.maxTextLen) {
                    this.showWarning(this.options.messages.tooBig);
                    return;
                }

                text = this.clearSpaces(text);
                textBefore = this.clearSpaces(textBefore);
                textAfter = this.clearSpaces(textAfter);

                textBefore = textBefore.replace(/^\S{1,10}\s+/, "");
                textAfter = textAfter.replace(/\s+\S{1,10}$/, "");

                var cntLeadingSpaces = text.match(/^(\s*)/)[0].length;
                var cntTrailingSpaces = text.match(/(\s*)$/)[0].length;
                textBefore = textBefore + text.substring(0, cntLeadingSpaces);
                textAfter = text.substring(text.length - cntTrailingSpaces, text.length) + textAfter;
                text = text.substring(cntLeadingSpaces, text.length - cntTrailingSpaces);

                return {
                    text_before: textBefore,
                    text: text,
                    text_after: textAfter
                };

            } catch (e) {
                return null;
            }
        },

        showDialog: function() {
            var Plugin = this;
            var options = this.options;

            var text = Plugin.selection.text_before +
                '<b style="color:#ff6150">' + Plugin.selection.text + '</b>' +
                Plugin.selection.text_after;

            if (!Plugin.dialogBox) {
                Plugin.dialogBox = Plugin.render('main', {
                    title: options.messages.title,
                    description: options.messages.description,
                    commentInfo: options.messages.commentInfo
                });

                var buttons = {};
                buttons[options.messages.sendButton] = function() {
                    var report = Plugin.selection;
                    report['comment'] = $('input', Plugin.dialogBox).val();

                    if (typeof options.transformReport == 'function') {
                        report = options.transformReport.call(Plugin, report);
                    }

                    $.ajax({
                        url: options.sendUrl,
                        type: 'POST',
                        data: report,
                        success: function(response) {
                            Plugin.dialogBox.dialog("close");
                            if (typeof options.onSuccess == 'function') {
                                options.onSuccess.call(Plugin, response);
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            Plugin.dialogBox.dialog("close");
                            if (typeof options.onError == 'function') {
                                options.onError.call(Plugin, jqXHR, textStatus, errorThrown);
                            }
                        }
                    });
                };
                buttons[options.messages.cancelButton] = function() {
                    Plugin.dialogBox.dialog("close");
                };

                Plugin.dialogBox.dialog({
                    width: options.dialogWidth,
                    height: options.dialogHeight,
                    modal: true,
                    buttons: buttons,
                    open: function() {
                        $('.ui-dialog-buttonpane button:eq(0)', $(this).parent()).focus();
                    },
                    autoOpen: false
                });
            } else if (Plugin.dialogBox.dialog("isOpen")) {
                return;
            }

            $('input', Plugin.dialogBox).val('');
            $('.text', Plugin.dialogBox).html(text);
            Plugin.dialogBox.dialog("open");
        },

        showWarning: function(message) {
            this.showMessage(this.options.messages.warning, message);
        },

        showInfo: function(message) {
            this.showMessage(this.options.messages.info, message);
        },

        showError: function(message) {
            this.showMessage(this.options.messages.error, message);
        },

        showMessage: function(title, message) {
            var messageBox = this.render('message', {
                title: title,
                message: message
            });
            messageBox.dialog({
                buttons: {
                    OK: function() {
                        messageBox.dialog("close");
                    }
                }
            });
        },

        clearSpaces: function(text) {
            return ("" + text).replace(/[\s]+/g, " ");
        },

        render: function(templateName, params) {
            var template = this.options.templates[templateName];
            if (template) {
                for (var placeholder in params) {
                    if (params.hasOwnProperty(placeholder)) {
                        var value = params[placeholder];
                        var replace = '{' + placeholder + '}';
                        template = template.replace(new RegExp(replace, 'g'), value);
                    }
                }

                return $(template);
            }
        }
    };

    $[pluginName] = function(options) {
        if (!$.data(document, "plugin_" + pluginName)) {
            $.data(document, "plugin_" + pluginName, new Plugin(options));
        }
    };

})(jQuery, window, document);