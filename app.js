"use strict";

const $ = (id) => document.getElementById(id);
const els = {level:$("level-select"),sub:$("sublevel-select"),unit:$("unit-select"),activity:$("activity-select"),status:$("data-status")};
let lessons = [];

function option(value, label) { const el=document.createElement("option"); el.value=String(value); el.textContent=label; return el; }
function unique(values) { return [...new Set(values)].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})); }
function setOptions(select, values, placeholder) { select.replaceChildren(option("",placeholder),...values.map(v=>option(v,v))); select.disabled=!values.length; }

function byLevel() { return lessons.filter(x=>!els.level.value||x.level.includes(els.level.value)); }
function bySub() { return byLevel().filter(x=>!els.sub.value||x.subLevel.includes(els.sub.value)); }
function filtered() { return bySub().filter(x=>!els.unit.value||x.unit.includes(els.unit.value)); }
function resetActivity() { els.activity.value=""; $("activity").hidden=true; $("tf-form").reset(); $("open-form").reset(); }

els.level.addEventListener("change",()=>{
  setOptions(els.sub, unique(byLevel().flatMap(x=>x.subLevel)), "Sub-nivel");
  setOptions(els.unit, [], "Unidad");
  setOptions(els.activity, [], "Actividad");
  resetActivity();
});
els.sub.addEventListener("change",()=>{
  setOptions(els.unit, unique(bySub().flatMap(x=>x.unit)), "Unidad");
  setOptions(els.activity, [], "Actividad");
  resetActivity();
});
els.unit.addEventListener("change",()=>{
  const items=filtered();
  els.activity.replaceChildren(option("","Actividad"),...items.map(x=>option(x.id,x.title)));
  els.activity.disabled=!items.length;
  resetActivity();
});
els.activity.addEventListener("change",()=>{const lesson=lessons.find(x=>x.id===els.activity.value);if(lesson)renderLesson(lesson);else resetActivity();});

function renderLesson(lesson) {
  $("tf-form").reset(); $("open-form").reset(); $("tf-result").hidden=true; $("open-result").hidden=true;
  $("activity-title").textContent=lesson.title;
  $("activity-path").textContent=`${lesson.level.join("/")} • ${lesson.subLevel.join("/")} • Unit ${lesson.unit.join("/")}`;
  $("listening-level").textContent=`${lesson.listeningLevel} listening`;
  $("topic-list").replaceChildren(...lesson.topics.map(t=>{const s=document.createElement("span");s.className="chip";s.textContent=t;return s;}));
  const wrap=$("picture-wrap"), img=$("lesson-picture"), picNote=$("picture-note");
  if(lesson.pictureName){wrap.hidden=false;picNote.hidden=true;img.hidden=false;img.alt=`Illustration for ${lesson.title}`;img.src=`assets/images/${encodeURIComponent(lesson.pictureName)}`;img.onerror=()=>{img.hidden=true;picNote.hidden=false;};}else{wrap.hidden=true;img.removeAttribute("src");}
  const audio=$("audio-player"), note=$("audio-note"), link=$("audio-link");
  const source=lesson.audioFile?`assets/audio/${encodeURIComponent(lesson.audioFile)}`:lesson.audioUrl;
  audio.src=source||"";audio.load();note.hidden=true;link.hidden=true;
  if(lesson.audioUrl){link.href=lesson.audioUrl;link.hidden=false;}
  audio.onerror=()=>{note.textContent="This source cannot play in the embedded player. Use the source link below or ask your instructor for the audio file.";note.hidden=false;};
  renderTF(lesson); renderOpen(lesson); $("data-note").hidden=!lesson.reviewDirectQuestions; $("activity").hidden=false; $("activity-title").focus?.({preventScroll:true});
}

