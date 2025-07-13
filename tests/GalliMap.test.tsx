import React from 'react';
import { render } from '@testing-library/react';
import GalliMap from '../src/components/GalliMap';

describe('GalliMap Component', () => {
  beforeEach(() => {
    // Mock GalliMapPlugin for component tests
    Object.defineProperty(window, "GalliMapPlugin", {
      value: jest.fn().mockImplementation((options) => ({
        displayPinMarker: jest.fn(),
        removePinMarker: jest.fn(),
        autoCompleteSearch: jest.fn().mockResolvedValue([]),
        searchData: jest.fn(),
        drawPolygon: jest.fn(),
        removePolygon: jest.fn(),
        options,
      })),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (window as any).GalliMapPlugin;
  });

  it('should render with minimal props', () => {
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

  it('should apply custom style', () => {
    const options = {
      accessToken: 'test-token',
      map: {
        center: [85.3240, 27.7172] as [number, number],
        zoom: 10
      }
    };

    const customStyle = { width: '500px', height: '300px' };
    const { container } = render(
      <GalliMap options={options} style={customStyle} />
    );

    const mapContainer = container.firstChild as HTMLElement;
    expect(mapContainer).toBeTruthy();
  });
});
