import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { calculateEstimatePrice } from '../../modules/pricing';
import { Car, Customer, Estimate, EstimateItem, Workshop } from '../../types/database';
import PdfTable, { Column } from './PdfTable';

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
        margin: "20 0",
        textAlign: 'center',
        fontWeight: 'bold',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
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
        header: "Prezzo Unitario",
        render: (value) => " € " + value.toFixed(2)
    },
    {
        accessor: "total_price",
        header: "Prezzo Totale Voce",
        render: (value) => " € " + value.toFixed(2)
    },
]


// Create Document Component
export default function EstimatePdf({ estimate, car, customer, workshop, items }: DataProps) {
    let updatedItems = items
    if (estimate.labor_hours && estimate.labor_hourly_cost) {
        updatedItems.push({ "quantity": estimate.labor_hours, "description": "Mano d'opera", "unit_price": estimate.labor_hourly_cost, total_price: estimate.labor_hourly_cost * estimate.labor_hours, estimate_id: estimate.id } as EstimateItem)
    }


    return <Document style={styles.body}>
        <Page size="A4" >
            <View style={styles.titleSection}>
                <Text style={{ fontSize: 16 }}>AUTOFFICINA</Text>
                <Text style={{ fontSize: 20 }}>{workshop.name}</Text>
                <Text style={{ fontSize: 10 }}>{workshop.address} - TEL: {workshop.phone} - IVA: {workshop.vat_number} - EMAIL: {workshop.email} </Text>
            </View>
            <View style={{ padding: 10, marginBottom: 20 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>N°: {estimate.id}</Text>
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
                <PdfTable data={[{ ...car, kms: estimate.car_kms }]} columns={carTableColumns} title='Dati Auto' />
                <PdfTable data={updatedItems} columns={estimateItemsColumns} title='Lavori' />
                <View style={{ marginTop: 20, textAlign: "right" }}>
                    {estimate.discount && <Text>Sconto: € {estimate.discount}</Text>}
                    <Text style={{ marginTop: 10, textAlign: "right", border: "1px solid black", padding: "5px" }}>
                        <Text style={{ fontWeight: "bold" }}>Totale:    </Text>
                        <Text style={{ textDecoration: "underline" }}>
                            € {calculateEstimatePrice(estimate, items)}{estimate.has_iva ? " IVA compresa" : " + IVA"}
                        </Text>
                    </Text>
                </View>
            </View>
        </Page>
    </Document>
};
