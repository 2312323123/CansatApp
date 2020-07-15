if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

let mapLocations // TO FINISH
let mapLocationsShow // [3] = time
let allData // TO FINISH

/* [{d: *data*, t: *time*}, {d: *data*, t: *time*}] */
let temperature = []
let showTemperature = []
let pressure = []
let showPressure = []
let humidity = []
let showHumidity = []

let actualTemp // TO FINISH
let actualPres // TO FINISH
let actualHum // TO FINISH
let rssi = 0 // TODO
let snr = 0 // TODO
let packetsInLast10Seconds = 0 // TODO
let lastPackets = [] // TE DWIE RZECZY MAJA SIE ROBIC W UPDATEVIEW, KTORY MA SIE ROBIC CO SEKUNDE
let last = 0 // TODO
let lost = 0 // TO FINISH (VIEW ONLY)
let lat = 0 // TODO
let long = 0 // TODO
let alt = 0 // TODO
let maxAlt = 0 // TODO
let descRate = 0 // TODO

let minTime // ZROB ZEBY DOBRY TIMEZONE W TYCH INPUTACH BYL
let maxTime

let phase = 1 // 1 - przed recording, 2 - recording
let p0
let trueh0


/* load allData from storage */
allData = localStorage.getItem('data') // [[{*data*}, timestamp], [{*data*}, timestamp]]

if(allData == null)
  allData = []
else
  allData = JSON.parse(allData)

for(let entity of allData) {
  let time = entity[1]
  if(entity[0].temp != null) {
    temperature.push({d: entity[0].temp, t: time})
    pressure.push({d: entity[0].pres, t: time})
    humidity.push({d: entity[0].hum, t: time})
  }
}

actualTemp = temperature.last() ? temperature.last() : 0
actualPres = pressure.last() ? pressure.last() : 0
actualHum = humidity.last() ? humidity.last() : 0
lost = allData.last()[0].sig.pl

showTemperature = temperature
showPressure = pressure
showHumidity = humidity



/* load mapLocations from storage */
let mapLocations = localStorage.getItem('map') // [[{*data*}, timestamp], [{*data*}, timestamp]]

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
  mapLocations = JSON.parse(mapLocations)



/* onData */
function onData(data) {
  let time = Date.now()
  let myData = JSON.parse(data)
  allData.push([data, time])

  lost = myData.sig.pl
  lastPackets.push(time)

  // UPDATE MAP LOCATIONS TUTAJ JAKOS ZROB ALBO W INSERT DATA


  for(const property in data) {
    switch(property) {
      case 'temp':
        temperature.push(data[property])
        break;
      case 'pres':
        pressure.push(data[property])
        break;
      case 'hum':
        humidity.push(data[property])
        break;
      case 'gps':
        lat = data[property].lat
        long = data[property].long
        /*if(phase != 1)
          updateCansatPosAndSaveItAsWell(lat, long, pressure.last()) */
          /* JUST NOT YET */
        break;
    }
  }

  if(minTime) {
    if(maxTime) {
      if(time > minTime && time < maxTime) {
        insertData(data)
      }
    } else if(time > minTime) {
      insertData(data)
    }
  } else if(maxTime) {
    if(time < maxTime) {
      insertData(data)
    }
  } else {
    insertData(data)
  }
}
function insertData(data) {
  showTemperature.push(data.temp)
  showPressure.push(data.pres)
  showHumidity.push(data.hum)
}
/* function updateCansatPosAndSaveItAsWell(lat, long, press) {
  let R = Math.pow(p0 / press, 1 / 5.257)
  let newDeltaHeight = ((R - 1) * (temperature.last() + 273.15) * 2000 / 13 - trueh0)
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
  showTemperature = temperature.filter(fitsInTime)
  showPressure = pressure.filter(fitsInTime)
  showHumidity = humidity.filter(fitsInTime)
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