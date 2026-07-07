import { Button, Result } from "antd";
import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Si è verificato un errore"
                    subTitle={this.state.error?.message}
                    extra={<Button type="primary" onClick={() => this.setState({ hasError: false })}>Riprova</Button>}
                />
            );
        }
        return this.props.children;
    }
}
