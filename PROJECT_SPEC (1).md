# Finny — Financial Planning & Piggy Savings Application

## Comprehensive Project Specification & Developer Reference (`PROJECT_SPEC.md`)

> **Document Version:** 1.2.0  
> **Target Audience:** AI Coding Agents (Cursor / Claude), Full-Stack Developers, Android/Web Engineers  
> **Project Scope:** Multi-User Personal Finance, Clean Distraction-Free Auth UI, Default Home Dashboard, Piggy Savings Goal Tracker, Wishlist-to-Expense Stage Pipeline, Smart Analytics, Exclusive Settings Language Switcher, and Financial Wisdom Blog.

---

## 1\. Project Overview & Architecture

### 1.1 Application Purpose

**Finny** is a personal financial companion designed to transform impulsive spending into structured savings. The app encourages mindful financial habits through:

- **Clean & Simple Auth UI**: Minimalist Login and Signup screens with ZERO clutter. No language toggles, tabs, social buttons, or external links.  
- **Home / Dashboard (`HomeScreen`)**: The primary default landing screen after login featuring current savings progress, Finny AI daily motivational prompts, monthly expense category breakdowns, and Warren Buffett financial wisdom blog cards.  
- **Target Savings Tracker (`SavingsScreen`)**: Goal-oriented savings logs with dynamic progress visualizations, donut charts, and deposit entry management.  
- **4-Stage Decision Pipeline (`PipelineScreen`)**: A multi-stage queue where purchases start as *Wishlist* items, advance to *Selected Items (Pending Review)*, move into *Confirmed Expenses (Expense Ledger)* upon purchase, or transition to *Abandoned Items (Trash/Archive)*.  
- **Three-Tier Expense Classification**: Every item is tagged as **Need (Essential)**, **Want (Wishlist)**, or **Have But Emergency** to analyze mindful vs. impulsive spending.  
- **Smart Piggy Financial Analytics (`AnalyticsScreen`)**: Real-time spending breakdowns, budget health scores, and contextual advice.  
- **Settings & Isolated Language Control (`SettingsScreen`)**: User profile, target goal configuration, mascot avatars, cloud sync, and centralized language switching (English, Myanmar, Thai, Japanese). Language controls are strictly excluded from Auth/Signup screens.  
- **Strict User Isolation & Cloud Sync**: Seamless multi-user authentication backed by Supabase with Row Level Security (RLS) and offline-first local persistence.  
- **Global Multi-Language Support**: Full UTF-8 Unicode encoding supporting **English**, **Myanmar (Burmese)**, **Thai**, and **Japanese**, including bidirectional normalization for Burmese digits (`၀-၉` ↔ `0-9`).

---

## 2\. Authentication, Navigation & Clean Auth UI Rules

### 2.1 Clean & Minimalist Authentication Screen Rules

1. **Unauthenticated State**: Displays `ProtectedAuthScreen` / Login & Signup interface.  
2. **STRICT REQUIREMENT — No Language Selectors on Auth Screen**:  
   - The Login and Account Creation (Signup) screens MUST NOT contain any language selection tabs, dropdowns, or buttons (e.g., English, မြန်မာ, ထိုင်း, ဂျပန်).  
   - The UI must be completely clean, minimal, and uncluttered.  
   - It should ONLY display:  
     - Finny App Logo / Title  
     - Email Input Field  
     - Password Input Field  
     - Primary Login / Sign Up Action Button  
     - Simple text toggle to switch between "Sign In" and "Create Account".  
3. **Default Landing Screen After Authentication**:  
   - Upon successful Login, Signup, or Auto-login session restoration, the application MUST automatically navigate to the **Home / Dashboard (`HomeScreen`)** tab by default.

---

### 2.2 Navigation Structure (5 Primary Tabs)

Finny features 5 primary navigation tabs (Sidebar rail on Web/Desktop, Bottom navigation bar on Mobile):

1. 🏠 **Home (`HomeScreen`)** — Default Primary Landing Page  
2. 🐷 **Savings (`SavingsScreen`)** — Target Savings Tracker & Deposit Log  
3. 🛍️ **Spending (`PipelineScreen`)** — 4-Stage Decision Pipeline (Wishlist → Ledger)  
4. 📊 **Analytics (`AnalyticsScreen`)** — Financial Health, Category Ratios & Piggy Insights  
5. ⚙️ **Settings (`SettingsScreen`)** — Profile, Goals, Avatars & Exclusive Language Control

---

## 3\. Screen Specifications & Features

### 3.1 Home / Dashboard Screen (`HomeScreen`) — Default Primary Page

