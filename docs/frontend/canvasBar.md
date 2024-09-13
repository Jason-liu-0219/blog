# 在 HTML5 Canvas 上實現可縮放的時間軸
這篇文章將介紹如何使用 HTML5 Canvas 實現一個可縮放、可互動的時間軸。這個時間軸可以顯示當前時間，並允許使用者通過滑鼠操作來查看不同的時間點。

頁面結構與 CSS 樣式
我們將建立一個包含 ```<canvas>``` 元素的頁面，用於繪製時間軸，並使用一個 ```<input>``` 元素來控制時間軸的縮放比例。

### HTML 結構


```html
<!DOCTYPE html>
<html lang="zh-tw">
<head>
    <meta charset="UTF-8">
    <title>時間軸</title>
</head>
<body>
    <main>
        <canvas id="SeekBar" width="1024" height="90"></canvas>
        <div class="controls">
            <label for="zoomControl">縮放比例:</label>
            <input type="range" id="zoomControl" min="1" max="100" value="100">
        </div>
    </main>
</body>
</html>
```

### CSS 樣式

```css
* {
    padding: 0;
    margin: 0;
    color: #ffffff;
}

body {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #2E2E2E;
}

main {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

canvas {
    cursor: pointer;
    border: 1px solid #2b2f33;
    background-color: #2b2f33;
}

.controls {
    margin-top: 10px;
}
```

### JavaScript 功能實現
核心功能由 JavaScript 實現，我們將代碼組織為多個類別，以提高可讀性和可維護性。

BaseEventHandle 類別
這個類別用於優化事件處理。我們可以在子類中定義 _handle_eventType 方法，來處理特定的事件。

```javascript
class BaseEventHandle {
    handleEvent(event) {
        const type = `_handle_${event.type}`;
        if (this[type]) {
            this[type](event);
        }
    }
}
```

CanvasUtils 工具類別
CanvasUtils 提供了一些通用的工具方法，例如格式化時間、獲取滑鼠位置和清除畫布。

```javascript
class CanvasUtils {
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const pad = num => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
               `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    static getCursorPosition(canvas, event) {
        return event.clientX - canvas.getBoundingClientRect().left;
    }

    static clearCanvas(context, width, height) {
        context.clearRect(0, 0, width, height);
    }
}
```


CanvasDrawer 繪圖類別
CanvasDrawer 專注於在畫布上繪製各種形狀和文字。

```javascript
class CanvasDrawer {
    static drawLine(context, xStart, yStart, xEnd, yEnd, color, width) {
        context.beginPath();
        context.moveTo(xStart, yStart);
        context.lineTo(xEnd, yEnd);
        context.strokeStyle = color;
        context.lineWidth = width;
        context.stroke();
    }

    static drawCircle(context, x, y, radius, color) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
    }

    static drawRect(context, x, y, width, height, color) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }

    static drawText(context, text, x, y, fillStyle, font, textAlign = 'center') {
        context.fillStyle = fillStyle;
        context.font = font;
        context.textAlign = textAlign;
        context.fillText(text, x, y);
    }
}
```

SeekBar 時間軸類別
SeekBar 是核心類別，負責時間軸的繪製和互動。

```javascript
class SeekBar extends BaseEventHandle {
    constructor() {
        super();
        this.canvas = document.getElementById('SeekBar');
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.totalHours = 24;
        this.startTimestamp = Date.now() - 12 * 60 * 60 * 1000;
        this.currentTimestamp = Date.now();

        this.render();

        this.canvas.addEventListener('click', this);
        this.canvas.addEventListener('mousemove', this);
    }

    render() {
        this.drawBackground();
        this.drawTimeMarkers();
        this.drawCenterLine();
        this.drawMiddleTime();
    }

    drawMiddleTime() {
        CanvasDrawer.drawText(
            this.context,
            CanvasUtils.formatTime(this.currentTimestamp),
            this.canvasWidth / 2,
            55,
            "#fff",
            "12px Arial"
        );
    }

