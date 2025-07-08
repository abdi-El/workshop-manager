import DatabasResourceSelect from "./DatabaseResourceSelect";

export default function CustomerSelect() {
    return <DatabasResourceSelect resource="customers" selectLabel="name" name="customer_id" inputLabel="Cliente" />
}