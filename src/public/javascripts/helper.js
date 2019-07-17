//variables
let sheetUrl = document.getElementById('sheetUrl')
let damageList = document.getElementById('list')
let bossSelect = document.getElementById('boss')
let targetDate = document.getElementById('targetDate')
let order = document.getElementById('upward').checked == true ? 'upward' : 'downward'
let lastValue = document.getElementById('lastValue')
let hidden = document.getElementById('hidden')


//localforage restore url
localforage.getItem('url')
.then((value) => {
  sheetUrl.value = value
})
.catch(function(err) {
  // This code runs if there were any errors
  console.log(err);
});

//Event Listener

sheetUrl.addEventListener('blur', e => {
  localforage.setItem('url', sheetUrl.value)
})


//Functions

function getInfo() {
  M.toast({html: "정보 받아오는중..."})
  axios({
    method: 'get',
    url: '/oauth/info',
    params: {
      sheetUrl: sheetUrl.value,
      targetDate: targetDate.value
    }
  })
  .then(function (res) {
    if (res.data.lastValue !== undefined) {
      lastValue.innerHTML = '마지막 입력: ' + res.data.lastValue
    }
    if (res.data.bossArr !== undefined) {
      for (let i = 0; i < res.data.bossArr.length; i++) {
        bossSelect.options[i+1].innerText = res.data.bossArr[i][1]
        bossSelect.options[i+1].value = res.data.bossArr[i][0]
      }
      M.FormSelect.init(bossSelect)
    }
    
    if (res.data.message[0] == "받아오기 완료") {
      hidden.value = 'true'
    }
    for(let node of res.data.message) {
      M.toast({html: node})
    }
  })
  .catch(function (error) {
    console.error(error)
  });
}

function setDateToday() {
  targetDate.value = moment().format('YYYY-MM-DD')
}

function setDateYesterday() {
  targetDate.value = moment().subtract(1, 'days').format('YYYY-MM-DD')
}

function check() {
  if (moment(targetDate.value).isAfter(new moment())) {
    M.toast({html: '날짜가 이상합니다'})
    return false
  }
  if (new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(sheetUrl) === undefined) {
    M.toast({html: 'url을 제대로 입력하세요'})
    return false
  }
  if (hidden.value === false || bossSelect.selectedIndex === 0) {
    M.toast({html: '정보를 다운로드해주세요'})
    return false
  }
  if (damageList.value === '') {
    M.toast({html: '딜량을 입력해주세요'})
    return false
  }
  return true
}

function sendData() {
  M.toast({html: "전송중..."})
  axios({
    method: 'post',
    url: '/oauth/upload',
    data: {
      sheetUrl: sheetUrl.value,
      targetDate: targetDate.value,
      damageList: damageList.value,
      order: order,
      boss: {
        ref: bossSelect.selectedIndex,
        name: bossSelect.options[bossSelect.selectedIndex].innerText
      }
    }
  })
  .then(function (res) {
    M.toast({html: res.data.message})
  })
  .catch(function (error) {
    console.error(error)
  });
}

function submit() {
  if (check()) {
    sendData()
  }
}