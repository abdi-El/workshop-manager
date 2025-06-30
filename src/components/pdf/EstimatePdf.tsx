
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
interface Props {
    estimateId: number;
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
});

// Create Document Component
export default function EstimatePdf({ estimateId }: Props) {
    return <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text>{estimateId}</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
            </View>
        </Page>
    </Document>
};
