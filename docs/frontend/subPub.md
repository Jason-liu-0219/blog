---
sticky: 1
---
# 使用 JavaScript 建立事件管理系統 (Broker)

在這篇文章中，我將分享一個使用 JavaScript 實現的簡單事件管理系統。該系統稱為 `Broker`，類似於事件總線（Event Bus）或消息代理，用於不同模塊之間的事件訂閱與廣播。

## 什麼是 Broker？

`Broker` 是一個管理事件的類別，允許我們在不同的模塊之間傳遞訊息。它的主要功能有：
- **事件訂閱**：模塊可以訂閱特定事件，並在該事件觸發時接收數據。
- **事件發布**：當某事件發生時，發布該事件給所有訂閱者。
- **事件取消訂閱**：可以選擇取消特定事件的訂閱，避免後續接收該事件。

## 代碼實現

首先，我們來看看 `Broker` 類別的主要功能實現。

```javascript
const Broker = class {
    constructor(name) {
        this.name = name; // 模塊名稱
        this.init();
    }

    // 靜態變量，用來存儲所有的訂閱事件
    static subscribesMap = new Map();

    // 初始化模塊的訂閱列表
    init() {
        if (!Broker.subscribesMap.has(this.name)) {
            Broker.subscribesMap.set(this.name, []); // 每個模塊都有一個獨立的訂閱列表
        }
    }

    // 訂閱事件
    subscribe(eventName, callback) {
        const subscribeEvents = Broker.subscribesMap.get(this.name);
        subscribeEvents.push({ name: eventName, callback }); // 將事件和回調加入列表
        return { unsubscribe: () => Broker.unsubscribe(this.name, eventName) }; // 提供取消訂閱的方法
    }

    // 發布事件
    publish(eventName, data) {
        const subscribeEvents = Broker.subscribesMap.get(this.name);
        subscribeEvents.forEach(event => {
            if (event.name === eventName) {
                event.callback && event.callback(data); // 執行對應的回調函數
            }
        });
    }

    // 靜態方法，取消訂閱指定事件
    static unsubscribe(name, eventName) {
        if (!Broker.subscribesMap.has(name)) {
            return;
        }
        const subscribeEvents = Broker.subscribesMap.get(name).filter(subscribe => subscribe.name !== eventName);
        Broker.subscribesMap.set(name, subscribeEvents); // 過濾掉要取消的事件
    }

    // 靜態方法，廣播事件給所有模塊
    static broadcast(eventName, data) {
        Broker.subscribesMap.forEach(subscribeList => {
            subscribeList.forEach(event => {
                if (event.name === eventName) {
                    event.callback && event.callback(data); // 執行回調函數
                }
            });
        });
    }
}
```

## 以下是一些示例展示如何使用 Broker 來進行事件訂閱、發布以及取消訂閱。

```javascript
// 創建不同的事件通道
let channelCamera = new Broker('camera');
let channelNvr = new Broker('nvr');

// Camera 通道訂閱 'online' 事件
channelCamera.subscribe('online', (data) => {
    console.log(`Camera is online with data:`, data);
});

// NVR 通道訂閱 'online' 事件
let cameraOnlineHandle = channelNvr.subscribe('online', (data) => {
    console.log(`NVR is online with data:`, data);
});

// 發布 camera 通道的 'online' 事件
channelCamera.publish('online', { test: 1 }); // 僅 Camera 會收到該事件

// 取消 NVR 的 'online' 事件訂閱
cameraOnlineHandle.unsubscribe(); // NVR 取消訂閱

// 廣播 'online' 事件，所有未取消訂閱的模塊都會收到該事件
Broker.broadcast('online', { globalTest: 123 }); // Camera 會收到該事件，NVR 不會
```


## 總結

Broker 類提供了一個簡單但強大的事件訂閱和發布系統，適用於模塊間的消息傳遞。透過這個系統，我們可以靈活地管理事件、訂閱和廣播，讓不同模塊之間進行高效的數據通信。

希望這篇文章能幫助你理解如何使用 JavaScript 來實現事件管理的功能！如果有任何問題，歡迎在評論區留言討論。