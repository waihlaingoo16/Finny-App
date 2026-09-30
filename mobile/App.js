import 'react-native-url-polyfill/auto';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
}) : null;
const STORAGE_KEY = 'finny-mobile-v1';
const COLORS = { bg: '#f8f7f2', ink: '#25352e', muted: '#7a8981', green: '#4d8066', mint: '#dcefe2', pink: '#f7e2e9', coral: '#fbe6d9', line: '#e9e8df', white: '#fffefa', dark: '#254b39' };
const CATEGORIES = [
  { id: 'need', label: 'Needs', my: 'မရှိမဖြစ်', color: '#8ec89b', emoji: '🥦' },
  { id: 'want', label: 'Wants', my: 'လိုချင်သော', color: '#e9aebf', emoji: '🎀' },
  { id: 'emergency', label: 'Emergency', my: 'အရေးပေါ်', color: '#efa17d', emoji: '🚨' },
];
const STAGES = [
  { id: 'wishlist', title: 'Wishlist', emoji: '💭' },
  { id: 'pending', title: 'To review', emoji: '🌱' },
  { id: 'ledger', title: 'Purchase', emoji: '🛍️' },
  { id: 'abandoned', title: "Let's Go", emoji: '✨' },
];
const QUOTES = [
  ['A saving habit', 'Do not save what is left after spending, but spend what is left after saving.', 'မသုံးစွဲမီ အရင်စုပါ၊ သုံးစွဲပြီးမှ ကျန်တာကို မစုပါနဲ့။'],
  ['Invest in yourself', 'The best investment you can make is an investment in yourself.', 'အကောင်းဆုံး ရင်းနှီးမြှုပ်နှံမှုဟာ မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း ဖြစ်ပါတယ်။'],
  ['Spend with care', 'If you buy things you do not need, soon you will have to sell things you need.', 'မလိုအပ်တဲ့ အရာတွေကို ဝယ်ယူနေရင် မကြာခင် လိုအပ်တာတွေကို ပြန်ရောင်းရပါလိမ့်မယ်။'],
  ['Think long term', "Someone's sitting in the shade today because someone planted a tree a long time ago.", 'ဒီနေ့ သစ်ရိပ်ခိုနေရတာဟာ လွန်ခဲ့တဲ့ နှစ်ပေါင်းများစွာက သစ်ပင် စိုက်ပျိုးခဲ့လို့ ဖြစ်ပါတယ်။'],
];
const today = () => new Date().toISOString().slice(0, 10);
const formatMoney = (value, currency = 'THB') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0)); }
  catch { return `${Number(value || 0).toLocaleString()} ${currency}`; }
};
const myDigits = value => String(value).replace(/[0-9]/g, digit => '၀၁၂၃၄၅၆၇၈၉'[Number(digit)]);
const latinDigits = value => String(value).replace(/[၀-၉]/g, digit => String('၀၁၂၃၄၅၆၇၈၉'.indexOf(digit))).replace(/[^\d.]/g, '');
const starter = (name = 'Friend') => ({
  profile: { name, goal: 10000, monthlyBudget: 5000, currency: 'THB', avatar: '🐷', language: 'en', reminders: false },
  deposits: [], items: [],
});

