# 拉灯登录 · Light Lamp Login

参考用户提供的[清忧@凡辰视频](https://www.douyin.com/video/7630650993453190452)，将原有不完整灯具改为悬挂式表情灯：暖橙灯罩、右侧拉绳、下照光束、同色发光登录卡片。

## 使用

直接打开 `index.html`，或运行：

```sh
python3 -m http.server 8875 --bind 127.0.0.1
```

打开 http://127.0.0.1:8875 。旧入口 `New folder/index2.html` 会跳转到新版。

## 交互

- 向下拉动绳端超过 28 个设计像素，松手切换开关，绳子弹回。
- 点击绳端，或聚焦后按 Enter / 空格，也能开关灯。
- 每次重新开灯，依次切换 12 种配色：暖橙、冷蓝、珊瑚、薄荷绿、薰衣草紫、樱花粉、青绿、青柠、蜜桃、樱桃红、香槟金、冰蓝，灯罩、拉绳、卡片和按钮联动。
- 眼睛跟随鼠标，独立眨眼；输入密码时看向一边，校验失败时有表情和轻微摇头。
- 关灯时隐藏表单并移出键盘交互区域；保留视频中的柔和环境光束。
- 支持手机尺寸、Pointer Events 拖动及系统减少动态效果设置。

这是前端交互演示，没有真实账号服务，不存储或发送账号密码。

## 文件与测试

- `index.html`：页面入口
- `style.css`：布局、十二套灯光配色、响应式和素材遮罩
- `lamp.js`：拉绳弹簧、开关、眼神和表单状态
- `assets/`：本地灯罩、光束素材及 Lucide 图标
- `tests/lamp.test.cjs`：拖动阈值、取消、单次开关、回弹、键盘、配色循环、隐私状态及减少动态效果回归测试
- `design-qa.md`：视觉校对说明

```sh
node tests/lamp.test.cjs
node --check lamp.js
```

运行不依赖 GSAP、MorphSVG 或外部 CDN。字体采用系统中文字体。

## 来源与素材

原仓库为 [CorescriptStudio/Light-Lamp-Login-Form](https://github.com/CorescriptStudio/Light-Lamp-Login-Form)（原用户名 kumailhassan989），保留全部历史。本版按用户提供的视频重做，未取得视频作者的源工程，因此不宣称逐像素或逐帧一致。

灯罩、光束使用内置 ImageGen 根据视频截图生成。灯罩 RGB 素材通过 CSS 遮罩使用，光束为纯黑底图片，通过 screen 混合叠加。提示和处理方式记录于 `assets/README.md`。

圆形、笑嘴、线条图标来自 Lucide 0.468.0，按 ISC 许可证使用，详见 `assets/LICENSE-lucide.txt`。眼球填色和嘴部 viewBox 由源图标适配。
