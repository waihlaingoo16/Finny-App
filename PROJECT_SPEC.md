# Finny — Financial Planning & Piggy Savings Application
## Comprehensive Project Specification & Developer Reference (`PROJECT_SPEC.md`)

> **Document Version:** 1.7.0  
> **Target Audience:** AI Coding Agents (Cursor / Claude), Full-Stack Developers, Android/Web Engineers  
> **Project Scope:** Multi-User Personal Finance, Clean Distraction-Free Auth UI, Interactive Home Dashboard, Quick Action FAB, Piggy Savings Goal Tracker, Gamification & Streaks, Wishlist-to-Expense Pipeline, Smart Analytics, Buffett Quote Carousel, and Exclusive Settings Language Control.

---

## 1. Project Overview & Architecture

### 1.1 Application Purpose
**Finny** is an intelligent personal financial companion designed to transform impulsive spending into structured savings. The app encourages mindful financial habits through:
- **Clean & Distraction-Free Auth UI**: Minimalist Login/Signup interface without language toggles, social links, or unnecessary controls.
- **Interactive Home Dashboard (`HomeScreen`)**: Default primary screen featuring Savings Progress, Budget Health Bar, Finny AI Motivational Prompts, 4-Stage Pipeline Mini-Summary Widget, Category Segmented Breakdown, and a compact **Warren Buffett Daily Wisdom Carousel/Slider**.
- **Global Quick Action Floating Action Button (FAB)**: A primary `+` action button available directly on the Dashboard and main views for instant logging of savings deposits or expenses without full tab switches.
- **Gamification & Mascot Interaction**: Dynamic Piggy Mascot moods (happy, excited, sleepy) based on savings progress and a **Savings Streak Counter** (e.g., "၅ ရက်ဆက်တိုက် စုငွေ မှတ်ထားပြီးပါပြီ 🔥").
- **Target Savings Tracker (`SavingsScreen`)**: Goal-oriented savings logs with dynamic progress visualizations, donut charts, deposit entry management, and streak tracking.
- **4-Stage Decision Pipeline (`PipelineScreen`)**: Purchases transition from *Wishlist* → *Selected (Pending Review)* → *Confirmed Expenses (Expense Ledger)* → *Abandoned (Trash/Archive)*.
- **Three-Tier Expense Classification**: Categorized into **Need (Essential)**, **Want (Wishlist)**, or **Have But Emergency** with visual percentage distribution bars.
- **Smart Piggy Financial Analytics (`AnalyticsScreen`)**: Real-time spending breakdowns, budget health scores, and contextual advice.
- **Settings & Isolated Language Control (`SettingsScreen`)**: User profile, target goal configuration, mascot avatars, cloud sync, and centralized language switching (English, Myanmar, Thai, Japanese). Language controls are strictly excluded from Auth/Signup screens.
- **Sidebar Profile Footer**: Desktop/Tablet navigation rail featuring user avatar, email badge, and quick logout control at the bottom.
- **Global Multi-Language & Unicode Support**: Full UTF-8 Unicode encoding supporting **English**, **Myanmar (Burmese)**, **Thai**, and **Japanese**, including bidirectional normalization for Burmese digits (`၀-၉` ↔ `0-9`).

---

## 2. Authentication, Navigation & Sidebar Structure

### 2.1 Clean & Minimalist Authentication Screen Rules
1. **Unauthenticated State**: Displays `ProtectedAuthScreen` / Login & Signup interface.
2. **STRICT REQUIREMENT — No Language Selectors on Auth Screen**:
   - The Login and Account Creation (Signup) screens MUST NOT contain any language selection tabs, dropdowns, or buttons (e.g., English, မြန်မာ, ထိုင်း, ဂျပန်).
   - UI must remain minimal: App Logo, Email Input, Password Input, Primary Action Button, and a simple toggle link ("Sign In" / "Create Account").
3. **Default Landing Screen After Authentication**:
   - Automatically navigates to **Home / Dashboard (`HomeScreen`)** upon successful login, signup, or session restore.

---

### 2.2 Navigation Structure (5 Primary Tabs & Sidebar Profile Footer)

Finny features 5 primary navigation tabs (Sidebar Rail on Web/Desktop, Bottom Bar on Mobile):
1. 🏠 **Home (`HomeScreen`)** — Default Primary Landing Page & Interactive Dashboard
2. 🐷 **Savings (`SavingsScreen`)** — Target Savings Tracker, Deposit Log & Streak Counter
3. 🛍️ **Spending (`PipelineScreen`)** — 4-Stage Decision Pipeline (Wishlist → Ledger)
4. 📊 **Analytics (`AnalyticsScreen`)** — Financial Health, Category Ratios & Piggy Insights
5. ⚙️ **Settings (`SettingsScreen`)** — Profile, Goals, Avatars & Exclusive Language Control

