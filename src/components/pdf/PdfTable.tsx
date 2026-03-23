// PDFDocument.js
import {
    StyleSheet,
    Text,
    View
} from '@react-pdf/renderer';
import themes from "./themes.json";


export interface Column {
    header: string;
    accessor: string;
    render?: (value: any) => string | number | JSX.Element;
}

interface Props<T> {
    columns: Column[];
    data: T[];
    title?: string;
    pdfTheme?: string;
}

// Component
export default function PdfTable<T>({ data, columns, title = "Dati", pdfTheme = 'default' }: Props<T>) {
    const themeKey = (pdfTheme in themes ? pdfTheme : 'default') as keyof typeof themes
    const styles = StyleSheet.create(themes[themeKey].table as any)
    return <>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableRow}>
                {
                    columns.map((col) => (
                        <View key={col.accessor as string} style={styles.tableColHeader}>
                            <Text style={styles.tableText}>{col.header}</Text>
                        </View>
                    ))
                }
            </View>
            {
                /* Data Rows */
                data.map((row, index) => (
                    <View key={index} style={styles.tableRow}>
                        {columns.map((col) => (
                            <View key={col.accessor as string} style={styles.tableCol}>
                                <Text style={styles.tableText}>
                                    {col?.render ? col.render((row as any)?.[col.accessor]) : (row as any)?.[col.accessor]}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))
            }
        </View>
    </>
}