- **Section A: Savings Progress & Finny AI Encouragement**:  
  - **Progress Card**: Visual progress bar displaying total saved amount vs target goal (e.g., `5,000 THB / 10,000 THB - 50%`).  
  - **Finny AI Motivational Banner**:  
      
    > *"ဒီနေ့အတွက် မင်း စုထားတာ ဒီလောက် ရှိပြီ။ ဆက်လက် ကြိုးစားပါ။ တစ်ဖြည်းဖြည်းချင်း စုသွားရင် မင်းရဲ့ လိုရာခရီး ပန်းတိုင် ရောက်ပါလိမ့်မယ်။ 🐷✨"*

    
- **Section B: Expense Summary & 3 Category Breakdown**:  
  - Shows total confirmed expenses for the current month.  
  - Category breakdown row showing spent amounts for:  
    - 🥦 **Needs (မရှိမဖြစ်)** — Mint Green style.  
    - 🎀 **Wants (လိုချင်သော)** — Pastel Pink style.  
    - 🚨 **Emergency (အရေးပေါ်)** — Coral/Orange style.  
- **Section C: Financial Wisdom & Warren Buffett Blog Cards (4 Cards)**:  
  1. **Card 1: စုဆောင်းခြင်း အလေ့အကျင့် (Saving First)**  
     *Quote*: "Do not save what is left after spending, but spend what is left after saving."  
     *Myanmar*: "မသုံးစွဲမီ အရင်စုပါ၊ သုံးစွဲပြီးမှ ကျန်တာကို မစုပါနဲ့။"  
  2. **Card 2: မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း (Best Investment)**  
     *Quote*: "The best investment you can make is an investment in yourself."  
     *Myanmar*: "အကောင်းဆုံး ရင်းနှီးမြှုပ်နှံမှုဟာ မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း ဖြစ်ပါတယ်။"  
  3. **Card 3: စိတ်လိုက်မာန်ပါ မသုံးမိစေရန် (Mindful Spending)**  
     *Quote*: "If you buy things you do not need, soon you will have to sell things you need."  
     *Myanmar*: "မလိုအပ်တဲ့ အရာတွေကို အရင်ဝယ်ယူနေရင် မကြာခင်မှာ လိုအပ်တာတွေကို ပြန်ရောင်းရပါလိမ့်မယ်။"  
  4. **Card 4: ရေရှည် ပန်းတိုင်နှင့် စိတ်ရှည်မှု (Long-term Vision)**  
     *Quote*: "Someone's sitting in the shade today because someone planted a tree a long time ago."  
     *Myanmar*: "ဒီနေ့ သစ်ရိပ်ခိုနေရတာဟာ လွန်ခဲ့တဲ့ နှစ်ပေါင်းများစွာက သစ်ပင် စိုက်ပျိုးခဲ့လို့ ဖြစ်ပါတယ်။"

---

### 3.2 Savings Tab (`SavingsScreen`)

- Target Savings Status Donut Chart with remaining amount needed calculation.  
- Log Savings Deposit Modal with date, amount, and note.  
- Deposit history timeline.

---

### 3.3 Spending & Wishlist Pipeline (`PipelineScreen`)

- 4-Stage Lifecycle: `WISHLIST` → `PENDING_REVIEW` → `EXPENSE_LEDGER` → `ABANDONED`.  
- Tag Segmented Control: Needs (Essential), Wants (Wishlist), Emergency.

---

### 3.4 Analytics Tab (`AnalyticsScreen`)

- Confirmed Expenses Summary aggregated from `EXPENSE_LEDGER`.  
- Needs vs. Wants vs. Emergency Ratio bar.  
- Rule-based Piggy Smart Insights.

---

### 3.5 Settings & Language Control (`SettingsScreen`)

- **Centralized Language Switcher**: Language selection options (`en`, `my`, `th`, `ja`) are placed STRICTLY inside the Settings screen only.  
- **Avatar Selector**: 6 cute piggy/animal mascot avatars.  
- **Target Goal Configuration**: Goal amount and cycle duration settings.  
- **Cloud Sync & Logout**: Manual sync with Supabase PostgreSQL and secure sign-out.

---

## 4\. Multi-Language (i18n) & Burmese Digit Normalization

- Full Unicode support across English (`en`), Myanmar (`my`), Thai (`th`), and Japanese (`ja`).  
- Burmese digits mapping function (`၀-၉` ↔ `0-9`) integrated into numeric inputs (`cleanNumericInput()`).

---

## 5\. Guidelines for AI Coding Agents (Cursor / Claude)

1. **Clean Auth UI**: Do NOT render any language buttons, tabs, or pickers on the Login or Signup forms. Keep it pure and simple with only Email, Password, Action Button, and Sign In/Sign Up toggle link.  
2. **Language Switching**: Move ALL language selection controls exclusively to the `SettingsScreen`.  
3. **Default Landing**: Always direct the user to `HomeScreen` immediately after successful login, signup, or app start.  
4. **5-Tab Rail/Bar**: Include `Home`, `Savings`, `Spending`, `Analytics`, and `Settings`.  
5. **Full Unicode Support**: Ensure all input fields for names and notes accept pure Unicode strings.