function Surface({ children, style }) { return <View style={[styles.surface, style]}>{children}</View>; }
function Label({ children, style }) { return <Text style={[styles.eyebrow, style]}>{children}</Text>; }
function Button({ title, onPress, variant = 'dark', style, disabled }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'light' && styles.buttonLight, variant === 'soft' && styles.buttonSoft, variant === 'danger' && styles.buttonDanger, style, pressed && styles.pressed, disabled && { opacity: 0.55 }]}><Text style={[styles.buttonText, variant !== 'dark' && styles.buttonTextAlt]}>{title}</Text></Pressable>;
}
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, ...props }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#a3aea8" keyboardType={keyboardType} multiline={multiline} style={[styles.input, multiline && styles.multiline]} {...props}/></View>;
}
function Progress({ percent, color = COLORS.green }) {
  return <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }]}/></View>;
}
function Segments({ byCategory, total }) {
  return <><View style={styles.segmentBar}>{CATEGORIES.map(cat => <View key={cat.id} style={{ flex: total ? byCategory[cat.id] / total : 0, backgroundColor: cat.color }}/>)}</View><View style={styles.legend}>{CATEGORIES.map(cat => <View key={cat.id} style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: cat.color }]}/><Text style={styles.legendText}>{cat.emoji} {cat.label} <Text style={styles.legendPercent}>{total ? Math.round(byCategory[cat.id] / total * 100) : 0}%</Text></Text></View>)}</View></>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(starter());
  const [tab, setTab] = useState('Home');
  const [entry, setEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) { setBooting(false); return; }
    supabase.auth.getSession().then(({ data: result }) => setSession(result.session)).catch(() => {}).finally(() => setBooting(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, value) => setSession(value));
    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async userId => {
    if (!userId || !supabase) return;
    const [profileRes, depositsRes, itemsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('spending_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    const error = profileRes.error || depositsRes.error || itemsRes.error;
    if (error) throw error;
    const p = profileRes.data;
    const next = {
      profile: p ? { name: p.name || 'Friend', goal: Number(p.goal || 10000), monthlyBudget: Number(p.monthly_budget || 5000), currency: p.currency || 'THB', avatar: p.avatar || '🐷', language: p.language || 'en', reminders: !!p.reminders } : starter('Friend').profile,
      deposits: depositsRes.data.map(row => ({ id: row.id, amount: Number(row.amount), note: row.note || '', date: row.deposited_on })),
      items: itemsRes.data.map(row => ({ id: row.id, name: row.name, amount: Number(row.amount), category: row.category, stage: row.stage, note: row.note || '', date: ['ledger', 'abandoned'].includes(row.stage) && row.purchased_on ? row.purchased_on : row.item_date || row.created_at, purchased_on: row.purchased_on, completedAt: row.completed_at })),
    };
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    setBusy(true);
    refresh(session.user.id).catch(error => setNotice(`Could not sync: ${error.message}`)).finally(() => setBusy(false));
  }, [session?.user?.id, refresh]);

  const saved = data.deposits.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const confirmed = data.items.filter(item => ['ledger', 'abandoned'].includes(item.stage) && String(item.purchased_on || item.date || '').slice(0, 7) === today().slice(0, 7));
  const spent = confirmed.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const byCategory = useMemo(() => Object.fromEntries(CATEGORIES.map(cat => [cat.id, confirmed.filter(item => item.category === cat.id).reduce((sum, item) => sum + Number(item.amount || 0), 0)])), [confirmed]);

  const mutate = async (next, remote) => {
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (session?.user?.id && remote) await remote(session.user.id);
    setNotice('Saved');
    setTimeout(() => setNotice(''), 1800);
  };

  const addDeposit = async payload => {
    const row = { ...payload, id: `local-${Date.now()}` };
    const next = { ...data, deposits: [row, ...data.deposits] };
    await mutate(next, async userId => {
      const { data: savedRow, error } = await supabase.from('deposits').insert({ user_id: userId, amount: row.amount, note: row.note, deposited_on: row.date }).select().single();
      if (error) throw error;
      setData(old => ({ ...old, deposits: [{ ...row, id: savedRow.id }, ...old.deposits.filter(item => item.id !== row.id)] }));
    });
  };
  const addItem = async payload => {
    const row = { ...payload, id: `local-${Date.now()}`, stage: 'wishlist' };
    const next = { ...data, items: [row, ...data.items] };
    await mutate(next, async userId => {
      const { data: savedRow, error } = await supabase.from('spending_items').insert({ user_id: userId, name: row.name, amount: row.amount, category: row.category, stage: row.stage, note: row.note, item_date: row.date }).select().single();
      if (error) throw error;
      setData(old => ({ ...old, items: [{ ...row, id: savedRow.id }, ...old.items.filter(item => item.id !== row.id)] }));
    });
  };
  const updateItem = async item => {
    const next = { ...data, items: data.items.map(row => row.id === item.id ? item : row) };
    await mutate(next, async userId => {
      const updates = { name: item.name, amount: item.amount, category: item.category, note: item.note || '', item_date: item.date || today(), stage: item.stage };
      if (['ledger', 'abandoned'].includes(item.stage)) updates.purchased_on = item.purchased_on || today(); else updates.purchased_on = null;
      if (item.stage === 'abandoned') updates.completed_at = item.completedAt || new Date().toISOString(); else updates.completed_at = null;
      const { error } = await supabase.from('spending_items').update(updates).eq('id', item.id).eq('user_id', userId);
      if (error) throw error;
    });
  };
  const deleteItem = async item => {
    if (session?.user?.id && supabase && !String(item.id).startsWith('local-')) {
      const { error } = await supabase.from('spending_items').delete().eq('id', item.id).eq('user_id', session.user.id);
      if (error) throw error;
    }
    const next = { ...data, items: data.items.filter(row => row.id !== item.id) };
    setData(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const saveProfile = async profile => {
    const next = { ...data, profile };
    await mutate(next, async userId => {
      const { error } = await supabase.from('profiles').upsert({ id: userId, name: profile.name, goal: profile.goal, monthly_budget: profile.monthlyBudget, currency: profile.currency, avatar: profile.avatar, language: profile.language, reminders: profile.reminders });
      if (error) throw error;
    });
  };

  if (booting) return <LoadingScreen/>;
  if (!supabase) return <SetupScreen/>;
  if (!session) return <AuthScreen onNotice={setNotice}/>;

  const screenProps = { data, saved, spent, confirmed, byCategory, onDeposit: () => setEntry({ type: 'deposit' }), onAddItem: () => setEntry({ type: 'item' }), onUpdateItem: updateItem, onDeleteItem: deleteItem, onSaveProfile: saveProfile, setTab, email: session.user.email, refresh: () => refresh(session.user.id) };
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={COLORS.bg}/>
    <View style={styles.topBar}><View style={styles.brand}><Text style={styles.brandPig}>🐷</Text><Text style={styles.brandText}>finny</Text></View><Pressable style={styles.avatarButton} onPress={() => setTab('Settings')}><Text style={styles.avatar}>{data.profile.avatar}</Text></Pressable></View>
    {notice ? <Text style={styles.toast}>{notice}</Text> : null}
    {busy && <View style={styles.syncLine}><ActivityIndicator size="small" color={COLORS.green}/><Text style={styles.syncText}>Syncing your money garden…</Text></View>}
    <View style={styles.screen}>{tab === 'Home' && <HomeScreen {...screenProps}/ >}{tab === 'Savings' && <SavingsScreen {...screenProps}/ >}{tab === 'Spending' && <PipelineScreen {...screenProps}/ >}{tab === 'Analytics' && <AnalyticsScreen {...screenProps}/ >}{tab === 'Settings' && <SettingsScreen {...screenProps}/>}</View>
    <View style={styles.tabBar}>{[['Home', '⌂'], ['Savings', '♡'], ['Spending', '↗'], ['Analytics', '▥'], ['Settings', '⚙']].map(([name, icon]) => <Pressable key={name} onPress={() => setTab(name)} style={styles.tabItem}><Text style={[styles.tabIcon, tab === name && styles.tabActive]}>{icon}</Text><Text style={[styles.tabLabel, tab === name && styles.tabLabelActive]}>{name}</Text></Pressable>)}</View>
    <EntryModal value={entry} close={() => setEntry(null)} onDeposit={async payload => { await addDeposit(payload); setEntry(null); setTab('Savings'); }} onAddItem={async payload => { await addItem(payload); setEntry(null); setTab('Spending'); }}/>
  </SafeAreaView>;
}

function LoadingScreen() { return <SafeAreaView style={styles.centered}><Text style={styles.brandPig}>🐷</Text><Text style={styles.brandText}>finny</Text><ActivityIndicator color={COLORS.green} style={{ marginTop: 18 }}/></SafeAreaView>; }
function SetupScreen() { return <SafeAreaView style={styles.centered}><Text style={styles.heroEmoji}>🐷</Text><Text style={styles.authTitle}>Finny needs a home</Text><Text style={styles.bodyCenter}>Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env, then restart Expo.</Text><Text style={styles.setupHint}>The mobile app connects to the same private profile, deposits, and spending pipeline as your web app.</Text></SafeAreaView>; }

function AuthScreen({ onNotice }) {
  const [signup, setSignup] = useState(false); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!email.trim() || !password) { Alert.alert('A quick check', 'Enter your email and password to continue.'); return; }
    setSubmitting(true);
    try {
      if (signup) {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() || 'Friend' } } });
        if (error) throw error;
        Alert.alert('Check your inbox', 'Confirm your email if confirmation is enabled for your Supabase project.');
      } else { const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; }
    } catch (error) { onNotice(error.message); Alert.alert(signup ? 'Could not create account' : 'Could not sign in', error.message); }
    finally { setSubmitting(false); }
  };
  return <SafeAreaView style={styles.authSafe}><View style={styles.authTop}><Text style={styles.brandPig}>🐷</Text><Text style={styles.brandText}>finny</Text></View><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authWrap}><Surface style={styles.authCard}><Text style={styles.authEmoji}>🌱</Text><Label>A LITTLE BETTER, EVERY DAY</Label><Text style={styles.authTitle}>{signup ? 'Start your money garden' : 'Welcome back'}</Text><Text style={styles.authSub}>A calmer way to save, spend, and grow.</Text>{signup && <Field label="Your name" value={name} onChangeText={setName} placeholder="How should we call you?"/>}<Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email"/><Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry autoComplete={signup ? 'new-password' : 'current-password'}/><Button title={submitting ? 'One moment…' : signup ? 'Create account' : 'Sign in'} onPress={submit} disabled={submitting} style={{ marginTop: 8 }}/><Pressable onPress={() => setSignup(value => !value)} style={styles.authToggle}><Text style={styles.authToggleText}>{signup ? 'Already have an account? Sign in' : 'New to Finny? Create an account'}</Text></Pressable></Surface></KeyboardAvoidingView></SafeAreaView>;
}