**Sidebar Profile Footer (Web/Desktop View)**:
- Positioned at the bottom of the sidebar.
- Displays active User Avatar, User Email address, and a Quick Logout button.

---

## 3. Detailed Screen Specifications

### 3.1 Home / Dashboard Screen (`HomeScreen`) — Default Primary Page

#### A. Global Quick Action FAB (Floating Action Button)
- Prominent Floating Action Button (`+`) on the Dashboard.
- Tapping opens a Quick Modal selector:
  - 🐷 **Log Savings Deposit** (Opens Savings Entry Dialog)
  - 🛍️ **Add Spending / Wishlist Item** (Opens Pipeline Entry Dialog)

#### B. Savings Progress & Gamified Finny AI Card
- **Progress Card**: Visual progress bar showing total saved vs goal (e.g., `3,500 THB / 10,000 THB - 35%`).
- **Savings Streak Badge**: Display streak counter (e.g., "🔥 ၅ ရက်ဆက်တိုက် စုငွေ စာရင်းသွင်းထားသည်").
- **Dynamic Piggy Mascot**: Changes mood depending on progress:
  - $< 25\%$: Encouraging / Neutral Piggy
  - $25\% - 75\%$: Happy / Smiling Piggy
  - $> 75\%$: Excited / Celebration Piggy
- **Finny AI Motivational Banner**:
  > *"ဒီနေ့အတွက် မင်း စုထားတာ ဒီလောက် ရှိပြီ။ ဆက်လက် ကြိုးစားပါ။ တစ်ဖြည်းဖြည်းချင်း စုသွားရင် မင်းရဲ့ လိုရာခရီး ပန်းတိုင် ရောက်ပါလိမ့်မယ်။ 🐷✨"*

#### C. Monthly Expense Budget Health Bar & 4-Stage Mini Widget
- **Monthly Budget Cap Bar**: Shows spent amount vs monthly budget limit (e.g., `20.00 / 5,000 THB`).
  - Green indicator ($< 50\%$), Yellow ($50\% - 85\%$), Red warning ($> 85\%$).
- **4-Stage Pipeline Mini Summary**:
  - Badge showing active items count: `Wishlist: X items` | `Pending Review: Y items`.
  - Direct quick link to open Spending Tab.

#### D. Expense Category Breakdown with Visual Segmented Bar
- Displays total confirmed expenses for the active month.
- Segmented visual distribution bar displaying ratio split between:
  - 🥦 **Needs (မရှိမဖြစ်)** — Mint Green badge & segment.
  - 🎀 **Wants (လိုချင်သော)** — Pastel Pink badge & segment.
  - 🚨 **Emergency (အရေးပေါ်)** — Coral/Orange badge & segment.

#### E. Warren Buffett Daily Wisdom Carousel (Horizontal Slider)
- Compact interactive horizontal Carousel/Slider (saves screen height on mobile).
- Auto-rotates or allows manual swipe/arrow navigation through 4 curated quotes:
  1. **စုဆောင်းခြင်း အလေ့အကျင့်**: "Do not save what is left after spending, but spend what is left after saving." (*မသုံးစွဲမီ အရင်စုပါ၊ သုံးစွဲပြီးမှ ကျန်တာကို မစုပါနဲ့။*)
  2. **မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း**: "The best investment you can make is an investment in yourself." (*အကောင်းဆုံး ရင်းနှီးမြှုပ်နှံမှုဟာ မိမိကိုယ်ကို ရင်းနှီးမြှုပ်နှံခြင်း ဖြစ်ပါတယ်။*)
  3. **စိတ်လိုက်မာန်ပါ မသုံးမိစေရန်**: "If you buy things you do not need, soon you will have to sell things you need." (*မလိုအပ်တဲ့ အရာတွေကို အရင်ဝယ်ယူနေရင် မကြာခင်မှာ လိုအပ်တာတွေကို ပြန်ရောင်းရပါလိမ့်မယ်။*)
  4. **ရေရှည် ပန်းတိုင်နှင့် စိတ်ရှည်မှု**: "Someone's sitting in the shade today because someone planted a tree a long time ago." (*ဒီနေ့ သစ်ရိပ်ခိုနေရတာဟာ လွန်ခဲ့တဲ့ နှစ်ပေါင်းများစွာက သစ်ပင် စိုက်ပျိုးခဲ့လို့ ဖြစ်ပါတယ်။*)

---

### 3.2 Savings Tab (`SavingsScreen`)
- Donut Progress Chart with remaining target calculation.
- Log Savings Modal (`amount`, `date`, `note`).
- Deposit History Log with delete/edit options.
- Active Streak Counter integration.

---

### 3.3 Spending & Wishlist Pipeline (`PipelineScreen`)
- 4-Stage Queue: `WISHLIST` → `PENDING_REVIEW` → `EXPENSE_LEDGER` → `ABANDONED`.
- Tag Segmented Filters: Needs, Wants, Emergency.
- Quick action to advance items between stages.

