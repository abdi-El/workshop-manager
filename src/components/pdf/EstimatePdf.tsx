import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Car, Customer, Estimate, EstimateItem, Workshop } from '../../types/database';
import TableDocument, { Column } from './PdfTable';

export interface DataProps {
    estimate: Estimate,
    car: Car,
    customer: Customer,
    workshop: Workshop,
    items: EstimateItem[]
}

// Create styles
const styles = StyleSheet.create({
    body: {
        padding: 20,
        fontSize: 12,
    },
    titleSection: {
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        margin: '0 auto',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
});

const carTableColumns: Column[] = [
    {
        accessor: "maker_name",
        header: "Marca"
    },
    {
        accessor: "model_name",
        header: "Modello"
    },
    {
        accessor: "year",
        header: "Anno"
    },
    {
        accessor: "number_plate",
        header: "Targa"
    },
    {
        accessor: "kms",
        header: "Chilometri"
    },
]

const estimateItemsColumns: Column[] = [
    {
        accessor: "description",
        header: "Descrizione"
    },
    {
        accessor: "quantity",
        header: "Quantità"
    },
    {
        accessor: "unit_price",
        header: "Prezzo Unitario"
    },
    {
        accessor: "total_price",
        header: "Prezzo Totale Voce",
        render: (value) => " €" + value.toFixed(2)
    },
]


// Create Document Component
export default function EstimatePdf({ estimate, car, customer, workshop, items }: DataProps) {


    return <Document style={styles.body}>
        <Page size="A4" >
            <View style={styles.titleSection}>
                <Text style={{ fontSize: 16 }}>AUTOFFICINA</Text>
                <Text style={{ fontSize: 20 }}>{workshop.name}</Text>
                <Text style={{ fontSize: 10 }}>TEL: {workshop.phone} - IVA: {workshop.vat_number} - EMAIL: {workshop.email} </Text>
            </View>
            <View style={{ padding: 10, marginBottom: 20, border: "1px solid #000" }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Preventivo: n°{estimate.id}</Text>
                        <Text>Data: {estimate.date}</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Cliente:</Text>
                        <Text>Nome: {customer.name}</Text>
                        <Text>Telefono: {customer.phone}</Text>
                        <Text>Indirizzo: {customer.address}</Text>
                        <Text>Email: {customer.email}</Text>
                    </View>
                </View>
                <TableDocument data={[{ ...car, kms: estimate.car_kms }]} columns={carTableColumns} title='Dati Auto' />
                <TableDocument data={[...items, { "quantity": estimate.labor_hours, "description": "Mano d'opera", "unit_price": estimate.labor_hourly_cost, total_price: estimate.labor_hourly_cost * estimate.labor_hours }]} columns={estimateItemsColumns} title='Voci Preventivo' />
                <Text style={{ marginTop: 20, textAlign: "right" }}>
                    <Text style={{ fontWeight: "bold" }}>Totale Preventivo:</Text>
                    <Text style={{ textDecoration: "underline" }}>
                        € {items.reduce((acc, item) => acc + (item.total_price || 0), 0) + (estimate.labor_hourly_cost * estimate.labor_hours)}{estimate.has_iva ? " IVA compresa" : " + IVA"}
                    </Text>
                </Text>
            </View>
        </Page>
    </Document>
};
