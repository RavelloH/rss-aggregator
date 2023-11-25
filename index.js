const fs = require('fs');
const Feed = require('feed').Feed;
const path = require('path');
const chalk = require('chalk');
const RSSParser = require('rss-parser');
const Rlog = require('rlog-js');
const log = new Rlog();

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
        atom: 'ravelloh.github.io/rss-aggregator/atom.xml',
        rss: 'ravelloh.github.io/rss-aggregator/rss.xml',
    },
    author: authorINFO,
});

log.info('rss-aggregator v1.0.0')

async function readRSSList(rssList) {
    const rssObjects = [];

    async function readRSS(rssPath) {
        let feed;
        let url;

        if (rssPath.startsWith('http://') || rssPath.startsWith('https://')) {
            url = rssPath;
            const parser = new RSSParser();
            feed = await parser.parseURL(url);
        } else {
            try {
                const rssContent = fs.readFileSync(rssPath, 'utf-8');
                const parser = new RSSParser();
                feed = await parser.parseString(rssContent);
                url = feed.link;
            } catch (e) {
                log.warning('Can not open file '+rssPath)
                return
            }

        }

        for (const item of feed.items) {
            const existingRssObjectIndex = rssObjects.findIndex(
                (obj) => obj.title === item.title
            );

            const rssObject = {
                title: item.title,
                description: HTMLDecode(item.contentSnippet) || HTMLDecode(item.content) || HTMLDecode(item.description),
                url: item.link,
                date: new Date(item.isoDate).getTime(),
                time: new Date(item.pubDate),
                author: item.creator || item.author || feed.title,
                cover: item.enclosure && item.enclosure.url,
                tags: item.tags || [],
                categories: item.categories || []
            };

            if (existingRssObjectIndex !== -1) {
                rssObjects[existingRssObjectIndex] = rssObject;
            } else {
                rssObjects.push(rssObject);
            }
        }
    }

    for (const rss of rssList) {
        const rssPath = rss.startsWith('http://') || rss.startsWith('https://')
        ? rss: path.resolve(rss);
        await readRSS(rssPath);
        log.info('Fetched rss : '+rssPath)
    }

    rssObjects.sort((a, b) => b.date - a.date);
    return rssObjects;
}

function HTMLDecode(str) {
    var s = '';
    if (str.length == 0) return '';
    s = str.replace(/&amp;/g, '&');
    s = s.replace(/&lt;/g, '<');
    s = s.replace(/&gt;/g, '>');
    s = s.replace(/&nbsp;/g, ' ');
    s = s.replace(/&#39;/g, "'");
    s = s.replace(/&quot;/g, '"');
    s = s.replace(/<br\/>/g, '\n');
    return s;
}

log.info('Starting fetch...')
readRSSList(rssList)
.then(rssObjects => {
    log.success('Successfully fetch all rss')
    log.info('Starting building final rss...')
    rssObjects.forEach((post) => {
        feed.addItem({
            title: post.name || post.title,
            id: post.url,
            link: post.url,
            content: HTMLDecode(post.description),
            author: authorINFO,
            date: new Date(post.time),
            tag: post.tag,
            category: post.class,
            classification: post.class,
        });
    });

    fs.writeFileSync(storagePath + 'rss.xml', feed.rss2());
    fs.writeFileSync(storagePath + 'atom.xml', feed.atom1());
    fs.writeFileSync(storagePath + 'feed.json', feed.json1());
    log.success('RSS aggregaed.')
})
.catch(error => {
    log.error(error);
});