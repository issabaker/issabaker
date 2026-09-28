import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { quoteOfDay, tipOfDay } from '../lib/inspiration';
import { colors, space } from '../lib/theme';
import { Card } from './ui';

export function QuoteCard() {
  const [offset, setOffset] = useState(0);
  const q = quoteOfDay(offset);
  return (
    <Card style={{ backgroundColor: colors.goldSoft }}>
      <View style={styles.row}>
        <Text style={styles.kicker}>✨ Quote of the day</Text>
        <Pressable onPress={() => setOffset((o) => o + 1)} hitSlop={10} accessibilityLabel="Another quote">
          <Ionicons name="refresh" size={18} color={colors.warning} />
        </Pressable>
      </View>
      <Text style={styles.quote}>“{q.text}”</Text>
      <Text style={styles.author}>
        — {q.author}
        {q.source ? <Text style={styles.source}>, {q.source}</Text> : null}
      </Text>
    </Card>
  );
}

export function TipCard() {
  const [offset, setOffset] = useState(0);
  const t = tipOfDay(offset);
  return (
    <Card>
      <View style={styles.row}>
        <Text style={[styles.kicker, { color: colors.primary }]}>💡 Pro tip · {t.topic}</Text>
        <Pressable onPress={() => setOffset((o) => o + 1)} hitSlop={10} accessibilityLabel="Another tip">
          <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={styles.tipTitle}>{t.title}</Text>
      <Text style={styles.tipBody}>{t.body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space(2) },
  kicker: { fontSize: 13, fontWeight: '800', color: colors.warning, textTransform: 'uppercase', letterSpacing: 0.5 },
  quote: { fontSize: 18, lineHeight: 26, color: colors.text, fontWeight: '600', fontStyle: 'italic' },
  author: { marginTop: space(2), fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  source: { fontWeight: '400', fontStyle: 'italic' },
  tipTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 4 },
  tipBody: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