function ScreenScroll({ children, title, subtitle, action, contentStyle }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageContent, contentStyle]}><View style={styles.pageHeader}><View style={{ flex: 1 }}><Label>YOUR MONEY, WITH A LITTLE MORE CARE</Label><Text style={styles.pageTitle}>{title}</Text>{subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}</View>{action}</View>{children}</ScrollView>;
}

function HomeScreen({ data, saved, spent, confirmed, byCategory, setTab, onDeposit, onAddItem }) {
  const { width } = useWindowDimensions(); const tight = width < 360; const progress = data.profile.goal > 0 ? Math.min(100, Math.round(saved / data.profile.goal * 100)) : 0;
  const wishlist = data.items.filter(item => item.stage === 'wishlist').length; const pending = data.items.filter(item => item.stage === 'pending').length;
  const budget = Number(data.profile.monthlyBudget || 0); const pct = budget ? Math.min(100, spent / budget * 100) : 0; const mood = pct > 85 ? '#e99177' : pct >= 50 ? '#eac577' : COLORS.green;
  const monthItems = confirmed.length; const quoteRef = React.useRef(null); const [quote, setQuote] = useState(0);
  return <ScreenScroll title="Your overview" subtitle={`A little progress adds up, ${data.profile.name || 'friend'}.`}>
    <Surface style={styles.goalCard}><View style={styles.rowBetween}><View><Label>SAVINGS GOAL</Label><Text style={styles.bigAmount}>{formatMoney(saved, data.profile.currency)}</Text><Text style={styles.muted}>of {formatMoney(data.profile.goal, data.profile.currency)} target</Text></View><View style={styles.pigBubble}><Text style={{ fontSize: 31 }}>{progress > 75 ? '🥳' : progress >= 25 ? '😊' : '🐷'}</Text></View></View><Progress percent={progress}/><View style={styles.rowBetween}><Text style={styles.caption}>Saved so far</Text><Text style={styles.caption}>{progress}% · {formatMoney(Math.max(0, data.profile.goal - saved), data.profile.currency)} to go</Text></View><View style={styles.streakBox}><Text style={{ fontSize: 23 }}>🔥</Text><View style={{ flex: 1 }}><Text style={styles.boldSmall}>{data.profile.language === 'my' ? 'တဖြည်းဖြည်း စုဆောင်းပါ။' : 'Your next little win starts today'}</Text><Text style={styles.caption}>{data.profile.language === 'my' ? 'စုငွေလေးတွေက ပန်းတိုင်ဆီ ခေါ်ဆောင်သွားပါလိမ့်မယ်။' : 'Keep showing up for your future self.'}</Text></View></View></Surface>
    <Surface style={styles.budgetCard}><View style={styles.rowBetween}><View><Label>MONTHLY BUDGET</Label><Text style={styles.sectionTitle}>Budget health</Text></View><Text style={[styles.healthPill, { color: mood }]}>{pct > 85 ? 'Near limit' : pct >= 50 ? 'Take a look' : 'On track'}</Text></View><View style={styles.rowBetween}><Text style={styles.metricAmount}>{formatMoney(spent, data.profile.currency)}</Text><Text style={styles.muted}>of {formatMoney(budget, data.profile.currency)}</Text></View><Progress percent={pct} color={mood}/><Text style={styles.caption}>{budget > spent ? `${formatMoney(budget - spent, data.profile.currency)} left this month` : 'Monthly budget reached'}</Text></Surface>
    <Pressable onPress={() => setTab('Spending')}><Surface style={styles.pipelineMini}><View style={styles.rowBetween}><View><Label>SPENDING PIPELINE</Label><Text style={styles.sectionTitle}>Room to decide</Text></View><Text style={styles.linkArrow}>↗</Text></View><View style={styles.countRow}><View><Text style={styles.countNum}>{wishlist}</Text><Text style={styles.caption}>Wishlist</Text></View><View style={styles.countDivider}/><View><Text style={styles.countNum}>{pending}</Text><Text style={styles.caption}>To review</Text></View><View style={styles.countDivider}/><View><Text style={styles.countNum}>{wishlist + pending}</Text><Text style={styles.caption}>In motion</Text></View></View></Surface></Pressable>
    <Surface><View style={styles.rowBetween}><View><Label>THIS MONTH</Label><Text style={styles.sectionTitle}>Confirmed spending</Text></View><Pressable onPress={() => setTab('Analytics')}><Text style={styles.textLink}>Details ↗</Text></Pressable></View><Text style={[styles.bigAmount, { marginTop: 7 }]}>{formatMoney(spent, data.profile.currency)}</Text><Segments byCategory={byCategory} total={spent}/><Text style={styles.caption}>{monthItems} confirmed {monthItems === 1 ? 'purchase' : 'purchases'} this month</Text></Surface>
    <Surface style={{ paddingBottom: 14 }}><View style={styles.rowBetween}><View><Label>A NOTE FOR YOUR POCKET</Label><Text style={styles.sectionTitle}>Daily wisdom</Text></View><View style={styles.row}><Pressable onPress={() => setQuote(i => (i + 3) % 4)} style={styles.roundSmall}><Text style={styles.roundGlyph}>‹</Text></Pressable><Pressable onPress={() => setQuote(i => (i + 1) % 4)} style={[styles.roundSmall, { marginLeft: 7 }]}><Text style={styles.roundGlyph}>›</Text></Pressable></View></View><ScrollView ref={quoteRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setQuote(Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width - 52)))} style={{ marginHorizontal: -17 }} contentContainerStyle={{ paddingHorizontal: 17 }}><View style={[styles.quoteTile, { width: Math.max(width - 86, 245) }]}><Text style={styles.quoteLabel}>{QUOTES[quote][0]}</Text><Text style={styles.quoteMain}>“{QUOTES[quote][1]}”</Text><Text style={styles.quoteMy} lang="my">{QUOTES[quote][2]}</Text><Text style={styles.quoteBy}>— Warren Buffett</Text></View></ScrollView><View style={styles.dots}>{QUOTES.map((_, i) => <View key={i} style={[styles.dot, quote === i && styles.dotActive]}/>)}</View></Surface>
    <View style={styles.quickActions}><Button title="＋  Log savings" onPress={onDeposit} variant="soft" style={{ flex: 1 }}/><Button title="＋  Add wishlist item" onPress={onAddItem} variant="light" style={{ flex: 1 }}/></View>
    <Text style={[styles.caption, { textAlign: 'center', marginBottom: 2 }]}>{tight ? 'Finny · small steps count' : 'Small steps, softer spending, brighter tomorrows.'}</Text>
  </ScreenScroll>;
}

