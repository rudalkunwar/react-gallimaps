import React from 'react';
import { render } from '@testing-library/react';
import GalliMap from '../src/components/GalliMap';

describe('Integration Tests', () => {
  it('should render without crashing', () => {
    const options = {
      accessToken: 'test-token',
      map: {
        center: [85.3240, 27.7172] as [number, number],
        zoom: 10
      }
    };

    const { container } = render(
      <GalliMap options={options} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
