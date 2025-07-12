# GalliMaps React Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Build library
npm run build
```

## Project Structure

```
src/
├── api/              # API client and HTTP layer
├── components/       # React components
├── context/          # React context providers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── styles/          # CSS styles
└── __tests__/       # Test files
```

## Key Features

### 🔧 Professional Grade Components

- **AutocompleteInput**: Full keyboard navigation, accessibility support
- **SearchInput**: Advanced search functionality
- **MapComponent**: MapLibre GL integration with custom controls

### 🛡️ Robust Error Handling

- Custom error classes with detailed context
- Network retry logic with exponential backoff
- Input validation and sanitization
- Request cancellation support

### ⚡ Performance Optimizations

- Request debouncing and deduplication
- Efficient re-renders with useMemo/useCallback
- Proper cleanup on unmount
- Bundle size optimization (34KB vs 974KB)

### ♿ Accessibility Features

- ARIA attributes for screen readers
- Keyboard navigation support
- High contrast mode support
- Reduced motion preferences

### 🎨 Styling & Theming

- CSS custom properties support
- Dark mode compatibility
- Responsive design patterns
- Professional default styles

### 🧪 Testing

- Comprehensive unit tests
- Component testing with React Testing Library
- Validation utility tests
- Mock API responses

## API Usage Examples

### Basic Setup

```tsx
import { GalliMapsProvider } from "react-gallimaps";

function App() {
  return (
    <GalliMapsProvider accessToken="your-token">
      <YourComponents />
    </GalliMapsProvider>
  );
}
```

### Autocomplete Input

```tsx
import { AutocompleteInput } from "react-gallimaps";

function SearchForm() {
  return (
    <AutocompleteInput
      placeholder="Search locations..."
      onSelect={(result) => {
        console.log("Selected:", result);
      }}
      minLength={3}
      debounceMs={300}
    />
  );
}
```

### Using Hooks

```tsx
import { useAutocomplete, useSearch } from "react-gallimaps";

function CustomComponent() {
  const { data, loading, error, refetch } = useAutocomplete(
    "kathmandu",
    27.7172,
    85.324,
    {
      onSuccess: (results) => console.log("Found:", results),
      onError: (error) => console.error("Error:", error),
    }
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data?.map((result) => (
        <div key={result.id}>{result.name}</div>
      ))}
    </div>
  );
}
```

### Error Handling

```tsx
import { GalliMapsError } from "react-gallimaps";

try {
  await client.autocomplete({ word: "test", lat: 27, lng: 85 });
} catch (error) {
  if (error instanceof GalliMapsError) {
    console.log("Status:", error.status);
    console.log("Code:", error.code);
    console.log("Details:", error.details);
  }
}
```

## Development Workflow

### Adding New Features

1. **Types First**: Define TypeScript types in `src/types/`
2. **API Layer**: Add API methods to `src/api/client.ts`
3. **Hooks**: Create custom hooks in `src/hooks/`
4. **Components**: Build React components in `src/components/`
5. **Tests**: Add comprehensive tests
6. **Documentation**: Update README and examples

### Code Quality

- TypeScript strict mode enabled
- ESLint with React hooks plugin
- Comprehensive error handling
- Input validation and sanitization
- Performance monitoring

### Testing Strategy

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm test -- --coverage
```

### Build & Bundle

```bash
# Clean dist folder
npm run clean

# Build for production
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## Configuration Options

```tsx
<GalliMapsProvider
  accessToken="your-token"
  config={{
    baseUrl: "https://custom-api.com",
    timeout: 15000,
    retries: 5,
  }}
>
  <App />
</GalliMapsProvider>
```

## Performance Tips

1. **Use debouncing** for autocomplete inputs
2. **Implement request cancellation** for better UX
3. **Cache responses** when appropriate
4. **Use proper cleanup** in useEffect hooks
5. **Optimize re-renders** with memo/callback hooks

## Troubleshooting

### Common Issues

**Large bundle size**: Ensure `maplibre-gl` is installed as a peer dependency
**Network errors**: Check API endpoint and access token
**TypeScript errors**: Ensure all types are properly imported
**Performance issues**: Check for memory leaks and unnecessary re-renders

### Debug Mode

```tsx
// Enable debug logging in development
const config = {
  accessToken: "your-token",
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "https://dev-api.com"
      : "https://api.com",
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request

## Security Considerations

- Input sanitization for all user inputs
- Proper error message handling (no sensitive data exposure)
- Rate limiting awareness
- Secure token storage recommendations
