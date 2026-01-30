import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
function TestComponent() {
  return <div data-testid="test">Hello Venn</div>;
}

describe('Frontend Health Checks', () => {
  it('should pass basic smoke test', () => {
    expect(true).toBe(true);
  });

  it('should render a simple component', () => {
    render(<TestComponent />);
    const element = screen.getByTestId('test');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello Venn');
  });

  it('should have React Testing Library working', () => {
    const { container } = render(<div>Test</div>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
