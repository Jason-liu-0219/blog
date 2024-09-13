---
sticky: 3
---
# 如何在 HTML 輸入框中實現自動跳轉與自動加 Dash 功能

這篇文章介紹了如何在表單輸入框中實現兩種功能：
1. 在多個輸入框之間自動跳轉，根據使用者輸入來自動移動光標。
2. 在一個輸入框中，輸入一定字數後自動添加 Dash（`-`）符號。

這些功能非常適合用於處理序列號、信用卡號碼等需要格式化的表單輸入情境。

## 頁面結構與 CSS 樣式

頁面包含一個包含多個輸入框的區塊和一個單一輸入框。使用者可以在這些輸入框中輸入數字或字母，並且會自動進行跳轉或添加 Dash。

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        input:not(#auto-dash) {
            width: 30px;
        }
    </style>
</head>

<body>
    <section class="dashed-nodes">
        <input maxlength="4" />-
        <input maxlength="4" />-
        <input maxlength="4" />-
        <input maxlength="4" />
    </section>
    <input maxlength="19" id="auto-dash" value="" />
</body>

</html>
```
## JavaScript 功能實現
### 方法一：多輸入框自動跳轉
該方法監聽每個輸入框的鍵盤事件，根據使用者的按鍵來決定是否跳轉到下一個或上一個輸入框。

```javascript
const dashedNodesInputDoms = document.querySelectorAll('.dashed-nodes input');
dashedNodesInputDoms.forEach((input, index) => {
    input.addEventListener('keydown', alphaAndNuberValidate);
    input.addEventListener('keyup', (event) => keyBoardToNextInput(event, index));
    input.addEventListener('input', (event) => autoToNextInput(event, index));
});

function alphaAndNuberValidate(event) {
    if (!/[a-zA-Z0-9]/g.test(event.key)) {
        event.preventDefault();
        return;
    }
}

function keyBoardToNextInput(event, index) {
    const input = event.target;
    const keyboardKey = event.key;
    const prevInput = dashedNodesInputDoms[index - 1];
    const nextInput = dashedNodesInputDoms[index + 1];
    const isPreMoveKey = keyboardKey === 'ArrowLeft' || keyboardKey === 'Backspace'

    if (isPreMoveKey && input.selectionStart === 0 && prevInput) {
        prevInput.focus();
        return;
    }

    if (keyboardKey === 'ArrowRight' && input.selectionStart === input.value.length && nextInput) {
        nextInput.focus();
        return;
    }
}

function autoToNextInput(event, index) {
    const input = event.target;
    const nextInput = dashedNodesInputDoms[index + 1];

    if (input.value.length === 4 && nextInput) {
        nextInput.focus();
        return;
    }
}

```

1. alphaAndNuberValidate: 只允許字母或數字輸入，阻止其他字符的輸入。
2. keyBoardToNextInput: 根據鍵盤的左右箭頭或刪除鍵，決定光標是否應該跳到上一個或下一個輸入框。
3. autoToNextInput: 當輸入框填滿 4 個字符時，光標自動跳轉到下一個輸入框。

### 方法二：單一輸入框自動添加 Dash
此方法會自動在使用者輸入 4 個字符後插入一個 Dash（-）。無論使用者是手動輸入還是複製粘貼，都會正確格式化輸入。

```
const autoDashInputDom = document.querySelector('#auto-dash');
autoDashInputDom.addEventListener('keydown', dashValidate);
autoDashInputDom.addEventListener('keyup', replaceValue);

function dashValidate(event) {
    if (event.key === '-') {
        event.preventDefault();
        return;
    }
}

function replaceValue(event) {
    const input = event.target;
    const notDashString = input.value.replace(/-/g, '');
    const isDeleteKey = event.key === 'Backspace'
    let newValue = '';

    if (isDeleteKey) {
        return;
    }

    for (let i = 0; i < notDashString.length; i++) {
        const isAddDash = (i + 1) % 4 === 0 && i < notDashString.length - 1
        newValue += notDashString[i];
        if (isAddDash) {
            newValue += '-';
        }
    }

    input.value = newValue;
}
```

1. dashValidate: 當使用者按下 - 時，阻止默認行為，避免手動輸入 Dash。
2. replaceValue: 每輸入 4 個字符後，自動在字符串中插入一個 Dash，並更新輸入框的值。

## 結論

透過這篇文章，我們實現了兩種不同的輸入框控制方式，分別是：
1. 在多個輸入框中自動跳轉，幫助使用者快速輸入序列號。
2. 在單個輸入框中，根據輸入內容自動添加格式字符（如 Dash）。

這些技術非常實用，可以讓表單輸入更加高效且符合格式要求。