function SavingsScreen({ data, saved, onDeposit }) {
  const progress = data.profile.goal ? Math.min(100, saved / data.profile.goal * 100) : 0;
  return <ScreenScroll title="Savings" subtitle="Every little deposit is a promise to future you." action={<Button title="＋ Add" onPress={onDeposit}/> }>
    <Surface style={styles.savingsHero}><View style={styles.donutOuter}><View style={[styles.donutProgress, { borderTopColor: progress > 25 ? COLORS.green : '#dcefe2', borderRightColor: progress > 50 ? COLORS.green : '#dcefe2', borderBottomColor: progress > 75 ? COLORS.green : '#dcefe2', borderLeftColor: progress > 100 ? COLORS.green : '#dcefe2', transform: [{ rotate: `${Math.min(progress, 99) * 3.6}deg` }] }]} /><View style={styles.donutCenter}><Text style={styles.donutPercent}>{Math.round(progress)}%</Text><Text style={styles.caption}>of your goal</Text></View></View><Text style={[styles.bigAmount, { textAlign: 'center', marginTop: 12 }]}>{formatMoney(saved, data.profile.currency)}</Text><Text style={[styles.muted, { textAlign: 'center' }]}>of {formatMoney(data.profile.goal, data.profile.currency)}</Text><Text style={[styles.streakText, { textAlign: 'center' }]}>🐷 Little by little, you’re getting there.</Text><Button title="＋  Log a deposit" onPress={onDeposit} style={{ marginTop: 17 }}/></Surface>
    <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Your deposits</Text><Text style={styles.caption}>{data.deposits.length} total</Text></View>
    {data.deposits.length === 0 ? <Empty emoji="🌱" title="Your first little win" body="Log a deposit and watch your goal grow." action="Log savings" onPress={onDeposit}/> : data.deposits.map(row => <Surface key={row.id} style={styles.listRow}><View style={styles.listEmoji}><Text>🐷</Text></View><View style={{ flex: 1 }}><Text style={styles.boldSmall}>{row.note || 'Savings deposit'}</Text><Text style={styles.caption}>{row.date || today()}</Text></View><Text style={styles.rowMoney}>+{formatMoney(row.amount, data.profile.currency)}</Text></Surface>)}
  </ScreenScroll>;
}

function Empty({ emoji, title, body, action, onPress }) { return <Surface style={styles.empty}><Text style={styles.emptyEmoji}>{emoji}</Text><Text style={styles.sectionTitle}>{title}</Text><Text style={[styles.bodyText, { textAlign: 'center' }]}>{body}</Text>{action ? <Button title={action} onPress={onPress} style={{ marginTop: 12 }}/> : null}</Surface>; }

