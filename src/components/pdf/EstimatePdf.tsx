
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
interface Props {
    estimateId: number;
}

// Create styles
const styles = StyleSheet.create({
    section: {
        display: 'flex',
    },
});

// Create Document Component
export default function EstimatePdf({ estimateId }: Props) {
    return <Document>
        <Page size="A4" >
            <View style={styles.section}>
                <View>
                    <Text>{estimateId}</Text>
                </View>
                <View>
                    <Text>Section #2</Text>
                </View>
            </View>
        </Page>
    </Document>
};
