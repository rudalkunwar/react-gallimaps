import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutocompleteInput } from '../AutocompleteInput';
import { GalliMapsProvider } from '../../context/GalliMapsContext';

// Mock the useAutocomplete hook
jest.mock('../../hooks/useAutocomplete', () => ({
    useAutocomplete: jest.fn(() => ({
        data: [],
        loading: false,
        error: null,
    })),
}));

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <GalliMapsProvider accessToken="test-token">
        {children}
    </GalliMapsProvider>
);

describe('AutocompleteInput', () => {
    beforeEach(() => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) =>
            success({
                coords: {
                    latitude: 27.7172,
                    longitude: 85.3240,
                },
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders input field with placeholder', () => {
        render(
            <TestWrapper>
                <AutocompleteInput placeholder="Search locations..." />
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'kathmandu' } });

        expect(input).toHaveValue('kathmandu');
    });

    it('shows clear button when input has value', () => {
        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', () => {
        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'test' } });

        const clearButton = screen.getByLabelText('Clear input');
        fireEvent.click(clearButton);

        expect(input).toHaveValue('');
    });

    it('handles keyboard navigation', () => {
        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');

        // Test Escape key
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(input).not.toHaveFocus();
    });

    it('calls onSelect when an option is selected', () => {
        const mockOnSelect = jest.fn();

        // Mock useAutocomplete to return test data
        const { useAutocomplete } = require('../../hooks/useAutocomplete');
        useAutocomplete.mockReturnValue({
            data: [
                {
                    id: '1',
                    name: 'Kathmandu',
                    district: 'Kathmandu',
                    province: 'Bagmati',
                    distance: '0 km',
                },
            ],
            loading: false,
            error: null,
        });

        render(
            <TestWrapper>
                <AutocompleteInput onSelect={mockOnSelect} />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'kath' } });

        // Wait for dropdown to appear and click on option
        waitFor(() => {
            const option = screen.getByText('Kathmandu');
            fireEvent.click(option);
            expect(mockOnSelect).toHaveBeenCalledWith({
                id: '1',
                name: 'Kathmandu',
                district: 'Kathmandu',
                province: 'Bagmati',
                distance: '0 km',
            });
        });
    });

    it('shows error message when there is an error', () => {
        const { useAutocomplete } = require('../../hooks/useAutocomplete');
        useAutocomplete.mockReturnValue({
            data: null,
            loading: false,
            error: 'Network error',
        });

        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('shows loading indicator when loading', () => {
        const { useAutocomplete } = require('../../hooks/useAutocomplete');
        useAutocomplete.mockReturnValue({
            data: null,
            loading: true,
            error: null,
        });

        render(
            <TestWrapper>
                <AutocompleteInput />
            </TestWrapper>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('disables input when disabled prop is true', () => {
        render(
            <TestWrapper>
                <AutocompleteInput disabled />
            </TestWrapper>
        );

        const input = screen.getByRole('combobox');
        expect(input).toBeDisabled();
    });
});
