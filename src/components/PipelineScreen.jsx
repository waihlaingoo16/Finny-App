import React, { useState } from 'react';
import { ArrowRight, Check, Eye, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';

const stages = [
  { id:'wishlist', label:'Wishlist' },
  { id:'pending', label:'To review' },
  { id:'ledger', label:'Purchase' },
  { id:'abandoned', label:"Let's Go" },
];
const money = (value, currency='THB') => new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:0 }).format(Number(value || 0));
const cleanNumericInput = value => value.replace(/[၀-၉]/g, digit => String('၀၁၂၃၄၅၆၇၈၉'.indexOf(digit))).replace(/[^\d.]/g, '');

export function PipelineScreen({ t, data, filter, setFilter, onAdd, onMove, onUpdate, onDelete, notify }) {
  const [editing, setEditing] = useState(null);
  const [expandedStages, setExpandedStages] = useState({});
  const [mobileViewport, setMobileViewport] = useState(() => window.matchMedia('(max-width: 428px)').matches);
  const defaultLimit = mobileViewport ? 1 : 2;
  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 428px)');
    const update = event => setMobileViewport(event.matches);
    setMobileViewport(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const items = data.items.filter(item => filter === 'all' || item.category === filter);
  const move = async (item, stage) => {
    const ok = await onMove(item, stage);
    if (ok) notify(stage === 'pending' ? 'Moved to review.' : stage === 'ledger' ? 'Purchase confirmed and added to your ledger.' : stage === 'wishlist' ? 'Review cancelled. Returned to Wishlist.' : 'Purchase finalized in Let’s Go.');
  };
  const saveEdit = async item => {
    if (await onUpdate(item)) { setEditing(null); notify('Wishlist item updated.'); }
  };
  const removeItem = async item => {
    if (!window.confirm(`Permanently delete “${item.name}”?`)) return;
    if (await onDelete(item)) notify('Item permanently deleted.');
  };

  return <>
    <div className="page-heading"><div><p className="eyebrow">PAUSE. CHOOSE. FEEL GOOD.</p><h1>Mindful spending</h1><p className="page-subtitle">Give every purchase a moment to earn its place.</p></div><button className="button button-dark" onClick={onAdd}><Plus size={16}/>{t.addItem}</button></div>
    <div className="pipeline-intro"><div className="pipeline-stages">{stages.map((stage,index)=><div className="pipeline-stage" key={stage.id}><span className={`stage-number ${stage.id}`}>{String(index+1).padStart(2,'0')}</span><span>{stage.label}</span>{index<3&&<ArrowRight className="stage-arrow" size={15}/>}</div>)}</div><p>Take a breath between wanting something and deciding to buy it.</p></div>
    <div className="filter-row"><div className="filter-pills">{[['all','Everything'],['need',t.needs],['want',t.wants],['emergency',t.emergency]].map(([id,label])=><button className={filter===id?'selected':''} onClick={()=>setFilter(id)} key={id}>{label}</button>)}</div><span className="item-count">{items.length} {items.length===1?'item':'items'}</span></div>
    {items.length===0?<div className="empty-state"><span className="empty-emoji">🛍️</span><h3>A little space to think</h3><p>Add something you’re considering. You can decide on it later.</p><button className="button button-dark" onClick={onAdd}><Plus size={15}/>Add to wishlist</button></div>:<div className="pipeline-columns">{stages.map(stage=>{
      const stageItems=items.filter(item=>item.stage===stage.id);
      const orderedItems=stage.id==='abandoned'?[...stageItems].sort((a,b)=>new Date(b.completedAt||b.date||0)-new Date(a.completedAt||a.date||0)):stageItems;
      const expanded=Boolean(expandedStages[stage.id]);
      const visibleItems=expanded?orderedItems:orderedItems.slice(0,defaultLimit);
      const hasMore=orderedItems.length>defaultLimit;
      return <section className={`pipeline-column col-${stage.id} ${expanded?'stage-expanded':''}`} key={stage.id}><div className="column-heading"><span className={`column-dot ${stage.id}`}/><h3>{stage.label}</h3><span className="column-count">{stageItems.length}</span></div>
        {stageItems.length===0?<div className="column-empty">Nothing here yet</div>:<><div className={`stage-items ${expanded?'expanded':''}`}>{visibleItems.map(item=><article className="item-card" key={item.id}>
          <div className="item-card-top"><span className={`category-tag ${item.category}`}>{item.category==='need'?t.needs:item.category==='want'?t.wants:t.emergency}</span><span className="item-date">{item.date?new Date(item.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'Today'}</span></div>
          <h4>{item.name}</h4><strong>{money(item.amount,data.profile.currency)}</strong>{item.note&&<p className="pipeline-item-note">{item.note}</p>}
          {stage.id==='wishlist'&&<button className="pipeline-action move-forward" onClick={()=>move(item,'pending')}>Move Forward <span>To Review</span><ArrowRight size={14}/></button>}
          {stage.id==='pending'&&<div className="pending-actions"><button className="pending-edit" onClick={()=>setEditing(item)} aria-label={`Edit ${item.name}`} title="Edit"><Pencil size={14}/></button><button className="pending-revert" onClick={()=>move(item,'wishlist')} aria-label={`Cancel review for ${item.name}`} title="Cancel review"><RotateCcw size={14}/></button><button className="pending-delete" onClick={()=>removeItem(item)} aria-label={`Delete ${item.name}`} title="Permanently delete"><Trash2 size={14}/></button><button className="pending-confirm" onClick={()=>move(item,'ledger')} aria-label={`Confirm purchase of ${item.name}`} title="Confirm purchase"><Check size={14}/></button></div>}
          {stage.id==='ledger'&&<div className="ledger-actions"><button className="ledger-delete" onClick={()=>removeItem(item)} aria-label={`Delete ${item.name}`} title="Permanently delete"><Trash2 size={14}/></button><button className="ledger-confirm" onClick={()=>move(item,'abandoned')} aria-label={`Complete purchase of ${item.name}`} title="Complete purchase"><Check size={14}/></button></div>}
        </article>)}</div>{hasMore&&<button className="stage-more-toggle" onClick={()=>setExpandedStages(value=>({...value,[stage.id]:!value[stage.id]}))} aria-expanded={expanded}>{expanded?'See Less':'See More'} <Eye size={13}/></button>}</>}
      </section>;
    })}</div>}
    {editing&&<EditItemModal item={editing} currency={data.profile.currency} close={()=>setEditing(null)} onSave={saveEdit}/>}
  </>;
}

function EditItemModal({item,currency,close,onSave}) {
  const [name,setName]=useState(item.name||'');
  const [amount,setAmount]=useState(String(item.amount??''));
  const [category,setCategory]=useState(item.category||'want');
  const [date,setDate]=useState(item.date?String(item.date).slice(0,10):new Date().toISOString().slice(0,10));
  const [note,setNote]=useState(item.note||'');
  return <div className="modal-overlay" onMouseDown={event=>event.target===event.currentTarget&&close()}><form className="entry-modal" onSubmit={event=>{event.preventDefault();onSave({...item,name:name.trim(),amount:Number(cleanNumericInput(amount)),category,date,note});}}>
    <div className="modal-top"><div><span className="eyebrow">PENDING REVIEW</span><h2>Edit wishlist item</h2></div><button type="button" className="close-modal" aria-label="Close" onClick={close}><X size={18}/></button></div>
    <label className="field-label">Name<input required autoFocus value={name} onChange={event=>setName(event.target.value)}/></label>
    <label className="field-label">Price ({currency})<input required type="text" inputMode="decimal" value={amount} onChange={event=>setAmount(cleanNumericInput(event.target.value))}/></label>
    <label className="field-label">Category tag<select value={category} onChange={event=>setCategory(event.target.value)}><option value="need">Need · Essential</option><option value="want">Want · Wishlist</option><option value="emergency">Have but emergency</option></select></label>
    <label className="field-label">Date<input required type="date" value={date} onChange={event=>setDate(event.target.value)}/></label>
    <label className="field-label">Note<textarea rows="3" value={note} onChange={event=>setNote(event.target.value)} placeholder="Add a note"/></label>
    <div className="modal-actions"><button type="button" className="button button-light" onClick={close}>Cancel</button><button className="button button-dark" type="submit">Save changes <Check size={15}/></button></div>
  </form></div>;
}
