import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

interface CachedImageProps extends ImageProps {
  showLoader?: boolean;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQipWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const CachedImage: React.FC<CachedImageProps> = ({
  style,
  source,
  placeholder = blurhash,
  contentFit = 'cover',
  transition = 300,
  showLoader = false,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        style={StyleSheet.absoluteFill}
        source={source}
        placeholder={placeholder}
        contentFit={contentFit}
        transition={transition}
        cachePolicy="disk"
        {...props}
      />
      {showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
