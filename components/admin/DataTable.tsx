import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';

export interface TableColumn {
  key: string;
  label: string;
  width: number;
}

interface DataTableProps {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  onRowPress?: (row: Record<string, unknown>) => void;
}

export function DataTable({ columns, rows, onRowPress }: DataTableProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <View key={col.key} style={[styles.headerCell, { width: col.width }]}>
                <Text style={styles.headerText}>{col.label}</Text>
              </View>
            ))}
          </View>
          {/* Data Rows */}
          {rows.map((row, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dataRow, idx % 2 === 0 && styles.dataRowAlt]}
              onPress={() => onRowPress?.(row)}
              activeOpacity={onRowPress ? 0.7 : 1}
            >
              {columns.map((col) => (
                <View key={col.key} style={[styles.dataCell, { width: col.width }]}>
                  <Text style={styles.dataText} numberOfLines={1}>
                    {String(row[col.key] ?? '—')}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          ))}
          {rows.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...(Shadows.sm as object),
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: 'center',
  },
  headerText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataRowAlt: {
    backgroundColor: Colors.gray50,
  },
  dataCell: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: 'center',
  },
  dataText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  emptyRow: {
    padding: Spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
