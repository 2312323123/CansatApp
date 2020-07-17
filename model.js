if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

const map = (n, start1, stop1, start2, stop2) => (n - start1) / (stop1 - start1) * (stop2 - start2) + start2

let mapLocations = [] // TO FINISH
let mapLocationsShow = []
let allData = []

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
let actualHum

let lastPackets = []
let lastTime

let last
let lost = 0
let lat = 0 // TODO
let long = 0 // TODO
let alt = 0 // TODO
let maxAlt = 0 // TODO
let descRate = 0 // TODO

let minTime
let maxTime
let littleChartsTime = 10000 // applies to lastpackets as well

let phase = 1 // 1 - przed recording, 2 - recording
let p0
let h0 = 0
let trueh0 = 0
let lastAltTime


/* load allData from storage */
allData = localStorage.getItem('data') // [[{*data*}, timestamp], [{*data*}, timestamp]]

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
bigHumDataShow = bigHumData



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
        posX = map(long, imageSettings[actualIndex].longMin, imageSettings[actualIndex].longMax, 0, imageSettings[actualIndex].imgw)
        posY = map(lat, imageSettings[actualIndex].latMin, imageSettings[actualIndex].latMax, imageSettings[actualIndex].imgh, 0)
        posZ = (alt + trueh0 + h0) * imageSettings[actualIndex].ppm
        redrawSmall = true
        if(phase != 1)
          addToMapLocations()
          redrawBig = true
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
  let oldData = [...allData]
  oldData.sort((e1,e2) => e1[1] - e2[1])
  for(let entity of oldData) {
    onData(entity[0], entity[1])
  }
  
  mapLocations =  JSON.parse(localStorage.getItem('map'))
  if(mapLocations == null)
    mapLocations = []

  alert(`time set for little charts and last packets: ${littleChartsTime / 1000}s`)
});

/* window.addEventListener('unload', function(event) {
  if(clear === false) {
    localStorage.setItem('data', JSON.stringify(allData));
    localStorage.setItem('map', JSON.stringify(mapLocations));
  }
}); */

function reloadMapLocationsShow() {
  mapLocationsShow = mapLocations.map(locationToShow)
  mapLocationsShow = mapLocationsShow.filter(function (el) {
    return el != null;
  });
  redrawBig = true
}
function locationToShow(obj) {
  if(obj.long > imageSettings[actualIndex].longMin && obj.long < imageSettings[actualIndex].longMax && obj.lat > imageSettings[actualIndex].latMin && obj.lat < imageSettings[actualIndex].latMax && fitsInTime(obj.t)) {
    return [
      map(obj.long, imageSettings[actualIndex].longMin, imageSettings[actualIndex].longMax, 0, imageSettings[actualIndex].imgw),
      map(obj.lat, imageSettings[actualIndex].latMin, imageSettings[actualIndex].latMax, imageSettings[actualIndex].imgh, 0),
      obj.alt * imageSettings[actualIndex].ppm
    ]
  }
  return null
}

function addToMapLocations() {
  let time = Date.now()
  let R = Math.pow(p0 / bigPresData.last(), 1 / 5.257)
  let newDeltaHeight = ((R - 1) * (bigTempData.last() + 273.15) * 2000 / 13 - trueh0)
  updateAlt(newDeltaHeight)

  mapLocations.push({
    lat: lat,
    long: long,
    alt: alt,
    t: time
  })

  if(long > imageSettings[actualIndex].longMin && long < imageSettings[actualIndex].longMax && lat > imageSettings[actualIndex].latMin && lat < imageSettings[actualIndex].latMax && fitsInTime(time)) {
    mapLocationsShow.push([
        map(long, imageSettings[actualIndex].longMin, imageSettings[actualIndex].longMax, 0, imageSettings[actualIndex].imgw),
        map(lat, imageSettings[actualIndex].latMin, imageSettings[actualIndex].latMax, imageSettings[actualIndex].imgh, 0),
        alt * imageSettings[actualIndex].ppm
    ])
  }
}

/* JUST NOT YET */
/*
function startRecording() {
  if(this.calculatep0()) {
    this.phase = 2
    this.setState({recordingLocations: true})
  }
}
function calculatep0() { // only use in startRecording
  if(this.p0 === undefined)
    if(this.state._temperature && this.state._pressure) {
      console.log('calculating p0!')
      settrueh0(this.trueh0 = this.h0)
      seth0(this.h0 = 0)
      this.p0 = this.state._pressure * Math.pow(1 - (this.trueh0 * 0.0065 / (this.state._temperature + 273.15 + this.trueh0 * 0.0065)), -5.257)
      this.setState({p0: this.p0})
      return true
    }
  return false
}

function updateCansatPosAndSaveItAsWell(long, lat, press) {
  let R = Math.pow(this.state.p0 / this.state._pressure, 1 / 5.257)
  let newDeltaHeight = ((R - 1) * (this.state._temperature + 273.15) * 2000 / 13 - this.trueh0)
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
}

function myEventHandler(e) {
  // console.log(e.keyCode);
  if(!e.repeat) {
    let keyCode = e.keyCode;
    if (keyCode == 49)
      this.selectPanel(0)
    if (keyCode == 50)
      this.selectPanel(1)
    if (keyCode == 51)
      this.selectPanel(2)
  }
  switch(e.key) {
    case '-':
      seth0(this.h0 -= 5)
      break;
    case '=':
      seth0(this.h0 += 5)
      break;
    case '[':
      seth0(this.h0 -= 1)
      break;
    case ']':
      seth0(this.h0 += 1)
      break;
    case '\\':
      alert(`starting height: ${this.trueh0 === 0? this.h0 : this.trueh0}`)
      break;
    case 'o':
      alert(`h0: ${this.h0}`)
      break;
    case 'p':
      alert(`deltaHeight: ${this.state.deltaHeight}`)
      break;
  }
}

case 'gps':
  this.update._lat = myObj[property]['lat']
  this.update._long = myObj[property]['long']
  if(this.phase !== 1)
    this.updateCansatPosAndSaveItAsWell(this.update._long, this.update._lat, this.state._pressure)
  break;

  
  <P5Wrapper
  sketch={bigMap}
  mapNumber={this.mapNumber}
  width={window.innerWidth * 0.65}
  height={window.innerHeight}
  long={this.state._long}
  lat={this.state._lat}
  altitude={this.state.deltaHeight + this.trueh0}/>
</div>



mapLocations[i].push([
  map(this.state._long, imageSettings[i].longMin, imageSettings[i].longMax, 0, imageSettings[i].imgw),
  map(this.state._lat, imageSettings[i].latMin, imageSettings[i].latMax, imageSettings[i].imgh, 0),
  imageSettings[i].ppm * (this.state.deltaHeight + this.trueh0)
]) */