    drawTimeMarkers() {
        const pixelsPerHour = this.canvasWidth / this.totalHours;
        const middleTime = new Date(this.currentTimestamp);
        const middleHour = middleTime.getHours();
        const middleMinute = middleTime.getMinutes();
        const offsetX = (middleMinute / 60) * pixelsPerHour;

        for (let i = -Math.floor(this.totalHours / 2); i <= Math.floor(this.totalHours / 2); i++) {
            const x = this.canvasWidth / 2 + i * pixelsPerHour - offsetX;
            const hour = (middleHour + i + 24) % 24;
            CanvasDrawer.drawLine(this.context, x, 0, x, 20, "#fff", 1);
            CanvasDrawer.drawText(this.context, `${hour}:00`, x, 35, "#fff", "12px Arial");
        }
    }

    drawBackground() {
        CanvasDrawer.drawRect(this.context, 0, 65, this.canvasWidth, 20, '#2a86ff');
    }

    drawCenterLine() {
        CanvasDrawer.drawLine(
            this.context,
            this.canvasWidth / 2,
            0,
            this.canvasWidth / 2,
            this.canvasHeight,
            "#2a86ff",
            2
        );
        const originRadius = 5;
        CanvasDrawer.drawCircle(this.context, this.canvasWidth / 2, originRadius, originRadius, '#2a86ff');
        const centerCircleRadius = 3;
        CanvasDrawer.drawCircle(this.context, this.canvasWidth / 2, originRadius, centerCircleRadius, '#000');
    }

    _handle_click(event) {
        const cursorX = CanvasUtils.getCursorPosition(this.canvas, event);
        const msPerPx = (this.totalHours * 3600 * 1000) / this.canvasWidth;
        const clickTime = this.currentTimestamp + (cursorX - this.canvasWidth / 2) * msPerPx;
        this.setTimeToMiddle(clickTime);
    }

    setTimeToMiddle(time) {
        this.currentTimestamp = time;
        this.startTimestamp = time - (this.totalHours * 60 * 60 * 1000) / 2;
        CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
        this.render();
    }

    _handle_mousemove(event) {
        const cursorX = CanvasUtils.getCursorPosition(this.canvas, event);
        CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
        CanvasDrawer.drawLine(this.context, cursorX, 0, cursorX, this.canvasHeight, "#fff", 1);
        this.render();
    }

    handleZoom(event) {
        const zoomValue = event.target.value;
        this.totalHours = 24 * (zoomValue / 100);
        CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
        this.render();
    }
}

