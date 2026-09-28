import { dayOfYear } from './finance';

export type TipTopic = 'Saving' | 'Debt' | 'Investing' | 'Budgeting' | 'House' | 'Mindset';

export interface Tip {
  topic: TipTopic;
  title: string;
  body: string;
}

export interface Quote {
  text: string;
  author: string;
  source?: string;
}

/** Widely-taught principles from financial planners, advisors and educators. */
export const TIPS: Tip[] = [
  { topic: 'Budgeting', title: 'Try the 50/30/20 rule', body: 'Split take-home pay: 50% needs, 30% wants, 20% savings and extra debt payments. While paying off debt, shrink "wants" and grow the 20%.' },
  { topic: 'Saving', title: 'Pay yourself first', body: 'On payday, move your savings out before you spend anything. Set up an automatic transfer so it happens without willpower.' },
  { topic: 'Saving', title: 'Start with a starter emergency fund', body: 'A small cushion stops every surprise car repair from landing on a credit card. Build it first, then attack debt.' },
  { topic: 'Debt', title: 'Avalanche saves the most money', body: 'Pay minimums on everything, then put all extra money on the debt with the highest interest rate. Mathematically the cheapest way out.' },
  { topic: 'Debt', title: 'Snowball builds momentum', body: 'Pay the smallest balance first. Quick wins keep you motivated; many people stick with it longer because of that.' },
  { topic: 'Debt', title: 'Stop digging the hole', body: 'While paying off cards, stop using them. Remove saved cards from shopping apps and pay with debit or cash.' },
  { topic: 'Debt', title: 'Call and ask for a lower rate', body: 'Card issuers often lower your APR if you ask, especially with an on-time history. A 5-minute call can save hundreds.' },
  { topic: 'Debt', title: 'Look at balance transfers carefully', body: 'A 0% balance transfer can speed payoff, but watch the transfer fee and the date the promo ends. Only do it if you stop adding new charges.' },
  { topic: 'Debt', title: 'Closing a paid-off card', body: 'Once a card is paid off, you can close it to remove temptation. If it has no annual fee and you are building credit history, some people keep the oldest one open but unused.' },
  { topic: 'Debt', title: 'Car loan: pay extra on principal', body: 'Extra payments on a car loan cut interest. Ask the lender to apply extra money to principal, not future payments.' },
  { topic: 'Debt', title: 'Round up your payments', body: 'Paying 310 instead of 287 barely changes your month but can take months off a loan.' },
  { topic: 'Budgeting', title: 'Track every coin for 30 days', body: 'Most people underestimate small spending. One month of honest tracking shows exactly where to cut.' },
  { topic: 'Budgeting', title: 'Audit your subscriptions', body: 'List every subscription. Cancel what you haven\'t used in the last 30 days. You can always re-subscribe later.' },
  { topic: 'Budgeting', title: 'Use the 24-hour rule', body: 'For any non-essential purchase, wait 24 hours (or 30 days for big items). Most urges fade.' },
  { topic: 'Budgeting', title: 'Plan for irregular expenses', body: 'Car service, gifts, annual fees — divide yearly costs by 12 and save that each month so they never surprise you.' },
  { topic: 'Budgeting', title: 'Give every unit of money a job', body: 'Before the month starts, assign your salary to bills, goals, debt and fun. Unassigned money tends to disappear.' },
  { topic: 'Saving', title: 'Save raises and bonuses', body: 'When your income goes up, save at least half the increase. Your lifestyle stays comfortable and your savings leap.' },
  { topic: 'Saving', title: 'Separate accounts, separate jobs', body: 'Keep savings in a different account (ideally a different bank) from your spending money. Out of sight, out of mind.' },
  { topic: 'Saving', title: 'Use a high-yield savings account', body: 'Emergency money should be safe and easy to access — but it can still earn interest. Compare rates once a year.' },
  { topic: 'Saving', title: 'Cook once, eat twice', body: 'Eating out is one of the easiest categories to cut. Batch-cook on weekends and bring lunch to work.' },
  { topic: 'Saving', title: 'Grocery list = savings', body: 'Shop with a list and a full stomach. Unplanned supermarket purchases add up quickly.' },
  { topic: 'Saving', title: 'Sell what you do not use', body: 'Clothes, gadgets, furniture — selling unused items is quick cash for your emergency fund or debt.' },
  { topic: 'Saving', title: 'No-spend days', body: 'Challenge yourself to a few no-spend days each week. Mark them in the app and watch your streak.' },
  { topic: 'Investing', title: 'Take the free money first', body: 'If your employer matches retirement contributions, contribute at least enough to get the full match. It is an instant return.' },
  { topic: 'Investing', title: 'Low-cost index funds', body: 'Broad, low-fee index funds let you own a small piece of many companies. Low fees matter a lot over decades.' },
  { topic: 'Investing', title: 'Time in the market', body: 'Trying to time the market rarely works. Investing regularly over a long period has historically been more reliable.' },
  { topic: 'Investing', title: 'Dollar-cost averaging', body: 'Invest the same amount every month regardless of prices. You buy more when prices are low, and it removes emotion.' },
  { topic: 'Investing', title: 'Only invest money you will not need soon', body: 'Money for the next 1–3 years (like a house deposit) usually belongs in savings, not in the stock market.' },
  { topic: 'Investing', title: 'Diversify', body: 'Do not put everything in one stock, one sector, or one country. Spreading out reduces the damage when one thing falls.' },
  { topic: 'Investing', title: 'Compound growth needs time', body: 'Starting 10 years earlier can matter more than investing twice as much later. Start small, but start.' },
  { topic: 'Investing', title: 'Ignore the daily noise', body: 'Markets go up and down. Check your long-term investments occasionally, not daily — panic selling is the real danger.' },
  { topic: 'Investing', title: 'Beware of "guaranteed" high returns', body: 'If someone promises high returns with no risk, it is almost certainly a scam. Real returns always come with risk.' },
  { topic: 'Investing', title: 'Understand before you buy', body: 'If you cannot explain an investment in two sentences, do not buy it yet. Learn first, or talk to a licensed, fee-only advisor.' },
  { topic: 'House', title: 'Know the real cost of a home', body: 'Besides the down payment, plan for closing costs, fees, insurance, maintenance and furniture.' },
  { topic: 'House', title: 'A bigger deposit = cheaper home', body: 'A larger down payment usually means a smaller loan, lower monthly payments and less total interest.' },
  { topic: 'House', title: 'Keep housing affordable', body: 'A common guideline: keep total housing costs around 25–30% of take-home pay so you can still save and invest.' },
  { topic: 'House', title: 'Clean up credit before a mortgage', body: 'Paying down cards and paying every bill on time improves your credit profile and can get you a better mortgage rate.' },
  { topic: 'House', title: 'Automate your house fund', body: 'Treat the house fund like a bill. A fixed transfer every payday turns a dream into a date.' },
  { topic: 'Mindset', title: 'Progress, not perfection', body: 'A bad spending day does not ruin your plan. Log it honestly and get back on track tomorrow.' },
  { topic: 'Mindset', title: 'Celebrate milestones cheaply', body: 'Paid off a card? Celebrate — with a small, planned treat, not a new debt.' },
  { topic: 'Mindset', title: 'Write your "why"', body: 'Debt freedom, a home for your family, peace of mind. Knowing why you save makes saying "no" easier.' },
  { topic: 'Mindset', title: 'Stop comparing', body: 'Other people\'s lifestyle may be financed by debt. Run your own race.' },
  { topic: 'Mindset', title: 'Increase your income too', body: 'Cutting costs has a floor; earning more does not. Ask for a raise, learn a skill, or start a side hustle — and send the extra to your goals.' },
  { topic: 'Mindset', title: 'Money dates', body: 'Spend 15 minutes each week reviewing your spending and goals. Small check-ins prevent big surprises.' },
  { topic: 'Mindset', title: 'Protect what you build', body: 'Health, life and car insurance, and a simple will, protect your progress from one bad event.' },
];

