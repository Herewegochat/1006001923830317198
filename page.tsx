"use client";
import {useState} from "react";
import {questions} from "../lib/questions";
import {validDiscordId} from "../lib/discord-id";
const topics=["Motivation","First response","API setup","Escalation","Under pressure"];
export default function Page(){
  const [answers,setAnswers]=useState<string[]>(Array(5).fill(""));
  const [discordId,setDiscordId]=useState(""),[step,setStep]=useState(0),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");
  const count=answers.filter(v=>v.trim()).length;
  async function advance(e:React.FormEvent){
    e.preventDefault(); if(busy)return;
    setError("");
    if((step===0 || step===4) && !validDiscordId(discordId)){setStep(0);setError("Enter your numeric Discord user ID.");return;}
    if(step<4){setStep(step+1);return;}
    const missing=answers.findIndex(a=>!a.trim());
    if(missing>=0){setStep(missing);setError("Complete this section before submitting.");return;}
    setBusy(true);
    try{
      const r=await fetch("/api/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({discordId,answers})});
      const result=await r.json();
      if(!r.ok||!result.ok)throw new Error(result.error || "Please try again shortly.");
      setSent(true);
    }catch(e){setError(e instanceof Error?e.message:"Unable to submit. Please try again.");}
    finally{setBusy(false);}
  }
  return <><header><div className="wrap mast"><b><span className="brand">OR</span> Oxford Response <small>API</small></b><span className="portal">Application portal</span></div></header><main className="wrap">
  <section className="hero"><div><span className="eyebrow"><i/> Recruitment</span><h1>Support intern<br/>application</h1><p>Join the Oxford Response API support team.</p></div></section>
  {sent?<section className="success"><span className="eyebrow">Oxford Response API</span><h2>Application received.</h2><p>Your answers have been sent to the support team. Your Discord ID is <strong>{discordId}</strong>.</p></section>:
  <div className="layout"><aside><div className="aside-title">Application progress <strong>{count}/5</strong></div><div className="bar"><div style={{width:count*20+"%"}}/></div>
  <nav aria-label="Application questions">{topics.map((t,i)=><button type="button" key={t} disabled={busy} aria-current={step===i?"step":undefined} onClick={()=>{setStep(i);setError("");}}><span>{answers[i].trim()?"✓":String(i+1).padStart(2,"0")}</span>{t}</button>)}</nav></aside>
  <form onSubmit={advance}><span className="eyebrow">Question {String(step+1).padStart(2,"0")} / 05</span><h2>{topics[step]}</h2>
  {step===0&&<label className="user-id">Discord user ID<input required inputMode="numeric" maxLength={20} value={discordId} onChange={e=>setDiscordId(e.target.value.trim())} placeholder="e.g. 123456789012345678" aria-describedby="id-help"/><small id="id-help">Enable Developer Mode in Discord settings, then open your profile menu and select Copy User ID.</small></label>}
  <label htmlFor="answer">{questions[step]}</label><textarea id="answer" key={step} required maxLength={950} value={answers[step]} placeholder="Write your response here…" onChange={e=>setAnswers(answers.map((a,i)=>i===step?e.target.value:a))}/><div className="counter">{answers[step].length} / 950</div>
  {error&&<p role="alert">{error}</p>}<footer><button className="back" type="button" disabled={!step||busy} onClick={()=>{setStep(step-1);setError("");}}>← Back</button><button className="primary" disabled={busy} onClick={e=>{if(!answers[step].trim()||(!step&&!discordId)){e.preventDefault();setError("Fill in the required fields to continue.");}}}>{busy?"Sending…":step===4?"Submit application":"Continue"} <span>→</span></button></footer></form></div>}</main></>;
}
