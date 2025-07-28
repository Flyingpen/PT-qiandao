# 🏴‍☠️ PT-sign-V3.js  
> 让签到像海盗抢滩一样——稳、准、还带点骚！

---

## 🎬 前情提要
你是否也每天：

- 打开十几个 PT 站 → 登录 → 找到签到按钮 → 点击 → 关闭标签页  
- 日复一日，手指抽搐，眼神涣散，怀疑人生

现在，把这套「流水线」打包进 **青龙面板**，让脚本替你打工！  
PT-sign-V3.js 用 200 行不到的代码，给你 **全自动、可并发、带通知、还能看热闹** 的签到体验。

---

## 🧰 功能亮点

| 特性 | 说明 | emoji |
|---|---|---|
| **多站并发** | Promise.all 一把梭，签到速度取决于你家网速 | ⚡ |
| **失败重试** | 站点抽风？自动三连重试，不抛弃不放弃 | 🔄 |
| **花式通知** | 支持 Server 酱、PushPlus、Telegram、钉钉、Bark…… | 📢 |
| **日志即八卦** | 签到成功/失败/奖励金币，全写进青龙日志，吃瓜必备 | 🍉 |
| **极简配置** | 一条 cookie 一个站，复制粘贴即可 | 🍔 |

---

## 📦 安装三步曲

### 1️⃣ 把脚本塞进青龙
```bash
# SSH 进青龙容器
docker exec -it qinglong bash

# 下载脚本
curl -fsSL https://raw.githubusercontent.com/Flyingpen/PT-sign/77b5d55bc2fd54acc281b0014928f032814e70f0/PT-sign-V3.js \
  -o /ql/scripts/PT-sign-V3.js
```

### 2️⃣ 安装依赖（一分钟搞定）
```bash
cd /ql/scripts
pnpm add axios https-proxy-agent
# 没装 pnpm？npm i -g pnpm 先！
```

### 3️⃣ 配置环境变量
在青龙面板 → 配置文件 → `extra.sh` 末尾追加：

```bash
# 例：配置 3 个站
export PT_SITE_1="hdchina:你的cookie1"
export PT_SITE_2="hdcity:你的cookie2"
export PT_SITE_3="ssd:你的cookie3"

# 通知渠道（任选其一）
export PT_SIGN_NOTIFY="serverChan"     # 或 pushplus / telegram / dingtalk / bark
export PT_SIGN_SCKEY="SCTxxxxx"        # Server 酱 SendKey
```

> 想配更多站？`PT_SITE_4`、`PT_SITE_5`… 一直往下加，脚本会自动识别。

---

## 🍪 如何抓 Cookie（以 Chrome 为例）

1. 登录 PT 站  
2. F12 → Application → Cookies → 复制整段 `Cookie:` 请求头  
   例：  
   ```
   c_lang_folder=cn; c_secure_uid=MTIzNDU2; c_secure_pass=abcdefg...
   ```
3. 按 `站点名:完整cookie` 的格式填到环境变量即可。

---

## 🕹️ 手动跑一次试试

```bash
cd /ql/scripts
node PT-sign-V3.js
```

看到日志里出现：

```
[HDChina] ✅ 签到成功，获得 88 魔力值
[HDCity] ✅ 签到成功，连续 7 天！
[SSD] ❌ 今天已签到，别卷了
```

就说明脚本在认真打工了！

---

## ⏰ 定时任务（青龙面板）

- 名称：`PT 每日签到`
- 命令：`node /ql/scripts/PT-sign-V3.js`
- 定时：`0 9 * * *`  （每天 9 点，避开高峰）

---

## 🛠️ 高阶玩法

| 需求 | 做法 |
|---|---|
| **代理访问** | 在脚本最上方加两行：<br>`process.env.HTTP_PROXY="http://127.0.0.1:7890"`<br>`process.env.HTTPS_PROXY="http://127.0.0.1:7890"` |
| **自定义重试次数** | 环境变量追加 `export PT_SIGN_RETRY=5` |
| **日志分级** | `export PT_SIGN_LOG_LEVEL=debug` （默认 info） |

---

## 🐞 常见问题 FAQ

Q1：**cookie 失效怎么办？**  
> 重新抓 cookie，覆盖环境变量，重启青龙即可。

Q2：**通知收不到？**  
> 检查 `PT_SIGN_NOTIFY` 拼写是否正确，以及对应 token 是否有效。

Q3：**不想全部站点跑？**  
> 临时禁用某站：把环境变量改个名，如 `PT_SITE_2_DISABLED="hdcity:..."`

---

## 🏁 结尾彩蛋
如果脚本帮到了你，不妨去 GitHub 点个小 ⭐，或者在博客记录折腾过程——  
**打工不止眼前的签到，还有 Star 和远方！**

---

> 代码开源，快乐无价。  
> 祝各位永远不断签、永不被 HR！