export const QUOTES: Quote[] = [
  { text: 'A part of all you earn is yours to keep.', author: 'George S. Clason', source: 'The Richest Man in Babylon' },
  { text: 'Wealth, like a tree, grows from a tiny seed.', author: 'George S. Clason', source: 'The Richest Man in Babylon' },
  { text: 'Better a little caution than a great regret.', author: 'George S. Clason', source: 'The Richest Man in Babylon' },
  { text: 'Wealth is what you don\'t see.', author: 'Morgan Housel', source: 'The Psychology of Money' },
  { text: 'Spending money to show people how much money you have is the fastest way to have less money.', author: 'Morgan Housel', source: 'The Psychology of Money' },
  { text: 'Controlling your time is the highest dividend money pays.', author: 'Morgan Housel', source: 'The Psychology of Money' },
  { text: 'The poor and the middle class work for money. The rich have money work for them.', author: 'Robert T. Kiyosaki', source: 'Rich Dad Poor Dad' },
  { text: 'It\'s not how much money you make, but how much money you keep.', author: 'Robert T. Kiyosaki', source: 'Rich Dad Poor Dad' },
  { text: 'If you will live like no one else, later you can live like no one else.', author: 'Dave Ramsey', source: 'The Total Money Makeover' },
  { text: 'The investor\'s chief problem — and even his worst enemy — is likely to be himself.', author: 'Benjamin Graham', source: 'The Intelligent Investor' },
  { text: 'Don\'t look for the needle in the haystack. Just buy the haystack!', author: 'John C. Bogle', source: 'The Little Book of Common Sense Investing' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', source: 'Atomic Habits' },
  { text: 'Every action you take is a vote for the type of person you wish to become.', author: 'James Clear', source: 'Atomic Habits' },
  { text: 'Spend extravagantly on the things you love, and cut costs mercilessly on the things you don\'t.', author: 'Ramit Sethi', source: 'I Will Teach You to Be Rich' },
  { text: 'Spend less than you earn — invest the surplus — avoid debt.', author: 'JL Collins', source: 'The Simple Path to Wealth' },
  { text: 'Small, smart choices + consistency + time = radical difference.', author: 'Darren Hardy', source: 'The Compound Effect' },
  { text: 'Begin with the end in mind.', author: 'Stephen R. Covey', source: 'The 7 Habits of Highly Effective People' },
  { text: 'Beware of little expenses; a small leak will sink a great ship.', author: 'Benjamin Franklin', source: 'Poor Richard\'s Almanack' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'Do not save what is left after spending, but spend what is left after saving.', author: 'Warren Buffett' },
  { text: 'Someone\'s sitting in the shade today because someone planted a tree a long time ago.', author: 'Warren Buffett' },
  { text: 'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.', author: 'Warren Buffett' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'Whatever the mind of man can conceive and believe, it can achieve.', author: 'Napoleon Hill', source: 'Think and Grow Rich' },
  { text: 'The habit of saving is itself an education.', author: 'T. T. Munger' },
  { text: 'It\'s not your salary that makes you rich, it\'s your spending habits.', author: 'Charles A. Jaffe' },
  { text: 'A budget is telling your money where to go instead of wondering where it went.', author: 'Dave Ramsey' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain (attributed)' },
  { text: 'Price is what you pay. Value is what you get.', author: 'Warren Buffett' },
  { text: 'Money is a terrible master but an excellent servant.', author: 'P. T. Barnum' },
];

export function tipOfDay(offset = 0, date = new Date()): Tip {
  const i = (dayOfYear(date) + offset) % TIPS.length;
  return TIPS[(i + TIPS.length) % TIPS.length];
}

export function quoteOfDay(offset = 0, date = new Date()): Quote {
  // Different stride from tips so the pairing changes over time
  const i = (dayOfYear(date) * 7 + offset) % QUOTES.length;
  return QUOTES[(i + QUOTES.length) % QUOTES.length];
}

export const TOP_BOOKS: { title: string; author: string; why: string }[] = [
  { title: 'The Total Money Makeover', author: 'Dave Ramsey', why: 'Step-by-step plan to get out of debt and build an emergency fund.' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', why: 'Why behaviour matters more than intelligence with money.' },
  { title: 'The Richest Man in Babylon', author: 'George S. Clason', why: 'Timeless saving rules told as short parables.' },
  { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', why: 'Automate your finances and spend guilt-free on what you love.' },
  { title: 'The Simple Path to Wealth', author: 'JL Collins', why: 'Plain-English guide to low-cost index investing.' },
  { title: 'The Little Book of Common Sense Investing', author: 'John C. Bogle', why: 'The case for index funds from the founder of Vanguard.' },
  { title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', why: 'Mindset shift from working for money to building assets.' },
  { title: 'Atomic Habits', author: 'James Clear', why: 'Build the small daily habits that make saving automatic.' },
  { title: 'Your Money or Your Life', author: 'Vicki Robin & Joe Dominguez', why: 'See spending as trading your life energy.' },
  { title: 'The Intelligent Investor', author: 'Benjamin Graham', why: 'The classic on disciplined, long-term investing.' },
];
