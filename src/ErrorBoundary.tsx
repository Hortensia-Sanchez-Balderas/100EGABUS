import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fee',
          color: '#c00',
          margin: '20px',
          borderRadius: '4px'
        }}>
          <h2>❌ Error en la aplicación</h2>
          <p>{this.state.error?.message}</p>
          <pre style={{
            backgroundColor: '#eee',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
