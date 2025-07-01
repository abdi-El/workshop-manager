// PDFDocument.js
import {
    StyleSheet,
    Text,
    View
} from '@react-pdf/renderer';

export interface Column {
    header: string;
    accessor: string;
    render?: (value: any) => string | number | JSX.Element;
}

interface Props<T> {
    columns: Column[];
    data: T[];
    title?: string;
}

// Styles
const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColHeader: {
        flex: 1,
        backgroundColor: '#eee',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    tableCol: {
        flex: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    tableText: {
        fontSize: 10,
    },
});

// Component
export default function PdfTable<T>({ data, columns, title = "Dati" }: Props<T>) {
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


