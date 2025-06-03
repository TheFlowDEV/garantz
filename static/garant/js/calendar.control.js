var date = {
    'calendar_prav': new Date(),
    'calendar_nal': new Date(),
    'calendar_stat': new Date()
};

var currentTab = $("#calendar .tab-pane.active").prop('id');

var calendar = $("#calendar");

calendar.on('click', "#calendar_prev", function(e) {
    currentTab = $("#calendar .tab-pane.active").prop('id');
    date[currentTab].setMonth(date[currentTab].getMonth() - 1);
    changeCalendar(date[currentTab].getMonth(), date[currentTab].getFullYear());
    e.preventDefault();
    return false;
});

calendar.on('click', "#calendar_next", function(e) {
    currentTab = $("#calendar .tab-pane.active").prop('id');
    date[currentTab].setMonth(date[currentTab].getMonth() + 1);
    changeCalendar(date[currentTab].getMonth(), date[currentTab].getFullYear());
    e.preventDefault();
    return false;
});

function changeCalendar(month, year) {
    currentTab = $("#calendar .tab-pane.active").prop('id');
    $.ajax({
        url: '/ajax/calendar/get/',
        data: {
            'month': month,
            'year': year,
            'type': currentTab
        }
    }).success(function(response) {
        var html = response.split('|')[1];
        $("#calendar .tab-pane#" + currentTab).html(html);
    })
}

$("#calendar .tabs a").click(function() {
    currentTab = $("#calendar .tab-pane.active").prop('id');
});