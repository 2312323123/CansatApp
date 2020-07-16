if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

let mapLocations // TO FINISH
let mapLocationsShow // [3] = time
let allData = [] // TO FINISH

/* [{d: *data*, t: *time*}, {d: *data*, t: *time*}] */
let bigTempData = []
let bigTempDataShow = []
let bigPresData = []
let bigPresDataShow = []
let bigHumData = []
let bigHumDataShow = []
let smallTempDataShow = []
let smallPresDataShow = []
let smallHumDataShow = []

let actualTemp // TO FINISH
let actualPres // TO FINISH
let actualHum // TO FINISH

let lastPackets = [] // TEN RZECZ MA SIE ROBIC W UPDATEVIEW, KTORY MA SIE ROBIC CO SEKUNDE, DO UPDATE LENGTH
let lastTime

let last // TODO
let lost = 0 // TO FINISH (VIEW ONLY)
let lat = 0 // TODO
let long = 0 // TODO
let alt = 0 // TODO
let maxAlt = 0 // TODO
let descRate = 0 // TODO

let minTime
let maxTime
let littleChartsTime = 10000 // applies to lastpackets as well
alert("time set for little charts and last packets: " + littleChartsTime)

let phase = 1 // 1 - przed recording, 2 - recording
let p0
let trueh0


/* load allData from storage */
/* allData = localStorage.getItem('data') // [[{*data*}, timestamp], [{*data*}, timestamp]]

if(allData == null)
  allData = []
else
  allData = JSON.parse(allData)

for(let entity of allData) {
  let time = entity[1]
  if(entity[0].temp != null) {
    bigTempData.push({d: entity[0].temp, t: time})
    bigPresData.push({d: entity[0].pres, t: time})
    bigHumData.push({d: entity[0].hum, t: time})
  }
}

actualTemp = bigTempData.last() ? bigTempData.last() : 0
actualPres = bigPresData.last() ? bigPresData.last() : 0
actualHum = bigHumData.last() ? bigHumData.last() : 0
lost = allData.last()[0].sig.pl

bigTempDataShow = bigTempData
bigPresDataShow = bigPresData
bigHumDataShow = bigHumData */



/* load mapLocations from storage */
/* let mapLocations = localStorage.getItem('map') // [[{*data*}, timestamp], [{*data*}, timestamp]]

if(mapLocations == null)
  mapLocations = [
    0,
    [], // gory
    [], // BaliceDaleko
    [], // Niepołomice
    [], // Rząska
    [], // Leszno
    []  // Carbon
  ]
else
  mapLocations = JSON.parse(mapLocations) */