function renderTF(lesson) {
  const items=lesson.trueFalse.filter(x=>x.question.trim());
  $("tf-questions").replaceChildren(...items.map((item,i)=>{const div=document.createElement("div");div.className="question";const fs=document.createElement("fieldset");const legend=document.createElement("legend");legend.textContent=`${i+1}. ${item.question}`;fs.append(legend);const choices=document.createElement("div");choices.className="choices";["true","false"].forEach(v=>{const label=document.createElement("label");const input=document.createElement("input");input.type="radio";input.name=`tf-${i}`;input.value=v;label.append(input,document.createTextNode(v[0].toUpperCase()+v.slice(1)));choices.append(label);});const fb=document.createElement("p");fb.className="feedback";fb.id=`tf-feedback-${i}`;fs.append(choices,fb);div.append(fs);return div;}));
  $("tf-form").onsubmit=(e)=>{e.preventDefault();let score=0,answered=0;items.forEach((item,i)=>{const picked=document.querySelector(`input[name="tf-${i}"]:checked`);const fb=$(`tf-feedback-${i}`);if(picked)answered++;const ok=picked&&((picked.value==="true")===item.answer);if(ok)score++;fb.textContent=!picked?"Choose an answer.":ok?"Correct.":`Not quite. The answer is ${item.answer?"True":"False"}.`;fb.className=`feedback ${ok?"correct":"incorrect"}`;});const r=$("tf-result");r.textContent=`Score: ${score} / ${items.length}${answered<items.length?` • ${items.length-answered} unanswered`:""}`;r.hidden=false;};
}

const stop=new Set(["a","an","and","are","as","at","be","because","between","for","from","has","he","her","his","in","is","it","of","on","or","she","the","their","they","to","was","what","with","years","old"]);
function normalized(text){return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function flexibleMatch(given,reference){const g=normalized(given),r=normalized(reference);if(!g)return false;if(g.includes(r)||r.includes(g)&&g.length>=4)return true;const wanted=r.split(" ").filter(w=>w.length>1&&!stop.has(w));const got=new Set(g.split(" ").filter(w=>w.length>1&&!stop.has(w)));if(!wanted.length)return g===r;const hits=wanted.filter(w=>got.has(w)).length;return hits/wanted.length>=.6&&hits>=Math.min(2,wanted.length);}
function renderOpen(lesson){const items=lesson.direct.filter(x=>x.question.trim());$("open-questions").replaceChildren(...items.map((item,i)=>{const div=document.createElement("div");div.className="question";const label=document.createElement("label");label.className="open-label";label.htmlFor=`open-${i}`;label.textContent=`${i+1}. ${item.question}`;const input=document.createElement("input");input.type="text";input.id=`open-${i}`;input.name=`open-${i}`;input.autocomplete="off";input.placeholder="Type your answer";const fb=document.createElement("div");fb.id=`open-feedback-${i}`;div.append(label,input,fb);return div;}));$("open-form").onsubmit=(e)=>{e.preventDefault();let score=0,answered=0;items.forEach((item,i)=>{const value=$(`open-${i}`).value;if(value.trim())answered++;const ok=flexibleMatch(value,item.answer);if(ok)score++;const fb=$(`open-feedback-${i}`);fb.replaceChildren();const verdict=document.createElement("p");verdict.className=`feedback ${ok?"correct":"incorrect"}`;verdict.textContent=!value.trim()?"Add an answer, then check again.":ok?"Good answer.":"Your answer does not include enough of the key information.";const model=document.createElement("p");model.className="model-answer";model.textContent=`Model answer: ${item.answer}`;fb.append(verdict,model);});const r=$("open-result");r.textContent=`Score: ${score} / ${items.length}${answered<items.length?` • ${items.length-answered} unanswered`:""}`;r.hidden=false;};}

fetch("listening.json").then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{lessons=data;setOptions(els.level,unique(lessons.flatMap(x=>x.level)),"Nivel");els.status.textContent=`${lessons.length} activities ready`;}).catch(()=>{els.status.textContent="Activities could not load. Serve this folder from a web server (for example, GitHub Pages) instead of opening index.html directly.";});
