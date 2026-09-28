import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { formatMoney, shortDate, type DayPoint } from '../lib/finance';
import { colors } from '../lib/theme';

const HEIGHT = 170;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;
const PAD_LEFT = 4;

/** Rect with rounded top corners, anchored flat on the baseline. */
function barPath(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

function niceMax(v: number) {
  if (v <= 0) return 10;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * exp;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}

/** Daily spending vs. money saved/paid to debt. Tap a day to see its values. */
export function DailyBarChart({ data, currency }: { data: DayPoint[]; currency: string }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);
  const sel = data[Math.min(selected, data.length - 1)];

  const max = niceMax(Math.max(...data.map((d) => Math.max(d.spent, d.saved))));
  const plotW = Math.max(0, width - PAD_LEFT);
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(14, (slot - 4) / 2));
  const y = (v: number) => PAD_TOP + plotH - (v / max) * plotH;
  const labelEvery = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 7;

  return (
    <View>
      <View style={s.legendRow}>
        <LegendDot color={colors.spent} label="Spent" />
        <LegendDot color={colors.saved} label="Saved + debt paid" />
      </View>
      <Text style={s.readout} accessibilityLiveRegion="polite">
        <Text style={s.readoutDate}>{shortDate(sel.date)}  </Text>
        Spent {formatMoney(sel.spent, currency)} · Saved {formatMoney(sel.saved, currency)}
      </Text>
      <View style={{ height: HEIGHT }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {[0.5, 1].map((f) => (
              <Line key={f} x1={PAD_LEFT} x2={width} y1={y(max * f)} y2={y(max * f)} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
            ))}
            <SvgText x={width} y={y(max) - 3} fontSize={10} fill={colors.muted} textAnchor="end">
              {formatMoney(max, currency)}
            </SvgText>
            <Line x1={PAD_LEFT} x2={width} y1={y(0)} y2={y(0)} stroke={colors.border} strokeWidth={1} />
            {data.map((d, i) => {
              const cx = PAD_LEFT + slot * i + slot / 2;
              const isSel = i === selected;
              return (
                <Path
                  key={`sel${d.date}`}
                  d={isSel ? `M${cx - slot / 2 + 1},${PAD_TOP} h${slot - 2} v${plotH} h${-(slot - 2)} Z` : ''}
                  fill={colors.primarySoft}
                />
              );
            })}
            {data.map((d, i) => {
              const cx = PAD_LEFT + slot * i + slot / 2;
              return (
                <Path key={`s${d.date}`} d={barPath(cx - barW - 1, y(d.spent), barW, y(0) - y(d.spent), 3)} fill={colors.spent} />
              );
            })}
            {data.map((d, i) => {
              const cx = PAD_LEFT + slot * i + slot / 2;
              return <Path key={`v${d.date}`} d={barPath(cx + 1, y(d.saved), barW, y(0) - y(d.saved), 3)} fill={colors.saved} />;
            })}
            {data.map((d, i) =>
              (data.length - 1 - i) % labelEvery === 0 ? (
                <SvgText key={`l${d.date}`} x={PAD_LEFT + slot * i + slot / 2} y={HEIGHT - 6} fontSize={10} fill={colors.muted} textAnchor="middle">
                  {shortDate(d.date).split(' ')[0]}
                </SvgText>
              ) : null,
            )}
          </Svg>
        )}
        {/* Touch targets: one full-height column per day, wider than the bars */}
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', paddingLeft: PAD_LEFT }]}>
          {data.map((d, i) => (
            <Pressable
              key={d.date}
              style={{ flex: 1 }}
              onPress={() => setSelected(i)}
              accessibilityLabel={`${shortDate(d.date)}: spent ${formatMoney(d.spent, currency)}, saved ${formatMoney(d.saved, currency)}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/** Running total of money saved + debt paid. Always climbing = you're winning. */
export function ProgressLineChart({ data, currency }: { data: { date: string; value: number }[]; currency: string }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);
  const sel = data[Math.min(selected, data.length - 1)];
  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const lo = minV === maxV ? Math.max(0, minV - 10) : minV;
  const hi = minV === maxV ? maxV + 10 : maxV;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const x = (i: number) => (data.length <= 1 ? width / 2 : 6 + (i / (data.length - 1)) * (width - 12));
  const y = (v: number) => PAD_TOP + plotH - ((v - lo) / (hi - lo)) * plotH;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${y(lo)} L${x(0)},${y(lo)} Z`;

  return (
    <View>
      <Text style={s.readout} accessibilityLiveRegion="polite">
        <Text style={s.readoutDate}>{shortDate(sel.date)}  </Text>
        Total saved + paid off: {formatMoney(sel.value, currency)}
      </Text>
      <View style={{ height: HEIGHT }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            <Line x1={0} x2={width} y1={y(lo)} y2={y(lo)} stroke={colors.border} strokeWidth={1} />
            <Path d={area} fill={colors.saved} fillOpacity={0.12} />
            <Path d={line} stroke={colors.saved} strokeWidth={2} fill="none" strokeLinejoin="round" />
            <Line x1={x(selected)} x2={x(selected)} y1={PAD_TOP} y2={y(lo)} stroke={colors.muted} strokeWidth={1} strokeDasharray="3 3" />
            <Circle cx={x(selected)} cy={y(sel.value)} r={5} fill={colors.saved} stroke={colors.card} strokeWidth={2} />
            <SvgText x={4} y={HEIGHT - 6} fontSize={10} fill={colors.muted}>
              {shortDate(data[0].date)}
            </SvgText>
            <SvgText x={width - 4} y={HEIGHT - 6} fontSize={10} fill={colors.muted} textAnchor="end">
              {shortDate(data[data.length - 1].date)}
            </SvgText>
          </Svg>
        )}
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
          {data.map((d, i) => (
            <Pressable key={d.date} style={{ flex: 1 }} onPress={() => setSelected(i)} accessibilityLabel={`${shortDate(d.date)}: ${formatMoney(d.value, currency)}`} />
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  readout: { fontSize: 13, color: colors.text, marginBottom: 4 },
  readoutDate: { fontWeight: '700' },
});
