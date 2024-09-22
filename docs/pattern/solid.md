
# SOLID 設計模式
SOLID 設計原則是物件導向設計中的五個基本原則，它們幫助我們建立靈活、可維護且擴展性高的軟體系統。本文將逐一介紹 SOLID 原則，並通過反例與正例來演示如何應用這些原則。

## 1. 單一職責原則（Single Responsibility Principle，SRP）
### 定義：
每個類別應該只有一個變更的原因，換句話說，每個類別應該只負責一項職責。
### 反例（違反 SRP）：
在此範例中，```UserService``` 同時負責用戶邏輯和日誌記錄，這違反了單一職責原則，因為該類別具有多重責任。

```javascript
// UserService 同時處理用戶邏輯和日誌記錄，違反 SRP
class UserService {
  createUser(name) {
    console.log(`User ${name} created.`);
    // 這裡可能還有其他日誌或文件操作邏輯
  }
}

const userService = new UserService();
userService.createUser('Alice');
```

### 正例（遵循 SRP）：
我們將日誌記錄提取到獨立的 ```Logger``` 類中，這樣 ```UserService``` 只專注於處理用戶邏輯，遵循單一職責原則。

```javascript
// Logger 類負責日誌記錄
class Logger {
  log(message) {
    console.log(message);
  }
}

// UserService 只處理與用戶相關的業務邏輯
class UserService {
  constructor(logger) {
    this.logger = logger;
  }

  createUser(name) {
    this.logger.log(`User ${name} created.`);
  }
}

const logger = new Logger();
const userService = new UserService(logger);
userService.createUser('Alice');
```

## 2. 開放封閉原則（Open/Closed Principle，OCP）

### 定義：
軟體實體（類、模組、函數等）應該對擴展開放，但對修改封閉。
### 反例（違反 OCP）：
這裡的 ```calculateArea``` 函數根據形狀類型使用 ```if-else``` 語句進行判斷。如果要支持新的形狀，必須修改現有的代碼，這違反了開放封閉原則

```javascript
// calculateArea 函數依賴具體類型並使用 if-else 判斷，不遵循 OCP
function calculateArea(shape) {
  if (shape.type === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else if (shape.type === "square") {
    return shape.side * shape.side;
  } else {
    throw new Error("Unknown shape type");
  }
}

const circle = { type: "circle", radius: 5 };
const square = { type: "square", side: 4 };

console.log(`Circle area: ${calculateArea(circle)}`);
console.log(`Square area: ${calculateArea(square)}`);
```

### 正例（遵循 OCP）：
我們將形狀抽象為一個 ```Shape``` 基類，並通過繼承來擴展不同形狀的計算方法。這樣當需要添加新的形狀時，只需擴展新類而不需修改現有代碼。
```javascript
class Shape {
  area() {
    throw new Error("This method should be overridden.");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius * this.radius;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  area() {
    return this.side * this.side;
  }
}

function calculateArea(shape) {
  return shape.area();
}

const shapes = [new Circle(5), new Square(4)];
shapes.forEach(shape => console.log(`Area: ${calculateArea(shape)}`));
```

## 3. 里氏替換原則（Liskov Substitution Principle，LSP）
### 定義：
子類應該可以替換其父類並且不會導致應用程序的行為發生改變。
### 反例（違反 LSP）：
鴕鳥不能飛，但它繼承了 Bird 類並覆寫了 fly 方法。這導致子類無法正常替代父類，違反了里氏替換原則。
```javascript
class Bird {
  fly() {
    console.log("Flying");
  }
}

class Ostrich extends Bird {
  // 鴕鳥不能飛，但繼承了 fly 方法，違反 LSP
  fly() {
    throw new Error("Ostrich can't fly");
  }
}

function makeBirdFly(bird) {
  bird.fly();
}

const ostrich = new Ostrich();
makeBirdFly(ostrich); // 錯誤：鴕鳥無法飛
```

### 正例（遵循 LSP）：
為避免違反里氏替換原則，應當將具體行為進行區分，讓只有能飛的鳥類繼承 Bird 類，或採用其他方式處理行為差異
```javascript
class Bird {
  fly() {
    console.log("Flying");
  }
}

class Sparrow extends Bird {
  fly() {
    console.log("Sparrow flying");
  }
}

function makeBirdFly(bird) {
  bird.fly();
}

const sparrow = new Sparrow();
makeBirdFly(sparrow);  // 正常工作
```

## 4. 介面隔離原則（Interface Segregation Principle，ISP）
### 定義：
不應強迫客戶端依賴它們不需要的接口，應該將較大的接口拆分為更小、更專門的接口。

### 反例（違反 ISP）：
```MultiFunctionDevice``` 類強迫客戶端實現所有功能，即使某些客戶端只需要其中的部分功能，如打印或掃描，這違反了介面隔離原則。

```javascript
// MultiFunctionDevice 強迫客戶端實現不需要的方法，違反 ISP
class MultiFunctionDevice {
  print() {
    console.log("Printing document...");
  }

  scan() {
    console.log("Scanning document...");
  }

  fax() {
    console.log("Faxing document...");
  }
}

const mfd = new MultiFunctionDevice();
mfd.print(); // 客戶端可能只需要打印功能
```

### 正例（遵循 ISP）：
我們將功能拆分為更小的類別，讓客戶端只依賴它們需要的功能，這樣每個類別只專注於特定功能，遵循了介面隔離原則。
```javascript
class Printer {
  print() {
    console.log("Printing document...");
  }
}

class Scanner {
  scan() {
    console.log("Scanning document...");
  }
}

class MultiFunctionDevice {
  constructor(printer, scanner) {
    this.printer = printer;
    this.scanner = scanner;
  }

  printAndScan() {
    this.printer.print();
    this.scanner.scan();
  }
}

const printer = new Printer();
const scanner = new Scanner();
const mfd = new MultiFunctionDevice(printer, scanner);
mfd.printAndScan();
```

## 5. 依賴反轉原則（Dependency Inversion Principle，DIP）
### 定義：
高層模組不應依賴低層模組，它們都應依賴於抽象；抽象不應依賴於具體實現，具體實現應依賴於抽象。
### 反例（違反 DIP）：
```Notification``` 類直接依賴具體的 ```EmailService``` 類，這違反了依賴反轉原則。當我們想替換或擴展 ```EmailService``` 時，必須修改 ```Notification``` 類。
```javascript
// Notification 直接依賴具體的 EmailService，違反 DIP
class EmailService {
  sendEmail(message) {
    console.log(`Sending email: ${message}`);
  }
}

class Notification {
  sendNotification(message) {
    const emailService = new EmailService(); // 直接依賴低層模組
    emailService.sendEmail(message);
  }
}

const notification = new Notification();
notification.sendNotification("Welcome!");
```

### 正例（遵循 DIP）：
透過依賴注入，我們將 ```Notification``` 類的具體實現抽象化，這樣高層模組不再依賴低層模組的具體實現，遵循了依賴反轉原則。
```javascript
class EmailService {
  sendMessage(message) {
    console.log(`Sending email: ${message}`);
  }
}

class Notification {
  constructor(messageService) {
    this.messageService = messageService;
  }

  notify(message) {
    this.messageService.sendMessage(message);
  }
}

const emailService = new EmailService();
const notification = new Notification(emailService);
notification.notify("Welcome!");
```

## 總結
SOLID 原則提供了一組指導方針，幫助我們設計出結構清晰、易於擴展且具備高維護性的軟體系統。透過遵循這些原則，我們可以減少耦合、提高代碼的靈活性與可重用性，從而構建更健壯的應用程序。