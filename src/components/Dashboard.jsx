import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowRight, Check, Plus, Sparkles, Target, X } from 'lucide-react';

const quotes = [
  ['စုဆောင်းခြင်း အလေ့အကျင့်', 'Do not save what is left after spending, but spend what is left after saving.', 'မသုံးစွဲမီ အရင်စုပါ၊ သုံးစွဲပြီးမှ ကျန်တာကို မစုပါနဲ့။'],
  ['မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း', 'The best investment you can make is an investment in yourself.', 'အကောင်းဆုံး ရင်းနှီးမြှုပ်နှံမှုဟာ မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း ဖြစ်ပါတယ်။'],
  ['စိတ်လိုက်မာန်ပါ မသုံးမိစေရန်', 'If you buy things you do not need, soon you will have to sell things you need.', 'မလိုအပ်တဲ့ အရာတွေကို အရင်ဝယ်ယူနေရင် မကြာခင်မှာ လိုအပ်တာတွေကို ပြန်ရောင်းရပါလိမ့်မယ်။'],
  ['ရေရှည် ပန်းတိုင်နှင့် စိတ်ရှည်မှု', "Someone's sitting in the shade today because someone planted a tree a long time ago.", 'ဒီနေ့ သစ်ရိပ်ခိုနေရတာဟာ လွန်ခဲ့တဲ့ နှစ်ပေါင်းများစွာက သစ်ပင် စိုက်ပျိုးခဲ့လို့ ဖြစ်ပါတယ်။'],
];
const fmt = (n, currency) => new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:0 }).format(Number(n || 0));
const mmDigits = n => String(n).replace(/[0-9]/g, d => '၀၁၂၃၄၅၆၇၈၉'[Number(d)]);

