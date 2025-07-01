import { Document, Page, Text, View } from '@react-pdf/renderer';

export default function MissingDataPdf() {
    return <Document>
        <Page size="A4" >
            <View>
                <Text>Non é stato possibile trovare i dati</Text>
            </View>
        </Page>
    </Document>
};
