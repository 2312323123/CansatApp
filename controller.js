let port
let socket
let pongs = 0


$('#wsConnect').click(function() {
  port = $('#wsPort').val()
  connect()
})

$('#ping').click(function() {
  if(socket != null)
    socket.send("ping")
})

$('#connection').css("background-color", '#dc3545')
connect()

function connect() {
  if(socket != null) {
    socket.close()
    pongs = 0
    $('#pong').html(`PONGS: ${pongs}`)
    $('#connection').css("background-color", '#dc3545')
  }

  socket = new WebSocket(`ws://${port || 'localhost:80'}`);

  socket.onopen = function(e) {
    $('#connection').css("background-color", '#2edd40')
    socket.send("ping");
  };

  socket.onmessage = function(event) {
    let data = JSON.parse(event.data)
    if(JSON.parse(event.data) == 'pong') {
      pongs++
      $('#pong').html(`PONGS: ${pongs}`)
    } else {
      console.log('received data')
      onData(data)
    }
  };

  socket.onclose = function(event) {
    $('#connection').css("background-color", '#dc3545') // '#dc3545' #2edd40;
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
    pongs = 0
    $('#pong').html(`PONGS: ${pongs}`)
  };

  socket.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };
}

function updateBig() {
  bTemp.update();
  bPres.update();
  bHum.update();
  $('#lost').html("lost: " + lost)
  if(lat != null)
    $('#lat').html("lat: " + lat)
  if(long != null)
    $('#long').html("long: " + long)
  if(last != null)
    $('#last').html('last: ' + last + 's ago')

  if(bigTempData.last() != null)
    $('#temperature').html('temperature: ' + bigTempData.last().y + "°C")
  if(bigPresData.last() != null)
    $('#pressure').html('pressure: ' + bigPresData.last().y + " hPa")
  if(bigHumData.last() != null)
    $('#humidity').html('humidity: ' + bigHumData.last().y + "%")
}

/* $('body').click(function() {
  onData(JSON.stringify({sig: {pl: 12.21}, temp: Math.random(), pres: Math.random() + 10, hum: Math.random() + 20, gps: {lat: "lat", long: "long"}}))
}) */

setTimeout(interval, 250)

function interval() {
  let time = Date.now() - littleChartsTime
  let l = lastPackets.length
  for(let i=0; i < l; i++) {
    if(lastPackets[0] < time)
      lastPackets.shift()
  }
  l = smallTempDataShow.length
  for(let i=0; i < l; i++) {
    if(smallTempDataShow[0].t < time)
      smallTempDataShow.shift()
  }
  l = smallPresDataShow.length
  for(let i=0; i < l; i++) {
    if(smallPresDataShow[0].t < time)
      smallPresDataShow.shift()
  }
  l = smallHumDataShow.length
  for(let i=0; i < l; i++) {
    if(smallHumDataShow[0].t < time)
      smallHumDataShow.shift()
  }

  if(last != null)
    last = parseFloat((Date.now() - lastTime) / 1000).toFixed(1)
  updateSmall()
  setTimeout(interval, 250)
}

function updateSmall() {
  if(last != null)
    $('#last').html('last: ' + last + 's ago')
  $('#packets').html('packets: ' + lastPackets.length)
  sTemp.update();
  sPres.update();
  sHum.update();
}

function updateAlt(sentAlt) {
  let time = Date.now()
  $('#alt').html(`alt: ${parseFloat(sentAlt).toFixed(1)}m`)
  if(sentAlt > maxAlt) {
    maxAlt = sentAlt
    $('#maxAlt').html(`max alt: ${parseFloat(alt).toFixed(1)}m`)
  }
  if(lastAltTime) {
    $('#desc').html(`desc: ${parseFloat((alt - sentAlt) / ((time - lastAltTime) / 1000)).toFixed(1)}m/s`)
  }
  lastAltTime = time
  alt = sentAlt
}

$('#startRecording').click(function() {
  if(calculatep0()) {
    phase = 2
    $('#startRecordingContainer').css('background-color', '#28a745')
    $('#startRecording').text('RECORDING HAS STARTED')
  }
  if(lat && long) {
    addToMapLocations()
  }
})
function calculatep0() {
  if(p0 == undefined)
    if(bigTempData.last() && bigPresData.last()) {
      console.log('calculating p0!')
      trueh0 = h0
      h0 = 0
      p0 = bigPresData.last() * Math.pow(1 - (trueh0 * 0.0065 / (bigTempData.last() + 273.15 + trueh0 * 0.0065)), -5.257)
      return true
    }
  return false
}

$(document).keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  // console.log(keycode)
  if(keycode == '45'){ // -
    h0 -= 5
    redrawBig = true
  }
  if(keycode == '61'){ // =
    h0 += 5
    redrawBig = true
  }
  if(keycode == '91'){ // [
    h0 -= 1
    redrawBig = true
  }
  if(keycode == '93'){ // ]
    h0 += 1
    redrawBig = true
  }
});