const SeekBarInstance = new SeekBar();
const zoomControl = document.getElementById('zoomControl');
zoomControl.addEventListener('input', SeekBarInstance.handleZoom.bind(SeekBarInstance));
```

### 完整程式碼
以下是完整的 HTML、CSS 和 JavaScript 程式碼。

```html
<!DOCTYPE html>
<html lang="zh-tw">
<head>
    <meta charset="UTF-8">
    <title>時間軸</title>
    <style>
        * {
            padding: 0;
            margin: 0;
            color: #ffffff;
        }

        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #2E2E2E;
        }

        main {
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        canvas {
            cursor: pointer;
            border: 1px solid #2b2f33;
            background-color: #2b2f33;
        }

        .controls {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <main>
        <canvas id="SeekBar" width="1024" height="90"></canvas>
        <div class="controls">
            <label for="zoomControl">縮放比例:</label>
            <input type="range" id="zoomControl" min="1" max="100" value="100">
        </div>
    </main>

    <script>
        // 優化代理 event 事件使用
        class BaseEventHandle {
            handleEvent(event) {
                const type = `_handle_${event.type}`;
                if (this[type]) {
                    this[type](event);
                }
            }
        }

        // 工具類別，包含通用的工具方法
        class CanvasUtils {
            /**
             * 格式化時間戳記為 YYYY-MM-DD HH:MM:SS 格式
             * @param {number} timestamp - 時間戳記
             * @returns {string} 格式化後的時間字串
             */
            static formatTime(timestamp) {
                const date = new Date(timestamp);
                const pad = num => num.toString().padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                       `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            }

            /**
             * 獲取滑鼠在畫布上的位置
             * @param {HTMLCanvasElement} canvas - 畫布元素
             * @param {MouseEvent} event - 滑鼠事件
             * @returns {number} 滑鼠在畫布上的 x 座標
             */
            static getCursorPosition(canvas, event) {
                return event.clientX - canvas.getBoundingClientRect().left;
            }

            /**
             * 清除畫布
             * @param {CanvasRenderingContext2D} context - 畫布上下文
             * @param {number} width - 畫布寬度
             * @param {number} height - 畫布高度
             */
            static clearCanvas(context, width, height) {
                context.clearRect(0, 0, width, height);
            }
        }

        // 畫布繪製類別，負責在畫布上繪製圖形
        class CanvasDrawer {
            /**
             * 在畫布上畫一條線
             * @param {CanvasRenderingContext2D} context - 畫布上下文
             * @param {number} xStart - 起點 x 座標
             * @param {number} yStart - 起點 y 座標
             * @param {number} xEnd - 終點 x 座標
             * @param {number} yEnd - 終點 y 座標
             * @param {string} color - 線條顏色
             * @param {number} width - 線條寬度
             */
            static drawLine(context, xStart, yStart, xEnd, yEnd, color, width) {
                context.beginPath();
                context.moveTo(xStart, yStart);
                context.lineTo(xEnd, yEnd);
                context.strokeStyle = color;
                context.lineWidth = width;
                context.stroke();
            }

            /**
             * 在畫布上畫一個圓
             * @param {CanvasRenderingContext2D} context - 畫布上下文
             * @param {number} x - 圓心 x 座標
             * @param {number} y - 圓心 y 座標
             * @param {number} radius - 圓半徑
             * @param {string} color - 圓顏色
             */
            static drawCircle(context, x, y, radius, color) {
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI);
                context.fillStyle = color;
                context.fill();
            }

            /**
             * 在畫布上畫一個矩形
             * @param {CanvasRenderingContext2D} context - 畫布上下文
             * @param {number} x - 矩形的 x 座標
             * @param {number} y - 矩形的 y 座標
             * @param {number} width - 矩形的寬度
             * @param {number} height - 矩形的高度
             * @param {string} color - 矩形的顏色
             */
            static drawRect(context, x, y, width, height, color) {
                context.fillStyle = color;
                context.fillRect(x, y, width, height);
            }

            /**
             * 在畫布上畫文字
             * @param {CanvasRenderingContext2D} context - 畫布上下文
             * @param {string} text - 要繪製的文字
             * @param {number} x - 文字的 x 座標
             * @param {number} y - 文字的 y 座標
             * @param {string} fillStyle - 填充樣式
             * @param {string} font - 字體樣式
             * @param {string} [textAlign='center'] - 文字對齊方式
             */
            static drawText(context, text, x, y, fillStyle, font, textAlign = 'center') {
                context.fillStyle = fillStyle;
                context.font = font;
                context.textAlign = textAlign;
                context.fillText(text, x, y);
            }
        }

        // 負責時間軸的邏輯和互動
        class SeekBar extends BaseEventHandle {
            constructor() {
                super();
                this.canvas = document.getElementById('SeekBar');
                this.context = this.canvas.getContext('2d');
                this.canvasWidth = this.canvas.width;
                this.canvasHeight = this.canvas.height;
                this.totalHours = 24;
                this.startTimestamp = Date.now() - 12 * 60 * 60 * 1000;
                this.currentTimestamp = Date.now();

                this.render();

                this.canvas.addEventListener('click', this);
                this.canvas.addEventListener('mousemove', this);
            }

            /**
             * 初始化畫布
             */
            render() {
                this.drawBackground();
                this.drawTimeMarkers();
                this.drawCenterLine();
                this.drawMiddleTime();
            }

            /**
             * 在畫布中間顯示當前時間
             */
            drawMiddleTime() {
                CanvasDrawer.drawText(
                    this.context,
                    CanvasUtils.formatTime(this.currentTimestamp),
                    this.canvasWidth / 2,
                    55,
                    "#fff",
                    "12px Arial"
                );
            }

            /**
             * 繪製時間標記，每小時一條線
             */
            drawTimeMarkers() {
                const pixelsPerHour = this.canvasWidth / this.totalHours;
                const middleTime = new Date(this.currentTimestamp);
                const middleHour = middleTime.getHours();
                const middleMinute = middleTime.getMinutes();
                const offsetX = (middleMinute / 60) * pixelsPerHour;

                for (let i = -Math.floor(this.totalHours / 2); i <= Math.floor(this.totalHours / 2); i++) {
                    const x = this.canvasWidth / 2 + i * pixelsPerHour - offsetX;
                    const hour = (middleHour + i + 24) % 24;
                    CanvasDrawer.drawLine(this.context, x, 0, x, 20, "#fff", 1);
                    CanvasDrawer.drawText(this.context, `${hour}:00`, x, 35, "#fff", "12px Arial");
                }
            }

            /**
             * 繪製背景
             */
            drawBackground() {
                CanvasDrawer.drawRect(this.context, 0, 65, this.canvasWidth, 20, '#2a86ff');
            }

            /**
             * 繪製中心線和中心點
             */
            drawCenterLine() {
                CanvasDrawer.drawLine(
                    this.context,
                    this.canvasWidth / 2,
                    0,
                    this.canvasWidth / 2,
                    this.canvasHeight,
                    "#2a86ff",
                    2
                );
                const originRadius = 5;
                CanvasDrawer.drawCircle(this.context, this.canvasWidth / 2, originRadius, originRadius, '#2a86ff');
                const centerCircleRadius = 3;
                CanvasDrawer.drawCircle(this.context, this.canvasWidth / 2, originRadius, centerCircleRadius, '#000');
            }

            /**
             * 處理點擊事件，將點擊位置的時間設置為中間時間
             * @param {MouseEvent} event - 滑鼠事件
             */
            _handle_click(event) {
                const cursorX = CanvasUtils.getCursorPosition(this.canvas, event);
                const msPerPx = (this.totalHours * 3600 * 1000) / this.canvasWidth;
                const clickTime = this.currentTimestamp + (cursorX - this.canvasWidth / 2) * msPerPx;
                this.setTimeToMiddle(clickTime);
            }

            /**
             * 設置中間時間並重新初始化畫布
             * @param {number} time - 中間時間的時間戳記
             */
            setTimeToMiddle(time) {
                this.currentTimestamp = time;
                this.startTimestamp = time - (this.totalHours * 60 * 60 * 1000) / 2;
                CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
                this.render();
            }

            /**
             * 處理滑鼠移動事件，顯示滑鼠位置的垂直線
             * @param {MouseEvent} event - 滑鼠事件
             */
            _handle_mousemove(event) {
                const cursorX = CanvasUtils.getCursorPosition(this.canvas, event);
                CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
                CanvasDrawer.drawLine(this.context, cursorX, 0, cursorX, this.canvasHeight, "#fff", 1);
                this.render();
            }

            /**
             * 處理縮放事件，根據縮放比例調整總小時數並重新初始化畫布
             * @param {Event} event - 縮放事件
             */
            handleZoom(event) {
                const zoomValue = event.target.value;
                this.totalHours = 24 * (zoomValue / 100);
                CanvasUtils.clearCanvas(this.context, this.canvasWidth, this.canvasHeight);
                this.render();
            }
        }

        const SeekBarInstance = new SeekBar();
        const zoomControl = document.getElementById('zoomControl');
        zoomControl.addEventListener('input', SeekBarInstance.handleZoom.bind(SeekBarInstance));
    </script>
</body>
</html>
```

### 結論
透過上述的步驟，我們成功地在 HTML5 Canvas 上實現了一個可縮放的時間軸。這個時間軸具有互動性，使用者可以點擊任意位置來查看不同的時間，並通過縮放控制來調整時間範圍。

希望這篇文章對您有幫助！