---

### 3.4 Analytics Tab (`AnalyticsScreen`)
- Expense summary aggregated from `EXPENSE_LEDGER`.
- Ratio breakdown bar and spending category percentages.
- Smart Piggy rule-based contextual advice.

---

### 3.5 Settings & Language Control (`SettingsScreen`)
- **Exclusive Language Switcher**: Language options (`en`, `my`, `th`, `ja`) placed STRICTLY inside Settings only.
- **Monthly Budget Cap Config**: Input field to set monthly spending limit.
- **Reminder Notification Toggles**: Enable/disable daily logging reminders.
- **Avatar Selector**: 6 cute piggy/animal mascot avatars.
- **Target Goal Config**: Savings goal amount & target timeline.
- **Cloud Sync & Account Logout**.

---

## 4. Multi-Language (i18n) & Burmese Digit Normalization

- Full Unicode support for English (`en`), Myanmar (`my`), Thai (`th`), and Japanese (`ja`).
- Burmese digit converter (`၀-၉` ↔ `0-9`) integrated into all numeric inputs (`cleanNumericInput()`).

---

## 5. Summary Guidelines for AI Coding Agents (Cursor / Claude)

1. **Clean Auth Screen**: Keep Login/Signup strictly minimal without any language selectors or tabs.
2. **Language Switching**: Keep language switcher exclusively inside `SettingsScreen`.
3. **Interactive Home Dashboard**: Implement the Floating Action Button (`+`), Quick Action Dialogs, Budget Health Bar, Pipeline Mini Summary, Category Segmented Bar, and **Warren Buffett Horizontal Carousel**.
4. **Sidebar Profile Footer**: Place user avatar, email, and sign-out button at the bottom of the sidebar navigation rail.
5. **Gamification**: Implement dynamic mascot states and savings streak tracking.
---

## 3.6 Version 1.6.0 — Four-Stage Spending Workflow and Controls

The user-facing stages map to the persisted stage values as follows:

1. **Wishlist** (`WISHLIST` / `wishlist`): Each item card has one styled **Move Forward** button, which promotes the item to Stage 2.
2. **To Review** (`PENDING_REVIEW` / `pending`): Each item card has exactly four compact, icon-only action buttons: **Edit** (pencil), **Cancel** (revert arrow), **Delete** (trash), and **Confirm** (check). Edit opens a modal for name, price, date, category tag, and note. Cancel returns the item to Wishlist. Delete permanently removes it. Confirm advances it to Stage 3.
3. **Purchase** (`PURCHASE` / `EXPENSE_LEDGER` / `ledger`): Each card has exactly two compact, icon-only action buttons: **Delete** (trash) and **Confirm** (check). Delete permanently removes the item. Confirm finalizes it and advances it to Stage 4 while preserving its purchase date and expense data.
4. **Let's Go** (`LETS_GO` / Archive / `abandoned`): Completed-item visibility follows the responsive per-stage limits in Version 1.7.0; completed history remains expandable.

All action controls must remain keyboard accessible through descriptive accessible names and tooltips even though the review and purchase buttons have no visible text labels.

## 3.7 Version 1.6.0 — Real-Time Analytics Linkage

- Confirmed purchase items in both Stage 3 (`EXPENSE_LEDGER`) and Stage 4 (`LETS_GO` / Archive) feed the Home Dashboard and `AnalyticsScreen`.
- Current-month totals use the purchase date and aggregate amounts by category: Needs (`need`), Wants (`want`), and Emergency (`emergency`). Wishlist and To Review items do not count as confirmed spending.
- Dashboard and Analytics totals, category distribution bars, percentages, budget health, and rule-based Piggy insights recalculate when an item is confirmed, deleted, or otherwise changes its confirmed status or category.
- Moving a confirmed item from Purchase to Let's Go preserves its purchase date, amount, and category in analytics. Deleting a confirmed item removes it from the totals and ratios.
## 3.8 Version 1.7.0 — Responsive Stage Card Limits and Internal Scrolling

These responsive display rules apply independently to all four stage cards: Wishlist, To Review, Purchase, and Let's Go.

- **Desktop / large viewport (> 428 CSS pixels):** show at most two items per stage card by default. Show a **See More** toggle when that stage contains more than two items.
- **Mobile viewport (≤ 428 CSS pixels, including 428×928):** show at most one item per stage card by default. Show a **See More** toggle when that stage contains more than one item.
- Selecting **See More** expands only that stage's item list into an internally scrollable container with a maximum height of 320 pixels (`overflow-y: auto`). This keeps additional cards inside their own stage column and preserves the overall pipeline grid.
- Selecting **See Less** collapses only that stage back to its viewport-specific default item limit. Expanded state for one stage does not expand the other stages.
