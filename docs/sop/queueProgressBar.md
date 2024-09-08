# 用隊列控制的進度條 (Progress Bar) 

這個範例展示了一個帶有排隊機制的進度條系統，允許任務按照順序執行，並在完成每個進度後繼續執行下一個任務。使用者可以通過不同的按鈕來增加或減少進度，並能隨時停止進度條的運行。

## HTML 結構

進度條的結構是由一個容器元素和一個子元素組成，該子元素表示進度條的活動部分。除了進度條外，還有幾個按鈕用於控制進度條的加減操作。

```html
<div class="progress" id="progress">
    <div class="active"></div>
</div>
<button id="btn10">+10</button>
<button id="btn5">-5</button>
<button id="btn20">+20</button>
<button id="btnX">+X(-30~+30)</button>
<button id="stop">停止</button>
<p id="logBox"></p>
```

### CSS 結構

使用 CSS 來設置進度條的大小、顏色以及動畫效果。當進度條變化時，通過 transform 屬性來控制寬度的縮放。

```css
.progress {
    width: 100%;
    height: 30px;
    background-color: black;
}

.progress .active {
    height: 30px;
    background-color: #0186d1;
    transform: scaleX(0);
    transform-origin: 0;
    transition: transform 1s ease;
}

p {
    word-wrap: break-word;
}

```

### JavaScript 邏輯

核心邏輯是通過 JavaScript 實現的，包含兩個主要類別：PromiseQueue 用來管理任務隊列，AnimationProgressBar 負責管理進度條的狀態和動畫。

### PromiseQueue 類別
這是一個簡單的 Promise 隊列實現，保證任務按順序執行。它的主要功能是：
1. enqueue()：將任務加入隊列。
2. start()：啟動隊列執行。
3. executeNext()：順序執行隊列中的任務，當前一個任務完成後再執行下一個。
4. clear()：清空隊列。
5. log()：記錄當前的任務狀態。

```javascript
class PromiseQueue {
    constructor() {
        this.isRunning = false;
        this.queue = [];
        this.enqueueInfo = [];
        this.dequeueInfo = [];
    }

    enqueue(task) {
        this.queue.push(task);
        this.enqueueInfo.push(task.number);
        this.log();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.executeNext();
        }
    }

    async executeNext() {
        if (this.queue.length > 0 && this.isRunning) {
            const task = this.queue.shift();
            this.dequeueInfo.push(task.number);
            await task.execute();
            this.executeNext();
            this.log();
        } else {
            this.isRunning = false;
        }
    }

    clear() {
        this.queue = [];
        this.enqueueInfo = [];
        this.dequeueInfo = [];
        this.log();
    }

    log() {
        document.querySelector("#logBox").innerText = `
        enqueue: \r${JSON.stringify(this.enqueueInfo)}
        dequeue: \r${JSON.stringify(this.dequeueInfo)}
        `;
    }
}
```

### AnimationProgressBar 類別
AnimationProgressBar 使用 PromiseQueue 來管理動畫的順序執行。其主要功能包括：
1. addProgress()：將進度增減的任務加入隊列並啟動隊列。
2. render()：渲染進度條的變化，使用 transform 來實現動畫效果。
3. stopProgress()：停止進度條的進行，清空隊列。

```javascript
class AnimationProgressBar {
    constructor(dom) {
        this.barDom = dom;
        this.activeBarDom = this.barDom.querySelector('.active');
        this.progress = 0;
        this.queue = new PromiseQueue();
    }

    stopProgress() {
        this.queue.clear();
    }

    addProgress(number) {
        this.queue.enqueue({
            number,
            execute: () => this.render(number)
        });
        this.queue.start();
    }

    render(number) {
        return new Promise(resolve => {
            const currentWidth = this.progress;
            const targetWidth = Math.max(0, Math.min(100, currentWidth + number));
            const scale = targetWidth / 100;

            if (currentWidth === targetWidth) {
                resolve();
                return;
            }

            this.progress = targetWidth;
            this.activeBarDom.style.transform = `scaleX(${scale})`;

            const transitionEndHandler = () => {
                this.activeBarDom.removeEventListener('transitionend', transitionEndHandler);
                resolve();
            };

            this.activeBarDom.addEventListener('transitionend', transitionEndHandler);
        });
    }
}
```

### 使用說明

使用者可以透過按鈕來改變進度條的進度。進度變化會按照隊列順序依次執行，並且可以隨時停止進度條的變化。

```javascript
const barLine = new AnimationProgressBar(document.querySelector('#progress'));

document.getElementById('btn10').addEventListener('click', () => {
    barLine.addProgress(10);
});

document.getElementById('btn5').addEventListener('click', () => {
    barLine.addProgress(-5);
});

document.getElementById('btn20').addEventListener('click', () => {
    barLine.addProgress(20);
});

document.getElementById('btnX').addEventListener('click', () => {
    const randomValue = Math.floor(Math.random() * 61) - 30;
    barLine.addProgress(randomValue);
});

document.getElementById('stop').addEventListener('click', () => {
    barLine.stopProgress();
});
```

### 功能說明
- 進度條更新：每次按下按鈕時，對應的數值會被加到進度條上，並以動畫的形式顯示過程。進度條的寬度限制在 0 到 100 之間。
- 排隊機制：按下不同按鈕後，對應的操作會被排隊，並按照加入順序依次執行，確保動畫不會重疊。
- 停止功能：點擊「停止」按鈕會清空隊列，防止後續操作。

### 總結
這個例子展示了如何使用 JavaScript 和 CSS3 實現一個帶有任務排隊功能的進度條。該系統可以很好地處理按鈕快速點擊時的動畫排隊，並且提供了停止功能讓用戶控制進度更新。這樣的設計適用於需要逐步顯示進度的情況，如文件上傳或數據加載等場景。
