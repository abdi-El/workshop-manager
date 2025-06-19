import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from "antd";
import { ReactElement } from "react";
import { useStore } from "../state";

interface PaginatorProps {
    pages: Record<string, ReactElement>
}
export default function Paginator({ pages }: PaginatorProps) {
    const { page, loading } = useStore((state) => state)

    return <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} >
        {pages[page] || <div>Page not found</div>}
    </Spin>

}