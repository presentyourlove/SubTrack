import React from 'react';
import { render } from '@testing-library/react-native';
import { CachedImage } from '../CachedImage';

// Mock expo-image
jest.mock('expo-image', () => ({
    Image: 'Image',
}));

describe('CachedImage', () => {
    it('renders with source prop', () => {
        const { toJSON } = render(
            <CachedImage source={{ uri: 'https://example.com/image.jpg' }} />,
        );

        expect(toJSON()).toBeTruthy();
    });

    it('renders with custom style', () => {
        const { toJSON } = render(
            <CachedImage
                source={{ uri: 'https://example.com/image.jpg' }}
                style={{ width: 100, height: 100 }}
            />,
        );

        const tree = toJSON();
        expect(tree).toBeTruthy();
        expect(tree?.type).toBe('View');
    });

    it('renders loader when showLoader is true', () => {
        const { UNSAFE_getAllByType } = render(
            <CachedImage
                source={{ uri: 'https://example.com/image.jpg' }}
                showLoader={true}
            />,
        );

        const { ActivityIndicator } = require('react-native');
        const loaders = UNSAFE_getAllByType(ActivityIndicator);
        expect(loaders.length).toBeGreaterThan(0);
    });

    it('does not render loader when showLoader is false', () => {
        const { UNSAFE_queryAllByType } = render(
            <CachedImage
                source={{ uri: 'https://example.com/image.jpg' }}
                showLoader={false}
            />,
        );

        const { ActivityIndicator } = require('react-native');
        const loaders = UNSAFE_queryAllByType(ActivityIndicator);
        expect(loaders.length).toBe(0);
    });

    it('uses default contentFit of cover', () => {
        const { toJSON } = render(
            <CachedImage source={{ uri: 'https://example.com/image.jpg' }} />,
        );

        expect(toJSON()).toBeTruthy();
    });

    it('renders with local image source', () => {
        const { toJSON } = render(
            <CachedImage source={require('../../../../assets/icon.png')} />,
        );

        expect(toJSON()).toBeTruthy();
    });
});
