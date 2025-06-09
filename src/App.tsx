import Nav from "./components/Nav";
import Paginator from "./components/Paginator";

export default function Page() {
  return <>
    <Nav />
    <Paginator pages={{
      estimates: <div>Estimates Page</div>,
      customers: <div>Customers Page</div>,
      cars: <div>Cars Page</div>,
      settings: <div>Settings Page</div>,
    }} />
  </>;
}

