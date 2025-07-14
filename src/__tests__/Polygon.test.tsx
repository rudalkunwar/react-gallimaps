import React from 'react';
import { render } from '@testing-library/react';
import { GallimapsProvider } from '../context/GallimapsContext';
import Polygon from '../components/Polygon';

describe('Polygon', () => {
    it('renders Polygon without crashing', () => {
        render(
            <GallimapsProvider>
                <Polygon name="test" coordinates={[[27.7172, 85.3240], [27.7180, 85.3250], [27.7190, 85.3230]]} />
            </GallimapsProvider>
        );
        // Polygon is not rendered in DOM, so just ensure no crash
        expect(true).toBe(true);
    });
});