function PipelineScreen({ data, onAddItem, onUpdateItem, onDeleteItem }) {
  const [filter, setFilter] = useState('all'); const [expanded, setExpanded] = useState({}); const [editing, setEditing] = useState(null); const [showAdd, setShowAdd] = useState(false); const { width } = useWindowDimensions(); const limit = width <= 428 ? 1 : 2;
  const items = data.items.filter(item => filter === 'all' || item.category === filter);
  const stageMove = async (item, stage) => {
    try { const next = { ...item, stage }; if (stage === 'ledger') next.purchased_on = today(); if (stage === 'abandoned') { next.purchased_on = item.purchased_on || today(); next.completedAt = new Date().toISOString(); } await onUpdateItem(next); }
    catch (error) { Alert.alert('Could not move item', error.message); }
  };
  const deleteRow = item => Alert.alert('Delete this item?', `“${item.name}” will be permanently removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDeleteItem(item).catch(error => Alert.alert('Could not delete item', error.message)) }]);
  return <ScreenScroll title="Mindful spending" subtitle="Give every purchase a moment to earn its place." action={<Button title="＋ Add" onPress={() => setShowAdd(true)}/> }>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{[['all','Everything'], ...CATEGORIES.map(cat => [cat.id, `${cat.emoji} ${cat.label}`])].map(([id, label]) => <Pressable key={id} onPress={() => setFilter(id)} style={[styles.filterChip, filter === id && styles.filterSelected]}><Text style={[styles.filterText, filter === id && styles.filterTextSelected]}>{label}</Text></Pressable>)}</ScrollView>
    <View style={styles.stageIntro}><Text style={styles.stageIntroEmoji}>🌱</Text><Text style={styles.caption}>Take a breath between wanting and deciding.</Text></View>
    {STAGES.map((stage, index) => {
      const stageItems = items.filter(item => item.stage === stage.id).sort((a,b) => stage.id === 'abandoned' ? new Date(b.completedAt || b.date || 0) - new Date(a.completedAt || a.date || 0) : 0);
      const isExpanded = !!expanded[stage.id]; const shown = isExpanded ? stageItems : stageItems.slice(0, limit); const more = stageItems.length > limit;
      return <Surface key={stage.id} style={styles.stageCard}><View style={styles.stageHeading}><View style={[styles.stageIcon, { backgroundColor: [COLORS.mint, COLORS.coral, COLORS.pink, '#e9e7fa'][index] }]}><Text>{stage.emoji}</Text></View><View style={{ flex: 1 }}><Text style={styles.stageTitle}>{stage.title}</Text><Text style={styles.caption}>{stageItems.length} {stageItems.length === 1 ? 'item' : 'items'}</Text></View><View style={styles.stageNum}><Text style={styles.caption}>0{index + 1}</Text></View></View>
        {stageItems.length === 0 ? <Text style={styles.stageEmpty}>Nothing here just yet</Text> : <><ScrollView nestedScrollEnabled style={isExpanded ? styles.stageScrollExpanded : undefined} scrollEnabled={isExpanded} showsVerticalScrollIndicator={isExpanded}>{shown.map(item => <PipelineItem key={item.id} item={item} stage={stage.id} currency={data.profile.currency} onMove={stageMove} onEdit={() => setEditing(item)} onDelete={() => deleteRow(item)}/>)}</ScrollView>{more && <Pressable onPress={() => setExpanded(old => ({ ...old, [stage.id]: !old[stage.id] }))} style={styles.seeMore}><Text style={styles.seeMoreText}>{isExpanded ? 'See Less' : 'See More'}  {isExpanded ? '⌃' : '⌄'}</Text></Pressable>}</>}
      </Surface>;
    })}
    {items.length === 0 && <Empty emoji="🛍️" title="A little space to think" body="Add something you’re considering. You can decide on it later." action="Add to wishlist" onPress={() => setShowAdd(true)}/>}
    <EntryModal value={showAdd ? { type: 'item' } : null} close={() => setShowAdd(false)} onAddItem={async payload => { try { await onAddItem(payload); setShowAdd(false); } catch(error) { Alert.alert('Could not add item', error.message); } }}/>
    <EntryModal value={editing ? { type: 'item', item: editing, edit: true } : null} close={() => setEditing(null)} onAddItem={async payload => { try { await onUpdateItem({ ...editing, ...payload }); setEditing(null); } catch(error) { Alert.alert('Could not update item', error.message); } }}/>
  </ScreenScroll>;
}

function PipelineItem({ item, stage, currency, onMove, onEdit, onDelete }) {
  const cat = CATEGORIES.find(value => value.id === item.category) || CATEGORIES[1];
  const IconButton = ({ icon, title, color, onPress }) => <Pressable accessibilityRole="button" accessibilityLabel={`${title}: ${item.name}`} onPress={onPress} style={[styles.iconAction, { backgroundColor: color }]}><Text style={styles.iconActionText}>{icon}</Text></Pressable>;
  return <View style={styles.itemCard}><View style={styles.rowBetween}><Text style={[styles.categoryPill, { backgroundColor: cat.color + '3a', color: COLORS.ink }]}>{cat.emoji} {cat.label}</Text><Text style={styles.caption}>{item.date || 'Today'}</Text></View><Text numberOfLines={2} style={styles.itemName}>{item.name}</Text><Text style={styles.itemAmount}>{formatMoney(item.amount, currency)}</Text>{item.note ? <Text numberOfLines={2} style={styles.caption}>{item.note}</Text> : null}
    {stage === 'wishlist' && <Button title="Move Forward  →  To Review" onPress={() => onMove(item, 'pending')} variant="soft" style={{ marginTop: 12, alignSelf: 'stretch' }}/>}
    {stage === 'pending' && <View style={styles.actionRow}><IconButton icon="✎" title="Edit" color={COLORS.mint} onPress={onEdit}/><IconButton icon="↩" title="Cancel review" color="#f4edd9" onPress={() => onMove(item, 'wishlist')}/><IconButton icon="⌫" title="Delete" color={COLORS.coral} onPress={onDelete}/><IconButton icon="✓" title="Confirm purchase" color="#dcefe2" onPress={() => onMove(item, 'ledger')}/></View>}
    {stage === 'ledger' && <View style={styles.actionRow}><IconButton icon="⌫" title="Delete" color={COLORS.coral} onPress={onDelete}/><IconButton icon="✓" title="Complete purchase" color="#dcefe2" onPress={() => onMove(item, 'abandoned')}/></View>}
    {stage === 'abandoned' && <View style={styles.archivedTag}><Text style={styles.archivedText}>✓  Purchase complete</Text></View>}
  </View>;
}

function AnalyticsScreen({ data, spent, confirmed, byCategory }) {
  const { width } = useWindowDimensions(); const insights = spent === 0 ? ['Your month is a fresh page. Add a confirmed purchase to see your spending picture.'] : spent > data.profile.monthlyBudget ? ['You’ve passed your monthly budget. Pause, review what matters, and give the rest of this month a little breathing room.'] : byCategory.need > spent * 0.7 ? ['Most of your spending is going toward essentials. Your mindful choices are keeping the basics covered.'] : byCategory.want > spent * 0.6 ? ['Wants are leading this month. A short pause before the next purchase can help your savings goal, too.'] : ['Your spending is finding a thoughtful balance. Keep making room for both needs and future goals.'];
  return <ScreenScroll title="Your money picture" subtitle="Clear, kind insights from your confirmed purchases.">
    <Surface style={styles.analyticsHero}><Label>CONFIRMED THIS MONTH</Label><Text style={styles.analyticsTotal}>{formatMoney(spent, data.profile.currency)}</Text><Text style={styles.muted}>{confirmed.length} completed or active purchases</Text><Progress percent={data.profile.monthlyBudget ? spent / data.profile.monthlyBudget * 100 : 0} color={spent > data.profile.monthlyBudget ? '#e99177' : COLORS.green}/><View style={styles.rowBetween}><Text style={styles.caption}>Budget · {formatMoney(data.profile.monthlyBudget, data.profile.currency)}</Text><Text style={styles.caption}>{data.profile.monthlyBudget ? Math.round(spent / data.profile.monthlyBudget * 100) : 0}%</Text></View></Surface>
    <Surface><View style={styles.rowBetween}><View><Label>WHERE IT GOES</Label><Text style={styles.sectionTitle}>Category balance</Text></View><Text style={styles.caption}>{formatMoney(spent, data.profile.currency)}</Text></View><Segments byCategory={byCategory} total={spent}/>{CATEGORIES.map(cat => <View key={cat.id} style={styles.analyticsRow}><View style={styles.row}><View style={[styles.legendDot, { backgroundColor: cat.color }]}/><Text style={styles.boldSmall}>{cat.emoji} {cat.label} {data.profile.language === 'my' ? `(${cat.my})` : ''}</Text></View><Text style={styles.analyticsAmount}>{formatMoney(byCategory[cat.id], data.profile.currency)} · {spent ? Math.round(byCategory[cat.id] / spent * 100) : 0}%</Text></View>)}</Surface>
    <Surface><View style={styles.row}><Text style={styles.insightPig}>🐷</Text><View style={{ flex: 1 }}><Label>PIGGY’S LITTLE INSIGHT</Label><Text style={styles.bodyText}>{insights[0]}</Text></View></View></Surface>
    <Text style={styles.sectionTitle}>Confirmed purchases</Text>{confirmed.length === 0 ? <Empty emoji="🌤️" title="A fresh start" body="Wishlist and review items don’t count as spending until you confirm a purchase."/> : confirmed.slice().sort((a,b) => new Date(b.purchased_on || b.date) - new Date(a.purchased_on || a.date)).map(item => { const cat = CATEGORIES.find(row => row.id === item.category) || CATEGORIES[1]; return <Surface key={item.id} style={styles.listRow}><Text style={{ fontSize: 20 }}>{cat.emoji}</Text><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.boldSmall}>{item.name}</Text><Text style={styles.caption}>{item.purchased_on || item.date} · {cat.label}</Text></View><Text style={styles.rowMoney}>{formatMoney(item.amount, data.profile.currency)}</Text></Surface>; })}
  </ScreenScroll>;
}

function SettingsScreen({ data, onSaveProfile, email }) {
  const [profile, setProfile] = useState(data.profile); const [saving, setSaving] = useState(false);
  useEffect(() => setProfile(data.profile), [data.profile]);
  const save = async () => { setSaving(true); try { await onSaveProfile(profile); Alert.alert('All set', 'Your settings have been saved.'); } catch(error) { Alert.alert('Could not save settings', error.message); } finally { setSaving(false); } };
  const patch = (field, value) => setProfile(old => ({ ...old, [field]: value }));
  return <ScreenScroll title="Settings" subtitle="Make Finny feel a little more like you.">
    <Surface><View style={styles.profileHead}><Text style={styles.profileAvatar}>{profile.avatar}</Text><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{profile.name || 'Friend'}</Text><Text style={styles.caption}>{email}</Text></View></View><Field label="Your name" value={profile.name} onChangeText={value => patch('name', value)} placeholder="Name"/><Field label="Savings goal" value={String(profile.goal)} onChangeText={value => patch('goal', Number(latinDigits(value) || 0))} keyboardType="decimal-pad"/><Field label="Monthly budget" value={String(profile.monthlyBudget)} onChangeText={value => patch('monthlyBudget', Number(latinDigits(value) || 0))} keyboardType="decimal-pad"/><Text style={styles.fieldLabel}>Currency</Text><View style={styles.chips}>{['THB','MMK','USD'].map(currency => <Pressable key={currency} onPress={() => patch('currency', currency)} style={[styles.filterChip, profile.currency === currency && styles.filterSelected]}><Text style={[styles.filterText, profile.currency === currency && styles.filterTextSelected]}>{currency}</Text></Pressable>)}</View><Text style={styles.fieldLabel}>Piggy avatar</Text><View style={styles.chips}>{['🐷','🐸','🐻','🐰','🐼','🦊'].map(avatar => <Pressable key={avatar} onPress={() => patch('avatar', avatar)} style={[styles.avatarChoice, profile.avatar === avatar && styles.avatarChoiceSelected]}><Text style={{ fontSize: 22 }}>{avatar}</Text></Pressable>)}</View></Surface>
    <Surface><Label>LANGUAGE</Label><Text style={styles.caption}>Choose your language here. The sign-in screen stays simple.</Text><View style={styles.languageList}>{[['en','English'],['my','မြန်မာ'],['th','ไทย'],['ja','日本語']].map(([id, name]) => <Pressable key={id} onPress={() => patch('language', id)} style={styles.languageRow}><Text style={styles.languageName}>{name}</Text><Text style={[styles.radio, profile.language === id && styles.radioActive]}>{profile.language === id ? '●' : '○'}</Text></Pressable>)}</View></Surface>
    <Surface><View style={styles.rowBetween}><View style={{ flex: 1, marginRight: 10 }}><Text style={styles.boldSmall}>Daily logging reminder</Text><Text style={styles.caption}>A gentle nudge to check in with your money.</Text></View><Switch value={profile.reminders} onValueChange={value => patch('reminders', value)} trackColor={{ true: '#a9cfb2' }}/></View></Surface>
    <Button title={saving ? 'Saving…' : 'Save settings'} onPress={save} disabled={saving}/><Button title="Sign out" variant="light" onPress={() => supabase.auth.signOut().catch(error => Alert.alert('Could not sign out', error.message))} style={{ marginTop: 9 }}/><Text style={[styles.caption, { textAlign: 'center' }]}>Your account stays private and syncs securely.</Text>
  </ScreenScroll>;
}

function EntryModal({ value, close, onDeposit, onAddItem }) {
  const visible = !!value;
  const isDeposit = value?.type === 'deposit'; const editing = !!value?.edit; const initial = value?.item;
  const [amount, setAmount] = useState(''); const [name, setName] = useState(''); const [category, setCategory] = useState('want'); const [date, setDate] = useState(today()); const [note, setNote] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (visible) { setAmount(String(initial?.amount ?? '')); setName(initial?.name || ''); setCategory(initial?.category || 'want'); setDate(String(initial?.date || today()).slice(0,10)); setNote(initial?.note || ''); setSaving(false); } }, [visible, initial?.id]);
  const submit = async () => {
    const amountNum = Number(latinDigits(amount));
    if (!amountNum || amountNum < 0 || (isDeposit && amountNum <= 0) || (!isDeposit && !name.trim())) { Alert.alert('Check your entry', isDeposit ? 'Enter an amount greater than zero.' : 'Add an item name and a price.'); return; }
    setSaving(true);
    try { const payload = isDeposit ? { amount: amountNum, note: note.trim(), date } : { name: name.trim(), amount: amountNum, category, date, note: note.trim() }; await (isDeposit ? onDeposit(payload) : onAddItem(payload)); }
    catch(error) { Alert.alert('Could not save', error.message); }
    finally { setSaving(false); }
  };
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={close}><View style={styles.modalBackdrop}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}><View style={styles.modalSheet}><View style={styles.modalHandle}/><View style={styles.rowBetween}><View><Label>{editing ? 'PENDING REVIEW' : isDeposit ? 'A LITTLE WIN' : 'SPENDING PIPELINE'}</Label><Text style={styles.modalTitle}>{editing ? 'Edit item' : isDeposit ? 'Log savings' : 'Add to wishlist'}</Text></View><Pressable onPress={close} style={styles.modalClose}><Text style={styles.roundGlyph}>×</Text></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    {!isDeposit && <Field label="Item name" value={name} onChangeText={setName} placeholder="What are you considering?"/>}
    <Field label={isDeposit ? 'Amount' : 'Price'} value={amount} onChangeText={value => setAmount(latinDigits(value))} placeholder="0" keyboardType="decimal-pad"/>
    {!isDeposit && <><Text style={styles.fieldLabel}>Category</Text><View style={styles.chips}>{CATEGORIES.map(cat => <Pressable key={cat.id} onPress={() => setCategory(cat.id)} style={[styles.filterChip, category === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}><Text style={styles.filterText}>{cat.emoji} {cat.label}</Text></Pressable>)}</View></>}
    <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder={today()}/><Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Add a note" multiline/>
    </ScrollView><View style={styles.modalButtons}><Button title="Cancel" onPress={close} variant="light" style={{ flex: 1 }}/><Button title={saving ? 'Saving…' : editing ? 'Save changes' : isDeposit ? 'Add deposit' : 'Add to wishlist'} onPress={submit} disabled={saving} style={{ flex: 1 }}/></View></View></KeyboardAvoidingView></View></Modal>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg }, centered: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 28 }, authSafe: { flex: 1, backgroundColor: COLORS.bg }, authTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 26, gap: 8 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 6 }, brandPig: { fontSize: 27 }, brandText: { fontSize: 25, fontWeight: '800', color: COLORS.dark, letterSpacing: -1 }, screen: { flex: 1 }, topBar: { height: 52, paddingHorizontal: 19, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }, avatarButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.mint }, avatar: { fontSize: 21 }, toast: { position: 'absolute', zIndex: 5, top: 56, alignSelf: 'center', backgroundColor: COLORS.dark, color: 'white', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, fontSize: 12 }, syncLine: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 7, paddingBottom: 3 }, syncText: { color: COLORS.muted, fontSize: 11 }, tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopColor: COLORS.line, borderTopWidth: 1, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 3 : 8 }, tabItem: { flex: 1, alignItems: 'center', gap: 2 }, tabIcon: { fontSize: 21, color: '#a3aea8', lineHeight: 24 }, tabActive: { color: COLORS.green }, tabLabel: { color: '#99a49e', fontSize: 10, fontWeight: '600' }, tabLabelActive: { color: COLORS.green }, pageContent: { paddingHorizontal: 17, paddingTop: 13, paddingBottom: 24, gap: 12 }, pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }, pageTitle: { fontSize: 27, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7, color: COLORS.ink, marginTop: 2 }, pageSubtitle: { fontSize: 13, lineHeight: 19, color: COLORS.muted, marginTop: 3 }, eyebrow: { fontSize: 9, letterSpacing: 1.1, fontWeight: '800', color: COLORS.muted, marginBottom: 4 }, surface: { backgroundColor: COLORS.white, borderRadius: 19, padding: 17, borderWidth: 1, borderColor: '#efeee7', marginBottom: 1 }, row: { flexDirection: 'row', alignItems: 'center' }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, goalCard: { backgroundColor: '#edf4e9' }, bigAmount: { color: COLORS.ink, fontSize: 27, fontWeight: '800', letterSpacing: -0.7, marginTop: 4 }, muted: { color: COLORS.muted, fontSize: 12, marginTop: 2 }, pigBubble: { width: 57, height: 57, borderRadius: 21, backgroundColor: '#dcefe2', alignItems: 'center', justifyContent: 'center' }, track: { height: 9, backgroundColor: '#e9eee6', borderRadius: 8, marginTop: 16, marginBottom: 8, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 8 }, caption: { color: COLORS.muted, fontSize: 11, lineHeight: 16 }, streakBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, padding: 11, borderRadius: 14, backgroundColor: '#ffffff9c' }, boldSmall: { fontSize: 13, fontWeight: '700', color: COLORS.ink }, budgetCard: { backgroundColor: '#fffefa' }, sectionTitle: { fontSize: 17, color: COLORS.ink, fontWeight: '700', marginTop: 1 }, healthPill: { fontWeight: '700', fontSize: 11 }, metricAmount: { fontSize: 20, fontWeight: '800', color: COLORS.ink, marginTop: 11 }, pipelineMini: { backgroundColor: '#fbf1ec' }, linkArrow: { color: COLORS.green, fontSize: 20 }, countRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 16 }, countNum: { fontWeight: '800', fontSize: 19, textAlign: 'center', color: COLORS.ink }, countDivider: { height: 31, width: 1, backgroundColor: '#e9ddd5' }, textLink: { color: COLORS.green, fontWeight: '700', fontSize: 12 }, segmentBar: { flexDirection: 'row', height: 10, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f0f0eb', marginTop: 15, gap: 2 }, legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 11 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, legendDot: { width: 7, height: 7, borderRadius: 5 }, legendText: { fontSize: 10, color: COLORS.muted }, legendPercent: { color: COLORS.ink, fontWeight: '700' }, quoteTile: { backgroundColor: '#f5eee0', borderRadius: 15, marginTop: 12, padding: 14, minHeight: 145 }, quoteLabel: { fontSize: 10, fontWeight: '800', color: '#987e53', letterSpacing: 0.5 }, quoteMain: { color: COLORS.ink, fontSize: 13, lineHeight: 19, fontStyle: 'italic', marginTop: 9 }, quoteMy: { color: '#77857b', fontSize: 12, lineHeight: 18, marginTop: 5 }, quoteBy: { color: '#927c5c', fontSize: 10, textAlign: 'right', marginTop: 4 }, roundSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }, roundGlyph: { fontSize: 21, color: COLORS.green, lineHeight: 24 }, dots: { flexDirection: 'row', alignSelf: 'center', gap: 5, marginTop: 10 }, dot: { width: 5, height: 5, backgroundColor: '#d4d2c8', borderRadius: 3 }, dotActive: { width: 14, backgroundColor: COLORS.green }, quickActions: { flexDirection: 'row', gap: 8, marginBottom: 3 }, button: { backgroundColor: COLORS.dark, borderRadius: 13, minHeight: 43, paddingHorizontal: 14, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }, buttonLight: { backgroundColor: '#f0f1eb' }, buttonSoft: { backgroundColor: '#dcefe2' }, buttonDanger: { backgroundColor: COLORS.coral }, buttonText: { color: 'white', fontSize: 12, fontWeight: '700', textAlign: 'center' }, buttonTextAlt: { color: COLORS.dark }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }, authWrap: { flex: 1, justifyContent: 'center', padding: 20 }, authCard: { padding: 22 }, authEmoji: { fontSize: 35, marginBottom: 12 }, authTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 25, marginTop: 7 }, authSub: { color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 17 }, authToggle: { paddingTop: 17, alignItems: 'center' }, authToggleText: { color: COLORS.green, fontSize: 12, fontWeight: '700' }, bodyCenter: { color: COLORS.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 8 }, setupHint: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 19, marginTop: 14 }, field: { marginTop: 11 }, fieldLabel: { fontSize: 11, fontWeight: '700', color: '#607169', marginBottom: 6, marginTop: 12 }, input: { minHeight: 45, borderColor: COLORS.line, borderWidth: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.ink }, multiline: { minHeight: 70, textAlignVertical: 'top' }, filterRow: { gap: 7, paddingVertical: 2 }, filterChip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8 }, filterSelected: { backgroundColor: COLORS.dark, borderColor: COLORS.dark }, filterText: { fontSize: 11, fontWeight: '700', color: COLORS.muted }, filterTextSelected: { color: 'white' }, stageIntro: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 }, stageIntroEmoji: { fontSize: 17 }, stageCard: { padding: 13, marginBottom: 0 }, stageHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }, stageIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, stageTitle: { fontWeight: '800', fontSize: 15, color: COLORS.ink }, stageNum: { borderRadius: 12, backgroundColor: '#f7f6f1', paddingHorizontal: 8, paddingVertical: 5 }, stageEmpty: { paddingVertical: 18, textAlign: 'center', color: '#99a49e', fontSize: 12 }, stageScrollExpanded: { maxHeight: 320 }, seeMore: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 7, marginTop: 7 }, seeMoreText: { color: COLORS.green, fontWeight: '700', fontSize: 11 }, itemCard: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: '#fff', borderRadius: 14, padding: 12, marginTop: 4, marginBottom: 8 }, categoryPill: { borderRadius: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '700' }, itemName: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: COLORS.ink, marginTop: 10 }, itemAmount: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginTop: 2 }, actionRow: { flexDirection: 'row', gap: 10, marginTop: 11 }, iconAction: { width: 38, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, iconActionText: { color: COLORS.dark, fontSize: 17, fontWeight: '700' }, archivedTag: { marginTop: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: COLORS.mint, alignItems: 'center' }, archivedText: { color: COLORS.green, fontWeight: '700', fontSize: 11 }, empty: { alignItems: 'center', padding: 22 }, emptyEmoji: { fontSize: 34, marginBottom: 9 }, bodyText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }, stageIntroEmoji: { fontSize: 17 }, savingsHero: { alignItems: 'center', paddingVertical: 23 }, donutOuter: { width: 142, height: 142, borderRadius: 71, backgroundColor: '#e7f1e9', alignItems: 'center', justifyContent: 'center' }, donutProgress: { position: 'absolute', width: 142, height: 142, borderRadius: 71, borderWidth: 9, borderColor: COLORS.green }, donutCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, width: 112, height: 112, borderRadius: 56 }, donutPercent: { fontSize: 27, fontWeight: '800', color: COLORS.ink }, streakText: { fontSize: 12, color: COLORS.green, marginTop: 11 }, listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }, listEmoji: { width: 35, height: 35, borderRadius: 12, backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center' }, rowMoney: { color: COLORS.green, fontWeight: '800', fontSize: 13 }, analyticsHero: { backgroundColor: '#edf4e9' }, analyticsTotal: { fontSize: 32, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.8, marginTop: 8 }, analyticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }, analyticsAmount: { color: COLORS.muted, fontSize: 11, fontWeight: '700' }, insightPig: { fontSize: 30, marginRight: 10 }, profileHead: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }, profileAvatar: { width: 53, height: 53, textAlign: 'center', textAlignVertical: 'center', borderRadius: 18, overflow: 'hidden', backgroundColor: COLORS.mint, fontSize: 31 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 }, avatarChoice: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#f4f4ef', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' }, avatarChoiceSelected: { borderColor: COLORS.green, backgroundColor: COLORS.mint }, languageList: { marginTop: 8 }, languageRow: { flexDirection: 'row', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: COLORS.line, justifyContent: 'space-between' }, languageName: { color: COLORS.ink, fontSize: 13 }, radio: { color: '#c5ccc5' }, radioActive: { color: COLORS.green }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#1e322966' }, modalKeyboard: { width: '100%' }, modalSheet: { maxHeight: '92%', backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 19, paddingTop: 11, paddingBottom: Platform.OS === 'ios' ? 28 : 17 }, modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#d4d5cb', alignSelf: 'center', marginBottom: 13 }, modalTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '800' }, modalClose: { backgroundColor: '#eeeee7', width: 33, height: 33, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, modalButtons: { flexDirection: 'row', gap: 9, marginTop: 14 }, stageIntroEmoji: { fontSize: 17 },
});
