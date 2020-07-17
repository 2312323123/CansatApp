let dayMin = moment().startOf('day').valueOf()
let hourMin
let dayMax = moment().startOf('day').valueOf()
let hourMax

let ctx2 = document.getElementById('sTemp').getContext('2d');
let ctx3 = document.getElementById('sPres').getContext('2d');
let ctx4 = document.getElementById('sHum').getContext('2d');
let ctx5 = document.getElementById('bTemp').getContext('2d');
let ctx6 = document.getElementById('bPres').getContext('2d');
let ctx7 = document.getElementById('bHum').getContext('2d');
let sTemp
let sPres
let sHum
let bTemp
let bPres
let bHum

let actualPanel = 1


/* UI + DIVMETER */
let meter = new Divmeter({
    height: '100px',
    element: document.getElementById('divergence')
});
// meter.time('2014-01-11T01:12:59.371Z');

$('.datepickermin').pickadate({
    onSet:function(context) {
        dayMin = context.select
        if(hourMin) {
            minTime = dayMin + hourMin
            resetCharts()
        }
    }
});
$('.timepickermin').pickatime({
    interval: 1,
    onSet:function(context) {
        hourMin = context.select * 60000
        if(dayMin) {
            minTime = dayMin + hourMin
            resetCharts()
        }
    }
});
$('.datepickermax').pickadate({
    onSet:function(context) {
        dayMax = context.select
        if(hourMax) {
            maxTime = dayMax + hourMax
            resetCharts()
        }
    }
});
$('.timepickermax').pickatime({
    interval: 1,
    onSet:function(context) {
        hourMax = context.select * 60000
        if(dayMax) {
            maxTime = dayMax + hourMax
            resetCharts()
        }
    }
});

$("#settingsContainer").collapse('hide')
let settingsHidden = true
$('#settingsButton').click(function() {
    if(settingsHidden) 
        $("#settingsContainer").collapse('hide')
    else
        $("#settingsContainer").collapse('show')
    settingsHidden = !settingsHidden
})


/* WYKRESY */

$('#bigMap').hide()
$('.switch').on('change.bootstrapSwitch', function () {
    $('#map2d').toggle()
    $('#bigMap').toggle()
    // console.log("switched")
});





/* $("body").click(function(){
    sTemp.update();
    sPres.update();
    sHum.update();
    bTemp.update();
    bPres.update();
    bHum.update();
}) */

$("#chart0").click(function(){
    bigPlot(1)
    redrawBig = true
    redrawSmall = true
})
$("#chart1").click(function(){bigPlot(5)})
$("#chart2").click(function(){bigPlot(6)})
$("#chart3").click(function(){bigPlot(7)})

function bigPlot(number) {
    switch(number) {
        case 1:
            $("#bigMapp").show();
            $("#bTemp").hide();
            $("#bPres").hide();
            $("#bHum").hide();
        break;
        case 5:
            $("#bigMapp").hide();
            $("#bTemp").show();
            $("#bPres").hide();
            $("#bHum").hide();
        break;
        case 6:
            $("#bigMapp").hide();
            $("#bTemp").hide();
            $("#bPres").show();
            $("#bHum").hide();
        break;
        case 7:
            $("#bigMapp").hide();
            $("#bTemp").hide();
            $("#bPres").hide();
            $("#bHum").show();
        break;
    }
    actualPanel = number
}
bigPlot(1)

Chart.defaults.global.defaultFontColor = '#f8f9fa';


/*
let data = [{"t":1594752544646,"y":"51.008"},{"t":1594752544801,"y":"94.067"}]
*/

resetCharts()

function resetCharts() {
    bigTempDataShow = []
    bigPresDataShow = []
    bigHumDataShow = []

    if(minTime) {
        if(maxTime) { // bez nawiasow
            bigTempDataShow = bigTempData.filter(data => data.t > minTime && data.t < maxTime)
            bigPresDataShow = bigPresData.filter(data => data.t > minTime && data.t < maxTime)
            bigHumDataShow = bigHumData.filter(data => data.t > minTime && data.t < maxTime)
        } else {
            bigTempDataShow = bigTempData.filter(data => data.t > minTime)
            bigPresDataShow = bigPresData.filter(data => data.t > minTime)
            bigHumDataShow = bigHumData.filter(data => data.t > minTime)
        }
    } else if(maxTime) {
        bigTempDataShow = bigTempData.filter(data => data.t < maxTime)
        bigPresDataShow = bigPresData.filter(data => data.t < maxTime)
        bigHumDataShow = bigHumData.filter(data => data.t < maxTime)
    }

    if(sTemp != undefined)
      sTemp.destroy();
    if(sPres != undefined)
      sPres.destroy();
    if(sHum != undefined)
      sHum.destroy();
    if(bTemp != undefined)
      bTemp.destroy();
    if(bPres != undefined)
      bPres.destroy();
    if(bHum != undefined)
      bHum.destroy(); 

    sTemp = new Chart(ctx2, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperature',
                data: smallTempDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                enabled: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });
    sPres = new Chart(ctx3, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Pressure',
                data: smallPresDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                enabled: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });
    sHum= new Chart(ctx4, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Humidity',
                data: smallHumDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                enabled: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });
    bTemp = new Chart(ctx5, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperature',
                data: bigTempDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                intersect: false,
                mode: 'index',
                callbacks: {
                    title: function(tooltipItem, data) {
                        return "Temperature"
                    },
                    label: function(tooltipItem, data) {
                        return moment(tooltipItem.xLabel).format('H:mm:ss') + " <-- time    " +  moment(tooltipItem.xLabel).format('YYYY/MMM/D')
                    },
                    afterLabel: function(tooltipItem, data) {
                        return tooltipItem.yLabel + " <-- value"
                    }
                },
                backgroundColor: '#ffffffaa',
                titleFontSize: 16,
                titleFontColor: '#000',
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });
    bPres = new Chart(ctx6, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Pressure',
                data: bigPresDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                intersect: false,
                mode: 'index',
                callbacks: {
                    title: function(tooltipItem, data) {
                        return "Pressure"
                    },
                    label: function(tooltipItem, data) {
                        return moment(tooltipItem.xLabel).format('H:mm:ss') + " <-- time    " +  moment(tooltipItem.xLabel).format('YYYY/MMM/D')
                    },
                    afterLabel: function(tooltipItem, data) {
                        return tooltipItem.yLabel + " <-- value"
                    }
                },
                backgroundColor: '#ffffffaa',
                titleFontSize: 16,
                titleFontColor: '#000',
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });
    bHum = new Chart(ctx7, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Humidity',
                data: bigHumDataShow,
                backgroundColor: '#ff4136',
                borderColor: '#ff4136',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    },
                    time: {
                        parser: 'x'
                    },
                    labelString: 'Time'
                }]
            },
            tooltips: {
                intersect: false,
                mode: 'index',
                callbacks: {
                    title: function(tooltipItem, data) {
                        return "Humidity"
                    },
                    label: function(tooltipItem, data) {
                        return moment(tooltipItem.xLabel).format('H:mm:ss') + " <-- time    " +  moment(tooltipItem.xLabel).format('YYYY/MMM/D')
                    },
                    afterLabel: function(tooltipItem, data) {
                        return tooltipItem.yLabel + " <-- value"
                    }
                },
                backgroundColor: '#ffffffaa',
                titleFontSize: 16,
                titleFontColor: '#000',
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: false
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                point: {
                    radius: 2
                },
                line: {
                    tension: 0.1 // disables bezier curves
                }
            }
        }
    });

    bigPlot(actualPanel)
    reloadMapLocationsShow()
}