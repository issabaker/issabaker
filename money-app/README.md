# Money Coach 💸

A simple, friendly money app for **Android and iOS** (built with Expo / React Native).
Track your salary, daily spending and savings, pay off credit cards and your car loan,
and save for your house and future — with a daily tip and a motivating book quote.

**Works fully offline.** All data is stored on the phone. No account and no internet needed.

## Features

- **Home dashboard**: "safe to spend today", this month's income / spent / saved / debt paid, a 50/30/20 budget check, a one-tap "log salary" on payday, and a daily logging streak 🔥
- **Daily tracker charts**: spending vs. savings per day (7 / 14 / 30 days) and a 30-day "progress" line of everything saved + debt paid. Tap any day to see its numbers.
- **Quick add**: Spent · Income · Save · Pay debt, with 24 everyday categories (rent, groceries, fuel, coffee, subscriptions…)
- **Debt freedom**: add credit cards, car loan and other loans, pick **Avalanche** (highest interest first) or **Snowball** (smallest balance first), set a monthly amount, and see your **debt-free date**, interest cost, and which debt to focus on. Paid-off cards get a "close this card" celebration 🎉
- **Goals & future**: emergency fund, house down payment, investing, retirement (one-tap quick start). A 7-step **money roadmap** that ticks itself off from your data, plus investing basics.
- **Inspire**: daily professional tip + quote from top-rated money books, a tips library by topic, and a top-10 money books list.
- **History**: month-by-month list, category breakdown, filters, delete entries.
- **Backup**: export all data as text (share to notes/email/drive) and paste it back to restore on a new phone.

## Run it on your phone (development)

```bash
cd money-app
npm install
npx expo start
```

Install **Expo Go** from the App Store / Google Play and scan the QR code.

## Build installable apps (App Store / Google Play)

Uses [EAS Build](https://docs.expo.dev/build/introduction/) — no Mac or Android Studio required:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android   # .aab for Google Play (or --profile preview for an .apk)
npx eas-cli@latest build --platform ios       # needs an Apple Developer account
```

App identifiers are set in `app.json` (`com.issabaker.moneycoach`) — change them before publishing if you like.

## Project layout

```
src/app/            screens (Expo Router)
  (tabs)/           Home, History, Debts, Goals, Inspire
  add.tsx           add entry
  debt-edit.tsx     add/edit a debt
  goal-edit.tsx     add/edit a goal
  settings.tsx      profile, backup/restore, erase
  welcome.tsx       first-launch setup
src/lib/            data store (AsyncStorage), finance math, categories, tips & quotes
src/components/     UI kit and charts (react-native-svg)
```

Checks: `npm run typecheck`

> Tips and investing notes are general education, not personal financial advice.
