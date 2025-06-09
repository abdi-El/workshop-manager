import { ReactElement } from "react";
import { useStore } from "../state";

interface PaginatorProps {
    pages: Record<string, ReactElement>
}
export default function Paginator({ pages }: PaginatorProps) {
    const { page } = useStore((state) => state)
    return pages[page] || <div>Page not found</div>;
}