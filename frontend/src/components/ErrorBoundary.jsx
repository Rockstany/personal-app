import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '100px auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#FF6B35', marginBottom: '20px' }}>Oops! Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            We're sorry for the inconvenience. The application encountered an unexpected error.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              textAlign: 'left',
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                Error Details
              </summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                color: '#d32f2f'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 30px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Reload Page
          </button>

          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.href = '/';
            }}
            style={{
              padding: '12px 30px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
