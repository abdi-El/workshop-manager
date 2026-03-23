// PDFDocument.js
import {
    Image,
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
    logoUrl?: string;
}

// Component
export default function PdfTable<T>({ data, columns, title = "Dati", pdfTheme = 'default', logoUrl }: Props<T>) {
    const themeKey = (pdfTheme in themes ? pdfTheme : 'default') as keyof typeof themes
    const styles = StyleSheet.create(themes[themeKey].table as any)
    return <>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {logoUrl && <Image src={logoUrl} style={{ width: 20, height: 20, marginRight: 6, objectFit: 'contain' }} />}
            <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableRow}>
                {
                    columns.map((col) => (
                        <View key={col.accessor as string} style={styles.tableColHeader}>
                            <Text style={[styles.tableText, styles.tableHeaderText]}>{col.header}</Text>
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


