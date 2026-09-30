import React from 'react';
import { Activity, ChevronDown, Sparkles } from 'lucide-react';

const money=(value,currency='THB')=>new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(Number(value||0));

export function AnalyticsScreen({ t, items, currency='THB', budget=5000, saved=0, goal=10000 }) {
  const confirmed=items.filter(item=>item.stage==='ledger'||item.stage==='abandoned');
  const total=confirmed.reduce((sum,item)=>sum+Number(item.amount||0),0);
  const categories=['need','want','emergency'].map(category=>({category,value:confirmed.filter(item=>item.category===category).reduce((sum,item)=>sum+Number(item.amount||0),0)}));
  const max=Math.max(1,...categories.map(category=>category.value));
  const pct=(value,base)=>base?Math.round(value/base*100):0;
  const budgetPct=budget>0?total/budget*100:0;
  const wantPct=pct(categories.find(category=>category.category==='want')?.value||0,total);
  let insight;
  if(!total) insight={score:'—',heading:'Your month is wide open',copy:'Confirm a purchase in Spending to see your monthly financial insights here.'};
  else if(budgetPct>85) insight={score:'!',heading:'Your budget is almost used',copy:`You’ve used ${Math.round(budgetPct)}% of your monthly budget. Review upcoming purchases before confirming them.`};
  else if(budgetPct>=50) insight={score:'↗',heading:'A good moment to check in',copy:`You’ve used ${Math.round(budgetPct)}% of this month’s budget. A quick review can help you stay on track.`};
  else if(wantPct>=50) insight={score:'♡',heading:'Wants make up much of your spending',copy:`${wantPct}% of confirmed expenses are wants. A short waiting period can help keep priorities clear.`};
  else insight={score:'A+',heading:'You’re finding your rhythm',copy:'Your spending is within a comfortable range. Keep making room for what matters.'};

  return <>
    <div className="page-heading"><div><p className="eyebrow">NOTICE THE PATTERNS</p><h1>Your money story</h1><p className="page-subtitle">A gentle look at where your money is going.</p></div></div>
    <section className="analytics-top"><div className="analytics-total"><span className="small-muted">Confirmed spending this month</span><strong>{money(total,currency)}</strong><span className="month-pill"><Activity size={13}/> {confirmed.length} confirmed {confirmed.length===1?'purchase':'purchases'}</span><div className="analytics-doodle">↗</div></div><div className="health-card"><div className="health-icon"><Sparkles size={18}/></div><div><span className="eyebrow">PIGGY’S PERSPECTIVE</span><h2>{insight.heading}</h2><p>{insight.copy}</p></div><span className="health-score">{insight.score}</span></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">WHAT MATTERS MOST</p><h2>Spending by category</h2></div><span className="period-label">THIS MONTH <ChevronDown size={14}/></span></div>
      <div className="analytics-chart">{categories.map(({category,value})=><div className="bar-row" key={category}><span className="bar-label">{category==='need'?t.needs:category==='want'?t.wants:t.emergency}</span><div className="bar-track"><div className={`bar-fill ${category}`} style={{width:`${value?Math.max(2,value/max*100):0}%`}}/></div><strong>{money(value,currency)}</strong><span className="bar-percent">{pct(value,total)}%</span></div>)}</div>
      <div className="analytics-distribution" aria-label="Needs, wants, and emergency spending ratio">{categories.map(({category,value})=><span key={category} className={category} style={{width:`${total?value/total*100:0}%`}} title={`${category}: ${pct(value,total)}%`}/>)}</div>
    </section>
    <div className="insight-row"><div className="insight-card"><span className="insight-emoji">🪴</span><div><b>Your savings are growing</b><p>You’ve put away {money(saved,currency)} toward your {money(goal,currency)} goal. Keep the steady pace.</p></div></div><div className="insight-card peach-insight"><span className="insight-emoji">💭</span><div><b>Give wants a waiting period</b><p>Leaving a little time before a purchase can make your priorities clearer.</p></div></div></div>
  </>;
}
