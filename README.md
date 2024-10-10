# dialog

Simple dialog message

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/darainfo/dara-dialog/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/dara-dialog.svg)](https://img.shields.io/npm/v/dara-dialog)
![npm](https://img.shields.io/npm/dt/dara-dialog)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/dara-dialog)](https://bundlephobia.com/package/dara-dialog)


<p>
<img src="https://github.com/darainfo/dara-dialog/blob/main/dialogDemo.gif?raw=true"/>
</p>


## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)  
--- | --- | --- | --- | --- |  
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |  


# build
```
npm run build

```

# 사용방법
```
var dialogObj = new Dialog({
    title: 'dialog', width: 500, height: 'auto', icon: "info", isModal: true, resizable: true, autoOpen: false, template: '<a href="https://varsql.com" target="_blank">링크 이동</a>', buttons: [
    {
        label: 'ok', styleClass: "info", callback: function (e) {
            alert('ok')
        }
    }
    , {
        label: 'Cancel', callback: function (e) {
            dialogObj.hide();
        }
    }
    ], afterOpen: function () {
        console.log('after open')
    }
});
```
  

# dialog 옵션
| key | 설명 | 기본값 | 옵션값 |
|-----|------|-----|-----|
| width | 넓이 | 400 |  |
| height | 높이 | 300 |  |
| styleClass | css class | |  |
| isModal |모달 사용여부  | false |  |
| icon | icon |  | primary, secondary, info, success, warning, danger |
| autoOpen | 자동 열기 여부 | true |  |
| draggable | drag 가능여부 | true |  |
| resizable | 창 리사이즈 여부  | false |  |
| enableHeader | 헤더 영역 보일지 여부  | true |  |
| enableFooter | 하단 버튼 영역 보일지 여부  | true |  |
| enableMaxButton | 최대화 버튼 | true |  |
| enableCloseButton | 닫기 버튼 활성화 여부  | true |  |
| minHeight | 최소 높이 | 130 |  |
| minWidth | 최소 넓이 | 230 |  |
| zIndex | css z-index | 10000 |  |
| dragOverflow | darg 창 넘어서 drag 할지 여부 | true |  |
| buttons | dialog 하단 버튼 | [] |  |
| moveDelay | drag delay time  | 15 |  |
| afterOpen | 오픈후 발생할 이벤트 | false |  |


# dialog button 옵션
| key | 설명 | 기본값 | 옵션값 |
|-----|------|-----|-----|
| label |  버튼명 |  '' |  |
| callback |  클릭시 callback |   |  |

```