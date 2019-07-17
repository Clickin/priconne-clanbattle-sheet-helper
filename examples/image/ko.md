# 프리코네 클랜배틀 구글시트 입력기 한국어 사용법
템플릿 시트 주소: [링크](https://docs.google.com/spreadsheets/d/1EWZFHY1QPzJJTGdvOByrV6NpJ30DY-aT_kpHCBzMy0Y/edit?usp=sharing)

입력기 주소: [링크](https://grimm-priconne.herokuapp.com)

**공유 요청 누르지 마시고**, 구글 로그인후 파일 > 사본 만들기로 계정 드라이브에 복사해주세요. 
## 권한 설정
처음 들어가면 이런 화면이 나옵니다.(모바일은 다를 수 있습니다.)

![최초](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/first.png)

오른쪽 위 초록색 공유 버튼을 눌러서 시트를 업데이트할 유저의 계정을 입력해주세요. 만약 수정 권한을 주지 않으면, 오류가 발생합니다.

![수정권한](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/share.png)
## 보스 이름 및 해당 색 지정
![색지정](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/reference.png)

색지정 시트에서 2번 보스 이름 열(B2:B6)에 보스 이름을 입력해줍니다. 보스 정보를 불러올 때 여기에 입력된 문자열을 가지고 옵니다.

기본적으로 지정된 색이 마음에 안드시면 1번 보스 번호 열의 칸 색을 바꿔서 전체 적용이 가능합니다. 단, 이미 입력된 로그의 색은 바뀌지 않습니다.

## 템플릿 설명
![템플릿](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/content.png)

**날짜별 템플릿** 시트를 복사해서 M월N일의 형태로 이름을 바꿔주세요.

2번 이름 열에 클랜원 이름을 넣어주면 자동으로 맨앞 한글자를 따서 1번 약자 열에 들어갑니다. 단, **약자가 겹치면 안됩니다.** 겹치는 경우 적절히 수정해주세요.

만약 겹치는 경우를 제대로 수정하지 않을 시, **데이터가 중복되어 들어갈 수 있습니다.**

3번 레벨 열은 성장확인을 위해 넣었습니다. 현재 버전에서는 레벨을 입력하지 않을 시 입력기가 제대로 동작하지 않기 때문에, **반드시 입력해주세요.**

4번 비고 열에는 해당 유저의 특이사항을 적습니다. 막타정보, 불가피하게 참여율이 저조한 이유 등등 자유롭게 적으시면 됩니다.(수동기입)

## 시트 예시
![예시](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/example.png)
6월에 사용했던 시트라 현재 버전과 약간 다를 수 있지만, 이런 식으로 클랜원 딜에 보스별 다른 색깔이 입혀져서 나옵니다.

## 입력기 웹사이트 사용법
모바일 및 PC에서 사용가능합니다. 양쪽 다 사용법에 차이는 없으므로 모바일 페이지 기준으로 설명합니다.

![index](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/index.png)

웹사이트에 접속하면 이런 페이지가 뜹니다. 구글 제약사항으로 구글 계정으로 로그인해야지만 시트를 수정할 수 있기 때문에, 반드시 로그인하셔야 합니다.

![login](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/login.png)

브라우저에 이미 로그인되어있을 경우, 목록에 나오는 계정에서 선택하시면 됩니다. 아닐 경우, 다른 계정 사용을 눌러 로그인해주세요.

![input](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/input.png)

입력 페이지입니다. 다운로드 버튼 왼쪽 시트 url 입력란에 사용중인 시트 url을 입력해주세요. 한번 입력하면 브라우저 캐시를 지우기 전까진 저장됩니다.

날짜를 입력하고싶은 날짜로 맞추어주세요. < 버튼은 어제로, > 버튼은 오늘로 날짜를 변경합니다. 날짜 기본값은 5시를 기준 다음날로 넘어갑니다.

url 입력란 오른쪽 다운로드 버튼을 누르시면 시트에 있는 정보를 불러옵니다. **정보를 불러오지 않으면 시트에 업로드가 불가능합니다.**

![upload](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/image/ko/upload.png)

시트에 있는 보스 목록과 마지막 입력을 불러오면 적용할 보스를 선택해줍니다. 예시에서는 니들크리퍼를 선택했습니다.

보스를 선택했으면 로그를 베껴쓸때 사용할 방향을 선택해줍니다. 기본값은 위에서부터 아래로 내려가는 방식입니다.
로그를 밑에서부터 위로 스크롤하고싶으면 오른쪽의 아래에서 위 버튼을 선택해주세요.

방향을 선택했으면 로그를 스크롤하며 입력란에 예시처럼 한줄당 하나씩 베껴써주면 됩니다.
막타를 친 유저의 경우 대미지 숫자 다음에 빈칸을 띄우고 격파, 막타, 기타등등 아무 문자나 써주시면 비고란에 n타 XXX 격파 정보가 들어갑니다.

마지막으로 맨 밑 업로드 버튼을 누르면 잠시 후 시트에 입력됩니다.