/* onData */
function onData(myData, timeIn=0) {
  let time
  if(timeIn) {
    time = timeIn
  } else
    time = Date.now()
  allData.push([myData, time])

  lost = myData.sig.pl
  lastPackets.push(time)
  lastTime = time

  // UPDATE MAP LOCATIONS TUTAJ JAKOS ZROB ALBO W INSERT DATA

  /*
  let data = [{"t":1594752544646,"y":"51.008"},{"t":1594752544801,"y":"94.067"}]
  */
  /*
  {sig: {pc: packetCount, pl: packetsLost, junk: junk}, temp: 123, pres: 123, hum: 123}
  {sig: {pc: packetCount, pl: packetsLost, junk: junk}, gps: {lat: 123, long: 123}}
  */

  for(const property in myData) {
    switch(property) {
      case 'temp':
        bigTempData.push({t: time, y: myData[property].toFixed(1)})
        smallTempDataShow.push({t: time, y: myData[property].toFixed(1)})
        break;
      case 'pres':
        bigPresData.push({t: time, y: myData[property].toFixed(3)})
        smallPresDataShow.push({t: time, y: myData[property].toFixed(3)})
        break;
      case 'hum':
        bigHumData.push({t: time, y: myData[property].toFixed(0)})
        smallHumDataShow.push({t: time, y: myData[property].toFixed(0)})
        break;
      case 'gps':
        lat = myData[property].lat
        long = myData[property].long
        /*if(phase != 1)
          updateCansatPosAndSaveItAsWell(lat, long, bigPresData.last()) */
          /* JUST NOT YET */
        break;
    }
  }

  if(minTime && myData.temp && myData.pres && myData.hum) {
    if(maxTime) {
      if(time > minTime && time < maxTime) {
        insertData(myData, time)
      }
    } else if(time > minTime) {
      insertData(myData, time)
    }
  } else if(maxTime) {
    if(time < maxTime) {
      insertData(myData, time)
    }
  } else {
    insertData(myData, time)
  }

  last = 0
  updateBig() // controller
  updateSmall()
}
function insertData(data, time) {
  bigTempDataShow.push({t: time, y: parseFloat(data.temp).toFixed(1)})
  bigPresDataShow.push({t: time, y: parseFloat(data.pres).toFixed(3)})
  bigHumDataShow.push({t: time, y: parseFloat(data.hum).toFixed(0)})
}
/* function updateCansatPosAndSaveItAsWell(lat, long, press) {
  let R = Math.pow(p0 / press, 1 / 5.257)
  let newDeltaHeight = ((R - 1) * (bigTempData.last() + 273.15) * 2000 / 13 - trueh0)
  this.setState({deltaHeight: newDeltaHeight})

  for(let i = 1; i < mapLocations.length; i++)
    mapLocations[i].push([
      map(this.state._long, imageSettings[i].longMin, imageSettings[i].longMax, 0, imageSettings[i].imgw),
      map(this.state._lat, imageSettings[i].latMin, imageSettings[i].latMax, imageSettings[i].imgh, 0),
      imageSettings[i].ppm * (this.state.deltaHeight + this.trueh0)
    ])

  let t = new Date().getTime()
  if(this.lastTime && this.lastDeltaHeight)
    this.setState({_fallingSpeed: ((newDeltaHeight - this.lastDeltaHeight) * 1000 / (t - this.lastTime)).toFixed(6)})
  this.lastTime = t
  this.lastDeltaHeight = newDeltaHeight
} */ /* JUST NOT YET */



/* timeValidate */
function timeValidate() {
  bigTempDataShow = bigTempData.filter(fitsInTime)
  bigPresDataShow = bigPresData.filter(fitsInTime)
  bigHumDataShow = bigHumData.filter(fitsInTime)
  mapLocationsShow = mapLocations.filter(mapFitsInTime)
}
function fitsInTime(value) {
  if(minTime && maxTime)
    return (value.t >= minTime && value.t <= maxTime)
  else if(minTime)
    return value.t >= minTime
  else if(maxTime)
    return value.t <= maxTime
  else
    return true
}
function mapFitsInTime(value) {
  if(minTime && maxTime)
    return (value[3] >= minTime && value.t <= maxTime)
  else if(minTime)
    return value[3] >= minTime
  else if(maxTime)
    return value[3] <= maxTime
  else
    return true
}


/* save to storage */
function close() {
  localStorage.setItem('data', JSON.stringify(allData))
  localStorage.setItem('map', JSON.stringify(mapLocations))
}

/* $( window ).unload(function() {
  console.log('I am the 1st one.');
  localStorage.setItem('data', 'heh');
}); */

let clear = false

$('#clearStorage').click(function() {
  if(confirm("Do you really want to clear browser localStorage?")) {
    alert("lol")
    clear = true
    localStorage.clear()
  }
})

window.addEventListener('load', (event) => {
  allData = JSON.parse(localStorage.getItem('data'))
  if(allData == null)
    allData = []
  let oldData = allData
  for(let entity of oldData) {
    console.warn("hehe")
    console.log(oldData)
    onData(entity[0], entity[1])
  }
});

window.addEventListener('unload', function(event) {
  if(clear === false)
    localStorage.setItem('data', JSON.stringify(allData));
});