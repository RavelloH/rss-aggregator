# rss-aggregator

RSS聚合器，将多个rss源(本地或url)聚合在同一个rss中，自动按时间顺序排序并生成三种格式rss，支持github actions自动运行

## 运行效果

![Screenshot_20231111_140617_com termux](https://github.com/RavelloH/rss-aggregator/assets/68409330/aa3edb2d-2210-4631-af81-5925bfb9ffe6)

## 使用

### 本地使用  

在本地使用前，你需要先clone此存储库到本地安装相关依赖

```bash
git clone https://github.com/RavelloH/rss-aggregator
cd rss-aggregator

npm install
```

### 在Github Actions中使用  

本项目内置一个每日更新一次的workflows进程，你可以在`.github/workflows/main.yml`修改它。

你可以fork本仓库，并在仓库设置中启用Workflow

### 配置

你可以在index.js中配置相关生成设置。具体可修改的项目如下：

```js
const rssList = [
    'atom.xml', // Do not delate this. This could keep your history rss.
    // Edit the list below 
    'https://ravelloh.top/feed/atom.xml',
    'https://www.ithome.com/rss/',
    'https://sspai.com/feed'
];

const storagePath = './';
const authorINFO = {
    name: 'RavelloH',
    email: 'ravelloh@outlook.com',
    link: 'https://ravelloh.top/',
};

const feed = new Feed({
    title: "RSS聚合器 - RSS aggregator",
    description: '聚合多种rss源',
    id: 'http://ravelloh.top/',
    link: 'http://ravelloh.top/',
    language: 'zh',
    image: 'https://ravelloh.top/assets/images/avatar.jpg',
    favicon: 'https://ravelloh.top/favicon.ico',
    copyright: `Copyright © 2019 - ${new Date().getFullYear()} RavelloH. All rights reserved.`,
    generator: 'https://github.com/RavelloH/rss-aggregator',
    feedLinks: {
        json: 'https://ravelloh.github.io/rss-aggregator/feed.json',
        atom: 'https://ravelloh.github.io/rss-aggregator/atom.xml',
        rss: 'https://ravelloh.github.io/rss-aggregator/rss.xml',
    },
    author: authorINFO,
});
```

其中，`rssList`是你的原始RSS源，你可以自由添加。  
`storageLath`是生成的三个整合后的RSS的存储路径，一般无需修改。若修改后，请在`rssList`中相应修改`atom.xml`的位置。  
`authorINFO`与`feed`都是生成后的RSS的信息设置，你可以根据自己的情况填写。

### 运行

```shell
node index.js
```

这将会生成三个rss文件，分别为`rss.xml` `atom.xml`和`feed.json`