export function Dashboard({ t, data, saved, progress, goal, spent, byCategory, items, budget = 5000, setTab, onDeposit, onExpense, streak = 0 }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteRail = useRef(null);
  const active = items.filter(item => item.stage === 'wishlist' || item.stage === 'pending');
  const wishlist = items.filter(item => item.stage === 'wishlist').length;
  const pending = items.filter(item => item.stage === 'pending').length;
  const budgetPercent = budget > 0 ? Math.min(100, spent / budget * 100) : 0;
  const budgetMood = budgetPercent > 85 ? 'over' : budgetPercent >= 50 ? 'watch' : 'good';
  const mascot = progress > 75 ? '🥳' : progress >= 25 ? '😊' : '🐷';
  const my = data.profile.language === 'my';
  const copy = my ? {
    budget:'လစဉ် အသုံးစရိတ်', health:'ဘတ်ဂျက် အခြေအနေ', onTrack:'အဆင်ပြေပါသည်', watch:'သတိပြုရန်', nearLimit:'ကန့်သတ်ချက် နီးပါပြီ', left:'ဤလအတွက် ကျန်ငွေ', reached:'လစဉ် ဘတ်ဂျက် ပြည့်သွားပါပြီ',
    pipeline:'အသုံးစရိတ် အဆင့်ဆင့်', room:'ဆုံးဖြတ်ရန် အချိန်ယူပါ', wishlist:'ဆန္ဒစာရင်း', pending:'စိစစ်ရန်', motion:'ဆက်လက်လုပ်ဆောင်နေသည်', pause:'မဝယ်မီ ခဏစဉ်းစားပါ။',
    spend:'စုစုပေါင်း အတည်ပြုအသုံးစရိတ်', analytics:'စာရင်းအင်းကို ကြည့်ရန်', pocket:'သင့်အတွက် အတွေးတစ်ခု', daily:'နေ့စဉ် ငွေကြေးအတွေး', quick:'အမြန်မှတ်တမ်းတင်ရန်', step:'ရှေ့သို့ ခြေလှမ်းငယ်တစ်ခု', choose:'ဘာကို မှတ်တမ်းတင်မလဲ?', deposit:'စုငွေ မှတ်တမ်းတင်ရန်', addSaving:'ရည်မှန်းချက်အတွက် ငွေထည့်ပါ', expense:'အသုံးစရိတ် / ဆန္ဒစာရင်း ထည့်ရန်', decide:'မှတ်ထားပြီး နောက်မှ ဆုံးဖြတ်ပါ'
  } : {
    budget:'MONTHLY BUDGET', health:'Budget health', onTrack:'On track', watch:'Take a look', nearLimit:'Near limit', left:'left in this month’s budget', reached:'Monthly budget reached',
    pipeline:'YOUR SPENDING PIPELINE', room:'Room to decide', wishlist:'Wishlist', pending:'To review', motion:'In motion', pause:'Take a pause before you purchase.',
    spend:'Total confirmed spending', analytics:'See analytics', pocket:'A NOTE FOR YOUR POCKET', daily:'DAILY WISDOM', quick:'Quick add', step:'A SMALL STEP FORWARD', choose:'What would you like to log?', deposit:'Log savings deposit', addSaving:'Add a little to your goal', expense:'Add spending / wishlist', decide:'Capture it, decide later'
  };

  useEffect(() => {
    const timer = window.setInterval(() => setQuoteIndex(index => (index + 1) % quotes.length), 7000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const rail = quoteRail.current;
    if (rail) rail.scrollTo({ left: rail.clientWidth * quoteIndex, behavior:'smooth' });
  }, [quoteIndex]);

  const categoryTotal = byCategory.reduce((sum, part) => sum + part.value, 0);
  const labels = { need: t.needs, want: t.wants, emergency: t.emergency };
  const categoryColors = { need:'#8ec89b', want:'#e9aebf', emergency:'#efa17d' };
  const setQuote = direction => setQuoteIndex(index => (index + direction + quotes.length) % quotes.length);
  const quickAction = action => { setQuickOpen(false); action(); };

  return <>
    <div className="page-heading"><div><p className="eyebrow">{t.greeting}, {data.profile.name || 'friend'} ✨</p><h1>{t.overview}</h1><p className="page-subtitle">A little progress adds up to a lot.</p></div></div>
    <section className="hero-grid">
      <div className="goal-card"><div className="card-topline"><span className="soft-icon"><Target size={17}/></span><span className="muted-tag">YOUR SAVINGS GOAL</span><button className="text-button" onClick={()=>setTab('savings')}>View details <ArrowRight size={14}/></button></div>
        <div className="goal-numbers"><div><div className="big-number">{fmt(saved,data.profile.currency)}</div><div className="small-muted">of {fmt(goal,data.profile.currency)} target</div></div><div className="progress-badge">{progress}%</div></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div>
        <div className="goal-foot"><span><span className="legend-dot green"/>Saved so far</span><span>{fmt(Math.max(0,goal-saved),data.profile.currency)} to go</span></div>
        <div className="dashboard-streak"><span className="mascot-face" aria-label="Finny mascot">{mascot}</span><span className="streak-copy" lang={data.profile.language==='my'?'my':undefined}><b>{streak ? (data.profile.language==='my' ? `${mmDigits(streak)} ရက်ဆက်တိုက် စုငွေ မှတ်ထားပြီးပါပြီ 🔥` : `🔥 ${streak}-day savings streak`) : 'Your next little win starts today'}</b><small>{data.profile.language==='my'?'တဖြည်းဖြည်းချင်း စုသွားရင် ပန်းတိုင်ရောက်ပါလိမ့်မယ်။':'Keep showing up for your future self.'}</small></span></div>
      </div>
      <div className="motivation-card"><div className="motivation-top"><span className="sparkle-icon"><Sparkles size={16}/></span><span>FINNY’S LITTLE REMINDER</span><span className="today-chip">TODAY</span></div><div className="motivation-art">🌱</div><h2 lang={data.profile.language==='my'?'my':undefined}>{data.profile.language==='my'?'ဒီနေ့အတွက် မင်း စုထားတာ ဒီလောက် ရှိပြီ။':'Little by little,'}<br/>{data.profile.language==='my'?'ဆက်လက် ကြိုးစားပါ။':'a little becomes a lot.'}</h2><p lang={data.profile.language==='my'?'my':undefined}>{data.profile.language==='my'?'တစ်ဖြည်းဖြည်းချင်း စုသွားရင် မင်းရဲ့ လိုရာခရီး ပန်းတိုင် ရောက်ပါလိမ့်မယ်။':'You don’t have to do it all today. Keep going at your own pace.'}</p><div className="motivation-scribble">you’ve got this <span>↗</span></div></div>
    </section>

    <section className="dashboard-widgets">
      <article className="budget-widget"><div className="widget-heading"><div><p className="eyebrow">{copy.budget}</p><h2>{copy.health}</h2></div><span className={`budget-state ${budgetMood}`}>{budgetMood==='good'?copy.onTrack:budgetMood==='watch'?copy.watch:copy.nearLimit}</span></div><div className="budget-numbers"><b>{fmt(spent,data.profile.currency)}</b><span>of {fmt(budget,data.profile.currency)}</span><strong>{Math.round(budgetPercent)}%</strong></div><div className={`budget-track ${budgetMood}`}><i style={{width:`${budgetPercent}%`}}/></div><p className="widget-foot">{budget>spent?`${fmt(budget-spent,data.profile.currency)} ${copy.left}`:copy.reached}</p></article>
      <button className="pipeline-mini" onClick={()=>setTab('spending')}><div className="widget-heading"><div><p className="eyebrow">{copy.pipeline}</p><h2>{copy.room}</h2></div><ArrowRight size={16}/></div><div className="pipeline-mini-counts"><span><b>{wishlist}</b><small>{copy.wishlist}</small></span><i/><span><b>{pending}</b><small>{copy.pending}</small></span><i/><span><b>{active.length}</b><small>{copy.motion}</small></span></div><p className="widget-foot">{copy.pause}</p></button>
    </section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">{my?'သုံးစွဲမှု အခြေအနေ':'A CLEARER PICTURE'}</p><h2>{t.month} {my?'အနှစ်ချုပ်':'at a glance'}</h2></div><button className="text-button" onClick={()=>setTab('analytics')}>{copy.analytics} <ArrowRight size={14}/></button></div>
      <div className="spend-summary"><div className="spend-total"><span className="small-muted">{copy.spend}</span><strong>{fmt(spent,data.profile.currency)}</strong><span className="month-pill"><ArrowDownLeft size={13}/> {new Date().toLocaleString('en-US',{month:'long'})}</span></div>
        <div className="category-breakdown">{byCategory.map(({category,value})=><div className="category-tile" key={category}><div className="category-label"><span className={`category-dot ${category}`}/><span>{labels[category]}</span></div><b>{fmt(value,data.profile.currency)}</b><div className="mini-track"><i className={category} style={{width:`${spent?Math.max(4,value/spent*100):0}%`}}/></div></div>)}</div>
      </div>
      <div className="segmented-distribution" aria-label="Confirmed expense distribution">{byCategory.map(({category,value})=><span key={category} title={`${labels[category]}: ${spent?Math.round(value/spent*100):0}%`} style={{width:`${categoryTotal?value/categoryTotal*100:0}%`,background:categoryColors[category]}}/>)}</div>
      <div className="distribution-legend">{byCategory.map(({category,value})=><span key={category}><i style={{background:categoryColors[category]}}/>{labels[category]} <b>{categoryTotal?Math.round(value/categoryTotal*100):0}%</b></span>)}</div>
    </section>

    <section className="section-block wisdom-section"><div className="section-heading"><div><p className="eyebrow">{copy.pocket}</p><h2>{t.wisdom}</h2></div><div className="carousel-controls"><span className="read-time">{quoteIndex+1} / {quotes.length}</span><button aria-label="Previous quote" onClick={()=>setQuote(-1)}><ArrowLeft size={14}/></button><button aria-label="Next quote" onClick={()=>setQuote(1)}><ArrowRight size={14}/></button></div></div>
      <div className="quote-carousel" ref={quoteRail} onScroll={e=>{const ix=Math.round(e.currentTarget.scrollLeft/e.currentTarget.clientWidth);if(ix!==quoteIndex)setQuoteIndex(ix)}}>{quotes.map(([title,quote,translation],i)=><article className={`quote-slide quote-${i}`} key={title}><div className="quote-slide-mark">{String(i+1).padStart(2,'0')} <span>{copy.daily}</span></div><h3 lang="my">{title}</h3><p className="quote-english">“{quote}”</p><p className="quote-myanmar" lang="my">{translation}</p><span className="quote-attribution">Warren Buffett</span></article>)}</div>
      <div className="carousel-dots">{quotes.map((_,i)=><button key={i} aria-label={`Show quote ${i+1}`} className={quoteIndex===i?'active':''} onClick={()=>setQuoteIndex(i)}/>)}</div>
    </section>

    <button className="dashboard-fab" aria-label={copy.quick} onClick={()=>setQuickOpen(true)}><Plus size={22}/><span>{copy.quick}</span></button>
    {quickOpen&&<div className="quick-overlay" onMouseDown={e=>e.target===e.currentTarget&&setQuickOpen(false)}><div className="quick-sheet"><div className="quick-sheet-head"><div><p className="eyebrow">{copy.step}</p><h2>{copy.choose}</h2></div><button className="close-modal" onClick={()=>setQuickOpen(false)} aria-label="Close"><X size={18}/></button></div><button className="quick-choice savings-choice" onClick={()=>quickAction(onDeposit)}><span>🐷</span><div><b>{copy.deposit}</b><small>{copy.addSaving}</small></div><ArrowRight size={16}/></button><button className="quick-choice spending-choice" onClick={()=>quickAction(onExpense)}><span>🛍️</span><div><b>{copy.expense}</b><small>{copy.decide}</small></div><ArrowRight size={16}/></button></div></div>}
  </>;
}
