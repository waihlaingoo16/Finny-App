import { supabase } from './supabase';

const localKey = 'finny-state-v1';
export const initialData = { profile: { name: 'Alex', goal: 10000, monthlyBudget: 5000, currency: 'THB', avatar: '🐷', reminders: false }, deposits: [], items: [] };
const isMissingMigrationColumn = error => {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return ['PGRST204', '42703'].includes(error?.code) || /column .* does not exist|could not find the .* column/.test(message);
};
const missingColumnName = error => {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return message.match(/could not find the ['"]?([a-z0-9_]+)|column ['"]?([a-z0-9_]+)/i)?.slice(1).find(Boolean);
};

export function readLocal() {
  try { return { ...initialData, ...JSON.parse(localStorage.getItem(localKey) || '{}') }; }
  catch { return initialData; }
}
export function writeLocal(data) { localStorage.setItem(localKey, JSON.stringify(data)); }

export async function loadCloud(userId) {
  if (!supabase || !userId) return null;
  const [profile, deposits, items] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('spending_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);
  if (profile.error || deposits.error || items.error) throw profile.error || deposits.error || items.error;
  return {
    profile: profile.data ? { name: profile.data.name || 'Friend', goal: Number(profile.data.goal || 10000), monthlyBudget: Number(profile.data.monthly_budget || 5000), currency: profile.data.currency || 'THB', avatar: profile.data.avatar || '🐷', language: profile.data.language || 'en', reminders: Boolean(profile.data.reminders) } : { ...initialData.profile, name: 'Friend' },
    deposits: deposits.data.map(({ id, amount, note, deposited_on }) => ({ id, amount: Number(amount), note: note || '', date: deposited_on })),
    items: items.data.map(({ id, name, amount, category, stage, note, item_date, purchased_on, completed_at, created_at }) => ({ id, name, amount: Number(amount), category, stage, note: note || '', purchased_on, completedAt: completed_at, date: ['ledger','abandoned'].includes(stage) && purchased_on ? purchased_on : (item_date || created_at) })),
  };
}

export async function persistData(userId, data) {
  writeLocal(data);
  if (!supabase || !userId) return;
  const p = await supabase.from('profiles').upsert({ id: userId, name: data.profile.name, goal: data.profile.goal, monthly_budget: data.profile.monthlyBudget || 5000, currency: data.profile.currency, avatar: data.profile.avatar, language: data.profile.language || 'en', reminders: Boolean(data.profile.reminders) });
  if (p.error) throw p.error;
}

export async function addDeposit(userId, deposit) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from('deposits').insert({ user_id: userId, amount: deposit.amount, note: deposit.note, deposited_on: deposit.date }).select().single();
  if (error) throw error;
  return { id: data.id, amount: Number(data.amount), note: data.note || '', date: data.deposited_on };
}
export async function addItem(userId, item) {
  if (!supabase || !userId) return null;
  const client = supabase.from('spending_items');
  const payload = { user_id: userId, name: item.name, amount: item.amount, category: item.category, stage: item.stage, note: item.note || '', item_date: item.date || new Date().toISOString().slice(0,10) };
  let payloadToInsert = { ...payload };
  let result = await client.insert(payloadToInsert).select().single();
  let schemaFallback = false;
  while (result.error && isMissingMigrationColumn(result.error)) {
    const missing = missingColumnName(result.error);
    if (!missing || !Object.hasOwn(payloadToInsert, missing)) break;
    delete payloadToInsert[missing];
    result = await supabase.from('spending_items').insert(payloadToInsert).select().single();
    schemaFallback = true;
  }
  if (result.error) throw result.error;
  return { ...item, id: result.data.id, date: result.data.item_date || item.date || result.data.created_at, schemaFallback };
}
export async function updateItem(userId, item) {
  if (!supabase || !userId) return;
  const update = { stage: item.stage, category: item.category, name: item.name, amount: item.amount, note: item.note || '', item_date: item.date || new Date().toISOString().slice(0,10) };
  if (item.stage === 'ledger' || (item.stage === 'abandoned' && item.purchased_on)) update.purchased_on = item.purchased_on || new Date().toISOString().slice(0,10);
  else update.purchased_on = null;
  if (item.stage === 'abandoned') update.completed_at = item.completedAt || new Date().toISOString();
  else update.completed_at = null;
  let updatePayload = { ...update };
  let { error } = await supabase.from('spending_items').update(updatePayload).eq('id', item.id).eq('user_id', userId);
  while (error && isMissingMigrationColumn(error)) {
    const missing = missingColumnName(error);
    if (!missing || !Object.hasOwn(updatePayload, missing)) break;
    delete updatePayload[missing];
    ({ error } = await supabase.from('spending_items').update(updatePayload).eq('id', item.id).eq('user_id', userId));
  }
  if (error) throw error;
}
export async function deleteItem(userId, itemId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('spending_items').delete().eq('id', itemId).eq('user_id', userId);
  if (error) throw error;
}
