import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Car, Customer, Estimate, Workshop } from '../../types/database';

export interface DataProps {
    estimate: Estimate,
    car: Car,
    customer: Customer,
    workshop: Workshop,
}

// Create styles
const styles = StyleSheet.create({
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: "85%",
        margin: '0 auto',
    },
});



// Create Document Component
export default function EstimatePdf({ estimate, car, customer, workshop }: DataProps) {


    return <Document>
        <Page size="A4" >
            <View style={styles.header}>
                <View>
                    <Text>{car.id}</Text>
                </View>
                <View>
                    <Text>Section #2</Text>
                </View>
            </View>
        </Page>
    </Document>
};
