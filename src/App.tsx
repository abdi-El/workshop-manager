import Nav from "./components/Nav";
import Paginator from "./components/Paginator";
import Settings from "./pages/Settings";

export default function Page() {
  return <>
    <Nav />
    <Paginator pages={{
      estimates: <div>Estimates Page</div>,
      customers: <div>Customers Page</div>,
      cars: <div>Cars Page</div>,
      settings: <Settings />,
    }} />
  </>;
}

