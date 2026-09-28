import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuoteCard, TipCard } from '../../components/inspiration';
import { Card, Chip, H1, H2, Muted, Screen } from '../../components/ui';
import { TIPS, TOP_BOOKS, type TipTopic } from '../../lib/inspiration';
import { colors, space } from '../../lib/theme';

const TOPICS: TipTopic[] = ['Saving', 'Debt', 'Investing', 'Budgeting', 'House', 'Mindset'];

export default function Inspire() {
  const [topic, setTopic] = useState<TipTopic>('Debt');

  return (
    <Screen>
      <H1>Get inspired 🔥</H1>
      <QuoteCard />
      <TipCard />

      <Card>
        <H2>Tips library</H2>
        <View style={styles.chips}>
          {TOPICS.map((t) => (
            <Chip key={t} label={t} selected={topic === t} onPress={() => setTopic(t)} />
          ))}
        </View>
        <View style={{ gap: space(3), marginTop: space(3) }}>
          {TIPS.filter((t) => t.topic === topic).map((t) => (
            <View key={t.title} style={styles.tip}>
              <Text style={styles.tipTitle}>{t.title}</Text>
              <Muted>{t.body}</Muted>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <H2>📚 Top-rated money books</H2>
        <View style={{ gap: space(3) }}>
          {TOP_BOOKS.map((b, i) => (
            <View key={b.title} style={styles.book}>
              <Text style={styles.bookNo}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{b.title}</Text>
                <Muted style={{ fontStyle: 'italic' }}>{b.author}</Muted>
                <Muted>{b.why}</Muted>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  tip: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: space(3) },
  tipTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 2 },
  book: { flexDirection: 'row', gap: space(3) },
  bookNo: { fontSize: 20, fontWeight: '800', color: colors.primary, width: 24 },
});
