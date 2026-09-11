const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {resolveListeningMedia:resolve}=require('./media.js');
assert.equal(resolve({audioUrl:'https://example.org/a.mp3'}).type,'audio');
assert.equal(resolve({audioFile:'old audio.mp3'}).source,'assets/audio/old%20audio.mp3');
assert.equal(resolve({mediaType:'video',mediaUrl:'https://example.org/a.mp4?token=123'}).type,'video');
for(const url of ['https://youtu.be/M7lc1UVf-VE','https://www.youtube.com/watch?v=M7lc1UVf-VE','https://www.youtube.com/embed/M7lc1UVf-VE','https://www.youtube.com/shorts/M7lc1UVf-VE']){
 assert.match(resolve({mediaType:'youtube',mediaUrl:url}).source,/youtube-nocookie.com\/embed\/M7lc1UVf-VE/);
}
for(const url of ['javascript:alert(1)','https://evil.example/watch?v=M7lc1UVf-VE','https://youtube.com/watch?v=bad'])assert.ok(resolve({mediaType:'youtube',mediaUrl:url}).error);
assert.ok(resolve({}).error);
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{hidden:true,src:'',addEventListener(){},pause(){this.paused=true;},load(){},removeAttribute(a){delete this[a];},reset(){}});return nodes.get(id);}
const context=vm.createContext({URL,resolveListeningMedia:resolve,document:{getElementById:node},fetch:()=>new Promise(()=>{})});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),context);
for(const [type,id,url] of [['audio','audio-player','https://example.org/a.mp3'],['video','video-player','https://example.org/a.mp4'],['youtube','youtube-player','https://youtu.be/M7lc1UVf-VE']]){
 context.lesson={mediaType:type,mediaUrl:url,title:'Test'};
 vm.runInContext('renderMedia(lesson)',context);
 for(const other of ['audio-player','video-player','youtube-player'])assert.equal(node(other).hidden,other!==id);
 assert.ok(node(id).src);
}
vm.runInContext('resetActivity()',context);
for(const id of ['audio-player','video-player','youtube-player']){assert.equal(node(id).hidden,true);assert.equal(node(id).src,undefined);}
context.lesson={mediaType:'youtube',mediaUrl:'https://example.org/bad'};
vm.runInContext('renderMedia(lesson)',context);assert.equal(node('audio-note').hidden,false);assert.equal(node('audio-link').hidden,true);
console.log('Passed: three media types, legacy audio, YouTube URL formats, invalid links, player switching and filter reset.');
